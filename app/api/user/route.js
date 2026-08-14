import { NextResponse } from "next/server";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function db(){
  if(!getApps().length){
    if(process.env.FIREBASE_SERVICE_ACCOUNT){
      /* Vercel or any non-Google host: JSON service account in env var */
      initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
    }else{
      /* Firebase App Hosting / Cloud Run: automatic credentials, zero config */
      initializeApp({credential:applicationDefault()});
    }
  }
  return getFirestore();
}

export async function POST(req){
  try{
    const body=await req.json();
    const{action}=body;
    const fs=db();
    const users=fs.collection("users");
    if(action==="save"){
      const{name,ig,birth,chart,reading,answers,chatHistory,birthchartAnalysis}=body;
      const key=(ig||name||"anon").toLowerCase().replace(/[@\s]+/g,"-").replace(/[^a-z0-9-]/g,"");
      const ref=users.doc(key);
      const snap=await ref.get();
      const existing=snap.exists?snap.data():{};
      await ref.set({...existing,name,ig:ig||null,birth:birth||existing.birth||null,chart,answers,reading:reading||existing.reading||null,birthchartAnalysis:birthchartAnalysis||existing.birthchartAnalysis||null,chatHistory:chatHistory||existing.chatHistory||[],updatedAt:new Date().toISOString(),createdAt:existing.createdAt||new Date().toISOString()},{merge:true});
      return NextResponse.json({success:true,key});
    }
    if(action==="list"){
      if(body.mk!=="fateh0505")return NextResponse.json({error:"unauthorized"},{status:401});
      const snap=await users.orderBy("updatedAt","desc").limit(200).get();
      const out=[];snap.forEach(d=>out.push({id:d.id,...d.data()}));
      return NextResponse.json({users:out,count:out.length});
    }
    if(action==="get"){
      const snap=await users.doc(body.key).get();
      return snap.exists?NextResponse.json(snap.data()):NextResponse.json({error:"not found"},{status:404});
    }
    if(action==="saveFriends"){
      const{key,friends}=body;
      if(!key)return NextResponse.json({error:"no key"},{status:400});
      const ref=db.collection("users").doc(key);
      const doc=await ref.get();
      const existing=doc.exists?doc.data():{};
      await ref.set({...existing,friends:friends||[]},{merge:true});
      return NextResponse.json({ok:true});
    }
    if(action==="saveChat"){
      const ref=users.doc(body.key);
      const snap=await ref.get();
      if(!snap.exists)return NextResponse.json({error:"user not found"},{status:404});
      await ref.set({chatHistory:body.chatHistory,updatedAt:new Date().toISOString()},{merge:true});
      return NextResponse.json({success:true});
    }
    return NextResponse.json({error:"unknown action"},{status:400});
  }catch(e){console.error("User API error:",e);return NextResponse.json({error:e.message},{status:500});}
}

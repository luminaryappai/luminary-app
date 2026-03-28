import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

async function getUser(key){
  try{const{blobs}=await list({prefix:`users/${key}`,limit:1});if(!blobs.length)return null;const res=await fetch(blobs[0].url);return await res.json();}catch{return null;}
}
async function saveUser(key,data){
  return await put(`users/${key}.json`,JSON.stringify(data),{access:"public",contentType:"application/json",addRandomSuffix:false,allowOverwrite:true});
}

export async function POST(req){
  try{
    const body=await req.json();
    const{action}=body;
    if(action==="save"){
      const{name,ig,chart,reading,answers,chatHistory,birthchartAnalysis}=body;
      const key=ig||name?.toLowerCase().replace(/\s+/g,"-")||"anon";
      const existing=await getUser(key);
      const userData={...existing,name,ig,chart,answers,reading:reading||existing?.reading,birthchartAnalysis:birthchartAnalysis||existing?.birthchartAnalysis,chatHistory:chatHistory||existing?.chatHistory||[],updatedAt:new Date().toISOString(),createdAt:existing?.createdAt||new Date().toISOString()};
      await saveUser(key,userData);
      return NextResponse.json({success:true,key});
    }
    if(action==="list"){
      if(body.mk!=="fateh0505")return NextResponse.json({error:"unauthorized"},{status:401});
      const{blobs}=await list({prefix:"users/",limit:100});
      const users=[];for(const blob of blobs){try{const r=await fetch(blob.url);users.push(await r.json());}catch{}}
      return NextResponse.json({users,count:users.length});
    }
    if(action==="get"){
      const user=await getUser(body.key);
      return user?NextResponse.json(user):NextResponse.json({error:"not found"},{status:404});
    }
    if(action==="saveChat"){
      const{key,chatHistory}=body;
      const existing=await getUser(key);
      if(existing){existing.chatHistory=chatHistory;existing.updatedAt=new Date().toISOString();await saveUser(key,existing);return NextResponse.json({success:true});}
      return NextResponse.json({error:"user not found"},{status:404});
    }
    return NextResponse.json({error:"unknown action"},{status:400});
  }catch(e){console.error("User API:",e);return NextResponse.json({error:e.message},{status:500});}
}

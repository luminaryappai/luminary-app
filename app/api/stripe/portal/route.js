import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";

if(getApps().length===0)initializeApp({credential:applicationDefault()});
const db=getFirestore();

export async function POST(req){
  try{
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
    const{ukey}=await req.json();
    const doc=await db.collection("users").doc(ukey).get();
    if(!doc.exists||!doc.data().stripeCustomerId)return NextResponse.json({error:"No subscription found"},{status:404});
    const origin=req.headers.get("origin")||"https://luminaryapp.ai";
    const session=await stripe.billingPortal.sessions.create({
      customer:doc.data().stripeCustomerId,
      return_url:origin,
    });
    return NextResponse.json({url:session.url});
  }catch(e){
    console.error("Portal error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

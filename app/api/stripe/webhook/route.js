import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";

if(getApps().length===0)initializeApp({credential:applicationDefault()});
const db=getFirestore();

export async function POST(req){
  try{
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
    const raw=await req.text();
    const sig=req.headers.get("stripe-signature");
    let event;
    try{
      event=stripe.webhooks.constructEvent(raw,sig,process.env.STRIPE_WEBHOOK_SECRET);
    }catch(e){
      console.error("Webhook signature failed:",e.message);
      return NextResponse.json({error:"Bad signature"},{status:400});
    }

    if(event.type==="checkout.session.completed"){
      const s=event.data.object;
      const ukey=s.client_reference_id||(s.metadata&&s.metadata.ukey);
      const plan=(s.metadata&&s.metadata.plan)||"";
      if(ukey){
        const ref=db.collection("users").doc(ukey);
        const doc=await ref.get();
        const ex=doc.exists?doc.data():{};
        if(plan==="deepreport"){
          await ref.set({...ex,deepReportCredits:(ex.deepReportCredits||0)+1,stripeCustomerId:s.customer||ex.stripeCustomerId||null},{merge:true});
        }else{
          await ref.set({...ex,plan:"plus",planName:plan,planStatus:"active",stripeCustomerId:s.customer||null,planSince:Date.now()},{merge:true});
        }
      }
    }

    if(event.type==="customer.subscription.updated"||event.type==="customer.subscription.deleted"){
      const sub=event.data.object;
      const active=sub.status==="active"||sub.status==="trialing";
      const snap=await db.collection("users").where("stripeCustomerId","==",sub.customer).limit(1).get();
      if(!snap.empty){
        const ref=snap.docs[0].ref;
        await ref.set({plan:active?"plus":"free",planStatus:sub.status},{merge:true});
      }
    }

    return NextResponse.json({received:true});
  }catch(e){
    console.error("Webhook error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

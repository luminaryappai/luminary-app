import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req){
  try{
    if(!process.env.STRIPE_SECRET_KEY)return NextResponse.json({error:"Payments not configured yet"},{status:500});
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
    const{ukey,plan}=await req.json();
    if(!ukey)return NextResponse.json({error:"No user"},{status:400});
    const PRICES={
      founding:process.env.STRIPE_PRICE_FOUNDING,
      monthly:process.env.STRIPE_PRICE_MONTHLY,
      annual:process.env.STRIPE_PRICE_ANNUAL,
      deepreport:process.env.STRIPE_PRICE_REPORT,
    };
    const price=PRICES[plan];
    if(!price)return NextResponse.json({error:"Unknown plan: "+plan},{status:400});
    const origin=req.headers.get("origin")||"https://luminaryapp.ai";
    const session=await stripe.checkout.sessions.create({
      mode:plan==="deepreport"?"payment":"subscription",
      line_items:[{price,quantity:1}],
      client_reference_id:ukey,
      metadata:{ukey,plan},
      allow_promotion_codes:true,
      success_url:origin+"/?purchase=success&plan="+plan,
      cancel_url:origin+"/?purchase=cancelled",
    });
    return NextResponse.json({url:session.url});
  }catch(e){
    console.error("Checkout error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

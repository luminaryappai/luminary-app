import { NextResponse } from "next/server";

export async function POST(req){
  try{
    const {messages,userName}=await req.json();
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:500,
        system:`You are Luminary AI, a warm and wise astrologer. You have ${userName}'s complete natal chart loaded. Be empathetic, specific, grounded. Under 120 words. Reference specific placements. Always end with a question or offer. No jargon without translation.`,
        messages,
      }),
    });
    const data=await response.json();
    return NextResponse.json({reply:data.content?.[0]?.text||"The stars are quiet. Try again?"});
  }catch(e){return NextResponse.json({reply:"Connection lost. Try again?"});}
}

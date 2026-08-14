import { NextResponse } from "next/server";

const MODELS=["claude-sonnet-4-5","claude-sonnet-4-20250514","claude-3-5-sonnet-20241022"];

export async function POST(req){
  try{
    const{messages,userName}=await req.json();
    if(!process.env.ANTHROPIC_API_KEY)return NextResponse.json({reply:"Server is missing its API key. Tell Mat."});
    let lastErr="";
    for(const model of MODELS){
      try{
        const r=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
          body:JSON.stringify({model,max_tokens:600,
            system:"You are Luminary AI, a warm and wise astrologer. You have "+userName+"'s complete natal chart and Human Design loaded. Empathetic, specific, grounded. Under 120 words. Reference specific placements. End with a question or offer. No jargon without translation.",
            messages}),
        });
        const raw=await r.text();
        if(!r.ok){lastErr="API "+r.status;continue;}
        const data=JSON.parse(raw);
        if(data.error){lastErr=data.error.message||"error";continue;}
        const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
        if(text)return NextResponse.json({reply:text});
      }catch(e){lastErr=e.message;}
    }
    console.error("Chat error:",lastErr);
    return NextResponse.json({reply:"The stars are quiet right now. Try again in a moment."});
  }catch(e){
    console.error("Chat error:",e);
    return NextResponse.json({reply:"Connection lost. Try again?"});
  }
}

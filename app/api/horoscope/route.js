import { NextResponse } from "next/server";

const MODELS=["claude-sonnet-4-5","claude-sonnet-4-20250514","claude-3-5-sonnet-20241022"];

function extractJSON(text){
  if(!text||!text.trim())throw new Error("Empty response from AI");
  let t=text.replace(/```json/gi,"").replace(/```/g,"").trim();
  const s=t.indexOf("{");
  if(s===-1)throw new Error("No JSON in AI response: "+t.slice(0,200));
  t=t.slice(s);
  try{return JSON.parse(t);}catch(e){
    // Truncated: close open braces/brackets
    let depth=0,inStr=false,esc=false,lastGood=-1;
    for(let i=0;i<t.length;i++){
      const c=t[i];
      if(esc){esc=false;continue;}
      if(c==="\\"){esc=true;continue;}
      if(c==='"'){inStr=!inStr;continue;}
      if(inStr)continue;
      if(c==="{"||c==="[")depth++;
      else if(c==="}"||c==="]"){depth--;if(depth===0)lastGood=i;}
    }
    if(lastGood>0){try{return JSON.parse(t.slice(0,lastGood+1));}catch{}}
    throw new Error("AI returned malformed JSON (likely truncated)");
  }
}

async function callClaude(payload){
  if(!process.env.ANTHROPIC_API_KEY)throw new Error("ANTHROPIC_API_KEY is not set on the server");
  let lastErr=null;
  for(const model of MODELS){
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({...payload,model}),
      });
      const raw=await r.text();
      if(!r.ok){lastErr=new Error("Anthropic API "+r.status+": "+raw.slice(0,300));continue;}
      let data;try{data=JSON.parse(raw);}catch{throw new Error("Anthropic returned non-JSON: "+raw.slice(0,200));}
      if(data.error)throw new Error("Anthropic error: "+(data.error.message||JSON.stringify(data.error)));
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if(!text)throw new Error("Anthropic returned no text content");
      return text;
    }catch(e){lastErr=e;}
  }
  throw lastErr||new Error("All model attempts failed");
}

export async function POST(req){
  try{
    const{chartText,name,focus,energy,seeking,plan}=await req.json();
    const isPlus=plan==="plus";
    const text=await callClaude({
      max_tokens:isPlus?5500:4000,
      messages:[{role:"user",content:`You are Luminary, a warm and insightful AI astrologer. You speak like a wise friend who understands the stars deeply. Empathetic, specific, grounded. No jargon without translation. No degree symbols. Lead with feelings, then explain astrologically.

Chart data for ${name}: ${chartText}
Life focus: ${focus}. Energy: ${energy}. Seeking: ${seeking}.

Return ONLY raw JSON, no markdown, no preamble. Keep every "body" under ${isPlus?70:45} words so the JSON completes:${isPlus?`
PLUS TIER: additionally include in EVERY weekly and monthly card a "window" field — the specific best day(s) or date range this week to act on this energy, with a one-line action ("Thursday PM: send the email"). Also add a 5th weekly card {"area":"The Window","planet":"✦","title":"...","body":"the single most important timing window of the week and exactly what to do in it","window":"...","intensity":n}.`:""}
{
 "weekly":[
  {"area":"This Week's Energy","planet":"♄","title":"short title","body":"insight","intensity":8},
  {"area":"Love & Connection","planet":"♀","title":"title","body":"insight","intensity":7},
  {"area":"Career & Purpose","planet":"☉","title":"title","body":"insight","intensity":6},
  {"area":"Inner World","planet":"☽","title":"title","body":"insight","intensity":5}
 ],
 "monthly":[
  {"area":"The Big Picture","planet":"♃","title":"title","body":"insight","intensity":7},
  {"area":"Growth Edge","planet":"♄","title":"title","body":"insight","intensity":6},
  {"area":"Hidden Gift","planet":"♆","title":"title","body":"insight","intensity":5}
 ],
 "transits":[
  {"transit":"Transit X aspect natal Y","orb":"2°","meaning":"what it means","peak":"date","intensity":8}
 ],
 "bigThreeTexts":["Sun portrait","Moon portrait","Rising portrait"],
 "line":"one screenshot-worthy sentence",
 "mantra":"personal mantra"
}
Include 4 transits. Every insight must reference THEIR specific placements.`}],
    });
    return NextResponse.json(extractJSON(text));
  }catch(e){
    console.error("Horoscope error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

import { NextResponse } from "next/server";

const MODELS=["claude-sonnet-4-5","claude-sonnet-4-20250514","claude-3-5-sonnet-20241022"];

function extractJSON(text){
  if(!text||!text.trim())throw new Error("Empty response from AI");
  let t=text.replace(/```json/gi,"").replace(/```/g,"").trim();
  const s=t.indexOf("{");
  if(s===-1)throw new Error("No JSON in AI response");
  t=t.slice(s);
  try{return JSON.parse(t);}catch(e){
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
      const data=JSON.parse(raw);
      if(data.error)throw new Error("Anthropic error: "+(data.error.message||""));
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if(!text)throw new Error("Anthropic returned no text content");
      return text;
    }catch(e){lastErr=e;}
  }
  throw lastErr||new Error("All model attempts failed");
}

export async function POST(req){
  try{
    const{chartText,name}=await req.json();
    const text=await callClaude({
      max_tokens:4000,
      messages:[{role:"user",content:`You are Luminary's master reader. Your register: lead with CONCRETE PREDICTED EVENTS, DATES, and JOY; mechanics live underneath, never on top. Confidence tiers: tight-orb and angle-based statements stated confidently with timeframes; sign-level material stated as weather. Never lead with planet jargon — the event comes first, the astrology explains it after. Direct, specific, zero fluff, warmly certain.

Chart for ${name}: ${chartText}

Return ONLY raw JSON, no markdown, no preamble. Keep each field under 70 words so the JSON completes:
{
 "headline":"the single most important concrete prediction with a timeframe",
 "bigThree":"what their LIFE looks like because of this combination — patterns, recurring events, what people say about them",
 "chapters":[
  {"title":"chapter name","body":"what is happening now in this domain and what happens next, with dated windows"},
  {"title":"chapter 2","body":"same"},
  {"title":"chapter 3","body":"same"}
 ],
 "humanDesign":{"type":"their HD type from the chart data","opener":"their Type/Strategy/Authority as LIVED EXPERIENCE — what their best and worst decisions have in common","decisionRule":"one sentence instruction"},
 "strengths":["concrete life pattern","pattern 2","pattern 3"],
 "shadowWork":"the one pattern that costs them most, with the window it activates",
 "soulMantra":"short ancestral mantra"
}
Use the actual Human Design values given. Every prediction traces to THEIR placements.`}],
    });
    return NextResponse.json(extractJSON(text));
  }catch(e){
    console.error("Birthchart error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

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
      max_tokens:6500,
      messages:[{role:"user",content:`You are Luminary's master reader. Register: lead with CONCRETE PREDICTED EVENTS, DATES, and JOY; mechanics underneath, never on top. Confidence tiers: tight-orb/angle statements confident with timeframes; sign-level stated as weather. The event comes first, the astrology explains it after. Direct, specific, warmly certain.

Chart for ${name}: ${chartText}

Return ONLY raw JSON, no markdown. Field word limits are strict so the JSON completes:
{
 "headline":"the single most important concrete prediction with a timeframe (under 40 words)",
 "bigThree":"what their LIFE looks like because of this Sun+Moon+Rising — patterns, recurring events, what people say about them (under 80 words)",
 "planets":[
  {"planet":"Sun","placement":"sign from data","meaning":"what this placement DOES in their life — concrete patterns, then the mechanics (under 55 words)"},
  {"planet":"Moon","placement":"sign","meaning":"same"},
  {"planet":"Mercury","placement":"sign","meaning":"same"},
  {"planet":"Venus","placement":"sign","meaning":"same"},
  {"planet":"Mars","placement":"sign","meaning":"same"},
  {"planet":"Jupiter","placement":"sign","meaning":"same"},
  {"planet":"Saturn","placement":"sign","meaning":"same"},
  {"planet":"Uranus","placement":"sign","meaning":"same"},
  {"planet":"Neptune","placement":"sign","meaning":"same"},
  {"planet":"Pluto","placement":"sign","meaning":"same"}
 ],
 "chapters":[
  {"title":"chapter name","body":"what is happening now in this life domain and what happens next, dated windows (under 60 words)"},
  {"title":"chapter 2","body":"same"},
  {"title":"chapter 3","body":"same"}
 ],
 "strengths":["concrete life pattern","pattern 2","pattern 3"],
 "shadowWork":"the one pattern that costs them most + the window it activates (under 50 words)",
 "soulMantra":"short ancestral mantra",
 "humanDesign":{
  "type":"their HD type from the chart data",
  "opener":"their Type as LIVED EXPERIENCE — what their best and worst decisions have in common, how energy moves through their day (under 80 words)",
  "strategyInPractice":"their Strategy applied to real situations — work, love, money (under 60 words)",
  "authorityGuide":"how to actually use their Authority when deciding (under 50 words)",
  "notSelfSignal":"how their Not-Self theme shows up and what it signals (under 40 words)",
  "decisionRule":"one sentence instruction"
 }
}
Use the actual Human Design values and actual signs given in the chart data. Every statement traces to THEIR placements.`}],
    });
    return NextResponse.json(extractJSON(text));
  }catch(e){
    console.error("Birthchart error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

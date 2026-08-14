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
      if(!r.ok){lastErr=new Error("Anthropic API "+r.status);continue;}
      const data=JSON.parse(raw);
      if(data.error)throw new Error(data.error.message||"API error");
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if(!text)throw new Error("No text content");
      return text;
    }catch(e){lastErr=e;}
  }
  throw lastErr||new Error("All model attempts failed");
}

/* Real synastry: inter-chart aspects between two natal planet sets */
const ASPECTS=[
  {name:"conjunct",angle:0,orb:6},
  {name:"sextile",angle:60,orb:3},
  {name:"square",angle:90,orb:5},
  {name:"trine",angle:120,orb:5},
  {name:"opposite",angle:180,orb:5},
];
function synastry(aP,bP,aName,bName){
  const out=[];
  const personals=["Sun","Moon","Mercury","Venus","Mars"];
  for(const p1 of Object.keys(aP)){
    for(const p2 of Object.keys(bP)){
      if(!personals.includes(p1)&&!personals.includes(p2))continue;
      let diff=Math.abs(aP[p1].deg-bP[p2].deg)%360;
      if(diff>180)diff=360-diff;
      for(const a of ASPECTS){
        const orb=Math.abs(diff-a.angle);
        if(orb<=a.orb)out.push({text:aName+"'s "+p1+" "+a.name+" "+bName+"'s "+p2,orb:Math.round(orb*10)/10,aspect:a.name});
      }
    }
  }
  return out.sort((x,y)=>x.orb-y.orb).slice(0,12);
}

export async function POST(req){
  try{
    const{userName,friendName,userPrompt,friendPrompt,userNatal,friendNatal,mode}=await req.json();
    const aspects=(userNatal&&friendNatal)?synastry(userNatal,friendNatal,userName,friendName):[];
    const aspectText=aspects.length?aspects.map(a=>a.text+" (orb "+a.orb+"°)").join("; "):"birth times limit aspect precision";
    const modeText=mode==="romantic"?"ROMANTIC compatibility — chemistry, attraction, emotional safety, long-term potential":mode==="friendship"?"FRIENDSHIP compatibility — loyalty, fun, communication, how they support each other":"a standalone birth chart portrait of "+friendName+" (no compatibility)";
    const text=await callClaude({
      max_tokens:5000,
      messages:[{role:"user",content:`You are Luminary's master reader. Concrete life patterns first, mechanics underneath. Warm, specific, honest about frictions — never fabricate numeric scores; speak in real astrological observations only.

PERSON A (${userName}): ${userPrompt}
PERSON B (${friendName}): ${friendPrompt}
COMPUTED SYNASTRY ASPECTS (real, calculated): ${aspectText}
MODE: ${modeText}

Return ONLY raw JSON, word limits strict:
{
 "friendSnapshot":{
  "headline":"the single most striking thing about ${friendName}'s chart (under 35 words)",
  "portrait":"who ${friendName} is — patterns, what people notice, their engine (under 70 words)"
 },
 "compatibility":${mode==="chart"?"null":`{
  "overview":"the honest read on this pairing — lead with the dynamic people would observe (under 70 words)",
  "strengths":["concrete strength of this pairing","strength 2","strength 3"],
  "frictions":["honest friction point","friction 2"],
  "advice":"one concrete way to make this connection thrive (under 40 words)",
  "keyAspects":[{"aspect":"pick the 3 most defining computed aspects","meaning":"what each one actually does between them (under 30 words)"},{"aspect":"...","meaning":"..."},{"aspect":"...","meaning":"..."}]
 }`}
}
Reference the COMPUTED aspects only — never invent aspects not listed.`}],
    });
    return NextResponse.json({...extractJSON(text),computedAspects:aspects});
  }catch(e){
    console.error("Compatibility error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

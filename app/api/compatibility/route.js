import { NextResponse } from "next/server";
import { ashtakoota, lifePath, numerologyCompat, composite, chemistryAxes } from "./engines.js";

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
    const{userName,friendName,userPrompt,friendPrompt,userNatal,friendNatal,mode,userBirthDate,friendBirthDate}=await req.json();
    const aspects=(userNatal&&friendNatal)?synastry(userNatal,friendNatal,userName,friendName):[];
    const aspectText=aspects.length?aspects.map(a=>a.text+" (orb "+a.orb+"\u00b0)").join("; "):"limited by missing birth times";

    /* Computed engines — documented systems, no invented dials */
    let vedic=null,numbers=null,bond=null,chem=null;
    if(mode!=="chart"){
      if(userNatal&&friendNatal&&userNatal.Moon&&friendNatal.Moon&&userBirthDate&&friendBirthDate){
        vedic=ashtakoota(userNatal.Moon.deg,friendNatal.Moon.deg,parseInt(userBirthDate.slice(0,4)),parseInt(friendBirthDate.slice(0,4)));
      }
      if(userBirthDate&&friendBirthDate){
        numbers=numerologyCompat(lifePath(userBirthDate),lifePath(friendBirthDate));
      }
      if(userNatal&&friendNatal)bond=composite(userNatal,friendNatal);
      chem=chemistryAxes(aspects);
    }

    const modeText=mode==="romantic"?"ROMANTIC compatibility":mode==="friendship"?"FRIENDSHIP compatibility":"standalone birth chart portrait of "+friendName;
    const computedBlock=mode==="chart"?"":`
COMPUTED ENGINES (real calculations — reference these, never invent):
- SYNASTRY ASPECTS: ${aspectText}
- CHEMISTRY AXES (from aspect weights): ${chem?Object.entries(chem).map(([k,v])=>k+" "+v.score+"/10").join(", "):"n/a"}
- VEDIC ASHTAKOOTA (Lahiri): ${vedic?vedic.total+"/36 ("+vedic.verdict+") — Moons: "+vedic.moonA.nakshatra+"/"+vedic.moonA.rashi+" + "+vedic.moonB.nakshatra+"/"+vedic.moonB.rashi+"; kootas: "+vedic.kootas.map(k=>k.name+" "+k.score+"/"+k.max).join(", "):"needs both birth dates"}
- NUMEROLOGY: ${numbers?"Life Paths "+numbers.lifePathA+" + "+numbers.lifePathB+" — "+numbers.harmony+(numbers.note?" — "+numbers.note:""):"n/a"}
- COMPOSITE (midpoint Bond chart): ${bond?Object.entries(bond).map(([p,sg])=>p+" in "+sg).join(", "):"n/a"}`;

    const text=await callClaude({
      max_tokens:7500,
      messages:[{role:"user",content:`You are Luminary's master reader — trained in Western synastry, Vedic Ashtakoota, composite technique, and numerology. Concrete patterns first, mechanics underneath. Honest about frictions. Never fabricate scores — every number you cite must come from the computed engines below.

PERSON A (${userName}): ${userPrompt}
PERSON B (${friendName}): ${friendPrompt}
MODE: ${modeText}${computedBlock}

Return ONLY raw JSON, word limits strict:
{
 "friendSnapshot":{
  "headline":"most striking thing about ${friendName}'s chart (under 35 words)",
  "portrait":"who ${friendName} is — patterns, engine, what people notice (under 70 words)"
 },
 "compatibility":${mode==="chart"?"null":`{
  "overview":"the honest read on this pairing as lived experience — what a fly on the wall sees when they're together (under 110 words)",
  "youTwo":"how they actually interact day-to-day — conversation style, conflict style, who leads what, the roles they fall into (under 100 words)",
  "destiny":"the karmic read: what these two are here to teach each other and where this goes if they let it (under 80 words)",
  "chemistryNarrative":"what the chemistry axes mean IN LIFE — the pull, the spark, where it shows up physically and emotionally; name the strongest and weakest axis (under 90 words)",
  "vedicNarrative":"what the Ashtakoota result means — name the strongest koota and any 0-score koota honestly, what each means for them specifically (under 90 words)",
  "numbersNarrative":"what their life path pairing means practically (under 40 words)",
  "bondNarrative":"the composite chart: what this relationship IS as its own living entity, from the Bond placements (under 80 words)",
  "strengths":["concrete strength","strength 2","strength 3","strength 4"],
  "frictions":["honest friction","friction 2","friction 3"],
  "advice":"concrete guidance to make this thrive — what to do and what to avoid (under 60 words)"
 }`}
}`}],
    });
    return NextResponse.json({...extractJSON(text),computed:{aspects,vedic,numbers,bond,chemistry:chem}});
  }catch(e){
    console.error("Compatibility error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

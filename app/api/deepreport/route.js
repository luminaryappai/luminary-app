import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";

if(getApps().length===0)initializeApp({credential:applicationDefault()});
const db=getFirestore();

const MODELS=["claude-sonnet-4-5","claude-sonnet-4-20250514","claude-3-5-sonnet-20241022"];

function extractJSON(text){
  if(!text||!text.trim())throw new Error("Empty response");
  let t=text.replace(/```json/gi,"").replace(/```/g,"").trim();
  const s=t.indexOf("{");if(s===-1)throw new Error("No JSON");t=t.slice(s);
  try{return JSON.parse(t);}catch(e){
    let d=0,i2=false,esc=false,lg=-1;
    for(let i=0;i<t.length;i++){const c=t[i];
      if(esc){esc=false;continue;}if(c==="\\"){esc=true;continue;}
      if(c==='"'){i2=!i2;continue;}if(i2)continue;
      if(c==="{"||c==="[")d++;else if(c==="}"||c==="]"){d--;if(d===0)lg=i;}}
    if(lg>0){try{return JSON.parse(t.slice(0,lg+1));}catch{}}
    throw new Error("Malformed JSON");
  }
}

async function callClaude(payload){
  if(!process.env.ANTHROPIC_API_KEY)throw new Error("ANTHROPIC_API_KEY not set");
  let lastErr=null;
  for(const model of MODELS){
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({...payload,model}),
      });
      const raw=await r.text();
      if(!r.ok){lastErr=new Error("API "+r.status);continue;}
      const data=JSON.parse(raw);
      if(data.error)throw new Error(data.error.message||"error");
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if(text)return text;
    }catch(e){lastErr=e;}
  }
  throw lastErr||new Error("All models failed");
}

export async function POST(req){
  try{
    const{ukey,friendIndex}=await req.json();
    if(!ukey)return NextResponse.json({error:"No user"},{status:400});
    const ref=db.collection("users").doc(ukey);
    const doc=await ref.get();
    if(!doc.exists)return NextResponse.json({error:"User not found"},{status:404});
    const u=doc.data();
    const friends=u.friends||[];
    const f=friends[friendIndex];
    if(!f)return NextResponse.json({error:"Friend not found"},{status:404});
    if(f.deepReport)return NextResponse.json({report:f.deepReport,already:true});
    if(!(u.deepReportCredits>0))return NextResponse.json({needsPurchase:true});

    const comp=f.result||{};
    const computedSummary=JSON.stringify({
      aspects:(comp.computed&&comp.computed.aspects||[]).map(a=>a.text+" ("+a.orb+"°)"),
      vedic:comp.computed&&comp.computed.vedic?{total:comp.computed.vedic.total,verdict:comp.computed.vedic.verdict,kootas:comp.computed.vedic.kootas.map(k=>k.name+" "+k.score+"/"+k.max)}:null,
      chemistry:comp.computed&&comp.computed.chemistry||null,
      numbers:comp.computed&&comp.computed.numbers||null,
      bond:comp.computed&&comp.computed.bond||null,
    });

    const text=await callClaude({
      max_tokens:8000,
      messages:[{role:"user",content:`You are Luminary's master reader producing a PREMIUM deep relationship report between ${u.name} and ${f.name} (${f.mode==="romantic"?"romantic":"friendship"} lens). This is a paid keepsake document — rich, specific, honest, warmly certain. Concrete lived patterns first, mechanics underneath. Every score you cite must come from the computed data.

COMPUTED DATA (real): ${computedSummary}
CHARTS: ${u.name}: ${u.chart&&u.chart.promptText||""} | ${f.name}: Sun ${f.sun}, Moon ${f.moon}, Rising ${f.rising}

Return ONLY raw JSON. Sections generous but each under its limit:
{
 "title":"evocative title for this pairing",
 "sections":[
  {"h":"The Pull","body":"why these two find each other — the magnetic mechanics as lived experience (under 130 words)"},
  {"h":"You Two, In a Room","body":"observable dynamics: conversation, conflict, laughter, silence, who initiates, who anchors (under 130 words)"},
  {"h":"The Chemistry, Decoded","body":"walk the chemistry axes by name with what each means physically and emotionally for THIS pair (under 140 words)"},
  {"h":"The Vedic Verdict","body":"Ashtakoota walked honestly — strongest koota, any zero, what the total means for longevity (under 130 words)"},
  {"h":"The Bond Itself","body":"the composite chart as its own being — what this relationship wants (under 110 words)"},
  {"h":"Where It Strains","body":"the honest frictions and the exact conditions that trigger them (under 120 words)"},
  {"h":"Timing","body":"when this connection runs hot and cold across the year ahead — name months/windows (under 110 words)"},
  {"h":"The Counsel","body":"direct guidance: what to do, what to never do, one practice (under 120 words)"}
 ],
 "closingLine":"one unforgettable sentence about these two"
}`}],
    });
    const report=extractJSON(text);
    friends[friendIndex]={...f,deepReport:report,deepReportTs:Date.now()};
    await ref.set({friends,deepReportCredits:u.deepReportCredits-1},{merge:true});
    return NextResponse.json({report});
  }catch(e){
    console.error("Deep report error:",e);
    return NextResponse.json({error:e.message},{status:500});
  }
}

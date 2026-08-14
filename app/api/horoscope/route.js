import { NextResponse } from "next/server";

export async function POST(req){
  try{
    const{chartText,name,focus,energy,seeking}=await req.json();
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:3000,
        messages:[{role:"user",content:`You are Luminary, a warm and insightful AI astrologer. You speak like a wise friend who understands the stars deeply. Empathetic, specific, grounded. No jargon without translation. No degree symbols. Lead with feelings, then explain astrologically.

Chart data for ${name}: ${chartText}
Life focus: ${focus}. Energy: ${energy}. Seeking: ${seeking}.

Generate a COMPLETE personalized reading. Return ONLY raw JSON (no markdown, no backticks):
{
  "weekly": [
    {"area": "This Week's Energy", "planet": "♄", "title": "short evocative title", "body": "2-3 sentences deeply personal insight tied to their specific transits.", "intensity": 8},
    {"area": "Love & Connection", "planet": "♀", "title": "title", "body": "insight", "intensity": 7},
    {"area": "Career & Purpose", "planet": "☉", "title": "title", "body": "insight", "intensity": 6},
    {"area": "Inner World", "planet": "☽", "title": "title", "body": "insight", "intensity": 5}
  ],
  "monthly": [
    {"area": "The Big Picture", "planet": "♃", "title": "title", "body": "2-3 sentences on the month ahead", "intensity": 7},
    {"area": "Growth Edge", "planet": "♄", "title": "title", "body": "insight", "intensity": 6},
    {"area": "Hidden Gift", "planet": "♆", "title": "title", "body": "insight", "intensity": 5}
  ],
  "transits": [
    {"transit": "Transit Planet aspect Natal Planet", "orb": "X°", "meaning": "What this means for them personally", "peak": "approximate peak date", "intensity": 8},
    {"transit": "next", "orb": "X°", "meaning": "meaning", "peak": "date", "intensity": 6}
  ],
  "bigThreeTexts": ["2-3 sentence italic-worthy portrait of their Sun placement","same for Moon","same for Rising"],
  "line": "One powerful sentence — their most important insight. The thing they screenshot and share.",
  "mantra": "A personal mantra for this week based on their element and current transits."
}

CRITICAL: Every insight references THEIR specific placements and transits. The transits array should have 4-6 entries with real intensity scores. The "line" should stop someone mid-scroll.`}],
      }),
    });
    const data=await response.json();
    let text=data.content?.[0]?.text||"";
    text=text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
    return NextResponse.json(JSON.parse(text));
  }catch(e){console.error("Horoscope error:",e);return NextResponse.json({error:e.message},{status:500});}
}

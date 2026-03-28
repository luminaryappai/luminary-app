import { NextResponse } from "next/server";

export async function POST(req){
  try{
    const {chartText,name}=await req.json();
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:`You are Luminary. Write a deep birth chart personality analysis for ${name}. Speak like you're sitting across from them in candlelight.

Chart: ${chartText}

Return ONLY raw JSON:
{
  "bigThree": "One paragraph weaving Sun, Moon, Rising into a cohesive identity portrait",
  "element": "Their dominant element and what it means",
  "strengths": ["strength 1","strength 2","strength 3"],
  "challenges": ["challenge 1","challenge 2"],
  "loveStyle": "How they love based on Venus and Moon",
  "careerGifts": "Their professional gifts based on Midheaven and Saturn",
  "currentChapter": "What chapter of life they're in based on major transits",
  "soulMantra": "A mantra that captures their soul's assignment"
}

Every placement mentioned must be followed by what it FEELS like. No jargon. If birth time is unknown, skip Rising/house references.`}],
      }),
    });
    const data=await response.json();
    let text=data.content?.[0]?.text||"";
    text=text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
    return NextResponse.json(JSON.parse(text));
  }catch(e){console.error("Birthchart error:",e);return NextResponse.json({error:e.message},{status:500});}
}

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { chartText, name, focus, energy, seeking } = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: `You are Luminary, a warm and insightful AI astrologer. You speak like a wise friend who happens to understand the stars deeply. You are empathetic, specific, and grounded. No jargon without translation. No degree symbols. Lead with what the person FEELS, then explain why astrologically.

Chart data for ${name}: ${chartText}
Life focus: ${focus}. Energy: ${energy}. Seeking: ${seeking}.

Generate a personalized reading. Return ONLY raw JSON (no markdown, no backticks):
{
  "cards": [
    {"area": "This Week's Energy", "planet": "♄", "title": "short evocative title", "body": "2-3 sentences of deeply personal insight tied to their specific transits and natal placements. Name specific days when possible."},
    {"area": "Love & Connection", "planet": "♀", "title": "title", "body": "insight"},
    {"area": "Career & Purpose", "planet": "☉", "title": "title", "body": "insight"},
    {"area": "Inner World", "planet": "☽", "title": "title", "body": "insight"}
  ],
  "line": "One powerful sentence — their most important insight this week. This is what they screenshot and share.",
  "mantra": "A personal mantra for this week based on their element and current transits."
}

CRITICAL: Every insight must reference THEIR specific natal placements and current transits. Not generic sun sign content. This person's chart is unique — treat it that way. The "line" should be the kind of sentence that makes someone stop and screenshot it.` }],
      }),
    });

    const data = await response.json();
    let text = data.content?.[0]?.text || "";
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Horoscope error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

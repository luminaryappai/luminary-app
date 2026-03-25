import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { chartText, name, sunSign, moonSign, risingSign, unknownTime } = body;

    if (!chartText) {
      return Response.json({ error: "No chart data" }, { status: 400 });
    }

    const risingNote = unknownTime
      ? "\nIMPORTANT: Birth time is UNKNOWN. Do NOT reference Rising sign, Ascendant, houses, or Midheaven. Moon sign may be approximate."
      : "";

    const prompt = `You are an elite astrologer giving ${name} a private birth chart reading. Write like you're sitting across from them.${risingNote}

NATAL CHART: ${chartText}

Output ONLY raw JSON:
{
  "bigThree": "2-3 sentences about their Sun (${sunSign}), Moon (${moonSign})${unknownTime ? "" : `, Rising (${risingSign})`} combination. What this creates as a personality. What it FEELS like to be them.",
  "element": "1-2 sentences about their elemental balance and what it means for daily life.",
  "strengths": ["<strength 1 — 2 sentences>", "<strength 2>", "<strength 3>"],
  "challenges": ["<challenge 1 — 2 sentences>", "<challenge 2>"],
  "loveStyle": "3-4 sentences about how they love based on Venus, Mars, Moon. Specific.",
  "careerGifts": "2-3 sentences about natural career talents from Mercury, Saturn, Midheaven${unknownTime ? ' (skip Midheaven)' : ''}.",
  "currentChapter": "2-3 sentences about what this moment in their life is about based on current transits.",
  "soulMantra": "One powerful sentence. Must feel written ONLY for this chart."
}

Every placement you mention must be immediately followed by what it FEELS like. No jargon without translation. Make them feel deeply seen. OUTPUT ONLY RAW JSON.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return Response.json({ error: "No JSON in birth chart response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));

    console.log(JSON.stringify({
      event: "birthchart",
      name: name || "unknown",
      sun: sunSign,
      timestamp: new Date().toISOString(),
    }));

    return Response.json(parsed);
  } catch (error) {
    console.error("Birth chart API error:", error);
    return Response.json({ error: error.message || "Birth chart analysis failed" }, { status: 500 });
  }
}

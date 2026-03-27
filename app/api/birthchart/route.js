/* /api/birthchart/route.js — Deep Birth Chart Analysis */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { chartText, name, unknownTime } = await req.json();

    const systemPrompt = `You are Luminary, giving ${name} a deep, intimate birth chart reading. This is the most personal part of the experience — make them feel profoundly understood.

Write 4-6 paragraphs covering:
1. Their Sun/Moon/Rising combination — what makes them uniquely THEM
2. Their Venus and Mars — how they love and what drives them
3. Their Jupiter and Saturn — where fortune and challenge live
4. Any standout patterns (stelliums, T-squares, grand trines if visible)
5. Their life path theme — the big picture

${unknownTime ? "NOTE: Birth time is unknown, so the Ascendant/Rising sign may not be accurate. Focus on planetary placements and aspects rather than house positions." : ""}

VOICE: Warm, specific, revelatory. Like a gifted astrologer in a private session. No jargon without translation. Use "you" language throughout. Make them feel SEEN.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: `Birth chart: ${chartText}` }],
    });

    const analysis = response.content[0].text;
    console.log(JSON.stringify({ event: "BIRTHCHART_GENERATED", name, timestamp: new Date().toISOString() }));
    return Response.json({ analysis });
  } catch (error) {
    console.error("Birth chart error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

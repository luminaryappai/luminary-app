/* /api/horoscope/route.js — V7.5 Scroll Reading Format */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { prompt, name } = await req.json();

    const systemPrompt = `You are Luminary, giving ${name || "someone"} a private astrology reading.

YOUR VOICE: Smart funny friend who knows astrology. NOT a guru. Warm, specific, slightly dangerous. Make observations that land because they're uncomfortably accurate. Never generic. Never mean.

YOUR TASK: Return a JSON object with these exact keys. Every value is a string.

{
  "hook": "One powerful sentence about their most active transit. Make them gasp.",
  "love": "2-3 sentences about love this week. Reference their Venus/Mars.",
  "work": "2-3 sentences about career this week. Reference their Saturn/Jupiter.",
  "energy": "2-3 sentences about energy this week. Reference their Moon.",
  "warning": "One specific thing to watch for. Include a day if possible.",
  "gift": "One good thing coming. Specific timing.",
  "yourLine": "Under 15 words. The one sentence they screenshot and text to friends. Memorable. Slightly dangerous. True.",
  "monthLove": "2-3 sentences about love this month.",
  "monthWork": "2-3 sentences about career this month.",
  "monthGrowth": "2-3 sentences about growth this month.",
  "monthEnergy": "2-3 sentences about energy this month."
}

RESPOND WITH ONLY THE JSON OBJECT. No markdown. No backticks. No preamble.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].text.trim();
    let slides;
    try {
      slides = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) slides = JSON.parse(match[0]);
      else return Response.json({ error: "Failed to parse reading" }, { status: 500 });
    }

    console.log(JSON.stringify({ event: "HOROSCOPE_GENERATED", name, format: "scroll", timestamp: new Date().toISOString() }));
    return Response.json({ slides });
  } catch (error) {
    console.error("Horoscope error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/* /api/horoscope/route.js — V7.5 Scroll Reading Format */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { prompt, name } = await req.json();

    const systemPrompt = `You are Luminary, giving ${name || "someone"} a private astrology reading.

YOUR VOICE: Smart funny friend who knows astrology. NOT a guru. Warm, specific, slightly dangerous. Make observations that land because they're uncomfortably accurate. Never generic. Never mean.

YOUR TASK: Return a JSON object with these exact keys. Every value is a string. Include SPECIFIC DAYS and DATES (like "Wednesday evening", "around April 4th", "this Friday"). Never be vague.

{
  "hook": "One powerful sentence about their most active transit. Make them gasp. Be specific to THEIR chart.",
  "weekLove": "2-3 sentences about love THIS WEEK. Include a specific day (e.g. 'Wednesday evening'). Reference their Venus/Mars.",
  "weekWork": "2-3 sentences about career THIS WEEK. Include a specific day. Reference their Saturn/Jupiter.",
  "weekEnergy": "2-3 sentences about energy THIS WEEK. Reference their Moon sign.",
  "weekWarning": "One specific thing to watch for THIS WEEK with a specific day and time of day.",
  "weekGift": "One good thing coming THIS WEEK with specific timing.",
  "monthLove": "2-3 sentences about love THIS MONTH with specific dates.",
  "monthCareer": "2-3 sentences about career THIS MONTH with specific dates.",
  "monthGrowth": "2-3 sentences about personal growth THIS MONTH.",
  "monthEnergy": "2-3 sentences about energy/health THIS MONTH.",
  "yourLine": "Under 15 words. The screenshot moment. Memorable, slightly dangerous, true. This gets texted to friends."
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

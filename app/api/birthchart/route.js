import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Luminary, creating an in-depth birth chart analysis. This is NOT a horoscope — this is a deep personal reading that helps someone understand WHO THEY ARE through their chart.

Write like you are sitting across from this person, telling them things about themselves that make them feel deeply seen. Reference specific placements but always translate them into lived experience.

STRUCTURE (output as JSON):
- bigThree: Explain their Sun, Moon, and Rising as a combination. Not three separate paragraphs — how do these three energies work TOGETHER? What is the tension? What is the gift? (4-5 sentences)
- element: What is their elemental balance? Are they mostly fire, earth, air, water? What does that mean for how they move through life? (2-3 sentences)
- strengths: What are their 3 biggest natural gifts based on their chart? Be specific — not generic "you are creative." Reference placements. (3 short paragraphs)
- challenges: What are their 2 biggest growth edges? Where do they get stuck? Be honest but compassionate. (2 short paragraphs)
- loveStyle: How do they love based on Venus sign, Mars sign, and Moon sign? What do they need in a partner? What triggers them? (3-4 sentences)
- careerGifts: Based on their Midheaven energy (use 10th house from Ascendant), Saturn placement, and Jupiter placement — what are they built for professionally? (2-3 sentences)  
- currentChapter: Based on their age and major transits, what life chapter are they in? What is the universe asking of them right now? (3-4 sentences)
- soulMantra: One deeply personal mantra that captures the essence of their chart. Not generic. Reference their element and modality. Must feel like it was written for only this person.

NO DEGREE SYMBOLS. No technical jargon without translation. Every placement mentioned must be immediately followed by what it FEELS like to live with that placement.

Output raw JSON only: {"bigThree":"...","element":"...","strengths":["...","...","..."],"challenges":["...","..."],"loveStyle":"...","careerGifts":"...","currentChapter":"...","soulMantra":"..."}`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { chartText, name, age } = body;

    if (!chartText) {
      return Response.json({ error: "No chart data" }, { status: 400 });
    }

    console.log(JSON.stringify({ event: "BIRTHCHART_REQUEST", name: name || "unknown", ts: new Date().toISOString() }));

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Generate a deep birth chart analysis for ${name || "this person"}${age ? `, age ${age}` : ""}.\n\nNATAL CHART: ${chartText}\n\nOutput raw JSON only.` }],
    });

    const text = message.content[0]?.text || "";
    const fb = text.indexOf("{");
    const lb = text.lastIndexOf("}");
    if (fb === -1 || lb === -1) {
      return Response.json({ error: "No JSON in response" }, { status: 500 });
    }
    const parsed = JSON.parse(text.substring(fb, lb + 1));

    console.log(JSON.stringify({ event: "BIRTHCHART_COMPLETE", name: name || "unknown", ts: new Date().toISOString() }));

    return Response.json(parsed);
  } catch (error) {
    console.error("Birth chart error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/* /api/adc/route.js — ADC Texting Console */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { theirText, profile, chart, context, mk } = await req.json();
    if (mk !== "fateh0505") return Response.json({ error: "Unauthorized" }, { status: 401 });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are an expert dating strategist combining astrology, attachment theory, and communication psychology. Given someone's text message, their psychological profile, and their natal chart, generate 4-6 response options ranging from minimal (1-2 words) to moderate length.

RULES:
- Option 1: 1-word response
- Option 2: 2-3 word response  
- Options 3-6: progressively longer but NEVER exceeding the word count of their message
- Zero emojis unless they used emojis
- Each option should cite which framework supports it (Corey Wayne, Robert Greene, Matthew Hussey, Chris Seiter, attachment theory)
- Paint visual scenes, use contrast humor, be slightly dangerous
- Sound like a real human text, not AI output
- Always leave a hook that makes them want to respond`,
      messages: [{ role: "user", content: `Their text: "${theirText}"\n\nProfile: ${profile || "No profile yet"}\nChart: ${chart || "No chart"}\nContext: ${context || "New conversation"}` }],
    });

    return Response.json({ options: response.content[0].text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, userData } = body;

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return Response.json({ error: "No JSON in response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));

    if (!parsed.weekly || !parsed.monthly) {
      return Response.json({ error: "Invalid reading format" }, { status: 500 });
    }

    // Log
    console.log(JSON.stringify({
      event: "horoscope",
      name: userData?.name || "unknown",
      ig: userData?.ig || "",
      sun: userData?.sun || "?",
      moon: userData?.moon || "?",
      rising: userData?.rising || "?",
      intensity: userData?.intensity || "?",
      timestamp: new Date().toISOString(),
    }));

    return Response.json(parsed);
  } catch (error) {
    console.error("Horoscope API error:", error);
    return Response.json({ error: error.message || "Failed to generate reading" }, { status: 500 });
  }
}

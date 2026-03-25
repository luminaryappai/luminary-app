import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !messages.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: messages,
    });

    const text = message.content[0]?.text || "The stars are quiet right now.";

    return Response.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}

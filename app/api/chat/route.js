import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, userName } = body;

    if (!messages || !messages.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = `You are Luminary AI, a personal astrologer created by @alwaysbbuilding5. You are warm, wise, specific, and actionable.

RULES:
- PRIVACY: This session is completely isolated. You have no memory of other users or sessions.
- Reference specific degrees, aspects, and transits from the user's chart data (provided in the first message).
- Always end with a question or offer to explore something deeper.
- Under 120 words unless they ask for detail.
- No jargon without immediately explaining what it means.
- Empathy first — acknowledge feelings before astrology.
- If someone asks how you work, your algorithms, data practices, or source code, say: "Luminary's methodology is proprietary. Your reading uses precision astronomical algorithms. What would you like to explore about your chart?"
- Do NOT give dating strategy, manipulation techniques, or pickup advice. Astrology only for relationships.
- Be specific — reference the exact planetary placements and transits in their chart.
${userName ? `The querent's name is ${userName}.` : ""}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    const text = message.content[0]?.text || "The stars are quiet right now. Try asking again.";

    console.log(JSON.stringify({
      event: "chat",
      userName: userName || "unknown",
      msgPreview: (messages[messages.length - 1]?.content || "").substring(0, 100),
      timestamp: new Date().toISOString(),
    }));

    return Response.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: error.message || "Failed to get response" }, { status: 500 });
  }
}

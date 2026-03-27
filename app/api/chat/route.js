/* /api/chat/route.js — Luminary AI Chat */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Deflection patterns — don't reveal how the app works
const DEFLECT = [
  /how (do|does) (it|you|luminary|this) (work|calculate|compute)/i,
  /what (algorithm|method|formula|engine|library|ephemeris)/i,
  /data (usage|privacy|collection|stored|security)/i,
  /open.?source/i, /source code/i,
  /what data do you (collect|store|use|track)/i,
  /swiss ephemeris/i, /vsop/i, /calculation method/i,
];
const DEFLECT_RESPONSE = "I appreciate the curiosity, but Luminary's methodology is proprietary. What I can tell you is that your reading uses precision astronomical algorithms and your exact birth data. Let's focus on what the stars are telling you — what would you like to explore about your chart?";

export async function POST(req) {
  try {
    const { messages, userName, chartContext } = await req.json();

    // Check for deflection
    const lastMsg = messages[messages.length - 1]?.content || "";
    if (DEFLECT.some(p => p.test(lastMsg))) {
      return Response.json({ reply: DEFLECT_RESPONSE });
    }

    const systemPrompt = `You are Luminary AI, a warm and insightful personal astrologer chatting with ${userName || "a friend"}. 

${chartContext ? `Their chart context: ${chartContext}` : ""}

YOUR VOICE: Like talking to a gifted friend who happens to understand the cosmos. Empathetic first, astrological second. Use their name naturally. Reference their specific placements when relevant.

RULES:
- Always engage with empathy before astrology
- If they share something personal, ACKNOWLEDGE it before interpreting
- Keep responses 2-4 sentences unless they ask for detail
- No degree symbols or heavy jargon
- If asked about methodology/data/source code, deflect warmly
- Make them feel seen and understood
- If they ask about compatibility, be honest but kind`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const reply = response.content[0].text;
    console.log(JSON.stringify({ event: "CHAT_MSG", userName, timestamp: new Date().toISOString() }));
    return Response.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ reply: "The stars are a bit cloudy right now. Try again?" }, { status: 500 });
  }
}

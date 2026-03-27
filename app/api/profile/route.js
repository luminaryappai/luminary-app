/* /api/profile/route.js — Psychological Profile */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { chart, chatHistory, answers, name, mk } = await req.json();
    if (mk !== "fateh0505") return Response.json({ error: "Unauthorized" }, { status: 401 });

    const chatSummary = (chatHistory || []).slice(-20).map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are an expert in astrological psychology. Given a person's natal chart, their psychographic answers, and their chat history with an AI astrologer, build a psychological profile. Include:

1. MBTI estimate (with confidence level)
2. Enneagram type estimate
3. Attachment style (secure/anxious/avoidant/fearful-avoidant)
4. Big Five traits (rate each 1-10)
5. Communication style (how they prefer to give/receive info)
6. Emotional triggers and soothing patterns
7. Dating blueprint (what attracts them, courtship preferences, deal breakers)
8. Mental health markers (only if clearly indicated by chart + behavior)

Be specific and actionable. This is for private strategic use.`,
      messages: [{ role: "user", content: `Name: ${name}\nChart: ${chart}\nAnswers: ${JSON.stringify(answers)}\nChat history:\n${chatSummary}` }],
    });

    return Response.json({ profile: response.content[0].text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

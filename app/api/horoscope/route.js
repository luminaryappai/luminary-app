import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a gifted astrologer creating personalized horoscope slides. Your voice is warm, direct, and insightful — like a wise friend who sees patterns others miss.

WRITING RULES:
1. Lead with what MATTERS most. The aspects are sorted by tightness — the first ones listed are the MOST powerful. If Venus is conjunct their natal Venus or Sun, that is a Venus return or activation — LEAD WITH THAT. If Uranus is on their Jupiter, lead with sudden expansion. These rare transits are the HEADLINE.
2. Write like you are talking directly to THIS person. Use "you" constantly. Reference their Moon sign emotional needs and Rising sign energy naturally.
3. NO DEGREE SYMBOLS OR TECHNICAL JARGON. Say "Venus is lighting up your sense of self this week" not "Transit Venus conjunct natal Sun at 14 degrees Taurus." Translate every transit into what they FEEL.
4. MANTRAS must feel written for ONE person. Reference their element and modality viscerally. A Fixed Earth mantra is about roots, patience, and embodied power. A Mutable Fire mantra is about trust, movement, and sacred restlessness. Make it land in their body.
5. Each slide body: 3-4 sentences that feel like a personal letter, not a generic forecast. Name specific days when energy shifts.
6. Monthly forecasts should paint the emotional arc of the month — the story, not a list.
7. Seasonal forecasts give the BIG PICTURE — where they are in their larger life chapter.
8. If there is a once-in-a-year transit (Venus return, Sun return) or once-in-12-years transit (Jupiter return) or once-in-29-years transit (Saturn return), SAY SO. The user should know this is rare and powerful.

OUTPUT: Raw JSON only. No markdown, no backticks, no explanation text.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, userData } = body;

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Structured logging for Vercel
    console.log(JSON.stringify({
      event: "READING_REQUEST",
      name: userData?.name || "unknown",
      ig: userData?.ig || "",
      city: userData?.city || "",
      sun: userData?.sun || "",
      moon: userData?.moon || "",
      rising: userData?.rising || "",
      focus: userData?.focus || "",
      energy: userData?.energy || "",
      seeking: userData?.seeking || "",
      intensity: userData?.intensity || 0,
      timestamp: new Date().toISOString()
    }));

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      console.log(JSON.stringify({ event: "READING_ERROR", error: "No JSON", response: text.substring(0, 200) }));
      return Response.json({ error: "No JSON in response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
    if (!parsed.weekly || !parsed.monthly) {
      return Response.json({ error: "Invalid reading format" }, { status: 500 });
    }

    console.log(JSON.stringify({
      event: "READING_COMPLETE",
      name: userData?.name || "unknown",
      sun: userData?.sun || "",
      timestamp: new Date().toISOString()
    }));

    return Response.json(parsed);
  } catch (error) {
    console.error(JSON.stringify({ event: "READING_ERROR", error: error.message }));
    return Response.json({ error: error.message || "Failed to generate reading" }, { status: 500 });
  }
}

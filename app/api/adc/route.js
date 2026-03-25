import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile, synastry, theirMessage, context, name } = body;

    if (!profile) {
      return Response.json({ error: "Profile data required" }, { status: 400 });
    }

    const contextBlock = context
      ? `\nADDITIONAL CONTEXT:\n${context}`
      : "";

    const messageBlock = theirMessage
      ? `\nTHEIR LAST MESSAGE:\n"${theirMessage}"\n\nAnalyze: word count, emoji count, energy level, what they want emotionally (validation, playfulness, information, connection, reaction).`
      : "";

    const prompt = `You are an elite dating strategist who combines psychological profiling with the following expert frameworks:

EXPERT LIBRARY (mandatory — cite which framework supports each recommendation):
- Corey Wayne (3% Man): Say less than necessary. Statements > questions. Let them invest more. Humor is lubricant.
- Robert Greene (48 Laws + Art of Seduction): Mystery, power, don't reveal the full hand. Law #4 (say less), #28 (boldness), #36 (disdain what you can't have). Seduction: selective attention, reversal, transgression.
- Matthew Hussey: Make them FEEL something — laugh, intrigue, slight challenge, curiosity. Never just "inform."
- Chris Seiter: Ungettable energy, incomplete interactions that leave them wanting more. Death Wheel.
- Thais Gibson: Attachment theory — tailor approach to their specific attachment style and triggers.
- Gottman: 5:1 positive ratio, repair attempts, flooding awareness.

CORE PRINCIPLE: Attract Don't Chase (ADC). Create conditions for them to come to you. The person who invests more has lower status.

TARGET PSYCHOLOGICAL PROFILE:
- Name: ${name || "Unknown"}
- MBTI: ${profile.mbti?.type || "Unknown"} (${profile.mbti?.confidence || "?"}% confidence)
- Enneagram: ${profile.enneagram?.core || "?"}w${profile.enneagram?.wing || "?"}
- Attachment: ${profile.attachment?.primary || "Unknown"} (under stress: ${profile.attachment?.underStress || "?"})
- Attachment triggers: ${profile.attachment?.triggers?.join(", ") || "Unknown"}
- Communication style: ${profile.communicationStyle?.mercury || "Unknown"}
- Loves when: ${profile.communicationStyle?.lovesWhen || "Unknown"}
- Shuts down when: ${profile.communicationStyle?.shutsDown || "Unknown"}
- Best approach: ${profile.communicationStyle?.bestApproach || "Unknown"}
- Attracted to: ${profile.datingProfile?.attractedTo || "Unknown"}
- Repelled by: ${profile.datingProfile?.repelledBy || "Unknown"}
- Courtship signals: ${profile.datingProfile?.courtshipStyle || "Unknown"}
- Commitment speed: ${profile.datingProfile?.commitmentSpeed || "Unknown"}
- Deal breakers: ${profile.datingProfile?.dealBreakers?.join(", ") || "Unknown"}
- Shadow pattern: ${profile.shadowSide?.pattern || "Unknown"}
- Shadow trigger: ${profile.shadowSide?.trigger || "Unknown"}

${synastry ? `SYNASTRY WITH MAT:
- Overall score: ${synastry.overallScore}/100
- Magnetism: ${synastry.magnetism}/10
- Communication: ${synastry.communication}/10
- Hidden dynamic: ${synastry.hiddenDynamic || "Unknown"}
- Key strengths: ${synastry.strengthAspects?.map(a => a.aspect).join(", ") || "None analyzed"}
- Key challenges: ${synastry.challengeAspects?.map(a => a.aspect).join(", ") || "None analyzed"}` : ""}
${contextBlock}
${messageBlock}

Produce a JSON response with this EXACT structure:
{
  "strategicRead": "<2-3 sentences: what's really going on psychologically in this interaction based on their profile>",
  "energyMatch": {
    "theirEnergy": "<1-2 words: playful/guarded/seeking/testing/warm/cold/anxious/neutral>",
    "ceiling": "<word count and emoji count you should NOT exceed>",
    "toneTarget": "<the exact emotional frequency to hit>"
  },
  "responses": [
    {
      "text": "<1-word option>",
      "framework": "<which expert supports this>",
      "why": "<1 sentence>"
    },
    {
      "text": "<2-word option>",
      "framework": "<expert>",
      "why": "<1 sentence>"
    },
    {
      "text": "<3-5 word option>",
      "framework": "<expert>",
      "why": "<1 sentence>"
    },
    {
      "text": "<longer option — still under their word count>",
      "framework": "<expert>",
      "why": "<1 sentence>"
    },
    {
      "text": "<the bold/dangerous option — visual scene, contrast, hook>",
      "framework": "<expert>",
      "why": "<1 sentence>"
    },
    {
      "text": "<the strategic silence option — explain timing>",
      "framework": "<expert>",
      "why": "<1 sentence>"
    }
  ],
  "timing": {
    "responseWindow": "<e.g. '2-4 hours' based on their attachment style>",
    "reasoning": "<why this timing works for this attachment type>"
  },
  "doNot": ["<thing to avoid based on their specific triggers>", "<another>"],
  "attachmentPlay": "<how to specifically leverage their attachment style — what creates the magnetic pull for THIS type>",
  "nextMove": "<after this text exchange, what's the strategic next step to advance things>",
  "personalized": "<one insight about THIS specific person that most people would miss — the thing that makes your approach feel psychic>"
}

TEXTING RULES (non-negotiable):
- Options 1-2 must be 1-2 words. Short instinctive responses almost always win.
- NEVER exceed their word count or emoji count.
- Paint visual scenes, don't ask interview questions.
- Use contrast for humor (classy meets trashy, danger meets warmth).
- Write messy like a real text — no perfect grammar, no periods at end.
- Always leave a hook that makes them HAVE to respond.
- The qualifying frame: they should feel like they're earning your attention.
- If they sent something vulnerable, the Warm Anchor (one genuine sentence of warmth) is the weapon.

OUTPUT ONLY RAW JSON.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return Response.json({ error: "No JSON in ADC response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));

    console.log(
      JSON.stringify({
        event: "adc_intel",
        name: name || "unknown",
        attachment: profile.attachment?.primary,
        hasMessage: !!theirMessage,
        responseCount: parsed.responses?.length,
        timestamp: new Date().toISOString(),
      })
    );

    return Response.json(parsed);
  } catch (error) {
    console.error("ADC Intel API error:", error);
    return Response.json({ error: error.message || "ADC analysis failed" }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { chart, name, ig, chatHistory } = body;

    if (!chart) {
      return Response.json({ error: "Chart data required" }, { status: 400 });
    }

    const planets = Object.entries(chart.planets || {})
      .map(([p, d]) => `${p}: ${d.deg}° ${d.sign}`)
      .join(", ");
    const asc = chart.ascendant
      ? `Ascendant: ${chart.ascendant.deg}° ${chart.ascendant.sign}`
      : "Ascendant unknown";

    // Include chat history if available for behavioral evidence
    const chatContext = chatHistory && chatHistory.length > 0
      ? `\n\nCHAT BEHAVIOR (what they asked Luminary AI — use as behavioral evidence):\n${chatHistory.slice(0, 20).map((m) => `${m.role === "user" ? "USER" : "AI"}: ${m.content.substring(0, 200)}`).join("\n")}`
      : "";

    const prompt = `You are a master psychological profiler who uses astrology as a framework for personality analysis. You have decades of experience correlating natal chart patterns with psychological typologies, attachment styles, and behavioral tendencies.

NATAL CHART:
${planets}. ${asc}.
Name: ${name || "Unknown"}.
${chatContext}

Analyze this chart and produce a JSON response with this EXACT structure:
{
  "mbti": {
    "type": "<4-letter MBTI type>",
    "confidence": <number 1-100>,
    "reasoning": "<2-3 sentences explaining which placements point to each letter>"
  },
  "enneagram": {
    "core": <number 1-9>,
    "wing": <number 1-9>,
    "tritype": "<three numbers e.g. 4-7-1>",
    "reasoning": "<2-3 sentences>"
  },
  "attachment": {
    "primary": "<secure | anxious | avoidant | fearful-avoidant>",
    "underStress": "<which style emerges when triggered>",
    "reasoning": "<2-3 sentences linking specific placements to attachment wounds>",
    "triggers": ["<trigger 1>", "<trigger 2>", "<trigger 3>"]
  },
  "bigFive": {
    "openness": <number 1-100>,
    "conscientiousness": <number 1-100>,
    "extraversion": <number 1-100>,
    "agreeableness": <number 1-100>,
    "neuroticism": <number 1-100>
  },
  "mentalHealth": {
    "riskFactors": [
      {"pattern": "<e.g. Moon-Pluto square>", "manifests": "<what this can look like behaviorally>", "severity": "<low | moderate | elevated | high>"}
    ],
    "copingStyle": "<how this person naturally handles stress based on chart>",
    "blindSpots": ["<blind spot 1>", "<blind spot 2>"]
  },
  "humanDesign": {
    "likelyType": "<Generator | Manifesting Generator | Projector | Manifestor | Reflector>",
    "strategy": "<e.g. Wait to respond>",
    "reasoning": "<1-2 sentences based on planetary distribution>"
  },
  "communicationStyle": {
    "mercury": "<describe their communication style based on Mercury sign/aspects>",
    "lovesWhen": "<what makes them feel heard>",
    "shutsDown": "<what causes them to withdraw or get defensive>",
    "bestApproach": "<how to text/talk to this person for maximum connection>"
  },
  "datingProfile": {
    "attractedTo": "<what they're magnetically drawn to based on Venus/Mars/7th house>",
    "repelledBy": "<what pushes them away>",
    "courtshipStyle": "<how they behave when interested — the signals>",
    "commitmentSpeed": "<fast/slow/oscillating and why>",
    "dealBreakers": ["<deal breaker 1>", "<deal breaker 2>"]
  },
  "shadowSide": {
    "pattern": "<the destructive pattern they repeat unconsciously>",
    "trigger": "<what activates it>",
    "antidote": "<what breaks the cycle>"
  },
  "oneSentence": "<the single most important thing to understand about this person>"
}

Be brutally honest and psychologically precise. Reference specific planetary placements for every claim. If chat history is provided, use it as behavioral EVIDENCE to refine your assessment — what someone asks an astrology AI reveals their anxieties, desires, and attachment patterns. OUTPUT ONLY RAW JSON.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return Response.json({ error: "No JSON in profile response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));

    console.log(
      JSON.stringify({
        event: "profile",
        name: name || "unknown",
        ig: ig || "none",
        mbti: parsed.mbti?.type,
        enneagram: parsed.enneagram?.core,
        attachment: parsed.attachment?.primary,
        timestamp: new Date().toISOString(),
      })
    );

    return Response.json(parsed);
  } catch (error) {
    console.error("Profile API error:", error);
    return Response.json({ error: error.message || "Profile generation failed" }, { status: 500 });
  }
}

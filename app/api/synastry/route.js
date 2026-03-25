import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { chartA, chartB, mode, nameA, nameB } = body;

    if (!chartA || !chartB) {
      return Response.json({ error: "Two charts required" }, { status: 400 });
    }

    const relationshipMode = mode === "romantic" ? "romantic" : "platonic";

    // Build synastry aspects
    const ASPECT_TYPES = [
      { name: "conjunction", angle: 0, orb: 10 },
      { name: "sextile", angle: 60, orb: 6 },
      { name: "square", angle: 90, orb: 8 },
      { name: "trine", angle: 120, orb: 8 },
      { name: "opposition", angle: 180, orb: 10 },
    ];

    const planetsA = chartA.planets || {};
    const planetsB = chartB.planets || {};
    const synAspects = [];

    for (const [pA, dataA] of Object.entries(planetsA)) {
      for (const [pB, dataB] of Object.entries(planetsB)) {
        const lonA = dataA.longitude || 0;
        const lonB = dataB.longitude || 0;
        let diff = Math.abs(lonA - lonB);
        if (diff > 180) diff = 360 - diff;

        for (const asp of ASPECT_TYPES) {
          const orbActual = Math.abs(diff - asp.angle);
          if (orbActual <= asp.orb) {
            const tightness = 1 - orbActual / asp.orb;
            synAspects.push({
              planetA: pA,
              planetB: pB,
              aspect: asp.name,
              orb: Math.round(orbActual * 10) / 10,
              tightness: Math.round(tightness * 100) / 100,
            });
          }
        }
      }
    }

    synAspects.sort((a, b) => b.tightness - a.tightness);

    // Format chart summaries for AI prompt
    const fmtChart = (ch, name) => {
      const planets = Object.entries(ch.planets || {})
        .map(([p, d]) => `${p}: ${d.deg}° ${d.sign}`)
        .join(", ");
      const asc = ch.ascendant ? `Ascendant: ${ch.ascendant.deg}° ${ch.ascendant.sign}` : "Ascendant unknown";
      return `${name}: ${planets}. ${asc}.`;
    };

    const topAspects = synAspects
      .slice(0, 15)
      .map((a) => `${nameA || "Person A"}'s ${a.planetA} ${a.aspect} ${nameB || "Person B"}'s ${a.planetB} (orb ${a.orb}°, tightness ${a.tightness})`)
      .join("\n");

    const prompt = `You are an elite astrologer performing a ${relationshipMode} synastry reading.

PERSON A NATAL CHART:
${fmtChart(chartA, nameA || "Person A")}

PERSON B NATAL CHART:
${fmtChart(chartB, nameB || "Person B")}

KEY SYNASTRY ASPECTS (sorted by tightness):
${topAspects}

Produce a JSON response with this EXACT structure:
{
  "overallScore": <number 1-100>,
  "magnetism": <number 1-10>,
  "communication": <number 1-10>,
  "emotionalDepth": <number 1-10>,
  "longevity": <number 1-10>,
  "friction": <number 1-10>,
  "growth": <number 1-10>,
  "headline": "<one powerful sentence summarizing this connection>",
  "dynamics": "<3-4 paragraphs of rich prose analyzing the ${relationshipMode} chemistry. Reference specific aspects by name and degree. Explain what each person FEELS in the other's presence. Identify the magnetic pull AND the friction points. Be specific, warm, insightful — like a gifted astrologer in a private session.>",
  "strengthAspects": [
    {"aspect": "<e.g. Venus trine Moon>", "meaning": "<what this creates between them>"}
  ],
  "challengeAspects": [
    {"aspect": "<e.g. Mars square Saturn>", "meaning": "<the tension point>"}
  ],
  "advice": "<2-3 sentences of actionable wisdom for navigating this connection>",
  "hiddenDynamic": "<one insight that neither person would guess — the unconscious pattern between them>"
}

Write like a warm, brilliant friend who happens to be the best astrologer alive. No jargon without translation. Every aspect mentioned must be immediately followed by what it FEELS like. OUTPUT ONLY RAW JSON.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.text || "";
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return Response.json({ error: "No JSON in synastry response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));

    // Log for admin visibility
    console.log(
      JSON.stringify({
        event: "synastry",
        nameA: nameA || "unknown",
        nameB: nameB || "unknown",
        mode: relationshipMode,
        score: parsed.overallScore,
        magnetism: parsed.magnetism,
        aspectCount: synAspects.length,
        timestamp: new Date().toISOString(),
      })
    );

    return Response.json({
      ...parsed,
      rawAspects: synAspects.slice(0, 20),
      totalAspects: synAspects.length,
    });
  } catch (error) {
    console.error("Synastry API error:", error);
    return Response.json({ error: error.message || "Synastry failed" }, { status: 500 });
  }
}

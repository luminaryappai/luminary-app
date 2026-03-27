/* /api/synastry/route.js — Compatibility Analysis */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Mat's natal chart (hardcoded reference)
const MAT_CHART = "Sun: Taurus 14deg36min, Moon: Sagittarius 14deg, Ascendant: Gemini 16deg02min, Mercury: Taurus 7deg (Rx), Venus: Aries 9deg, Mars: Aries 6deg, Jupiter: Gemini 6deg47min, Saturn: Leo 10deg, Uranus: Scorpio 9deg, Neptune: Sagittarius 15deg, Pluto: Libra 11deg, N.Node: Libra 24deg";

export async function POST(req) {
  try {
    const { chart1, chart2, name1, name2, mk } = await req.json();
    if (mk !== "fateh0505") return Response.json({ error: "Unauthorized" }, { status: 401 });

    const c1 = chart1 || MAT_CHART;
    const n1 = name1 || "Person A";
    const n2 = name2 || "Person B";

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are an expert synastry astrologer. Analyze the compatibility between two charts. Be specific about aspects, not generic. Include: magnetic attraction points, communication style match, emotional needs alignment, potential friction zones, long-term compatibility assessment. Rate overall chemistry 1-10. Be honest — if there are red flags, name them.`,
      messages: [{ role: "user", content: `Chart 1 (${n1}): ${c1}\n\nChart 2 (${n2}): ${chart2}` }],
    });

    return Response.json({ analysis: response.content[0].text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

import Astronomy from "astronomy-engine";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ELEMENTS = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const MODS = ["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];

const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 10 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 8 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 10 },
];

const WEIGHTS = { Sun:10, Moon:8, Mercury:5, Venus:6, Mars:7, Jupiter:6, Saturn:7, Uranus:4, Neptune:3, Pluto:5 };

const ASPECT_MEANINGS = {
  conjunction: "is merging with",
  sextile: "is harmoniously supporting",
  square: "is creating tension with",
  trine: "is flowing beautifully with",
  opposition: "is pulling against",
};

const PLANET_AREAS = {
  Sun: "your identity, vitality, and core self",
  Moon: "your emotions, inner world, and instincts",
  Mercury: "your thinking, communication, and mental patterns",
  Venus: "your love life, beauty, values, and what you attract",
  Mars: "your drive, ambition, desire, and how you take action",
  Jupiter: "your growth, luck, expansion, and opportunities",
  Saturn: "your discipline, responsibilities, and life lessons",
  Uranus: "your need for change, freedom, and sudden breakthroughs",
  Neptune: "your dreams, intuition, spirituality, and imagination",
  Pluto: "your deepest transformation, power, and rebirth",
  Ascendant: "how you show up in the world and first impressions",
};

function getEclipticLon(body, date) {
  const gv = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(gv);
  return ecl.elon;
}

function calcAscendant(date, lat, lng) {
  const gst = Astronomy.SiderealTime(date);
  const lst = ((gst + lng / 15) % 24 + 24) % 24;
  const lstDeg = lst * 15;
  const obl = 23.44;
  const oblR = obl * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  const armcR = lstDeg * Math.PI / 180;
  let asc = Math.atan2(
    Math.cos(armcR),
    -(Math.sin(armcR) * Math.cos(oblR) + Math.tan(latR) * Math.sin(oblR))
  ) * 180 / Math.PI;
  if (asc < 0) asc += 360;
  return asc;
}

function getSign(lon) { return SIGNS[Math.floor(lon / 30)]; }
function getDeg(lon) { return Math.floor(lon % 30); }
function getMin(lon) { return Math.floor((lon % 1) * 60); }

function computeChart(year, month, day, utcHour, lat, lng) {
  const date = new Date(Date.UTC(year, month - 1, day, Math.floor(utcHour), Math.round((utcHour % 1) * 60)));
  const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const chart = {};

  for (const body of bodies) {
    const lon = getEclipticLon(body, date);
    chart[body] = { lon, sign: getSign(lon), deg: getDeg(lon), min: getMin(lon) };
  }

  const ascLon = calcAscendant(date, lat, lng);
  chart.Ascendant = { lon: ascLon, sign: getSign(ascLon), deg: getDeg(ascLon), min: getMin(ascLon) };

  return chart;
}

function computeCurrentTransits() {
  const now = new Date();
  const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const transits = {};

  for (const body of bodies) {
    const lon = getEclipticLon(body, now);
    transits[body] = { lon, sign: getSign(lon), deg: getDeg(lon), min: getMin(lon) };
  }

  return transits;
}

function findAspects(natal, transits) {
  const found = [];
  let totalScore = 0;
  const natalKeys = Object.keys(natal);
  const transitKeys = Object.keys(transits);

  for (const tk of transitKeys) {
    for (const nk of natalKeys) {
      let diff = Math.abs(transits[tk].lon - natal[nk].lon);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const tightness = 1 - orb / asp.orb;
          const weight = ((WEIGHTS[tk] || 4) + (WEIGHTS[nk] || 4)) / 2;
          totalScore += tightness * weight;
          found.push({
            transit: tk,
            natal: nk,
            aspect: asp.name,
            orb: Math.round(orb * 10) / 10,
            tightness: Math.round(tightness * 100) / 100,
            meaning: ASPECT_MEANINGS[asp.name] || "is interacting with",
            transitArea: PLANET_AREAS[tk] || "cosmic energy",
            natalArea: PLANET_AREAS[nk] || "your chart",
          });
        }
      }
    }
  }

  found.sort((a, b) => b.tightness - a.tightness);
  const maxPossible = transitKeys.length * natalKeys.length * 0.5;
  const intensity = Math.min(10, Math.max(1, Math.round(totalScore / maxPossible * 10)));

  return { aspects: found, intensity };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, lat, lng, tz } = body;

    if (!year || !month || !day || lat === undefined || lng === undefined) {
      return Response.json({ error: "Missing birth data" }, { status: 400 });
    }

    const utcHour = hour !== undefined ? hour : 12 - (tz || 0);
    const natal = computeChart(year, month, day, utcHour, lat, lng);
    const transits = computeCurrentTransits();
    const { aspects, intensity } = findAspects(natal, transits);

    // Format for client
    const chartData = {};
    for (const [key, val] of Object.entries(natal)) {
      chartData[key] = { sign: val.sign, deg: val.deg, min: val.min, lon: Math.round(val.lon * 100) / 100 };
    }

    const transitData = {};
    for (const [key, val] of Object.entries(transits)) {
      transitData[key] = { sign: val.sign, deg: val.deg, min: val.min, lon: Math.round(val.lon * 100) / 100 };
    }

    // Build readable chart text for AI prompt
    const chartText = Object.entries(chartData).map(([k, v]) => `${k}: ${v.sign} ${v.deg}deg${v.min}min`).join(", ");
    const transitText = Object.entries(transitData).map(([k, v]) => `${k}: ${v.sign} ${v.deg}deg${v.min}min`).join(", ");
    const topAspects = aspects.slice(0, 12).map(a =>
      `Transit ${a.transit} ${a.aspect} Natal ${a.natal} (orb ${a.orb}deg, intensity ${Math.round(a.tightness * 100)}%) — ${a.transit} ${a.meaning} your ${a.natal}, activating ${a.natalArea}`
    );

    // Log
    console.log(JSON.stringify({
      event: "CHART_CALCULATED",
      sun: chartData.Sun?.sign,
      moon: chartData.Moon?.sign,
      rising: chartData.Ascendant?.sign,
      intensity,
      aspectCount: aspects.length,
      timestamp: new Date().toISOString(),
    }));

    return Response.json({
      chart: chartData,
      transits: transitData,
      aspects: aspects.slice(0, 20),
      intensity,
      chartText,
      transitText,
      topAspects,
      sunElement: ELEMENTS[SIGNS.indexOf(chartData.Sun.sign)],
      sunModality: MODS[SIGNS.indexOf(chartData.Sun.sign)],
    });
  } catch (error) {
    console.error("Chart calculation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

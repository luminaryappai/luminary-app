import * as Astronomy from "astronomy-engine";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ELEMENTS = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const MODS = ["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];
const ASPECT_DEFS = [
  {name:"conjunction",angle:0,orb:10},{name:"sextile",angle:60,orb:6},
  {name:"square",angle:90,orb:8},{name:"trine",angle:120,orb:8},{name:"opposition",angle:180,orb:10}
];
const WEIGHTS = {Sun:10,Moon:8,Mercury:5,Venus:6,Mars:7,Jupiter:6,Saturn:7,Uranus:4,Neptune:3,Pluto:5};
const ASPECT_MEANINGS = {conjunction:"is merging with",sextile:"is harmoniously supporting",square:"is creating tension with",trine:"is flowing beautifully with",opposition:"is pulling against"};
const PLANET_AREAS = {Sun:"your identity and vitality",Moon:"your emotions and inner world",Mercury:"your thinking and communication",Venus:"your love life, beauty, and values",Mars:"your drive, ambition, and desire",Jupiter:"your growth, luck, and expansion",Saturn:"your discipline and life lessons",Uranus:"your need for change and breakthroughs",Neptune:"your dreams and spirituality",Pluto:"your deepest transformation and power",Ascendant:"how you show up in the world"};

function getLon(body, date) {
  const gv = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(gv);
  return ecl.elon;
}

function getAsc(date, lat, lng) {
  const gst = Astronomy.SiderealTime(date);
  const lst = ((gst + lng / 15) % 24 + 24) % 24;
  const lstDeg = lst * 15;
  const oblR = 23.44 * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  const armcR = lstDeg * Math.PI / 180;
  let asc = Math.atan2(Math.cos(armcR), -(Math.sin(armcR) * Math.cos(oblR) + Math.tan(latR) * Math.sin(oblR))) * 180 / Math.PI;
  if (asc < 0) asc += 360;
  return asc;
}

function sign(lon) { return SIGNS[Math.floor(lon / 30)]; }
function deg(lon) { return Math.floor(lon % 30); }
function min(lon) { return Math.floor((lon % 1) * 60); }

function calcChart(year, month, day, utcHour, lat, lng) {
  const h = Math.floor(utcHour);
  const m = Math.round((utcHour - h) * 60);
  const date = new Date(Date.UTC(year, month - 1, day, h, m));
  const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const chart = {};
  for (const b of bodies) {
    const lon = getLon(b, date);
    chart[b] = { lon: Math.round(lon * 100) / 100, sign: sign(lon), deg: deg(lon), min: min(lon) };
  }
  const ascLon = getAsc(date, lat, lng);
  chart.Ascendant = { lon: Math.round(ascLon * 100) / 100, sign: sign(ascLon), deg: deg(ascLon), min: min(ascLon) };
  return chart;
}

function calcTransits() {
  const now = new Date();
  const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const tr = {};
  for (const b of bodies) {
    const lon = getLon(b, now);
    tr[b] = { lon: Math.round(lon * 100) / 100, sign: sign(lon), deg: deg(lon), min: min(lon) };
  }
  return tr;
}

function getTransitTiming(planet, currentOrb, maxOrb) {
  // Average daily motion in degrees for each planet
  const speeds = { Sun:1.0, Moon:13.2, Mercury:1.2, Venus:1.2, Mars:0.52, Jupiter:0.083, Saturn:0.034, Uranus:0.012, Neptune:0.006, Pluto:0.004 };
  const speed = speeds[planet] || 0.5;
  const daysToExact = currentOrb / speed;
  const totalDuration = (maxOrb * 2) / speed;
  
  const now = new Date();
  const peak = new Date(now.getTime() + daysToExact * 86400000);
  const end = new Date(now.getTime() + (totalDuration / 2) * 86400000);
  const start = new Date(now.getTime() - (totalDuration / 2) * 86400000);
  
  const fmt = d => { const ms = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return ms[d.getMonth()] + " " + d.getDate(); };
  
  // Outer planets = long transits, inner = short
  let duration;
  if (speed < 0.02) duration = "several months";
  else if (speed < 0.1) duration = "several weeks";
  else if (speed < 0.6) duration = "1-2 weeks";
  else if (speed < 2) duration = "a few days";
  else duration = "today";
  
  return { peak: fmt(peak), start: fmt(start), end: fmt(end), duration, daysToExact: Math.round(daysToExact) };
}

function findAspects(natal, transits) {
  const found = [];
  let totalScore = 0;
  const nk = Object.keys(natal);
  const tk = Object.keys(transits);
  for (const ti of tk) {
    for (const ni of nk) {
      let diff = Math.abs(transits[ti].lon - natal[ni].lon);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const tight = 1 - orb / asp.orb;
          const w = ((WEIGHTS[ti] || 4) + (WEIGHTS[ni] || 4)) / 2;
          totalScore += tight * w;
          found.push({
            transit: ti, natal: ni, aspect: asp.name,
            orb: Math.round(orb * 10) / 10,
            tightness: Math.round(tight * 100) / 100,
            meaning: ASPECT_MEANINGS[asp.name],
            transitArea: PLANET_AREAS[ti] || "cosmic energy",
            natalArea: PLANET_AREAS[ni] || "your chart",
            timing: getTransitTiming(ti, orb, asp.orb)
          });
        }
      }
    }
  }
  found.sort((a, b) => b.tightness - a.tightness);
  const maxP = tk.length * nk.length * 0.5;
  const intensity = Math.min(10, Math.max(1, Math.round(totalScore / maxP * 10)));
  return { aspects: found, intensity };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, lat, lng, tz, unknownTime } = body;
    if (!year || !month || !day || lat === undefined || lng === undefined) {
      return Response.json({ error: "Missing birth data" }, { status: 400 });
    }
    const utcHour = hour !== undefined ? hour : 12 - (tz || 0);
    const natal = calcChart(year, month, day, utcHour, lat, lng);
    
    // If birth time is unknown, remove Ascendant and flag Moon as approximate
    if (unknownTime) {
      delete natal.Ascendant;
      natal.Moon.approximate = true;
    }
    
    const transits = calcTransits();
    
    // When time is unknown, don't include Ascendant in aspect calculations
    const natalForAspects = unknownTime ? Object.fromEntries(Object.entries(natal).filter(([k]) => k !== "Ascendant")) : natal;
    const { aspects, intensity } = findAspects(natalForAspects, transits);

    const chartText = Object.entries(natal).map(([k, v]) => {
      let label = `${k}: ${v.sign} ${v.deg}deg${v.min}min`;
      if (k === "Moon" && unknownTime) label += " (approximate — birth time unknown)";
      return label;
    }).join(", ");
    const transitText = Object.entries(transits).map(([k, v]) => `${k}: ${v.sign} ${v.deg}deg${v.min}min`).join(", ");
    const topAspects = aspects.slice(0, 12).map(a =>
      `Transit ${a.transit} ${a.aspect} Natal ${a.natal} (orb ${a.orb}deg, intensity ${Math.round(a.tightness * 100)}%) — ${a.transit} ${a.meaning} your ${a.natal}, activating ${a.natalArea}`
    );

    console.log(JSON.stringify({
      event: "CHART_CALC", sun: natal.Sun?.sign, moon: natal.Moon?.sign,
      rising: unknownTime ? "unknown" : natal.Ascendant?.sign, intensity, unknownTime: !!unknownTime, ts: new Date().toISOString()
    }));

    return Response.json({
      chart: natal, transits, aspects: aspects.slice(0, 20), intensity,
      chartText, transitText, topAspects, unknownTime: !!unknownTime,
      sunElement: ELEMENTS[SIGNS.indexOf(natal.Sun.sign)],
      sunModality: MODS[SIGNS.indexOf(natal.Sun.sign)]
    });
  } catch (error) {
    console.error("Chart error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

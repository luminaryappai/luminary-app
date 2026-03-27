/* ═══════════════════════════════════════════════════
   /api/chart/route.js — Natal Chart Calculator
   astronomy-engine (geocentric), global DST, aspects
   ═══════════════════════════════════════════════════ */

import * as Astronomy from "astronomy-engine";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ELEMENTS = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const MODS = ["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];
const BODIES = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];

function toZod(lon) {
  const i = Math.floor(lon / 30) % 12;
  const deg = Math.floor(lon % 30);
  const min = Math.floor((lon % 1) * 60);
  return { sign: SIGNS[i], deg, min, lon: Math.round(lon * 100) / 100 };
}

function calcAsc(date, lat, lng) {
  const gast = Astronomy.SiderealTime(date);
  const lst = (gast * 15 + lng) % 360;
  const lstRad = lst * Math.PI / 180;
  const obl = 23.4393 * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const asc = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(obl) + Math.tan(latRad) * Math.sin(obl))
  );
  let ascDeg = (asc * 180 / Math.PI) % 360;
  if (ascDeg < 0) ascDeg += 360;
  return ascDeg;
}

function getPosition(body, date) {
  const gv = Astronomy.GeoVector(body, date, true);
  const ec = Astronomy.Ecliptic(gv);
  return ec.elon;
}

// ═══ GLOBAL DST CORRECTION ═══
function lastSunday(y, m) {
  const last = new Date(y, m - 1 + 1, 0).getDate();
  const dow = new Date(y, m - 1, last).getDay();
  return last - dow;
}

function nthSunday(y, m, n) {
  const first = new Date(y, m - 1, 1).getDay();
  let d = first === 0 ? 1 : (7 - first) + 1;
  d += (n - 1) * 7;
  return d;
}

function getGlobalDSTOffset(y, m, d, stdOffsetHours, lat, lng) {
  // NO-DST zones (check first)
  const isAZ = stdOffsetHours === -7 && lat >= 31 && lat <= 37 && lng >= -115 && lng <= -109;
  const isHI = stdOffsetHours === -10 && lat >= 18 && lat <= 23;
  if (isAZ || isHI) return 0;

  // Asia, most of Africa: no DST
  if (stdOffsetHours >= 3 && stdOffsetHours <= 12 && !(Math.abs(stdOffsetHours - 3.5) < 0.1)) return 0;
  if (stdOffsetHours === 1 && lat >= -5 && lat <= 15) return 0; // W.Africa
  if (stdOffsetHours === 2 && lat >= -35 && lat <= 15 && lng >= 15 && lng <= 50) return 0; // E/S.Africa (excl Israel)
  if (stdOffsetHours === 3 && lat >= -5 && lat <= 55 && lng >= 30 && lng <= 60) return 0; // E.Africa/Arabia/Russia

  // Argentina: no DST
  if (stdOffsetHours === -3 && lat < -20 && lng < -55 && lng > -75) return 0;

  // Australia southern states (UTC+10, +10.5, +11 AEDT/LHDT)
  if ((stdOffsetHours === 10 || stdOffsetHours === 11) && lat < -25 && lng > 130) {
    // QLD (lat > -29, lng > 138) = no DST
    if (lat > -29 && lng > 138 && lng < 155) return 0;
    // WA
    if (lng < 130) return 0;
    // NT
    if (lat > -20 && lng < 138) return 0;
    // Southern states: first Sun Oct to first Sun Apr
    if (m < 4 || m > 10) return 1;
    if (m > 4 && m < 10) return 0;
    if (m === 4) return d < nthSunday(y, 4, 1) ? 1 : 0;
    if (m === 10) return d >= nthSunday(y, 10, 1) ? 1 : 0;
  }

  // New Zealand (UTC+12)
  if (stdOffsetHours === 12 && lat < -30) {
    // Last Sun Sep to first Sun Apr
    if (m < 4 || m > 9) return 1;
    if (m > 4 && m < 9) return 0;
    if (m === 4) return d < nthSunday(y, 4, 1) ? 1 : 0;
    if (m === 9) return d >= lastSunday(y, 9) ? 1 : 0;
  }

  // Brazil (UTC-3) — abolished DST in 2019
  if (stdOffsetHours === -3 && lat < -5 && lng > -55 && lng < -34) {
    if (y >= 2019) return 0;
    // Pre-2019: third Sun Oct to third Sun Feb
    if (m > 10 || m < 2) return 1;
    if (m === 10) return d >= nthSunday(y, 10, 3) ? 1 : 0;
    if (m === 2) return d < nthSunday(y, 2, 3) ? 1 : 0;
    return 0;
  }

  // Chile (UTC-4)
  if (stdOffsetHours === -4 && lat < -20 && lng < -65) {
    // First Sat Apr to first Sat Sep (approx first Sun)
    if (m < 4 || m > 9) return 1;
    if (m > 4 && m < 9) return 0;
    if (m === 4) return d < nthSunday(y, 4, 1) ? 1 : 0;
    if (m === 9) return d >= nthSunday(y, 9, 1) ? 1 : 0;
  }

  // US/Canada (UTC-5 to -9, excluding AZ/HI)
  if (stdOffsetHours >= -9 && stdOffsetHours <= -5 && lat > 24 && lat < 72) {
    if (y >= 2007) {
      if (m < 3 || m > 11) return 0;
      if (m > 3 && m < 11) return 1;
      if (m === 3) { const ss = nthSunday(y, 3, 2); return d >= ss ? 1 : 0; }
      if (m === 11) { const fs = nthSunday(y, 11, 1); return d < fs ? 1 : 0; }
    } else {
      if (m < 4 || m > 10) return 0;
      if (m > 4 && m < 10) return 1;
      if (m === 4) { const fs = nthSunday(y, 4, 1); return d >= fs ? 1 : 0; }
      if (m === 10) { return d < lastSunday(y, 10) ? 1 : 0; }
    }
  }

  // Europe: last Sunday March to last Sunday October
  if (stdOffsetHours >= -1 && stdOffsetHours <= 3 && lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) {
    if (m < 3 || m > 10) return 0;
    if (m > 3 && m < 10) return 1;
    if (m === 3) return d >= lastSunday(y, 3) ? 1 : 0;
    if (m === 10) return d < lastSunday(y, 10) ? 1 : 0;
  }

  // Israel
  if (stdOffsetHours === 2 && lat >= 29 && lat <= 34 && lng >= 34 && lng <= 36) {
    if (m < 3 || m > 10) return 0;
    if (m > 3 && m < 10) return 1;
    if (m === 3) return d >= lastSunday(y, 3) - 2 ? 1 : 0;
    if (m === 10) return d < lastSunday(y, 10) ? 1 : 0;
  }

  // Iran (3.5 offset)
  if (Math.abs(stdOffsetHours - 3.5) < 0.1) {
    if (m >= 4 && m <= 8) return 1;
    if (m === 3 && d >= 22) return 1;
    if (m === 9 && d < 22) return 1;
    return 0;
  }

  return 0;
}

function computeChart(year, month, day, utcHour, lat, lng) {
  const min = Math.round((utcHour % 1) * 60);
  const hr = Math.floor(utcHour);
  const date = Astronomy.MakeTime(new Date(Date.UTC(year, month - 1, day, hr < 0 ? hr + 24 : hr, min)));
  const chart = {};
  for (const body of BODIES) {
    const lon = getPosition(body, date);
    chart[body] = toZod(lon);
  }
  const ascLon = calcAsc(date, lat, lng);
  chart.Ascendant = toZod(ascLon);
  return chart;
}

function computeCurrentTransits() {
  const now = Astronomy.MakeTime(new Date());
  const transits = {};
  for (const body of BODIES) {
    const lon = getPosition(body, now);
    transits[body] = toZod(lon);
  }
  return transits;
}

const ASPECT_DEFS = [
  { name: "conjunction", angle: 0, orb: 8, symbol: "☌" },
  { name: "opposition", angle: 180, orb: 8, symbol: "☍" },
  { name: "trine", angle: 120, orb: 8, symbol: "△" },
  { name: "square", angle: 90, orb: 7, symbol: "□" },
  { name: "sextile", angle: 60, orb: 6, symbol: "⚹" },
];

const PLANET_AREAS = {
  Sun: "identity and purpose", Moon: "emotions and instincts", Mercury: "communication and thinking",
  Venus: "love and values", Mars: "drive and passion", Jupiter: "expansion and fortune",
  Saturn: "discipline and responsibility", Uranus: "change and liberation",
  Neptune: "dreams and intuition", Pluto: "transformation and power",
};

const TRANSIT_MEANINGS = {
  Sun: "illuminates", Moon: "emotionally activates", Mercury: "stimulates thought around",
  Venus: "harmonizes with", Mars: "energizes", Jupiter: "expands",
  Saturn: "tests and structures", Uranus: "disrupts", Neptune: "dissolves boundaries around",
  Pluto: "transforms",
};

function findAspects(natal, transits) {
  const aspects = [];
  for (const tBody of BODIES) {
    for (const nBody of [...BODIES, "Ascendant"]) {
      const tLon = transits[tBody].lon;
      const nLon = natal[nBody].lon;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(tLon - nLon);
        if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            transit: tBody, natal: nBody, aspect: asp.name, symbol: asp.symbol,
            orb: Math.round(orb * 10) / 10,
            tightness: 1 - (orb / asp.orb),
            meaning: TRANSIT_MEANINGS[tBody] || "influences",
            natalArea: PLANET_AREAS[nBody] || "core self",
            transitSign: transits[tBody].sign,
            natalSign: natal[nBody].sign,
          });
        }
      }
    }
  }
  aspects.sort((a, b) => b.tightness - a.tightness);

  // Intensity = number of tight aspects weighted
  let intensity = 0;
  for (const a of aspects) {
    if (a.tightness > 0.7) intensity += 2;
    else if (a.tightness > 0.4) intensity += 1;
    else intensity += 0.5;
  }
  intensity = Math.min(10, Math.round(intensity));

  return { aspects, intensity };
}

// ═══ TRANSIT TIMING ═══
function getTransitTiming(natal, tBody) {
  const now = new Date();
  const natalLons = {};
  for (const [k, v] of Object.entries(natal)) natalLons[k] = v.lon;

  const results = [];
  for (const nBody of [...BODIES, "Ascendant"]) {
    const nLon = natalLons[nBody];
    for (const asp of ASPECT_DEFS) {
      const targetAngle = asp.angle;
      // Check current transit longitude
      const tNow = Astronomy.MakeTime(now);
      const tLonNow = getPosition(tBody, tNow);
      let diff = Math.abs(tLonNow - nLon);
      if (diff > 180) diff = 360 - diff;
      const orb = Math.abs(diff - targetAngle);
      if (orb <= asp.orb * 1.2) {
        // Find peak by scanning days
        let peakOrb = orb, peakDate = now;
        for (let d = -30; d <= 30; d++) {
          const checkDate = new Date(now.getTime() + d * 86400000);
          const checkT = Astronomy.MakeTime(checkDate);
          const checkLon = getPosition(tBody, checkT);
          let checkDiff = Math.abs(checkLon - nLon);
          if (checkDiff > 180) checkDiff = 360 - checkDiff;
          const checkOrb = Math.abs(checkDiff - targetAngle);
          if (checkOrb < peakOrb) { peakOrb = checkOrb; peakDate = checkDate; }
        }
        // Find start and end (when orb enters/exits max orb)
        let startDate = now, endDate = now;
        for (let d = -60; d <= 0; d++) {
          const cd = new Date(now.getTime() + d * 86400000);
          const ct = Astronomy.MakeTime(cd);
          const cl = getPosition(tBody, ct);
          let cd2 = Math.abs(cl - nLon); if (cd2 > 180) cd2 = 360 - cd2;
          if (Math.abs(cd2 - targetAngle) > asp.orb) { startDate = new Date(cd.getTime() + 86400000); break; }
          startDate = cd;
        }
        for (let d = 0; d <= 60; d++) {
          const cd = new Date(now.getTime() + d * 86400000);
          const ct = Astronomy.MakeTime(cd);
          const cl = getPosition(tBody, ct);
          let cd2 = Math.abs(cl - nLon); if (cd2 > 180) cd2 = 360 - cd2;
          if (Math.abs(cd2 - targetAngle) > asp.orb) { endDate = cd; break; }
          endDate = cd;
        }
        results.push({
          transit: tBody, natal: nBody, aspect: asp.name,
          peak: peakDate.toISOString().split("T")[0],
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
          peakOrb: Math.round(peakOrb * 10) / 10,
          meaning: TRANSIT_MEANINGS[tBody],
          natalArea: PLANET_AREAS[nBody],
        });
      }
    }
  }
  return results;
}

export async function POST(req) {
  try {
    const { year, month, day, hour, lat, lng, tz, unknownTime } = await req.json();

    // Apply global DST correction
    const localHour = unknownTime ? 12 : hour;
    const clientUTC = localHour - (tz || 0);
    const dstCorrection = getGlobalDSTOffset(year, month, day, tz || 0, lat, lng);
    const correctedUTC = clientUTC - dstCorrection;

    const natal = computeChart(year, month, day, correctedUTC, lat, lng);
    const transits = computeCurrentTransits();
    const { aspects, intensity } = findAspects(natal, transits);

    // Transit timing for outer planets
    const timing = [];
    for (const b of ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]) {
      timing.push(...getTransitTiming(natal, b));
    }

    const chartData = {};
    for (const [key, val] of Object.entries(natal)) {
      chartData[key] = { sign: val.sign, deg: val.deg, min: val.min, lon: val.lon };
    }
    const transitData = {};
    for (const [key, val] of Object.entries(transits)) {
      transitData[key] = { sign: val.sign, deg: val.deg, min: val.min, lon: val.lon };
    }

    const chartText = Object.entries(chartData).map(([k, v]) => `${k}: ${v.sign} ${v.deg}deg${v.min}min`).join(", ");
    const transitText = Object.entries(transitData).map(([k, v]) => `${k}: ${v.sign} ${v.deg}deg${v.min}min`).join(", ");
    const topAspects = aspects.slice(0, 12).map(a =>
      `Transit ${a.transit} ${a.aspect} Natal ${a.natal} (orb ${a.orb}deg, intensity ${Math.round(a.tightness * 100)}%) — ${a.transit} ${a.meaning} your ${a.natal}, activating ${a.natalArea}`
    );

    console.log(JSON.stringify({
      event: "CHART_CALCULATED",
      sun: chartData.Sun?.sign, moon: chartData.Moon?.sign, rising: chartData.Ascendant?.sign,
      intensity, aspectCount: aspects.length, dstCorrection,
      timestamp: new Date().toISOString(),
    }));

    return Response.json({
      chart: chartData, transits: transitData, aspects: aspects.slice(0, 20),
      intensity, chartText, transitText, topAspects, timing: timing.slice(0, 15),
      sunElement: ELEMENTS[SIGNS.indexOf(chartData.Sun.sign)],
      sunModality: MODS[SIGNS.indexOf(chartData.Sun.sign)],
      dstApplied: dstCorrection,
    });
  } catch (error) {
    console.error("Chart calculation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

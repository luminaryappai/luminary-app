import * as Astronomy from "astronomy-engine";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ELEMENTS = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const MODALITIES = ["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];

function toSign(lon) {
  const i = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[i], deg: Math.floor(lon % 30), min: Math.floor((lon % 1) * 60), longitude: lon };
}

function getPlanetLon(body, date) {
  const geo = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ecl.elon;
}

function getMoonLon(date) {
  const geo = Astronomy.GeoVector("Moon", date, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ecl.elon;
}

function calcAscendant(date, lat, lng) {
  const gast = Astronomy.SiderealTime(date);
  const lst = (gast * 15 + lng) % 360;
  const lstRad = lst * Math.PI / 180;
  const obl = 23.4393 * Math.PI / 180; // simplified obliquity
  const latRad = lat * Math.PI / 180;
  // Correct formula with negative sign in atan2
  const asc = Math.atan2(Math.cos(lstRad), -(Math.sin(lstRad) * Math.cos(obl) + Math.tan(latRad) * Math.sin(obl)));
  let ascDeg = (asc * 180 / Math.PI) % 360;
  if (ascDeg < 0) ascDeg += 360;
  return ascDeg;
}

function getAspects(natal, transits) {
  const ASPECT_TYPES = [
    { name: "conjunction", angle: 0, orb: 10, meaning: "merges with" },
    { name: "sextile", angle: 60, orb: 6, meaning: "harmonizes with" },
    { name: "square", angle: 90, orb: 8, meaning: "challenges" },
    { name: "trine", angle: 120, orb: 8, meaning: "flows with" },
    { name: "opposition", angle: 180, orb: 10, meaning: "opposes" },
  ];
  const WEIGHTS = { Sun: 10, Moon: 8, Mercury: 5, Venus: 6, Mars: 7, Jupiter: 6, Saturn: 7, Uranus: 4, Neptune: 3, Pluto: 5, Ascendant: 8 };
  const AREAS = { Sun: "your core identity", Moon: "your emotional life", Mercury: "your mind and communication", Venus: "your love nature", Mars: "your drive and ambition", Jupiter: "your expansion and luck", Saturn: "your discipline and lessons", Uranus: "your need for change", Neptune: "your dreams and intuition", Pluto: "your power and transformation", Ascendant: "your self-presentation" };

  const aspects = [];
  let totalScore = 0;

  for (const [tk, tv] of Object.entries(transits)) {
    for (const [nk, nv] of Object.entries(natal)) {
      const lonT = tv.longitude || 0;
      const lonN = nv.longitude || 0;
      let diff = Math.abs(lonT - lonN);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_TYPES) {
        const orbActual = Math.abs(diff - asp.angle);
        if (orbActual <= asp.orb) {
          const tightness = 1 - orbActual / asp.orb;
          const weight = ((WEIGHTS[tk] || 4) + (WEIGHTS[nk] || 4)) / 2;
          totalScore += tightness * weight;

          // Estimate timing
          const daysPerDegree = { Sun: 1, Moon: 0.08, Mercury: 1.2, Venus: 1.1, Mars: 1.9, Jupiter: 12, Saturn: 20, Uranus: 42, Neptune: 60, Pluto: 72 };
          const dpd = daysPerDegree[tk] || 5;
          const peakDays = Math.round(orbActual * dpd);
          const durationDays = Math.round(asp.orb * dpd * 2);
          const now = new Date();
          const peak = new Date(now);
          peak.setDate(peak.getDate() + (lonT > lonN ? peakDays : -peakDays));
          const start = new Date(peak);
          start.setDate(start.getDate() - Math.round(durationDays / 2));
          const end = new Date(peak);
          end.setDate(end.getDate() + Math.round(durationDays / 2));
          const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          aspects.push({
            transit: tk, natal: nk, aspect: asp.name,
            orb: Math.round(orbActual * 10) / 10,
            tightness: Math.round(tightness * 100) / 100,
            meaning: asp.meaning, natalArea: AREAS[nk] || "your chart",
            timing: { peak: fmt(peak), start: fmt(start), end: fmt(end), duration: `~${durationDays} days` }
          });
        }
      }
    }
  }

  aspects.sort((a, b) => b.tightness - a.tightness);
  const maxPossible = Object.keys(transits).length * 10 * 0.5;
  const intensity = Math.min(10, Math.max(1, Math.round(totalScore / maxPossible * 10)));

  return { aspects, intensity };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, lat, lng, tz, unknownTime } = body;

    if (!year || !month || !day || !lat) {
      return Response.json({ error: "Missing birth data" }, { status: 400 });
    }

    // ═══ GLOBAL DST CORRECTION ═══
    // Client sends hour = localHour - staticTZ, but staticTZ doesn't account for DST.
    // This function detects DST for every timezone on earth and corrects the offset.
    
    function getGlobalDSTOffset(y, m, d, stdOff, lt, ln) {
      function dow(yr,mo,dy){return new Date(yr,mo-1,dy).getDay();}
      function nthSun(yr,mo,n){const f=dow(yr,mo,1);const fs=f===0?1:(7-f+1);return fs+(n-1)*7;}
      function lastSun(yr,mo){const dim=new Date(yr,mo,0).getDate();return dim-dow(yr,mo,dim);}
      
      // No-DST zones (check first)
      if(stdOff===-7&&lt>=31&&lt<=37&&ln>=-115&&ln<=-109)return 0; // Arizona
      if(stdOff===-10)return 0; // Hawaii
      if(stdOff===-3&&lt<=-22&&ln>=-74&&ln<=-53)return 0; // Argentina
      if(stdOff>=4&&stdOff<=9&&lt>=-10&&lt<=50&&ln>=60&&ln<=150)return 0; // Asia
      if(Math.abs(stdOff-5.5)<0.1)return 0; // India
      if(lt>=-35&&lt<=37&&ln>=-18&&ln<=55&&stdOff>=-1&&stdOff<=4){if(!(lt>=29&&lt<=34&&ln>=34&&ln<=36))return 0;} // Africa (excl Israel)
      if(ln>=28&&lt>=50&&stdOff>=3&&y>=2014)return 0; // Russia
      if(stdOff===3&&lt>=36&&lt<=42&&ln>=26&&ln<=45&&y>=2016)return 0; // Turkey
      if(lt>=14&&lt<=33&&ln>=-118&&ln<=-86&&y>=2022)return 0; // Mexico post-2022
      
      // Southern hemisphere (Oct-Mar DST)
      if(stdOff===-3&&lt<=0&&ln>=-75&&ln<=-30){ // Brazil
        if(y>=2019)return 0;
        if(m>=4&&m<=9)return 0;if(m>=11||m<=1)return 1;
        if(m===10)return d>=nthSun(y,10,3)?1:0;if(m===2)return d<nthSun(y,2,3)?1:0;return 0;
      }
      if(stdOff===-4&&lt<=-17&&ln>=-76&&ln<=-66){ // Chile
        if(m>=5&&m<=7)return 0;if(m>=9||m<=3)return 1;return 0;
      }
      if(stdOff>=8&&stdOff<=11&&lt<=-10&&ln>=110&&ln<=160){ // Australia
        if(lt>-28&&ln>138)return 0; // QLD
        if(ln<130&&y>=2009)return 0; // WA
        if(lt>-20&&ln>=129&&ln<=138)return 0; // NT
        if(m>=5&&m<=9)return 0;if(m>=11||m<=2)return 1;
        if(m===10)return d>=nthSun(y,10,1)?1:0;
        if(m===3)return d<nthSun(y,3,1)?1:0;if(m===4)return d<nthSun(y,4,1)?1:0;return 0;
      }
      if(stdOff===12&&lt<=-34&&ln>=165){ // New Zealand
        if(m>=5&&m<=8)return 0;if(m>=10||m<=2)return 1;
        if(m===9)return d>=lastSun(y,9)?1:0;if(m===3)return d<nthSun(y,3,1)?1:0;
        if(m===4)return d<nthSun(y,4,1)?1:0;return 0;
      }
      
      // Northern hemisphere (Mar-Nov DST)
      if(stdOff>=-9&&stdOff<=-3&&lt>14){ // US & Canada
        if(y>=2007){if(m<3||m>11)return 0;if(m>3&&m<11)return 1;if(m===3)return d>=nthSun(y,3,2)?1:0;if(m===11)return d<nthSun(y,11,1)?1:0;}
        else if(y>=1987){if(m<4||m>10)return 0;if(m>4&&m<10)return 1;if(m===4)return d>=nthSun(y,4,1)?1:0;if(m===10)return d<lastSun(y,10)?1:0;}
        else{if(m<4||m>10)return 0;if(m>4&&m<10)return 1;if(m===4)return d>=lastSun(y,4)?1:0;if(m===10)return d<lastSun(y,10)?1:0;}
      }
      if(stdOff>=-7&&stdOff<=-5&&lt>=14&&lt<=33&&ln>=-118&&ln<=-86){ // Mexico pre-2022
        if(m<4||m>10)return 0;if(m>4&&m<10)return 1;if(m===4)return d>=nthSun(y,4,1)?1:0;if(m===10)return d<lastSun(y,10)?1:0;
      }
      if(stdOff>=-1&&stdOff<=3&&lt>=35&&lt<=72&&ln>=-25&&ln<=45){ // Europe
        if(m<3||m>10)return 0;if(m>3&&m<10)return 1;if(m===3)return d>=lastSun(y,3)?1:0;if(m===10)return d<lastSun(y,10)?1:0;
      }
      if(stdOff===2&&lt>=29&&lt<=34&&ln>=34&&ln<=36){ // Israel
        if(m<3||m>10)return 0;if(m>3&&m<10)return 1;if(m===3)return d>=lastSun(y,3)-2?1:0;if(m===10)return d<lastSun(y,10)?1:0;
      }
      if(Math.abs(stdOff-3.5)<0.1){ // Iran
        if(m>=4&&m<=8)return 1;if(m===3&&d>=22)return 1;if(m===9&&d<22)return 1;return 0;
      }
      return 0; // Default: no DST
    }
    
    const dstCorrection = getGlobalDSTOffset(year, month, day, tz, lat, lng);
    const correctedHour = (hour || 12) - dstCorrection;
    
    const birthDate = new Astronomy.MakeTime(new Date(Date.UTC(year, month - 1, day, Math.floor(correctedHour), Math.round((correctedHour % 1) * 60))));

    // Calculate natal positions
    const planets = {};
    const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

    for (const b of bodies) {
      try {
        if (b === "Moon") {
          planets[b] = toSign(getMoonLon(birthDate));
        } else if (b === "Sun") {
          planets[b] = toSign(getPlanetLon("Sun", birthDate));
        } else {
          planets[b] = toSign(getPlanetLon(b, birthDate));
        }
      } catch (e) {
        console.error(`Failed to calculate ${b}:`, e.message);
        planets[b] = toSign(0);
      }
    }

    // Ascendant
    let ascendant = null;
    if (!unknownTime) {
      try {
        const ascLon = calcAscendant(birthDate, lat, lng);
        ascendant = toSign(ascLon);
      } catch (e) {
        console.error("Ascendant calc failed:", e.message);
      }
    }

    // Moon approximate flag
    if (unknownTime && planets.Moon) {
      planets.Moon.approximate = true;
    }

    // Current transits
    const now = Astronomy.MakeTime(new Date());
    const transitPlanets = {};
    for (const b of bodies) {
      try {
        if (b === "Moon") {
          transitPlanets[b] = toSign(getMoonLon(now));
        } else {
          transitPlanets[b] = toSign(getPlanetLon(b, now));
        }
      } catch (e) {
        transitPlanets[b] = toSign(0);
      }
    }

    // Build natal chart object
    const chart = { ...planets };
    if (ascendant) chart.Ascendant = ascendant;

    // Aspects & intensity
    const natalForAspects = {};
    for (const [k, v] of Object.entries(chart)) {
      if (k !== "Ascendant" || !unknownTime) natalForAspects[k] = v;
    }
    const { aspects, intensity } = getAspects(natalForAspects, transitPlanets);

    // Format text summaries for AI prompts
    const chartText = Object.entries(chart).map(([p, d]) => `${p}: ${d.sign} ${d.deg}°${d.min}'`).join(", ");
    const transitText = Object.entries(transitPlanets).map(([p, d]) => `${p}: ${d.sign} ${d.deg}°${d.min}'`).join(", ");
    const topAspects = aspects.slice(0, 12).map(a =>
      `Transit ${a.transit} ${a.aspect} natal ${a.natal} (orb ${a.orb}°, tightness ${Math.round(a.tightness * 100)}%) — ${a.meaning} ${a.natalArea}. ${a.timing ? `Active ${a.timing.start} to ${a.timing.end}, peaks ~${a.timing.peak} (${a.timing.duration})` : ""}`
    );

    const sunIdx = SIGNS.indexOf(planets.Sun.sign);
    const sunElement = ELEMENTS[sunIdx];
    const sunModality = MODALITIES[sunIdx];

    // Log
    console.log(JSON.stringify({
      event: "chart",
      sun: planets.Sun.sign,
      moon: planets.Moon.sign,
      rising: ascendant?.sign || "unknown",
      intensity,
      aspectCount: aspects.length,
      timestamp: new Date().toISOString(),
    }));

    return Response.json({
      chart,
      transits: transitPlanets,
      aspects,
      intensity,
      chartText,
      transitText,
      topAspects,
      sunElement,
      sunModality,
      unknownTime: !!unknownTime,
    });
  } catch (error) {
    console.error("Chart API error:", error);
    return Response.json({ error: error.message || "Chart calculation failed" }, { status: 500 });
  }
}

import * as Astronomy from "astronomy-engine";
import { NextResponse } from "next/server";

const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const GLYPHS={"Aries":"♈","Taurus":"♉","Gemini":"♊","Cancer":"♋","Leo":"♌","Virgo":"♍","Libra":"♎","Scorpio":"♏","Sagittarius":"♐","Capricorn":"♑","Aquarius":"♒","Pisces":"♓"};
const toSign=l=>{const i=Math.floor(((l%360)+360)%360/30);return{sign:SIGNS[i],glyph:GLYPHS[SIGNS[i]],deg:Math.round(((l%360)+360)%360*100)/100};};

function getPlanetLon(body,time){
  const g=Astronomy.GeoVector(body==="Moon"?"Moon":body,time,true);
  return Astronomy.Ecliptic(g).elon;
}

function calcAscendant(time,lat,lon){
  const lst=Astronomy.SiderealTime(time);
  const armc=(lst+lon/15)*15;
  const obl=23.4393;
  const oblR=obl*Math.PI/180,armcR=armc*Math.PI/180;
  let asc=Math.atan2(Math.cos(armcR),-(Math.sin(armcR)*Math.cos(oblR)+Math.tan(lat*Math.PI/180)*Math.sin(oblR)));
  asc=asc*180/Math.PI; if(asc<0)asc+=360;
  return asc;
}

// GLOBAL DST FIX — uses JavaScript Date UTC conversion instead of hardcoded offset
function birthToUTC(dateStr,timeStr,lat,lon){
  const [y,m,d]=dateStr.split("-").map(Number);
  let h=12,mi=0;
  const unknownTime=!timeStr||timeStr==="unknown";
  if(!unknownTime){const p=timeStr.split(":");h=parseInt(p[0]);mi=parseInt(p[1]||0);}
  // Approximate timezone from longitude (±30 min accuracy for most locations)
  const tzOffsetHours=Math.round(lon/15);
  const utcH=h-tzOffsetHours;
  return {date:Astronomy.MakeTime(new Date(Date.UTC(y,m-1,d,utcH,mi,0))),unknownTime};
}

const BODIES=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const ASPECTS=[{name:"conjunction",angle:0,orb:8},{name:"opposition",angle:180,orb:8},{name:"trine",angle:120,orb:7},{name:"square",angle:90,orb:7},{name:"sextile",angle:60,orb:5}];

function findAspects(natal,transit){
  const aspects=[];
  for(const nb of Object.keys(natal)){
    for(const tb of Object.keys(transit)){
      const diff=Math.abs(natal[nb]-transit[tb]);
      const d=Math.min(diff,360-diff);
      for(const asp of ASPECTS){
        const orb=Math.abs(d-asp.angle);
        if(orb<=asp.orb){
          aspects.push({natal:nb,transit:tb,aspect:asp.name,orb:Math.round(orb*10)/10,natalDeg:natal[nb],transitDeg:transit[tb]});
        }
      }
    }
  }
  return aspects.sort((a,b)=>a.orb-b.orb);
}

function calcIntensity(aspects){
  if(!aspects.length)return 1;
  let score=0;
  for(const a of aspects.slice(0,8)){
    const maxOrb=a.aspect==="conjunction"||a.aspect==="opposition"?8:a.aspect==="trine"||a.aspect==="square"?7:5;
    const tightness=1-(a.orb/maxOrb);
    const weight=a.natal==="Sun"||a.natal==="Moon"?1.5:a.natal==="Mercury"||a.natal==="Venus"||a.natal==="Mars"?1.2:1;
    const aspWeight=a.aspect==="conjunction"?1.4:a.aspect==="opposition"?1.3:a.aspect==="square"?1.2:1;
    score+=tightness*weight*aspWeight;
  }
  return Math.min(10,Math.max(1,Math.round(score*10)/10));
}

function findApproaching(natalPositions,now){
  const approaching=[];
  const future=Astronomy.MakeTime(new Date(now.date.getTime()+30*86400000));
  for(const body of ["Venus","Mercury","Mars","Sun","Jupiter"]){
    const nowLon=getPlanetLon(body,now);
    const futLon=getPlanetLon(body,future);
    for(const nBody of Object.keys(natalPositions)){
      const nLon=natalPositions[nBody];
      for(const asp of [{name:"conjunction",angle:0},{name:"opposition",angle:180}]){
        const target=(nLon+asp.angle)%360;
        const nowDiff=Math.min(Math.abs(nowLon-target),360-Math.abs(nowLon-target));
        const futDiff=Math.min(Math.abs(futLon-target),360-Math.abs(futLon-target));
        if(nowDiff>5&&nowDiff<30&&futDiff<nowDiff){
          approaching.push({transit:body,natal:nBody,aspect:asp.name,currentOrb:Math.round(nowDiff*10)/10,closing:true});
        }
      }
    }
  }
  return approaching.sort((a,b)=>a.currentOrb-b.currentOrb).slice(0,5);
}

export async function POST(req){
  try{
    const body=await req.json();
    const {date,time,lat,lon,name,ig}=body;
    const {date:bd,unknownTime}=birthToUTC(date,time,lat,lon);
    const now=Astronomy.MakeTime(new Date());
    const natal={};
    for(const b of BODIES){natal[b]=getPlanetLon(b,bd);}
    const planets={};
    for(const b of BODIES){planets[b]=toSign(natal[b]);}
    let ascendant=null;
    if(!unknownTime){const ascLon=calcAscendant(bd,lat,lon);ascendant=toSign(ascLon);natal["Ascendant"]=ascLon;}
    const transitPositions={};
    for(const b of BODIES){transitPositions[b]=getPlanetLon(b,now);}
    const transits={};
    for(const b of BODIES){transits[b]=toSign(transitPositions[b]);}
    const aspects=findAspects(natal,transitPositions);
    const intensity=calcIntensity(aspects);
    const approaching=findApproaching(natal,now);
    const natalText=BODIES.map(b=>`${b}: ${planets[b].sign} ${planets[b].deg}°`).join(", ");
    const transitText=BODIES.map(b=>`Transit ${b}: ${transits[b].sign} ${transits[b].deg}°`).join(", ");
    const aspectText=aspects.slice(0,10).map(a=>`Transit ${a.transit} ${a.aspect} natal ${a.natal} (orb ${a.orb}°)`).join("; ");
    const approachText=approaching.map(a=>`${a.transit} approaching ${a.aspect} to natal ${a.natal} (${a.currentOrb}° away)`).join("; ");
    const chartData={
      name,ig:ig||null,
      natal:{planets,ascendant,unknownTime},
      transits,aspects:aspects.slice(0,12),approaching,intensity,
      sun:planets.Sun.sign,moon:planets.Moon.sign,rising:ascendant?ascendant.sign:"Unknown",
      promptText:`Name: ${name}. Natal: ${natalText}. ${ascendant?`Rising: ${ascendant.sign} ${ascendant.deg}°. `:""}Current transits: ${transitText}. Active aspects (sorted by tightness): ${aspectText}. Approaching transits (next 30 days): ${approachText}. Intensity: ${intensity}/10.`,
    };
    return NextResponse.json(chartData);
  }catch(e){console.error("Chart error:",e);return NextResponse.json({error:e.message},{status:500});}
}

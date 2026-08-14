import * as Astronomy from "astronomy-engine";
import { NextResponse } from "next/server";
import tzlookup from "tz-lookup";

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
  const obl=23.4393,oblR=obl*Math.PI/180,armcR=armc*Math.PI/180;
  let asc=Math.atan2(Math.cos(armcR),-(Math.sin(armcR)*Math.cos(oblR)+Math.tan(lat*Math.PI/180)*Math.sin(oblR)));
  asc=asc*180/Math.PI;if(asc<0)asc+=360;
  return asc;
}
function tzOffsetMin(tz,dateUTC){
  const dtf=new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  const p=dtf.formatToParts(dateUTC).reduce((a,x)=>(a[x.type]=x.value,a),{});
  return(Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute,p.second)-dateUTC.getTime())/60000;
}

function birthToUTC(dateStr,timeStr,lat,lon){
  const[y,m,d]=dateStr.split("-").map(Number);
  const unknownTime=!timeStr||timeStr==="unknown";
  const[h,mi]=unknownTime?[12,0]:timeStr.split(":").map(Number);
  /* Real IANA timezone from coordinates — historical DST handled by Intl/ICU.
     (Old flat lon/15 offset ignored DST: 1h error on every DST birth.) */
  let utcMs;
  try{
    const tz=tzlookup(lat,lon);
    const naive=Date.UTC(y,m-1,d,h,mi,0);
    let off=tzOffsetMin(tz,new Date(naive));
    utcMs=naive-off*60000;
    off=tzOffsetMin(tz,new Date(utcMs)); /* second pass pins DST boundary cases */
    utcMs=naive-off*60000;
  }catch(e){
    const tzOffsetHours=Math.round(lon/15);
    utcMs=Date.UTC(y,m-1,d,h-tzOffsetHours,mi,0);
  }
  return{date:Astronomy.MakeTime(new Date(utcMs)),unknownTime};
}

const BODIES=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const ASPECTS=[{name:"conjunction",angle:0,orb:8},{name:"opposition",angle:180,orb:8},{name:"trine",angle:120,orb:7},{name:"square",angle:90,orb:7},{name:"sextile",angle:60,orb:5}];

function findAspects(natal,transit){
  const out=[];
  for(const nb of Object.keys(natal)){for(const tb of Object.keys(transit)){
    const diff=Math.abs(natal[nb]-transit[tb]);const d=Math.min(diff,360-diff);
    for(const a of ASPECTS){const orb=Math.abs(d-a.angle);
      if(orb<=a.orb)out.push({natal:nb,transit:tb,aspect:a.name,orb:Math.round(orb*10)/10,natalDeg:natal[nb],transitDeg:transit[tb]});}
  }}
  return out.sort((a,b)=>a.orb-b.orb);
}
function calcIntensity(aspects){
  if(!aspects.length)return 1;
  let s=0;
  for(const a of aspects.slice(0,8)){
    const mo=a.aspect==="conjunction"||a.aspect==="opposition"?8:a.aspect==="trine"||a.aspect==="square"?7:5;
    const t=1-(a.orb/mo);
    const w=a.natal==="Sun"||a.natal==="Moon"?1.5:a.natal==="Mercury"||a.natal==="Venus"||a.natal==="Mars"?1.2:1;
    const aw=a.aspect==="conjunction"?1.4:a.aspect==="opposition"?1.3:a.aspect==="square"?1.2:1;
    s+=t*w*aw;
  }
  return Math.min(10,Math.max(1,Math.round(s*10)/10));
}
function findApproaching(natal,now){
  const out=[];
  const fut=Astronomy.MakeTime(new Date(now.date.getTime()+30*86400000));
  for(const b of["Venus","Mercury","Mars","Sun","Jupiter"]){
    const nl=getPlanetLon(b,now),fl=getPlanetLon(b,fut);
    for(const nb of Object.keys(natal)){
      const t0=natal[nb];
      for(const a of[{name:"conjunction",angle:0},{name:"opposition",angle:180}]){
        const tg=(t0+a.angle)%360;
        const nd=Math.min(Math.abs(nl-tg),360-Math.abs(nl-tg));
        const fd=Math.min(Math.abs(fl-tg),360-Math.abs(fl-tg));
        if(nd>5&&nd<30&&fd<nd)out.push({transit:b,natal:nb,aspect:a.name,currentOrb:Math.round(nd*10)/10,closing:true});
      }
    }
  }
  return out.sort((a,b)=>a.currentOrb-b.currentOrb).slice(0,5);
}

/* ═══ HUMAN DESIGN — 88° solar arc, Gate 41 wheel ═══ */
/* Zodiacal gate sequence starting at Gate 41 @ 302° absolute (2° Aquarius) */
const GATE_SEQ=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
function lonToGate(lon){
  const off=(((lon-302)%360)+360)%360;
  const gi=Math.floor(off/5.625);
  const line=Math.floor((off%5.625)/0.9375)+1;
  return{gate:GATE_SEQ[gi],line};
}
/* 36 channels: gate pairs */
const CHANNELS=[[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
/* Center membership */
const CENTERS={Head:[64,61,63],Ajna:[47,24,4,17,43,11],Throat:[62,23,56,35,12,45,33,8,31,16,20],G:[1,13,25,46,2,15,10,7],Heart:[26,51,21,40],Sacral:[34,5,14,29,59,9,3,42,27],Spleen:[48,57,44,50,32,28,18],SolarPlexus:[36,22,37,6,49,55,30],Root:[58,38,54,53,60,52,19,39,41]};
const MOTORS=["Sacral","SolarPlexus","Heart","Root"];
function gateCenter(g){for(const c of Object.keys(CENTERS)){if(CENTERS[c].includes(g))return c;}return null;}

function findDesignTime(birthTime){
  /* Sun exactly 88° of arc before birth Sun */
  const bSun=getPlanetLon("Sun",birthTime);
  const target=(((bSun-88)%360)+360)%360;
  /* search 85-92 days before birth */
  let lo=new Date(birthTime.date.getTime()-92*86400000).getTime();
  let hi=new Date(birthTime.date.getTime()-85*86400000).getTime();
  for(let i=0;i<40;i++){
    const mid=(lo+hi)/2;
    const t=Astronomy.MakeTime(new Date(mid));
    const s=getPlanetLon("Sun",t);
    /* signed angular difference target - s */
    let diff=(((target-s)%360)+360)%360;if(diff>180)diff-=360;
    if(Math.abs(diff)<0.0005)return t;
    /* sun increases with time; if s < target we need later time */
    if(diff>0)lo=mid;else hi=mid;
  }
  return Astronomy.MakeTime(new Date((lo+hi)/2));
}

function meanLunarNode(time){
  const d=(time.date.getTime()-Date.UTC(2000,0,1,12,0,0))/86400000;
  return(((125.04452-0.05295376*d)%360)+360)%360;
}

function trueNodeLon(time){
  /* Osculating (True) Node from lunar state vectors — matches Swiss Ephemeris True Node */
  try{
    const st=Astronomy.GeoMoonState(time);
    const rot=Astronomy.Rotation_EQJ_ECL();
    const r=Astronomy.RotateVector(rot,new Astronomy.Vector(st.x,st.y,st.z,time));
    const v=Astronomy.RotateVector(rot,new Astronomy.Vector(st.vx,st.vy,st.vz,time));
    const hx=r.y*v.z-r.z*v.y, hy=r.z*v.x-r.x*v.z;
    let n=Math.atan2(hx,-hy)*180/Math.PI;if(n<0)n+=360;return n;
  }catch(e){return meanLunarNode(time);}
}

function calcHumanDesign(birthTime){
  const HD_BODIES=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const designTime=findDesignTime(birthTime);
  const pGates=[],dGates=[];
  let pSunLine=1,dSunLine=1;
  for(const b of HD_BODIES){
    const pl=getPlanetLon(b,birthTime);const pg=lonToGate(pl);pGates.push(pg.gate);
    if(b==="Sun")pSunLine=pg.line;
    if(b==="Sun"){const eg=lonToGate((pl+180)%360);pGates.push(eg.gate);}
    const dl=getPlanetLon(b,designTime);const dg=lonToGate(dl);dGates.push(dg.gate);
    if(b==="Sun")dSunLine=dg.line;
    if(b==="Sun"){const eg=lonToGate((dl+180)%360);dGates.push(eg.gate);}
  }
  /* North + South Nodes — full 13 activations per side (missing these caused the Projector/MG bug) */
  const pN=trueNodeLon(birthTime);
  pGates.push(lonToGate(pN).gate);pGates.push(lonToGate((pN+180)%360).gate);
  const dN=trueNodeLon(designTime);
  dGates.push(lonToGate(dN).gate);dGates.push(lonToGate((dN+180)%360).gate);
  const allGates=[...new Set([...pGates,...dGates])];
  /* Defined channels */
  const defChannels=CHANNELS.filter(([a,b])=>allGates.includes(a)&&allGates.includes(b));
  /* Defined centers via union of channel endpoints */
  const defCenters=new Set();
  for(const[a,b]of defChannels){defCenters.add(gateCenter(a));defCenters.add(gateCenter(b));}
  /* Connectivity graph between centers via defined channels */
  const adj={};for(const c of Object.keys(CENTERS))adj[c]=new Set();
  for(const[a,b]of defChannels){const ca=gateCenter(a),cb=gateCenter(b);if(ca!==cb){adj[ca].add(cb);adj[cb].add(ca);}}
  function connected(from,targets){
    const seen=new Set([from]);const q=[from];
    while(q.length){const c=q.shift();if(targets.includes(c))return true;for(const n of adj[c]){if(!seen.has(n)&&defCenters.has(n)){seen.add(n);q.push(n);}}}
    return false;
  }
  const sacralDef=defCenters.has("Sacral");
  const throatDef=defCenters.has("Throat");
  const throatToMotor=throatDef&&connected("Throat",MOTORS.filter(m=>defCenters.has(m)));
  let type,strategy,notSelf;
  if(defCenters.size===0){type="Reflector";strategy="Wait a lunar cycle";notSelf="Disappointment";}
  else if(sacralDef){
    if(throatToMotor){type="Manifesting Generator";strategy="Respond, then inform";notSelf="Frustration & anger";}
    else{type="Generator";strategy="Wait to respond";notSelf="Frustration";}
  }
  else if(throatToMotor){type="Manifestor";strategy="Inform before acting";notSelf="Anger";}
  else{type="Projector";strategy="Wait for the invitation";notSelf="Bitterness";}
  /* Authority */
  let authority;
  if(defCenters.has("SolarPlexus"))authority="Emotional";
  else if(sacralDef)authority="Sacral";
  else if(defCenters.has("Spleen"))authority="Splenic";
  else if(defCenters.has("Heart"))authority="Ego";
  else if(defCenters.has("G"))authority="Self-Projected";
  else authority=type==="Reflector"?"Lunar":"Environmental";
  const profile=pSunLine+"/"+dSunLine;
  return{type,strategy,authority,profile,notSelf,definedCenters:[...defCenters],definedChannels:defChannels.map(c=>c.join("-")),gateCount:allGates.length};
}

export async function POST(req){
  try{
    const body=await req.json();
    const{date,time,lat,lon,name,ig}=body;
    const{date:bd,unknownTime}=birthToUTC(date,time,lat,lon);
    const now=Astronomy.MakeTime(new Date());
    const natal={};for(const b of BODIES)natal[b]=getPlanetLon(b,bd);
    const planets={};for(const b of BODIES)planets[b]=toSign(natal[b]);
    let ascendant=null;
    if(!unknownTime){const al=calcAscendant(bd,lat,lon);ascendant=toSign(al);natal["Ascendant"]=al;}
    const tp={};for(const b of BODIES)tp[b]=getPlanetLon(b,now);
    const transits={};for(const b of BODIES)transits[b]=toSign(tp[b]);
    const aspects=findAspects(natal,tp);
    const intensity=calcIntensity(aspects);
    const approaching=findApproaching(natal,now);
    /* Human Design */
    let humanDesign=null;
    try{humanDesign=calcHumanDesign(bd);}catch(e){console.error("HD calc error:",e);}
    const natalText=BODIES.map(b=>b+": "+planets[b].sign+" "+planets[b].deg+"°").join(", ");
    const transitText=BODIES.map(b=>"Transit "+b+": "+transits[b].sign+" "+transits[b].deg+"°").join(", ");
    const aspectText=aspects.slice(0,10).map(a=>"Transit "+a.transit+" "+a.aspect+" natal "+a.natal+" (orb "+a.orb+"°)").join("; ");
    const approachText=approaching.map(a=>a.transit+" approaching "+a.aspect+" to natal "+a.natal+" ("+a.currentOrb+"° away)").join("; ");
    const hdText=humanDesign?("Human Design: "+humanDesign.type+", Strategy: "+humanDesign.strategy+", Authority: "+humanDesign.authority+", Profile: "+humanDesign.profile+", Not-Self: "+humanDesign.notSelf):"";
    const chartData={
      name,ig:ig||null,
      natal:{planets,ascendant,unknownTime},
      transits,aspects:aspects.slice(0,12),approaching,intensity,humanDesign,
      sun:planets.Sun.sign,moon:planets.Moon.sign,rising:ascendant?ascendant.sign:"Unknown",
      promptText:"Name: "+name+". Natal: "+natalText+". "+(ascendant?("Rising: "+ascendant.sign+" "+ascendant.deg+"°. "):"")+"Current transits: "+transitText+". Active aspects (sorted by tightness): "+aspectText+". Approaching (next 30 days): "+approachText+". Intensity: "+intensity+"/10. "+hdText,
    };
    return NextResponse.json(chartData);
  }catch(e){console.error("Chart error:",e);return NextResponse.json({error:e.message},{status:500});}
}

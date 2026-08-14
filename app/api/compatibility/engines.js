/* Documented compatibility systems: Vedic Ashtakoota (36 gunas, Lahiri ayanamsa),
   Pythagorean numerology, composite midpoints, chemistry axes from real synastry. */

export function lahiriAyanamsa(year){
  /* Lahiri ≈ 23.85° at 2000.0, precession ~50.29"/yr */
  return 23.85+(year-2000)*0.013972;
}

const NAKSHATRAS=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const RASHIS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
/* 1-indexed nakshatra → gana */
const GANA={deva:[1,5,7,8,13,15,17,22,27],manushya:[2,4,6,11,12,20,21,25,26],rakshasa:[3,9,10,14,16,18,19,23,24]};
/* 1-indexed nakshatra → yoni animal */
const YONI=["Horse","Elephant","Sheep","Serpent","Serpent","Dog","Cat","Sheep","Cat","Rat","Rat","Cow","Buffalo","Tiger","Buffalo","Tiger","Deer","Deer","Dog","Monkey","Mongoose","Monkey","Lion","Horse","Lion","Cow","Elephant"];
const YONI_ENEMIES=[["Cow","Tiger"],["Elephant","Lion"],["Horse","Buffalo"],["Dog","Deer"],["Serpent","Mongoose"],["Monkey","Sheep"],["Cat","Rat"]];
/* rashi index → lord */
const LORDS=["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
const FRIENDS={Sun:["Moon","Mars","Jupiter"],Moon:["Sun","Mercury"],Mars:["Sun","Moon","Jupiter"],Mercury:["Sun","Venus"],Jupiter:["Sun","Moon","Mars"],Venus:["Mercury","Saturn"],Saturn:["Mercury","Venus"]};
const ENEMIES={Sun:["Venus","Saturn"],Moon:[],Mars:["Mercury"],Mercury:["Moon"],Jupiter:["Mercury","Venus"],Venus:["Sun","Moon"],Saturn:["Sun","Moon","Mars"]};
const VARNA_MAP={Cancer:3,Scorpio:3,Pisces:3,Aries:2,Leo:2,Sagittarius:2,Taurus:1,Virgo:1,Capricorn:1,Gemini:0,Libra:0,Aquarius:0};
const VARNA_NAME=["Shudra","Vaishya","Kshatriya","Brahmin"];
const VASHYA_GROUP={Aries:"quad",Taurus:"quad",Capricorn:"quad",Gemini:"human",Virgo:"human",Libra:"human",Sagittarius:"human",Aquarius:"human",Cancer:"water",Pisces:"water",Leo:"wild",Scorpio:"insect"};
const NADI_MAP={adi:[1,6,7,12,13,18,19,24,25],madhya:[2,5,8,11,14,17,20,23,26],antya:[3,4,9,10,15,16,21,22,27]};

function nadiOf(n){for(const k in NADI_MAP)if(NADI_MAP[k].includes(n))return k;return "adi";}
function ganaOf(n){for(const k in GANA)if(GANA[k].includes(n))return k;return "manushya";}
function relation(l1,l2){
  if(l1===l2)return "same";
  const f1=(FRIENDS[l1]||[]).includes(l2),e1=(ENEMIES[l1]||[]).includes(l2);
  const f2=(FRIENDS[l2]||[]).includes(l1),e2=(ENEMIES[l2]||[]).includes(l1);
  if(f1&&f2)return "mutual-friends";
  if((f1&&!e2)||(f2&&!e1))return "friend-neutral";
  if((f1&&e2)||(f2&&e1))return "friend-enemy";
  if(e1&&e2)return "mutual-enemies";
  return "neutral";
}

export function ashtakoota(moonLonA,moonLonB,yearA,yearB){
  const sidA=((moonLonA-lahiriAyanamsa(yearA))%360+360)%360;
  const sidB=((moonLonB-lahiriAyanamsa(yearB))%360+360)%360;
  const nA=Math.floor(sidA/(360/27))+1, nB=Math.floor(sidB/(360/27))+1; /* 1-27 */
  const rA=Math.floor(sidA/30), rB=Math.floor(sidB/30);
  const kootas=[];

  /* 1. Varna (1) */
  const vA=VARNA_MAP[RASHIS[rA]], vB=VARNA_MAP[RASHIS[rB]];
  const varna=vA>=vB?1:0;
  kootas.push({name:"Varna",max:1,score:varna,detail:VARNA_NAME[vA]+" + "+VARNA_NAME[vB],meaning:"spiritual ego compatibility"});

  /* 2. Vashya (2) */
  const gA=VASHYA_GROUP[RASHIS[rA]],gB=VASHYA_GROUP[RASHIS[rB]];
  let vashya=1;
  if(gA===gB)vashya=2;
  else if((gA==="wild"&&gB==="quad")||(gB==="wild"&&gA==="quad"))vashya=0;
  else if(gA==="wild"||gB==="wild")vashya=0.5;
  else if((gA==="human"&&gB==="quad")||(gB==="human"&&gA==="quad"))vashya=1;
  kootas.push({name:"Vashya",max:2,score:vashya,detail:gA+" + "+gB,meaning:"mutual influence and devotion"});

  /* 3. Tara (3) */
  const t1=(((nB-nA+27)%27)+1)%9, t2=(((nA-nB+27)%27)+1)%9;
  const bad=[3,5,7];
  const g1=!bad.includes(t1===0?9:t1), g2=!bad.includes(t2===0?9:t2);
  const tara=g1&&g2?3:(g1||g2?1.5:0);
  kootas.push({name:"Tara",max:3,score:tara,detail:"birth star distances "+(t1===0?9:t1)+" & "+(t2===0?9:t2),meaning:"destiny and shared fortune"});

  /* 4. Yoni (4) */
  const yA=YONI[nA-1],yB=YONI[nB-1];
  let yoni=2;
  if(yA===yB)yoni=4;
  else if(YONI_ENEMIES.some(([a,b])=>(a===yA&&b===yB)||(a===yB&&b===yA)))yoni=0;
  kootas.push({name:"Yoni",max:4,score:yoni,detail:yA+" + "+yB,meaning:"physical and instinctive harmony"});

  /* 5. Graha Maitri (5) */
  const lA=LORDS[rA],lB=LORDS[rB];
  const rel=relation(lA,lB);
  const gm={"same":5,"mutual-friends":5,"friend-neutral":4,"neutral":3,"friend-enemy":1,"mutual-enemies":0}[rel];
  kootas.push({name:"Graha Maitri",max:5,score:gm,detail:lA+" + "+lB+" ("+rel.replace("-"," ")+")",meaning:"mental connection and friendship"});

  /* 6. Gana (6) */
  const gnA=ganaOf(nA),gnB=ganaOf(nB);
  let gana=0;
  if(gnA===gnB)gana=6;
  else if((gnA==="deva"&&gnB==="manushya")||(gnB==="deva"&&gnA==="manushya"))gana=5;
  else if((gnA==="deva"&&gnB==="rakshasa")||(gnB==="deva"&&gnA==="rakshasa"))gana=1;
  else gana=0;
  kootas.push({name:"Gana",max:6,score:gana,detail:gnA+" + "+gnB,meaning:"temperament match"});

  /* 7. Bhakoot (7) */
  const d1=((rB-rA+12)%12)+1,d2=((rA-rB+12)%12)+1;
  const badB=(a,b)=>(a===2&&b===12)||(a===12&&b===2)||(a===5&&b===9)||(a===9&&b===5)||(a===6&&b===8)||(a===8&&b===6);
  const bhakoot=badB(d1,d2)?0:7;
  kootas.push({name:"Bhakoot",max:7,score:bhakoot,detail:RASHIS[rA]+" + "+RASHIS[rB]+" ("+d1+"/"+d2+")",meaning:"emotional wavelength and prosperity"});

  /* 8. Nadi (8) */
  const ndA=nadiOf(nA),ndB=nadiOf(nB);
  const nadi=ndA===ndB?0:8;
  kootas.push({name:"Nadi",max:8,score:nadi,detail:ndA+" + "+ndB,meaning:"vital energy and health of the bond"});

  const total=kootas.reduce((s,k)=>s+k.score,0);
  return{
    system:"Ashtakoota (Vedic) · Lahiri ayanamsa",
    moonA:{nakshatra:NAKSHATRAS[nA-1],rashi:RASHIS[rA]},
    moonB:{nakshatra:NAKSHATRAS[nB-1],rashi:RASHIS[rB]},
    kootas,total,max:36,
    verdict:total>=28?"Excellent":total>=21?"Very Good":total>=18?"Good":total>=14?"Average":"Challenging",
  };
}

export function lifePath(dateStr){
  /* Pythagorean: reduce full date; preserve masters 11/22/33 */
  const digits=(dateStr||"").replace(/\D/g,"").split("").map(Number);
  let n=digits.reduce((a,b)=>a+b,0);
  while(n>9&&n!==11&&n!==22&&n!==33){n=String(n).split("").map(Number).reduce((a,b)=>a+b,0);}
  return n;
}
export function numerologyCompat(a,b){
  const groups=[[1,5,7],[2,4,8],[3,6,9]];
  const ra=a>9?a%9||9:a, rb=b>9?b%9||9:b;
  const sameGroup=groups.some(g=>g.includes(ra)&&g.includes(rb));
  const master=a>9||b>9;
  return{lifePathA:a,lifePathB:b,
    harmony:a===b?"identical paths":sameGroup?"same harmony triad":"cross-triad (growth pairing)",
    note:master?"master number present — amplified purpose":"",
  };
}

export function composite(aP,bP){
  const mid=(x,y)=>{let d=((y-x)%360+360)%360;if(d>180)return((y+(360-d)/2)%360);return((x+d/2)%360);};
  const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const out={};
  for(const p of["Sun","Moon","Mercury","Venus","Mars"]){
    if(aP[p]&&bP[p]){const m=mid(aP[p].deg,bP[p].deg);out[p]=signs[Math.floor(m/30)];}
  }
  return out;
}

/* Chemistry axes — scored ONLY from computed aspects, contributors listed */
export function chemistryAxes(aspects){
  const axes={
    Magnetism:{pairs:[["Venus","Mars"],["Mars","Venus"],["Venus","Pluto"],["Pluto","Venus"],["Mars","Pluto"],["Pluto","Mars"],["Sun","Venus"],["Venus","Sun"]],score:0,contributors:[]},
    "Emotional Safety":{pairs:[["Moon","Moon"],["Moon","Venus"],["Venus","Moon"],["Moon","Jupiter"],["Jupiter","Moon"]],score:0,contributors:[]},
    "Mind Meld":{pairs:[["Mercury","Mercury"],["Mercury","Moon"],["Moon","Mercury"],["Mercury","Sun"],["Sun","Mercury"]],score:0,contributors:[]},
    Longevity:{pairs:[["Saturn","Sun"],["Sun","Saturn"],["Saturn","Moon"],["Moon","Saturn"],["Saturn","Venus"],["Venus","Saturn"],["Sun","Moon"],["Moon","Sun"]],score:0,contributors:[]},
  };
  const W={conjunct:3,opposite:2.5,trine:2.2,square:1.8,sextile:1.5};
  for(const a of aspects){
    const m=a.text.match(/'s (\w+) (\w+) .*'s (\w+)/);
    if(!m)continue;
    const[,p1,asp,p2]=m;
    for(const k in axes){
      if(axes[k].pairs.some(([x,y])=>x===p1&&y===p2)){
        let w=W[asp]||1;
        if(k==="Emotional Safety"&&(asp==="square"||asp==="opposite"))w*=0.5;
        if(k==="Longevity"&&(asp==="square"||asp==="opposite"))w*=0.4;
        axes[k].score+=w;
        axes[k].contributors.push(a.text+" ("+a.orb+"°)");
      }
    }
  }
  const out={};
  for(const k in axes){
    out[k]={score:Math.min(10,Math.round(axes[k].score*10/6*10)/10),basedOn:axes[k].contributors};
  }
  return out;
}

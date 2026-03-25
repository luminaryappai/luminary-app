"use client";
import React, { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   LUMINARY — Full Production Client
   ═══════════════════════════════════════════════════ */

var PALETTES = [
  { name:"sage",bg1:"#2A3328",bg2:"#1A2118",accent:"#7A8B6F",text:"#E8EDE5" },
  { name:"rose",bg1:"#3A2228",bg2:"#241418",accent:"#C4727F",text:"#F0E4E6" },
  { name:"gold",bg1:"#3A3222",bg2:"#241E12",accent:"#D4A843",text:"#F0EBE0" },
  { name:"violet",bg1:"#2A2838",bg2:"#1A1628",accent:"#9B8EC4",text:"#E8E4F0" }
];
var C = {bg:"#0B0F14",gold:"#C9A84C",sage:"#7A8B6F",rose:"#C4727F",cream:"#F5F0E8",navy:"#1B2B3A",violet:"#9B8EC4",dim:"#6B7280"};

var CITIES = [
  {n:"Phoenix, AZ, USA",la:33.4484,ln:-112.074,tz:-7},{n:"Scottsdale, AZ, USA",la:33.4942,ln:-111.926,tz:-7},
  {n:"Tucson, AZ, USA",la:32.2226,ln:-110.9747,tz:-7},{n:"Tempe, AZ, USA",la:33.4255,ln:-111.94,tz:-7},
  {n:"Sedona, AZ, USA",la:34.8697,ln:-111.761,tz:-7},{n:"Flagstaff, AZ, USA",la:35.1983,ln:-111.6513,tz:-7},
  {n:"Los Angeles, CA, USA",la:34.0522,ln:-118.2437,tz:-8},{n:"Beverly Hills, CA, USA",la:34.0736,ln:-118.4004,tz:-8},
  {n:"San Francisco, CA, USA",la:37.7749,ln:-122.4194,tz:-8},{n:"San Diego, CA, USA",la:32.7157,ln:-117.1611,tz:-8},
  {n:"Santa Monica, CA, USA",la:34.0195,ln:-118.4912,tz:-8},{n:"Malibu, CA, USA",la:34.0259,ln:-118.7798,tz:-8},
  {n:"West Hollywood, CA, USA",la:34.09,ln:-118.3617,tz:-8},{n:"El Segundo, CA, USA",la:33.9192,ln:-118.4165,tz:-8},
  {n:"Irvine, CA, USA",la:33.6846,ln:-117.8265,tz:-8},{n:"Sacramento, CA, USA",la:38.5816,ln:-121.4944,tz:-8},
  {n:"Oakland, CA, USA",la:37.8044,ln:-122.2712,tz:-8},{n:"Pasadena, CA, USA",la:34.1478,ln:-118.1445,tz:-8},
  {n:"New York, NY, USA",la:40.7128,ln:-74.006,tz:-5},{n:"Brooklyn, NY, USA",la:40.6782,ln:-73.9442,tz:-5},
  {n:"Manhattan, NY, USA",la:40.7831,ln:-73.9712,tz:-5},{n:"Queens, NY, USA",la:40.7282,ln:-73.7949,tz:-5},
  {n:"Chicago, IL, USA",la:41.8781,ln:-87.6298,tz:-6},{n:"Aurora, IL, USA",la:41.7606,ln:-88.3201,tz:-6},
  {n:"Naperville, IL, USA",la:41.7508,ln:-88.1535,tz:-6},
  {n:"Boston, MA, USA",la:42.3601,ln:-71.0589,tz:-5},{n:"Northampton, MA, USA",la:42.3251,ln:-72.6412,tz:-5},
  {n:"Cambridge, MA, USA",la:42.3736,ln:-71.1097,tz:-5},
  {n:"Dallas, TX, USA",la:32.7767,ln:-96.797,tz:-6},{n:"Houston, TX, USA",la:29.7604,ln:-95.3698,tz:-6},
  {n:"Austin, TX, USA",la:30.2672,ln:-97.7431,tz:-6},{n:"San Antonio, TX, USA",la:29.4241,ln:-98.4936,tz:-6},
  {n:"Miami, FL, USA",la:25.7617,ln:-80.1918,tz:-5},{n:"Tampa, FL, USA",la:27.9506,ln:-82.4572,tz:-5},
  {n:"Orlando, FL, USA",la:28.5383,ln:-81.3792,tz:-5},{n:"Fort Lauderdale, FL, USA",la:26.1224,ln:-80.1373,tz:-5},
  {n:"Denver, CO, USA",la:39.7392,ln:-104.9903,tz:-7},{n:"Boulder, CO, USA",la:40.015,ln:-105.2705,tz:-7},
  {n:"Seattle, WA, USA",la:47.6062,ln:-122.3321,tz:-8},{n:"Portland, OR, USA",la:45.5152,ln:-122.6784,tz:-8},
  {n:"Atlanta, GA, USA",la:33.749,ln:-84.388,tz:-5},{n:"Nashville, TN, USA",la:36.1627,ln:-86.7816,tz:-6},
  {n:"Las Vegas, NV, USA",la:36.1699,ln:-115.1398,tz:-8},{n:"Philadelphia, PA, USA",la:39.9526,ln:-75.1652,tz:-5},
  {n:"Washington, DC, USA",la:38.9072,ln:-77.0369,tz:-5},{n:"Minneapolis, MN, USA",la:44.9778,ln:-93.265,tz:-6},
  {n:"Charlotte, NC, USA",la:35.2271,ln:-80.8431,tz:-5},{n:"Honolulu, HI, USA",la:21.3069,ln:-157.8583,tz:-10},
  {n:"Detroit, MI, USA",la:42.3314,ln:-83.0458,tz:-5},{n:"New Orleans, LA, USA",la:29.9511,ln:-90.0715,tz:-6},
  {n:"Baltimore, MD, USA",la:39.2904,ln:-76.6122,tz:-5},{n:"Salt Lake City, UT, USA",la:40.7608,ln:-111.891,tz:-7},
  {n:"Indianapolis, IN, USA",la:39.7684,ln:-86.1581,tz:-5},{n:"Kansas City, MO, USA",la:39.0997,ln:-94.5786,tz:-6},
  {n:"St. Louis, MO, USA",la:38.627,ln:-90.1994,tz:-6},{n:"Charleston, SC, USA",la:32.7765,ln:-79.9311,tz:-5},
  {n:"Santa Fe, NM, USA",la:35.687,ln:-105.9378,tz:-7},{n:"Boise, ID, USA",la:43.615,ln:-116.2023,tz:-7},
  {n:"Toronto, Canada",la:43.6532,ln:-79.3832,tz:-5},{n:"Vancouver, Canada",la:49.2827,ln:-123.1207,tz:-8},
  {n:"Montreal, Canada",la:45.5017,ln:-73.5673,tz:-5},{n:"Calgary, Canada",la:51.0447,ln:-114.0719,tz:-7},
  {n:"Mexico City, Mexico",la:19.4326,ln:-99.1332,tz:-6},{n:"Cancun, Mexico",la:21.1619,ln:-86.8515,tz:-5},
  {n:"London, UK",la:51.5074,ln:-0.1278,tz:0},{n:"Manchester, UK",la:53.4808,ln:-2.2426,tz:0},
  {n:"Edinburgh, UK",la:55.9533,ln:-3.1883,tz:0},
  {n:"Paris, France",la:48.8566,ln:2.3522,tz:1},{n:"Nice, France",la:43.7102,ln:7.262,tz:1},
  {n:"Berlin, Germany",la:52.52,ln:13.405,tz:1},{n:"Munich, Germany",la:48.1351,ln:11.582,tz:1},
  {n:"Amsterdam, Netherlands",la:52.3676,ln:4.9041,tz:1},{n:"Rome, Italy",la:41.9028,ln:12.4964,tz:1},
  {n:"Milan, Italy",la:45.4642,ln:9.19,tz:1},{n:"Florence, Italy",la:43.7696,ln:11.2558,tz:1},
  {n:"Madrid, Spain",la:40.4168,ln:-3.7038,tz:1},{n:"Barcelona, Spain",la:41.3874,ln:2.1686,tz:1},
  {n:"Lisbon, Portugal",la:38.7223,ln:-9.1393,tz:0},{n:"Dublin, Ireland",la:53.3498,ln:-6.2603,tz:0},
  {n:"Vienna, Austria",la:48.2082,ln:16.3738,tz:1},{n:"Zurich, Switzerland",la:47.3769,ln:8.5417,tz:1},
  {n:"Prague, Czech Republic",la:50.0755,ln:14.4378,tz:1},{n:"Budapest, Hungary",la:47.4979,ln:19.0402,tz:1},
  {n:"Copenhagen, Denmark",la:55.6761,ln:12.5683,tz:1},{n:"Stockholm, Sweden",la:59.3293,ln:18.0686,tz:1},
  {n:"Athens, Greece",la:37.9838,ln:23.7275,tz:2},{n:"Istanbul, Turkey",la:41.0082,ln:28.9784,tz:3},
  {n:"Tel Aviv, Israel",la:32.0853,ln:34.7818,tz:2},{n:"Jerusalem, Israel",la:31.7683,ln:35.2137,tz:2},
  {n:"Haifa, Israel",la:32.794,ln:34.9896,tz:2},
  {n:"Dubai, UAE",la:25.2048,ln:55.2708,tz:4},{n:"Riyadh, Saudi Arabia",la:24.7136,ln:46.6753,tz:3},
  {n:"Beirut, Lebanon",la:33.8938,ln:35.5018,tz:2},{n:"Tehran, Iran",la:35.6892,ln:51.389,tz:3.5},
  {n:"Tokyo, Japan",la:35.6762,ln:139.6503,tz:9},{n:"Osaka, Japan",la:34.6937,ln:135.5023,tz:9},
  {n:"Seoul, South Korea",la:37.5665,ln:126.978,tz:9},
  {n:"Beijing, China",la:39.9042,ln:116.4074,tz:8},{n:"Shanghai, China",la:31.2304,ln:121.4737,tz:8},
  {n:"Hong Kong",la:22.3193,ln:114.1694,tz:8},{n:"Taipei, Taiwan",la:25.033,ln:121.5654,tz:8},
  {n:"Singapore",la:1.3521,ln:103.8198,tz:8},{n:"Bangkok, Thailand",la:13.7563,ln:100.5018,tz:7},
  {n:"Mumbai, India",la:19.076,ln:72.8777,tz:5.5},{n:"New Delhi, India",la:28.6139,ln:77.209,tz:5.5},
  {n:"Bangalore, India",la:12.9716,ln:77.5946,tz:5.5},{n:"Bali, Indonesia",la:-8.3405,ln:115.092,tz:8},
  {n:"Cairo, Egypt",la:30.0444,ln:31.2357,tz:2},{n:"Cape Town, South Africa",la:-33.9249,ln:18.4241,tz:2},
  {n:"Nairobi, Kenya",la:-1.2921,ln:36.8219,tz:3},{n:"Marrakech, Morocco",la:31.6295,ln:-7.9811,tz:1},
  {n:"Sao Paulo, Brazil",la:-23.5505,ln:-46.6333,tz:-3},{n:"Buenos Aires, Argentina",la:-34.6037,ln:-58.3816,tz:-3},
  {n:"Sydney, Australia",la:-33.8688,ln:151.2093,tz:10},{n:"Melbourne, Australia",la:-37.8136,ln:144.9631,tz:10},
  {n:"Auckland, New Zealand",la:-36.8485,ln:174.7633,tz:12}
];

var SIGN_NAMES=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
var SIGN_EL=["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
var SIGN_MOD=["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];

function ZodiacGlyph({sign,size=28,color="#C9A84C"}){var paths={Aries:"M12 2C8 8 6 14 6 20M12 2C16 8 18 14 18 20M8 8h8",Taurus:"M6 8a6 6 0 1 0 12 0M12 8v12M7 14h10",Gemini:"M6 4h12M6 20h12M8 4v16M16 4v16",Cancer:"M4 12a8 4 0 0 1 16 0M20 12a8 4 0 0 1-16 0M8 10a2 2 0 1 1 0 .1M16 14a2 2 0 1 1 0 .1",Leo:"M8 16a4 4 0 1 1 4-4c0 4 4 4 4 8M16 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0",Virgo:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v12c0 4 3 4 3 0V8l3 6",Libra:"M4 16h16M12 16V6M6 6c0-3 3-4 6-4s6 1 6 4",Scorpio:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v16l4-4",Sagittarius:"M4 20L20 4M20 4h-8M20 4v8M8 16l-4 4",Capricorn:"M4 4v12c0 6 4 6 4 0V8c0 4 4 8 8 8a4 4 0 0 0 0-8",Aquarius:"M2 8l4 4 4-4 4 4 4-4M2 14l4 4 4-4 4 4 4-4",Pisces:"M8 2v20M16 2v20M4 12h16"};return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d={paths[sign]||paths.Aries}/></svg>);}

/* ─── ASTRO ENGINE ─── */
function jd(y,m,d,h){if(m<=2){y--;m+=12;}var A=Math.floor(y/100);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+(2-A+Math.floor(A/4))-1524.5;}
function T(j){return(j-2451545)/36525;}
function nd(d){var r=d%360;return r<0?r+360:r;}
function sunL(t){var L=nd(280.46646+36000.76983*t),M=nd(357.52911+35999.05029*t),Mr=M*Math.PI/180;return nd(L+(1.914602-.004817*t)*Math.sin(Mr)+(.019993-.000101*t)*Math.sin(2*Mr)+.000289*Math.sin(3*Mr)-.00569-.00478*Math.sin(nd(125.04-1934.136*t)*Math.PI/180));}
function moonL(t){var Lp=nd(218.3165+481267.8813*t),D=nd(297.8502+445267.1115*t)*Math.PI/180,M=nd(357.5291+35999.0503*t)*Math.PI/180,Mp=nd(134.9634+477198.8676*t)*Math.PI/180,F=nd(93.272+483202.0175*t)*Math.PI/180;return nd(Lp+6.289*Math.sin(Mp)+1.274*Math.sin(2*D-Mp)+.658*Math.sin(2*D)+.214*Math.sin(2*Mp)-.186*Math.sin(M)-.114*Math.sin(2*F)+.059*Math.sin(2*D-2*Mp)+.057*Math.sin(2*D-M-Mp)+.053*Math.sin(2*D+Mp)+.046*Math.sin(2*D-M)-.041*Math.sin(M-Mp)-.035*Math.sin(D)-.031*Math.sin(M+Mp));}
function plL(p,t){var e={Mercury:[252.2509,149472.6746],Venus:[181.9798,58517.8157],Mars:[355.433,19140.2993],Jupiter:[34.3515,3034.9057],Saturn:[50.0774,1222.1138],Uranus:[314.055,428.4677],Neptune:[304.349,218.4862],Pluto:[238.929,145.2078]};var v=e[p];return v?nd(v[0]+v[1]*t):0;}
function ascL(j2,lat,lng){var t2=T(j2),G=nd(280.46061837+360.98564736629*(j2-2451545)+.000387933*t2*t2),L=nd(G+lng),ob=(23.4393-.013*t2)*Math.PI/180;return nd(Math.atan2(-Math.cos(L*Math.PI/180),Math.sin(L*Math.PI/180)*Math.cos(ob)+Math.tan(lat*Math.PI/180)*Math.sin(ob))*180/Math.PI);}
function getSign(d){return SIGN_NAMES[Math.floor(d/30)];}
function getSD(d){return Math.floor(d%30);}
function fullChart(y,m,d,h,lat,lng){var j2=jd(y,m,d,h),t2=T(j2);return{Sun:sunL(t2),Moon:moonL(t2),Mercury:plL("Mercury",t2),Venus:plL("Venus",t2),Mars:plL("Mars",t2),Jupiter:plL("Jupiter",t2),Saturn:plL("Saturn",t2),Uranus:plL("Uranus",t2),Neptune:plL("Neptune",t2),Pluto:plL("Pluto",t2),Ascendant:ascL(j2,lat,lng)};}
function nowTransits(){var n=new Date(),t2=T(jd(n.getFullYear(),n.getMonth()+1,n.getDate(),n.getHours()+n.getMinutes()/60));return{Sun:sunL(t2),Moon:moonL(t2),Mercury:plL("Mercury",t2),Venus:plL("Venus",t2),Mars:plL("Mars",t2),Jupiter:plL("Jupiter",t2),Saturn:plL("Saturn",t2),Uranus:plL("Uranus",t2),Neptune:plL("Neptune",t2),Pluto:plL("Pluto",t2)};}
function aspects(natal,trans){var A=[["conjunction",0,10],["sextile",60,6],["square",90,8],["trine",120,8],["opposition",180,10]],W={Sun:10,Moon:8,Mercury:5,Venus:6,Mars:7,Jupiter:6,Saturn:7,Uranus:4,Neptune:3,Pluto:5},nk=Object.keys(natal),tk=Object.keys(trans),found=[],sc=0;for(var i=0;i<tk.length;i++)for(var j=0;j<nk.length;j++){var df=Math.abs(trans[tk[i]]-natal[nk[j]]);if(df>180)df=360-df;for(var k=0;k<A.length;k++){var ob=Math.abs(df-A[k][1]);if(ob<=A[k][2]){var ti=1-ob/A[k][2],w=((W[tk[i]]||4)+(W[nk[j]]||4))/2;sc+=ti*w;found.push({t:tk[i],n:nk[j],a:A[k][0],o:Math.round(ob*10)/10});}}}return{list:found,intensity:Math.min(10,Math.max(1,Math.round(sc/(tk.length*nk.length*.5)*10)))};}
function chartTxt(c){return Object.keys(c).map(function(k){return k+": "+getSign(c[k])+" "+getSD(c[k])+"deg";}).join(", ");}
function weekRange(){var n=new Date(),d=n.getDay(),df=n.getDate()-d+(d===0?-6:1),m=new Date(n);m.setDate(df);var s=new Date(m);s.setDate(m.getDate()+6);var ms=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return ms[m.getMonth()]+" "+m.getDate()+" - "+ms[s.getMonth()]+" "+s.getDate()+", "+s.getFullYear();}
function curMonth(){return["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()];}
function nxtMonth(){return["January","February","March","April","May","June","July","August","September","October","November","December"][(new Date().getMonth()+1)%12];}
function curSeason(){var m=new Date().getMonth();return m>=2&&m<=4?"Spring":m>=5&&m<=7?"Summer":m>=8&&m<=10?"Autumn":"Winter";}

function buildPrompt(bd,nc,ct,ar,ans){
  var cT=chartTxt(nc),tT=chartTxt(ct),sn=getSign(nc.Sun),mn=getSign(nc.Moon),rn=getSign(nc.Ascendant),si=SIGN_NAMES.indexOf(sn),el=SIGN_EL[si],mo=SIGN_MOD[si];
  var topA=ar.list.slice(0,8).map(function(a){return"Transit "+a.t+" "+a.a+" Natal "+a.n+" (orb "+a.o+"deg)";}).join("; ");
  return "OUTPUT ONLY RAW JSON.\n\nGifted astrologer creating horoscope slides for "+bd.name+".\n\nNATAL: "+cT+"\nSun: "+sn+" ("+el+", "+mo+"). Moon: "+mn+". Rising: "+rn+".\nTRANSITS: "+tT+"\nASPECTS: "+topA+"\nIntensity: "+ar.intensity+"/10\nKEY: Mercury direct 8deg Pisces (Mar 20 2026), Spring Equinox, Jupiter Cancer, Saturn Pisces.\nUSER: Focus="+ans.focus+". Energy="+ans.energy+". Seeking="+ans.seeking+".\n\nWarm but authoritative. Mention specific aspects. Reference Moon emotional needs, Rising presentation. Mantras reference "+el+" element and "+mo+" modality.\n\nJSON:\n{\"weekly\":[{\"title\":\"YOUR WEEK\",\"subtitle\":\""+weekRange()+"\",\"body\":\"3-4 sentences\"},{\"title\":\"MIDWEEK\",\"subtitle\":\"Wed-Thu\",\"body\":\"3-4 sentences\"},{\"title\":\"WEEKEND\",\"subtitle\":\"Fri-Sun\",\"body\":\"3-4 sentences\"},{\"title\":\"YOUR MANTRA\",\"subtitle\":\"This Weeks Guiding Light\",\"body\":\"one mantra\"}],\"monthly\":[{\"title\":\""+curMonth().toUpperCase()+"\",\"subtitle\":\"Monthly Overview\",\"body\":\"3-4 sentences\"},{\"title\":\""+nxtMonth().toUpperCase()+"\",\"subtitle\":\"Looking Ahead\",\"body\":\"3-4 sentences\"},{\"title\":\"THE SEASON\",\"subtitle\":\""+curSeason()+" Forecast\",\"body\":\"3-4 sentences\"},{\"title\":\"YOUR MANTRA\",\"subtitle\":\""+curSeason()+" Guiding Light\",\"body\":\"one mantra\"}]}\n\nOUTPUT ONLY RAW JSON.";
}

/* ═══════════ STYLES ═══════════ */
var gs = {page:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"Georgia, serif"},
  label:{fontSize:11,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:6,display:"block",fontFamily:"system-ui, sans-serif"},
  input:{width:"100%",padding:"12px 14px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:4,color:C.cream,fontSize:15,fontFamily:"Georgia, serif",outline:"none",boxSizing:"border-box"},
  btn:{border:"none",borderRadius:4,fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"system-ui, sans-serif"},
  brand:{fontSize:10,letterSpacing:6,color:C.gold}};

/* ═══════════ SCREENS ═══════════ */

function Landing({onStart,onAdmin}){
  var tapRef=useRef(0),timerRef=useRef(null);
  function starTap(){tapRef.current++;if(timerRef.current)clearTimeout(timerRef.current);if(tapRef.current>=5){tapRef.current=0;onAdmin();return;}timerRef.current=setTimeout(function(){tapRef.current=0;},2000);}
  return(<div style={{...gs.page,justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 20%, #1B2B3A 0%, #0B0F14 70%)"}}>
    <div onClick={starTap} style={{...gs.brand,marginBottom:20,cursor:"default",userSelect:"none",padding:10}}>✦ ✦ ✦</div>
    <h1 style={{fontSize:48,color:C.cream,fontWeight:"normal",letterSpacing:8,margin:0,textTransform:"uppercase"}}>LUMINARY</h1>
    <p style={{fontSize:14,color:C.gold,letterSpacing:3,marginTop:8,textTransform:"uppercase",fontFamily:"system-ui, sans-serif"}}>Personalized Astrology</p>
    <div style={{width:60,height:1,background:C.gold,opacity:.3,margin:"28px 0"}}/>
    <p style={{fontSize:15,color:C.cream,opacity:.6,maxWidth:320,textAlign:"center",lineHeight:1.8,marginBottom:40}}>AI-crafted horoscope slides based on your exact natal chart and current planetary transits.</p>
    <button onClick={onStart} style={{...gs.btn,background:"none",border:"1px solid "+C.gold,color:C.gold,padding:"14px 40px",letterSpacing:3}}>Begin Your Reading</button>
    <p style={{marginTop:48,fontSize:11,color:C.dim,letterSpacing:2,fontFamily:"system-ui, sans-serif"}}>✦ @alwaysbbuilding5 ✦</p>
  </div>);
}

function Input({onSubmit}){
  var [name,setName]=useState(""),[ig,setIg]=useState(""),[dt,setDt]=useState(""),[tm,setTm]=useState("");
  var [noTm,setNoTm]=useState(false),[cq,setCq]=useState(""),[sel,setSel]=useState(null),[show,setShow]=useState(false);
  function filtered(){if(!cq||cq.length<2)return[];var q=cq.toLowerCase(),r=[];for(var i=0;i<CITIES.length;i++){if(CITIES[i].n.toLowerCase().indexOf(q)!==-1)r.push(CITIES[i]);if(r.length>=8)break;}return r;}
  function pickCity(c){setSel(c);setCq(c.n);setShow(false);}
  function submit(){if(!name||!dt||!sel)return;var p=dt.split("-"),hr=(noTm?12:parseFloat((tm||"12:00").split(":")[0])+parseFloat((tm||"12:00").split(":")[1])/60);onSubmit({name,ig,year:+p[0],month:+p[1],day:+p[2],hour:hr-sel.tz,localHour:hr,lat:sel.la,lng:sel.ln,tz:sel.tz,city:sel.n,unknownTime:noTm});}
  var f=filtered();
  return(<div style={{...gs.page,padding:"40px 20px",background:"radial-gradient(ellipse at 50% 10%, #1B2B3A 0%, #0B0F14 60%)"}}>
    <p style={gs.brand}>✦ LUMINARY ✦</p>
    <h2 style={{fontSize:24,color:C.cream,fontWeight:"normal",margin:"16px 0 8px",letterSpacing:2}}>Your Birth Data</h2>
    <p style={{fontSize:13,color:C.dim,marginBottom:32,fontFamily:"system-ui, sans-serif"}}>The stars need to know where you began</p>
    <div style={{width:"100%",maxWidth:360}}>
      <div style={{marginBottom:20}}><label style={gs.label}>First Name</label><input style={gs.input} placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={gs.label}>Instagram Handle</label><input style={gs.input} placeholder="@yourusername" value={ig} onChange={e=>setIg(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={gs.label}>Birth Date</label><input type="date" style={gs.input} value={dt} onChange={e=>setDt(e.target.value)}/></div>
      <div style={{marginBottom:8}}><label style={gs.label}>Birth Time</label><input type="time" style={{...gs.input,opacity:noTm?.3:1}} disabled={noTm} value={tm} onChange={e=>setTm(e.target.value)}/></div>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="nt" onChange={e=>setNoTm(e.target.checked)} style={{accentColor:C.gold}}/><label htmlFor="nt" style={{fontSize:12,color:C.dim,fontFamily:"system-ui, sans-serif",cursor:"pointer"}}>I don't know my birth time</label></div>
      <div style={{marginBottom:28,position:"relative"}}>
        <label style={gs.label}>Birth City</label>
        <input style={gs.input} placeholder="Start typing a city..." value={cq} onChange={e=>{setCq(e.target.value);setSel(null);setShow(true);}} onFocus={()=>{if(cq.length>=2)setShow(true);}}/>
        {sel&&<p style={{fontSize:11,color:C.sage,marginTop:4,fontFamily:"system-ui, sans-serif"}}>Selected: {sel.n}</p>}
        {show&&f.length>0&&!sel&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#131920",border:"1px solid #1E2A36",borderRadius:4,maxHeight:240,overflowY:"auto",zIndex:100,marginTop:4}}>{f.map((c,i)=><div key={i} onClick={()=>pickCity(c)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #1E2A36",color:C.cream,fontSize:14,fontFamily:"system-ui, sans-serif"}}>{c.n}</div>)}</div>}
      </div>
      <button onClick={submit} style={{...gs.btn,width:"100%",padding:"14px",background:sel?C.gold:"#333",color:sel?"#0B0F14":"#666"}}>Continue</button>
    </div>
  </div>);
}

function Questions({onSubmit}){
  var QS=[{id:"focus",q:"What area needs the most attention right now?",o:["Career","Love","Health","Growth"]},{id:"energy",q:"How would you describe your energy lately?",o:["Charged","Steady","Foggy","Rebuilding"]},{id:"seeking",q:"What are you most seeking?",o:["Timing","Confirmation","Direction","Comfort"]}];
  var [step,setStep]=useState(0),[ans,setAns]=useState({});
  function pick(id,v){var n={...ans,[id]:v};setAns(n);if(step<2)setTimeout(()=>setStep(step+1),300);else setTimeout(()=>onSubmit(n),300);}
  var q=QS[step];
  return(<div style={{...gs.page,padding:"40px 20px",background:"radial-gradient(ellipse at 50% 30%, #1B2B3A 0%, #0B0F14 60%)"}}>
    <p style={gs.brand}>✦ LUMINARY ✦</p>
    <div style={{display:"flex",gap:8,margin:"24px 0 40px"}}>{QS.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?C.gold:i<step?C.sage:"#1E2A36",transition:"all .3s"}}/>)}</div>
    <h2 style={{fontSize:22,color:C.cream,fontWeight:"normal",textAlign:"center",marginBottom:36,maxWidth:320,lineHeight:1.5}}>{q.q}</h2>
    <div style={{width:"100%",maxWidth:320}}>{q.o.map(o=>{var s=ans[q.id]===o;return<button key={o} onClick={()=>pick(q.id,o)} style={{width:"100%",padding:16,marginBottom:12,background:s?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:"1px solid "+(s?C.gold:"#1E2A36"),borderRadius:6,color:s?C.gold:C.cream,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"Georgia, serif"}}>{o}</button>;})}</div>
  </div>);
}

function Loading({name,onDone}){
  var [ph,setPh]=useState(0);var msgs=["Calculating natal positions...","Reading transits for "+name+"...","Channeling the stars..."];
  useEffect(()=>{var t1=setTimeout(()=>setPh(1),2500),t2=setTimeout(()=>setPh(2),5500);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  return(<div style={{...gs.page,justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%, #1B2B3A 0%, #0B0F14 70%)"}}>
    <div style={{width:64,height:64,border:"2px solid transparent",borderTopColor:C.gold,borderRadius:"50%",animation:"ls 1.2s linear infinite",marginBottom:32}}/>
    <style>{"@keyframes ls{to{transform:rotate(360deg)}}"}</style>
    <p style={{fontSize:16,color:C.cream,opacity:.9,marginBottom:8,textAlign:"center"}}>{msgs[ph]}</p>
    <p style={{fontSize:12,color:C.dim,fontFamily:"system-ui, sans-serif"}}>This takes 10-15 seconds</p>
  </div>);
}

function ErrScreen({message,onRetry}){
  return(<div style={{...gs.page,justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%, #2A1818 0%, #0B0F14 70%)"}}>
    <p style={{...gs.brand,color:C.rose,marginBottom:20}}>✦ LUMINARY ✦</p>
    <h2 style={{fontSize:22,color:C.cream,fontWeight:"normal",marginBottom:12}}>The Stars Are Busy</h2>
    <p style={{fontSize:13,color:C.dim,maxWidth:320,textAlign:"center",lineHeight:1.7,marginBottom:28,fontFamily:"system-ui, sans-serif"}}>{message||"Something went wrong."}</p>
    <button onClick={onRetry} style={{...gs.btn,background:"none",border:"1px solid "+C.gold,color:C.gold,padding:"12px 36px",letterSpacing:2}}>Try Again</button>
  </div>);
}

function Chart({chart,intensity,name,onContinue}){
  var big=[{l:"Sun",d:chart.Sun},{l:"Moon",d:chart.Moon},{l:"Rising",d:chart.Ascendant}];
  var pls=["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  return(<div style={{...gs.page,padding:"32px 20px",background:"radial-gradient(ellipse at 50% 15%, #1B2B3A 0%, #0B0F14 60%)"}}>
    <p style={{...gs.brand,marginBottom:20}}>✦ LUMINARY ✦</p>
    <h2 style={{fontSize:24,color:C.cream,fontWeight:"normal",marginBottom:4,letterSpacing:1}}>{name}'s Natal Chart</h2>
    <p style={{fontSize:12,color:C.dim,marginBottom:28,fontFamily:"system-ui, sans-serif"}}>Transit Intensity: {intensity}/10</p>
    <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>{big.map(i=><div key={i.l} style={{background:"rgba(255,255,255,.03)",border:"1px solid #1E2A36",borderRadius:8,padding:"16px 20px",textAlign:"center",minWidth:100}}><p style={{fontSize:11,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:"system-ui, sans-serif"}}>{i.l}</p><ZodiacGlyph sign={getSign(i.d)} size={32}/><p style={{fontSize:16,color:C.cream,marginTop:6}}>{getSign(i.d)}</p><p style={{fontSize:12,color:C.gold}}>{getSD(i.d)}°</p></div>)}</div>
    <div style={{width:"100%",maxWidth:380,background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:8,padding:16,marginBottom:28}}>
      <p style={{fontSize:11,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontFamily:"system-ui, sans-serif"}}>Planetary Positions</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>{pls.map(p=>{var d=chart[p];return<div key={p} style={{display:"flex",alignItems:"center",gap:8}}><ZodiacGlyph sign={getSign(d)} size={18} color={C.sage}/><span style={{fontSize:13,color:C.dim,fontFamily:"system-ui, sans-serif",minWidth:60}}>{p}</span><span style={{fontSize:13,color:C.cream}}>{getSign(d)} {getSD(d)}°</span></div>;})}</div>
    </div>
    <div style={{width:"100%",maxWidth:380,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,padding:16,marginBottom:32,textAlign:"center"}}>
      <p style={{fontSize:11,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:"system-ui, sans-serif"}}>Transit Intensity Score</p>
      <p style={{fontSize:48,color:C.gold,fontWeight:"normal",margin:0}}>{intensity}</p>
      <p style={{fontSize:12,color:C.dim,fontFamily:"system-ui, sans-serif"}}>out of 10</p>
    </div>
    <button onClick={onContinue} style={{...gs.btn,background:C.gold,color:"#0B0F14",padding:"14px 36px"}}>See Your Forecast →</button>
  </div>);
}

function Slides({name,sunSign,intensity,weekly,monthly,onChat,onShare}){
  var [tab,setTab]=useState("weekly"),[idx,setIdx]=useState(0);
  var touchRef=useRef(0);
  var slides=tab==="weekly"?weekly:monthly;
  function changeTab(t){setTab(t);setIdx(0);}
  function prev(){if(idx>0)setIdx(idx-1);}
  function next(){if(idx<slides.length-1)setIdx(idx+1);}
  var sl=slides[idx],pal=PALETTES[idx%4],isM=sl.title.toUpperCase().includes("MANTRA");
  return(<div style={{...gs.page,padding:"24px 16px",background:"#0B0F14"}}>
    <div style={{display:"flex",width:"100%",maxWidth:400,marginBottom:20}}>{["weekly","monthly"].map(t=>{var a=tab===t;return<button key={t} onClick={()=>changeTab(t)} style={{flex:1,padding:"14px 0",fontSize:12,letterSpacing:2,textTransform:"uppercase",background:a?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:a?"2px solid "+C.gold:"1px solid #1E2A36",color:a?C.gold:C.dim,cursor:"pointer",fontFamily:"system-ui, sans-serif",fontWeight:a?600:400,borderRadius:t==="weekly"?"6px 0 0 6px":"0 6px 6px 0"}}>{t}</button>;})}</div>
    <div style={{position:"relative",width:"100%",maxWidth:400}} onTouchStart={e=>{if(e.touches[0])touchRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(e.changedTouches[0]){var d=e.changedTouches[0].clientX-touchRef.current;if(d>50)prev();if(d<-50)next();}}}>
      <div onClick={prev} style={{position:"absolute",left:-4,top:0,width:60,height:"100%",zIndex:10,cursor:idx>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to right, rgba(0,0,0,.3), transparent)"}}>{idx>0&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M20 4L4 24L20 44" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" style={{opacity:.6}}/></svg>}</div>
      <div onClick={next} style={{position:"absolute",right:-4,top:0,width:60,height:"100%",zIndex:10,cursor:idx<slides.length-1?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to left, rgba(0,0,0,.3), transparent)"}}>{idx<slides.length-1&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M4 4L20 24L4 44" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" style={{opacity:.6}}/></svg>}</div>
      <div style={{minHeight:500,borderRadius:16,padding:"32px 28px",background:`linear-gradient(160deg, ${pal.bg1} 0%, ${pal.bg2} 100%)`,boxShadow:`0 0 40px rgba(0,0,0,.5), 0 0 80px ${pal.accent}11`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",position:"relative"}}>
        <p style={{fontSize:10,letterSpacing:6,color:pal.accent,opacity:.7,textAlign:"center",fontFamily:"system-ui, sans-serif"}}>✦ LUMINARY ✦</p>
        {!isM&&<div style={{position:"absolute",top:24,right:24,width:36,height:36,borderRadius:"50%",border:`1.5px solid ${pal.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:pal.accent,fontFamily:"system-ui, sans-serif",fontWeight:600}}>{intensity}</div>}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"16px 0"}}>
          <h3 style={{fontSize:isM?18:20,color:pal.text,letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontWeight:"normal"}}>{sl.title}</h3>
          {sl.subtitle&&<p style={{fontSize:12,color:pal.accent,letterSpacing:1,marginBottom:20,fontFamily:"system-ui, sans-serif"}}>{sl.subtitle}</p>}
          <p style={{fontSize:isM?20:14,color:pal.text,lineHeight:1.8,maxWidth:320,opacity:.9,fontStyle:isM?"italic":"normal"}}>{sl.body}</p>
        </div>
        <div style={{textAlign:"center"}}><p style={{fontSize:12,color:pal.accent,marginBottom:4}}>{name} ✦ {sunSign}</p><p style={{fontSize:10,color:pal.text,opacity:.3,letterSpacing:2,fontFamily:"system-ui, sans-serif"}}>✦ @alwaysbbuilding5 ✦</p></div>
      </div>
    </div>
    <div style={{display:"flex",gap:8,marginTop:16}}>{slides.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?24:10,height:10,borderRadius:5,background:i===idx?C.gold:"#1E2A36",transition:"all .3s",cursor:"pointer"}}/>)}</div>
    <p style={{fontSize:11,color:C.dim,marginTop:8,fontFamily:"system-ui, sans-serif"}}>{idx+1} of {slides.length}</p>
    <div style={{display:"flex",gap:12,marginTop:20}}>
      <button onClick={onChat} style={{...gs.btn,background:"rgba(201,168,76,.1)",border:"1px solid "+C.gold,color:C.gold,padding:"10px 24px",fontSize:12,letterSpacing:2}}>Ask Luminary AI</button>
      <button onClick={onShare} style={{...gs.btn,background:"rgba(122,139,111,.1)",border:"1px solid "+C.sage,color:C.sage,padding:"10px 24px",fontSize:12,letterSpacing:2}}>Share</button>
    </div>
  </div>);
}

function ChatScreen({chartContext,name,onBack}){
  var [msgs,setMsgs]=useState([{role:"assistant",text:"Welcome, "+name+". I have your complete natal chart before me. What would you like to explore?"}]);
  var [input,setInput]=useState("");var [loading,setLoading]=useState(false);
  function send(){
    if(!input.trim()||loading)return;var userMsg=input.trim();setInput("");
    var updated=[...msgs,{role:"user",text:userMsg}];setMsgs(updated);setLoading(true);
    var apiMsgs=[{role:"user",content:"You are Luminary, a warm but authoritative astrologer. Chart:\n"+chartContext+"\nStay in character. Under 100 words. Reference specific placements."}];
    updated.forEach(function(m){apiMsgs.push({role:m.role==="user"?"user":"assistant",content:m.text});});
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:apiMsgs})})
    .then(r=>r.json()).then(data=>{setMsgs(prev=>[...prev,{role:"assistant",text:data.reply||data.error||"The stars are quiet."}]);setLoading(false);})
    .catch(()=>{setMsgs(prev=>[...prev,{role:"assistant",text:"Connection interrupted. Try again."}]);setLoading(false);});
  }
  return(<div style={{minHeight:"100vh",background:"#0B0F14",display:"flex",flexDirection:"column",fontFamily:"Georgia, serif"}}>
    <div style={{padding:"16px 20px",borderBottom:"1px solid #1E2A36",display:"flex",alignItems:"center",gap:12}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,cursor:"pointer",fontFamily:"system-ui, sans-serif"}}>← Back</button>
      <span style={{fontSize:10,letterSpacing:4,color:C.gold,fontFamily:"system-ui, sans-serif"}}>✦ LUMINARY AI ✦</span>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>{msgs.map((m,i)=>{var u=m.role==="user";return<div key={i} style={{marginBottom:16,textAlign:u?"right":"left"}}><div style={{display:"inline-block",maxWidth:"80%",padding:"12px 16px",borderRadius:12,fontSize:14,lineHeight:1.7,background:u?"rgba(201,168,76,.12)":"rgba(255,255,255,.04)",color:u?C.gold:C.cream,border:"1px solid "+(u?"rgba(201,168,76,.2)":"#1E2A36")}}>{m.text}</div></div>;})}
      {loading&&<div style={{marginBottom:16}}><div style={{display:"inline-block",padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid #1E2A36",color:C.dim,fontSize:13,fontStyle:"italic"}}>Reading the stars...</div></div>}
    </div>
    <div style={{padding:"12px 16px",borderTop:"1px solid #1E2A36",display:"flex",gap:8}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,...gs.input,borderRadius:6}}/>
      <button onClick={send} style={{...gs.btn,background:C.gold,color:"#0B0F14",padding:"12px 20px",fontSize:12}}>Send</button>
    </div>
  </div>);
}

/* ═══════════ MAIN APP ═══════════ */
export default function Luminary(){
  var [scr,setScr]=useState("landing"),[bd,setBd]=useState(null),[ans,setAns]=useState(null);
  var [chart,setChart]=useState(null),[trans,setTrans]=useState(null),[intensity,setIntensity]=useState(5);
  var [weekly,setWeekly]=useState([]),[monthly,setMonthly]=useState([]),[err,setErr]=useState(null);
  var aspectsRef=useRef(null);

  function onBirth(d){setBd(d);setScr("questions");}
  function onQuestions(a){
    setAns(a);setScr("loading");
    var nc=fullChart(bd.year,bd.month,bd.day,bd.hour,bd.lat,bd.lng);setChart(nc);
    var ct=nowTransits();setTrans(ct);
    var ar=aspects(nc,ct);setIntensity(ar.intensity);aspectsRef.current=ar;
    var prompt=buildPrompt(bd,nc,ct,ar,a);
    fetch("/api/horoscope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})})
    .then(r=>r.json()).then(data=>{
      if(data.error){setErr(data.error);setScr("error");return;}
      setWeekly(data.weekly);setMonthly(data.monthly);setScr("chart");
    }).catch(e=>{setErr(e.message);setScr("error");});
  }

  function share(){var t="Luminary - Get your AI astrology reading at @alwaysbbuilding5";if(navigator.share)navigator.share({title:"Luminary",text:t}).catch(()=>{});else if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert("Copied!")).catch(()=>prompt("Copy:",t));else prompt("Copy:",t);}

  if(scr==="landing")return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
  if(scr==="input")return<Input onSubmit={onBirth}/>;
  if(scr==="questions")return<Questions onSubmit={onQuestions}/>;
  if(scr==="loading")return<Loading name={bd?.name||""}/>;
  if(scr==="error")return<ErrScreen message={err} onRetry={()=>{setErr(null);setScr("questions");}}/>;
  if(scr==="chart"&&chart)return<Chart chart={chart} intensity={intensity} name={bd.name} onContinue={()=>setScr("slides")}/>;
  if(scr==="slides")return<Slides name={bd.name} sunSign={getSign(chart.Sun)} intensity={intensity} weekly={weekly} monthly={monthly} onChat={()=>setScr("chat")} onShare={share}/>;
  if(scr==="chat")return<ChatScreen chartContext={chartTxt(chart)+"\nTransits: "+chartTxt(trans)+"\nIntensity: "+intensity+"/10"} name={bd.name} onBack={()=>setScr("slides")}/>;
  return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
}

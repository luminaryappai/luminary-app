"use client";
import React, { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   LUMINARY V7.6 — FINAL BUILD
   "Your week, before it happens."
   
   3-tab (weekly/monthly/transits) with visual cards
   Account system · Shareable cards · Transit dates
   Warm editorial design · Chat · Birth chart
   ═══════════════════════════════════════════════════ */

const serif = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const sans = "'DM Sans', -apple-system, sans-serif";
const C = {
  bg: "#FBF7F0", card: "#FFFFFF", deep: "#1A1612", sub: "#6B5E52", dim: "#9B8E82",
  amber: "#C17B3A", sage: "#7A8B6F", rose: "#C4706A", gold: "#B8963F", sky: "#8BA5B5",
  border: "#E8E0D6", glow: "rgba(193,123,58,0.08)",
};

function Fade({ children, delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "all 0.65s cubic-bezier(0.23,1,0.32,1)", ...style }}>{children}</div>;
}

// ── Cities ──
const CITIES=[{n:"New York",lat:40.71,lng:-74.01,tz:-5},{n:"Los Angeles",lat:34.05,lng:-118.24,tz:-8},{n:"Chicago",lat:41.88,lng:-87.63,tz:-6},{n:"Houston",lat:29.76,lng:-95.37,tz:-6},{n:"Phoenix",lat:33.45,lng:-112.07,tz:-7},{n:"Philadelphia",lat:39.95,lng:-75.17,tz:-5},{n:"San Diego",lat:32.72,lng:-117.16,tz:-8},{n:"Dallas",lat:32.78,lng:-96.80,tz:-6},{n:"Austin",lat:30.27,lng:-97.74,tz:-6},{n:"San Francisco",lat:37.77,lng:-122.42,tz:-8},{n:"Seattle",lat:47.61,lng:-122.33,tz:-8},{n:"Denver",lat:39.74,lng:-104.99,tz:-7},{n:"Washington DC",lat:38.91,lng:-77.04,tz:-5},{n:"Nashville",lat:36.16,lng:-86.78,tz:-6},{n:"Boston",lat:42.36,lng:-71.06,tz:-5},{n:"Portland",lat:45.52,lng:-122.68,tz:-8},{n:"Las Vegas",lat:36.17,lng:-115.14,tz:-8},{n:"Miami",lat:25.76,lng:-80.19,tz:-5},{n:"Atlanta",lat:33.75,lng:-84.39,tz:-5},{n:"Minneapolis",lat:44.98,lng:-93.27,tz:-6},{n:"Tampa",lat:27.95,lng:-82.46,tz:-5},{n:"New Orleans",lat:29.95,lng:-90.07,tz:-6},{n:"Detroit",lat:42.33,lng:-83.05,tz:-5},{n:"Salt Lake City",lat:40.76,lng:-111.89,tz:-7},{n:"Orlando",lat:28.54,lng:-81.38,tz:-5},{n:"Scottsdale",lat:33.49,lng:-111.93,tz:-7},{n:"Mesa",lat:33.42,lng:-111.83,tz:-7},{n:"Tempe",lat:33.43,lng:-111.94,tz:-7},{n:"Paradise Valley",lat:33.53,lng:-111.94,tz:-7},{n:"Boca Raton",lat:26.36,lng:-80.08,tz:-5},{n:"Beverly Hills",lat:34.07,lng:-118.40,tz:-8},{n:"Malibu",lat:34.03,lng:-118.78,tz:-8},{n:"Honolulu",lat:21.31,lng:-157.86,tz:-10},{n:"Anchorage",lat:61.22,lng:-149.90,tz:-9},{n:"Aurora IL",lat:41.76,lng:-88.32,tz:-6},{n:"London",lat:51.51,lng:-0.13,tz:0},{n:"Paris",lat:48.86,lng:2.35,tz:1},{n:"Rome",lat:41.90,lng:12.50,tz:1},{n:"Berlin",lat:52.52,lng:13.40,tz:1},{n:"Tokyo",lat:35.68,lng:139.69,tz:9},{n:"Sydney",lat:-33.87,lng:151.21,tz:10},{n:"Toronto",lat:43.65,lng:-79.38,tz:-5},{n:"Vancouver",lat:49.28,lng:-123.12,tz:-8},{n:"Mexico City",lat:19.43,lng:-99.13,tz:-6},{n:"Dubai",lat:25.20,lng:55.27,tz:4},{n:"Tel Aviv",lat:32.09,lng:34.77,tz:2},{n:"Mumbai",lat:19.08,lng:72.88,tz:5.5},{n:"Singapore",lat:1.35,lng:103.82,tz:8},{n:"Seoul",lat:37.57,lng:127.00,tz:9},{n:"Melbourne",lat:-37.81,lng:144.96,tz:10},{n:"Auckland",lat:-36.85,lng:174.76,tz:12},{n:"Sao Paulo",lat:-23.55,lng:-46.63,tz:-3},{n:"Buenos Aires",lat:-34.60,lng:-58.38,tz:-3},{n:"Lake Las Vegas",lat:36.11,lng:-114.90,tz:-8},{n:"Northampton MA",lat:42.32,lng:-72.63,tz:-5},{n:"Chandler",lat:33.30,lng:-111.84,tz:-7},{n:"Sedona",lat:34.87,lng:-111.76,tz:-7},{n:"Tucson",lat:32.22,lng:-110.93,tz:-7},{n:"San Antonio",lat:29.42,lng:-98.49,tz:-6},{n:"Sacramento",lat:38.58,lng:-121.49,tz:-8},{n:"Raleigh",lat:35.78,lng:-78.64,tz:-5},{n:"Charlotte",lat:35.23,lng:-80.84,tz:-5},{n:"Savannah",lat:32.08,lng:-81.09,tz:-5},{n:"Charleston",lat:32.78,lng:-79.93,tz:-5},{n:"Santa Fe",lat:35.69,lng:-105.94,tz:-7},{n:"Aspen",lat:39.19,lng:-106.82,tz:-7},{n:"Park City",lat:40.65,lng:-111.50,tz:-7},{n:"Santa Monica",lat:34.02,lng:-118.49,tz:-8},{n:"West Hollywood",lat:34.09,lng:-118.36,tz:-8},{n:"Newport Beach",lat:33.62,lng:-117.93,tz:-8},{n:"Napa",lat:38.30,lng:-122.29,tz:-8},{n:"Amsterdam",lat:52.37,lng:4.90,tz:1},{n:"Barcelona",lat:41.39,lng:2.17,tz:1},{n:"Madrid",lat:40.42,lng:-3.70,tz:1},{n:"Dublin",lat:53.35,lng:-6.26,tz:0},{n:"Lisbon",lat:38.72,lng:-9.14,tz:0},{n:"Stockholm",lat:59.33,lng:18.07,tz:1},{n:"Prague",lat:50.08,lng:14.44,tz:1},{n:"Vienna",lat:48.21,lng:16.37,tz:1},{n:"Hong Kong",lat:22.32,lng:114.17,tz:8},{n:"Bangkok",lat:13.76,lng:100.50,tz:7},{n:"Delhi",lat:28.61,lng:77.21,tz:5.5},{n:"Bali",lat:-8.34,lng:115.09,tz:8},{n:"Cape Town",lat:-33.92,lng:18.42,tz:2},{n:"Jerusalem",lat:31.77,lng:35.23,tz:2},{n:"Beirut",lat:33.89,lng:35.50,tz:2},{n:"Pittsburgh",lat:40.44,lng:-80.00,tz:-5},{n:"Kansas City",lat:39.10,lng:-94.58,tz:-6},{n:"Cleveland",lat:41.50,lng:-81.69,tz:-5},{n:"St Louis",lat:38.63,lng:-90.20,tz:-6},{n:"Cincinnati",lat:39.10,lng:-84.51,tz:-5},{n:"Milwaukee",lat:43.04,lng:-87.91,tz:-6},{n:"Albuquerque",lat:35.08,lng:-106.65,tz:-7},{n:"Fresno",lat:36.74,lng:-119.77,tz:-8},{n:"Colorado Springs",lat:38.83,lng:-104.82,tz:-7},{n:"Omaha",lat:41.26,lng:-95.94,tz:-6},{n:"Birmingham",lat:33.52,lng:-86.81,tz:-6},{n:"Richmond",lat:37.54,lng:-77.44,tz:-5},{n:"Boise",lat:43.62,lng:-116.21,tz:-7},{n:"Des Moines",lat:41.59,lng:-93.62,tz:-6},{n:"Naples FL",lat:26.14,lng:-81.79,tz:-5},{n:"Glendale AZ",lat:33.54,lng:-112.19,tz:-7},{n:"Gilbert",lat:33.35,lng:-111.79,tz:-7}];

async function geocodeCity(q) {
  try { const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`); const d = await r.json(); return d.results || []; } catch(e) { return []; }
}

function buildPrompt(name, cd) {
  const ct = Object.entries(cd.chart).map(([k,v])=>`${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
  const tt = Object.entries(cd.transits).map(([k,v])=>`${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
  const asp = (cd.topAspects||[]).slice(0,8).join("\n");
  const tim = (cd.timing||[]).slice(0,8).map(t=>`${t.transit} ${t.aspect} ${t.natal}: peaks ${t.peak} (${t.start} to ${t.end})`).join("\n");
  return `READING FOR: ${name}
NATAL: ${ct}
TRANSITS: ${tt}
${cd.unknownTime?"NOTE: Birth time unknown.":""}
INTENSITY: ${cd.intensity}/10
TODAY: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}

ACTIVE ASPECTS:
${asp}

TRANSIT TIMING:
${tim}

Generate a personalized reading as JSON:
{
  "hook": "One sentence about their strongest active transit. Specific to THEIR chart. Make them feel seen.",
  "weekLove": "2-3 sentences about love THIS WEEK. Include a specific day (e.g. 'Wednesday evening'). Reference their Venus/7th house.",
  "weekWork": "2-3 sentences about career THIS WEEK. Include a specific day. Reference Saturn/10th house.",
  "weekEnergy": "2-3 sentences about energy THIS WEEK. Reference their Moon sign.",
  "weekWarning": "One thing to watch for THIS WEEK with a specific day.",
  "weekGift": "One good thing coming THIS WEEK with timing.",
  "monthLove": "2-3 sentences about love THIS MONTH with dates.",
  "monthCareer": "2-3 sentences about career THIS MONTH with dates.",
  "monthGrowth": "2-3 sentences about personal growth THIS MONTH.",
  "monthEnergy": "2-3 sentences about energy/health THIS MONTH.",
  "yourLine": "Under 15 words. The screenshot moment. Memorable, slightly dangerous, true."
}

VOICE: Smart friend who knows astrology. Warm, specific, slightly dangerous. Include ACTUAL DATES (April 2, Thursday evening, etc). Never vague. Never generic newspaper horoscope. Make observations that land because they're uncomfortably accurate.
ONLY JSON. No markdown. No backticks.`;
}

/* ═══════════ LANDING ═══════════ */
function Landing({ onStart, onLogin, onAdmin }) {
  const [taps, setTaps] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [ig, setIg] = useState(""); const [pw, setPw] = useState(""); const [loginErr, setLoginErr] = useState(""); const [loginLoading, setLoginLoading] = useState(false);
  const tap = () => { const t=taps+1; setTaps(t); if(t>=5){setTaps(0);onAdmin();} setTimeout(()=>setTaps(0),2000); };

  const doLogin = async () => {
    if(!ig.trim()){setLoginErr("Enter your IG handle");return;} setLoginLoading(true);setLoginErr("");
    try { const r=await fetch(`/api/user?action=login&ig=${encodeURIComponent(ig)}&pw=${encodeURIComponent(pw)}`); const d=await r.json();
      if(d.error){setLoginErr(d.error);setLoginLoading(false);return;} onLogin(d.user);
    } catch(e){setLoginErr("Connection error");} setLoginLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(180deg, ${C.bg} 0%, #F5EDE1 50%, ${C.bg} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 28px", fontFamily:sans, position:"relative" }}>
      <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(193,123,58,0.07) 0%, rgba(184,150,63,0.03) 40%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"20%", right:"10%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(122,139,111,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />

      <Fade><p onClick={tap} style={{ fontSize:28, color:C.amber, cursor:"default", letterSpacing:6 }}>✦</p></Fade>
      <Fade delay={200}><h1 style={{ fontFamily:serif, fontSize:48, fontWeight:300, color:C.deep, letterSpacing:4, margin:"20px 0 0", textAlign:"center" }}>LUMINARY</h1></Fade>
      <Fade delay={400}><p style={{ fontFamily:serif, fontSize:20, color:C.amber, fontStyle:"italic", margin:"10px 0 0", letterSpacing:1 }}>Your week, before it happens.</p></Fade>
      <Fade delay={500}><div style={{ width:40, height:1, background:C.amber, margin:"24px auto", opacity:0.4 }} /></Fade>
      <Fade delay={600}>
        <p style={{ fontSize:15, color:C.sub, textAlign:"center", maxWidth:280, lineHeight:1.7, marginBottom:4 }}>Other apps know your sign.</p>
        <p style={{ fontSize:15, color:C.deep, textAlign:"center", maxWidth:280, lineHeight:1.7, fontWeight:500, marginBottom:36 }}>This one knows your chart.</p>
      </Fade>
      <Fade delay={750}><button onClick={onStart} style={{ background:C.deep, color:C.bg, border:"none", padding:"18px 48px", fontSize:14, letterSpacing:3, fontWeight:500, cursor:"pointer", borderRadius:2, fontFamily:sans, boxShadow:"0 4px 20px rgba(26,22,18,0.15)", transition:"all 0.3s" }}>ENTER YOUR BIRTHDAY</button></Fade>
      <Fade delay={900}><p style={{ fontSize:12, color:C.dim, marginTop:28, textAlign:"center", lineHeight:1.6 }}>Free · 30 seconds · No account needed</p></Fade>
      <Fade delay={1000}><button onClick={()=>setShowLogin(!showLogin)} style={{ background:"none", border:"none", color:C.dim, fontSize:13, marginTop:12, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:4 }}>I have an account</button></Fade>

      {showLogin && <Fade><div style={{ marginTop:20, padding:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, width:280, boxShadow:"0 8px 30px rgba(0,0,0,0.06)" }}>
        <input value={ig} onChange={e=>setIg(e.target.value)} placeholder="IG Handle" style={{ width:"100%", padding:12, background:C.bg, border:`1px solid ${C.border}`, borderRadius:4, color:C.deep, fontSize:14, marginBottom:10, outline:"none", boxSizing:"border-box" }} />
        <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="Password" onKeyDown={e=>{if(e.key==="Enter")doLogin();}} style={{ width:"100%", padding:12, background:C.bg, border:`1px solid ${C.border}`, borderRadius:4, color:C.deep, fontSize:14, marginBottom:10, outline:"none", boxSizing:"border-box" }} />
        {loginErr && <p style={{ color:C.rose, fontSize:12, marginBottom:8 }}>{loginErr}</p>}
        <button onClick={doLogin} disabled={loginLoading} style={{ width:"100%", background:C.deep, color:C.bg, border:"none", padding:12, borderRadius:4, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:1 }}>{loginLoading?"...":"Log In"}</button>
      </div></Fade>}
    </div>
  );
}

/* ═══════════ ONBOARDING ═══════════ */
function Onboarding({ onSubmit }) {
  const [name,setName]=useState(""); const [ig,setIg]=useState(""); const [pw,setPw]=useState("");
  const [month,setMonth]=useState(""); const [day,setDay]=useState(""); const [year,setYear]=useState("");
  const [hour,setHour]=useState(""); const [minute,setMinute]=useState(""); const [ampm,setAmpm]=useState("PM");
  const [unknownTime,setUnknownTime]=useState(false);
  const [cityQ,setCityQ]=useState(""); const [city,setCity]=useState(null); const [sug,setSug]=useState([]);
  const [showAccount,setShowAccount]=useState(false);
  const debRef=useRef(null);

  useEffect(() => {
    if(cityQ.length<2){setSug([]);return;}
    const q=cityQ.toLowerCase();
    const local=CITIES.filter(c=>c.n.toLowerCase().includes(q)).slice(0,6);
    if(local.length>0){setSug(local);return;}
    clearTimeout(debRef.current);
    debRef.current=setTimeout(async()=>{const r=await geocodeCity(cityQ);setSug(r.map(x=>({n:x.name,lat:x.lat,lng:x.lng,tz:x.tz})));},400);
  },[cityQ]);

  const ready=name&&month&&day&&year&&city;
  const submit=()=>{
    if(!ready)return;
    let h=unknownTime?12:parseInt(hour||"12"); const m=unknownTime?0:parseInt(minute||"0");
    if(!unknownTime){if(ampm==="PM"&&h!==12)h+=12;if(ampm==="AM"&&h===12)h=0;}
    if(ig.trim()){fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"register",ig:ig.trim(),name:name.trim(),password:pw})}).catch(()=>{});}
    onSubmit({name:name.trim(),ig:ig.trim(),year:parseInt(year),month:parseInt(month),day:parseInt(day),hour:h+m/60,lat:city.lat,lng:city.lng,tz:city.tz,unknownTime,city:city.n});
  };

  const inp={width:"100%",padding:"14px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:4,color:C.deep,fontSize:16,fontFamily:sans,outline:"none",boxSizing:"border-box"};
  const sm={...inp,width:"30%",textAlign:"center"};
  const lab={fontSize:11,color:C.dim,letterSpacing:2,marginBottom:6,display:"block",fontWeight:500,textTransform:"uppercase"};

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"36px 24px 60px", fontFamily:sans, maxWidth:400, margin:"0 auto" }}>
      <Fade><p style={{ fontFamily:serif, fontSize:28, fontWeight:300, color:C.deep, textAlign:"center", marginBottom:4 }}>Tell us when you arrived.</p></Fade>
      <Fade delay={100}><p style={{ fontSize:13, color:C.dim, textAlign:"center", marginBottom:32 }}>That's all we need to read your stars.</p></Fade>

      <Fade delay={200}>
        <label style={lab}>Your name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="First name" style={{...inp,marginBottom:20}} />
        <label style={lab}>Birthday</label>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={month} onChange={e=>setMonth(e.target.value)} placeholder="MM" maxLength={2} style={sm} />
          <input value={day} onChange={e=>setDay(e.target.value)} placeholder="DD" maxLength={2} style={sm} />
          <input value={year} onChange={e=>setYear(e.target.value)} placeholder="YYYY" maxLength={4} style={{...inp,width:"40%",textAlign:"center"}} />
        </div>
        {!unknownTime&&<><label style={lab}>Birth time</label><div style={{display:"flex",gap:8,marginBottom:8}}>
          <input value={hour} onChange={e=>setHour(e.target.value)} placeholder="HH" maxLength={2} style={sm} />
          <input value={minute} onChange={e=>setMinute(e.target.value)} placeholder="MM" maxLength={2} style={sm} />
          <select value={ampm} onChange={e=>setAmpm(e.target.value)} style={{...inp,width:"40%",textAlign:"center"}}><option>AM</option><option>PM</option></select>
        </div></>}
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.dim,marginBottom:20,cursor:"pointer"}}>
          <input type="checkbox" checked={unknownTime} onChange={e=>setUnknownTime(e.target.checked)} style={{accentColor:C.amber}} /> I don't know my birth time
        </label>
        <label style={lab}>Birth city</label>
        <input value={cityQ} onChange={e=>{setCityQ(e.target.value);setCity(null);}} placeholder="Start typing..." style={{...inp,marginBottom:4}} />
        {sug.length>0&&!city&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,marginBottom:16,maxHeight:180,overflow:"auto",boxShadow:"0 4px 12px rgba(0,0,0,0.06)"}}>
          {sug.map((s,i)=><div key={i} onClick={()=>{setCity(s);setCityQ(s.n);setSug([]);}} style={{padding:"12px 16px",cursor:"pointer",color:C.deep,fontSize:14,borderBottom:i<sug.length-1?`1px solid ${C.border}`:"none"}}>{s.n}</div>)}
        </div>}
        {city&&<p style={{fontSize:12,color:C.sage,marginBottom:16}}>✓ {city.n}</p>}

        <button onClick={()=>setShowAccount(!showAccount)} style={{background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",marginBottom:showAccount?12:20,textDecoration:"underline",textUnderlineOffset:4}}>
          {showAccount?"Hide account options":"Want to save your reading? Create an account"}
        </button>
        {showAccount&&<div style={{background:C.glow,border:`1px solid ${C.border}`,borderRadius:6,padding:16,marginBottom:20}}>
          <label style={{...lab,fontSize:10}}>Instagram handle (optional)</label>
          <input value={ig} onChange={e=>setIg(e.target.value)} placeholder="@handle" style={{...inp,marginBottom:10,fontSize:14}} />
          <label style={{...lab,fontSize:10}}>Password (optional)</label>
          <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="For returning later" style={{...inp,fontSize:14}} />
        </div>}

        <button onClick={submit} disabled={!ready} style={{width:"100%",background:ready?C.deep:C.border,color:ready?C.bg:C.dim,border:"none",padding:"18px",fontSize:14,letterSpacing:2,fontWeight:500,cursor:ready?"pointer":"default",borderRadius:2,fontFamily:sans,boxShadow:ready?"0 4px 20px rgba(26,22,18,0.15)":"none",transition:"all 0.3s"}}>READ MY STARS</button>
      </Fade>
    </div>
  );
}

/* ═══════════ LOADING ═══════════ */
function Loading({name}){
  const msgs=[`Mapping ${name}'s stars...`,"Found your Venus. She's been busy.","Okay Saturn has opinions...","Your chart is... interesting.","Consulting the Moon. She's in a mood.","Almost done. This one's good.","Pulling your week together..."];
  const[idx,setIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%msgs.length),2200);return()=>clearInterval(t);},[]);
  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:sans,padding:32}}>
    <div style={{width:36,height:36,border:`2px solid ${C.border}`,borderTopColor:C.amber,borderRadius:"50%",animation:"spin 1s linear infinite"}} />
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    <Fade key={idx}><p style={{color:C.sub,fontSize:16,marginTop:28,fontStyle:"italic",textAlign:"center",fontFamily:serif}}>{msgs[idx]}</p></Fade>
  </div>);
}

/* ═══════════ VISUAL CARD ═══════════ */
function Card({ accent, label, children, icon }) {
  return (
    <div style={{ background:C.card, borderRadius:8, padding:"24px 22px", marginBottom:12, borderLeft:`3px solid ${accent}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:80, height:80, borderRadius:"50%", background:`radial-gradient(circle, ${accent}08, transparent)`, transform:"translate(20px,-20px)" }} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        {icon && <span style={{ fontSize:16 }}>{icon}</span>}
        <p style={{ fontSize:10, fontWeight:600, letterSpacing:3, color:accent, textTransform:"uppercase", fontFamily:sans }}>{label}</p>
      </div>
      <p style={{ fontFamily:serif, fontSize:17, color:C.deep, lineHeight:1.9, fontWeight:300 }}>{children}</p>
    </div>
  );
}

/* ═══════════ READING ═══════════ */
function ReadingView({ name, reading, chartData, onChat, onChart, onShare, onLogout }) {
  const [tab,setTab]=useState("weekly");
  const tabBtn=(label,v)=><button onClick={()=>setTab(v)} style={{background:tab===v?C.deep:"transparent",color:tab===v?C.bg:C.dim,border:`1px solid ${tab===v?C.deep:C.border}`,padding:"9px 20px",borderRadius:2,fontSize:11,letterSpacing:2,cursor:"pointer",fontFamily:sans,fontWeight:500,textTransform:"uppercase",transition:"all 0.2s"}}>{label}</button>;

  // Transit cards from chartData.timing
  const transits = (chartData.timing||[]).slice(0,10);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:sans, maxWidth:480, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:10 }}>
        <span style={{ fontFamily:serif, fontSize:16, color:C.amber, letterSpacing:2 }}>✦ LUMINARY</span>
        <button onClick={onLogout} style={{ background:"none", border:"none", color:C.dim, fontSize:12, cursor:"pointer" }}>Exit</button>
      </div>

      {/* Greeting */}
      <Fade><div style={{ padding:"28px 24px 12px", textAlign:"center" }}>
        <p style={{ fontFamily:serif, fontSize:13, color:C.dim, letterSpacing:2 }}>{name.toUpperCase()}'S READING</p>
        <p style={{ fontSize:11, color:C.dim, marginTop:4 }}>{new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
      </div></Fade>

      {/* Hook */}
      <Fade delay={100}><div style={{ padding:"28px 28px", margin:"0 16px 16px", background:`linear-gradient(135deg, rgba(193,123,58,0.06), rgba(184,150,63,0.02))`, borderRadius:10, textAlign:"center", border:`1px solid rgba(193,123,58,0.1)` }}>
        <p style={{ fontFamily:serif, fontSize:20, color:C.deep, lineHeight:1.7, fontWeight:300, fontStyle:"italic" }}>"{reading.hook}"</p>
      </div></Fade>

      {/* Tabs */}
      <div style={{ display:"flex", justifyContent:"center", gap:6, padding:"8px 16px 20px" }}>
        {tabBtn("Weekly","weekly")} {tabBtn("Monthly","monthly")} {tabBtn("Transits","transits")}
      </div>

      <div style={{ padding:"0 16px" }}>
        {tab==="weekly"&&<>
          <Fade delay={100}><Card accent={C.rose} label="Love" icon="♡">{reading.weekLove}</Card></Fade>
          <Fade delay={180}><Card accent={C.amber} label="Work" icon="◆">{reading.weekWork}</Card></Fade>
          <Fade delay={260}><Card accent={C.sage} label="Energy" icon="◎">{reading.weekEnergy}</Card></Fade>
          <Fade delay={340}><Card accent={C.sky} label="Watch For" icon="△">{reading.weekWarning}</Card></Fade>
          <Fade delay={420}><Card accent={C.gold} label="Coming Your Way" icon="✦">{reading.weekGift}</Card></Fade>
        </>}

        {tab==="monthly"&&<>
          <Fade delay={100}><Card accent={C.rose} label="Love This Month" icon="♡">{reading.monthLove}</Card></Fade>
          <Fade delay={180}><Card accent={C.amber} label="Career This Month" icon="◆">{reading.monthCareer}</Card></Fade>
          <Fade delay={260}><Card accent={C.sage} label="Growth This Month" icon="◎">{reading.monthGrowth}</Card></Fade>
          <Fade delay={340}><Card accent={C.gold} label="Energy This Month" icon="✦">{reading.monthEnergy}</Card></Fade>
        </>}

        {tab==="transits"&&<>
          {transits.length===0?<p style={{color:C.dim,textAlign:"center",padding:20,fontFamily:serif,fontStyle:"italic"}}>No major transits detected right now.</p>:
          transits.map((t,i)=><Fade key={i} delay={i*80}>
            <div style={{background:C.card,borderRadius:8,padding:"18px 20px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.03)",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:C.deep,fontWeight:500}}>{t.transit} {t.aspect} {t.natal}</span>
                <span style={{fontSize:10,color:C.amber,fontWeight:600,letterSpacing:1}}>{t.peakOrb}° orb</span>
              </div>
              <p style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{t.transit} {t.meaning} your {t.natalArea}</p>
              <div style={{display:"flex",gap:12,marginTop:8}}>
                <span style={{fontSize:10,color:C.dim}}>Start: <strong style={{color:C.sub}}>{t.start}</strong></span>
                <span style={{fontSize:10,color:C.amber}}>Peak: <strong>{t.peak}</strong></span>
                <span style={{fontSize:10,color:C.dim}}>End: <strong style={{color:C.sub}}>{t.end}</strong></span>
              </div>
            </div>
          </Fade>)}
        </>}
      </div>

      {/* YOUR LINE — Screenshot moment */}
      <Fade delay={500}><div style={{ margin:"20px 16px", padding:"40px 24px", textAlign:"center", background:C.deep, borderRadius:10, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(ellipse at top, rgba(193,123,58,0.08), transparent 60%)" }} />
        <p style={{ fontSize:9, letterSpacing:4, color:C.dim, marginBottom:14, textTransform:"uppercase", position:"relative" }}>Your line this week</p>
        <p style={{ fontFamily:serif, fontSize:24, color:"#F0EBE3", lineHeight:1.5, fontWeight:300, position:"relative" }}>{reading.yourLine}</p>
        <div style={{ width:24, height:1, background:"rgba(193,123,58,0.4)", margin:"18px auto 0", position:"relative" }} />
        <p style={{ fontSize:8, letterSpacing:3, color:"rgba(193,123,58,0.5)", marginTop:12, position:"relative" }}>✦ LUMINARY</p>
      </div></Fade>

      {/* Actions */}
      <Fade delay={600}><div style={{ padding:"16px", display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={onShare} style={{ background:"none", border:`1px solid ${C.border}`, color:C.sub, padding:"10px 20px", borderRadius:4, fontSize:12, cursor:"pointer" }}>Share</button>
        <button onClick={onChart} style={{ background:"none", border:`1px solid ${C.border}`, color:C.sub, padding:"10px 20px", borderRadius:4, fontSize:12, cursor:"pointer" }}>Birth Chart</button>
      </div></Fade>

      {/* Chat CTA */}
      <Fade delay={700}><div style={{ padding:"16px 16px 32px" }}>
        <button onClick={onChat} style={{ width:"100%", padding:"20px", background:`linear-gradient(135deg, ${C.glow}, rgba(122,139,111,0.04))`, border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", textAlign:"left" }}>
          <p style={{ fontSize:15, color:C.deep, fontFamily:serif, fontStyle:"italic" }}>Something on your mind? Ask Luminary.</p>
          <p style={{ fontSize:11, color:C.dim, marginTop:4 }}>Your chart has more to say →</p>
        </button>
      </div></Fade>
    </div>
  );
}

/* ═══════════ BIRTH CHART ═══════════ */
function BirthChart({chartData,name,onBack}){
  const[analysis,setAnalysis]=useState(null);const[loading,setLoading]=useState(true);
  useEffect(()=>{
    const ct=Object.entries(chartData.chart).map(([k,v])=>`${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
    fetch("/api/birthchart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chartText:ct,name,unknownTime:chartData.unknownTime})}).then(r=>r.json()).then(d=>{setAnalysis(d.analysis);setLoading(false);}).catch(()=>{setAnalysis("Unable to load.");setLoading(false);});
  },[]);
  const big=["Sun","Moon","Ascendant"];
  return(<div style={{minHeight:"100vh",background:C.bg,padding:24,fontFamily:sans,maxWidth:480,margin:"0 auto"}}>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",marginBottom:24}}>← Back</button>
    <h2 style={{fontFamily:serif,fontSize:26,fontWeight:300,color:C.deep,marginBottom:6}}>{name}'s Birth Chart</h2>
    <p style={{fontSize:12,color:C.dim,marginBottom:20}}>Your cosmic blueprint</p>
    {/* Big 3 */}
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {big.map(k=>{const v=chartData.chart[k];return v?<div key={k} style={{flex:1,background:`linear-gradient(135deg, ${C.card}, ${C.glow})`,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 12px",textAlign:"center"}}>
        <p style={{fontSize:9,color:C.dim,letterSpacing:2,marginBottom:4}}>{k.toUpperCase()}</p>
        <p style={{fontSize:16,color:C.amber,fontFamily:serif,fontWeight:400}}>{v.sign}</p>
        <p style={{fontSize:11,color:C.sub}}>{v.deg}°{v.min}'</p>
      </div>:null})}
    </div>
    {/* Other placements */}
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:28}}>
      {Object.entries(chartData.chart).filter(([k])=>!big.includes(k)).map(([k,v])=>
        <span key={k} style={{background:C.card,border:`1px solid ${C.border}`,padding:"5px 10px",borderRadius:20,fontSize:11,color:C.sub}}>{k}: {v.sign} {v.deg}°</span>
      )}
    </div>
    {/* Analysis */}
    {loading?<div style={{textAlign:"center",padding:40}}><p style={{color:C.dim,fontStyle:"italic",fontFamily:serif}}>Reading your chart deeply...</p></div>:
    <div style={{fontFamily:serif,fontSize:17,color:C.deep,lineHeight:2,whiteSpace:"pre-wrap",fontWeight:300}}>{analysis}</div>}
  </div>);
}

/* ═══════════ CHAT ═══════════ */
function Chat({chartData,name,onBack,saveChat}){
  const[msgs,setMsgs]=useState([{role:"assistant",text:`Hey ${name}. I've been looking at your chart — there's a lot happening. What's on your mind?`}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);const ref=useRef(null);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const send=()=>{
    const txt=input.trim();if(!txt||loading)return;setInput("");setLoading(true);const um=txt;
    setMsgs(p=>[...p,{role:"user",text:um}]);
    const ctx=Object.entries(chartData.chart).map(([k,v])=>`${k}: ${v.sign} ${v.deg}°`).join(", ");
    const am=[...msgs.map(m=>({role:m.role==="user"?"user":"assistant",content:m.text})),{role:"user",content:um}];
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:am,userName:name,chartContext:ctx})}).then(r=>r.json()).then(d=>{
      const reply=d.reply||"Let me try again.";setMsgs(p=>[...p,{role:"assistant",text:reply}]);setLoading(false);if(saveChat)saveChat(um,reply);
    }).catch(()=>{setMsgs(p=>[...p,{role:"assistant",text:"Lost connection. Try again?"}]);setLoading(false);});
  };
  return(<div style={{height:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:sans,maxWidth:480,margin:"0 auto"}}>
    <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(251,247,240,0.9)",backdropFilter:"blur(10px)"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer"}}>← Back</button>
      <span style={{fontSize:10,letterSpacing:3,color:C.amber,fontFamily:serif}}>LUMINARY AI</span>
      <div style={{width:40}} />
    </div>
    <div ref={ref} style={{flex:1,overflow:"auto",padding:16}}>
      {msgs.map((m,i)=>{const u=m.role==="user";return(<Fade key={i}><div style={{marginBottom:14,textAlign:u?"right":"left"}}>
        <div style={{display:"inline-block",maxWidth:"85%",padding:"14px 18px",borderRadius:u?"16px 16px 4px 16px":"16px 16px 16px 4px",fontSize:15,lineHeight:1.8,background:u?C.deep:C.card,color:u?"#F0EBE3":C.deep,border:u?"none":`1px solid ${C.border}`,fontFamily:serif,fontWeight:300,boxShadow:u?"none":"0 2px 8px rgba(0,0,0,0.03)"}}>{m.text}</div>
      </div></Fade>);})}
      {loading&&<div style={{padding:"14px 18px",display:"inline-block",background:C.card,border:`1px solid ${C.border}`,borderRadius:16,color:C.dim,fontSize:14,fontStyle:"italic",fontFamily:serif}}>Reading the stars...</div>}
    </div>
    <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,background:C.bg}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,padding:"15px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.deep,fontSize:15,fontFamily:serif,outline:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}} />
      <button onClick={send} style={{background:C.deep,color:C.bg,border:"none",padding:"15px 24px",borderRadius:6,fontSize:13,fontWeight:500,letterSpacing:1,cursor:"pointer",boxShadow:"0 2px 10px rgba(26,22,18,0.15)"}}>Send</button>
    </div>
  </div>);
}

/* ═══════════ ERROR ═══════════ */
function ErrScreen({msg,onRetry}){return(
  <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:sans,padding:24}}>
    <p style={{color:C.rose,fontSize:16,marginBottom:12,fontFamily:serif}}>Something went sideways.</p>
    <p style={{color:C.dim,fontSize:13,marginBottom:24,textAlign:"center",maxWidth:280}}>{msg}</p>
    <button onClick={onRetry} style={{background:C.deep,color:C.bg,border:"none",padding:"12px 32px",borderRadius:4,fontSize:13,fontWeight:500,cursor:"pointer"}}>Try Again</button>
  </div>
);}

/* ═══════════ ADMIN (inline) ═══════════ */
function Admin({onBack}){
  const[auth,setAuth]=useState(false);const[pass,setPass]=useState("");const[users,setUsers]=useState([]);const[ld,setLd]=useState(false);
  const load=async()=>{setLd(true);try{const r=await fetch("/api/user?action=list&mk=84245577");const d=await r.json();setUsers(d.users||[]);}catch(e){}setLd(false);};
  useEffect(()=>{if(auth)load();},[auth]);
  if(!auth)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:sans}}>
    <p style={{fontSize:11,letterSpacing:4,color:C.amber,marginBottom:20}}>✦ ADMIN</p>
    <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pass==="84245577")setAuth(true);}} placeholder="Password" style={{padding:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,color:C.deep,fontSize:15,outline:"none",width:240,textAlign:"center",marginBottom:16}} />
    <button onClick={()=>{if(pass==="84245577")setAuth(true);}} style={{background:C.deep,color:C.bg,border:"none",padding:"12px 36px",fontSize:13,letterSpacing:2,cursor:"pointer",borderRadius:2}}>Enter</button>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,marginTop:20,cursor:"pointer"}}>← Back</button>
  </div>);
  return(<div style={{minHeight:"100vh",background:C.bg,padding:"24px 16px",fontFamily:sans,maxWidth:600,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div><p style={{fontSize:11,letterSpacing:3,color:C.amber}}>✦ LUMINARY ADMIN</p><p style={{fontSize:12,color:C.dim,marginTop:4}}>{users.length} users</p></div>
      <div style={{display:"flex",gap:8}}><button onClick={load} style={{background:"none",border:`1px solid ${C.border}`,color:C.sub,padding:"6px 14px",borderRadius:2,fontSize:11,cursor:"pointer"}}>Refresh</button><button onClick={()=>{setAuth(false);setPass("");}} style={{background:"none",border:`1px solid ${C.rose}`,color:C.rose,padding:"6px 14px",borderRadius:2,fontSize:11,cursor:"pointer"}}>Lock</button></div>
    </div>
    {ld?<p style={{color:C.dim}}>Loading...</p>:users.length===0?<p style={{color:C.dim}}>No users yet.</p>:users.map((u,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"14px 16px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}}>
      <span style={{color:C.deep,fontSize:15,fontWeight:500}}>{u.name||"—"}{u.ig&&<span style={{color:C.dim,fontSize:12,marginLeft:8}}>@{u.ig}</span>}</span>
      <p style={{fontSize:12,color:C.amber,marginTop:4}}>{u.sun&&`☉ ${u.sun}`} {u.moon&&`☽ ${u.moon}`} {u.rising&&`↑ ${u.rising}`}</p>
      {u.city&&<p style={{fontSize:11,color:C.dim,marginTop:2}}>{u.city}</p>}
    </div>)}
  </div>);
}

/* ═══════════ MAIN ═══════════ */
export default function Luminary(){
  const[scr,setScr]=useState("landing");const[bd,setBd]=useState(null);const[chartData,setChartData]=useState(null);const[reading,setReading]=useState(null);const[err,setErr]=useState(null);const[userIG,setUserIG]=useState(null);

  useEffect(()=>{try{const ig=localStorage.getItem("lum_ig");if(ig)setUserIG(ig);}catch(e){}},[]);

  const saveReading=(cd,r)=>{
    const name=bd?.name||"";const ig=bd?.ig||userIG||"";const id=ig||name;if(!id)return;
    fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      action:"save",ig,name,sun:cd.chart?.Sun?.sign,moon:cd.chart?.Moon?.sign,rising:cd.chart?.Ascendant?.sign,
      chart:cd.chart,transits:cd.transits,aspects:cd.aspects,intensity:cd.intensity,horoscope:r,
      birthDate:bd?`${bd.year}-${String(bd.month).padStart(2,"0")}-${String(bd.day).padStart(2,"0")}`:"",
      birthTime:bd?.unknownTime?"unknown":`${Math.floor(bd?.hour||12)}:${String(Math.round(((bd?.hour||12)%1)*60)).padStart(2,"0")}`,
      birthCity:bd?.city,
    })}).catch(e=>console.error("Save failed:",e));
  };
  const saveChat=(um,ai)=>{const name=bd?.name||"";const ig=bd?.ig||userIG||"";const id=ig||name;if(!id)return;fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"chat",ig,name,userMsg:um,aiMsg:ai})}).catch(()=>{});};

  const onLogin=(userData)=>{
    setUserIG(userData.ig);try{localStorage.setItem("lum_ig",userData.ig);}catch(e){}
    if(userData.chart){setChartData(userData);setBd({name:userData.name,ig:userData.ig,city:userData.birthCity});if(userData.horoscope)setReading(userData.horoscope);setScr(userData.horoscope?"reading":"input");}
    else{setBd({name:userData.name,ig:userData.ig});setScr("input");}
  };

  const onBirth=d=>{setBd(d);if(d.ig){setUserIG(d.ig);try{localStorage.setItem("lum_ig",d.ig);}catch(e){}}setScr("loading");
    fetch("/api/chart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({year:d.year,month:d.month,day:d.day,hour:d.hour,lat:d.lat,lng:d.lng,tz:d.tz,unknownTime:d.unknownTime})}).then(r=>r.json()).then(cd=>{
      if(cd.error){setErr("Chart: "+cd.error);setScr("error");return;}
      cd.unknownTime=d.unknownTime;setChartData(cd);
      const prompt=buildPrompt(d.name,cd);
      return fetch("/api/horoscope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,name:d.name})}).then(r=>r.json()).then(h=>{
        if(h.error){setErr("Reading: "+h.error);setScr("error");return;}
        let r=h.slides||h;
        if(Array.isArray(r)){r={hook:r[0]?.body||"",weekLove:r[1]?.body||"",weekWork:r[2]?.body||"",weekEnergy:r[3]?.body||"",weekWarning:"Trust your instincts.",weekGift:"Something good is coming.",monthLove:r[4]?.body||"",monthCareer:r[5]?.body||"",monthGrowth:r[6]?.body||"",monthEnergy:r[7]?.body||"",yourLine:"The stars are watching."};}
        setReading(r);saveReading(cd,r);setScr("reading");
      });
    }).catch(e=>{setErr(e.message);setScr("error");});
  };

  const share=()=>{const u=window.location.href;if(navigator.share)navigator.share({title:"Luminary",text:reading?.yourLine||"Get your reading",url:u}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(u).catch(()=>prompt("Copy:",u));else prompt("Copy:",u);};
  const logout=()=>{setUserIG(null);setBd(null);setChartData(null);setReading(null);setScr("landing");try{localStorage.removeItem("lum_ig");}catch(e){}};

  if(scr==="landing")return<Landing onStart={()=>setScr("input")} onLogin={onLogin} onAdmin={()=>setScr("admin")} />;
  if(scr==="admin")return<Admin onBack={()=>setScr("landing")} />;
  if(scr==="input")return<Onboarding onSubmit={onBirth} />;
  if(scr==="loading")return<Loading name={bd?.name||""} />;
  if(scr==="error")return<ErrScreen msg={err} onRetry={()=>{setErr(null);setScr("input");}} />;
  if(scr==="reading"&&reading)return<ReadingView name={bd?.name||""} reading={reading} chartData={chartData} onChat={()=>setScr("chat")} onChart={()=>setScr("chart")} onShare={share} onLogout={logout} />;
  if(scr==="chart"&&chartData)return<BirthChart chartData={chartData} name={bd?.name||""} onBack={()=>setScr("reading")} />;
  if(scr==="chat"&&chartData)return<Chat chartData={chartData} name={bd?.name||""} onBack={()=>setScr("reading")} saveChat={saveChat} />;
  return<Landing onStart={()=>setScr("input")} onLogin={onLogin} onAdmin={()=>setScr("admin")} />;
}

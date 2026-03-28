"use client";
import { useState, useEffect, useRef } from "react";

// ═══ DESIGN SYSTEM — Warm Linen Cream ═══
const P = {
  bg:"#FAF6F0",card:"#FFFFFF",surface:"#F3EDE3",warm:"#EDE6DA",
  ink:"#2A2118",mid:"#6B5D50",light:"#A09282",faint:"#CFC4B6",
  gold:"#BF8C3E",goldBg:"#F6EDD9",sage:"#7A9468",sageBg:"#E5EBE0",
  blush:"#C08E8E",blushBg:"#F3E6E6",violet:"#8D80B8",violetBg:"#ECE8F3",
  terra:"#C4836A",terraBg:"#F5EBE5",night:"#191613",border:"rgba(42,33,24,0.06)",
  sh:"0 1px 8px rgba(42,33,24,0.04)",shUp:"0 4px 20px rgba(42,33,24,0.06)",
};
const F = { serif:"'Cormorant Garamond',Georgia,serif", sans:"'DM Sans',-apple-system,sans-serif" };
const ZG = {Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓"};

// ═══ GEOCODE (OpenStreetMap Nominatim — free, no key) ═══
async function searchCity(q) {
  if (q.length < 3) return [];
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&featuretype=city`);
    const d = await r.json();
    return d.map(c => ({ n: c.display_name.split(",").slice(0,2).join(",").trim(), lat: parseFloat(c.lat), lon: parseFloat(c.lon) }));
  } catch { return []; }
}

// ═══ SAVE USER DATA ═══
async function saveReading(data) {
  try { await fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", ...data }) }); } catch {}
}

// ═══ LANDING ═══
function Landing({ onStart }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", position:"relative", overflow:"hidden" }}>
      {/* Paper grain */}
      <div style={{ position:"absolute", inset:0, opacity:0.02, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:"128px", pointerEvents:"none" }} />
      {/* Zodiac ring hint */}
      <svg style={{ position:"absolute", right:-80, top:"40%", transform:"translateY(-50%)", opacity:v?0.04:0, transition:"opacity 2s ease 0.3s" }} width="320" height="320" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="150" fill="none" stroke={P.gold} strokeWidth="0.5"/>
        <circle cx="160" cy="160" r="110" fill="none" stroke={P.gold} strokeWidth="0.3"/>
      </svg>
      <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:340 }}>
        <p style={{ fontFamily:F.sans, fontSize:9, letterSpacing:5, textTransform:"uppercase", color:P.light, marginBottom:16, opacity:v?1:0, transition:"opacity 0.8s ease" }}>✦ LUMINARY ✦</p>
        <h1 style={{ fontFamily:F.serif, fontSize:38, fontWeight:600, color:P.ink, lineHeight:1.05, marginBottom:12, opacity:v?1:0, transform:v?"none":"translateY(12px)", transition:"all 1s cubic-bezier(0.16,1,0.3,1) 0.15s" }}>
          Your life,<br/><em style={{ fontStyle:"italic", color:P.gold }}>before it happens.</em>
        </h1>
        <p style={{ fontFamily:F.serif, fontSize:15, color:P.mid, lineHeight:1.65, fontStyle:"italic", marginBottom:32, opacity:v?1:0, transition:"opacity 0.8s ease 0.5s" }}>
          Personalized readings from your exact birth chart.<br/>Not your sun sign. <em>Your</em> sky.
        </p>
        <button onClick={onStart} style={{ fontFamily:F.sans, fontSize:10, fontWeight:600, letterSpacing:2.5, textTransform:"uppercase", color:"#FFF", background:P.ink, border:"none", padding:"14px 32px", borderRadius:24, cursor:"pointer", opacity:v?1:0, transition:"all 0.5s ease 0.7s", boxShadow:P.shUp }}>
          Enter your birthday
        </button>
        <p style={{ fontFamily:F.sans, fontSize:10, color:P.faint, marginTop:16, letterSpacing:1, opacity:v?1:0, transition:"opacity 1s ease 1s" }}>Free · 2 minutes · No download</p>
      </div>
    </div>
  );
}

// ═══ BIRTH DATA INPUT ═══
function BirthInput({ onSubmit }) {
  const [name, setName] = useState("");
  const [ig, setIg] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [noTime, setNoTime] = useState(false);
  const [cityQ, setCityQ] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [city, setCity] = useState(null);
  const [showCities, setShowCities] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef(null);

  const handleCitySearch = (q) => {
    setCityQ(q); setCity(null); setShowCities(true);
    clearTimeout(timer.current);
    if (q.length >= 3) {
      setSearching(true);
      timer.current = setTimeout(async () => {
        const r = await searchCity(q);
        setCityResults(r); setSearching(false);
      }, 400);
    } else { setCityResults([]); setSearching(false); }
  };

  const canSubmit = name && date && city;
  const is = { width:"100%", padding:"14px 0", background:"transparent", border:"none", borderBottom:`1px solid ${P.faint}40`, color:P.ink, fontSize:16, fontFamily:F.serif, outline:"none" };
  const ls = { fontFamily:F.sans, fontSize:8, letterSpacing:3, color:P.light, textTransform:"uppercase", marginBottom:4, display:"block" };

  return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 32px" }}>
      <p style={{ fontFamily:F.sans, fontSize:9, letterSpacing:5, textTransform:"uppercase", color:P.light, textAlign:"center", marginBottom:32 }}>✦ LUMINARY ✦</p>
      <div style={{ marginBottom:24 }}><label style={ls}>Your Name</label><input style={is} placeholder="First name" value={name} onChange={e=>setName(e.target.value)} /></div>
      <div style={{ marginBottom:24 }}><label style={ls}>Instagram (optional)</label><input style={is} placeholder="@handle" value={ig} onChange={e=>setIg(e.target.value)} /></div>
      <div style={{ marginBottom:24 }}><label style={ls}>Birth Date</label><input type="date" style={{...is,fontSize:15}} value={date} onChange={e=>setDate(e.target.value)} /></div>
      <div style={{ marginBottom:24 }}>
        <label style={ls}>Birth Time</label>
        {!noTime && <input type="time" style={{...is,fontSize:15}} value={time} onChange={e=>setTime(e.target.value)} />}
        <label style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, fontFamily:F.sans, fontSize:12, color:P.light, cursor:"pointer" }}>
          <input type="checkbox" checked={noTime} onChange={e=>{setNoTime(e.target.checked);if(e.target.checked)setTime("");}} /> I don't know my birth time
        </label>
      </div>
      <div style={{ marginBottom:28, position:"relative" }}>
        <label style={ls}>Birth City</label>
        <input style={is} placeholder="Start typing any city..." value={cityQ} onChange={e=>handleCitySearch(e.target.value)} onFocus={()=>{if(cityQ.length>=3)setShowCities(true);}} />
        {city && <p style={{ fontSize:12, color:P.sage, marginTop:4, fontFamily:F.sans }}>✓ {city.n}</p>}
        {searching && !city && <p style={{ fontSize:11, color:P.light, marginTop:4, fontFamily:F.sans }}>Searching...</p>}
        {showCities && cityResults.length > 0 && !city && (
          <div style={{ position:"absolute", top:"100%", left:0, right:0, background:P.card, border:`1px solid ${P.border}`, borderRadius:8, maxHeight:220, overflowY:"auto", zIndex:100, marginTop:4, boxShadow:P.shUp }}>
            {cityResults.map((c,i) => (
              <div key={i} onClick={()=>{setCity(c);setCityQ(c.n);setShowCities(false);}} style={{ padding:"12px 14px", cursor:"pointer", borderBottom:`1px solid ${P.border}`, color:P.ink, fontSize:14, fontFamily:F.sans }}>{c.n}</div>
            ))}
          </div>
        )}
      </div>
      <button onClick={()=>canSubmit&&onSubmit({name,ig,date,time:noTime?"unknown":time,lat:city.lat,lon:city.lon,city:city.n})} disabled={!canSubmit} style={{ width:"100%", padding:"15px", fontFamily:F.sans, fontSize:10, fontWeight:600, letterSpacing:2.5, textTransform:"uppercase", color:"#FFF", background:canSubmit?P.ink:P.faint, border:"none", borderRadius:24, cursor:canSubmit?"pointer":"default", boxShadow:canSubmit?P.shUp:"none" }}>
        Continue
      </button>
    </div>
  );
}

// ═══ QUESTIONS ═══
function Questions({ onSubmit, name }) {
  const [focus, setFocus] = useState("");
  const [energy, setEnergy] = useState("");
  const [seeking, setSeeking] = useState("");
  const opts = (items, val, set) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
      {items.map(item => (
        <button key={item} onClick={()=>set(item)} style={{ fontFamily:F.sans, fontSize:12, padding:"10px 16px", borderRadius:20, border:`1.5px solid ${val===item?P.gold:P.faint}`, background:val===item?P.goldBg:"transparent", color:val===item?P.gold:P.mid, cursor:"pointer" }}>{item}</button>
      ))}
    </div>
  );
  const canSubmit = focus && energy && seeking;
  return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 32px" }}>
      <p style={{ fontFamily:F.serif, fontSize:22, color:P.ink, marginBottom:32 }}>Hi {name}. <span style={{color:P.light}}>Help me personalize your reading.</span></p>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:F.sans, fontSize:11, letterSpacing:1, color:P.mid, fontWeight:600 }}>What area of life needs attention?</p>
        {opts(["Career","Love","Health","Purpose","Money","Family"], focus, setFocus)}
      </div>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:F.sans, fontSize:11, letterSpacing:1, color:P.mid, fontWeight:600 }}>How's your energy right now?</p>
        {opts(["Overwhelmed","Restless","Grounded","Inspired","Drained","Uncertain"], energy, setEnergy)}
      </div>
      <div style={{ marginBottom:32 }}>
        <p style={{ fontFamily:F.sans, fontSize:11, letterSpacing:1, color:P.mid, fontWeight:600 }}>What are you seeking?</p>
        {opts(["Clarity","Confirmation","Comfort","Direction","Courage","Understanding"], seeking, setSeeking)}
      </div>
      <button onClick={()=>canSubmit&&onSubmit({focus,energy,seeking})} disabled={!canSubmit} style={{ width:"100%", padding:"15px", fontFamily:F.sans, fontSize:10, fontWeight:600, letterSpacing:2.5, textTransform:"uppercase", color:"#FFF", background:canSubmit?P.ink:P.faint, border:"none", borderRadius:24, cursor:canSubmit?"pointer":"default" }}>
        Read my stars
      </button>
    </div>
  );
}

// ═══ LOADING ═══
function LoadingScreen({ name }) {
  const [dots, setDots] = useState("");
  useEffect(() => { const i = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500); return () => clearInterval(i); }, []);
  return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
      <p style={{ fontFamily:F.serif, fontSize:24, color:P.ink, marginBottom:8 }}>Reading the stars{dots}</p>
      <p style={{ fontFamily:F.sans, fontSize:12, color:P.light }}>Calculating {name}'s natal chart</p>
    </div>
  );
}

// ═══ READING CARDS ═══
const CARD_COLORS = [
  { accent:P.terra, bg:P.terraBg },
  { accent:P.blush, bg:P.blushBg },
  { accent:P.sage, bg:P.sageBg },
  { accent:P.violet, bg:P.violetBg },
];

function ReadingScreen({ chartData, reading, name, onChat, onReset }) {
  const [expanded, setExpanded] = useState(0);
  const { sun, moon, rising, intensity } = chartData;
  return (
    <div style={{ minHeight:"100dvh", background:P.bg, padding:"28px 18px 100px" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <p style={{ fontFamily:F.sans, fontSize:7, letterSpacing:4, color:P.light, textTransform:"uppercase", marginBottom:8 }}>YOUR READING</p>
        <h2 style={{ fontFamily:F.serif, fontSize:26, fontWeight:600, color:P.ink, marginBottom:4 }}>{name}</h2>
        <p style={{ fontFamily:F.sans, fontSize:12, color:P.mid }}>{ZG[sun]||""} {sun} Sun · {ZG[moon]||""} {moon} Moon{rising!=="Unknown"?` · ${ZG[rising]||""} ${rising} Rising`:""}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12 }}>
          <p style={{ fontFamily:F.sans, fontSize:10, color:P.light, letterSpacing:1 }}>INTENSITY</p>
          <div style={{ width:80, height:6, borderRadius:3, background:P.warm }}>
            <div style={{ width:`${intensity*10}%`, height:"100%", borderRadius:3, background:`linear-gradient(90deg, ${P.sage}, ${P.gold})` }} />
          </div>
          <p style={{ fontFamily:F.sans, fontSize:12, fontWeight:700, color:P.gold }}>{intensity}/10</p>
        </div>
      </div>

      {/* Your Line — the screenshot moment */}
      {reading.line && (
        <div style={{ background:P.night, borderRadius:16, padding:"28px 24px", marginBottom:20, textAlign:"center" }}>
          <p style={{ fontFamily:F.serif, fontSize:18, fontWeight:400, color:"#F5F0E8", lineHeight:1.5, fontStyle:"italic" }}>"{reading.line}"</p>
          <p style={{ fontFamily:F.sans, fontSize:8, letterSpacing:3, color:"rgba(245,240,232,0.3)", textTransform:"uppercase", marginTop:12 }}>YOUR LINE · LUMINARY</p>
        </div>
      )}

      {/* Cards */}
      {reading.cards?.map((card, i) => {
        const colors = CARD_COLORS[i % CARD_COLORS.length];
        const isOpen = expanded === i;
        return (
          <div key={i} onClick={() => setExpanded(isOpen ? -1 : i)} style={{ background:P.card, borderRadius:14, padding:"18px 20px", marginBottom:10, cursor:"pointer", border:`1px solid ${P.border}`, boxShadow:isOpen?P.shUp:P.sh, transition:"all 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{card.planet}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:F.sans, fontSize:9, letterSpacing:2, color:colors.accent, textTransform:"uppercase", fontWeight:600 }}>{card.area}</p>
                <p style={{ fontFamily:F.serif, fontSize:16, color:P.ink, fontWeight:500 }}>{card.title}</p>
              </div>
              <span style={{ fontSize:14, color:P.faint, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.3s" }}>▾</span>
            </div>
            {isOpen && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${P.border}` }}>
                <p style={{ fontFamily:F.serif, fontSize:15, color:P.mid, lineHeight:1.7 }}>{card.body}</p>
                <button onClick={e=>{e.stopPropagation();}} style={{ marginTop:12, fontFamily:F.sans, fontSize:9, letterSpacing:2, color:P.sage, background:P.sageBg, border:`1px solid ${P.sage}30`, padding:"6px 14px", borderRadius:16, cursor:"pointer", textTransform:"uppercase" }}>Share</button>
              </div>
            )}
          </div>
        );
      })}

      {/* Mantra */}
      {reading.mantra && (
        <div style={{ background:P.goldBg, borderRadius:14, padding:"20px 24px", marginTop:16, textAlign:"center", border:`1px solid ${P.gold}20` }}>
          <p style={{ fontFamily:F.sans, fontSize:8, letterSpacing:3, color:P.gold, textTransform:"uppercase", marginBottom:8 }}>THIS WEEK'S MANTRA</p>
          <p style={{ fontFamily:F.serif, fontSize:17, color:P.ink, fontStyle:"italic", lineHeight:1.5 }}>{reading.mantra}</p>
        </div>
      )}

      {/* Floating Ask Luminary button */}
      <div style={{ position:"fixed", bottom:20, right:20, zIndex:100 }}>
        <button onClick={onChat} style={{ fontFamily:F.sans, fontSize:10, fontWeight:600, letterSpacing:1, color:"#FFF", background:P.ink, border:"none", padding:"12px 20px", borderRadius:24, cursor:"pointer", boxShadow:"0 4px 16px rgba(42,33,24,0.15)", display:"flex", alignItems:"center", gap:6 }}>
          ✦ Ask Luminary
        </button>
      </div>

      {/* New reading */}
      <div style={{ textAlign:"center", marginTop:32 }}>
        <button onClick={onReset} style={{ fontFamily:F.sans, fontSize:10, color:P.light, background:"transparent", border:"none", cursor:"pointer", letterSpacing:1 }}>New Reading</button>
      </div>
    </div>
  );
}

// ═══ AI CHAT ═══
function ChatScreen({ chartData, name, onBack }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: `Welcome, ${name}. I have your complete natal chart — ${chartData.sun} Sun, ${chartData.moon} Moon${chartData.rising!=="Unknown"?`, ${chartData.rising} Rising`:""}. What would you like to explore?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput(""); setLoading(true);
    const updated = [...msgs, { role: "user", text: userMsg }];
    setMsgs(updated);
    try {
      const apiMsgs = [{ role: "user", content: `Chart: ${chartData.promptText}\nQuerent: ${name}` }];
      updated.forEach(m => apiMsgs.push({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: apiMsgs, userName: name }) });
      const d = await r.json();
      setMsgs(p => [...p, { role: "assistant", text: d.reply }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Connection lost. Try again?" }]); }
    setLoading(false);
  };

  return (
    <div style={{ height:"100dvh", background:P.bg, display:"flex", flexDirection:"column", fontFamily:F.sans }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${P.border}`, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:P.gold, fontSize:14, cursor:"pointer" }}>← Back</button>
        <span style={{ fontSize:9, letterSpacing:4, color:P.gold }}>✦ LUMINARY AI ✦</span>
      </div>
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom:14, textAlign:m.role==="user"?"right":"left" }}>
            <div style={{ display:"inline-block", maxWidth:"82%", padding:"12px 16px", borderRadius:14, fontSize:14, lineHeight:1.7, fontFamily:F.serif, background:m.role==="user"?P.goldBg:P.card, color:m.role==="user"?P.ink:P.mid, border:`1px solid ${m.role==="user"?P.gold+"20":P.border}` }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign:"left" }}><div style={{ display:"inline-block", padding:"12px 16px", borderRadius:14, background:P.card, border:`1px solid ${P.border}`, color:P.faint, fontSize:13 }}>Reading the stars...</div></div>}
      </div>
      <div style={{ padding:"10px 18px 24px", borderTop:`1px solid ${P.border}`, display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{ flex:1, padding:"12px 16px", borderRadius:20, border:`1px solid ${P.border}`, background:P.card, fontSize:14, fontFamily:F.sans, color:P.ink, outline:"none" }} />
        <button onClick={send} disabled={loading||!input.trim()} style={{ width:44, height:44, borderRadius:22, background:P.ink, border:"none", color:"#FFF", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
      </div>
    </div>
  );
}

// ═══ ADMIN ═══
function AdminScreen({ onBack }) {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", mk: "fateh0505" }) });
      const d = await r.json();
      setUsers(d.users || []);
    } catch {}
    setLoading(false);
  };

  if (!authed) return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
      <p style={{ fontFamily:F.sans, fontSize:9, letterSpacing:4, color:P.light, marginBottom:16 }}>ADMIN</p>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="84245577"){setAuthed(true);loadUsers();}}} placeholder="Password" style={{ padding:"12px 16px", borderRadius:8, border:`1px solid ${P.border}`, fontSize:16, textAlign:"center", width:200 }} />
      <button onClick={()=>{if(pw==="84245577"){setAuthed(true);loadUsers();}}} style={{ marginTop:12, padding:"10px 24px", background:P.ink, color:"#FFF", border:"none", borderRadius:8, cursor:"pointer", fontFamily:F.sans, fontSize:12 }}>Enter</button>
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh", background:P.bg, padding:"20px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:P.gold, fontSize:13, cursor:"pointer", fontFamily:F.sans }}>← Home</button>
        <p style={{ fontFamily:F.sans, fontSize:9, letterSpacing:4, color:P.light }}>LUMINARY ADMIN</p>
      </div>
      <p style={{ fontFamily:F.serif, fontSize:22, color:P.ink, marginBottom:16 }}>{users.length} readings</p>
      {loading && <p style={{color:P.light}}>Loading...</p>}
      {users.map((u, i) => (
        <div key={i} style={{ background:P.card, borderRadius:10, padding:"14px 16px", marginBottom:8, border:`1px solid ${P.border}` }}>
          <p style={{ fontFamily:F.sans, fontSize:14, fontWeight:600, color:P.ink }}>{u.name} <span style={{ fontSize:11, color:P.light }}>{u.ig ? `@${u.ig}` : ""}</span></p>
          <p style={{ fontFamily:F.sans, fontSize:11, color:P.light, marginTop:2 }}>{u.chart?.sun} · {u.chart?.moon} · {u.chart?.rising} · Intensity {u.chart?.intensity}/10</p>
          <p style={{ fontFamily:F.sans, fontSize:10, color:P.faint, marginTop:4 }}>{new Date(u.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

// ═══ MAIN APP ═══
export default function Luminary() {
  const [screen, setScreen] = useState("landing");
  const [birthData, setBirthData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState(null);

  const generate = async (bd, ans) => {
    setScreen("loading");
    try {
      // 1. Calculate chart
      const chartRes = await fetch("/api/chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bd) });
      const chart = await chartRes.json();
      if (chart.error) throw new Error(chart.error);
      setChartData(chart);

      // 2. Generate reading
      const horoRes = await fetch("/api/horoscope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chartText: chart.promptText, name: bd.name, ...ans }) });
      const horo = await horoRes.json();
      if (horo.error) throw new Error(horo.error);
      setReading(horo);

      // 3. Save to blob
      saveReading({ name: bd.name, ig: bd.ig, chart, reading: horo, answers: ans });

      setScreen("reading");
    } catch (e) {
      console.error(e);
      setError(e.message);
      setScreen("error");
    }
  };

  const reset = () => { setBirthData(null); setAnswers(null); setChartData(null); setReading(null); setError(null); setScreen("landing"); };

  if (screen === "landing") return <Landing onStart={() => setScreen("input")} />;
  if (screen === "input") return <BirthInput onSubmit={(bd) => { setBirthData(bd); setScreen("questions"); }} />;
  if (screen === "questions") return <Questions onSubmit={(ans) => { setAnswers(ans); generate(birthData, ans); }} name={birthData?.name || ""} />;
  if (screen === "loading") return <LoadingScreen name={birthData?.name || ""} />;
  if (screen === "reading" && chartData && reading) return <ReadingScreen chartData={chartData} reading={reading} name={birthData?.name||""} onChat={()=>setScreen("chat")} onReset={reset} />;
  if (screen === "chat" && chartData) return <ChatScreen chartData={chartData} name={birthData?.name||""} onBack={()=>setScreen("reading")} />;
  if (screen === "admin") return <AdminScreen onBack={reset} />;
  if (screen === "error") return (
    <div style={{ minHeight:"100dvh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center" }}>
      <p style={{ fontFamily:F.serif, fontSize:22, color:P.ink, marginBottom:8 }}>Something went wrong</p>
      <p style={{ fontFamily:F.sans, fontSize:13, color:P.light, marginBottom:20 }}>{error}</p>
      <button onClick={()=>generate(birthData,answers)} style={{ padding:"12px 28px", background:P.ink, color:"#FFF", border:"none", borderRadius:20, cursor:"pointer", fontFamily:F.sans, fontSize:11, marginBottom:8 }}>Try Again</button>
      <button onClick={reset} style={{ background:"none", border:"none", color:P.light, cursor:"pointer", fontFamily:F.sans, fontSize:11 }}>Start Over</button>
    </div>
  );
  return <Landing onStart={() => setScreen("landing")} />;
}

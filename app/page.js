"use client";
import React, { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   LUMINARY V7.5 — 100X REDESIGN
   "Your week, before it happens."
   
   Warm editorial scroll. Not slides.
   Funny loading. Shareable moments.
   One-screen onboarding. Chat at bottom.
   ═══════════════════════════════════════════════════ */

// ─── Typography ───
const serif = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const sans = "'DM Sans', 'Inter', -apple-system, sans-serif";

// ─── Colors: Warm Editorial ───
const C = {
  bg: "#FBF7F0",        // warm cream
  card: "#FFFFFF",       // clean white
  deep: "#1A1612",       // almost black (text)
  sub: "#6B5E52",        // warm grey
  dim: "#9B8E82",        // lighter warm grey
  amber: "#C17B3A",      // burnt amber (primary accent)
  sage: "#7A8B6F",       // sage green
  rose: "#C4706A",       // soft rose
  gold: "#B8963F",       // warm gold
  sky: "#8BA5B5",        // cool blue-grey (warnings)
  border: "#E8E0D6",     // warm border
  glow: "rgba(193,123,58,0.08)", // amber glow
  // Dark mode
  darkBg: "#0F1117",
  darkCard: "#181C24",
  darkBorder: "#2A2E38",
  darkText: "#F0EBE3",
};

// ─── Fade In ───
function Fade({ children, delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s cubic-bezier(0.23,1,0.32,1)", ...style }}>{children}</div>;
}

// ─── City Database (compact) ───
const CITIES=[{n:"New York",lat:40.71,lng:-74.01,tz:-5},{n:"Los Angeles",lat:34.05,lng:-118.24,tz:-8},{n:"Chicago",lat:41.88,lng:-87.63,tz:-6},{n:"Houston",lat:29.76,lng:-95.37,tz:-6},{n:"Phoenix",lat:33.45,lng:-112.07,tz:-7},{n:"Philadelphia",lat:39.95,lng:-75.17,tz:-5},{n:"San Antonio",lat:29.42,lng:-98.49,tz:-6},{n:"San Diego",lat:32.72,lng:-117.16,tz:-8},{n:"Dallas",lat:32.78,lng:-96.80,tz:-6},{n:"Austin",lat:30.27,lng:-97.74,tz:-6},{n:"San Francisco",lat:37.77,lng:-122.42,tz:-8},{n:"Seattle",lat:47.61,lng:-122.33,tz:-8},{n:"Denver",lat:39.74,lng:-104.99,tz:-7},{n:"Washington DC",lat:38.91,lng:-77.04,tz:-5},{n:"Nashville",lat:36.16,lng:-86.78,tz:-6},{n:"Boston",lat:42.36,lng:-71.06,tz:-5},{n:"Portland",lat:45.52,lng:-122.68,tz:-8},{n:"Las Vegas",lat:36.17,lng:-115.14,tz:-8},{n:"Miami",lat:25.76,lng:-80.19,tz:-5},{n:"Atlanta",lat:33.75,lng:-84.39,tz:-5},{n:"Minneapolis",lat:44.98,lng:-93.27,tz:-6},{n:"Tampa",lat:27.95,lng:-82.46,tz:-5},{n:"New Orleans",lat:29.95,lng:-90.07,tz:-6},{n:"Detroit",lat:42.33,lng:-83.05,tz:-5},{n:"Salt Lake City",lat:40.76,lng:-111.89,tz:-7},{n:"Orlando",lat:28.54,lng:-81.38,tz:-5},{n:"Scottsdale",lat:33.49,lng:-111.93,tz:-7},{n:"Mesa",lat:33.42,lng:-111.83,tz:-7},{n:"Tempe",lat:33.43,lng:-111.94,tz:-7},{n:"Paradise Valley",lat:33.53,lng:-111.94,tz:-7},{n:"Boca Raton",lat:26.36,lng:-80.08,tz:-5},{n:"Beverly Hills",lat:34.07,lng:-118.40,tz:-8},{n:"Malibu",lat:34.03,lng:-118.78,tz:-8},{n:"Honolulu",lat:21.31,lng:-157.86,tz:-10},{n:"Anchorage",lat:61.22,lng:-149.90,tz:-9},{n:"Aurora IL",lat:41.76,lng:-88.32,tz:-6},{n:"London",lat:51.51,lng:-0.13,tz:0},{n:"Paris",lat:48.86,lng:2.35,tz:1},{n:"Rome",lat:41.90,lng:12.50,tz:1},{n:"Berlin",lat:52.52,lng:13.40,tz:1},{n:"Madrid",lat:40.42,lng:-3.70,tz:1},{n:"Amsterdam",lat:52.37,lng:4.90,tz:1},{n:"Tokyo",lat:35.68,lng:139.69,tz:9},{n:"Sydney",lat:-33.87,lng:151.21,tz:10},{n:"Toronto",lat:43.65,lng:-79.38,tz:-5},{n:"Vancouver",lat:49.28,lng:-123.12,tz:-8},{n:"Mexico City",lat:19.43,lng:-99.13,tz:-6},{n:"Dubai",lat:25.20,lng:55.27,tz:4},{n:"Tel Aviv",lat:32.09,lng:34.77,tz:2},{n:"Mumbai",lat:19.08,lng:72.88,tz:5.5},{n:"Singapore",lat:1.35,lng:103.82,tz:8},{n:"Seoul",lat:37.57,lng:127.00,tz:9},{n:"Melbourne",lat:-37.81,lng:144.96,tz:10},{n:"Auckland",lat:-36.85,lng:174.76,tz:12},{n:"Sao Paulo",lat:-23.55,lng:-46.63,tz:-3},{n:"Buenos Aires",lat:-34.60,lng:-58.38,tz:-3},{n:"Lake Las Vegas",lat:36.11,lng:-114.90,tz:-8},{n:"Northampton MA",lat:42.32,lng:-72.63,tz:-5},{n:"Chandler",lat:33.30,lng:-111.84,tz:-7},{n:"Gilbert",lat:33.35,lng:-111.79,tz:-7},{n:"Sedona",lat:34.87,lng:-111.76,tz:-7},{n:"Tucson",lat:32.22,lng:-110.93,tz:-7}];

// ─── Geocode fallback for cities not in list ───
async function geocodeCity(query) {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) return data.results;
  } catch (e) {}
  return [];
}

// ─── Build Prompt ───
function buildPrompt(name, cd) {
  const chartText = Object.entries(cd.chart).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
  const transitText = Object.entries(cd.transits).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
  const top = (cd.topAspects||[]).slice(0,8).join("\n");
  const timing = (cd.timing||[]).slice(0,5).map(t=>`${t.transit} ${t.aspect} ${t.natal}: peaks ${t.peak}`).join("\n");
  return `PRIVATE READING FOR: ${name}
NATAL: ${chartText}
TRANSITS: ${transitText}
${cd.unknownTime?"NOTE: Birth time unknown.":""}
INTENSITY: ${cd.intensity}/10

TOP ASPECTS:
${top}

TIMING:
${timing}

Generate a deeply personalized reading as JSON with these exact keys:
{
  "hook": "One powerful sentence about their most active transit. Make them gasp. Be specific to THEIR chart.",
  "love": "2-3 sentences about love/relationships this week. Warm, specific. Reference their Venus/Mars placements.",
  "work": "2-3 sentences about career/purpose. Sharp, actionable. Reference their Saturn/Jupiter.",
  "energy": "2-3 sentences about their physical/emotional energy. Reference their Moon sign.",
  "warning": "One specific thing to watch for. Day and time if possible. Slightly ominous but caring.",
  "gift": "One good thing coming. Specific timing. Make them look forward to something.",
  "yourLine": "One sentence summary of their entire week. This gets screenshotted and texted to friends. Make it memorable, slightly dangerous, true. Under 15 words.",
  "monthLove": "2-3 sentences about love this month.",
  "monthWork": "2-3 sentences about career this month.",
  "monthGrowth": "2-3 sentences about personal growth this month.",
  "monthEnergy": "2-3 sentences about energy/health this month."
}

VOICE: Smart funny friend who knows astrology. NOT a guru. Warm, specific, slightly dangerous. Observations that land because they're uncomfortably accurate. Never generic. Never mean. Use "you" language.
RESPOND WITH ONLY THE JSON. No markdown. No backticks.`;
}

/* ═══════════ LANDING ═══════════ */
function Landing({ onStart, onAdmin }) {
  const [taps, setTaps] = useState(0);
  const handleTap = () => { const t = taps + 1; setTaps(t); if (t >= 5) { setTaps(0); onAdmin(); } setTimeout(() => setTaps(0), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bg} 0%, #F5EDE1 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 28px", fontFamily: sans, position: "relative" }}>
      
      {/* Subtle warm glow */}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(193,123,58,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Fade delay={0}>
        <p onClick={handleTap} style={{ fontSize: 24, color: C.amber, cursor: "default", textAlign: "center", letterSpacing: 4 }}>✦</p>
      </Fade>

      <Fade delay={200}>
        <h1 style={{ fontFamily: serif, fontSize: 44, fontWeight: 300, color: C.deep, letterSpacing: 3, margin: "24px 0 0", textAlign: "center", lineHeight: 1.1 }}>LUMINARY</h1>
      </Fade>

      <Fade delay={400}>
        <p style={{ fontFamily: serif, fontSize: 19, color: C.amber, fontStyle: "italic", margin: "12px 0 40px", textAlign: "center", letterSpacing: 1 }}>Your week, before it happens.</p>
      </Fade>

      <Fade delay={600}>
        <p style={{ fontSize: 15, color: C.sub, textAlign: "center", maxWidth: 300, lineHeight: 1.7, marginBottom: 12 }}>Other apps know your sign.</p>
        <p style={{ fontSize: 15, color: C.deep, textAlign: "center", maxWidth: 300, lineHeight: 1.7, marginBottom: 36, fontWeight: 500 }}>This one knows your chart.</p>
      </Fade>

      <Fade delay={800}>
        <button onClick={onStart} style={{ background: C.deep, color: C.bg, border: "none", padding: "18px 52px", fontSize: 14, letterSpacing: 3, fontWeight: 500, cursor: "pointer", borderRadius: 2, fontFamily: sans, transition: "all 0.3s" }}>ENTER YOUR BIRTHDAY</button>
      </Fade>

      <Fade delay={1000}>
        <p style={{ fontSize: 12, color: C.dim, marginTop: 32, textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>Free. Takes 30 seconds. No account needed.</p>
      </Fade>
    </div>
  );
}

/* ═══════════ ONE-SCREEN ONBOARDING ═══════════ */
function Onboarding({ onSubmit }) {
  const [name, setName] = useState("");
  const [month, setMonth] = useState(""); const [day, setDay] = useState(""); const [year, setYear] = useState("");
  const [hour, setHour] = useState(""); const [minute, setMinute] = useState(""); const [ampm, setAmpm] = useState("PM");
  const [unknownTime, setUnknownTime] = useState(false);
  const [cityQ, setCityQ] = useState(""); const [city, setCity] = useState(null); const [suggestions, setSuggestions] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (cityQ.length < 2) { setSuggestions([]); return; }
    const q = cityQ.toLowerCase();
    const local = CITIES.filter(c => c.n.toLowerCase().includes(q)).slice(0, 6);
    if (local.length > 0) { setSuggestions(local); return; }
    // Debounced geocode for cities not in local list
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true);
      const results = await geocodeCity(cityQ);
      setSuggestions(results.map(r => ({ n: r.name, lat: r.lat, lng: r.lng, tz: r.tz })));
      setGeoLoading(false);
    }, 400);
  }, [cityQ]);

  const ready = name && month && day && year && city;

  const submit = () => {
    if (!ready) return;
    let h = unknownTime ? 12 : parseInt(hour || "12");
    const m = unknownTime ? 0 : parseInt(minute || "0");
    if (!unknownTime) {
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
    }
    onSubmit({
      name: name.trim(), year: parseInt(year), month: parseInt(month), day: parseInt(day),
      hour: h + m / 60, lat: city.lat, lng: city.lng, tz: city.tz, unknownTime, city: city.n,
    });
  };

  const inp = { width: "100%", padding: "14px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, color: C.deep, fontSize: 16, fontFamily: sans, outline: "none", boxSizing: "border-box" };
  const sm = { ...inp, width: "30%", textAlign: "center" };
  const lab = { fontSize: 11, color: C.dim, letterSpacing: 2, marginBottom: 6, display: "block", fontFamily: sans, fontWeight: 500, textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "36px 24px 60px", fontFamily: sans, maxWidth: 400, margin: "0 auto" }}>
      <Fade><p style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, color: C.deep, textAlign: "center", marginBottom: 4, lineHeight: 1.3 }}>Tell us when you arrived.</p></Fade>
      <Fade delay={100}><p style={{ fontSize: 13, color: C.dim, textAlign: "center", marginBottom: 32 }}>That's all we need.</p></Fade>

      <Fade delay={200}>
        <label style={lab}>Your name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={{ ...inp, marginBottom: 20 }} />

        <label style={lab}>Birthday</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input value={month} onChange={e => setMonth(e.target.value)} placeholder="MM" maxLength={2} style={sm} />
          <input value={day} onChange={e => setDay(e.target.value)} placeholder="DD" maxLength={2} style={sm} />
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="YYYY" maxLength={4} style={{ ...inp, width: "40%", textAlign: "center" }} />
        </div>

        {!unknownTime && (
          <>
            <label style={lab}>Birth time</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={hour} onChange={e => setHour(e.target.value)} placeholder="HH" maxLength={2} style={sm} />
              <input value={minute} onChange={e => setMinute(e.target.value)} placeholder="MM" maxLength={2} style={sm} />
              <select value={ampm} onChange={e => setAmpm(e.target.value)} style={{ ...inp, width: "40%", textAlign: "center" }}><option>AM</option><option>PM</option></select>
            </div>
          </>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.dim, marginBottom: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={unknownTime} onChange={e => setUnknownTime(e.target.checked)} style={{ accentColor: C.amber }} /> I don't know my birth time
        </label>

        <label style={lab}>Birth city</label>
        <input value={cityQ} onChange={e => { setCityQ(e.target.value); setCity(null); }} placeholder="Start typing..." style={{ ...inp, marginBottom: 4 }} />
        {geoLoading && <p style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Searching...</p>}
        {suggestions.length > 0 && !city && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 16, maxHeight: 180, overflow: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => { setCity(s); setCityQ(s.n); setSuggestions([]); }} style={{ padding: "12px 16px", cursor: "pointer", color: C.deep, fontSize: 14, borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}` : "none" }}>{s.n}</div>
            ))}
          </div>
        )}
        {city && <p style={{ fontSize: 12, color: C.sage, marginBottom: 20 }}>✓ {city.n}</p>}

        <button onClick={submit} disabled={!ready} style={{ width: "100%", background: ready ? C.deep : C.border, color: ready ? C.bg : C.dim, border: "none", padding: "18px", fontSize: 14, letterSpacing: 2, fontWeight: 500, cursor: ready ? "pointer" : "default", borderRadius: 2, fontFamily: sans, marginTop: 8, transition: "all 0.3s" }}>READ MY STARS</button>
      </Fade>
    </div>
  );
}

/* ═══════════ FUNNY LOADING SCREEN ═══════════ */
function Loading({ name }) {
  const msgs = [
    `Mapping ${name}'s stars...`,
    "Found your Venus. She's been busy.",
    "Okay Saturn has opinions...",
    "Your chart is... interesting. Give us a second.",
    "Consulting the Moon. She's in a mood.",
    "Almost done. This one's good.",
    "Pulling your week together...",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 2200); return () => clearInterval(t); }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: sans, padding: 32 }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.amber, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Fade key={idx}><p style={{ color: C.sub, fontSize: 15, marginTop: 24, fontStyle: "italic", textAlign: "center", fontFamily: serif }}>{msgs[idx]}</p></Fade>
    </div>
  );
}

/* ═══════════ THE READING (Scroll, not slides) ═══════════ */
function Reading({ name, reading, chartData, onChat, onChart, onShare, onLogout }) {
  const sectionStyle = (accent) => ({
    padding: "32px 24px", marginBottom: 2,
    background: C.card,
    borderLeft: `3px solid ${accent}`,
  });
  const titleStyle = (accent) => ({
    fontFamily: sans, fontSize: 10, fontWeight: 600, letterSpacing: 3, color: accent, textTransform: "uppercase", marginBottom: 10,
  });
  const bodyStyle = {
    fontFamily: serif, fontSize: 18, color: C.deep, lineHeight: 1.9, fontWeight: 300,
  };

  // Tab state for weekly/monthly
  const [tab, setTab] = useState("weekly");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: sans, maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: serif, fontSize: 16, color: C.amber, letterSpacing: 2 }}>✦ LUMINARY</span>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: C.dim, fontSize: 12, cursor: "pointer" }}>Exit</button>
      </div>

      {/* Name + greeting */}
      <Fade>
        <div style={{ padding: "32px 24px 16px", textAlign: "center" }}>
          <p style={{ fontFamily: serif, fontSize: 14, color: C.dim, letterSpacing: 2, marginBottom: 4 }}>{name.toUpperCase()}'S READING</p>
          <p style={{ fontFamily: serif, fontSize: 12, color: C.dim }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </Fade>

      {/* Tab toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 24px 24px" }}>
        {["weekly", "monthly"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? C.deep : "transparent", color: tab === t ? C.bg : C.dim, border: `1px solid ${tab === t ? C.deep : C.border}`, padding: "8px 24px", borderRadius: 2, fontSize: 11, letterSpacing: 2, cursor: "pointer", fontFamily: sans, fontWeight: 500, textTransform: "uppercase" }}>{t}</button>
        ))}
      </div>

      {tab === "weekly" ? (
        <>
          {/* THE HOOK */}
          <Fade delay={100}>
            <div style={{ padding: "36px 28px", background: `linear-gradient(135deg, rgba(193,123,58,0.04) 0%, rgba(193,123,58,0.01) 100%)`, textAlign: "center", marginBottom: 2 }}>
              <p style={{ fontFamily: serif, fontSize: 22, color: C.deep, lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}>"{reading.hook}"</p>
            </div>
          </Fade>

          {/* LOVE */}
          <Fade delay={200}><div style={sectionStyle(C.rose)}>
            <p style={titleStyle(C.rose)}>Love</p>
            <p style={bodyStyle}>{reading.love}</p>
          </div></Fade>

          {/* WORK */}
          <Fade delay={300}><div style={sectionStyle(C.amber)}>
            <p style={titleStyle(C.amber)}>Work</p>
            <p style={bodyStyle}>{reading.work}</p>
          </div></Fade>

          {/* ENERGY */}
          <Fade delay={400}><div style={sectionStyle(C.sage)}>
            <p style={titleStyle(C.sage)}>Energy</p>
            <p style={bodyStyle}>{reading.energy}</p>
          </div></Fade>

          {/* WARNING */}
          <Fade delay={500}><div style={sectionStyle(C.sky)}>
            <p style={titleStyle(C.sky)}>Watch For</p>
            <p style={bodyStyle}>{reading.warning}</p>
          </div></Fade>

          {/* GIFT */}
          <Fade delay={600}><div style={sectionStyle(C.gold)}>
            <p style={titleStyle(C.gold)}>Coming Your Way</p>
            <p style={bodyStyle}>{reading.gift}</p>
          </div></Fade>
        </>
      ) : (
        <>
          <Fade delay={100}><div style={sectionStyle(C.rose)}>
            <p style={titleStyle(C.rose)}>Love This Month</p>
            <p style={bodyStyle}>{reading.monthLove}</p>
          </div></Fade>
          <Fade delay={200}><div style={sectionStyle(C.amber)}>
            <p style={titleStyle(C.amber)}>Work This Month</p>
            <p style={bodyStyle}>{reading.monthWork}</p>
          </div></Fade>
          <Fade delay={300}><div style={sectionStyle(C.sage)}>
            <p style={titleStyle(C.sage)}>Growth This Month</p>
            <p style={bodyStyle}>{reading.monthGrowth}</p>
          </div></Fade>
          <Fade delay={400}><div style={sectionStyle(C.gold)}>
            <p style={titleStyle(C.gold)}>Energy This Month</p>
            <p style={bodyStyle}>{reading.monthEnergy}</p>
          </div></Fade>
        </>
      )}

      {/* YOUR LINE — The screenshot moment */}
      <Fade delay={700}>
        <div style={{ padding: "48px 28px", textAlign: "center", background: C.deep, margin: "2px 0" }}>
          <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 4, color: C.dim, marginBottom: 16, textTransform: "uppercase" }}>Your line this week</p>
          <p style={{ fontFamily: serif, fontSize: 26, color: "#F0EBE3", lineHeight: 1.5, fontWeight: 300 }}>{reading.yourLine}</p>
          <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 3, color: "rgba(193,123,58,0.6)", marginTop: 20 }}>✦ LUMINARY</p>
        </div>
      </Fade>

      {/* Actions */}
      <Fade delay={800}>
        <div style={{ padding: "28px 24px", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onShare} style={{ background: "none", border: `1px solid ${C.border}`, color: C.sub, padding: "10px 20px", borderRadius: 2, fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>Share</button>
          <button onClick={onChart} style={{ background: "none", border: `1px solid ${C.border}`, color: C.sub, padding: "10px 20px", borderRadius: 2, fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>Your Chart</button>
        </div>
      </Fade>

      {/* Chat prompt */}
      <Fade delay={900}>
        <div style={{ padding: "24px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={onChat} style={{ width: "100%", padding: "18px", background: C.glow, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", textAlign: "left" }}>
            <p style={{ fontSize: 14, color: C.deep, fontFamily: serif, fontStyle: "italic" }}>Something on your mind? Ask Luminary.</p>
            <p style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Your chart has more to say.</p>
          </button>
        </div>
      </Fade>
    </div>
  );
}

/* ═══════════ BIRTH CHART ═══════════ */
function BirthChart({ chartData, name, onBack }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ct = Object.entries(chartData.chart).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
    fetch("/api/birthchart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chartText: ct, name, unknownTime: chartData.unknownTime }) })
      .then(r => r.json()).then(d => { setAnalysis(d.analysis); setLoading(false); }).catch(() => { setAnalysis("Unable to load. Try again."); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px", fontFamily: sans, maxWidth: 480, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.dim, fontSize: 13, cursor: "pointer", marginBottom: 24 }}>← Back</button>
      <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 300, color: C.deep, marginBottom: 16 }}>{name}'s Chart</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
        {Object.entries(chartData.chart).map(([k, v]) => (
          <span key={k} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "5px 10px", borderRadius: 2, fontSize: 11, color: ["Sun","Moon","Ascendant"].includes(k) ? C.amber : C.sub }}>{k}: {v.sign} {v.deg}°</span>
        ))}
      </div>
      {loading ? <p style={{ color: C.dim, fontStyle: "italic", fontFamily: serif }}>Reading your chart...</p> : (
        <div style={{ fontFamily: serif, fontSize: 17, color: C.deep, lineHeight: 2, whiteSpace: "pre-wrap", fontWeight: 300 }}>{analysis}</div>
      )}
    </div>
  );
}

/* ═══════════ CHAT ═══════════ */
function Chat({ chartData, name, onBack, saveChat }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: `Hey ${name}. I've been looking at your chart — there's a lot happening this week. What's on your mind?` }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);

  const send = () => {
    const txt = input.trim(); if (!txt || loading) return;
    setInput(""); setLoading(true);
    const um = txt;
    setMsgs(p => [...p, { role: "user", text: um }]);
    const ctx = Object.entries(chartData.chart).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°`).join(", ");
    const am = [...msgs.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })), { role: "user", content: um }];
    fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: am, userName: name, chartContext: ctx }) })
      .then(r => r.json()).then(d => {
        const reply = d.reply || "Let me try that again.";
        setMsgs(p => [...p, { role: "assistant", text: reply }]); setLoading(false);
        if (saveChat) saveChat(um, reply);
      }).catch(() => { setMsgs(p => [...p, { role: "assistant", text: "Lost connection. Try again?" }]); setLoading(false); });
  };

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: sans, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.dim, fontSize: 13, cursor: "pointer" }}>← Back</button>
        <span style={{ fontSize: 10, letterSpacing: 3, color: C.amber, fontFamily: serif }}>LUMINARY AI</span>
        <div style={{ width: 40 }} />
      </div>
      <div ref={ref} style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {msgs.map((m, i) => {
          const u = m.role === "user";
          return (<Fade key={i}><div style={{ marginBottom: 14, textAlign: u ? "right" : "left" }}>
            <div style={{ display: "inline-block", maxWidth: "85%", padding: "14px 18px", borderRadius: u ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 15, lineHeight: 1.8, background: u ? C.deep : C.card, color: u ? C.bg : C.deep, border: u ? "none" : `1px solid ${C.border}`, fontFamily: serif, fontWeight: 300 }}>{m.text}</div>
          </div></Fade>);
        })}
        {loading && <div style={{ padding: "14px 18px", display: "inline-block", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, color: C.dim, fontSize: 14, fontStyle: "italic", fontFamily: serif }}>Reading the stars...</div>}
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.bg }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="Ask about your chart..." style={{ flex: 1, padding: "14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, color: C.deep, fontSize: 15, fontFamily: serif, outline: "none" }} />
        <button onClick={send} style={{ background: C.deep, color: C.bg, border: "none", padding: "14px 24px", borderRadius: 2, fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}

/* ═══════════ ADMIN ═══════════ */
function Admin({ onBack }) {
  const [auth, setAuth] = useState(false); const [pass, setPass] = useState("");
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); try { const r = await fetch("/api/user?action=list&mk=84245577"); const d = await r.json(); setUsers(d.users || []); } catch (e) {} setLoading(false); };
  useEffect(() => { if (auth) load(); }, [auth]);

  if (!auth) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: sans }}>
      <p style={{ fontSize: 11, letterSpacing: 4, color: C.amber, marginBottom: 20 }}>✦ ADMIN</p>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && pass === "84245577") setAuth(true); }} placeholder="Password" style={{ padding: "14px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, color: C.deep, fontSize: 15, outline: "none", width: 240, textAlign: "center", marginBottom: 16 }} />
      <button onClick={() => { if (pass === "84245577") setAuth(true); }} style={{ background: C.deep, color: C.bg, border: "none", padding: "12px 36px", fontSize: 13, letterSpacing: 2, cursor: "pointer", borderRadius: 2, fontWeight: 500 }}>Enter</button>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.dim, fontSize: 13, marginTop: 20, cursor: "pointer" }}>← Back</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 16px", fontFamily: sans, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><p style={{ fontSize: 11, letterSpacing: 3, color: C.amber }}>✦ LUMINARY ADMIN</p><p style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{users.length} users</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ background: "none", border: `1px solid ${C.border}`, color: C.sub, padding: "6px 14px", borderRadius: 2, fontSize: 11, cursor: "pointer" }}>Refresh</button>
          <button onClick={() => { setAuth(false); setPass(""); }} style={{ background: "none", border: `1px solid ${C.rose}`, color: C.rose, padding: "6px 14px", borderRadius: 2, fontSize: 11, cursor: "pointer" }}>Lock</button>
        </div>
      </div>
      {loading ? <p style={{ color: C.dim }}>Loading...</p> : users.length === 0 ? <p style={{ color: C.dim }}>No users yet.</p> : users.map((u, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.deep, fontSize: 15, fontWeight: 500 }}>{u.name || "—"}{u.ig && <span style={{ color: C.dim, fontSize: 12, marginLeft: 8 }}>@{u.ig}</span>}</span>
            <span style={{ color: C.dim, fontSize: 11 }}>{u.chatCount || 0} chats</span>
          </div>
          <p style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>{u.sun && `☉ ${u.sun}`} {u.moon && `☽ ${u.moon}`} {u.rising && `↑ ${u.rising}`}</p>
          {u.city && <p style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{u.city}</p>}
        </div>
      ))}
    </div>
  );
}

/* ═══════════ ERROR ═══════════ */
function ErrScreen({ msg, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: sans, padding: 24 }}>
      <p style={{ color: C.rose, fontSize: 16, marginBottom: 12, fontFamily: serif }}>Something went sideways.</p>
      <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, textAlign: "center", maxWidth: 280 }}>{msg}</p>
      <button onClick={onRetry} style={{ background: C.deep, color: C.bg, border: "none", padding: "12px 32px", borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Try Again</button>
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */
export default function Luminary() {
  const [scr, setScr] = useState("landing");
  const [bd, setBd] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [reading, setReading] = useState(null);
  const [err, setErr] = useState(null);

  // ═══ DATA BRIDGE ═══
  const saveReading = (cd, r) => {
    const name = bd?.name || "";
    const ig = bd?.ig || "";
    const identifier = ig || name;
    if (!identifier) return;
    fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      action: "save", ig, name, sun: cd.chart?.Sun?.sign, moon: cd.chart?.Moon?.sign, rising: cd.chart?.Ascendant?.sign,
      chart: cd.chart, transits: cd.transits, aspects: cd.aspects, intensity: cd.intensity,
      horoscope: r, birthDate: bd ? `${bd.year}-${String(bd.month).padStart(2,"0")}-${String(bd.day).padStart(2,"0")}` : "",
      birthTime: bd?.unknownTime ? "unknown" : `${Math.floor(bd?.hour||12)}:${String(Math.round(((bd?.hour||12)%1)*60)).padStart(2,"0")}`,
      birthCity: bd?.city,
    })}).catch(e => console.error("Save failed:", e));
  };

  const saveChat = (userMsg, aiMsg) => {
    const name = bd?.name || ""; const ig = bd?.ig || "";
    const identifier = ig || name;
    if (!identifier) return;
    fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", ig, name, userMsg, aiMsg }) }).catch(() => {});
  };

  const onBirth = d => { setBd(d); setScr("loading"); generateReading(d); };

  const generateReading = (d) => {
    fetch("/api/chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: d.year, month: d.month, day: d.day, hour: d.hour, lat: d.lat, lng: d.lng, tz: d.tz, unknownTime: d.unknownTime }) })
      .then(r => r.json()).then(cd => {
        if (cd.error) { setErr("Chart: " + cd.error); setScr("error"); return; }
        cd.unknownTime = d.unknownTime;
        setChartData(cd);
        const prompt = buildPrompt(d.name, cd);
        return fetch("/api/horoscope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, name: d.name }) })
          .then(r => r.json()).then(h => {
            if (h.error) { setErr("Reading: " + h.error); setScr("error"); return; }
            // Parse: h.slides is now a single JSON object, not an array
            let r = h.slides || h;
            if (Array.isArray(r)) {
              // Fallback: old format returned array of slides
              r = { hook: r[0]?.body || "", love: r[1]?.body || "", work: r[2]?.body || "", energy: r[3]?.body || "", warning: "Trust your instincts this week.", gift: "Something good is on its way.", yourLine: "The stars are watching.", monthLove: r[4]?.body || "", monthWork: r[5]?.body || "", monthGrowth: r[6]?.body || "", monthEnergy: r[7]?.body || "" };
            }
            setReading(r);
            saveReading(cd, r);
            setScr("reading");
          });
      }).catch(e => { setErr(e.message); setScr("error"); });
  };

  const share = () => {
    const u = window.location.href;
    if (navigator.share) navigator.share({ title: "Luminary", text: reading?.yourLine || "Get your reading", url: u }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(u).catch(() => prompt("Copy:", u));
    else prompt("Copy:", u);
  };

  const logout = () => { setBd(null); setChartData(null); setReading(null); setScr("landing"); };

  if (scr === "landing") return <Landing onStart={() => setScr("input")} onAdmin={() => setScr("admin")} />;
  if (scr === "admin") return <Admin onBack={() => setScr("landing")} />;
  if (scr === "input") return <Onboarding onSubmit={onBirth} />;
  if (scr === "loading") return <Loading name={bd?.name || ""} />;
  if (scr === "error") return <ErrScreen msg={err} onRetry={() => { setErr(null); setScr("input"); }} />;
  if (scr === "reading" && reading) return <Reading name={bd?.name||""} reading={reading} chartData={chartData} onChat={() => setScr("chat")} onChart={() => setScr("chart")} onShare={share} onLogout={logout} />;
  if (scr === "chart" && chartData) return <BirthChart chartData={chartData} name={bd?.name||""} onBack={() => setScr("reading")} />;
  if (scr === "chat" && chartData) return <Chat chartData={chartData} name={bd?.name||""} onBack={() => setScr("reading")} saveChat={saveChat} />;
  return <Landing onStart={() => setScr("input")} onAdmin={() => setScr("admin")} />;
}

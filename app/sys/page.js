"use client";
import React, { useState, useEffect } from "react";

const BG = "#0F1117", CARD = "#181C24", BORDER = "#2A2E38", GOLD = "#C9A84C", CREAM = "#F0EBE3", DIM = "#6B7B8D", ROSE = "#D4736E";

export default function SysPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState("roster");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compResult, setCompResult] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [busy, setBusy] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/user?action=list&mk=fateh0505");
      const d = await r.json();
      setUsers(d.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadDetail = async (u) => {
    setSelected(u);
    setView("detail");
    setDetail(null);
    try {
      const r = await fetch(`/api/user?action=deep&mk=fateh0505&key=${u.key}`);
      const d = await r.json();
      setDetail(d.user || null);
    } catch (e) { console.error(e); }
  };

  const runComp = async () => {
    if (!detail?.chart) return;
    setBusy("comp");
    try {
      const chartText = Object.entries(detail.chart).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
      const r = await fetch("/api/synastry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chart2: chartText, name2: detail.name || "User", mk: "fateh0505" }) });
      const d = await r.json();
      setCompResult(d.analysis || "No result");
      setView("comp");
    } catch (e) { setCompResult("Error: " + e.message); setView("comp"); }
    setBusy("");
  };

  const runEval = async () => {
    if (!detail?.chart) return;
    setBusy("eval");
    try {
      const chartText = Object.entries(detail.chart).map(([k,v]) => `${k}: ${v.sign} ${v.deg}°${v.min}'`).join(", ");
      const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chart: chartText, chatHistory: detail.chatHistory, answers: detail.answers, name: detail.name, mk: "fateh0505" }) });
      const d = await r.json();
      setEvalResult(d.profile || "No result");
      setView("eval");
    } catch (e) { setEvalResult("Error: " + e.message); setView("eval"); }
    setBusy("");
  };

  useEffect(() => { if (auth) load(); }, [auth]);

  const f = "'DM Sans', sans-serif";
  const btn = (label, v) => <button onClick={() => setView(v)} style={{ background: view === v ? "rgba(201,168,76,0.15)" : "transparent", border: `1px solid ${view === v ? GOLD : BORDER}`, color: view === v ? GOLD : DIM, padding: "8px 16px", borderRadius: 4, fontSize: 11, cursor: "pointer", letterSpacing: 2, fontFamily: f, textTransform: "uppercase" }}>{label}</button>;

  if (!auth) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: f }}>
      <p style={{ fontSize: 10, letterSpacing: 6, color: GOLD, marginBottom: 20 }}>SYS / DIAGNOSTICS</p>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && pass === "fateh0505") setAuth(true); }} placeholder="Access code" style={{ padding: "13px 16px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, color: CREAM, fontSize: 14, outline: "none", width: 240, textAlign: "center", marginBottom: 16 }} />
      <button onClick={() => { if (pass === "fateh0505") setAuth(true); }} style={{ background: GOLD, color: BG, border: "none", padding: "11px 36px", fontSize: 12, letterSpacing: 2, cursor: "pointer", borderRadius: 4 }}>Enter</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "20px 16px", fontFamily: f, color: CREAM }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, color: GOLD }}>SYS / DIAGNOSTICS</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setAuth(false); setPass(""); }} style={{ background: "none", border: `1px solid ${BORDER}`, color: DIM, padding: "6px 12px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>EXIT</button>
          <button onClick={load} style={{ background: "none", border: `1px solid ${BORDER}`, color: DIM, padding: "6px 12px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>SYNC</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {btn("Roster", "roster")}
        {btn("Detail", "detail")}
        {btn("Compatibility", "comp")}
        {btn("Evaluation", "eval")}
        {btn("Messaging", "msg")}
      </div>

      {view === "roster" && (
        <div>
          <p style={{ fontSize: 11, color: DIM, marginBottom: 12 }}>{users.length} RECORDS</p>
          {loading ? <p style={{ color: DIM }}>Loading...</p> : users.map((u, i) => (
            <div key={i} onClick={() => loadDetail(u)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 16px", marginBottom: 6, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: CREAM, fontSize: 14 }}>{u.name || "—"}{u.ig && <span style={{ color: DIM, marginLeft: 8, fontSize: 11 }}>@{u.ig}</span>}</span>
                <span style={{ color: DIM, fontSize: 10 }}>{u.chatCount || 0} chats</span>
              </div>
              <p style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>{u.sun && `☉ ${u.sun}`} {u.moon && `☽ ${u.moon}`} {u.rising && `↑ ${u.rising}`}</p>
              {u.city && <p style={{ fontSize: 10, color: DIM, marginTop: 2 }}>{u.city} · {u.birthDate}</p>}
            </div>
          ))}
        </div>
      )}

      {view === "detail" && (
        <div>
          {!detail ? <p style={{ color: DIM }}>Select a user from the roster.</p> : (
            <div>
              <h3 style={{ color: CREAM, fontSize: 18, marginBottom: 12 }}>{detail.name || "—"}{detail.ig && <span style={{ color: DIM, fontSize: 13, marginLeft: 8 }}>@{detail.ig}</span>}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {detail.chart && Object.entries(detail.chart).map(([k, v]) => (
                  <span key={k} style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "4px 10px", borderRadius: 4, fontSize: 10, color: ["Sun","Moon","Ascendant"].includes(k) ? GOLD : DIM }}>{k}: {v.sign} {v.deg}°</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: DIM, marginBottom: 4 }}>City: {detail.birthCity || "—"} · Date: {detail.birthDate || "—"} · Time: {detail.birthTime || "—"}</p>
              <p style={{ fontSize: 11, color: DIM, marginBottom: 16 }}>Readings: {detail.readingCount || 0} · Chats: {(detail.chatHistory || []).length} · Last active: {detail.lastActiveAt ? new Date(detail.lastActiveAt).toLocaleDateString() : "—"}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button onClick={runComp} disabled={!!busy} style={{ background: "none", border: `1px solid ${GOLD}`, color: GOLD, padding: "8px 16px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>{busy === "comp" ? "..." : "Run Compatibility"}</button>
                <button onClick={runEval} disabled={!!busy} style={{ background: "none", border: `1px solid ${ROSE}`, color: ROSE, padding: "8px 16px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>{busy === "eval" ? "..." : "Run Evaluation"}</button>
              </div>
              {detail.chatHistory && detail.chatHistory.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 8 }}>CHAT LOG</p>
                  {detail.chatHistory.slice(-20).map((m, i) => (
                    <div key={i} style={{ padding: "8px 12px", marginBottom: 4, background: m.role === "user" ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", borderRadius: 4, border: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 9, color: DIM, letterSpacing: 1 }}>{m.role === "user" ? "USER" : "LUMINARY"}</span>
                      <p style={{ fontSize: 12, color: CREAM, marginTop: 2 }}>{m.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === "comp" && (
        <div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: GOLD, marginBottom: 12 }}>COMPATIBILITY ANALYSIS</p>
          {compResult ? <pre style={{ fontSize: 13, color: CREAM, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Cormorant Garamond', serif" }}>{compResult}</pre> : <p style={{ color: DIM }}>Select a user and run compatibility.</p>}
        </div>
      )}

      {view === "eval" && (
        <div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: ROSE, marginBottom: 12 }}>PSYCHOLOGICAL EVALUATION</p>
          {evalResult ? <pre style={{ fontSize: 13, color: CREAM, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Cormorant Garamond', serif" }}>{evalResult}</pre> : <p style={{ color: DIM }}>Select a user and run evaluation.</p>}
        </div>
      )}

      {view === "msg" && (
        <div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 12 }}>ADC MESSAGING CONSOLE</p>
          <p style={{ color: DIM, fontSize: 13 }}>Coming in V7.6. Use the /api/adc endpoint directly for now.</p>
        </div>
      )}
    </div>
  );
}

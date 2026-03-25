"use client";
import React, { useState, useEffect } from "react";

/* System diagnostics — internal analytics platform */
const MK = "fateh0505";
const T = {
  a: "#C9A84C", b: "#7A8B6F", c: "#C4727F", d: "#9B8EC4",
  e: "#F5F0E8", f: "#0B0F14", g: "#6B7280", h: "#1B2B3A"
};

const REF = {
  planets: {
    Sun: { sign: "Taurus", deg: 14, longitude: 44.6 },
    Moon: { sign: "Sagittarius", deg: 14, longitude: 254 },
    Mercury: { sign: "Taurus", deg: 7, longitude: 37 },
    Venus: { sign: "Aries", deg: 9, longitude: 9 },
    Mars: { sign: "Aries", deg: 6, longitude: 6 },
    Jupiter: { sign: "Gemini", deg: 6, longitude: 66.8 },
    Saturn: { sign: "Leo", deg: 10, longitude: 130 },
    Uranus: { sign: "Scorpio", deg: 9, longitude: 219 },
    Neptune: { sign: "Sagittarius", deg: 15, longitude: 255 },
    Pluto: { sign: "Libra", deg: 11, longitude: 191 },
  },
  ascendant: { sign: "Gemini", deg: 16, longitude: 76 },
};

function Bar({ label, value, max = 10, color = T.a }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 11, color: T.g }}>{label}</span>
        <span style={{ fontSize: 11, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function SysPage() {
  const [ok, setOk] = useState(false);
  const [code, setCode] = useState("");
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("list");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState(null);
  const [compResult, setCompResult] = useState(null);
  const [compMode, setCompMode] = useState("romantic");
  const [evalResult, setEvalResult] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [ctxInput, setCtxInput] = useState("");
  const [msgResult, setMsgResult] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => { if (ok) pull(); }, [ok]);

  async function pull() {
    setBusy("pull");
    try {
      const r = await fetch(`/api/user?action=deep&mk=${MK}`);
      const d = await r.json();
      if (d.users) setItems(d.users);
    } catch (e) { setErr(e.message); }
    setBusy("");
  }

  async function runComp() {
    if (!sel?.chart) { setErr("No chart data"); return; }
    setBusy("comp"); setCompResult(null); setErr(null);
    try {
      const r = await fetch("/api/synastry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartA: REF, chartB: sel.chart, nameA: "Mat", nameB: sel.name, mode: compMode }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setCompResult(d);
      // Persist
      fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deepsave", ig: sel.ig, mk: MK, synastryData: d }) }).catch(() => {});
      setTab("comp");
    } catch (e) { setErr(e.message); }
    setBusy("");
  }

  async function runEval() {
    if (!sel?.chart) { setErr("No chart data"); return; }
    setBusy("eval"); setEvalResult(null); setErr(null);
    try {
      const r = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart: sel.chart, name: sel.name, ig: sel.ig, chatHistory: sel.chatHistory || [] }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setEvalResult(d);
      fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deepsave", ig: sel.ig, mk: MK, profileData: d }) }).catch(() => {});
      setTab("eval");
    } catch (e) { setErr(e.message); }
    setBusy("");
  }

  async function runMsg() {
    const profile = evalResult || sel?.profileData;
    if (!profile) { setErr("Run evaluation first"); return; }
    if (!msgInput.trim()) { setErr("Paste their message"); return; }
    setBusy("msg"); setMsgResult(null); setErr(null);
    try {
      const r = await fetch("/api/adc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, synastry: compResult || sel?.synastryData, theirMessage: msgInput.trim(), context: ctxInput.trim() || null, name: sel?.name }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setMsgResult(d);
      setTab("msg");
    } catch (e) { setErr(e.message); }
    setBusy("");
  }

  async function saveNote() {
    if (!sel?.ig || !noteInput.trim()) return;
    try {
      await fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deepsave", ig: sel.ig, mk: MK, notes: noteInput.trim() }) });
      sel.notes = noteInput.trim();
      setNoteInput("");
    } catch (e) {}
  }

  async function deleteUser(key) {
    if (!key) return;
    if (!confirm("Delete this record permanently?")) return;
    try {
      const r = await fetch(`/api/user?action=delete&mk=${MK}&key=${encodeURIComponent(key)}`);
      const d = await r.json();
      if (d.success) {
        setItems(items.filter(u => u.key !== key));
        if (sel?.key === key) { setSel(null); setTab("list"); }
      } else {
        setErr(d.error || "Delete failed");
      }
    } catch (e) { setErr(e.message); }
  }

  async function toggleVerified() {
    if (!sel?.ig) return;
    const v = !sel.verified;
    try {
      await fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deepsave", ig: sel.ig, mk: MK, verified: v }) });
      sel.verified = v;
      setSel({ ...sel });
    } catch (e) {}
  }

  // Login
  if (!ok) {
    return (
      <div style={{ minHeight: "100vh", background: T.f, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: T.g, letterSpacing: 2, marginBottom: 20 }}>SYSTEM DIAGNOSTICS</div>
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && code === MK) setOk(true); }}
            placeholder="Auth key" autoFocus
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: T.e, padding: "12px 18px", borderRadius: 6, fontSize: 14, textAlign: "center", width: 180, outline: "none" }} />
        </div>
      </div>
    );
  }

  const cd = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 18, marginBottom: 14 };
  const lb = { fontSize: 9, letterSpacing: 3, color: T.g, textTransform: "uppercase", display: "block", marginBottom: 6 };
  const bt = (color = T.a, on = false) => ({
    background: on ? `${color}22` : "transparent", border: `1px solid ${on ? color : "rgba(255,255,255,0.1)"}`,
    color: on ? color : T.g, padding: "7px 13px", borderRadius: 6, cursor: "pointer", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "system-ui",
  });

  const allTabs = ["list", "detail", "comp", "eval", "msg"];
  const tabNames = { list: "Roster", detail: "Detail", comp: "Compatibility", eval: "Evaluation", msg: "Messaging" };

  return (
    <div style={{ minHeight: "100vh", background: T.f, color: T.e, fontFamily: "system-ui, sans-serif", padding: "16px 14px", maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.g, letterSpacing: 2 }}>SYS / DIAGNOSTICS</div>
        <button onClick={() => { setOk(false); setCode(""); }} style={bt(T.c)}>Exit</button>
      </div>

      {err && (
        <div style={{ padding: "8px 12px", background: `${T.c}18`, border: `1px solid ${T.c}33`, borderRadius: 6, marginBottom: 10, fontSize: 11, color: T.c, display: "flex", justifyContent: "space-between" }}>
          <span>{err}</span><span onClick={() => setErr(null)} style={{ cursor: "pointer" }}>✕</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
        {allTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={bt(t === "msg" ? T.c : T.a, tab === t)}>{tabNames[t]}</button>
        ))}
        <button onClick={pull} style={{ ...bt(T.b), marginLeft: "auto" }}>{busy === "pull" ? "..." : "Sync"}</button>
      </div>

      {/* ═══ ROSTER ═══ */}
      {tab === "list" && (
        <div>
          <span style={lb}>{items.length} records</span>
          {items.map((u, i) => (
            <div key={u.key || i} onClick={() => {
              setSel(u); setTab("detail");
              if (u.profileData) setEvalResult(u.profileData);
              if (u.synastryData) setCompResult(u.synastryData);
              setNoteInput(u.notes || "");
            }} style={{ ...cd, cursor: "pointer", borderColor: sel?.key === u.key ? T.a : "rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, color: T.e }}>{u.name} {u.verified ? "✓" : ""}</div>
                  {u.ig && <div style={{ fontSize: 11, color: T.b, marginTop: 1 }}>@{u.ig}</div>}
                  <div style={{ fontSize: 11, color: T.g, marginTop: 3 }}>
                    {u.chart?.planets?.Sun?.sign || "?"} · {u.chart?.planets?.Moon?.sign || "?"} · {u.chart?.ascendant?.sign || "?"}
                  </div>
                  <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {u.profileData?.mbti?.type && <span style={{ fontSize: 9, padding: "1px 6px", border: `1px solid ${T.a}33`, color: T.a, borderRadius: 3 }}>{u.profileData.mbti.type}</span>}
                    {u.profileData?.attachment?.primary && <span style={{ fontSize: 9, padding: "1px 6px", border: `1px solid ${T.d}33`, color: T.d, borderRadius: 3 }}>{u.profileData.attachment.primary}</span>}
                    {u.synastryData?.overallScore && <span style={{ fontSize: 9, padding: "1px 6px", border: `1px solid ${T.c}33`, color: T.c, borderRadius: 3 }}>{u.synastryData.overallScore}/100</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 10, color: T.g }}>
                  {u.sessions && <div>{u.sessions.length} sess</div>}
                  {u.chatHistory && <div style={{ color: T.d }}>{u.chatHistory.filter(m => m.role === "user").length} chat</div>}
                  {u.lastActiveAt && <div style={{ marginTop: 3 }}>{new Date(u.lastActiveAt).toLocaleDateString()}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ DETAIL ═══ */}
      {tab === "detail" && sel && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 22, color: T.e, fontWeight: 300 }}>{sel.name}</div>
              <button onClick={toggleVerified} style={{ ...bt(sel.verified ? T.b : T.g), fontSize: 9, padding: "3px 8px" }}>
                {sel.verified ? "✓ Verified" : "Unverified"}
              </button>
            </div>
            {sel.ig && <div style={{ fontSize: 13, color: T.b }}>@{sel.ig}</div>}
            <div style={{ fontSize: 11, color: T.g, marginTop: 2 }}>{sel.birthCity} · {sel.birthDate} {sel.birthTime || ""}</div>
          </div>

          {/* Chart */}
          {sel.chart?.planets && (
            <div style={cd}>
              <span style={lb}>Chart</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {Object.entries(sel.chart.planets).map(([p, d]) => (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize: 11, color: T.g }}>{p}</span>
                    <span style={{ fontSize: 11, color: T.e }}>{d.deg}° {d.sign}</span>
                  </div>
                ))}
              </div>
              {sel.chart.ascendant && <div style={{ marginTop: 6, fontSize: 11, color: T.a }}>ASC: {sel.chart.ascendant.deg}° {sel.chart.ascendant.sign}</div>}
            </div>
          )}

          {/* Answers */}
          {sel.answers && (
            <div style={cd}>
              <span style={lb}>Intake</span>
              {Object.entries(sel.answers).map(([q, a]) => (
                <div key={q} style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.g }}>{q}: </span><span style={{ color: T.e }}>{a}</span></div>
              ))}
            </div>
          )}

          {/* Chat */}
          {sel.chatHistory?.length > 0 && (
            <div style={cd}>
              <span style={lb}>Chat ({sel.chatHistory.filter(m => m.role === "user").length} msgs)</span>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {sel.chatHistory.map((m, i) => (
                  <div key={i} style={{ marginBottom: 8, paddingLeft: m.role === "user" ? 0 : 10, borderLeft: m.role === "user" ? "none" : `2px solid ${T.d}` }}>
                    <div style={{ fontSize: 9, color: m.role === "user" ? T.a : T.d, letterSpacing: 1 }}>
                      {m.role === "user" ? sel.name?.toUpperCase() : "AI"} {m.ts ? new Date(m.ts).toLocaleTimeString() : ""}
                    </div>
                    <div style={{ fontSize: 11, color: T.e, lineHeight: 1.5 }}>{(m.content || "").substring(0, 400)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div style={cd}>
            <span style={lb}>Notes</span>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} rows={3} placeholder="Private notes about this person..."
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: T.e, padding: 10, borderRadius: 6, fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            <button onClick={saveNote} style={{ ...bt(T.b), marginTop: 6 }}>Save Note</button>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select value={compMode} onChange={(e) => setCompMode(e.target.value)}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: T.e, padding: "7px 10px", borderRadius: 6, fontSize: 11 }}>
              <option value="romantic">Romantic</option>
              <option value="platonic">Platonic</option>
            </select>
            <button onClick={runComp} disabled={!!busy} style={bt(T.c)}>{busy === "comp" ? "..." : "Compatibility"}</button>
            <button onClick={runEval} disabled={!!busy} style={bt(T.d)}>{busy === "eval" ? "..." : "Evaluate"}</button>
            <button onClick={() => deleteUser(sel?.key)} style={{ ...bt(T.c), marginLeft: "auto", borderColor: `${T.c}66` }}>Delete Record</button>
          </div>
        </div>
      )}

      {/* ═══ COMPATIBILITY ═══ */}
      {tab === "comp" && compResult && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: T.g, letterSpacing: 2 }}>{compMode.toUpperCase()} COMPATIBILITY</div>
            <div style={{ fontSize: 18, color: T.e, fontWeight: 300, lineHeight: 1.4, maxWidth: 480, margin: "4px auto" }}>{compResult.headline}</div>
            <div style={{ fontSize: 42, color: T.a, fontWeight: 300, marginTop: 6 }}>{compResult.overallScore}<span style={{ fontSize: 14, color: T.g }}>/100</span></div>
          </div>
          <div style={cd}>
            <Bar label="Magnetism" value={compResult.magnetism} color={T.c} />
            <Bar label="Communication" value={compResult.communication} color={T.b} />
            <Bar label="Emotional Depth" value={compResult.emotionalDepth} color={T.d} />
            <Bar label="Longevity" value={compResult.longevity} color={T.a} />
            <Bar label="Growth" value={compResult.growth} color={T.b} />
            <Bar label="Friction" value={compResult.friction} color={T.c} />
          </div>
          <div style={cd}>
            <span style={lb}>Analysis</span>
            <div style={{ fontSize: 13, color: T.e, lineHeight: 1.7 }}>{compResult.dynamics}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...cd, borderColor: `${T.b}33` }}>
              <span style={{ ...lb, color: T.b }}>Strengths</span>
              {compResult.strengthAspects?.map((a, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: T.b, fontWeight: 600 }}>{a.aspect}</div>
                  <div style={{ fontSize: 10, color: T.g, lineHeight: 1.4 }}>{a.meaning}</div>
                </div>
              ))}
            </div>
            <div style={{ ...cd, borderColor: `${T.c}33` }}>
              <span style={{ ...lb, color: T.c }}>Friction</span>
              {compResult.challengeAspects?.map((a, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: T.c, fontWeight: 600 }}>{a.aspect}</div>
                  <div style={{ fontSize: 10, color: T.g, lineHeight: 1.4 }}>{a.meaning}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...cd, borderColor: `${T.d}44`, background: `${T.d}08` }}>
            <span style={{ ...lb, color: T.d }}>Hidden Pattern</span>
            <div style={{ fontSize: 13, color: T.e, lineHeight: 1.6, fontStyle: "italic" }}>{compResult.hiddenDynamic}</div>
          </div>
          <div style={cd}>
            <span style={lb}>Advice</span>
            <div style={{ fontSize: 12, color: T.e, lineHeight: 1.6 }}>{compResult.advice}</div>
          </div>
        </div>
      )}

      {/* ═══ EVALUATION ═══ */}
      {tab === "eval" && evalResult && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: T.g, letterSpacing: 2 }}>EVALUATION</div>
            <div style={{ fontSize: 20, color: T.e, fontWeight: 300 }}>{sel?.name}</div>
            <div style={{ fontSize: 13, color: T.a, fontStyle: "italic", maxWidth: 460, margin: "4px auto" }}>{evalResult.oneSentence}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{ ...cd, textAlign: "center", padding: 12 }}>
              <span style={lb}>MBTI</span>
              <div style={{ fontSize: 20, color: T.a }}>{evalResult.mbti?.type}</div>
              <div style={{ fontSize: 9, color: T.g }}>{evalResult.mbti?.confidence}%</div>
            </div>
            <div style={{ ...cd, textAlign: "center", padding: 12 }}>
              <span style={lb}>Enneagram</span>
              <div style={{ fontSize: 20, color: T.d }}>{evalResult.enneagram?.core}w{evalResult.enneagram?.wing}</div>
            </div>
            <div style={{ ...cd, textAlign: "center", padding: 12 }}>
              <span style={lb}>Attachment</span>
              <div style={{ fontSize: 12, color: T.c }}>{evalResult.attachment?.primary}</div>
              <div style={{ fontSize: 9, color: T.g }}>Stress: {evalResult.attachment?.underStress}</div>
            </div>
          </div>
          <div style={cd}>
            <span style={lb}>Big Five</span>
            <Bar label="Openness" value={evalResult.bigFive?.openness} max={100} color={T.d} />
            <Bar label="Conscientiousness" value={evalResult.bigFive?.conscientiousness} max={100} color={T.b} />
            <Bar label="Extraversion" value={evalResult.bigFive?.extraversion} max={100} color={T.a} />
            <Bar label="Agreeableness" value={evalResult.bigFive?.agreeableness} max={100} color={T.b} />
            <Bar label="Neuroticism" value={evalResult.bigFive?.neuroticism} max={100} color={T.c} />
          </div>
          <div style={cd}>
            <span style={{ ...lb, color: T.b }}>Communication</span>
            <div style={{ marginBottom: 4, fontSize: 11 }}><span style={{ color: T.g }}>Mercury: </span><span style={{ color: T.e }}>{evalResult.communicationStyle?.mercury}</span></div>
            <div style={{ marginBottom: 4, fontSize: 11 }}><span style={{ color: T.b }}>Opens up when: </span><span style={{ color: T.e }}>{evalResult.communicationStyle?.lovesWhen}</span></div>
            <div style={{ marginBottom: 4, fontSize: 11 }}><span style={{ color: T.c }}>Shuts down when: </span><span style={{ color: T.e }}>{evalResult.communicationStyle?.shutsDown}</span></div>
            <div style={{ padding: "7px 10px", background: `${T.a}0A`, borderRadius: 6, marginTop: 6, fontSize: 11 }}>
              <span style={{ color: T.a }}>Best approach: </span><span style={{ color: T.e }}>{evalResult.communicationStyle?.bestApproach}</span>
            </div>
          </div>
          <div style={cd}>
            <span style={{ ...lb, color: T.c }}>Dating Intel</span>
            <div style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.g }}>Attracted to: </span><span style={{ color: T.e }}>{evalResult.datingProfile?.attractedTo}</span></div>
            <div style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.g }}>Repelled by: </span><span style={{ color: T.e }}>{evalResult.datingProfile?.repelledBy}</span></div>
            <div style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.g }}>Courtship signals: </span><span style={{ color: T.e }}>{evalResult.datingProfile?.courtshipStyle}</span></div>
            <div style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.g }}>Commitment: </span><span style={{ color: T.e }}>{evalResult.datingProfile?.commitmentSpeed}</span></div>
            <div style={{ marginBottom: 3, fontSize: 11 }}><span style={{ color: T.c }}>Deal breakers: </span><span style={{ color: T.e }}>{evalResult.datingProfile?.dealBreakers?.join(" · ")}</span></div>
          </div>
          <div style={{ ...cd, borderColor: `${T.c}33` }}>
            <span style={{ ...lb, color: T.c }}>Risk Factors</span>
            <div style={{ marginBottom: 6, fontSize: 11 }}><span style={{ color: T.g }}>Coping: </span><span style={{ color: T.e }}>{evalResult.mentalHealth?.copingStyle}</span></div>
            {evalResult.mentalHealth?.riskFactors?.map((r, i) => (
              <div key={i} style={{ padding: "5px 8px", borderLeft: `3px solid ${r.severity === "high" ? T.c : r.severity === "elevated" ? T.a : T.g}`, marginBottom: 5, background: "rgba(255,255,255,0.01)" }}>
                <div style={{ fontSize: 10, color: r.severity === "high" ? T.c : T.a }}>{r.pattern} — {r.severity}</div>
                <div style={{ fontSize: 10, color: T.g }}>{r.manifests}</div>
              </div>
            ))}
          </div>
          <div style={{ ...cd, borderColor: `${T.d}33`, background: `${T.d}06` }}>
            <span style={{ ...lb, color: T.d }}>Shadow</span>
            <div style={{ fontSize: 12, color: T.e, lineHeight: 1.5, marginBottom: 3 }}>{evalResult.shadowSide?.pattern}</div>
            <div style={{ fontSize: 10, color: T.c }}>Trigger: {evalResult.shadowSide?.trigger}</div>
            <div style={{ fontSize: 10, color: T.b }}>Antidote: {evalResult.shadowSide?.antidote}</div>
          </div>
        </div>
      )}

      {/* ═══ MESSAGING (ADC) ═══ */}
      {tab === "msg" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <span style={{ ...lb, color: T.c }}>MESSAGING CONSOLE {sel ? `— ${sel.name}` : ""}</span>
            <textarea value={msgInput} onChange={(e) => setMsgInput(e.target.value)} rows={3} placeholder="Paste their message here..."
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: T.e, padding: 10, borderRadius: 6, fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <textarea value={ctxInput} onChange={(e) => setCtxInput(e.target.value)} rows={2} placeholder="Extra context (optional — where you are in the convo, what happened, etc)"
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: T.g, padding: 8, borderRadius: 6, fontSize: 11, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <button onClick={runMsg} disabled={!!busy} style={bt(T.c)}>{busy === "msg" ? "Analyzing..." : "Generate Responses"}</button>
          </div>

          {msgResult && (
            <>
              {/* Strategic Read */}
              <div style={cd}>
                <span style={lb}>Strategic Read</span>
                <div style={{ fontSize: 13, color: T.e, lineHeight: 1.6 }}>{msgResult.strategicRead}</div>
              </div>

              {/* Energy + Ceiling */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ ...cd, textAlign: "center", padding: 12 }}>
                  <span style={lb}>Their Energy</span>
                  <div style={{ fontSize: 14, color: T.a }}>{msgResult.energyMatch?.theirEnergy}</div>
                </div>
                <div style={{ ...cd, textAlign: "center", padding: 12 }}>
                  <span style={lb}>Ceiling</span>
                  <div style={{ fontSize: 11, color: T.c }}>{msgResult.energyMatch?.ceiling}</div>
                </div>
                <div style={{ ...cd, textAlign: "center", padding: 12 }}>
                  <span style={lb}>Target Tone</span>
                  <div style={{ fontSize: 11, color: T.d }}>{msgResult.energyMatch?.toneTarget}</div>
                </div>
              </div>

              {/* Response Options */}
              <div style={cd}>
                <span style={{ ...lb, color: T.a }}>Response Options</span>
                {msgResult.responses?.map((r, i) => (
                  <div key={i} style={{ padding: "10px 12px", background: i === 0 ? `${T.a}0A` : "rgba(255,255,255,0.01)", border: `1px solid ${i === 0 ? `${T.a}33` : "rgba(255,255,255,0.04)"}`, borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
                    onClick={() => { navigator.clipboard?.writeText(r.text); }}>
                    <div style={{ fontSize: 14, color: T.e, marginBottom: 4 }}>{r.text}</div>
                    <div style={{ fontSize: 10, color: T.b }}>{r.framework}</div>
                    <div style={{ fontSize: 10, color: T.g }}>{r.why}</div>
                  </div>
                ))}
              </div>

              {/* Timing */}
              <div style={cd}>
                <span style={lb}>Timing</span>
                <div style={{ fontSize: 14, color: T.a }}>{msgResult.timing?.responseWindow}</div>
                <div style={{ fontSize: 11, color: T.g, marginTop: 2 }}>{msgResult.timing?.reasoning}</div>
              </div>

              {/* Do Not */}
              <div style={{ ...cd, borderColor: `${T.c}33` }}>
                <span style={{ ...lb, color: T.c }}>Do Not</span>
                {msgResult.doNot?.map((d, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.c, marginBottom: 3 }}>✕ {d}</div>
                ))}
              </div>

              {/* Attachment Play + Next Move */}
              <div style={cd}>
                <span style={{ ...lb, color: T.d }}>Attachment Play</span>
                <div style={{ fontSize: 12, color: T.e, lineHeight: 1.5 }}>{msgResult.attachmentPlay}</div>
              </div>
              <div style={cd}>
                <span style={lb}>Next Move</span>
                <div style={{ fontSize: 12, color: T.e, lineHeight: 1.5 }}>{msgResult.nextMove}</div>
              </div>
              <div style={{ ...cd, background: `${T.a}08`, borderColor: `${T.a}33` }}>
                <span style={{ ...lb, color: T.a }}>Personalized Insight</span>
                <div style={{ fontSize: 13, color: T.e, lineHeight: 1.5, fontStyle: "italic" }}>{msgResult.personalized}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

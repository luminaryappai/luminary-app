"use client";
import React, { useState, useEffect } from "react";

/* Public Admin — Clean analytics only. Password: 84245577 */
const PW = "84245577";
const C = { gold: "#C9A84C", sage: "#7A8B6F", rose: "#C4727F", cream: "#F5F0E8", navy: "#0B0F14", dim: "#6B7280" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (authed) load(); }, [authed]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/user?action=stats&ak=${PW}`);
      const d = await r.json();
      if (d.users) setUsers(d.users);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, color: C.gold, letterSpacing: 6, marginBottom: 8 }}>✦ LUMINARY ✦</div>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, marginBottom: 28 }}>ADMIN</div>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pw === PW) setAuthed(true); }}
            placeholder="Code" autoFocus
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: C.cream, padding: "12px 20px", borderRadius: 8, fontSize: 16, textAlign: "center", width: 180, outline: "none" }} />
          <div style={{ marginTop: 10 }}>
            <button onClick={() => { if (pw === PW) setAuthed(true); }}
              style={{ background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 11, letterSpacing: 2 }}>ENTER</button>
          </div>
        </div>
      </div>
    );
  }

  const totalReadings = users.reduce((s, u) => s + (u.readings || 1), 0);
  const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.cream, fontFamily: "system-ui, sans-serif", padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, color: C.gold, letterSpacing: 4 }}>✦ LUMINARY ADMIN</div>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>ANALYTICS</div>
        </div>
        <button onClick={() => { setAuthed(false); setPw(""); }}
          style={{ background: "transparent", border: `1px solid ${C.dim}`, color: C.dim, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 10, letterSpacing: 1 }}>LOCK</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>USERS</div>
          <div style={{ fontSize: 28, color: C.gold }}>{users.length}</div>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>READINGS</div>
          <div style={{ fontSize: 28, color: C.sage }}>{totalReadings}</div>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>TODAY</div>
          <div style={{ fontSize: 28, color: C.cream }}>
            {users.filter(u => u.lastActive && new Date(u.lastActive).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
      </div>

      {/* User list */}
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>RECENT USERS</div>
      {loading && <div style={{ color: C.dim, fontSize: 12 }}>Loading...</div>}
      {users.map((u, i) => (
        <div key={i} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, color: C.cream }}>{u.name}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                {u.sun || "?"} Sun · {u.moon || "?"} Moon · {u.rising || "?"} Rising
              </div>
              {u.city && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{u.city}</div>}
            </div>
            <div style={{ textAlign: "right", fontSize: 10, color: C.dim }}>
              <div>{u.readings || 1} reading{(u.readings || 1) > 1 ? "s" : ""}</div>
              {u.lastActive && <div style={{ marginTop: 2 }}>{new Date(u.lastActive).toLocaleDateString()}</div>}
            </div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={load} style={{ background: "transparent", border: `1px solid ${C.dim}`, color: C.dim, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 10, letterSpacing: 1 }}>REFRESH</button>
      </div>
    </div>
  );
}

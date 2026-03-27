"use client";
import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/user?action=list&mk=84245577");
      const d = await r.json();
      setUsers(d.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (auth) load(); }, [auth]);

  if (!auth) return (
    <div style={{ minHeight: "100vh", background: "#FBF7F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 11, letterSpacing: 4, color: "#C17B3A", marginBottom: 20 }}>✦ ADMIN</p>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && pass === "84245577") setAuth(true); }} placeholder="Password" style={{ padding: "14px", background: "#fff", border: "1px solid #E8E0D6", borderRadius: 4, color: "#1A1612", fontSize: 15, outline: "none", width: 240, textAlign: "center", marginBottom: 16 }} />
      <button onClick={() => { if (pass === "84245577") setAuth(true); }} style={{ background: "#1A1612", color: "#FBF7F0", border: "none", padding: "12px 36px", fontSize: 13, letterSpacing: 2, cursor: "pointer", borderRadius: 2 }}>Enter</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FBF7F0", padding: "24px 16px", fontFamily: "'DM Sans', sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><p style={{ fontSize: 11, letterSpacing: 3, color: "#C17B3A" }}>✦ LUMINARY ADMIN</p><p style={{ fontSize: 12, color: "#9B8E82", marginTop: 4 }}>{users.length} users</p></div>
        <button onClick={load} style={{ background: "none", border: "1px solid #E8E0D6", color: "#6B5E52", padding: "6px 14px", borderRadius: 2, fontSize: 11, cursor: "pointer" }}>Refresh</button>
      </div>
      {loading ? <p style={{ color: "#9B8E82" }}>Loading...</p> : users.map((u, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #E8E0D6", borderRadius: 4, padding: "14px 16px", marginBottom: 8 }}>
          <span style={{ color: "#1A1612", fontSize: 15, fontWeight: 500 }}>{u.name || "—"}</span>
          {u.ig && <span style={{ color: "#9B8E82", fontSize: 12, marginLeft: 8 }}>@{u.ig}</span>}
          <p style={{ fontSize: 12, color: "#C17B3A", marginTop: 4 }}>{u.sun && `☉ ${u.sun}`} {u.moon && `☽ ${u.moon}`} {u.rising && `↑ ${u.rising}`}</p>
          {u.city && <p style={{ fontSize: 11, color: "#9B8E82", marginTop: 2 }}>{u.city}</p>}
        </div>
      ))}
    </div>
  );
}

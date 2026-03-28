"use client";
import { useState, useEffect } from "react";
export default function Sys() {
  const [pw,setPw]=useState("");const [ok,setOk]=useState(false);const [users,setUsers]=useState([]);const [sel,setSel]=useState(null);const [tab,setTab]=useState("roster");
  const load=async()=>{
    try{const r=await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"list",mk:"fateh0505"})});const d=await r.json();setUsers(d.users||[]);}catch{}
  };
  if(!ok)return(<div style={{minHeight:"100vh",background:"#191613",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:4,color:"#6B5D50",marginBottom:16}}>COMMAND CENTER</p>
    <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="fateh0505"){setOk(true);load();}}} placeholder="Access code" style={{padding:"12px 16px",borderRadius:8,border:"1px solid #2A2520",background:"#1E1B18",color:"#F5F0E8",fontSize:16,textAlign:"center",width:200}}/>
  </div>);
  const tabs=["roster","detail"];
  return(<div style={{minHeight:"100vh",background:"#191613",color:"#F5F0E8",fontFamily:"'DM Sans',sans-serif",padding:16}}>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:tab===t?"#BF8C3E":"#6B5D50",background:tab===t?"rgba(191,140,62,0.1)":"transparent",border:`1px solid ${tab===t?"#BF8C3E30":"transparent"}`,padding:"6px 14px",borderRadius:6,cursor:"pointer"}}>{t}</button>)}
    </div>
    {tab==="roster"&&<div>
      <p style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",marginBottom:12}}>{users.length} users</p>
      {users.map((u,i)=><div key={i} onClick={()=>{setSel(u);setTab("detail");}} style={{background:"#1E1B18",borderRadius:8,padding:12,marginBottom:6,cursor:"pointer",border:"1px solid #2A2520"}}>
        <p style={{fontSize:13,fontWeight:600}}>{u.name} <span style={{color:"#BF8C3E",fontSize:11}}>{u.ig?`@${u.ig}`:""}</span></p>
        <p style={{fontSize:10,color:"#6B5D50",marginTop:2}}>{u.chart?.sun} {u.chart?.moon} {u.chart?.rising} · {u.chart?.intensity}/10 · {new Date(u.createdAt).toLocaleDateString()}</p>
      </div>)}
    </div>}
    {tab==="detail"&&sel&&<div>
      <button onClick={()=>setTab("roster")} style={{color:"#BF8C3E",background:"none",border:"none",cursor:"pointer",fontSize:12,marginBottom:12}}>← Roster</button>
      <p style={{fontSize:22,fontFamily:"'Cormorant Garamond',serif",marginBottom:4}}>{sel.name}</p>
      <p style={{fontSize:12,color:"#6B5D50"}}>{sel.ig?`@${sel.ig}`:""} · {sel.chart?.sun} Sun · {sel.chart?.moon} Moon · {sel.chart?.rising} Rising</p>
      <p style={{fontSize:12,color:"#BF8C3E",marginTop:4}}>Intensity: {sel.chart?.intensity}/10</p>
      {sel.chart?.aspects?.slice(0,6).map((a,i)=><p key={i} style={{fontSize:10,color:"#A09282",marginTop:2}}>Transit {a.transit} {a.aspect} natal {a.natal} ({a.orb}°)</p>)}
      {sel.reading?.line&&<div style={{background:"#2A2520",borderRadius:8,padding:14,marginTop:12}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:"#F5F0E8"}}>"{sel.reading.line}"</p></div>}
      {sel.answers&&<div style={{marginTop:12}}><p style={{fontSize:10,color:"#6B5D50"}}>Focus: {sel.answers.focus} · Energy: {sel.answers.energy} · Seeking: {sel.answers.seeking}</p></div>}
    </div>}
  </div>);
}

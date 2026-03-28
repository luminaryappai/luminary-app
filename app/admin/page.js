"use client";
import { useState, useEffect } from "react";
export default function Admin() {
  const [pw,setPw]=useState("");const [ok,setOk]=useState(false);const [users,setUsers]=useState([]);
  const load=async()=>{
    try{const r=await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"list",mk:"fateh0505"})});const d=await r.json();setUsers(d.users||[]);}catch{}
  };
  if(!ok)return(<div style={{minHeight:"100vh",background:"#FAF6F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:4,color:"#A09282",marginBottom:16}}>LUMINARY ADMIN</p>
    <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="84245577"){setOk(true);load();}}} placeholder="Password" style={{padding:"12px 16px",borderRadius:8,border:"1px solid rgba(42,33,24,0.06)",fontSize:16,textAlign:"center",width:200}}/>
  </div>);
  return(<div style={{minHeight:"100vh",background:"#FAF6F0",padding:20}}>
    <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#2A2118",marginBottom:16}}>{users.length} readings</p>
    {users.map((u,i)=><div key={i} style={{background:"#FFF",borderRadius:10,padding:14,marginBottom:8,border:"1px solid rgba(42,33,24,0.06)"}}>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#2A2118"}}>{u.name} {u.ig?`@${u.ig}`:""}</p>
      <p style={{fontSize:11,color:"#A09282"}}>{u.chart?.sun} · {u.chart?.moon} · {u.chart?.rising} · {u.chart?.intensity}/10</p>
    </div>)}
  </div>);
}

"use client";
import { useState } from "react";
const P={bg:"#FAF6F0",card:"#FFFFFF",ink:"#2A2118",mid:"#6B5D50",light:"#A09282",faint:"#CFC4B6",gold:"#BF8C3E",sage:"#7A9468",border:"rgba(42,33,24,0.06)"};
const F={serif:"'Cormorant Garamond',Georgia,serif",sans:"'DM Sans',-apple-system,sans-serif"};
export default function Admin(){
  const[pw,setPw]=useState("");const[ok,setOk]=useState(false);const[users,setUsers]=useState([]);const[loading,setLoading]=useState(false);const[sel,setSel]=useState(null);
  const load=async()=>{setLoading(true);try{const r=await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"list",mk:"fateh0505"})});const d=await r.json();setUsers(d.users||[]);}catch{}setLoading(false);};
  if(!ok)return(<div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
    <p style={{fontFamily:F.sans,fontSize:9,letterSpacing:4,color:P.light,marginBottom:16}}>LUMINARY ADMIN</p>
    <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="84245577"){setOk(true);load();}}} placeholder="Password" style={{padding:"12px 16px",borderRadius:8,border:`1px solid ${P.border}`,fontSize:16,textAlign:"center",width:200,fontFamily:F.sans}}/>
    <button onClick={()=>{if(pw==="84245577"){setOk(true);load();}}} style={{marginTop:12,padding:"10px 24px",background:P.ink,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontFamily:F.sans,fontSize:12}}>Enter</button>
  </div>);
  if(sel)return(<div style={{minHeight:"100vh",background:P.bg,padding:20}}>
    <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:P.gold,fontSize:13,cursor:"pointer",fontFamily:F.sans,marginBottom:16}}>← All Users</button>
    <h2 style={{fontFamily:F.serif,fontSize:24,color:P.ink,marginBottom:4}}>{sel.name}</h2>
    <p style={{fontFamily:F.sans,fontSize:12,color:P.light}}>{sel.ig?`@${sel.ig}`:""} · {sel.chart?.sun} · {sel.chart?.moon} · {sel.chart?.rising}</p>
    <p style={{fontFamily:F.sans,fontSize:11,color:P.gold,marginTop:4}}>Intensity: {sel.chart?.intensity}/10</p>
    {sel.answers&&<p style={{fontFamily:F.sans,fontSize:11,color:P.light,marginTop:8}}>Focus: {sel.answers.focus} · Energy: {sel.answers.energy} · Seeking: {sel.answers.seeking}</p>}
    {sel.reading?.line&&<div style={{background:P.card,borderRadius:12,padding:16,marginTop:12,border:`1px solid ${P.border}`}}><p style={{fontFamily:F.serif,fontSize:15,fontStyle:"italic",color:P.ink}}>"{sel.reading.line}"</p></div>}
    {sel.chart?.aspects?.slice(0,8).map((a,i)=><p key={i} style={{fontFamily:F.sans,fontSize:10,color:P.light,marginTop:2}}>Transit {a.transit} {a.aspect} natal {a.natal} ({a.orb}°)</p>)}
    {sel.chatHistory?.length>0&&<div style={{marginTop:16}}><p style={{fontFamily:F.sans,fontSize:10,letterSpacing:2,color:P.gold,textTransform:"uppercase",marginBottom:8}}>CHAT LOG ({sel.chatHistory.length} messages)</p>
      {sel.chatHistory.map((m,i)=><p key={i} style={{fontFamily:F.sans,fontSize:11,color:m.role==="user"?P.ink:P.light,marginBottom:4}}><strong>{m.role}:</strong> {m.text?.substring(0,100)}{m.text?.length>100?"...":""}</p>)}
    </div>}
    <p style={{fontFamily:F.sans,fontSize:10,color:P.faint,marginTop:12}}>Created: {new Date(sel.createdAt).toLocaleString()} · Updated: {new Date(sel.updatedAt).toLocaleString()}</p>
  </div>);
  return(<div style={{minHeight:"100vh",background:P.bg,padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <p style={{fontFamily:F.sans,fontSize:9,letterSpacing:4,color:P.light}}>LUMINARY ADMIN</p>
      <button onClick={load} style={{fontFamily:F.sans,fontSize:10,color:P.sage,background:"transparent",border:`1px solid ${P.sage}30`,padding:"6px 12px",borderRadius:6,cursor:"pointer"}}>Refresh</button>
    </div>
    <p style={{fontFamily:F.serif,fontSize:24,color:P.ink,marginBottom:16}}>{users.length} readings</p>
    {loading&&<p style={{color:P.light}}>Loading...</p>}
    {users.map((u,i)=>(
      <div key={i} onClick={()=>setSel(u)} style={{background:P.card,borderRadius:10,padding:"14px 16px",marginBottom:8,border:`1px solid ${P.border}`,cursor:"pointer"}}>
        <p style={{fontFamily:F.sans,fontSize:14,fontWeight:600,color:P.ink}}>{u.name} <span style={{fontSize:11,color:P.gold}}>{u.ig?`@${u.ig}`:""}</span></p>
        <p style={{fontFamily:F.sans,fontSize:11,color:P.light,marginTop:2}}>{u.chart?.sun} · {u.chart?.moon} · {u.chart?.rising} · {u.chart?.intensity}/10</p>
        <p style={{fontFamily:F.sans,fontSize:10,color:P.faint,marginTop:4}}>{new Date(u.createdAt).toLocaleDateString()}{u.chatHistory?.length?` · ${u.chatHistory.length} chats`:""}</p>
      </div>
    ))}
  </div>);
}

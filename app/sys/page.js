"use client";
import { useState } from "react";
const C={bg:"#191613",card:"#1E1B18",ink:"#F5F0E8",mid:"#A09282",dim:"#6B5D50",gold:"#BF8C3E",sage:"#7A9468",blush:"#C08E8E",violet:"#8D80B8",border:"#2A2520"};
const F={serif:"'Cormorant Garamond',Georgia,serif",sans:"'DM Sans',-apple-system,sans-serif"};
export default function Sys(){
  const[pw,setPw]=useState("");const[ok,setOk]=useState(false);const[users,setUsers]=useState([]);const[sel,setSel]=useState(null);const[tab,setTab]=useState("roster");
  const load=async()=>{try{const r=await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"list",mk:"fateh0505"})});const d=await r.json();setUsers(d.users||[]);}catch{}};
  if(!ok)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
    <p style={{fontFamily:F.sans,fontSize:9,letterSpacing:4,color:C.dim,marginBottom:16}}>COMMAND CENTER</p>
    <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="fateh0505"){setOk(true);load();}}} placeholder="Access code" style={{padding:"12px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.ink,fontSize:16,textAlign:"center",width:200,fontFamily:F.sans}}/>
  </div>);
  const tabs=["roster","detail","compatibility","intel"];
  const ts=(t)=>({fontFamily:F.sans,fontSize:10,letterSpacing:2,textTransform:"uppercase",color:tab===t?C.gold:C.dim,background:tab===t?`${C.gold}15`:"transparent",border:`1px solid ${tab===t?C.gold+"30":"transparent"}`,padding:"6px 14px",borderRadius:6,cursor:"pointer"});
  return(<div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:F.sans,padding:16}}>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={ts(t)}>{t}</button>)}</div>
    {tab==="roster"&&<div>
      <p style={{fontSize:20,fontFamily:F.serif,marginBottom:12}}>{users.length} users</p>
      {users.map((u,i)=><div key={i} onClick={()=>{setSel(u);setTab("detail");}} style={{background:C.card,borderRadius:8,padding:12,marginBottom:6,cursor:"pointer",border:`1px solid ${C.border}`}}>
        <p style={{fontSize:13,fontWeight:600}}>{u.name} <span style={{color:C.gold,fontSize:11}}>{u.ig?`@${u.ig}`:""}</span></p>
        <p style={{fontSize:10,color:C.dim,marginTop:2}}>{u.chart?.sun} {u.chart?.moon} {u.chart?.rising} · {u.chart?.intensity}/10 · {new Date(u.createdAt).toLocaleDateString()}{u.chatHistory?.length?` · ${u.chatHistory.length} chats`:""}</p>
      </div>)}
    </div>}
    {tab==="detail"&&sel&&<div>
      <button onClick={()=>setTab("roster")} style={{color:C.gold,background:"none",border:"none",cursor:"pointer",fontSize:12,marginBottom:12}}>← Roster</button>
      <p style={{fontSize:24,fontFamily:F.serif,marginBottom:4}}>{sel.name}</p>
      <p style={{fontSize:12,color:C.dim}}>{sel.ig?`@${sel.ig}`:""} · {sel.chart?.sun} Sun · {sel.chart?.moon} Moon · {sel.chart?.rising} Rising</p>
      <p style={{fontSize:12,color:C.gold,marginTop:4}}>Intensity: {sel.chart?.intensity}/10</p>
      {sel.answers&&<p style={{fontSize:11,color:C.mid,marginTop:8}}>Focus: {sel.answers.focus} · Energy: {sel.answers.energy} · Seeking: {sel.answers.seeking}</p>}
      {sel.chart?.aspects?.slice(0,8).map((a,i)=><p key={i} style={{fontSize:10,color:C.mid,marginTop:2}}>Transit {a.transit} {a.aspect} natal {a.natal} ({a.orb}°)</p>)}
      {sel.chart?.approaching?.length>0&&<div style={{marginTop:8}}><p style={{fontSize:10,color:C.sage,letterSpacing:1}}>APPROACHING:</p>{sel.chart.approaching.map((a,i)=><p key={i} style={{fontSize:10,color:C.mid}}>{a.transit} → {a.aspect} natal {a.natal} ({a.currentOrb}°)</p>)}</div>}
      {sel.reading?.line&&<div style={{background:C.border,borderRadius:8,padding:14,marginTop:12}}><p style={{fontFamily:F.serif,fontSize:15,fontStyle:"italic",color:C.ink}}>"{sel.reading.line}"</p></div>}
      {sel.birthchartAnalysis&&<div style={{marginTop:12}}><p style={{fontSize:10,color:C.violet,letterSpacing:1}}>BIRTH CHART ANALYSIS:</p>
        {sel.birthchartAnalysis.bigThree&&<p style={{fontSize:11,color:C.mid,marginTop:4}}>{sel.birthchartAnalysis.bigThree.substring(0,200)}...</p>}
        {sel.birthchartAnalysis.soulMantra&&<p style={{fontSize:11,color:C.gold,fontStyle:"italic",marginTop:4}}>Mantra: {sel.birthchartAnalysis.soulMantra}</p>}
      </div>}
      {sel.chatHistory?.length>0&&<div style={{marginTop:12}}><p style={{fontSize:10,color:C.gold,letterSpacing:1}}>CHAT LOG ({sel.chatHistory.length})</p>
        <div style={{maxHeight:300,overflowY:"auto",marginTop:6}}>{sel.chatHistory.map((m,i)=><p key={i} style={{fontSize:10,color:m.role==="user"?C.ink:C.mid,marginBottom:3,paddingLeft:m.role==="user"?0:8}}>{m.role==="user"?"→":""} {m.text?.substring(0,120)}</p>)}</div>
      </div>}
    </div>}
    {tab==="compatibility"&&<div style={{textAlign:"center",padding:40}}>
      <p style={{fontFamily:F.serif,fontSize:18,color:C.mid}}>Select two users from roster to run synastry</p>
      <p style={{fontSize:11,color:C.dim,marginTop:8}}>Coming in V8.2</p>
    </div>}
    {tab==="intel"&&<div>
      <p style={{fontFamily:F.serif,fontSize:18,marginBottom:12}}>Intel Feed</p>
      {users.filter(u=>u.chatHistory?.length>0).map((u,i)=><div key={i} style={{background:C.card,borderRadius:8,padding:10,marginBottom:6,border:`1px solid ${C.border}`}}>
        <p style={{fontSize:11,fontWeight:600}}>{u.name} <span style={{color:C.dim,fontSize:9}}>({u.chatHistory.length} questions)</span></p>
        <p style={{fontSize:10,color:C.mid,marginTop:2}}>Last: {u.chatHistory[u.chatHistory.length-1]?.text?.substring(0,80)}</p>
        <p style={{fontSize:9,color:C.dim,marginTop:2}}>Focus: {u.answers?.focus} · Seeking: {u.answers?.seeking}</p>
      </div>)}
    </div>}
  </div>);
}

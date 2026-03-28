"use client";
import{useState,useEffect,useRef,useCallback}from"react";

/* ═══ V6 DESIGN TOKENS — EXACT MATCH ═══ */
const P={bg:"#FAF6F0",body:"#F3EDE3",card:"#FFF",bdr:"rgba(42,33,24,0.05)",
  ink:"#2A2118",mid:"#6B5D50",lt:"#A09282",fn:"#CFC4B6",
  gold:"#BF8C3E",goldBg:"#F6EDD9",
  sage:"#7E9A6C",sageBg:"#E5EBE0",
  terra:"#C4836A",terraBg:"#F5EBE5",
  violet:"#8D80B8",violetBg:"#ECE8F3",
  warm:"#EDE6DA",linen:"#F5EDE0",night:"#191613"};
const SR="'Cormorant Garamond',serif";
const SN="'DM Sans',sans-serif";
const SH="0 1px 8px rgba(42,33,24,0.04)";
const SH2="0 4px 20px rgba(42,33,24,0.06)";
const SH3="0 6px 24px rgba(42,33,24,0.07)";
const ZG={Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓"};
/* Card accent colors — terracotta/sage/gold/violet per Mat's direction */
const CC=[{c:P.terra,bg:P.terraBg},{c:P.sage,bg:P.sageBg},{c:P.gold,bg:P.goldBg},{c:P.violet,bg:P.violetBg}];

/* ═══ V6 CSS — injected as style tag ═══ */
const V6CSS=`
*{box-sizing:border-box;margin:0;padding:0}
button:active{transform:scale(0.97)}
@keyframes orb{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes orrIn{to{opacity:1;transform:scale(1) rotate(0deg)}}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
`;

/* ═══ GEOCODE — local list + Nominatim ═══ */
const CITIES=[{n:"Phoenix, AZ",lat:33.45,lon:-112.07},{n:"Scottsdale, AZ",lat:33.49,lon:-111.93},{n:"Los Angeles, CA",lat:34.05,lon:-118.24},{n:"New York, NY",lat:40.71,lon:-74.01},{n:"Chicago, IL",lat:41.88,lon:-87.63},{n:"Houston, TX",lat:29.76,lon:-95.37},{n:"Miami, FL",lat:25.76,lon:-80.19},{n:"Denver, CO",lat:39.74,lon:-104.99},{n:"Seattle, WA",lat:47.61,lon:-122.33},{n:"Austin, TX",lat:30.27,lon:-97.74},{n:"San Francisco, CA",lat:37.77,lon:-122.42},{n:"Nashville, TN",lat:36.16,lon:-86.78},{n:"Atlanta, GA",lat:33.75,lon:-84.39},{n:"Boston, MA",lat:42.36,lon:-71.06},{n:"Dallas, TX",lat:32.78,lon:-96.80},{n:"San Diego, CA",lat:32.72,lon:-117.16},{n:"Las Vegas, NV",lat:36.17,lon:-115.14},{n:"Portland, OR",lat:45.52,lon:-122.68},{n:"Tucson, AZ",lat:32.22,lon:-110.97},{n:"Mesa, AZ",lat:33.42,lon:-111.83},{n:"Paradise Valley, AZ",lat:33.53,lon:-111.94},{n:"London, UK",lat:51.51,lon:-0.13},{n:"Paris, France",lat:48.86,lon:2.35},{n:"Tokyo, Japan",lat:35.68,lon:139.69},{n:"Sydney, Australia",lat:-33.87,lon:151.21},{n:"Toronto, Canada",lat:43.65,lon:-79.38},{n:"Berlin, Germany",lat:52.52,lon:13.41},{n:"Mumbai, India",lat:19.08,lon:72.88},{n:"Tel Aviv, Israel",lat:32.09,lon:34.78},{n:"Dubai, UAE",lat:25.20,lon:55.27},{n:"Amsterdam, NL",lat:52.37,lon:4.90},{n:"Barcelona, Spain",lat:41.39,lon:2.17},{n:"Seoul, South Korea",lat:37.57,lon:126.98},{n:"Aurora, IL",lat:41.76,lon:-88.32},{n:"Northampton, MA",lat:42.33,lon:-72.63},{n:"Beverly Hills, CA",lat:34.07,lon:-118.40},{n:"Oakland, CA",lat:37.80,lon:-122.27},{n:"Bali, Indonesia",lat:-8.34,lon:115.09},{n:"Vancouver, Canada",lat:49.28,lon:-123.12},{n:"Kauai, HI",lat:22.08,lon:-159.37}];
async function searchCity(q){if(q.length<2)return[];const local=CITIES.filter(c=>c.n.toLowerCase().includes(q.toLowerCase())).slice(0,6);if(q.length<3)return local;try{const r=await fetch("https://nominatim.openstreetmap.org/search?q="+encodeURIComponent(q)+"&format=json&limit=6&featuretype=city");const d=await r.json();const remote=d.map(c=>({n:c.display_name.split(",").slice(0,2).join(",").trim(),lat:parseFloat(c.lat),lon:parseFloat(c.lon)}));const all=[...local];for(const r of remote){if(!all.some(a=>Math.abs(a.lat-r.lat)<0.1&&Math.abs(a.lon-r.lon)<0.1))all.push(r);}return all.slice(0,8);}catch{return local;}}

/* ═══ SAVE HELPERS ═══ */
async function saveReading(d){try{await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",...d})});}catch{}}
async function saveChatHist(key,h){try{await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"saveChat",key,chatHistory:h})});}catch{}}

/* ═══ V6 ORRERY — exact CSS, React component ═══ */
function Orrery(){
  return(
    <div style={{position:"absolute",top:-60,right:-120,width:440,height:440,zIndex:1,opacity:0,transform:"scale(0.5) rotate(-40deg)",animation:"orrIn 2.2s cubic-bezier(0.16,1,0.3,1) 0.1s forwards"}}>
      {/* Sun center */}
      <div style={{position:"absolute",width:28,height:28,borderRadius:"50%",top:206,left:206,background:"radial-gradient(circle,#E8C98A 0%,#BF8C3E 50%,rgba(191,140,62,0.2) 100%)",boxShadow:"0 0 30px rgba(218,176,98,0.35),0 0 60px rgba(218,176,98,0.1)"}}/>
      {/* Ring 1 — terra */}
      <div style={{position:"absolute",borderRadius:"50%",width:120,height:120,top:160,left:160,borderWidth:6,borderStyle:"solid",borderColor:"rgba(196,131,106,0.18)",animation:"orb 45s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:14,height:14,background:P.terra,top:"-50%",left:"50%",margin:"-7px 0 0 -7px",boxShadow:"0 0 12px rgba(196,131,106,0.5)"}}/>
      </div>
      {/* Ring 2 — sage */}
      <div style={{position:"absolute",borderRadius:"50%",width:200,height:200,top:120,left:120,borderWidth:8,borderStyle:"solid",borderColor:"rgba(122,148,104,0.14)",animation:"orb 65s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:18,height:18,background:P.sage,top:"-50%",left:"50%",margin:"-9px 0 0 -9px",boxShadow:"0 0 14px rgba(122,148,104,0.4)"}}/>
      </div>
      {/* Ring 3 — violet */}
      <div style={{position:"absolute",borderRadius:"50%",width:300,height:300,top:70,left:70,borderWidth:5,borderStyle:"solid",borderColor:"rgba(141,128,184,0.10)",animation:"orb 90s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:12,height:12,background:P.violet,top:"-50%",left:"50%",margin:"-6px 0 0 -6px",boxShadow:"0 0 10px rgba(141,128,184,0.4)"}}/>
      </div>
      {/* Ring 4 — gold */}
      <div style={{position:"absolute",borderRadius:"50%",width:400,height:400,top:20,left:20,borderWidth:3,borderStyle:"solid",borderColor:"rgba(191,140,62,0.06)",animation:"orb 120s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:8,height:8,background:P.gold,opacity:0.5,top:"-50%",left:"50%",margin:"-4px 0 0 -4px",boxShadow:"0 0 8px rgba(191,140,62,0.3)"}}/>
      </div>
    </div>
  );
}

/* ═══ MINI ORRERY SPINNER (48px — loading size from V6) ═══ */
function Spinner({size=48}){
  const s=size/48;
  return(
    <div style={{display:"inline-block",width:size,height:size,position:"relative"}}>
      <div style={{position:"absolute",borderRadius:"50%",width:18*s,height:18*s,top:15*s,left:15*s,borderWidth:Math.max(1,3*s),borderStyle:"solid",borderColor:"rgba(196,131,106,0.3)",animation:"orb 6s linear infinite"}}>
        <div style={{position:"absolute",width:5*s,height:5*s,borderRadius:"50%",background:P.terra,top:"-50%",left:"50%",marginLeft:-2.5*s,marginTop:-2.5*s}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:32*s,height:32*s,top:8*s,left:8*s,borderWidth:Math.max(1,2*s),borderStyle:"solid",borderColor:"rgba(122,148,104,0.2)",animation:"orb 10s linear infinite reverse"}}>
        <div style={{position:"absolute",width:4*s,height:4*s,borderRadius:"50%",background:P.sage,top:"-50%",left:"50%",marginLeft:-2*s,marginTop:-2*s}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:46*s,height:46*s,top:1*s,left:1*s,borderWidth:Math.max(1,1.5*s),borderStyle:"solid",borderColor:"rgba(141,128,184,0.15)",animation:"orb 16s linear infinite"}}>
        <div style={{position:"absolute",width:3*s,height:3*s,borderRadius:"50%",background:P.violet,top:"-50%",left:"50%",marginLeft:-1.5*s,marginTop:-1.5*s}}/>
      </div>
      <div style={{width:7*s,height:7*s,borderRadius:"50%",background:"radial-gradient(circle,#E8C98A,#BF8C3E)",position:"absolute",top:20.5*s,left:20.5*s,boxShadow:"0 0 8px rgba(218,176,98,0.3)"}}/>
    </div>
  );
}

/* ═══ LOADING — Orrery spins in as loader (Mat's choice) ═══ */
function LoadingScreen({name}){
  return(
    <div style={{height:"100%",background:P.bg,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <Orrery/>
      <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
        <Spinner size={64}/>
        <p style={{fontFamily:SN,fontSize:11,letterSpacing:4,color:P.lt,textTransform:"uppercase",marginTop:20,opacity:0,animation:"fu 1s ease 1.5s forwards"}}>Reading {name?""+name+"'s":""} light</p>
      </div>
    </div>
  );
}

/* ═══ LANDING — V6 exact layout ═══ */
function Landing({onStart,tag}){
  return(
    <div style={{height:"100%",background:P.bg,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 28px 60px"}}>
      <Orrery/>
      <div style={{position:"relative",zIndex:2,maxWidth:340}}>
        <div style={{fontFamily:SN,fontSize:9,letterSpacing:5,color:P.gold,textTransform:"uppercase",marginBottom:20,fontWeight:500,opacity:0,animation:"fu .8s ease 1.6s forwards"}}>luminary</div>
        <h1 style={{fontFamily:SR,fontSize:42,fontWeight:300,color:P.ink,lineHeight:1.1,margin:"0 0 14px",opacity:0,animation:"fu .8s ease 1.9s forwards"}}>
          Your life,<br/><em style={{fontStyle:"italic",color:P.gold}}>{tag==="as"?"as it happens.":"before it happens."}</em>
        </h1>
        <p style={{fontFamily:SR,fontSize:14,color:P.lt,lineHeight:1.65,maxWidth:280,margin:"0 0 28px",fontStyle:"italic",opacity:0,animation:"fu .8s ease 2.2s forwards"}}>
          Personalized readings from your exact birth chart. Not your sun sign. <em>Your</em> sky.
        </p>
        <button onClick={onStart} style={{fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2.5,textTransform:"uppercase",color:"#FFF",background:P.ink,border:"none",padding:"13px 28px",borderRadius:24,cursor:"pointer",boxShadow:"0 3px 16px rgba(42,33,24,0.1)",opacity:0,animation:"fu .6s ease 2.5s forwards"}}>
          Enter your birthday
        </button>
      </div>
    </div>
  );
}

/* ═══ BIRTH INPUT — V6 card styling ═══ */
function BirthInput({onSubmit}){
  const[nm,setNm]=useState("");const[ig,setIg]=useState("");const[dt,setDt]=useState("");const[tm,setTm]=useState("");const[noTm,setNoTm]=useState(false);
  const[cq,setCq]=useState("");const[cr,setCr]=useState([]);const[city,setCity]=useState(null);const[showC,setShowC]=useState(false);const[srch,setSrch]=useState(false);
  const t=useRef(null);
  const hcs=(q)=>{setCq(q);setCity(null);setShowC(true);clearTimeout(t.current);
    if(q.length>=2){setSrch(true);t.current=setTimeout(async()=>{const r=await searchCity(q);setCr(r);setSrch(false);},350);}else{setCr([]);setSrch(false);}};
  const ok=nm&&dt&&city;
  const is={width:"100%",padding:"14px 0",background:"transparent",border:"none",borderBottom:"1px solid "+P.fn+"40",color:P.ink,fontSize:16,fontFamily:SR,outline:"none"};
  const ls={fontFamily:SN,fontSize:8,letterSpacing:3,color:P.lt,textTransform:"uppercase",marginBottom:4,display:"block"};
  return(
    <div style={{minHeight:"100%",background:P.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
      <div style={{fontFamily:SN,fontSize:9,letterSpacing:5,textTransform:"uppercase",color:P.gold,textAlign:"center",marginBottom:32,fontWeight:500}}>luminary</div>
      <div style={{marginBottom:24}}><label style={ls}>Your Name</label><input style={is} placeholder="First name" value={nm} onChange={e=>setNm(e.target.value)}/></div>
      <div style={{marginBottom:24}}><label style={ls}>Instagram (optional)</label><input style={is} placeholder="@handle" value={ig} onChange={e=>setIg(e.target.value)}/></div>
      <div style={{marginBottom:24}}><label style={ls}>Birth Date</label><input type="date" style={{...is,fontSize:15}} value={dt} onChange={e=>setDt(e.target.value)}/></div>
      <div style={{marginBottom:24}}>
        <label style={ls}>Birth Time</label>
        {!noTm&&<input type="time" style={{...is,fontSize:15}} value={tm} onChange={e=>setTm(e.target.value)}/>}
        <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontFamily:SN,fontSize:12,color:P.lt,cursor:"pointer"}}><input type="checkbox" checked={noTm} onChange={e=>{setNoTm(e.target.checked);if(e.target.checked)setTm("");}}/> I don't know my birth time</label>
      </div>
      <div style={{marginBottom:28,position:"relative"}}>
        <label style={ls}>Birth City</label>
        <input style={is} placeholder="Start typing any city..." value={cq} onChange={e=>hcs(e.target.value)} onFocus={()=>{if(cq.length>=2)setShowC(true);}}/>
        {city&&<p style={{fontSize:12,color:P.sage,marginTop:4,fontFamily:SN}}>✓ {city.n}</p>}
        {srch&&!city&&<p style={{fontSize:11,color:P.lt,marginTop:4,fontFamily:SN}}>Searching...</p>}
        {showC&&cr.length>0&&!city&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:P.card,border:"1px solid "+P.bdr,borderRadius:8,maxHeight:220,overflowY:"auto",zIndex:100,marginTop:4,boxShadow:SH3}}>
            {cr.map((c,i)=><div key={i} onClick={()=>{setCity(c);setCq(c.n);setShowC(false);}} style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid "+P.bdr,color:P.ink,fontSize:14,fontFamily:SN}}>{c.n}</div>)}
          </div>
        )}
      </div>
      <button onClick={()=>ok&&onSubmit({name:nm,ig,date:dt,time:noTm?"unknown":tm,lat:city.lat,lon:city.lon,city:city.n})} disabled={!ok} style={{width:"100%",padding:"13px",fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2.5,textTransform:"uppercase",color:"#FFF",background:ok?P.ink:P.fn,border:"none",borderRadius:24,cursor:ok?"pointer":"default",boxShadow:ok?"0 3px 16px rgba(42,33,24,0.1)":"none"}}>Continue</button>
    </div>
  );
}

/* ═══ QUESTIONS ═══ */
function Questions({onSubmit,name}){
  const[f,setF]=useState("");const[e,setE]=useState("");const[s,setS]=useState("");
  const opts=(items,val,set)=>(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
    {items.map(item=>(<button key={item} onClick={()=>set(item)} style={{fontFamily:SN,fontSize:12,padding:"10px 16px",borderRadius:20,border:"1.5px solid "+(val===item?P.gold:P.fn),background:val===item?P.goldBg:"transparent",color:val===item?P.gold:P.mid,cursor:"pointer"}}>{item}</button>))}
  </div>);
  const ok=f&&e&&s;
  return(
    <div style={{minHeight:"100%",background:P.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
      <p style={{fontFamily:SR,fontSize:22,fontWeight:300,color:P.ink,marginBottom:32}}>Hi {name}. <span style={{color:P.lt}}>Help me personalize your reading.</span></p>
      <div style={{marginBottom:24}}><p style={{fontFamily:SN,fontSize:11,letterSpacing:1,color:P.mid,fontWeight:500}}>What area of life needs attention?</p>{opts(["Career","Love","Health","Purpose","Money","Family"],f,setF)}</div>
      <div style={{marginBottom:24}}><p style={{fontFamily:SN,fontSize:11,letterSpacing:1,color:P.mid,fontWeight:500}}>How's your energy right now?</p>{opts(["Overwhelmed","Restless","Grounded","Inspired","Drained","Uncertain"],e,setE)}</div>
      <div style={{marginBottom:32}}><p style={{fontFamily:SN,fontSize:11,letterSpacing:1,color:P.mid,fontWeight:500}}>What are you seeking?</p>{opts(["Clarity","Confirmation","Comfort","Direction","Courage","Understanding"],s,setS)}</div>
      <button onClick={()=>ok&&onSubmit({focus:f,energy:e,seeking:s})} disabled={!ok} style={{width:"100%",padding:"13px",fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2.5,textTransform:"uppercase",color:"#FFF",background:ok?P.ink:P.fn,border:"none",borderRadius:24,cursor:ok?"pointer":"default"}}>Read my stars</button>
    </div>
  );
}

/* ═══ READING SCREEN — V6 exact design with 3 tabs added ═══ */
function ReadingScreen({chart,reading,name,onChat,onReset,onBirthChart,onShareable}){
  const[tab,setTab]=useState("weekly");
  const[openCard,setOpenCard]=useState(0);
  const[openB3,setOpenB3]=useState(-1);
  const[intVal,setIntVal]=useState(chart.intensity);
  const[intArea,setIntArea]=useState("Overall");
  const[intColor,setIntColor]=useState(null);
  const{sun,moon,rising,intensity}=chart;
  const b3=[
    {label:"Sun in "+sun,icon:"☉",c:P.gold,bg:P.goldBg,sub:"Your core identity · 40% influence",weight:40,int:intensity},
    {label:"Moon in "+moon,icon:"☽",c:P.sage,bg:P.sageBg,sub:"Your emotional world · 35% influence",weight:35,int:Math.max(1,intensity-1)},
    {label:(rising!=="Unknown"?rising:"?")+" Rising",icon:"↑",c:P.terra,bg:P.terraBg,sub:"How others see you · 25% influence",weight:25,int:Math.max(1,intensity-2)},
  ];
  const cards=tab==="weekly"?reading.weekly:tab==="monthly"?reading.monthly:null;
  const flipB3=(i)=>{if(openB3===i){setOpenB3(-1);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}else{setOpenB3(i);setIntVal(b3[i].int);setIntArea(b3[i].label);setIntColor(b3[i].c);}};
  const togCard=(i)=>{if(openCard===i){setOpenCard(-1);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}else{setOpenCard(i);if(cards&&cards[i]){const cc=CC[i%CC.length];setIntVal(cards[i].intensity||intensity);setIntArea(cards[i].area);setIntColor(cc.c);}}};
  const tabS=(t)=>({fontFamily:SN,fontSize:11,fontWeight:tab===t?500:300,color:tab===t?P.gold:P.fn,background:tab===t?P.goldBg:"transparent",border:"1.5px solid "+(tab===t?"rgba(191,140,62,0.15)":"transparent"),padding:"6px 16px",borderRadius:20,cursor:"pointer"});
  /* Intensity bars */
  const bars=[];for(let i=0;i<10;i++){bars.push(<div key={i} style={{flex:1,height:5,borderRadius:2.5,background:i<intVal?(intColor||"hsl("+(42-i*2.5)+","+(48+i*4)+"%,"+(72-i*4)+"%)"):P.warm,transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",opacity:i<intVal?(intColor?0.4+i*0.06:1):1}}/>);}

  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 90px"}}>
      <style>{V6CSS}</style>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:7,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:8,opacity:0.5}}>your reading</div>
        <h2 style={{fontFamily:SR,fontSize:28,fontWeight:300,color:P.ink,margin:"0 0 2px"}}>{name}</h2>
        <div style={{fontFamily:SR,fontSize:12,color:P.lt,fontStyle:"italic"}}>{ZG[sun]||""} {sun} · {ZG[moon]||""} {moon}{rising!=="Unknown"?" · "+(ZG[rising]||"")+" "+rising:""}</div>
        <button onClick={onReset} style={{fontFamily:SN,fontSize:8,color:P.gold,background:"transparent",border:"1px solid rgba(191,140,62,0.15)",padding:"3px 8px",borderRadius:10,cursor:"pointer",marginTop:6,letterSpacing:1,textTransform:"uppercase"}}>Edit info</button>
      </div>

      {/* Big Three — V6 flip cards */}
      <div style={{marginBottom:20,position:"relative"}}>
        <div style={{display:openB3===-1?"flex":"none",gap:8,justifyContent:"center",transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)"}}>
          {b3.map((b,i)=>(
            <div key={i} onClick={()=>flipB3(i)} style={{flex:"1 1 88px",maxWidth:110,background:P.card,border:"1px solid "+P.bdr,borderRadius:12,padding:"14px 8px",textAlign:"center",boxShadow:SH,cursor:"pointer"}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 5px",fontSize:14,fontFamily:SR,background:b.bg,color:b.c}}>{b.icon}</div>
              <div style={{fontFamily:SN,fontSize:7,letterSpacing:2.5,color:P.fn,textTransform:"uppercase",marginBottom:2}}>{b.icon==="☉"?"Sun":b.icon==="☽"?"Moon":"Rising"}</div>
              <div style={{fontFamily:SR,fontSize:16,color:P.ink}}>{b.icon==="☉"?sun:b.icon==="☽"?moon:rising}</div>
              <div style={{fontFamily:SN,fontSize:7,color:P.fn,marginTop:3,opacity:0.5}}>tap to learn</div>
            </div>
          ))}
        </div>
        {/* Merged card */}
        {openB3!==-1&&(
          <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,boxShadow:SH3,overflow:"hidden",animation:"fu 0.5s ease"}}>
            <div style={{display:"flex",alignItems:"center",padding:"16px 18px",gap:12,borderBottom:"1px solid rgba(42,33,24,0.04)"}}>
              <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontFamily:SR,flexShrink:0,background:b3[openB3].bg,color:b3[openB3].c}}>{b3[openB3].icon}</div>
              <div><div style={{fontFamily:SR,fontSize:20,color:P.ink}}>{b3[openB3].label}</div><div style={{fontFamily:SN,fontSize:9,color:P.lt,marginTop:1}}>{b3[openB3].sub}</div></div>
            </div>
            <div style={{padding:"16px 18px",fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.65,fontStyle:"italic"}}>
              {reading.bigThreeTexts?reading.bigThreeTexts[openB3]:"Tap another placement to explore, or tap below to return."}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",padding:"0 18px 14px"}}>
              <button onClick={()=>flipB3(openB3)} style={{fontFamily:SN,fontSize:8,color:P.gold,background:"transparent",border:"1px solid rgba(191,140,62,0.15)",padding:"4px 12px",borderRadius:10,cursor:"pointer",letterSpacing:1,textTransform:"uppercase"}}>Tap to go back</button>
            </div>
          </div>
        )}
      </div>

      {/* Intensity — V6 exact */}
      <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:12,padding:"13px 16px",marginBottom:20,boxShadow:SH,transition:"all 0.4s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <span style={{fontFamily:SN,fontSize:7,letterSpacing:2.5,color:P.fn,textTransform:"uppercase",transition:"color 0.3s"}}>This week's intensity</span>
          <span style={{fontFamily:SR,fontSize:20,fontWeight:300,color:P.ink,transition:"all 0.3s"}}>{intVal}<span style={{fontSize:11,color:P.fn}}>/10</span></span>
        </div>
        <div style={{display:"flex",gap:2.5}}>{bars}</div>
        <div style={{fontFamily:SN,fontSize:8,color:P.lt,marginTop:5,textAlign:"center",fontStyle:"italic",minHeight:14,transition:"opacity 0.3s"}}>{intArea}</div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
        <button onClick={()=>{setTab("weekly");setOpenCard(0);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}} style={tabS("weekly")}>Weekly</button>
        <button onClick={()=>{setTab("monthly");setOpenCard(0);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}} style={tabS("monthly")}>Monthly</button>
        <button onClick={()=>{setTab("transits");setIntVal(intensity);setIntArea("Overall");setIntColor(null);}} style={tabS("transits")}>Transits</button>
      </div>

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0 16px"}}><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/><span style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>{tab}</span><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/></div>

      {/* Weekly / Monthly cards — V6 accordion */}
      {cards&&cards.map((card,i)=>{
        const cc=CC[i%CC.length];const isOpen=openCard===i;
        return(
          <div key={tab+"-"+i} style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:isOpen?SH3:SH,transition:"box-shadow 0.3s"}}>
            <div style={{height:2,opacity:0.5,background:"linear-gradient(90deg,"+cc.c+"80,transparent 75%)"}}/>
            <div onClick={()=>togCard(i)} style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:SR,background:cc.bg,color:cc.c}}>{card.planet}</span>
                <span style={{fontFamily:SR,fontSize:15,color:P.ink}}>{card.area}</span>
              </div>
              <span style={{fontFamily:SN,fontSize:9,color:P.fn,transition:"transform 0.25s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>
            </div>
            {isOpen&&(
              <div style={{padding:"0 16px 14px"}}>
                <p style={{fontFamily:SR,fontSize:14,lineHeight:1.72,color:P.mid,margin:"0 0 12px",fontStyle:"italic"}}>{card.body||card.title}</p>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button style={{display:"inline-flex",alignItems:"center",gap:3,fontFamily:SN,fontSize:9,letterSpacing:1.5,background:"transparent",padding:"4px 10px",borderRadius:12,cursor:"pointer",textTransform:"uppercase",color:cc.c,border:"1px solid "+cc.c+"30"}}>↑ Share</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Transits tab — compact rows with intensity bars */}
      {tab==="transits"&&reading.transits&&reading.transits.map((tr,i)=>{
        const cc=CC[i%CC.length];
        return(
          <div key={i} style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:"14px 16px",marginBottom:8,boxShadow:SH}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontFamily:SN,fontSize:11,fontWeight:500,color:P.ink}}>{tr.transit}</span>
              <span style={{fontFamily:SR,fontSize:14,color:P.gold,fontWeight:300}}>{tr.intensity||"—"}/10</span>
            </div>
            <p style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.6,fontStyle:"italic",margin:"0 0 6px"}}>{tr.meaning}</p>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontFamily:SN,fontSize:8,color:P.fn}}>Peak: {tr.peak}</span>
              <span style={{fontFamily:SN,fontSize:8,color:P.fn}}>Orb: {tr.orb}</span>
            </div>
            <div style={{width:"100%",height:4,borderRadius:2,background:P.warm}}>
              <div style={{width:((tr.intensity||5)*10)+"%",height:"100%",borderRadius:2,background:"linear-gradient(90deg,"+P.sage+","+P.gold+")"}}/>
            </div>
          </div>
        );
      })}

      {/* Divider before Your Line */}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 16px"}}><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/><span style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>your line</span><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/></div>

      {/* Your Line — V6 EXACT warm linen */}
      {reading.line&&(
        <div onClick={onShareable} style={{background:P.linen,border:"1px solid rgba(191,140,62,0.1)",borderRadius:14,padding:"24px 20px",position:"relative",overflow:"hidden",cursor:"pointer",boxShadow:SH3}}>
          <div style={{position:"absolute",top:-20,right:-10,width:120,height:120,background:"radial-gradient(circle,rgba(191,140,62,0.08) 0%,transparent 55%)"}}/>
          <div style={{fontFamily:SN,fontSize:6,letterSpacing:3,color:P.lt,textTransform:"uppercase",marginBottom:10}}>luminary · your line</div>
          <blockquote style={{fontFamily:SR,fontSize:16,fontWeight:300,color:P.ink,lineHeight:1.58,margin:0,fontStyle:"italic",position:"relative",zIndex:1}}>"{reading.line}"</blockquote>
          <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontFamily:SR,fontSize:12,color:P.gold}}>{name}</div>
              <div style={{fontFamily:SN,fontSize:7,color:P.lt,letterSpacing:1.5,marginTop:1}}>{ZG[sun]||""} {sun} · {ZG[moon]||""} {moon}{rising!=="Unknown"?" · "+(ZG[rising]||"")+" "+rising:""}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button style={{fontFamily:SN,fontSize:8,letterSpacing:1,border:"none",padding:"4px 9px",borderRadius:8,cursor:"pointer",color:P.mid,background:"rgba(42,33,24,0.05)"}}>Save</button>
              <button style={{fontFamily:SN,fontSize:8,letterSpacing:1,border:"none",padding:"4px 9px",borderRadius:8,cursor:"pointer",color:"#FFF",background:P.gold}}>Share</button>
            </div>
          </div>
        </div>
      )}

      {/* Mantra */}
      {reading.mantra&&(
        <div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.1)",borderRadius:14,padding:"18px 20px",marginTop:16,textAlign:"center"}}>
          <div style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.gold,textTransform:"uppercase",marginBottom:6}}>this week's mantra</div>
          <div style={{fontFamily:SR,fontSize:15,color:P.ink,fontStyle:"italic",lineHeight:1.5,fontWeight:300}}>{reading.mantra}</div>
        </div>
      )}

      {/* Birth chart deep dive */}
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={onBirthChart} style={{fontFamily:SN,fontSize:9,fontWeight:500,letterSpacing:2,color:P.violet,background:P.violetBg,border:"1px solid rgba(141,128,184,0.15)",padding:"10px 22px",borderRadius:20,cursor:"pointer",textTransform:"uppercase"}}>Deep Birth Chart Analysis</button>
      </div>

      {/* Floating Ask Luminary — V6 exact */}
      <button onClick={onChat} style={{position:"fixed",bottom:20,right:20,zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:0.8,color:"#FAF6F0",background:P.ink,border:"none",padding:"9px 18px",borderRadius:20,cursor:"pointer",boxShadow:"0 3px 16px rgba(42,33,24,0.18)",display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:12,opacity:0.7}}>✦</span> Ask Luminary
      </button>
    </div>
  );
}

/* ═══ SHAREABLE — V6 EXACT warm linen with mini orrery ═══ */
function ShareableScreen({reading,name,chart,onBack}){
  const{sun,moon,rising}=chart;
  return(
    <div style={{height:"100%",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{fontFamily:SN,fontSize:8,letterSpacing:3,color:P.fn,textTransform:"uppercase",marginBottom:12}}>Your line this week</div>
      <div style={{width:"100%",maxWidth:300,aspectRatio:"9/16",background:P.linen,border:"1px solid rgba(191,140,62,0.08)",borderRadius:16,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",justifyContent:"center",padding:"36px 22px",boxShadow:"0 8px 32px rgba(42,33,24,0.08)"}}>
        <div style={{position:"absolute",top:18,left:22,fontFamily:SN,fontSize:7,letterSpacing:4,color:P.fn,textTransform:"uppercase"}}>luminary</div>
        <div style={{position:"absolute",top:36,left:22,right:22,height:1,background:"linear-gradient(90deg,rgba(191,140,62,0.2),transparent)"}}/>
        {/* Mini orrery — V6 exact */}
        <div style={{position:"absolute",top:46,right:16,width:40,height:40,opacity:0.15}}>
          <div style={{position:"absolute",width:14,height:14,top:13,left:13,borderRadius:"50%",borderWidth:2,borderStyle:"solid",borderColor:"rgba(196,131,106,0.5)",animation:"orb 6s linear infinite"}}><div style={{width:3,height:3,borderRadius:"50%",background:P.terra,position:"absolute",top:-1.5,left:"50%",marginLeft:-1.5}}/></div>
          <div style={{position:"absolute",width:26,height:26,top:7,left:7,borderRadius:"50%",borderWidth:1.5,borderStyle:"solid",borderColor:"rgba(122,148,104,0.4)",animation:"orb 10s linear infinite reverse"}}><div style={{width:3,height:3,borderRadius:"50%",background:P.sage,position:"absolute",top:-1.5,left:"50%",marginLeft:-1.5}}/></div>
          <div style={{position:"absolute",width:38,height:38,top:1,left:1,borderRadius:"50%",borderWidth:1,borderStyle:"solid",borderColor:"rgba(141,128,184,0.3)",animation:"orb 16s linear infinite"}}><div style={{width:2,height:2,borderRadius:"50%",background:P.violet,position:"absolute",top:-1,left:"50%",marginLeft:-1}}/></div>
          <div style={{width:4,height:4,borderRadius:"50%",background:P.gold,position:"absolute",top:18,left:18}}/>
        </div>
        <blockquote style={{fontFamily:SR,fontSize:18,fontWeight:300,color:P.ink,lineHeight:1.58,margin:0,fontStyle:"italic",zIndex:1}}>"{reading.line}"</blockquote>
        <div style={{position:"absolute",bottom:22,left:22,right:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontFamily:SR,fontSize:13,color:P.gold}}>{name}</div>
            <div style={{fontFamily:SN,fontSize:7,color:P.lt,letterSpacing:1.5,marginTop:1}}>{ZG[sun]||""} {sun} · {ZG[moon]||""} {moon}{rising!=="Unknown"?" · "+(ZG[rising]||"")+" "+rising:""}</div>
          </div>
          <div style={{fontFamily:SN,fontSize:6,color:P.fn,letterSpacing:2,textTransform:"uppercase"}}>Week of Mar 28</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <button onClick={onBack} style={{fontFamily:SN,fontSize:9,letterSpacing:1.5,padding:"7px 14px",borderRadius:14,cursor:"pointer",textTransform:"uppercase",color:P.lt,background:"transparent",border:"1px solid rgba(42,33,24,0.1)"}}>Back</button>
        <button style={{fontFamily:SN,fontSize:9,letterSpacing:1.5,padding:"7px 14px",borderRadius:14,cursor:"pointer",textTransform:"uppercase",color:"#FFF",background:P.gold,border:"none"}}>Save to photos</button>
        <button style={{fontFamily:SN,fontSize:9,letterSpacing:1.5,padding:"7px 14px",borderRadius:14,cursor:"pointer",textTransform:"uppercase",color:P.gold,background:"transparent",border:"1px solid rgba(191,140,62,0.15)"}}>Share</button>
      </div>
      <style>{V6CSS}</style>
    </div>
  );
}

/* ═══ BIRTH CHART ANALYSIS ═══ */
function BirthChartScreen({chart,analysis,name,onBack,onChat}){
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 100px"}}>
      <button onClick={onBack} style={{fontFamily:SN,fontSize:10,color:P.gold,background:"transparent",border:"none",cursor:"pointer",marginBottom:16}}>← Reading</button>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.fn,textTransform:"uppercase",marginBottom:6}}>birth chart analysis</div>
        <h2 style={{fontFamily:SR,fontSize:26,fontWeight:300,color:P.ink}}>{name}</h2>
      </div>
      {analysis?(
        <>
          {analysis.bigThree&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Your Big Three</div><p style={{fontFamily:SR,fontSize:14,color:P.mid,lineHeight:1.7,fontStyle:"italic"}}>{analysis.bigThree}</p></div>}
          {analysis.element&&<div style={{background:P.sageBg,border:"1px solid rgba(122,148,104,0.1)",borderRadius:14,padding:"16px 20px",marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.sage,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Dominant Element</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,lineHeight:1.6,fontStyle:"italic"}}>{analysis.element}</p></div>}
          {analysis.strengths&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.gold,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Strengths</div>{analysis.strengths.map((s,i)=><p key={i} style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.6,fontStyle:"italic",marginBottom:4}}>✦ {s}</p>)}</div>}
          {analysis.loveStyle&&<div style={{background:P.terraBg,border:"1px solid rgba(196,131,106,0.1)",borderRadius:14,padding:"16px 20px",marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>How You Love</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,lineHeight:1.6,fontStyle:"italic"}}>{analysis.loveStyle}</p></div>}
          {analysis.currentChapter&&<div style={{background:P.violetBg,border:"1px solid rgba(141,128,184,0.1)",borderRadius:14,padding:"16px 20px",marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Current Chapter</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,lineHeight:1.6,fontStyle:"italic"}}>{analysis.currentChapter}</p></div>}
          {analysis.soulMantra&&<div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.1)",borderRadius:14,padding:"18px 20px",marginTop:16,textAlign:"center"}}><div style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.gold,textTransform:"uppercase",marginBottom:6}}>soul mantra</div><p style={{fontFamily:SR,fontSize:16,color:P.ink,fontStyle:"italic",lineHeight:1.5,fontWeight:300}}>{analysis.soulMantra}</p></div>}
        </>
      ):<div style={{textAlign:"center",padding:40}}><Spinner size={48}/><p style={{fontFamily:SN,fontSize:12,color:P.lt,marginTop:12}}>Analyzing your chart...</p></div>}
      <button onClick={onChat} style={{position:"fixed",bottom:20,right:20,zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:0.8,color:"#FAF6F0",background:P.ink,border:"none",padding:"9px 18px",borderRadius:20,cursor:"pointer",boxShadow:"0 3px 16px rgba(42,33,24,0.18)",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12,opacity:0.7}}>✦</span> Ask Luminary</button>
      <style>{V6CSS}</style>
    </div>
  );
}

/* ═══ AI CHAT — V6 styling ═══ */
function ChatScreen({chart,name,onBack,userKey}){
  const[msgs,setMsgs]=useState([{role:"assistant",text:"Welcome, "+name+". I have your complete natal chart — "+chart.sun+" Sun, "+chart.moon+" Moon"+(chart.rising!=="Unknown"?", "+chart.rising+" Rising":"")+". What would you like to explore?"}]);
  const[inp,setInp]=useState("");const[ld,setLd]=useState(false);const ref=useRef(null);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const send=async()=>{if(!inp.trim()||ld)return;const u=inp.trim();setInp("");setLd(true);
    const upd=[...msgs,{role:"user",text:u}];setMsgs(upd);
    try{const am=[{role:"user",content:"Chart: "+chart.promptText+"\nQuerent: "+name}];upd.forEach(m=>am.push({role:m.role==="user"?"user":"assistant",content:m.text}));
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:am,userName:name})});const d=await r.json();
      const nm=[...upd,{role:"assistant",text:d.reply}];setMsgs(nm);if(userKey)saveChatHist(userKey,nm);
    }catch{setMsgs(p=>[...p,{role:"assistant",text:"Connection lost. Try again?"}]);}setLd(false);};
  return(
    <div style={{height:"100%",background:P.bg,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid "+P.bdr,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:P.gold,fontSize:13,cursor:"pointer",fontFamily:SN}}>← Back</button>
        <span style={{fontFamily:SN,fontSize:9,letterSpacing:4,color:P.gold,fontWeight:500}}>✦ luminary ai ✦</span>
      </div>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{marginBottom:14,textAlign:m.role==="user"?"right":"left"}}>
            <div style={{display:"inline-block",maxWidth:"82%",padding:"12px 16px",borderRadius:14,fontSize:14,lineHeight:1.7,fontFamily:SR,fontStyle:m.role==="assistant"?"italic":"normal",background:m.role==="user"?P.goldBg:P.card,color:m.role==="user"?P.ink:P.mid,border:"1px solid "+(m.role==="user"?"rgba(191,140,62,0.15)":P.bdr)}}>{m.text}</div>
          </div>
        ))}
        {ld&&<div style={{textAlign:"left"}}><div style={{display:"inline-block",padding:"12px 16px",borderRadius:14,background:P.card,border:"1px solid "+P.bdr}}><Spinner size={24}/></div></div>}
      </div>
      <div style={{padding:"10px 18px 24px",borderTop:"1px solid "+P.bdr,display:"flex",gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,padding:"12px 16px",borderRadius:20,border:"1px solid "+P.bdr,background:P.card,fontSize:14,fontFamily:SN,color:P.ink,outline:"none"}}/>
        <button onClick={send} disabled={ld||!inp.trim()} style={{width:44,height:44,borderRadius:22,background:P.ink,border:"none",color:"#FFF",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
      <style>{V6CSS}</style>
    </div>
  );
}

/* ═══ MAIN APP CONTROLLER ═══ */
export default function Luminary(){
  const[scr,setScr]=useState("landing");const[tag,setTag]=useState("before");
  const[bd,setBd]=useState(null);const[ans,setAns]=useState(null);
  const[chart,setChart]=useState(null);const[reading,setReading]=useState(null);
  const[bca,setBca]=useState(null);const[err,setErr]=useState(null);const[ukey,setUkey]=useState(null);

  const generate=async(b,a)=>{setScr("loading");try{
    const cr=await fetch("/api/chart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
    const ch=await cr.json();if(ch.error)throw new Error(ch.error);setChart(ch);
    const hr=await fetch("/api/horoscope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chartText:ch.promptText,name:b.name,...a})});
    const ho=await hr.json();if(ho.error)throw new Error(ho.error);setReading(ho);
    const k=b.ig||b.name?.toLowerCase().replace(/\s+/g,"-")||"anon";setUkey(k);
    saveReading({name:b.name,ig:b.ig,chart:ch,reading:ho,answers:a});
    setScr("reading");
  }catch(e){console.error(e);setErr(e.message);setScr("error");}};

  const loadBca=async()=>{if(bca){setScr("birthchart");return;}setScr("birthchart");
    try{const r=await fetch("/api/birthchart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chartText:chart.promptText,name:bd.name})});
      const d=await r.json();setBca(d);saveReading({name:bd.name,ig:bd.ig,chart,reading,answers:ans,birthchartAnalysis:d});
    }catch(e){console.error(e);}};

  const reset=()=>{setBd(null);setAns(null);setChart(null);setReading(null);setBca(null);setErr(null);setUkey(null);setScr("landing");};

  /* NAV BAR — V6 style */
  const navItems=[{id:"landing",l:"Home"},{id:"reading",l:"Reading"},{id:"shareable",l:"Your Line"}];
  const navBtn=(id)=>({fontFamily:SN,fontSize:9,border:"none",padding:"5px 10px",borderRadius:5,cursor:"pointer",background:scr===id?P.warm:"transparent",color:scr===id?P.ink:P.fn});

  return(
    <>
      <style>{V6CSS}</style>
      {/* Nav */}
      <div style={{display:"flex",alignItems:"center",gap:4,padding:"8px 10px",background:"#FFF",borderBottom:"1px solid rgba(42,33,24,0.05)",flexShrink:0}}>
        {navItems.map(n=><button key={n.id} onClick={()=>{if(n.id==="landing")reset();else if(n.id==="reading"&&chart)setScr("reading");else if(n.id==="shareable"&&reading)setScr("shareable");}} style={navBtn(n.id)}>{n.l}</button>)}
        <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
          <button onClick={()=>setTag("before")} style={{fontFamily:SN,fontSize:8,padding:"3px 7px",borderRadius:4,cursor:"pointer",border:"1px solid transparent",background:tag==="before"?P.goldBg:"transparent",color:tag==="before"?P.gold:P.fn,borderColor:tag==="before"?"rgba(191,140,62,0.15)":"transparent"}}>{tag==="before"?"before":"before"}</button>
          <button onClick={()=>setTag("as")} style={{fontFamily:SN,fontSize:8,padding:"3px 7px",borderRadius:4,cursor:"pointer",border:"1px solid transparent",background:tag==="as"?P.sageBg:"transparent",color:tag==="as"?P.sage:P.fn,borderColor:tag==="as"?"rgba(122,148,104,0.15)":"transparent"}}>{tag==="as"?"as":"as"}</button>
        </div>
      </div>
      {/* Screens */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {scr==="landing"&&<Landing onStart={()=>setScr("input")} tag={tag}/>}
        {scr==="input"&&<BirthInput onSubmit={b=>{setBd(b);setScr("questions");}}/>}
        {scr==="questions"&&<Questions onSubmit={a=>{setAns(a);generate(bd,a);}} name={bd?.name||""}/>}
        {scr==="loading"&&<LoadingScreen name={bd?.name||""}/>}
        {scr==="reading"&&chart&&reading&&<ReadingScreen chart={chart} reading={reading} name={bd?.name||""} onChat={()=>setScr("chat")} onReset={reset} onBirthChart={loadBca} onShareable={()=>setScr("shareable")}/>}
        {scr==="shareable"&&reading&&chart&&<ShareableScreen reading={reading} name={bd?.name||""} chart={chart} onBack={()=>setScr("reading")}/>}
        {scr==="birthchart"&&<BirthChartScreen chart={chart} analysis={bca} name={bd?.name||""} onBack={()=>setScr("reading")} onChat={()=>setScr("chat")}/>}
        {scr==="chat"&&chart&&<ChatScreen chart={chart} name={bd?.name||""} onBack={()=>setScr(bca?"birthchart":"reading")} userKey={ukey}/>}
        {scr==="error"&&(
          <div style={{flex:1,background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
            <p style={{fontFamily:SR,fontSize:22,fontWeight:300,color:P.ink,marginBottom:8}}>Something went wrong</p>
            <p style={{fontFamily:SN,fontSize:13,color:P.lt,marginBottom:20}}>{err}</p>
            <button onClick={()=>generate(bd,ans)} style={{padding:"12px 28px",background:P.ink,color:"#FFF",border:"none",borderRadius:20,cursor:"pointer",fontFamily:SN,fontSize:11,marginBottom:8}}>Try Again</button>
            <button onClick={reset} style={{background:"none",border:"none",color:P.lt,cursor:"pointer",fontFamily:SN,fontSize:11}}>Start Over</button>
          </div>
        )}
      </div>
    </>
  );
}

"use client";
import{useState,useEffect,useRef}from"react";

/* ═══ V6 DESIGN TOKENS ═══ */
const P={bg:"#FAF6F0",body:"#F3EDE3",card:"#FFF",bdr:"rgba(42,33,24,0.05)",
  ink:"#2A2118",mid:"#6B5D50",lt:"#A09282",fn:"#CFC4B6",
  gold:"#BF8C3E",goldBg:"#F6EDD9",sage:"#7E9A6C",sageBg:"#E5EBE0",
  terra:"#C4836A",terraBg:"#F5EBE5",violet:"#8D80B8",violetBg:"#ECE8F3",
  warm:"#EDE6DA",linen:"#F5EDE0",night:"#191613"};
const SR="'Cormorant Garamond',serif";
const SN="'DM Sans',sans-serif";
const SH="0 1px 8px rgba(42,33,24,0.04)";
const SH3="0 6px 24px rgba(42,33,24,0.07)";
const ZG={Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓"};
const CC=[{c:P.terra,bg:P.terraBg},{c:P.sage,bg:P.sageBg},{c:P.gold,bg:P.goldBg},{c:P.violet,bg:P.violetBg}];
const V6CSS="*{box-sizing:border-box;margin:0;padding:0}button:active{transform:scale(0.97)}@keyframes orb{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes orrIn{to{opacity:1;transform:scale(1) rotate(0deg)}}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}";

const CITIES=[{n:"Phoenix, AZ",lat:33.45,lon:-112.07},{n:"Scottsdale, AZ",lat:33.49,lon:-111.93},{n:"Los Angeles, CA",lat:34.05,lon:-118.24},{n:"New York, NY",lat:40.71,lon:-74.01},{n:"Chicago, IL",lat:41.88,lon:-87.63},{n:"Houston, TX",lat:29.76,lon:-95.37},{n:"Miami, FL",lat:25.76,lon:-80.19},{n:"Denver, CO",lat:39.74,lon:-104.99},{n:"Seattle, WA",lat:47.61,lon:-122.33},{n:"Austin, TX",lat:30.27,lon:-97.74},{n:"San Francisco, CA",lat:37.77,lon:-122.42},{n:"Nashville, TN",lat:36.16,lon:-86.78},{n:"Atlanta, GA",lat:33.75,lon:-84.39},{n:"Boston, MA",lat:42.36,lon:-71.06},{n:"Dallas, TX",lat:32.78,lon:-96.80},{n:"San Diego, CA",lat:32.72,lon:-117.16},{n:"Las Vegas, NV",lat:36.17,lon:-115.14},{n:"Portland, OR",lat:45.52,lon:-122.68},{n:"Tucson, AZ",lat:32.22,lon:-110.97},{n:"Mesa, AZ",lat:33.42,lon:-111.83},{n:"Paradise Valley, AZ",lat:33.53,lon:-111.94},{n:"London, UK",lat:51.51,lon:-0.13},{n:"Paris, France",lat:48.86,lon:2.35},{n:"Tokyo, Japan",lat:35.68,lon:139.69},{n:"Sydney, Australia",lat:-33.87,lon:151.21},{n:"Toronto, Canada",lat:43.65,lon:-79.38},{n:"Berlin, Germany",lat:52.52,lon:13.41},{n:"Mumbai, India",lat:19.08,lon:72.88},{n:"Tel Aviv, Israel",lat:32.09,lon:34.78},{n:"Dubai, UAE",lat:25.20,lon:55.27},{n:"Amsterdam, NL",lat:52.37,lon:4.90},{n:"Barcelona, Spain",lat:41.39,lon:2.17},{n:"Seoul, South Korea",lat:37.57,lon:126.98},{n:"Aurora, IL",lat:41.76,lon:-88.32},{n:"Northampton, MA",lat:42.33,lon:-72.63},{n:"Beverly Hills, CA",lat:34.07,lon:-118.40},{n:"Oakland, CA",lat:37.80,lon:-122.27},{n:"Bali, Indonesia",lat:-8.34,lon:115.09},{n:"Vancouver, Canada",lat:49.28,lon:-123.12},{n:"Kauai, HI",lat:22.08,lon:-159.37}];
async function searchCity(q){if(q.length<2)return[];const local=CITIES.filter(c=>c.n.toLowerCase().includes(q.toLowerCase())).slice(0,6);if(q.length<3)return local;try{const r=await fetch("https://nominatim.openstreetmap.org/search?q="+encodeURIComponent(q)+"&format=json&limit=6&featuretype=city");const d=await r.json();const remote=d.map(c=>({n:c.display_name.split(",").slice(0,2).join(",").trim(),lat:parseFloat(c.lat),lon:parseFloat(c.lon)}));const all=[...local];for(const r of remote){if(!all.some(a=>Math.abs(a.lat-r.lat)<0.1&&Math.abs(a.lon-r.lon)<0.1))all.push(r);}return all.slice(0,8);}catch{return local;}}
async function saveReading(d){try{await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",...d})});}catch{}}
async function saveChatHist(key,h){try{await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"saveChat",key,chatHistory:h})});}catch{}}

/* ═══ BREATHING + SPINNING ORRERY (Spinner ⑦ from orrery v2 — Mat's pick) ═══
   Arcs rotate 4s/6s/9s alternating; opacity breathes 6s/8s/10s; sun core pulses.
   Hero uses slow=3x durations so 440px stays hypnotic, not frantic. */
function OrrerySVG({size=48,slow=1}){
  const d=(n)=>(n*slow)+"s";
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"block"}}>
      <circle cx="50" cy="50" r="5" fill="#BF8C3E">
        <animate attributeName="r" values="4;6;4" dur={d(3)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(196,131,106,0.38)" strokeWidth="5.5" strokeDasharray="90 35" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={d(4)} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur={d(6)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="30" r="4.5" fill="#C4836A" opacity="0.85">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={d(4)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(126,154,108,0.3)" strokeWidth="4.5" strokeDasharray="155 58" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur={d(6)} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur={d(8)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="16" r="5.5" fill="#7E9A6C" opacity="0.75">
        <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur={d(6)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(141,128,184,0.2)" strokeWidth="3" strokeDasharray="210 78" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={d(9)} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur={d(10)} repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="4" r="4" fill="#8D80B8" opacity="0.55">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={d(9)} repeatCount="indefinite"/>
      </circle>
      <circle cx="92" cy="30" r="2.8" fill="#BF8C3E" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={d(9)} repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

/* Original V6 rings, parametric — for Star Note surfaces per Mat */
function OrreryClassic({size=440,opacity=1}){
  const k=size/440;
  const px=(n)=>n*k;
  return(
    <div style={{position:"relative",width:size,height:size,opacity}}>
      <div style={{position:"absolute",width:px(28),height:px(28),borderRadius:"50%",top:px(206),left:px(206),background:"radial-gradient(circle,#E8C98A 0%,#BF8C3E 50%,rgba(191,140,62,0.2) 100%)",boxShadow:"0 0 30px rgba(218,176,98,0.35),0 0 60px rgba(218,176,98,0.1)"}}/>
      <div style={{position:"absolute",borderRadius:"50%",width:px(120),height:px(120),top:px(160),left:px(160),borderWidth:Math.max(2,px(6)),borderStyle:"solid",borderColor:"rgba(196,131,106,0.18)",animation:"orb 45s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:px(14),height:px(14),background:P.terra,top:"-50%",left:"50%",margin:(-px(7))+"px 0 0 "+(-px(7))+"px",boxShadow:"0 0 12px rgba(196,131,106,0.5)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:px(200),height:px(200),top:px(120),left:px(120),borderWidth:Math.max(2,px(8)),borderStyle:"solid",borderColor:"rgba(122,148,104,0.14)",animation:"orb 65s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:px(18),height:px(18),background:P.sage,top:"-50%",left:"50%",margin:(-px(9))+"px 0 0 "+(-px(9))+"px",boxShadow:"0 0 14px rgba(122,148,104,0.4)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:px(300),height:px(300),top:px(70),left:px(70),borderWidth:Math.max(1.5,px(5)),borderStyle:"solid",borderColor:"rgba(141,128,184,0.10)",animation:"orb 90s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:px(12),height:px(12),background:P.violet,top:"-50%",left:"50%",margin:(-px(6))+"px 0 0 "+(-px(6))+"px",boxShadow:"0 0 10px rgba(141,128,184,0.4)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:px(400),height:px(400),top:px(20),left:px(20),borderWidth:Math.max(1,px(3)),borderStyle:"solid",borderColor:"rgba(191,140,62,0.06)",animation:"orb 120s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:px(8),height:px(8),background:P.gold,opacity:0.5,top:"-50%",left:"50%",margin:(-px(4))+"px 0 0 "+(-px(4))+"px",boxShadow:"0 0 8px rgba(191,140,62,0.3)"}}/>
      </div>
    </div>
  );
}

function Orrery(){
  return(
    <div style={{position:"absolute",top:-60,right:-120,width:440,height:440,zIndex:1,opacity:0,transform:"scale(0.5) rotate(-40deg)",animation:"orrIn 2.2s cubic-bezier(0.16,1,0.3,1) 0.1s forwards"}}>
      <div style={{position:"absolute",width:28,height:28,borderRadius:"50%",top:206,left:206,background:"radial-gradient(circle,#E8C98A 0%,#BF8C3E 50%,rgba(191,140,62,0.2) 100%)",boxShadow:"0 0 30px rgba(218,176,98,0.35),0 0 60px rgba(218,176,98,0.1)"}}/>
      <div style={{position:"absolute",borderRadius:"50%",width:120,height:120,top:160,left:160,borderWidth:6,borderStyle:"solid",borderColor:"rgba(196,131,106,0.18)",animation:"orb 45s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:14,height:14,background:P.terra,top:"-50%",left:"50%",margin:"-7px 0 0 -7px",boxShadow:"0 0 12px rgba(196,131,106,0.5)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:200,height:200,top:120,left:120,borderWidth:8,borderStyle:"solid",borderColor:"rgba(122,148,104,0.14)",animation:"orb 65s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:18,height:18,background:P.sage,top:"-50%",left:"50%",margin:"-9px 0 0 -9px",boxShadow:"0 0 14px rgba(122,148,104,0.4)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:300,height:300,top:70,left:70,borderWidth:5,borderStyle:"solid",borderColor:"rgba(141,128,184,0.10)",animation:"orb 90s linear infinite"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:12,height:12,background:P.violet,top:"-50%",left:"50%",margin:"-6px 0 0 -6px",boxShadow:"0 0 10px rgba(141,128,184,0.4)"}}/>
      </div>
      <div style={{position:"absolute",borderRadius:"50%",width:400,height:400,top:20,left:20,borderWidth:3,borderStyle:"solid",borderColor:"rgba(191,140,62,0.06)",animation:"orb 120s linear infinite reverse"}}>
        <div style={{position:"absolute",borderRadius:"50%",width:8,height:8,background:P.gold,opacity:0.5,top:"-50%",left:"50%",margin:"-4px 0 0 -4px",boxShadow:"0 0 8px rgba(191,140,62,0.3)"}}/>
      </div>
    </div>
  );
}

function Spinner({size=48}){
  return(<div style={{display:"inline-block",width:size,height:size}}><OrrerySVG size={size}/></div>);
}

function LoadingScreen({name}){
  return(
    <div style={{height:"100%",background:P.bg,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <Orrery/>
      <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
        <Spinner size={64}/>
        <p style={{fontFamily:SN,fontSize:11,letterSpacing:4,color:P.lt,textTransform:"uppercase",marginTop:20,opacity:0,animation:"fu 1s ease 1.5s forwards"}}>Reading {name?name+"'s":"your"} light</p>
      </div>
    </div>
  );
}

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

/* ═══ READING — 38px header, Your Line card with signature orrery ═══ */
function MiniOrrery({size=44,opacity=0.35}){
  return(
    <div style={{position:"absolute",top:14,right:14,width:size,height:size,opacity,pointerEvents:"none"}}>
      <OrrerySVG size={size}/>
    </div>
  );
}

function ReadingScreen({chart,reading,name,onChat,onReset,onShareable}){
  const[tab,setTab]=useState("weekly");
  const[openCard,setOpenCard]=useState(0);
  const[openB3,setOpenB3]=useState(-1);
  const[intVal,setIntVal]=useState(chart.intensity);
  const[intArea,setIntArea]=useState("Overall");
  const[intColor,setIntColor]=useState(null);
  const{sun,moon,rising,intensity}=chart;
  const b3=[
    {label:"Sun in "+sun,icon:"☉",c:P.gold,bg:P.goldBg,sub:"Your core identity · 40% influence",int:intensity},
    {label:"Moon in "+moon,icon:"☽",c:P.sage,bg:P.sageBg,sub:"Your emotional world · 35% influence",int:Math.max(1,Math.round((intensity-1)*10)/10)},
    {label:(rising!=="Unknown"?rising:"?")+" Rising",icon:"↑",c:P.terra,bg:P.terraBg,sub:"How others see you · 25% influence",int:Math.max(1,Math.round((intensity-2)*10)/10)},
  ];
  const cards=tab==="weekly"?reading.weekly:tab==="monthly"?reading.monthly:null;
  const flipB3=(i)=>{if(openB3===i){setOpenB3(-1);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}else{setOpenB3(i);setIntVal(b3[i].int);setIntArea(b3[i].label);setIntColor(b3[i].c);}};
  const togCard=(i)=>{if(openCard===i){setOpenCard(-1);setIntVal(intensity);setIntArea("Overall");setIntColor(null);}else{setOpenCard(i);if(cards&&cards[i]){const cc=CC[i%CC.length];setIntVal(cards[i].intensity||intensity);setIntArea(cards[i].area);setIntColor(cc.c);}}};
  const tabS=(t)=>({fontFamily:SN,fontSize:11,fontWeight:tab===t?500:300,color:tab===t?P.gold:P.fn,background:tab===t?P.goldBg:"transparent",border:"1.5px solid "+(tab===t?"rgba(191,140,62,0.15)":"transparent"),padding:"6px 16px",borderRadius:20,cursor:"pointer"});
  const bars=[];for(let i=0;i<10;i++){bars.push(<div key={i} style={{flex:1,height:5,borderRadius:2.5,background:i<intVal?(intColor||"hsl("+(42-i*2.5)+","+(48+i*4)+"%,"+(72-i*4)+"%)"):P.warm,transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",opacity:i<intVal&&intColor?0.4+i*0.06:1}}/>);}
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 90px"}}>
      <style>{V6CSS}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:10,opacity:0.5}}>your reading</div>
        <h2 style={{fontFamily:SR,fontSize:38,fontWeight:300,color:P.ink,margin:"0 0 4px",lineHeight:1.05}}>{name}</h2>
        <div style={{fontFamily:SR,fontSize:14,color:P.lt,fontStyle:"italic"}}>{ZG[sun]||""} {sun} · {ZG[moon]||""} {moon}{rising!=="Unknown"?" · "+(ZG[rising]||"")+" "+rising:""}</div>
        <button onClick={onReset} style={{fontFamily:SN,fontSize:8,color:P.gold,background:"transparent",border:"1px solid rgba(191,140,62,0.15)",padding:"3px 8px",borderRadius:10,cursor:"pointer",marginTop:8,letterSpacing:1,textTransform:"uppercase"}}>Log out</button>
      </div>
      <div style={{marginBottom:20,position:"relative"}}>
        <div style={{display:openB3===-1?"flex":"none",gap:8,justifyContent:"center"}}>
          {b3.map((b,i)=>(
            <div key={i} onClick={()=>flipB3(i)} style={{flex:"1 1 88px",maxWidth:110,background:P.card,border:"1px solid "+P.bdr,borderRadius:12,padding:"14px 8px",textAlign:"center",boxShadow:SH,cursor:"pointer"}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 5px",fontSize:14,fontFamily:SR,background:b.bg,color:b.c}}>{b.icon}</div>
              <div style={{fontFamily:SN,fontSize:7,letterSpacing:2.5,color:P.fn,textTransform:"uppercase",marginBottom:2}}>{i===0?"Sun":i===1?"Moon":"Rising"}</div>
              <div style={{fontFamily:SR,fontSize:16,color:P.ink}}>{i===0?sun:i===1?moon:rising}</div>
              <div style={{fontFamily:SN,fontSize:7,color:P.fn,marginTop:3,opacity:0.5}}>tap to learn</div>
            </div>
          ))}
        </div>
        {openB3!==-1&&(
          <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,boxShadow:SH3,overflow:"hidden",animation:"fu 0.5s ease"}}>
            <div style={{display:"flex",alignItems:"center",padding:"16px 18px",gap:12,borderBottom:"1px solid rgba(42,33,24,0.04)"}}>
              <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontFamily:SR,flexShrink:0,background:b3[openB3].bg,color:b3[openB3].c}}>{b3[openB3].icon}</div>
              <div><div style={{fontFamily:SR,fontSize:20,color:P.ink}}>{b3[openB3].label}</div><div style={{fontFamily:SN,fontSize:9,color:P.lt,marginTop:1}}>{b3[openB3].sub}</div></div>
            </div>
            <div style={{padding:"16px 18px",fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.65,fontStyle:"italic"}}>
              {reading.bigThreeTexts&&reading.bigThreeTexts[openB3]?reading.bigThreeTexts[openB3]:"Exploring this placement..."}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",padding:"0 18px 14px"}}>
              <button onClick={()=>flipB3(openB3)} style={{fontFamily:SN,fontSize:8,color:P.gold,background:"transparent",border:"1px solid rgba(191,140,62,0.15)",padding:"4px 12px",borderRadius:10,cursor:"pointer",letterSpacing:1,textTransform:"uppercase"}}>Tap to go back</button>
            </div>
          </div>
        )}
      </div>
      <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:12,padding:"13px 16px",marginBottom:20,boxShadow:SH}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <span style={{fontFamily:SN,fontSize:7,letterSpacing:2.5,color:P.fn,textTransform:"uppercase"}}>This week's intensity</span>
          <span style={{fontFamily:SR,fontSize:20,fontWeight:300,color:P.ink}}>{intVal}<span style={{fontSize:11,color:P.fn}}>/10</span></span>
        </div>
        <div style={{display:"flex",gap:2.5}}>{bars}</div>
        <div style={{fontFamily:SN,fontSize:8,color:P.lt,marginTop:5,textAlign:"center",fontStyle:"italic",minHeight:14}}>{intArea}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
        <button onClick={()=>{setTab("weekly");setOpenCard(0);}} style={tabS("weekly")}>Weekly</button>
        <button onClick={()=>{setTab("monthly");setOpenCard(0);}} style={tabS("monthly")}>Monthly</button>
        <button onClick={()=>setTab("transits")} style={tabS("transits")}>Transits</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0 16px"}}><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/><span style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>{tab}</span><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/></div>
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
                <p style={{fontFamily:SR,fontSize:14,lineHeight:1.72,color:P.mid,margin:"0 0 12px",fontStyle:"italic"}}>{card.body}</p>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button style={{display:"inline-flex",alignItems:"center",gap:3,fontFamily:SN,fontSize:9,letterSpacing:1.5,background:"transparent",padding:"4px 10px",borderRadius:12,cursor:"pointer",textTransform:"uppercase",color:cc.c,border:"1px solid "+cc.c+"30"}}>↑ Share</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {tab==="transits"&&reading.transits&&reading.transits.map((tr,i)=>(
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
      ))}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 16px"}}><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/><span style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>star note</span><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/></div>
      {reading.line&&(
        <div onClick={onShareable} style={{background:"linear-gradient(135deg,#F5EDE0 0%,#F6EDD9 55%,#F5EBE5 100%)",border:"1px solid rgba(191,140,62,0.14)",borderRadius:14,padding:"26px 20px",position:"relative",overflow:"hidden",cursor:"pointer",boxShadow:SH3}}>
        <div style={{position:"absolute",top:-30,right:-20,width:160,height:160,background:"radial-gradient(circle,rgba(191,140,62,0.1) 0%,transparent 55%)"}}/>
          <div style={{position:"absolute",top:-70,right:-110,width:380,height:380,pointerEvents:"none"}}><OrreryClassic size={380} opacity={0.55}/></div>
          <div style={{fontFamily:SN,fontSize:6,letterSpacing:3,color:P.lt,textTransform:"uppercase",marginBottom:10}}>luminary · star note</div>
          <blockquote style={{fontFamily:SR,fontSize:17,fontWeight:300,color:P.ink,lineHeight:1.58,margin:0,fontStyle:"italic",position:"relative",zIndex:1,maxWidth:"85%"}}>"{reading.line}"</blockquote>
          <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
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
      {reading.mantra&&(
        <div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.1)",borderRadius:14,padding:"18px 20px",marginTop:16,textAlign:"center"}}>
          <div style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.gold,textTransform:"uppercase",marginBottom:6}}>this week's mantra</div>
          <div style={{fontFamily:SR,fontSize:15,color:P.ink,fontStyle:"italic",lineHeight:1.5,fontWeight:300}}>{reading.mantra}</div>
        </div>
      )}
      <button onClick={onChat} style={{position:"fixed",right:0,top:"44%",zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2,color:"#FAF6F0",background:P.ink,border:"none",padding:"16px 9px",borderRadius:"14px 0 0 14px",cursor:"pointer",boxShadow:"-3px 3px 16px rgba(42,33,24,0.2)",writingMode:"vertical-rl",textOrientation:"mixed"}}>✦ Ask</button>
    </div>
  );
}

/* ═══ BIRTH CHART — full natal table, expandable cards, expand/collapse all ═══ */
function BirthChartScreen({chart,analysis,name,onChat}){
  const[open,setOpen]=useState({});
  const planetOrder=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const glyph={Sun:"☉",Moon:"☽",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇"};
  const meanings={};
  if(analysis&&analysis.planets)analysis.planets.forEach(p=>{meanings[p.planet]=p;});
  const allOpen=()=>{const o={};planetOrder.forEach(p=>o[p]=true);setOpen(o);};
  const allClosed=()=>setOpen({});
  const deg=(d)=>{const inSign=d%30;const wd=Math.floor(inSign);const wm=Math.round((inSign-wd)*60);return wd+"°"+String(wm).padStart(2,"0")+"'";};
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 100px"}}>
      <style>{V6CSS}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:10,opacity:0.5}}>birth chart</div>
        <h2 style={{fontFamily:SR,fontSize:38,fontWeight:300,color:P.ink,margin:"0 0 4px",lineHeight:1.05}}>{name}</h2>
        <div style={{fontFamily:SR,fontSize:14,color:P.lt,fontStyle:"italic"}}>{ZG[chart.sun]||""} {chart.sun} · {ZG[chart.moon]||""} {chart.moon}{chart.rising!=="Unknown"?" · "+(ZG[chart.rising]||"")+" "+chart.rising:""}</div>
      </div>
      {!analysis&&(
        <div style={{textAlign:"center",padding:40}}><Spinner size={48}/><p style={{fontFamily:SN,fontSize:12,color:P.lt,marginTop:12}}>Reading the architecture of your life...</p></div>
      )}
      {analysis&&analysis.headline&&(
        <div style={{background:"linear-gradient(135deg,#F5EDE0,#F6EDD9)",border:"1px solid rgba(191,140,62,0.12)",borderRadius:14,padding:"22px 20px",marginBottom:14,position:"relative",overflow:"hidden",boxShadow:SH3}}>
          <MiniOrrery size={48} opacity={0.3}/>
          <div style={{fontFamily:SN,fontSize:6,letterSpacing:3,color:P.lt,textTransform:"uppercase",marginBottom:8}}>the headline</div>
          <blockquote style={{fontFamily:SR,fontSize:17,fontWeight:300,color:P.ink,lineHeight:1.55,margin:0,fontStyle:"italic",maxWidth:"88%"}}>{analysis.headline}</blockquote>
        </div>
      )}
      {analysis&&analysis.bigThree&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:16,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Who You Are</div><p style={{fontFamily:SR,fontSize:14,color:P.mid,lineHeight:1.7,fontStyle:"italic"}}>{analysis.bigThree}</p></div>}

      {/* Natal table with expandable cards */}
      {analysis&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 10px"}}>
            <span style={{fontFamily:SN,fontSize:8,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>Your placements</span>
            <div style={{display:"flex",gap:6}}>
              <button onClick={allOpen} style={{fontFamily:SN,fontSize:8,letterSpacing:1,color:P.gold,background:P.goldBg,border:"1px solid rgba(191,140,62,0.15)",padding:"4px 10px",borderRadius:10,cursor:"pointer",textTransform:"uppercase"}}>Expand all</button>
              <button onClick={allClosed} style={{fontFamily:SN,fontSize:8,letterSpacing:1,color:P.lt,background:"transparent",border:"1px solid rgba(42,33,24,0.1)",padding:"4px 10px",borderRadius:10,cursor:"pointer",textTransform:"uppercase"}}>Collapse all</button>
            </div>
          </div>
          {chart.rising!=="Unknown"&&chart.natal&&chart.natal.ascendant&&(
            <div style={{background:P.sageBg,border:"1px solid rgba(122,148,104,0.12)",borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:SR,background:"#FFF",color:P.sage}}>↑</span>
                <span style={{fontFamily:SR,fontSize:15,color:P.ink}}>Ascendant</span>
              </div>
              <span style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic"}}>{deg(chart.natal.ascendant.deg)} {chart.natal.ascendant.sign}</span>
            </div>
          )}
          {planetOrder.map((pl,i)=>{
            const cc=CC[i%CC.length];
            const pd=chart.natal&&chart.natal.planets?chart.natal.planets[pl]:null;
            const m=meanings[pl];
            const isOpen=!!open[pl];
            return(
              <div key={pl} style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:12,marginBottom:8,overflow:"hidden",boxShadow:isOpen?SH3:SH,transition:"box-shadow 0.3s"}}>
                <div style={{height:2,opacity:0.5,background:"linear-gradient(90deg,"+cc.c+"80,transparent 75%)"}}/>
                <div onClick={()=>setOpen(o=>({...o,[pl]:!o[pl]}))} style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:SR,background:cc.bg,color:cc.c}}>{glyph[pl]}</span>
                    <span style={{fontFamily:SR,fontSize:15,color:P.ink}}>{pl}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {pd&&<span style={{fontFamily:SR,fontSize:12,color:P.lt,fontStyle:"italic"}}>{deg(pd.deg)} {pd.sign}</span>}
                    <span style={{fontFamily:SN,fontSize:9,color:P.fn,transition:"transform 0.25s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>
                  </div>
                </div>
                {isOpen&&m&&(
                  <div style={{padding:"0 16px 14px"}}>
                    <p style={{fontFamily:SR,fontSize:13,lineHeight:1.7,color:P.mid,fontStyle:"italic",margin:0}}>{m.meaning}</p>
                  </div>
                )}
              </div>
            );
          })}
          {/* Chapters */}
          {analysis.chapters&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0 12px"}}><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/><span style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.fn,textTransform:"uppercase"}}>current chapters</span><div style={{flex:1,height:1,background:"rgba(42,33,24,0.05)"}}/></div>
              {analysis.chapters.map((ch,i)=>{
                const cc=CC[i%CC.length];
                return(
                  <div key={i} style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:SH}}>
                    <div style={{height:2,opacity:0.5,background:"linear-gradient(90deg,"+cc.c+"80,transparent 75%)"}}/>
                    <div style={{padding:"14px 16px"}}>
                      <div style={{fontFamily:SR,fontSize:16,color:P.ink,marginBottom:6}}>{ch.title}</div>
                      <p style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.68,fontStyle:"italic"}}>{ch.body}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {analysis.strengths&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.gold,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Strengths</div>{analysis.strengths.map((s,i)=><p key={i} style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.6,fontStyle:"italic",marginBottom:4}}>✦ {s}</p>)}</div>}
          {analysis.shadowWork&&<div style={{background:P.terraBg,border:"1px solid rgba(196,131,106,0.1)",borderRadius:14,padding:"16px 20px",marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Shadow Work</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,lineHeight:1.6,fontStyle:"italic"}}>{analysis.shadowWork}</p></div>}
          {analysis.soulMantra&&<div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.1)",borderRadius:14,padding:"18px 20px",marginTop:16,textAlign:"center"}}><div style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.gold,textTransform:"uppercase",marginBottom:6}}>soul mantra</div><p style={{fontFamily:SR,fontSize:16,color:P.ink,fontStyle:"italic",lineHeight:1.5,fontWeight:300}}>{analysis.soulMantra}</p></div>}
        </>
      )}
      <button onClick={onChat} style={{position:"fixed",right:0,top:"44%",zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2,color:"#FAF6F0",background:P.ink,border:"none",padding:"16px 9px",borderRadius:"14px 0 0 14px",cursor:"pointer",boxShadow:"-3px 3px 16px rgba(42,33,24,0.2)",writingMode:"vertical-rl",textOrientation:"mixed"}}>✦ Ask</button>
    </div>
  );
}

/* ═══ HUMAN DESIGN — its own tab ═══ */
function HDScreen({chart,analysis,name,onChat}){
  const hd=chart.humanDesign;
  const ai=analysis&&analysis.humanDesign?analysis.humanDesign:null;
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 100px"}}>
      <style>{V6CSS}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.violet,textTransform:"uppercase",marginBottom:10,opacity:0.7}}>human design</div>
        <h2 style={{fontFamily:SR,fontSize:38,fontWeight:300,color:P.ink,margin:"0 0 4px",lineHeight:1.05}}>{name}</h2>
        {hd&&<div style={{fontFamily:SR,fontSize:15,color:P.violet,fontStyle:"italic"}}>{hd.type} · {hd.profile}</div>}
      </div>
      {!hd&&<p style={{fontFamily:SN,fontSize:12,color:P.lt,textAlign:"center"}}>Human Design requires a birth time. Edit your info to add one.</p>}
      {hd&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["Type",hd.type],["Profile",hd.profile],["Authority",hd.authority],["Strategy",hd.strategy]].map(([l,v],i)=>(
              <div key={i} style={{background:P.violetBg,border:"1px solid rgba(141,128,184,0.15)",borderRadius:12,padding:"14px 14px"}}>
                <div style={{fontFamily:SN,fontSize:7,letterSpacing:2,color:P.violet,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                <div style={{fontFamily:SR,fontSize:16,color:P.ink}}>{v}</div>
              </div>
            ))}
          </div>
          {ai&&ai.opener&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>How You're Built</div><p style={{fontFamily:SR,fontSize:14,color:P.mid,lineHeight:1.7,fontStyle:"italic"}}>{ai.opener}</p></div>}
          {ai&&ai.strategyInPractice&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.sage,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Your Strategy in Practice</div><p style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.68,fontStyle:"italic"}}>{ai.strategyInPractice}</p></div>}
          {ai&&ai.authorityGuide&&<div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.gold,textTransform:"uppercase",fontWeight:500,marginBottom:8}}>Making Decisions</div><p style={{fontFamily:SR,fontSize:13,color:P.mid,lineHeight:1.68,fontStyle:"italic"}}>{ai.authorityGuide}</p></div>}
          {ai&&ai.notSelfSignal&&<div style={{background:P.terraBg,border:"1px solid rgba(196,131,106,0.1)",borderRadius:14,padding:"16px 20px",marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Your Warning Light: {hd.notSelf}</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,lineHeight:1.6,fontStyle:"italic"}}>{ai.notSelfSignal}</p></div>}
          <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:20,marginBottom:12,boxShadow:SH}}>
            <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500,marginBottom:10}}>Defined Centers ({hd.definedCenters?hd.definedCenters.length:0}/9)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["Head","Ajna","Throat","G","Heart","Sacral","SolarPlexus","Spleen","Root"].map(c=>{
                const on=hd.definedCenters&&hd.definedCenters.includes(c);
                return <span key={c} style={{fontFamily:SN,fontSize:10,padding:"5px 12px",borderRadius:12,background:on?P.violetBg:"transparent",color:on?P.violet:P.fn,border:"1px solid "+(on?"rgba(141,128,184,0.3)":"rgba(42,33,24,0.08)")}}>{c==="SolarPlexus"?"Solar Plexus":c==="G"?"G Center":c}</span>;
              })}
            </div>
            {hd.definedChannels&&hd.definedChannels.length>0&&<p style={{fontFamily:SN,fontSize:10,color:P.lt,marginTop:10}}>Channels: {hd.definedChannels.join(" · ")}</p>}
          </div>
          {ai&&ai.decisionRule&&(
            <div style={{background:"linear-gradient(135deg,#ECE8F3,#F6EDD9)",border:"1px solid rgba(141,128,184,0.15)",borderRadius:14,padding:"18px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <MiniOrrery size={40} opacity={0.25}/>
              <div style={{fontFamily:SN,fontSize:7,letterSpacing:3,color:P.violet,textTransform:"uppercase",marginBottom:6}}>your decision rule</div>
              <p style={{fontFamily:SR,fontSize:16,color:P.ink,fontStyle:"italic",lineHeight:1.5,fontWeight:300}}>{ai.decisionRule}</p>
            </div>
          )}
        </>
      )}
      <button onClick={onChat} style={{position:"fixed",right:0,top:"44%",zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2,color:"#FAF6F0",background:P.ink,border:"none",padding:"16px 9px",borderRadius:"14px 0 0 14px",cursor:"pointer",boxShadow:"-3px 3px 16px rgba(42,33,24,0.2)",writingMode:"vertical-rl",textOrientation:"mixed"}}>✦ Ask</button>
    </div>
  );
}

/* ═══ SHAREABLE ═══ */
function ShareableScreen({reading,name,chart,onBack}){
  const{sun,moon,rising}=chart;
  return(
    <div style={{height:"100%",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{fontFamily:SN,fontSize:8,letterSpacing:3,color:P.fn,textTransform:"uppercase",marginBottom:12}}>Your Star Note</div>
      <div style={{width:"100%",maxWidth:300,aspectRatio:"9/16",background:"linear-gradient(160deg,#F5EDE0 0%,#F6EDD9 60%,#F5EBE5 100%)",border:"1px solid rgba(191,140,62,0.1)",borderRadius:16,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",justifyContent:"center",padding:"36px 22px",boxShadow:"0 8px 32px rgba(42,33,24,0.08)"}}>
        <div style={{position:"absolute",top:18,left:22,fontFamily:SN,fontSize:7,letterSpacing:4,color:P.fn,textTransform:"uppercase"}}>luminary</div>
        <div style={{position:"absolute",top:36,left:22,right:22,height:1,background:"linear-gradient(90deg,rgba(191,140,62,0.2),transparent)"}}/>
        <div style={{position:"absolute",top:-60,right:-120,width:440,height:440,pointerEvents:"none"}}><OrreryClassic size={440} opacity={0.55}/></div>
        <blockquote style={{fontFamily:SR,fontSize:18,fontWeight:300,color:P.ink,lineHeight:1.58,margin:0,fontStyle:"italic",zIndex:1}}>"{reading.line}"</blockquote>
        <div style={{position:"absolute",bottom:22,left:22,right:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontFamily:SR,fontSize:13,color:P.gold}}>{name}</div>
            <div style={{fontFamily:SN,fontSize:7,color:P.lt,letterSpacing:1.5,marginTop:1}}>{ZG[sun]||""} {sun} · {ZG[moon]||""} {moon}{rising!=="Unknown"?" · "+(ZG[rising]||"")+" "+rising:""}</div>
          </div>
          <div style={{fontFamily:SN,fontSize:6,color:P.fn,letterSpacing:2,textTransform:"uppercase"}}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
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

/* ═══ CHAT ═══ */
function ChatScreen({chart,name,onBack,userKey,initialMsgs,onSync}){
  const[msgs,setMsgs]=useState((initialMsgs&&initialMsgs.length>0)?initialMsgs:[{role:"assistant",text:"Welcome, "+name+". I'm Luminary — trained on the combined methods of the great schools of astrology: evolutionary, psychological, Hellenistic, and modern classical technique, plus complete Human Design mechanics. I'm reading your exact chart right now — "+chart.sun+" Sun, "+chart.moon+" Moon"+(chart.rising!=="Unknown"?", "+chart.rising+" Rising":"")+(chart.humanDesign?", "+chart.humanDesign.type+" ("+chart.humanDesign.profile+")":"")+" — not a generic horoscope. Ask me anything about your life, your timing, or your design."}]);
  const[inp,setInp]=useState("");const[ld,setLd]=useState(false);const ref=useRef(null);
  const suggestions=[
    "What should I focus on this week?",
    "How do I make big decisions, based on my design?",
    "What's my pattern in love?",
    "When is my next power window?",
    "What career am I built for?",
  ];
  const sendText=async(text)=>{if(!text.trim()||ld)return;setInp("");setLd(true);
    const upd=[...msgs,{role:"user",text}];setMsgs(upd);if(onSync)onSync(upd);
    try{const am=[{role:"user",content:"Chart: "+chart.promptText+"\nQuerent: "+name}];upd.forEach(m=>am.push({role:m.role==="user"?"user":"assistant",content:m.text}));
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:am,userName:name})});const d=await r.json();
      const nm2=[...upd,{role:"assistant",text:d.reply}];setMsgs(nm2);if(onSync)onSync(nm2);if(userKey)saveChatHist(userKey,nm2);
    }catch{setMsgs(p=>[...p,{role:"assistant",text:"Connection lost. Try again?"}]);}setLd(false);};
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs]);
  const send=()=>sendText(inp.trim());
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
        {msgs.length===1&&!ld&&(
          <div style={{marginTop:8}}>
            <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.fn,textTransform:"uppercase",marginBottom:8}}>try asking</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {suggestions.map((q,i)=>(
                <button key={i} onClick={()=>sendText(q)} style={{fontFamily:SN,fontSize:12,padding:"10px 14px",borderRadius:16,border:"1.5px solid rgba(191,140,62,0.25)",background:P.goldBg,color:P.ink,cursor:"pointer",textAlign:"left"}}>{q}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{padding:"10px 18px 24px",borderTop:"1px solid "+P.bdr,display:"flex",gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,padding:"12px 16px",borderRadius:20,border:"1px solid "+P.bdr,background:P.card,fontSize:14,fontFamily:SN,color:P.ink,outline:"none"}}/>
        <button onClick={send} disabled={ld||!inp.trim()} style={{width:44,height:44,borderRadius:22,background:P.ink,border:"none",color:"#FFF",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
      <style>{V6CSS}</style>
    </div>
  );
}

/* ═══ FRIENDS — read a friend's chart + romantic/friendship compatibility ═══ */
function FriendsScreen({userChart,userName,userBirth,friends,setFriends,ukey,post,onChat}){
  const[adding,setAdding]=useState(friends.length===0);
  const[fn,setFn]=useState("");const[fd,setFd]=useState("");const[ft,setFt]=useState("");
  const[cityQ,setCityQ]=useState("");const[cityR,setCityR]=useState([]);const[city,setCity]=useState(null);
  const[st,setSt]=useState("");
  const US_STATES=[["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"],["Washington DC","DC"]];
  const[mode,setMode]=useState("friendship");
  const[busy,setBusy]=useState(false);const[fErr,setFErr]=useState(null);
  const[openIdx,setOpenIdx]=useState(0);
  const searchT=useRef(null);
  const geocodeCity=async(q,stateCode)=>{
    const stName=US_STATES.find(x=>x[1]===stateCode);
    const query=stateCode==="INTL"?q:q+", "+(stName?stName[0]:"")+", USA";
    const r=await fetch("https://nominatim.openstreetmap.org/search?q="+encodeURIComponent(query)+"&format=json&limit=8");
    const d=await r.json();
    let places=d.filter(x=>x.class==="place"||x.class==="boundary");
    if(places.length===0)places=d; /* graceful fallback: show whatever came back */
    return places.map(x=>{
      const nm=x.display_name.split(",")[0].trim();
      const label=stateCode==="INTL"?x.display_name.split(",").slice(0,2).join(",").trim()+" — "+x.display_name.split(",").pop().trim():nm+", "+stateCode;
      return{n:label,lat:parseFloat(x.lat),lon:parseFloat(x.lon)};
    });
  };
  const searchC=(q)=>{
    setCityQ(q);setCity(null);
    if(searchT.current)clearTimeout(searchT.current);
    if(q.length<3){setCityR([]);return;}
    /* debounce 450ms — rapid keystrokes were tripping the geocoder's rate limit */
    searchT.current=setTimeout(async()=>{
      try{
        const places=await geocodeCity(q,st);
        const seen=new Set();
        setCityR(places.filter(x=>{if(seen.has(x.n))return false;seen.add(x.n);return true;}).slice(0,6));
      }catch{setCityR([]);}
    },450);
  };
  const pickCity=(c)=>{setCity(c);setCityQ(c.n);setCityR([]);};
  const addFriend=async()=>{
    if(!fn.trim()||!fd){setFErr("Name and birth date are required.");return;}
    setBusy(true);setFErr(null);
    let cityFinal=city;
    if(!cityFinal&&cityQ.trim().length>=2&&st){
      /* they typed a city but didn't tap a suggestion — resolve it for them */
      try{const places=await geocodeCity(cityQ.trim(),st);if(places[0])cityFinal=places[0];}catch{}
    }
    if(!cityFinal){setBusy(false);setFErr(st?"Couldn't find that city — check the spelling or tap a suggestion.":"Pick a birth state, then enter the city.");return;}
    try{
      const fCh=await post("/api/chart",{name:fn.trim(),date:fd,time:ft||"unknown",lat:cityFinal.lat,lon:cityFinal.lon,city:cityFinal.n});
      const comp=await post("/api/compatibility",{
        userName,friendName:fn.trim(),
        userPrompt:userChart.promptText,friendPrompt:fCh.promptText,
        userNatal:userChart.natal?userChart.natal.planets:null,
        friendNatal:fCh.natal?fCh.natal.planets:null,
        mode,userBirthDate:userBirth||null,friendBirthDate:fd,
      });
      const entry={name:fn.trim(),mode,city:cityFinal.n,sun:fCh.sun,moon:fCh.moon,rising:fCh.rising,result:comp,ts:Date.now()};
      const list=[entry,...friends];
      setFriends(list);setOpenIdx(0);setAdding(false);
      setFn("");setFd("");setFt("");setCityQ("");setCity(null);setSt("");setCityR([]);
      if(ukey){try{await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"saveFriends",key:ukey,friends:list})});}catch{}}
    }catch(e){setFErr(String(e.message||e));}
    setBusy(false);
  };
  const inp={width:"100%",padding:"12px 14px",borderRadius:12,border:"1px solid "+P.bdr,background:P.card,fontSize:14,fontFamily:SN,color:P.ink,outline:"none",boxSizing:"border-box"};
  const modeBtn=(m,l)=>(<button onClick={()=>setMode(m)} style={{flex:1,fontFamily:SN,fontSize:10,padding:"9px 6px",borderRadius:12,cursor:"pointer",border:"1.5px solid "+(mode===m?"rgba(191,140,62,0.4)":P.bdr),background:mode===m?P.goldBg:P.card,color:mode===m?P.gold:P.lt,fontWeight:mode===m?500:300}}>{l}</button>);
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 100px"}}>
      <style>{V6CSS}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:10,opacity:0.5}}>friends & connections</div>
        <h2 style={{fontFamily:SR,fontSize:32,fontWeight:300,color:P.ink,margin:0,lineHeight:1.1}}>Read the people in your life</h2>
        <p style={{fontFamily:SR,fontSize:13,color:P.lt,fontStyle:"italic",marginTop:6}}>Their chart. Your chemistry. Real synastry.</p>
      </div>
      {!adding&&(
        <button onClick={()=>setAdding(true)} style={{width:"100%",fontFamily:SN,fontSize:11,fontWeight:500,letterSpacing:1,color:"#FAF6F0",background:P.ink,border:"none",padding:"14px",borderRadius:14,cursor:"pointer",marginBottom:16}}>+ Read a new friend</button>
      )}
      {adding&&(
        <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:18,marginBottom:16,boxShadow:SH}}>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {modeBtn("friendship","Friendship")}
            {modeBtn("romantic","Romantic")}
            {modeBtn("chart","Just their chart")}
          </div>
          <div style={{display:"grid",gap:10}}>
            <input value={fn} onChange={e=>setFn(e.target.value)} placeholder="Their name" style={inp}/>
            <input type="date" value={fd} onChange={e=>setFd(e.target.value)} style={inp}/>
            <input type="time" value={ft} onChange={e=>setFt(e.target.value)} style={inp}/>
            <div style={{fontFamily:SN,fontSize:9,color:P.fn,marginTop:-6}}>Birth time optional — adds Rising sign precision</div>
            <select value={st} onChange={e=>{setSt(e.target.value);setCity(null);setCityQ("");setCityR([]);}} style={{...inp,appearance:"auto",color:st?P.ink:P.lt}}>
              <option value="">Birth state...</option>
              {US_STATES.map(([n,a])=><option key={a} value={a}>{n}</option>)}
              <option value="INTL">🌍 Outside the US</option>
            </select>
            {st&&(
              <div style={{position:"relative"}}>
                <input value={cityQ} onChange={e=>searchC(e.target.value)} placeholder={st==="INTL"?"Birth city, country":"Birth city"} style={{...inp,borderColor:city?"rgba(122,148,104,0.4)":P.bdr}}/>
                {city&&<span style={{position:"absolute",right:14,top:14,fontFamily:SN,fontSize:11,color:P.sage}}>✓</span>}
                {cityR.length>0&&!city&&(
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#FFF",border:"1px solid "+P.bdr,borderRadius:12,marginTop:4,zIndex:20,boxShadow:SH3,maxHeight:180,overflowY:"auto"}}>
                    {cityR.map((c,i)=>(<div key={i} onClick={()=>pickCity(c)} style={{padding:"10px 14px",fontFamily:SN,fontSize:13,color:P.ink,cursor:"pointer",borderBottom:i<cityR.length-1?"1px solid rgba(42,33,24,0.04)":"none"}}>{c.n}</div>))}
                  </div>
                )}
              </div>
            )}
          </div>
          {fErr&&<p style={{fontFamily:SN,fontSize:11,color:P.terra,marginTop:10}}>{fErr}</p>}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            {friends.length>0&&<button onClick={()=>{setAdding(false);setFErr(null);}} style={{fontFamily:SN,fontSize:10,padding:"11px 16px",borderRadius:12,cursor:"pointer",border:"1px solid "+P.bdr,background:"transparent",color:P.lt}}>Cancel</button>}
            <button onClick={addFriend} disabled={busy} style={{flex:1,fontFamily:SN,fontSize:11,fontWeight:500,letterSpacing:1,color:"#FAF6F0",background:busy?P.fn:P.ink,border:"none",padding:"12px",borderRadius:12,cursor:busy?"default":"pointer"}}>{busy?"Reading the stars...":"Generate reading"}</button>
          </div>
          {busy&&<div style={{textAlign:"center",marginTop:14}}><Spinner size={44}/></div>}
        </div>
      )}
      {friends.map((f,i)=>{
        const isOpen=openIdx===i;const r=f.result||{};const c=r.compatibility;const snap=r.friendSnapshot;
        return(
          <div key={i} style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:isOpen?SH3:SH}}>
            <div style={{height:2,opacity:0.5,background:"linear-gradient(90deg,"+(f.mode==="romantic"?P.terra:P.sage)+"80,transparent 75%)"}}/>
            <div onClick={()=>setOpenIdx(isOpen?-1:i)} style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
              <div>
                <div style={{fontFamily:SR,fontSize:17,color:P.ink}}>{f.name}</div>
                <div style={{fontFamily:SN,fontSize:9,color:P.lt,marginTop:2}}>{ZG[f.sun]||""} {f.sun} · {ZG[f.moon]||""} {f.moon}{f.rising&&f.rising!=="Unknown"?" · "+f.rising+" Rising":""} · {f.mode==="chart"?"Chart":f.mode==="romantic"?"Romantic":"Friendship"}</div>
              </div>
              <span style={{fontFamily:SN,fontSize:9,color:P.fn,transition:"transform 0.25s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>
            </div>
            {isOpen&&(
              <div style={{padding:"0 16px 16px"}}>
                {snap&&<div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.1)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                  <div style={{fontFamily:SN,fontSize:7,letterSpacing:2,color:P.gold,textTransform:"uppercase",marginBottom:6}}>Their chart</div>
                  <p style={{fontFamily:SR,fontSize:14,color:P.ink,fontStyle:"italic",lineHeight:1.6,marginBottom:6}}>{snap.headline}</p>
                  <p style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic",lineHeight:1.65}}>{snap.portrait}</p>
                </div>}
                {c&&<>
                  <p style={{fontFamily:SR,fontSize:14,color:P.mid,fontStyle:"italic",lineHeight:1.7,marginBottom:12}}>{c.overview}</p>
                  {c.youTwo&&<div style={{marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.gold,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>You Two</div><p style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic",lineHeight:1.68}}>{c.youTwo}</p></div>}
                  {c.destiny&&<div style={{marginBottom:12}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Destiny</div><p style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic",lineHeight:1.68}}>{c.destiny}</p></div>}
                  {r.computed&&r.computed.chemistry&&(
                    <div style={{background:P.card,border:"1px solid rgba(196,131,106,0.15)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:10}}>Chemistry</div>
                      {Object.entries(r.computed.chemistry).map(([axis,v],j)=>(
                        <div key={j} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontFamily:SN,fontSize:11,color:P.ink}}>{axis}</span>
                            <span style={{fontFamily:SR,fontSize:13,color:P.terra}}>{v.score}<span style={{fontSize:9,color:P.fn}}>/10</span></span>
                          </div>
                          <div style={{width:"100%",height:4,borderRadius:2,background:P.warm}}><div style={{width:(v.score*10)+"%",height:"100%",borderRadius:2,background:"linear-gradient(90deg,"+P.sage+","+P.terra+")"}}/></div>
                        </div>
                      ))}
                      {c.chemistryNarrative&&<p style={{fontFamily:SR,fontSize:12,color:P.mid,fontStyle:"italic",lineHeight:1.6,marginTop:8}}>{c.chemistryNarrative}</p>}
                    </div>
                  )}
                  {r.computed&&r.computed.vedic&&(
                    <div style={{background:P.violetBg,border:"1px solid rgba(141,128,184,0.15)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500}}>Vedic · Ashtakoota</div>
                        <div style={{fontFamily:SR,fontSize:18,color:P.ink}}>{r.computed.vedic.total}<span style={{fontSize:10,color:P.fn}}>/36 · {r.computed.vedic.verdict}</span></div>
                      </div>
                      <div style={{fontFamily:SN,fontSize:9,color:P.lt,marginBottom:8}}>Moons: {r.computed.vedic.moonA.nakshatra} ({r.computed.vedic.moonA.rashi}) + {r.computed.vedic.moonB.nakshatra} ({r.computed.vedic.moonB.rashi})</div>
                      {r.computed.vedic.kootas.map((k,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:j<7?"1px solid rgba(141,128,184,0.08)":"none"}}>
                          <span style={{fontFamily:SN,fontSize:10,color:P.ink}}>{k.name} <span style={{color:P.fn,fontSize:9}}>· {k.detail}</span></span>
                          <span style={{fontFamily:SR,fontSize:11,color:k.score===0?P.terra:P.violet}}>{k.score}/{k.max}</span>
                        </div>
                      ))}
                      {c.vedicNarrative&&<p style={{fontFamily:SR,fontSize:12,color:P.mid,fontStyle:"italic",lineHeight:1.6,marginTop:8}}>{c.vedicNarrative}</p>}
                    </div>
                  )}
                  {r.computed&&r.computed.numbers&&(
                    <div style={{background:P.goldBg,border:"1px solid rgba(191,140,62,0.12)",borderRadius:12,padding:"12px 16px",marginBottom:10}}>
                      <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.gold,textTransform:"uppercase",fontWeight:500,marginBottom:4}}>Numbers</div>
                      <div style={{fontFamily:SR,fontSize:13,color:P.ink,marginBottom:4}}>Life Path {r.computed.numbers.lifePathA} + Life Path {r.computed.numbers.lifePathB} — {r.computed.numbers.harmony}</div>
                      {c.numbersNarrative&&<p style={{fontFamily:SR,fontSize:12,color:P.mid,fontStyle:"italic",lineHeight:1.6}}>{c.numbersNarrative}</p>}
                    </div>
                  )}
                  {r.computed&&r.computed.bond&&(
                    <div style={{background:P.sageBg,border:"1px solid rgba(122,148,104,0.12)",borderRadius:12,padding:"12px 16px",marginBottom:10}}>
                      <div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.sage,textTransform:"uppercase",fontWeight:500,marginBottom:4}}>The Bond · your composite chart</div>
                      <div style={{fontFamily:SN,fontSize:10,color:P.lt,marginBottom:4}}>{Object.entries(r.computed.bond).map(([pl,sg])=>pl+" in "+sg).join(" · ")}</div>
                      {c.bondNarrative&&<p style={{fontFamily:SR,fontSize:12,color:P.mid,fontStyle:"italic",lineHeight:1.6}}>{c.bondNarrative}</p>}
                    </div>
                  )}
                  {c.strengths&&<div style={{marginBottom:10}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.sage,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>What works</div>{c.strengths.map((x,j)=><p key={j} style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic",lineHeight:1.6,marginBottom:3}}>✦ {x}</p>)}</div>}
                  {c.frictions&&<div style={{marginBottom:10}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.terra,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Watch for</div>{c.frictions.map((x,j)=><p key={j} style={{fontFamily:SR,fontSize:13,color:P.mid,fontStyle:"italic",lineHeight:1.6,marginBottom:3}}>◦ {x}</p>)}</div>}
                  {r.computed&&r.computed.aspects&&r.computed.aspects.length>0&&<div style={{marginBottom:10}}><div style={{fontFamily:SN,fontSize:8,letterSpacing:2,color:P.violet,textTransform:"uppercase",fontWeight:500,marginBottom:6}}>Synastry aspects</div>{r.computed.aspects.slice(0,8).map((a,j)=><div key={j} style={{fontFamily:SN,fontSize:10,color:P.mid,padding:"2px 0"}}>{a.text} <span style={{color:P.fn,fontSize:9}}>({a.orb}°)</span></div>)}</div>}
                  {c.advice&&<div style={{background:P.sageBg,border:"1px solid rgba(122,148,104,0.12)",borderRadius:12,padding:"12px 16px"}}><div style={{fontFamily:SN,fontSize:7,letterSpacing:2,color:P.sage,textTransform:"uppercase",marginBottom:4}}>Make it thrive</div><p style={{fontFamily:SR,fontSize:13,color:P.ink,fontStyle:"italic",lineHeight:1.6}}>{c.advice}</p></div>}
                </>}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={onChat} style={{position:"fixed",right:0,top:"44%",zIndex:100,fontFamily:SN,fontSize:10,fontWeight:500,letterSpacing:2,color:"#FAF6F0",background:P.ink,border:"none",padding:"16px 9px",borderRadius:"14px 0 0 14px",cursor:"pointer",boxShadow:"-3px 3px 16px rgba(42,33,24,0.2)",writingMode:"vertical-rl",textOrientation:"mixed"}}>✦ Ask</button>
    </div>
  );
}

/* ═══ FEEDBACK — bugs & improvements, with speech-to-text ═══ */
function FeedbackScreen({name,ukey}){
  const[kind,setKind]=useState("improvement");
  const[text,setText]=useState("");
  const[listening,setListening]=useState(false);
  const[done,setDone]=useState(false);
  const[fbErr,setFbErr]=useState(null);
  const recRef=useRef(null);const baseRef=useRef("");
  const toggleMic=()=>{
    if(listening){try{recRef.current&&recRef.current.stop();}catch{}setListening(false);return;}
    const SRec=typeof window!=="undefined"?(window.SpeechRecognition||window.webkitSpeechRecognition):null;
    if(!SRec){setFbErr("Dictation isn't supported in this browser — use the mic key on your keyboard instead.");return;}
    setFbErr(null);baseRef.current=text?text+" ":"";
    const r=new SRec();r.continuous=true;r.interimResults=true;r.lang="en-US";
    r.onresult=(e)=>{let t="";for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;setText(baseRef.current+t);};
    r.onend=()=>setListening(false);
    r.onerror=()=>{setListening(false);};
    recRef.current=r;r.start();setListening(true);
  };
  const submit=async()=>{
    if(!text.trim()){setFbErr("Say or type something first.");return;}
    try{
      await fetch("/api/user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"feedback",key:ukey,name,kind,text})});
      setDone(true);setText("");setTimeout(()=>setDone(false),3000);
    }catch{setFbErr("Couldn't send — try again.");}
  };
  const kb=(k,l)=>(<button onClick={()=>setKind(k)} style={{flex:1,fontFamily:SN,fontSize:10,padding:"9px 6px",borderRadius:12,cursor:"pointer",border:"1.5px solid "+(kind===k?"rgba(191,140,62,0.4)":P.bdr),background:kind===k?P.goldBg:P.card,color:kind===k?P.gold:P.lt,fontWeight:kind===k?500:300}}>{l}</button>);
  return(
    <div style={{minHeight:"100%",background:P.bg,padding:"28px 18px 100px"}}>
      <style>{V6CSS}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:SN,fontSize:8,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:10,opacity:0.5}}>help shape luminary</div>
        <h2 style={{fontFamily:SR,fontSize:32,fontWeight:300,color:P.ink,margin:0,lineHeight:1.1}}>Tell us everything</h2>
        <p style={{fontFamily:SR,fontSize:13,color:P.lt,fontStyle:"italic",marginTop:6}}>Bugs, ideas, wishes — tap the mic and just talk.</p>
      </div>
      <div style={{background:P.card,border:"1px solid "+P.bdr,borderRadius:14,padding:18,boxShadow:SH}}>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {kb("bug","🐛 Bug")}
          {kb("improvement","✨ Improvement")}
          {kb("love","💛 Love it")}
        </div>
        <div style={{position:"relative"}}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={listening?"Listening — just talk...":"What happened, or what do you wish existed?"} rows={6} style={{width:"100%",padding:"14px 16px",paddingRight:52,borderRadius:12,border:"1.5px solid "+(listening?"rgba(196,131,106,0.5)":P.bdr),background:listening?"#FDF9F4":P.bg,fontSize:14,fontFamily:SN,color:P.ink,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
          <button onClick={toggleMic} style={{position:"absolute",right:10,top:10,width:38,height:38,borderRadius:19,border:"none",cursor:"pointer",fontSize:16,background:listening?P.terra:P.goldBg,color:listening?"#FFF":P.gold,boxShadow:listening?"0 0 0 4px rgba(196,131,106,0.2)":"none"}}>{listening?"■":"🎤"}</button>
        </div>
        {fbErr&&<p style={{fontFamily:SN,fontSize:11,color:P.terra,marginTop:8}}>{fbErr}</p>}
        <button onClick={submit} style={{width:"100%",fontFamily:SN,fontSize:11,fontWeight:500,letterSpacing:1,color:"#FAF6F0",background:done?P.sage:P.ink,border:"none",padding:"13px",borderRadius:12,cursor:"pointer",marginTop:12}}>{done?"✓ Sent — thank you":"Send feedback"}</button>
      </div>
    </div>
  );
}

/* ═══ MAIN CONTROLLER — preload, persistent return, 5 tabs ═══ */
export default function Luminary(){
  const[scr,setScr]=useState("boot");const tag="before";const[shared,setShared]=useState(false);
  const[friends,setFriends]=useState([]);
  const shareApp=async()=>{
    const url=typeof window!=="undefined"?window.location.origin:"";
    const data={title:"Luminary",text:"Your life, before it happens. Get your reading:",url};
    try{if(navigator.share){await navigator.share(data);return;}}catch{}
    try{await navigator.clipboard.writeText(url);setShared(true);setTimeout(()=>setShared(false),2000);}catch{}
  };
  const[bd,setBd]=useState(null);const[ans,setAns]=useState(null);
  const[chart,setChart]=useState(null);const[reading,setReading]=useState(null);
  const[bca,setBca]=useState(null);const[err,setErr]=useState(null);const[ukey,setUkey]=useState(null);const[chatMsgs,setChatMsgs]=useState(null);

  const post=async(url,body)=>{
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const raw=await r.text();
    let d;try{d=JSON.parse(raw);}catch{throw new Error(url+" returned an unreadable response ("+r.status+")");}
    if(d.error)throw new Error(d.error);
    if(!r.ok)throw new Error(url+" failed with status "+r.status);
    return d;
  };

  /* Return visitor: restore everything from Firestore, refresh weekly in background */
  useEffect(()=>{
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem("luminary_user")||"null");}catch{}
    if(!saved||!saved.key){setScr("landing");return;}
    (async()=>{
      try{
        const u=await post("/api/user",{action:"get",key:saved.key});
        if(!u.chart)throw new Error("no chart");
        setChart(u.chart);setReading(u.reading);setBca(u.birthchartAnalysis||null);
        setBd({name:u.name,ig:u.ig,...(u.birth||{})});setAns(u.answers||null);setUkey(saved.key);setFriends(u.friends||[]);setChatMsgs(u.chatHistory&&u.chatHistory.length>0?u.chatHistory:null);
        setScr("reading");
        /* silent refresh: new week, new reading — chart + birth chart stay cached */
        if(u.answers){
          try{
            const fresh=await post("/api/horoscope",{chartText:u.chart.promptText,name:u.name,...u.answers});
            setReading(fresh);
            saveReading({name:u.name,ig:u.ig,birth:u.birth||null,chart:u.chart,reading:fresh,answers:u.answers,birthchartAnalysis:u.birthchartAnalysis||null});
          }catch{}
        }
      }catch{localStorage.removeItem("luminary_user");setScr("landing");}
    })();
  },[]);

  /* Everything preloads here: chart → horoscope + birthchart/HD in parallel */
  const generate=async(b,a)=>{setScr("loading");try{
    const ch=await post("/api/chart",b);setChart(ch);
    const[ho,bc]=await Promise.all([
      post("/api/horoscope",{chartText:ch.promptText,name:b.name,...a}),
      post("/api/birthchart",{chartText:ch.promptText,name:b.name}).catch(e=>{console.error("BC preload:",e);return null;}),
    ]);
    setReading(ho);if(bc)setBca(bc);
    const k=(b.ig||b.name||"anon").toLowerCase().replace(/[@\s]+/g,"-").replace(/[^a-z0-9-]/g,"");
    setUkey(k);
    try{localStorage.setItem("luminary_user",JSON.stringify({key:k,name:b.name}));}catch{}
    saveReading({name:b.name,ig:b.ig,birth:{date:b.date,time:b.time,city:b.city,lat:b.lat,lon:b.lon},chart:ch,reading:ho,answers:a,birthchartAnalysis:bc});
    setScr("reading");
  }catch(e){console.error(e);setErr(e.message);setScr("error");}};

  const reset=()=>{try{localStorage.removeItem("luminary_user");}catch{}
    setBd(null);setAns(null);setChart(null);setReading(null);setBca(null);setErr(null);setUkey(null);setChatMsgs(null);setFriends([]);setScr("landing");};

  const navItems=[{id:"landing",l:"Home"},{id:"reading",l:"Reading"},{id:"birthchart",l:"Birth Chart"},{id:"humandesign",l:"Design"},{id:"shareable",l:"Star Note"},{id:"chat",l:"✦ Ask"},{id:"friends",l:"Friends"},{id:"feedback",l:"Feedback"}];
  const navBtn=(id)=>({fontFamily:SN,fontSize:9,border:"none",padding:"5px 8px",borderRadius:5,cursor:"pointer",background:scr===id?P.warm:"transparent",color:scr===id?P.ink:P.fn});
  const navGo=(id)=>{
    if(id==="landing")setScr(chart?"reading":"landing");
    else if(id==="reading"&&chart&&reading)setScr("reading");
    else if(id==="birthchart"&&chart)setScr("birthchart");
    else if(id==="humandesign"&&chart)setScr("humandesign");
    else if(id==="shareable"&&reading)setScr("shareable");
    else if(id==="chat"&&chart)setScr("chat");
    else if(id==="friends"&&chart)setScr("friends");
    else if(id==="feedback")setScr("feedback");
  };

  return(
    <>
      <style>{V6CSS}</style>
      <div style={{display:"flex",alignItems:"center",gap:2,padding:"8px 8px",background:"#FFF",borderBottom:"1px solid rgba(42,33,24,0.05)",flexShrink:0,overflowX:"auto",whiteSpace:"nowrap"}}>
        {navItems.map(n=><button key={n.id} onClick={()=>navGo(n.id)} style={navBtn(n.id)}>{n.l}</button>)}
        <button onClick={shareApp} style={{fontFamily:SN,fontSize:9,padding:"5px 12px",borderRadius:12,cursor:"pointer",border:"1px solid rgba(191,140,62,0.25)",background:P.goldBg,color:P.gold,marginLeft:"auto",whiteSpace:"nowrap"}}>{shared?"✓ Copied":"↗ Share"}</button>
      </div>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {scr==="boot"&&<div style={{flex:1,background:P.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner size={48}/></div>}
        {scr==="landing"&&<Landing onStart={()=>setScr("input")} tag={tag}/>}
        {scr==="input"&&<BirthInput onSubmit={b=>{setBd(b);setScr("questions");}}/>}
        {scr==="questions"&&<Questions onSubmit={a=>{setAns(a);generate(bd,a);}} name={bd?.name||""}/>}
        {scr==="loading"&&<LoadingScreen name={bd?.name||""}/>}
        {scr==="reading"&&chart&&reading&&<ReadingScreen chart={chart} reading={reading} name={bd?.name||""} onChat={()=>setScr("chat")} onReset={reset} onShareable={()=>setScr("shareable")}/>}
        {scr==="birthchart"&&chart&&<BirthChartScreen chart={chart} analysis={bca} name={bd?.name||""} onChat={()=>setScr("chat")}/>}
        {scr==="humandesign"&&chart&&<HDScreen chart={chart} analysis={bca} name={bd?.name||""} onChat={()=>setScr("chat")}/>}
        {scr==="shareable"&&reading&&chart&&<ShareableScreen reading={reading} name={bd?.name||""} chart={chart} onBack={()=>setScr("reading")}/>}
        {scr==="friends"&&chart&&<FriendsScreen userChart={chart} userName={bd?.name||""} userBirth={bd?.date||null} friends={friends} setFriends={setFriends} ukey={ukey} post={post} onChat={()=>setScr("chat")}/>}
        {scr==="feedback"&&<FeedbackScreen name={bd?.name||""} ukey={ukey}/>}
        {scr==="chat"&&chart&&<ChatScreen chart={chart} name={bd?.name||""} onBack={()=>setScr("reading")} userKey={ukey} initialMsgs={chatMsgs} onSync={setChatMsgs}/>}
        {scr==="error"&&(
          <div style={{flex:1,background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
            <p style={{fontFamily:SR,fontSize:22,fontWeight:300,color:P.ink,marginBottom:8}}>Something went wrong</p>
            <p style={{fontFamily:SN,fontSize:12,color:P.lt,marginBottom:20,maxWidth:340,wordBreak:"break-word",userSelect:"text",lineHeight:1.5}}>{err}</p>
            <button onClick={()=>generate(bd,ans)} style={{padding:"12px 28px",background:P.ink,color:"#FFF",border:"none",borderRadius:20,cursor:"pointer",fontFamily:SN,fontSize:11,marginBottom:8}}>Try Again</button>
            <button onClick={reset} style={{background:"none",border:"none",color:P.lt,cursor:"pointer",fontFamily:SN,fontSize:11}}>Start Over</button>
          </div>
        )}
      </div>
    </>
  );
}

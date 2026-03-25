"use client";
import React, { useState, useRef, useEffect } from "react";

const PAL = [
  {bg1:"#2A3328",bg2:"#1A2118",ac:"#7A8B6F",tx:"#E8EDE5",gl:"rgba(122,139,111,0.1)"},
  {bg1:"#3A2228",bg2:"#241418",ac:"#C4727F",tx:"#F0E4E6",gl:"rgba(196,114,127,0.1)"},
  {bg1:"#3A3222",bg2:"#241E12",ac:"#D4A843",tx:"#F0EBE0",gl:"rgba(212,168,67,0.1)"},
  {bg1:"#2A2838",bg2:"#1A1628",ac:"#9B8EC4",tx:"#E8E4F0",gl:"rgba(155,142,196,0.1)"}
];
const K={bg:"#0B0F14",gold:"#C9A84C",sage:"#7A8B6F",rose:"#C4727F",cream:"#F5F0E8",navy:"#1B2B3A",violet:"#9B8EC4",dim:"#6B7280"};
const f1="'Cormorant Garamond',Georgia,serif";
const f2="'DM Sans',system-ui,sans-serif";

const CITIES=[
{n:"Phoenix, AZ",la:33.4484,ln:-112.074,tz:-7},{n:"Scottsdale, AZ",la:33.4942,ln:-111.926,tz:-7},{n:"Tucson, AZ",la:32.2226,ln:-110.9747,tz:-7},{n:"Mesa, AZ",la:33.4152,ln:-111.8315,tz:-7},{n:"Tempe, AZ",la:33.4255,ln:-111.94,tz:-7},{n:"Chandler, AZ",la:33.3062,ln:-111.8413,tz:-7},{n:"Gilbert, AZ",la:33.3528,ln:-111.789,tz:-7},{n:"Glendale, AZ",la:33.5387,ln:-112.186,tz:-7},{n:"Peoria, AZ",la:33.5806,ln:-112.237,tz:-7},{n:"Flagstaff, AZ",la:35.1983,ln:-111.6513,tz:-7},{n:"Sedona, AZ",la:34.8697,ln:-111.761,tz:-7},{n:"Prescott, AZ",la:34.54,ln:-112.4685,tz:-7},
{n:"Los Angeles, CA",la:34.0522,ln:-118.2437,tz:-8},{n:"Beverly Hills, CA",la:34.0736,ln:-118.4004,tz:-8},{n:"San Francisco, CA",la:37.7749,ln:-122.4194,tz:-8},{n:"San Diego, CA",la:32.7157,ln:-117.1611,tz:-8},{n:"San Jose, CA",la:37.3382,ln:-121.8863,tz:-8},{n:"Sacramento, CA",la:38.5816,ln:-121.4944,tz:-8},{n:"Oakland, CA",la:37.8044,ln:-122.2712,tz:-8},{n:"Long Beach, CA",la:33.7701,ln:-118.1937,tz:-8},{n:"Santa Monica, CA",la:34.0195,ln:-118.4912,tz:-8},{n:"Malibu, CA",la:34.0259,ln:-118.7798,tz:-8},{n:"West Hollywood, CA",la:34.09,ln:-118.3617,tz:-8},{n:"Pasadena, CA",la:34.1478,ln:-118.1445,tz:-8},{n:"El Segundo, CA",la:33.9192,ln:-118.4165,tz:-8},{n:"Irvine, CA",la:33.6846,ln:-117.8265,tz:-8},{n:"Santa Barbara, CA",la:34.4208,ln:-119.6982,tz:-8},{n:"Palm Springs, CA",la:33.8303,ln:-116.5453,tz:-8},{n:"Fresno, CA",la:36.7378,ln:-119.7871,tz:-8},{n:"Anaheim, CA",la:33.8366,ln:-117.9143,tz:-8},{n:"Riverside, CA",la:33.9534,ln:-117.3962,tz:-8},{n:"Burbank, CA",la:34.1808,ln:-118.309,tz:-8},{n:"Newport Beach, CA",la:33.6189,ln:-117.9289,tz:-8},{n:"Laguna Beach, CA",la:33.5427,ln:-117.7854,tz:-8},{n:"Napa, CA",la:38.2975,ln:-122.2869,tz:-8},
{n:"New York, NY",la:40.7128,ln:-74.006,tz:-5},{n:"Brooklyn, NY",la:40.6782,ln:-73.9442,tz:-5},{n:"Manhattan, NY",la:40.7831,ln:-73.9712,tz:-5},{n:"Queens, NY",la:40.7282,ln:-73.7949,tz:-5},{n:"Buffalo, NY",la:42.8864,ln:-78.8784,tz:-5},{n:"Albany, NY",la:42.6526,ln:-73.7562,tz:-5},{n:"Rochester, NY",la:43.1566,ln:-77.6088,tz:-5},{n:"Syracuse, NY",la:43.0481,ln:-76.1474,tz:-5},{n:"Ithaca, NY",la:42.444,ln:-76.5019,tz:-5},
{n:"Dallas, TX",la:32.7767,ln:-96.797,tz:-6},{n:"Houston, TX",la:29.7604,ln:-95.3698,tz:-6},{n:"Austin, TX",la:30.2672,ln:-97.7431,tz:-6},{n:"San Antonio, TX",la:29.4241,ln:-98.4936,tz:-6},{n:"Fort Worth, TX",la:32.7555,ln:-97.3308,tz:-6},{n:"El Paso, TX",la:31.7619,ln:-106.485,tz:-7},{n:"Plano, TX",la:33.0198,ln:-96.6989,tz:-6},{n:"Lubbock, TX",la:33.5779,ln:-101.8552,tz:-6},
{n:"Miami, FL",la:25.7617,ln:-80.1918,tz:-5},{n:"Tampa, FL",la:27.9506,ln:-82.4572,tz:-5},{n:"Orlando, FL",la:28.5383,ln:-81.3792,tz:-5},{n:"Jacksonville, FL",la:30.3322,ln:-81.6557,tz:-5},{n:"Fort Lauderdale, FL",la:26.1224,ln:-80.1373,tz:-5},{n:"St. Petersburg, FL",la:27.7676,ln:-82.6403,tz:-5},{n:"Naples, FL",la:26.142,ln:-81.7948,tz:-5},{n:"Sarasota, FL",la:27.3364,ln:-82.5307,tz:-5},{n:"Boca Raton, FL",la:26.3587,ln:-80.0831,tz:-5},{n:"West Palm Beach, FL",la:26.7153,ln:-80.0534,tz:-5},{n:"Tallahassee, FL",la:30.4383,ln:-84.2807,tz:-5},
{n:"Chicago, IL",la:41.8781,ln:-87.6298,tz:-6},{n:"Aurora, IL",la:41.7606,ln:-88.3201,tz:-6},{n:"Naperville, IL",la:41.7508,ln:-88.1535,tz:-6},{n:"Springfield, IL",la:39.7817,ln:-89.6501,tz:-6},{n:"Evanston, IL",la:42.0451,ln:-87.6877,tz:-6},
{n:"Boston, MA",la:42.3601,ln:-71.0589,tz:-5},{n:"Northampton, MA",la:42.3251,ln:-72.6412,tz:-5},{n:"Cambridge, MA",la:42.3736,ln:-71.1097,tz:-5},{n:"Worcester, MA",la:42.2626,ln:-71.8023,tz:-5},{n:"Salem, MA",la:42.5195,ln:-70.8967,tz:-5},
{n:"Denver, CO",la:39.7392,ln:-104.9903,tz:-7},{n:"Boulder, CO",la:40.015,ln:-105.2705,tz:-7},{n:"Colorado Springs, CO",la:38.8339,ln:-104.8214,tz:-7},{n:"Aspen, CO",la:39.1911,ln:-106.8175,tz:-7},
{n:"Seattle, WA",la:47.6062,ln:-122.3321,tz:-8},{n:"Tacoma, WA",la:47.2529,ln:-122.4443,tz:-8},{n:"Bellevue, WA",la:47.6101,ln:-122.2015,tz:-8},
{n:"Portland, OR",la:45.5152,ln:-122.6784,tz:-8},{n:"Eugene, OR",la:44.0521,ln:-123.0868,tz:-8},{n:"Bend, OR",la:44.0582,ln:-121.3153,tz:-8},
{n:"Atlanta, GA",la:33.749,ln:-84.388,tz:-5},{n:"Savannah, GA",la:32.0809,ln:-81.0912,tz:-5},
{n:"Nashville, TN",la:36.1627,ln:-86.7816,tz:-6},{n:"Memphis, TN",la:35.1495,ln:-90.049,tz:-6},{n:"Knoxville, TN",la:35.9606,ln:-83.9207,tz:-5},
{n:"Las Vegas, NV",la:36.1699,ln:-115.1398,tz:-8},{n:"Reno, NV",la:39.5296,ln:-119.8138,tz:-8},
{n:"Philadelphia, PA",la:39.9526,ln:-75.1652,tz:-5},{n:"Pittsburgh, PA",la:40.4406,ln:-79.9959,tz:-5},
{n:"Washington, DC",la:38.9072,ln:-77.0369,tz:-5},
{n:"Minneapolis, MN",la:44.9778,ln:-93.265,tz:-6},{n:"St. Paul, MN",la:44.9537,ln:-93.09,tz:-6},
{n:"Charlotte, NC",la:35.2271,ln:-80.8431,tz:-5},{n:"Raleigh, NC",la:35.7796,ln:-78.6382,tz:-5},{n:"Asheville, NC",la:35.5951,ln:-82.5515,tz:-5},
{n:"Honolulu, HI",la:21.3069,ln:-157.8583,tz:-10},{n:"Maui, HI",la:20.7984,ln:-156.3319,tz:-10},{n:"Kauai, HI",la:22.0964,ln:-159.5261,tz:-10},
{n:"Detroit, MI",la:42.3314,ln:-83.0458,tz:-5},{n:"Ann Arbor, MI",la:42.2808,ln:-83.743,tz:-5},{n:"Grand Rapids, MI",la:42.9634,ln:-85.6681,tz:-5},
{n:"New Orleans, LA",la:29.9511,ln:-90.0715,tz:-6},{n:"Baton Rouge, LA",la:30.4515,ln:-91.1871,tz:-6},
{n:"Baltimore, MD",la:39.2904,ln:-76.6122,tz:-5},{n:"Bethesda, MD",la:38.9807,ln:-77.1003,tz:-5},
{n:"Salt Lake City, UT",la:40.7608,ln:-111.891,tz:-7},{n:"Park City, UT",la:40.6461,ln:-111.498,tz:-7},
{n:"Indianapolis, IN",la:39.7684,ln:-86.1581,tz:-5},
{n:"Columbus, OH",la:39.9612,ln:-82.9988,tz:-5},{n:"Cleveland, OH",la:41.4993,ln:-81.6944,tz:-5},{n:"Cincinnati, OH",la:39.1031,ln:-84.512,tz:-5},
{n:"Kansas City, MO",la:39.0997,ln:-94.5786,tz:-6},{n:"St. Louis, MO",la:38.627,ln:-90.1994,tz:-6},
{n:"Milwaukee, WI",la:43.0389,ln:-87.9065,tz:-6},{n:"Madison, WI",la:43.0731,ln:-89.4012,tz:-6},
{n:"Richmond, VA",la:37.5407,ln:-77.436,tz:-5},{n:"Virginia Beach, VA",la:36.8529,ln:-75.978,tz:-5},{n:"Charlottesville, VA",la:38.0293,ln:-78.4767,tz:-5},
{n:"Charleston, SC",la:32.7765,ln:-79.9311,tz:-5},{n:"Greenville, SC",la:34.8526,ln:-82.394,tz:-5},
{n:"Albuquerque, NM",la:35.0844,ln:-106.6504,tz:-7},{n:"Santa Fe, NM",la:35.687,ln:-105.9378,tz:-7},{n:"Taos, NM",la:36.4072,ln:-105.5731,tz:-7},
{n:"Oklahoma City, OK",la:35.4676,ln:-97.5164,tz:-6},{n:"Tulsa, OK",la:36.154,ln:-95.9928,tz:-6},
{n:"Louisville, KY",la:38.2527,ln:-85.7585,tz:-5},{n:"Lexington, KY",la:38.0406,ln:-84.5037,tz:-5},
{n:"Hartford, CT",la:41.7658,ln:-72.6734,tz:-5},{n:"Stamford, CT",la:41.0534,ln:-73.5387,tz:-5},{n:"Greenwich, CT",la:41.0263,ln:-73.6282,tz:-5},
{n:"Providence, RI",la:41.824,ln:-71.4128,tz:-5},{n:"Newport, RI",la:41.4901,ln:-71.3128,tz:-5},
{n:"Des Moines, IA",la:41.5868,ln:-93.625,tz:-6},
{n:"Boise, ID",la:43.615,ln:-116.2023,tz:-7},
{n:"Omaha, NE",la:41.2565,ln:-95.9345,tz:-6},
{n:"Portland, ME",la:43.6591,ln:-70.2568,tz:-5},
{n:"Burlington, VT",la:44.4759,ln:-73.2121,tz:-5},
{n:"Anchorage, AK",la:61.2181,ln:-149.9003,tz:-9},
{n:"Manchester, NH",la:42.9956,ln:-71.4548,tz:-5},
{n:"Wilmington, DE",la:39.7391,ln:-75.5398,tz:-5},
{n:"Birmingham, AL",la:33.5207,ln:-86.8025,tz:-6},{n:"Huntsville, AL",la:34.7304,ln:-86.5861,tz:-6},
{n:"Little Rock, AR",la:34.7465,ln:-92.2896,tz:-6},
{n:"Jackson, MS",la:32.2988,ln:-90.1848,tz:-6},
{n:"Billings, MT",la:45.7833,ln:-108.5007,tz:-7},{n:"Missoula, MT",la:46.8721,ln:-114.0016,tz:-7},
{n:"Cheyenne, WY",la:41.14,ln:-104.8202,tz:-7},{n:"Jackson, WY",la:43.4799,ln:-110.7624,tz:-7},
{n:"Wichita, KS",la:37.6872,ln:-97.3301,tz:-6},
{n:"Fargo, ND",la:46.8772,ln:-96.7898,tz:-6},
{n:"Sioux Falls, SD",la:43.5446,ln:-96.7311,tz:-6},
{n:"Charleston, WV",la:38.3498,ln:-81.6326,tz:-5},
{n:"Toronto, Canada",la:43.6532,ln:-79.3832,tz:-5},{n:"Vancouver, Canada",la:49.2827,ln:-123.1207,tz:-8},{n:"Montreal, Canada",la:45.5017,ln:-73.5673,tz:-5},{n:"Calgary, Canada",la:51.0447,ln:-114.0719,tz:-7},{n:"Ottawa, Canada",la:45.4215,ln:-75.6972,tz:-5},{n:"Edmonton, Canada",la:53.5461,ln:-113.4938,tz:-7},{n:"Victoria, Canada",la:48.4284,ln:-123.3656,tz:-8},
{n:"Mexico City, Mexico",la:19.4326,ln:-99.1332,tz:-6},{n:"Cancun, Mexico",la:21.1619,ln:-86.8515,tz:-5},{n:"Tulum, Mexico",la:20.2115,ln:-87.4654,tz:-5},{n:"Cabo San Lucas, Mexico",la:22.8905,ln:-109.9167,tz:-7},{n:"Puerto Vallarta, Mexico",la:20.6534,ln:-105.2253,tz:-6},
{n:"Sao Paulo, Brazil",la:-23.5505,ln:-46.6333,tz:-3},{n:"Rio de Janeiro, Brazil",la:-22.9068,ln:-43.1729,tz:-3},{n:"Buenos Aires, Argentina",la:-34.6037,ln:-58.3816,tz:-3},{n:"Bogota, Colombia",la:4.711,ln:-74.0721,tz:-5},{n:"Medellin, Colombia",la:6.2476,ln:-75.5658,tz:-5},{n:"Lima, Peru",la:-12.0464,ln:-77.0428,tz:-5},{n:"Santiago, Chile",la:-33.4489,ln:-70.6693,tz:-4},
{n:"London, UK",la:51.5074,ln:-0.1278,tz:0},{n:"Manchester, UK",la:53.4808,ln:-2.2426,tz:0},{n:"Edinburgh, UK",la:55.9533,ln:-3.1883,tz:0},{n:"Paris, France",la:48.8566,ln:2.3522,tz:1},{n:"Nice, France",la:43.7102,ln:7.262,tz:1},{n:"Berlin, Germany",la:52.52,ln:13.405,tz:1},{n:"Munich, Germany",la:48.1351,ln:11.582,tz:1},{n:"Amsterdam, Netherlands",la:52.3676,ln:4.9041,tz:1},{n:"Rome, Italy",la:41.9028,ln:12.4964,tz:1},{n:"Milan, Italy",la:45.4642,ln:9.19,tz:1},{n:"Florence, Italy",la:43.7696,ln:11.2558,tz:1},{n:"Venice, Italy",la:45.4408,ln:12.3155,tz:1},{n:"Madrid, Spain",la:40.4168,ln:-3.7038,tz:1},{n:"Barcelona, Spain",la:41.3874,ln:2.1686,tz:1},{n:"Ibiza, Spain",la:38.9067,ln:1.4206,tz:1},{n:"Lisbon, Portugal",la:38.7223,ln:-9.1393,tz:0},{n:"Dublin, Ireland",la:53.3498,ln:-6.2603,tz:0},{n:"Vienna, Austria",la:48.2082,ln:16.3738,tz:1},{n:"Zurich, Switzerland",la:47.3769,ln:8.5417,tz:1},{n:"Geneva, Switzerland",la:46.2044,ln:6.1432,tz:1},{n:"Prague, Czech Republic",la:50.0755,ln:14.4378,tz:1},{n:"Budapest, Hungary",la:47.4979,ln:19.0402,tz:1},{n:"Copenhagen, Denmark",la:55.6761,ln:12.5683,tz:1},{n:"Stockholm, Sweden",la:59.3293,ln:18.0686,tz:1},{n:"Oslo, Norway",la:59.9139,ln:10.7522,tz:1},{n:"Athens, Greece",la:37.9838,ln:23.7275,tz:2},{n:"Santorini, Greece",la:36.3932,ln:25.4615,tz:2},{n:"Istanbul, Turkey",la:41.0082,ln:28.9784,tz:3},{n:"Dubrovnik, Croatia",la:42.6507,ln:18.0944,tz:1},
{n:"Tel Aviv, Israel",la:32.0853,ln:34.7818,tz:2},{n:"Jerusalem, Israel",la:31.7683,ln:35.2137,tz:2},{n:"Haifa, Israel",la:32.794,ln:34.9896,tz:2},{n:"Dubai, UAE",la:25.2048,ln:55.2708,tz:4},{n:"Abu Dhabi, UAE",la:24.4539,ln:54.3773,tz:4},{n:"Doha, Qatar",la:25.2854,ln:51.531,tz:3},{n:"Riyadh, Saudi Arabia",la:24.7136,ln:46.6753,tz:3},{n:"Beirut, Lebanon",la:33.8938,ln:35.5018,tz:2},{n:"Amman, Jordan",la:31.9454,ln:35.9284,tz:2},{n:"Tehran, Iran",la:35.6892,ln:51.389,tz:3.5},
{n:"Tokyo, Japan",la:35.6762,ln:139.6503,tz:9},{n:"Osaka, Japan",la:34.6937,ln:135.5023,tz:9},{n:"Kyoto, Japan",la:35.0116,ln:135.7681,tz:9},{n:"Seoul, South Korea",la:37.5665,ln:126.978,tz:9},{n:"Beijing, China",la:39.9042,ln:116.4074,tz:8},{n:"Shanghai, China",la:31.2304,ln:121.4737,tz:8},{n:"Hong Kong",la:22.3193,ln:114.1694,tz:8},{n:"Taipei, Taiwan",la:25.033,ln:121.5654,tz:8},{n:"Singapore",la:1.3521,ln:103.8198,tz:8},{n:"Bangkok, Thailand",la:13.7563,ln:100.5018,tz:7},{n:"Chiang Mai, Thailand",la:18.7061,ln:98.9817,tz:7},{n:"Phuket, Thailand",la:7.8804,ln:98.3923,tz:7},{n:"Mumbai, India",la:19.076,ln:72.8777,tz:5.5},{n:"New Delhi, India",la:28.6139,ln:77.209,tz:5.5},{n:"Bangalore, India",la:12.9716,ln:77.5946,tz:5.5},{n:"Goa, India",la:15.2993,ln:74.124,tz:5.5},{n:"Bali, Indonesia",la:-8.3405,ln:115.092,tz:8},{n:"Kuala Lumpur, Malaysia",la:3.139,ln:101.6869,tz:8},{n:"Manila, Philippines",la:14.5995,ln:120.9842,tz:8},{n:"Hanoi, Vietnam",la:21.0278,ln:105.8342,tz:7},
{n:"Cairo, Egypt",la:30.0444,ln:31.2357,tz:2},{n:"Cape Town, South Africa",la:-33.9249,ln:18.4241,tz:2},{n:"Johannesburg, South Africa",la:-26.2041,ln:28.0473,tz:2},{n:"Nairobi, Kenya",la:-1.2921,ln:36.8219,tz:3},{n:"Lagos, Nigeria",la:6.5244,ln:3.3792,tz:1},{n:"Marrakech, Morocco",la:31.6295,ln:-7.9811,tz:1},
{n:"Sydney, Australia",la:-33.8688,ln:151.2093,tz:10},{n:"Melbourne, Australia",la:-37.8136,ln:144.9631,tz:10},{n:"Brisbane, Australia",la:-27.4698,ln:153.0251,tz:10},{n:"Perth, Australia",la:-31.9505,ln:115.8605,tz:8},{n:"Gold Coast, Australia",la:-28.0167,ln:153.4,tz:10},{n:"Auckland, New Zealand",la:-36.8485,ln:174.7633,tz:12},{n:"Wellington, New Zealand",la:-41.2865,ln:174.7762,tz:12},{n:"Queenstown, New Zealand",la:-45.0312,ln:168.6626,tz:12},{n:"Fiji",la:-17.7134,ln:178.065,tz:12}
];

/* ─── Components ─── */
const ZG=({sign,size=28,color=K.gold})=>{const p={Aries:"M12 2C8 8 6 14 6 20M12 2C16 8 18 14 18 20M8 8h8",Taurus:"M6 8a6 6 0 1 0 12 0M12 8v12M7 14h10",Gemini:"M6 4h12M6 20h12M8 4v16M16 4v16",Cancer:"M4 12a8 4 0 0 1 16 0M20 12a8 4 0 0 1-16 0M8 10a2 2 0 1 1 0 .1M16 14a2 2 0 1 1 0 .1",Leo:"M8 16a4 4 0 1 1 4-4c0 4 4 4 4 8M16 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0",Virgo:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v12c0 4 3 4 3 0V8l3 6",Libra:"M4 16h16M12 16V6M6 6c0-3 3-4 6-4s6 1 6 4",Scorpio:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v16l4-4",Sagittarius:"M4 20L20 4M20 4h-8M20 4v8M8 16l-4 4",Capricorn:"M4 4v12c0 6 4 6 4 0V8c0 4 4 8 8 8a4 4 0 0 0 0-8",Aquarius:"M2 8l4 4 4-4 4 4 4-4M2 14l4 4 4-4 4 4 4-4",Pisces:"M8 2v20M16 2v20M4 12h16"};return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d={p[sign]||p.Aries}/></svg>;};
const Star4=({size=12,color=K.gold,opacity=0.4})=><svg width={size} height={size} viewBox="0 0 24 24" style={{display:"inline-block"}}><path d="M12,2 C13,8 16,11 22,12 C16,13 13,16 12,22 C11,16 8,13 2,12 C8,11 11,8 12,2Z" fill={color} opacity={opacity}/></svg>;
const Gauge=({value,size=120,color=K.gold})=>{const[a,setA]=useState(0);useEffect(()=>{setTimeout(()=>setA(value),400);},[value]);const r=size/2-6;const c=2*Math.PI*r;return<div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={c} strokeDashoffset={c*(1-a/10)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.5s ease-out"}}/></svg><div style={{position:"absolute",textAlign:"center"}}><div style={{fontSize:size*.35,color,fontWeight:300,fontFamily:f1,lineHeight:1}}>{value}</div><div style={{fontSize:size*.09,color:K.dim,fontFamily:f2,letterSpacing:1,marginTop:2}}>OF 10</div></div></div>;};
const FadeIn=({children,delay=0})=>{const[v,setV]=useState(false);useEffect(()=>{const t=setTimeout(()=>setV(true),delay);return()=>clearTimeout(t);},[delay]);return<div style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(12px)",transition:"opacity 0.5s ease,transform 0.5s ease"}}>{children}</div>;};
const track=(name,data={})=>{try{const e=JSON.parse(localStorage.getItem("lum_ev")||"[]");e.push({name,data,ts:Date.now()});localStorage.setItem("lum_ev",JSON.stringify(e.slice(-1000)));}catch(x){}};

/* Date helpers */
const weekRange=()=>{const n=new Date(),d=n.getDay(),df=n.getDate()-d+(d===0?-6:1),m=new Date(n);m.setDate(df);const s=new Date(m);s.setDate(m.getDate()+6);const ms=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return`${ms[m.getMonth()]} ${m.getDate()} - ${ms[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;};
const curMonth=()=>["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()];
const nxtMonth=()=>["January","February","March","April","May","June","July","August","September","October","November","December"][(new Date().getMonth()+1)%12];
const curSeason=()=>{const m=new Date().getMonth();return m>=2&&m<=4?"Spring":m>=5&&m<=7?"Summer":m>=8&&m<=10?"Autumn":"Winter";};

/* Build horoscope prompt using server-calculated chart data */
const buildPrompt=(name,chartData,ig)=>{
  const ch=chartData;const noTime=ch.unknownTime;
  const risingText=noTime?"Rising: UNKNOWN (birth time not provided — do NOT reference Rising sign or houses)":("Rising: "+ch.chart.Ascendant.sign+" "+ch.chart.Ascendant.deg+"deg");
  return `Generate personalized horoscope slides for ${name}.

NATAL CHART: ${ch.chartText}
Sun: ${ch.chart.Sun.sign} ${ch.chart.Sun.deg}deg (${ch.sunElement}, ${ch.sunModality}). Moon: ${ch.chart.Moon.sign} ${ch.chart.Moon.deg}deg${noTime?" (approximate — birth time unknown)":""}. ${risingText}.
${noTime?"\nIMPORTANT: Birth time is UNKNOWN. Do NOT reference Rising sign, Ascendant, or house placements. Moon sign may be off by up to one sign. Focus on Sun sign, planetary positions, and confirmed aspects.\n":""}
CURRENT TRANSITS: ${ch.transitText}

TOP ACTIVE ASPECTS (sorted by intensity — the FIRST ones are the MOST powerful and should DRIVE the reading):
${ch.topAspects.join("\n")}

Overall Transit Intensity: ${ch.intensity}/10

KEY CURRENT EVENTS: Spring 2026, Jupiter in Cancer expanding emotional and home sector for many, Saturn in early Aries restructuring identity and ambition, Uranus finishing its transit through Taurus destabilizing security and finances, Neptune newly in Aries igniting spiritual identity.

Check: Is transit Venus within 10deg of natal Venus? If YES, this is a VENUS RETURN — once a year event, HEADLINE IT. Is transit Jupiter within 10deg of natal Jupiter? JUPITER RETURN — once in 12 years. Is transit Saturn within 10deg of natal Saturn? SATURN RETURN — once in 29 years. These are RARE. Lead with them.

USER CONTEXT: Focus=${chartData.focus||"Growth"}. Energy=${chartData.energy||"Rebuilding"}. Seeking=${chartData.seeking||"Direction"}.

JSON format:
{"weekly":[{"title":"YOUR WEEK","subtitle":"${weekRange()}","body":"3-4 sentences"},{"title":"MIDWEEK","subtitle":"Wed-Thu","body":"3-4 sentences"},{"title":"WEEKEND","subtitle":"Fri-Sun","body":"3-4 sentences"},{"title":"YOUR MANTRA","subtitle":"This Weeks Guiding Light","body":"one powerful mantra for a ${ch.sunElement} ${ch.sunModality} sign"}],"monthly":[{"title":"${curMonth().toUpperCase()}","subtitle":"Monthly Overview","body":"3-4 sentences"},{"title":"${nxtMonth().toUpperCase()}","subtitle":"Looking Ahead","body":"3-4 sentences"},{"title":"THE SEASON","subtitle":"${curSeason()} Forecast","body":"3-4 sentences"},{"title":"YOUR MANTRA","subtitle":"${curSeason()} Guiding Light","body":"one powerful mantra for a ${ch.sunElement} ${ch.sunModality} sign"}]}

OUTPUT ONLY RAW JSON.`;
};

/* ═══════════ SCREENS ═══════════ */
const Landing=({onStart,onAdmin})=>{
  const tapRef=useRef(0),tmRef=useRef(null);
  const[fi,setFi]=useState(0);const touchRef=useRef(0);
  useEffect(()=>track("view",{p:"landing"}),[]);

  const features=[
    {icon:"✦",iconBg:"rgba(201,168,76,.08)",iconColor:K.gold,title:"Precision Natal Chart",desc:"Sun, Moon, Rising, and all 10 planets — calculated to the exact degree from your birth time and location. This isn't your sign. This is your entire sky."},
    {icon:"✦",iconBg:"rgba(155,142,196,.08)",iconColor:K.violet,title:"Your Week, Written for You",desc:"Every word is crafted for YOUR chart, YOUR transits, THIS week. Not a generic column — a private reading delivered as beautiful, shareable slides."},
    {icon:"✦",iconBg:"rgba(122,139,111,.08)",iconColor:K.sage,title:"Your Personal AI Astrologer",desc:"Ask anything. Timing, relationships, career, why you're feeling what you're feeling. Luminary knows your complete chart and the current sky."},
    {icon:"✦",iconBg:"rgba(196,114,127,.08)",iconColor:K.rose,title:"Deep Birth Chart Analysis",desc:"Your strengths, challenges, love style, career gifts, and a soul mantra — written like you're sitting across from a gifted astrologer in a private session."},
  ];

  const prevF=()=>{if(fi>0)setFi(fi-1);};
  const nextF=()=>{if(fi<features.length-1)setFi(fi+1);};
  const f=features[fi];

  return<div style={{minHeight:"100vh",minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"radial-gradient(ellipse at 50% 0%,#1B2B3A 0%,#0B0F14 55%)",fontFamily:f1,position:"relative",overflow:"hidden"}}>
    {/* Twinkling stars background */}
    <style>{`@keyframes twk{0%,100%{opacity:.15}50%{opacity:.55}}@keyframes pls{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}>
      {Array.from({length:30}).map((_,i)=><div key={i} style={{position:"absolute",width:Math.random()*2+1,height:Math.random()*2+1,background:K.gold,borderRadius:"50%",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`twk ${Math.random()*3+2}s ease-in-out ${Math.random()*5}s infinite`}}/>)}
    </div>

    <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:440,display:"flex",flexDirection:"column",alignItems:"center",flex:1,justifyContent:"center"}}>
      {/* Spacer for safe area */}
      <div style={{height:"env(safe-area-inset-top,12px)"}}/>

      {/* Hero */}
      <FadeIn><div onClick={()=>{tapRef.current++;if(tmRef.current)clearTimeout(tmRef.current);if(tapRef.current>=5){tapRef.current=0;onAdmin();return;}tmRef.current=setTimeout(()=>{tapRef.current=0;},2000);}} style={{fontSize:11,letterSpacing:5,color:K.gold,marginBottom:12,cursor:"default",userSelect:"none",padding:8,fontFamily:f2}}>✦ ✦ ✦</div></FadeIn>

      <FadeIn delay={150}><p style={{fontSize:11,letterSpacing:4,color:K.dim,marginBottom:12,textTransform:"uppercase",fontFamily:f2}}>PERSONALIZED ASTROLOGY</p></FadeIn>

      <FadeIn delay={300}><h1 style={{fontSize:"clamp(46px,13vw,68px)",color:K.cream,fontWeight:300,letterSpacing:10,margin:0,textTransform:"uppercase",lineHeight:1}}>LUMINARY</h1></FadeIn>

      <FadeIn delay={450}><div style={{width:50,height:1,background:`linear-gradient(90deg,transparent,${K.gold},transparent)`,margin:"20px 0"}}/></FadeIn>

      <FadeIn delay={600}><p style={{fontSize:17,color:K.gold,fontWeight:300,fontStyle:"italic",textAlign:"center",lineHeight:1.6,maxWidth:320,margin:"0 auto 8px"}}>Your natal chart, decoded by AI.</p></FadeIn>
      <FadeIn delay={700}><p style={{fontSize:15,color:K.cream,opacity:.5,textAlign:"center",lineHeight:1.6,maxWidth:340,margin:"0 auto 24px"}}>Not your sign — your <em>entire</em> sky.</p></FadeIn>

      {/* Feature Carousel */}
      <FadeIn delay={850}><div style={{width:"100%",maxWidth:420}}>
        <div style={{position:"relative"}}
          onTouchStart={e=>{if(e.touches[0])touchRef.current=e.touches[0].clientX;}}
          onTouchEnd={e=>{if(e.changedTouches[0]){const d=e.changedTouches[0].clientX-touchRef.current;if(d>50)prevF();if(d<-50)nextF();}}}>
          <div style={{padding:"22px 22px 26px",borderRadius:14,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",minHeight:180,display:"flex",flexDirection:"column",transition:"opacity .3s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,background:f.iconBg,fontSize:16,color:f.iconColor,flexShrink:0}}>✦</div>
              <h3 style={{fontSize:18,color:K.cream,fontWeight:500,margin:0,lineHeight:1.3,fontFamily:f2}}>{f.title}</h3>
            </div>
            <p style={{fontSize:15,color:K.dim,lineHeight:1.7,margin:0,fontFamily:f2}}>{f.desc}</p>
          </div>
        </div>
        {/* Dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:14}}>
          {features.map((_,i)=><div key={i} onClick={()=>setFi(i)} style={{width:i===fi?22:8,height:8,borderRadius:4,background:i===fi?K.gold:i<fi?K.sage:"rgba(255,255,255,.08)",transition:"all .3s",cursor:"pointer"}}/>)}
        </div>
      </div></FadeIn>

      {/* CTA */}
      <FadeIn delay={1000}><div style={{width:"100%",maxWidth:420,marginTop:28}}>
        <button onClick={()=>{track("begin");onStart();}} style={{width:"100%",padding:"17px",border:"none",borderRadius:10,background:`linear-gradient(135deg,${K.gold},#B8942F)`,color:"#0B0F14",fontSize:14,fontWeight:600,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:f2,boxShadow:"0 4px 24px rgba(201,168,76,.15)"}}>Get Your Reading</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:K.sage,animation:"pls 2.5s ease-in-out infinite"}}/>
          <span style={{fontSize:13,color:K.dim,fontFamily:f2}}>Free · 2 minutes · No app download</span>
        </div>
      </div></FadeIn>
    </div>

    {/* Footer */}
    <FadeIn delay={1100}><div style={{position:"relative",zIndex:1,textAlign:"center",paddingBottom:"max(20px,env(safe-area-inset-bottom))"}}>
      <p style={{fontSize:12,color:K.dim,letterSpacing:2,fontFamily:f2}}>✦ @alwaysbbuilding5 ✦</p>
    </div></FadeIn>
  </div>;
};

const InputScreen=({onSubmit})=>{
  const[nm,setNm]=useState(""),[ig,setIg]=useState(""),[dt,setDt]=useState(""),[tm,setTm]=useState(""),[noTm,setNoTm]=useState(false);
  const[cq,setCq]=useState(""),[sel,setSel]=useState(null),[show,setShow]=useState(false);
  const filt=()=>!cq||cq.length<2?[]:CITIES.filter(c=>c.n.toLowerCase().includes(cq.toLowerCase())).slice(0,10);
  const sub=()=>{if(!nm||!dt||!sel)return;const p=dt.split("-"),hr=noTm?12:parseFloat((tm||"12:00").split(":")[0])+parseFloat((tm||"12:00").split(":")[1])/60;
    onSubmit({name:nm,ig,year:+p[0],month:+p[1],day:+p[2],hour:hr-sel.tz,localHour:hr,lat:sel.la,lng:sel.ln,tz:sel.tz,city:sel.n,unknownTime:noTm});};
  const ls={fontSize:12,color:K.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:6,display:"block",fontFamily:f2};
  const is={width:"100%",padding:"13px 14px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:6,color:K.cream,fontSize:16,fontFamily:f1,outline:"none",boxSizing:"border-box"};
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",background:"radial-gradient(ellipse at 50% 10%,#1B2B3A 0%,#0B0F14 60%)",fontFamily:f1}}>
    <FadeIn><p style={{fontSize:10,letterSpacing:6,color:K.gold,fontFamily:f2}}>✦ LUMINARY ✦</p></FadeIn>
    <FadeIn delay={100}><h2 style={{fontSize:28,color:K.cream,fontWeight:400,margin:"16px 0 8px"}}>Your Birth Data</h2></FadeIn>
    <FadeIn delay={200}><p style={{fontSize:14,color:K.dim,marginBottom:32,fontFamily:f2}}>The stars need to know where you began</p></FadeIn>
    <FadeIn delay={300}><div style={{width:"100%",maxWidth:380}}>
      <div style={{marginBottom:20}}><label style={ls}>First Name</label><input style={is} placeholder="Your first name" value={nm} onChange={e=>setNm(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={ls}>Instagram Handle</label><input style={is} placeholder="@yourusername" value={ig} onChange={e=>setIg(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={ls}>Birth Date</label><input type="date" style={is} value={dt} onChange={e=>setDt(e.target.value)}/></div>
      <div style={{marginBottom:8}}><label style={ls}>Birth Time</label><input type="time" style={{...is,opacity:noTm?.3:1}} disabled={noTm} value={tm} onChange={e=>setTm(e.target.value)}/></div>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="nt" onChange={e=>setNoTm(e.target.checked)} style={{accentColor:K.gold}}/><label htmlFor="nt" style={{fontSize:13,color:K.dim,fontFamily:f2,cursor:"pointer"}}>I don't know my birth time</label></div>
      <div style={{marginBottom:28,position:"relative"}}><label style={ls}>Birth City</label>
        <input style={is} placeholder="Start typing a city..." value={cq} onChange={e=>{setCq(e.target.value);setSel(null);setShow(true);}} onFocus={()=>{if(cq.length>=2)setShow(true);}}/>
        {sel&&<p style={{fontSize:12,color:K.sage,marginTop:4,fontFamily:f2}}>✓ {sel.n}</p>}
        {show&&filt().length>0&&!sel&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#131920",border:"1px solid #1E2A36",borderRadius:6,maxHeight:260,overflowY:"auto",zIndex:100,marginTop:4}}>{filt().map((c,i)=><div key={i} onClick={()=>{setSel(c);setCq(c.n);setShow(false);}} style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #1E2A36",color:K.cream,fontSize:15,fontFamily:f2}}>{c.n}</div>)}</div>}
      </div>
      <button onClick={sub} style={{width:"100%",padding:"15px",background:sel?K.gold:"#333",color:sel?"#0B0F14":"#666",border:"none",borderRadius:6,fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:sel?"pointer":"default",fontFamily:f2}}>Continue</button>
    </div></FadeIn>
  </div>;};

const Questions=({onSubmit})=>{
  const QS=[{id:"focus",q:"What area needs the most attention right now?",o:["Career","Love","Health","Growth"]},{id:"energy",q:"How would you describe your energy lately?",o:["Charged","Steady","Foggy","Rebuilding"]},{id:"seeking",q:"What are you most seeking?",o:["Timing","Confirmation","Direction","Comfort"]}];
  const[step,setStep]=useState(0),[ans,setAns]=useState({});
  const pick=(id,v)=>{const n={...ans,[id]:v};setAns(n);track("q",{id,v});if(step<2)setTimeout(()=>setStep(step+1),300);else setTimeout(()=>onSubmit(n),300);};
  const q=QS[step];
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",background:"radial-gradient(ellipse at 50% 30%,#1B2B3A 0%,#0B0F14 60%)",fontFamily:f1}}>
    <p style={{fontSize:10,letterSpacing:6,color:K.gold,fontFamily:f2}}>✦ LUMINARY ✦</p>
    <div style={{display:"flex",gap:8,margin:"24px 0 40px"}}>{QS.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?K.gold:i<step?K.sage:"#1E2A36",transition:"all .4s"}}/>)}</div>
    <FadeIn key={step}><h2 style={{fontSize:24,color:K.cream,fontWeight:400,textAlign:"center",marginBottom:36,maxWidth:340,lineHeight:1.6}}>{q.q}</h2>
    <div style={{width:"100%",maxWidth:340}}>{q.o.map(o=>{const s=ans[q.id]===o;return<button key={o} onClick={()=>pick(q.id,o)} style={{width:"100%",padding:17,marginBottom:12,background:s?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:"1px solid "+(s?K.gold:"#1E2A36"),borderRadius:8,color:s?K.gold:K.cream,fontSize:17,cursor:"pointer",textAlign:"left",fontFamily:f1}}>{o}</button>;})}</div></FadeIn>
  </div>;};

const LoadingScreen=({name})=>{const[ph,setPh]=useState(0);useEffect(()=>{const a=setTimeout(()=>setPh(1),3500),b=setTimeout(()=>setPh(2),7500);return()=>{clearTimeout(a);clearTimeout(b);};},[]);
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%,#1B2B3A 0%,#0B0F14 70%)",fontFamily:f1}}>
    <div style={{width:72,height:72,border:"2px solid transparent",borderTopColor:K.gold,borderRadius:"50%",animation:"sp 1.2s linear infinite",marginBottom:36}}/><style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    <p style={{fontSize:18,color:K.cream,opacity:.9,marginBottom:8,textAlign:"center"}}>{["Calculating natal positions...","Reading transits for "+name+"...","Channeling the stars..."][ph]}</p>
    <p style={{fontSize:13,color:K.dim,fontFamily:f2}}>This takes 10–15 seconds</p>
  </div>;};

const ErrScreen=({msg,onRetry})=><div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%,#2A1818 0%,#0B0F14 70%)",fontFamily:f1}}>
  <p style={{fontSize:10,letterSpacing:6,color:K.rose,fontFamily:f2,marginBottom:20}}>✦ LUMINARY ✦</p>
  <h2 style={{fontSize:24,color:K.cream,fontWeight:400,marginBottom:12}}>The Stars Are Busy</h2>
  <p style={{fontSize:14,color:K.dim,maxWidth:340,textAlign:"center",lineHeight:1.7,marginBottom:28,fontFamily:f2}}>{msg||"Something went wrong."}</p>
  <button onClick={onRetry} style={{background:"none",border:"1px solid "+K.gold,color:K.gold,padding:"13px 40px",fontSize:13,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:4,fontFamily:f2}}>Try Again</button>
</div>;

const ChartView=({chartData,name,onContinue})=>{
  const ch=chartData.chart;const noTime=chartData.unknownTime;
  const big=noTime?[{l:"Sun",v:ch.Sun},{l:"Moon ≈",v:ch.Moon}]:[{l:"Sun",v:ch.Sun},{l:"Moon",v:ch.Moon},{l:"Rising",v:ch.Ascendant}];
  const pls=["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 20px",background:"radial-gradient(ellipse at 50% 15%,#1B2B3A 0%,#0B0F14 60%)",fontFamily:f1}}>
    <FadeIn><p style={{fontSize:10,letterSpacing:6,color:K.gold,marginBottom:20,fontFamily:f2}}>✦ LUMINARY ✦</p></FadeIn>
    <FadeIn delay={200}><h2 style={{fontSize:26,color:K.cream,fontWeight:400,marginBottom:20}}>{name}'s Natal Chart</h2></FadeIn>
    <FadeIn delay={400}><Gauge value={chartData.intensity} size={140}/></FadeIn>
    <FadeIn delay={500}><p style={{fontSize:12,color:K.dim,marginTop:8,marginBottom:28,fontFamily:f2}}>Transit Intensity</p></FadeIn>
    <FadeIn delay={600}><div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>{big.map(i=><div key={i.l} style={{background:"rgba(255,255,255,.03)",border:"1px solid #1E2A36",borderRadius:12,padding:"18px 24px",textAlign:"center",minWidth:108}}><p style={{fontSize:11,color:K.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:f2}}>{i.l}</p><ZG sign={i.v.sign} size={36}/><p style={{fontSize:18,color:K.cream,marginTop:8}}>{i.v.sign}</p><p style={{fontSize:13,color:K.gold}}>{i.v.deg}°{i.v.min}'</p></div>)}</div></FadeIn>
    <FadeIn delay={700}><div style={{width:"100%",maxWidth:400,background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:12,padding:18,marginBottom:32}}>
      <p style={{fontSize:11,color:K.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:14,fontFamily:f2}}>Planetary Positions</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>{pls.map(p=>{const v=ch[p];return<div key={p} style={{display:"flex",alignItems:"center",gap:8}}><ZG sign={v.sign} size={18} color={K.sage}/><span style={{fontSize:13,color:K.dim,fontFamily:f2,minWidth:65}}>{p}</span><span style={{fontSize:14,color:K.cream}}>{v.sign} {v.deg}°</span></div>;})}</div>
    </div></FadeIn>
    {noTime&&<FadeIn delay={750}><div style={{width:"100%",maxWidth:400,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.15)",borderRadius:10,padding:16,marginBottom:20}}>
      <p style={{fontSize:13,color:K.gold,margin:0,lineHeight:1.7}}>Your birth time shapes your Rising sign and the houses of your chart — the areas of life each planet activates. Without it, your Moon sign is approximate and your Rising is unknown. Even a 45-minute difference can shift your entire chart. If you can find your birth certificate or ask a parent, it unlocks a much deeper reading.</p>
    </div></FadeIn>}
    <FadeIn delay={800}><button onClick={onContinue} style={{background:K.gold,color:"#0B0F14",border:"none",padding:"15px 44px",fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2}}>See Your Forecast →</button></FadeIn>
  </div>;};

/* ─── SLIDES with 3 tabs ─── */
const SlidesView=({name,chartData,weekly,monthly,onChat,onShare,onBirthChart})=>{
  const[tab,setTab]=useState("weekly"),[idx,setIdx]=useState(0);const touchRef=useRef(0);
  const aspects=chartData.aspects||[];
  const transitCards=aspects.slice(0,6).map(a=>({title:`${a.transit} → ${a.natal}`,subtitle:`${a.aspect.toUpperCase()} • Intensity: ${Math.round(a.tightness*100)}%${a.timing?" • "+a.timing.duration:""}`,body:`Transit ${a.transit} ${a.meaning} your natal ${a.natal}, activating ${a.natalArea}. ${a.timing?"This transit peaks around "+a.timing.peak+" and is active from "+a.timing.start+" to "+a.timing.end+". ":""}${a.tightness>.8?"You are likely feeling this powerfully in your daily life right now.":a.tightness>.5?"This is a significant influence shaping your current experience.":"This is a subtle current in the background."}`}));
  const tabs={weekly,monthly,chart:transitCards};
  const slides=tabs[tab]||weekly;
  const prev=()=>{if(idx>0)setIdx(idx-1);};const next=()=>{if(idx<slides.length-1)setIdx(idx+1);};
  if(!slides.length)return null;
  const sl=slides[idx],pal=PAL[idx%4],isM=(sl.title||"").toUpperCase().includes("MANTRA"),isC=tab==="chart";
  const sunSign=chartData.chart.Sun.sign;
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px",background:"#0B0F14",fontFamily:f1}}>
    <div style={{display:"flex",width:"100%",maxWidth:420,marginBottom:20}}>{[{k:"weekly",l:"Weekly"},{k:"monthly",l:"Monthly"},{k:"chart",l:"Transits"}].map((t,ti)=>{const a=tab===t.k;return<button key={t.k} onClick={()=>{setTab(t.k);setIdx(0);}} style={{flex:1,padding:"14px 0",fontSize:12,letterSpacing:1,textTransform:"uppercase",background:a?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:a?"2px solid "+K.gold:"1px solid #1E2A36",color:a?K.gold:K.dim,cursor:"pointer",fontFamily:f2,fontWeight:a?600:400,borderRadius:ti===0?"8px 0 0 8px":ti===2?"0 8px 8px 0":"0",transition:"all .3s"}}>{t.l}</button>;})}</div>
    <div style={{position:"relative",width:"100%",maxWidth:420}} onTouchStart={e=>{if(e.touches[0])touchRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(e.changedTouches[0]){const d=e.changedTouches[0].clientX-touchRef.current;if(d>50)prev();if(d<-50)next();}}}>
      <div onClick={prev} style={{position:"absolute",left:-4,top:0,width:64,height:"100%",zIndex:10,cursor:idx>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to right,rgba(0,0,0,.4),transparent)"}}>{idx>0&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M20 4L4 24L20 44" stroke={K.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6"/></svg>}</div>
      <div onClick={next} style={{position:"absolute",right:-4,top:0,width:64,height:"100%",zIndex:10,cursor:idx<slides.length-1?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to left,rgba(0,0,0,.4),transparent)"}}>{idx<slides.length-1&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M4 4L20 24L4 44" stroke={K.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6"/></svg>}</div>
      <div style={{minHeight:isC?460:520,borderRadius:18,padding:"36px 30px",background:`linear-gradient(160deg,${pal.bg1} 0%,${pal.bg2} 100%)`,boxShadow:`0 4px 60px rgba(0,0,0,.6),0 0 120px ${pal.gl}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",position:"relative"}}>
        <div style={{position:"absolute",top:16,left:20,opacity:.12}}><Star4 size={14} color={pal.ac}/></div>
        <div style={{position:"absolute",bottom:16,right:20,opacity:.12}}><Star4 size={10} color={pal.ac}/></div>
        <div style={{position:"absolute",top:"40%",right:14,opacity:.08}}><Star4 size={7} color={pal.ac}/></div>
        <p style={{fontSize:10,letterSpacing:6,color:pal.ac,opacity:.7,textAlign:"center",fontFamily:f2}}>✦ LUMINARY ✦</p>
        {isC?<div style={{position:"absolute",top:28,right:28}}><ZG sign={chartData.chart[sl.title.split(" → ")[0]]?.sign||sunSign} size={28} color={pal.ac}/></div>:
          !isM&&<div style={{position:"absolute",top:24,right:24}}><Gauge value={chartData.intensity} size={48} color={pal.ac}/></div>}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"16px 0"}}>
          {isC&&<div style={{marginBottom:12}}><ZG sign={chartData.chart[sl.title.split(" → ")[1]]?.sign||sunSign} size={34} color={pal.ac}/></div>}
          <h3 style={{fontSize:isM?20:isC?17:22,color:pal.tx,letterSpacing:isC?1:3,textTransform:"uppercase",marginBottom:8,fontWeight:isC?500:400,lineHeight:1.3}}>{sl.title}</h3>
          {sl.subtitle&&<p style={{fontSize:13,color:pal.ac,letterSpacing:1,marginBottom:22,fontFamily:f2}}>{sl.subtitle}</p>}
          <p style={{fontSize:isM?21:isC?14:15,color:pal.tx,lineHeight:isC?1.7:1.9,maxWidth:340,opacity:.9,fontStyle:isM?"italic":"normal"}}>{sl.body}</p>
        </div>
        <div style={{textAlign:"center"}}><p style={{fontSize:13,color:pal.ac,marginBottom:4}}>{name} <Star4 size={8} color={pal.ac} opacity={.6}/> {sunSign}</p><p style={{fontSize:10,color:pal.tx,opacity:.25,letterSpacing:2,fontFamily:f2}}>✦ @alwaysbbuilding5 ✦</p></div>
      </div>
    </div>
    <div style={{display:"flex",gap:8,marginTop:18}}>{slides.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?24:10,height:10,borderRadius:5,background:i===idx?K.gold:"#1E2A36",transition:"all .3s",cursor:"pointer"}}/>)}</div>
    <p style={{fontSize:12,color:K.dim,marginTop:8,fontFamily:f2}}>{idx+1} of {slides.length}</p>
    <div style={{display:"flex",gap:10,marginTop:22,flexWrap:"wrap",justifyContent:"center"}}>
      <button onClick={()=>{track("chart_deep");onBirthChart();}} style={{background:"rgba(155,142,196,.1)",border:"1px solid "+K.violet,color:K.violet,padding:"12px 22px",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2}}>Your Chart</button>
      <button onClick={()=>{track("chat");onChat();}} style={{background:"rgba(201,168,76,.1)",border:"1px solid "+K.gold,color:K.gold,padding:"12px 22px",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2}}>Ask Luminary AI</button>
      <button onClick={onShare} style={{background:"rgba(122,139,111,.1)",border:"1px solid "+K.sage,color:K.sage,padding:"12px 22px",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2}}>Share</button>
    </div>
  </div>;};

/* ─── BIRTH CHART DEEP ANALYSIS ─── */
const BirthChartDeep=({chartData,name,onBack})=>{
  const[data,setData]=useState(null);const[ld,setLd]=useState(true);const[err,setErr]=useState(null);
  const noTime=chartData.unknownTime;
  useEffect(()=>{
    const extra=noTime?"\n\nIMPORTANT: Birth time is UNKNOWN. Do NOT reference the Rising sign or Ascendant. Flag that the Moon sign is approximate. Do not make house-based or Midheaven-based claims. Focus on Sun, planetary placements, and aspects you CAN confirm.":"";
    fetch("/api/birthchart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chartText:chartData.chartText+extra,name})})
    .then(r=>r.json()).then(d=>{if(d.error){setErr(d.error);setLd(false);}else{setData(d);setLd(false);}}).catch(e=>{setErr(e.message);setLd(false);});
  },[]);
  const ch=chartData.chart;const sunSign=ch.Sun.sign;
  const sec=(title,content,color=K.gold)=><div style={{width:"100%",maxWidth:420,marginBottom:20}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Star4 size={10} color={color}/><p style={{fontSize:12,color,letterSpacing:2,textTransform:"uppercase",margin:0,fontFamily:f2}}>{title}</p></div>
    {typeof content==="string"?<p style={{fontSize:15,color:K.cream,lineHeight:1.8,opacity:.9}}>{content}</p>:content}
  </div>;
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 20px",background:"radial-gradient(ellipse at 50% 15%,#1B2B3A 0%,#0B0F14 60%)",fontFamily:f1}}>
    <div style={{width:"100%",maxWidth:420,display:"flex",alignItems:"center",marginBottom:24}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:K.gold,fontSize:15,cursor:"pointer",fontFamily:f2}}>← Back</button>
      <span style={{flex:1,textAlign:"center",fontSize:10,letterSpacing:4,color:K.gold,fontFamily:f2}}>✦ YOUR BIRTH CHART ✦</span>
      <div style={{width:50}}/>
    </div>
    <FadeIn><h2 style={{fontSize:26,color:K.cream,fontWeight:400,marginBottom:4}}>{name}'s Chart</h2></FadeIn>
    <FadeIn delay={100}><p style={{fontSize:14,color:K.dim,marginBottom:8,fontFamily:f2}}>{ch.Sun.sign} Sun • {ch.Moon.sign} Moon{ch.Moon.approximate?" (approx)":""}{ noTime?"":" • "+ch.Ascendant.sign+" Rising"}</p></FadeIn>
    <FadeIn delay={200}><div style={{display:"flex",gap:8,marginBottom:noTime?12:28}}><ZG sign={ch.Sun.sign} size={28}/><ZG sign={ch.Moon.sign} size={28} color={K.sage}/>{!noTime&&ch.Ascendant&&<ZG sign={ch.Ascendant.sign} size={28} color={K.violet}/>}</div></FadeIn>
    {noTime&&<FadeIn delay={250}><p style={{fontSize:13,color:K.gold,maxWidth:380,textAlign:"center",lineHeight:1.7,marginBottom:24,opacity:.8}}>Your birth time is unknown, so your Rising sign and house placements aren't included. Your Moon sign may also be approximate. Knowing your exact birth time — even within 15 minutes — transforms the depth of your reading. Check your birth certificate or ask a parent.</p></FadeIn>}
    {ld&&<div style={{marginTop:40,textAlign:"center"}}><div style={{width:48,height:48,border:"2px solid transparent",borderTopColor:K.gold,borderRadius:"50%",animation:"sp 1.2s linear infinite",margin:"0 auto 16px"}}/><p style={{color:K.dim,fontFamily:f2,fontSize:14}}>Analyzing your chart...</p></div>}
    {err&&<p style={{color:K.rose,fontSize:14,textAlign:"center",marginTop:20}}>{err}</p>}
    {data&&<FadeIn delay={300}><div style={{width:"100%",maxWidth:420}}>
      {sec("The Big Three",data.bigThree,K.gold)}
      {sec("Elemental Balance",data.element,K.sage)}
      {sec("Your Natural Gifts",<div>{(data.strengths||[]).map((s,i)=><p key={i} style={{fontSize:15,color:K.cream,lineHeight:1.8,opacity:.9,marginBottom:12,paddingLeft:14,borderLeft:"2px solid "+[K.gold,K.sage,K.violet][i%3]}}>{s}</p>)}</div>,K.violet)}
      {sec("Growth Edges",<div>{(data.challenges||[]).map((c,i)=><p key={i} style={{fontSize:15,color:K.cream,lineHeight:1.8,opacity:.85,marginBottom:12,paddingLeft:14,borderLeft:"2px solid "+K.rose}}>{c}</p>)}</div>,K.rose)}
      {sec("How You Love",data.loveStyle,K.rose)}
      {sec("Career & Purpose",data.careerGifts,K.sage)}
      {sec("Your Current Chapter",data.currentChapter,K.gold)}
      <div style={{textAlign:"center",margin:"32px 0 24px",padding:"28px 24px",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:14}}>
        <Star4 size={16} color={K.gold} opacity={.6}/>
        <p style={{fontSize:12,color:K.gold,letterSpacing:2,textTransform:"uppercase",margin:"12px 0 8px",fontFamily:f2}}>Your Soul Mantra</p>
        <p style={{fontSize:20,color:K.cream,fontStyle:"italic",lineHeight:1.7,opacity:.9}}>{data.soulMantra}</p>
        <p style={{fontSize:12,color:K.dim,marginTop:12,fontFamily:f2}}>{name} • {sunSign}</p>
      </div>
    </div></FadeIn>}
  </div>;};

/* ─── CHAT ─── */
const ChatView=({chartData,name,onBack})=>{
  const[msgs,setMsgs]=useState([]);const[inp,setInp]=useState("");const[ld,setLd]=useState(true);const ref=useRef(null);
  const ctx=`${chartData.chartText}\nTransits: ${chartData.transitText}\nIntensity: ${chartData.intensity}/10\nTop aspects: ${chartData.topAspects.slice(0,8).join("; ")}`;
  useEffect(()=>{fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:"Chart:\n"+ctx+"\n\nQuerent: "+name+". START of conversation. Introduce yourself warmly and list what you can help with based on their specific chart."}],userName:name})}).then(r=>r.json()).then(d=>{setMsgs([{role:"assistant",text:d.reply||"Welcome! What's on your mind?"}]);setLd(false);}).catch(()=>{setMsgs([{role:"assistant",text:"Welcome, "+name+"! I have your chart ready. What would you like to explore?"}]);setLd(false);});},[]);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs,ld]);
  const send=()=>{if(!inp.trim()||ld)return;const um=inp.trim();setInp("");const up=[...msgs,{role:"user",text:um}];setMsgs(up);setLd(true);track("msg",{l:um.length});
    const am=[{role:"user",content:"Chart:\n"+ctx+"\nQuerent: "+name}];up.forEach(m=>am.push({role:m.role==="user"?"user":"assistant",content:m.text}));
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:am,userName:name})}).then(r=>r.json()).then(d=>{setMsgs(p=>[...p,{role:"assistant",text:d.reply||"Let me try again."}]);setLd(false);}).catch(()=>{setMsgs(p=>[...p,{role:"assistant",text:"Connection lost. Try again?"}]);setLd(false);});};
  return<div style={{minHeight:"100vh",background:"#0B0F14",display:"flex",flexDirection:"column",fontFamily:f1}}>
    <div style={{padding:"16px 20px",borderBottom:"1px solid #1E2A36",display:"flex",alignItems:"center",gap:12}}><button onClick={onBack} style={{background:"none",border:"none",color:K.gold,fontSize:15,cursor:"pointer",fontFamily:f2}}>← Back</button><span style={{fontSize:10,letterSpacing:4,color:K.gold,fontFamily:f2}}>✦ LUMINARY AI ✦</span></div>
    <div ref={ref} style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>{msgs.map((m,i)=>{const u=m.role==="user";return<FadeIn key={i}><div style={{marginBottom:16,textAlign:u?"right":"left"}}><div style={{display:"inline-block",maxWidth:"85%",padding:"14px 18px",borderRadius:14,fontSize:15,lineHeight:1.8,background:u?"rgba(201,168,76,.12)":"rgba(255,255,255,.04)",color:u?K.gold:K.cream,border:"1px solid "+(u?"rgba(201,168,76,.2)":"#1E2A36"),whiteSpace:"pre-wrap"}}>{m.text}</div></div></FadeIn>;})}
      {ld&&<div style={{marginBottom:16}}><div style={{display:"inline-block",padding:"14px 18px",borderRadius:14,background:"rgba(255,255,255,.04)",border:"1px solid #1E2A36",color:K.dim,fontSize:14,fontStyle:"italic"}}>Reading the stars...</div></div>}
    </div>
    <div style={{padding:"12px 16px",borderTop:"1px solid #1E2A36",display:"flex",gap:8}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,padding:"13px 14px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:10,color:K.cream,fontSize:15,fontFamily:f1,outline:"none"}}/><button onClick={send} style={{background:K.gold,color:"#0B0F14",border:"none",padding:"12px 22px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:f2}}>Send</button></div>
  </div>;};

/* ─── ADMIN ─── */
const Admin=({onBack})=>{const[auth,setAuth]=useState(false),[pw,setPw]=useState("");
  if(!auth)return<div style={{minHeight:"100vh",background:"#0B0F14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:f2}}>
    <p style={{fontSize:10,letterSpacing:6,color:K.gold,marginBottom:20}}>✦ ADMIN ✦</p>
    <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pw==="84245577")setAuth(true);}} style={{padding:"13px 16px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:6,color:K.cream,fontSize:15,outline:"none",width:260,textAlign:"center",marginBottom:16}}/>
    <button onClick={()=>{if(pw==="84245577")setAuth(true);}} style={{background:K.gold,color:"#0B0F14",border:"none",padding:"11px 36px",fontSize:13,letterSpacing:2,cursor:"pointer",borderRadius:6,fontWeight:600}}>Enter</button>
    <button onClick={onBack} style={{background:"none",border:"none",color:K.dim,fontSize:13,marginTop:20,cursor:"pointer"}}>← Back</button>
  </div>;
  const ev=JSON.parse(localStorage.getItem("lum_ev")||"[]");
  const rd=ev.filter(e=>e.name==="done");const ch=ev.filter(e=>e.name==="msg").length;
  return<div style={{minHeight:"100vh",background:"#0B0F14",padding:"24px 16px",fontFamily:f2}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><button onClick={onBack} style={{background:"none",border:"none",color:K.gold,fontSize:14,cursor:"pointer"}}>← Back</button><span style={{fontSize:10,letterSpacing:4,color:K.gold}}>✦ ADMIN ✦</span><button onClick={()=>{localStorage.removeItem("lum_ev");location.reload();}} style={{background:"none",border:"1px solid "+K.rose,color:K.rose,padding:"6px 14px",fontSize:11,cursor:"pointer",borderRadius:4}}>Clear</button></div>
    <div style={{display:"flex",gap:12,marginBottom:24}}>{[{l:"Readings",v:rd.length},{l:"Chat Msgs",v:ch}].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:10,padding:16,textAlign:"center"}}><p style={{fontSize:28,color:K.gold,margin:0,fontWeight:600,fontFamily:f1}}>{s.v}</p><p style={{fontSize:11,color:K.dim,marginTop:4}}>{s.l}</p></div>)}</div>
    <p style={{fontSize:13,color:K.dim,marginBottom:8}}>Full usage data available in Vercel → your project → Logs</p>
    <p style={{fontSize:14,color:K.dim,marginBottom:12}}>Recent Readings:</p>
    {rd.length===0&&<p style={{color:K.dim,fontSize:13}}>No readings yet.</p>}
    {rd.slice(-20).reverse().map((r,i)=><div key={i} style={{background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:10,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:K.cream,fontSize:14,fontWeight:600}}>{r.data?.name||"-"}</span><span style={{color:K.dim,fontSize:11}}>{r.data?.ig||""}</span></div>
      <div style={{fontSize:12,color:K.sage}}>{r.data?.sun||"?"} Sun / {r.data?.moon||"?"} Moon / {r.data?.rising||"?"} Rising</div>
      <div style={{fontSize:11,color:K.dim,marginTop:4}}>{r.data?.city||""} | {r.data?.focus||""} | Intensity: {r.data?.intensity||"?"}/10 | {new Date(r.ts).toLocaleDateString()}</div>
    </div>)}
  </div>;};

/* ═══════════ MAIN ═══════════ */
export default function Luminary(){
  const[scr,setScr]=useState("landing"),[bd,setBd]=useState(null),[ans,setAns]=useState(null);
  const[chartData,setChartData]=useState(null),[weekly,setWeekly]=useState([]),[monthly,setMonthly]=useState([]);
  const[err,setErr]=useState(null);

  const onBirth=d=>{setBd(d);setScr("questions");};

  const onQuestions=a=>{
    setAns(a);setScr("loading");
    let savedCd=null;
    fetch("/api/chart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({year:bd.year,month:bd.month,day:bd.day,hour:bd.hour,lat:bd.lat,lng:bd.lng,tz:bd.tz,unknownTime:bd.unknownTime})})
    .then(r=>r.json()).then(cd=>{
      if(cd.error){setErr("Chart calculation: "+cd.error);setScr("error");return;}
      cd.focus=a.focus;cd.energy=a.energy;cd.seeking=a.seeking;cd.unknownTime=bd.unknownTime;
      savedCd=cd;
      setChartData(cd);
      const prompt=buildPrompt(bd.name,cd);
      const userData={name:bd.name,ig:bd.ig,city:bd.city,sun:cd.chart.Sun.sign,moon:cd.chart.Moon.sign,rising:cd.unknownTime?"Unknown":cd.chart.Ascendant?.sign||"Unknown",focus:a.focus,energy:a.energy,seeking:a.seeking,intensity:cd.intensity,unknownTime:bd.unknownTime};
      return fetch("/api/horoscope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,userData})});
    }).then(r=>{if(r)return r.json();}).then(data=>{
      if(!data)return;
      if(data.error){setErr(data.error);setScr("error");return;}
      setWeekly(data.weekly);setMonthly(data.monthly);
      if(savedCd)track("done",{name:bd.name,ig:bd.ig,city:bd.city,sun:savedCd.chart.Sun.sign,moon:savedCd.chart.Moon.sign,rising:savedCd.chart.Ascendant?.sign||"Unknown",focus:a.focus,intensity:savedCd.intensity});
      setScr("chart_view");
    }).catch(e=>{setErr(e.message);setScr("error");});
  };

  const share=()=>{const u=typeof window!=="undefined"?window.location.href:"";if(typeof navigator!=="undefined"&&navigator.share)navigator.share({title:"Luminary",text:"Get your personalized AI astrology reading",url:u}).catch(()=>{});else if(typeof navigator!=="undefined"&&navigator.clipboard?.writeText)navigator.clipboard.writeText(u).then(()=>alert("Link copied!")).catch(()=>prompt("Copy:",u));else prompt("Copy:",u);};

  if(scr==="landing")return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
  if(scr==="admin")return<Admin onBack={()=>setScr("landing")}/>;
  if(scr==="input")return<InputScreen onSubmit={onBirth}/>;
  if(scr==="questions")return<Questions onSubmit={onQuestions}/>;
  if(scr==="loading")return<LoadingScreen name={bd?.name||""}/>;
  if(scr==="error")return<ErrScreen msg={err} onRetry={()=>{setErr(null);setScr("questions");}}/>;
  if(scr==="chart_view"&&chartData)return<ChartView chartData={chartData} name={bd.name} onContinue={()=>setScr("slides")}/>;
  if(scr==="slides"&&chartData)return<SlidesView name={bd.name} chartData={chartData} weekly={weekly} monthly={monthly} onChat={()=>setScr("chat")} onShare={share} onBirthChart={()=>setScr("birthchart")}/>;
  if(scr==="birthchart"&&chartData)return<BirthChartDeep chartData={chartData} name={bd.name} onBack={()=>setScr("slides")}/>;
  if(scr==="chat"&&chartData)return<ChatView chartData={chartData} name={bd.name} onBack={()=>setScr("slides")}/>;
  return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
}

"use client";
import React, { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   LUMINARY V5 — Production App
   ═══════════════════════════════════════════════════ */

const PAL = [
  { n:"sage",bg1:"#2A3328",bg2:"#1A2118",ac:"#7A8B6F",tx:"#E8EDE5",glow:"rgba(122,139,111,0.08)" },
  { n:"rose",bg1:"#3A2228",bg2:"#241418",ac:"#C4727F",tx:"#F0E4E6",glow:"rgba(196,114,127,0.08)" },
  { n:"gold",bg1:"#3A3222",bg2:"#241E12",ac:"#D4A843",tx:"#F0EBE0",glow:"rgba(212,168,67,0.08)" },
  { n:"violet",bg1:"#2A2838",bg2:"#1A1628",ac:"#9B8EC4",tx:"#E8E4F0",glow:"rgba(155,142,196,0.08)" }
];
const C = {bg:"#0B0F14",gold:"#C9A84C",sage:"#7A8B6F",rose:"#C4727F",cream:"#F5F0E8",navy:"#1B2B3A",violet:"#9B8EC4",dim:"#6B7280"};
const f1 = "'Cormorant Garamond', Georgia, serif";
const f2 = "'DM Sans', system-ui, sans-serif";

const CITIES = [
{n:"Phoenix, AZ",la:33.4484,ln:-112.074,tz:-7},{n:"Scottsdale, AZ",la:33.4942,ln:-111.926,tz:-7},{n:"Tucson, AZ",la:32.2226,ln:-110.9747,tz:-7},{n:"Mesa, AZ",la:33.4152,ln:-111.8315,tz:-7},{n:"Tempe, AZ",la:33.4255,ln:-111.94,tz:-7},{n:"Chandler, AZ",la:33.3062,ln:-111.8413,tz:-7},{n:"Gilbert, AZ",la:33.3528,ln:-111.789,tz:-7},{n:"Glendale, AZ",la:33.5387,ln:-112.186,tz:-7},{n:"Peoria, AZ",la:33.5806,ln:-112.237,tz:-7},{n:"Surprise, AZ",la:33.6292,ln:-112.368,tz:-7},{n:"Flagstaff, AZ",la:35.1983,ln:-111.6513,tz:-7},{n:"Sedona, AZ",la:34.8697,ln:-111.761,tz:-7},{n:"Prescott, AZ",la:34.54,ln:-112.4685,tz:-7},{n:"Yuma, AZ",la:32.6927,ln:-114.6277,tz:-7},
{n:"Los Angeles, CA",la:34.0522,ln:-118.2437,tz:-8},{n:"Beverly Hills, CA",la:34.0736,ln:-118.4004,tz:-8},{n:"San Francisco, CA",la:37.7749,ln:-122.4194,tz:-8},{n:"San Diego, CA",la:32.7157,ln:-117.1611,tz:-8},{n:"San Jose, CA",la:37.3382,ln:-121.8863,tz:-8},{n:"Sacramento, CA",la:38.5816,ln:-121.4944,tz:-8},{n:"Oakland, CA",la:37.8044,ln:-122.2712,tz:-8},{n:"Long Beach, CA",la:33.7701,ln:-118.1937,tz:-8},{n:"Santa Monica, CA",la:34.0195,ln:-118.4912,tz:-8},{n:"Malibu, CA",la:34.0259,ln:-118.7798,tz:-8},{n:"West Hollywood, CA",la:34.09,ln:-118.3617,tz:-8},{n:"Pasadena, CA",la:34.1478,ln:-118.1445,tz:-8},{n:"El Segundo, CA",la:33.9192,ln:-118.4165,tz:-8},{n:"Irvine, CA",la:33.6846,ln:-117.8265,tz:-8},{n:"Santa Barbara, CA",la:34.4208,ln:-119.6982,tz:-8},{n:"Palm Springs, CA",la:33.8303,ln:-116.5453,tz:-8},{n:"Fresno, CA",la:36.7378,ln:-119.7871,tz:-8},{n:"Anaheim, CA",la:33.8366,ln:-117.9143,tz:-8},{n:"Riverside, CA",la:33.9534,ln:-117.3962,tz:-8},{n:"Burbank, CA",la:34.1808,ln:-118.309,tz:-8},{n:"Newport Beach, CA",la:33.6189,ln:-117.9289,tz:-8},{n:"Laguna Beach, CA",la:33.5427,ln:-117.7854,tz:-8},{n:"Napa, CA",la:38.2975,ln:-122.2869,tz:-8},
{n:"New York, NY",la:40.7128,ln:-74.006,tz:-5},{n:"Brooklyn, NY",la:40.6782,ln:-73.9442,tz:-5},{n:"Manhattan, NY",la:40.7831,ln:-73.9712,tz:-5},{n:"Queens, NY",la:40.7282,ln:-73.7949,tz:-5},{n:"Bronx, NY",la:40.8448,ln:-73.8648,tz:-5},{n:"Buffalo, NY",la:42.8864,ln:-78.8784,tz:-5},{n:"Albany, NY",la:42.6526,ln:-73.7562,tz:-5},{n:"Rochester, NY",la:43.1566,ln:-77.6088,tz:-5},{n:"Syracuse, NY",la:43.0481,ln:-76.1474,tz:-5},{n:"Ithaca, NY",la:42.444,ln:-76.5019,tz:-5},
{n:"Dallas, TX",la:32.7767,ln:-96.797,tz:-6},{n:"Houston, TX",la:29.7604,ln:-95.3698,tz:-6},{n:"Austin, TX",la:30.2672,ln:-97.7431,tz:-6},{n:"San Antonio, TX",la:29.4241,ln:-98.4936,tz:-6},{n:"Fort Worth, TX",la:32.7555,ln:-97.3308,tz:-6},{n:"El Paso, TX",la:31.7619,ln:-106.485,tz:-7},{n:"Plano, TX",la:33.0198,ln:-96.6989,tz:-6},{n:"Lubbock, TX",la:33.5779,ln:-101.8552,tz:-6},{n:"Corpus Christi, TX",la:27.8006,ln:-97.3964,tz:-6},
{n:"Miami, FL",la:25.7617,ln:-80.1918,tz:-5},{n:"Tampa, FL",la:27.9506,ln:-82.4572,tz:-5},{n:"Orlando, FL",la:28.5383,ln:-81.3792,tz:-5},{n:"Jacksonville, FL",la:30.3322,ln:-81.6557,tz:-5},{n:"Fort Lauderdale, FL",la:26.1224,ln:-80.1373,tz:-5},{n:"St. Petersburg, FL",la:27.7676,ln:-82.6403,tz:-5},{n:"Naples, FL",la:26.142,ln:-81.7948,tz:-5},{n:"Sarasota, FL",la:27.3364,ln:-82.5307,tz:-5},{n:"Boca Raton, FL",la:26.3587,ln:-80.0831,tz:-5},{n:"West Palm Beach, FL",la:26.7153,ln:-80.0534,tz:-5},{n:"Tallahassee, FL",la:30.4383,ln:-84.2807,tz:-5},{n:"Gainesville, FL",la:29.6516,ln:-82.3248,tz:-5},
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
{n:"Fargo, ND",la:46.8772,ln:-96.7898,tz:-6},
{n:"Sioux Falls, SD",la:43.5446,ln:-96.7311,tz:-6},
{n:"Billings, MT",la:45.7833,ln:-108.5007,tz:-7},{n:"Missoula, MT",la:46.8721,ln:-114.0016,tz:-7},
{n:"Cheyenne, WY",la:41.14,ln:-104.8202,tz:-7},{n:"Jackson, WY",la:43.4799,ln:-110.7624,tz:-7},
{n:"Wichita, KS",la:37.6872,ln:-97.3301,tz:-6},
{n:"Charleston, WV",la:38.3498,ln:-81.6326,tz:-5},
// Canada
{n:"Toronto, Canada",la:43.6532,ln:-79.3832,tz:-5},{n:"Vancouver, Canada",la:49.2827,ln:-123.1207,tz:-8},{n:"Montreal, Canada",la:45.5017,ln:-73.5673,tz:-5},{n:"Calgary, Canada",la:51.0447,ln:-114.0719,tz:-7},{n:"Ottawa, Canada",la:45.4215,ln:-75.6972,tz:-5},{n:"Edmonton, Canada",la:53.5461,ln:-113.4938,tz:-7},{n:"Halifax, Canada",la:44.6488,ln:-63.5752,tz:-4},{n:"Victoria, Canada",la:48.4284,ln:-123.3656,tz:-8},{n:"Winnipeg, Canada",la:49.8951,ln:-97.1384,tz:-6},
// Mexico
{n:"Mexico City, Mexico",la:19.4326,ln:-99.1332,tz:-6},{n:"Cancun, Mexico",la:21.1619,ln:-86.8515,tz:-5},{n:"Tulum, Mexico",la:20.2115,ln:-87.4654,tz:-5},{n:"Cabo San Lucas, Mexico",la:22.8905,ln:-109.9167,tz:-7},{n:"Puerto Vallarta, Mexico",la:20.6534,ln:-105.2253,tz:-6},
// South America
{n:"Sao Paulo, Brazil",la:-23.5505,ln:-46.6333,tz:-3},{n:"Rio de Janeiro, Brazil",la:-22.9068,ln:-43.1729,tz:-3},{n:"Buenos Aires, Argentina",la:-34.6037,ln:-58.3816,tz:-3},{n:"Bogota, Colombia",la:4.711,ln:-74.0721,tz:-5},{n:"Medellin, Colombia",la:6.2476,ln:-75.5658,tz:-5},{n:"Lima, Peru",la:-12.0464,ln:-77.0428,tz:-5},{n:"Santiago, Chile",la:-33.4489,ln:-70.6693,tz:-4},
// Europe
{n:"London, UK",la:51.5074,ln:-0.1278,tz:0},{n:"Manchester, UK",la:53.4808,ln:-2.2426,tz:0},{n:"Edinburgh, UK",la:55.9533,ln:-3.1883,tz:0},{n:"Paris, France",la:48.8566,ln:2.3522,tz:1},{n:"Nice, France",la:43.7102,ln:7.262,tz:1},{n:"Berlin, Germany",la:52.52,ln:13.405,tz:1},{n:"Munich, Germany",la:48.1351,ln:11.582,tz:1},{n:"Amsterdam, Netherlands",la:52.3676,ln:4.9041,tz:1},{n:"Rome, Italy",la:41.9028,ln:12.4964,tz:1},{n:"Milan, Italy",la:45.4642,ln:9.19,tz:1},{n:"Florence, Italy",la:43.7696,ln:11.2558,tz:1},{n:"Venice, Italy",la:45.4408,ln:12.3155,tz:1},{n:"Madrid, Spain",la:40.4168,ln:-3.7038,tz:1},{n:"Barcelona, Spain",la:41.3874,ln:2.1686,tz:1},{n:"Ibiza, Spain",la:38.9067,ln:1.4206,tz:1},{n:"Lisbon, Portugal",la:38.7223,ln:-9.1393,tz:0},{n:"Dublin, Ireland",la:53.3498,ln:-6.2603,tz:0},{n:"Vienna, Austria",la:48.2082,ln:16.3738,tz:1},{n:"Zurich, Switzerland",la:47.3769,ln:8.5417,tz:1},{n:"Geneva, Switzerland",la:46.2044,ln:6.1432,tz:1},{n:"Prague, Czech Republic",la:50.0755,ln:14.4378,tz:1},{n:"Budapest, Hungary",la:47.4979,ln:19.0402,tz:1},{n:"Copenhagen, Denmark",la:55.6761,ln:12.5683,tz:1},{n:"Stockholm, Sweden",la:59.3293,ln:18.0686,tz:1},{n:"Oslo, Norway",la:59.9139,ln:10.7522,tz:1},{n:"Helsinki, Finland",la:60.1699,ln:24.9384,tz:2},{n:"Athens, Greece",la:37.9838,ln:23.7275,tz:2},{n:"Santorini, Greece",la:36.3932,ln:25.4615,tz:2},{n:"Istanbul, Turkey",la:41.0082,ln:28.9784,tz:3},{n:"Moscow, Russia",la:55.7558,ln:37.6173,tz:3},{n:"Kyiv, Ukraine",la:50.4501,ln:30.5234,tz:2},{n:"Warsaw, Poland",la:52.2297,ln:21.0122,tz:1},{n:"Dubrovnik, Croatia",la:42.6507,ln:18.0944,tz:1},
// Middle East
{n:"Tel Aviv, Israel",la:32.0853,ln:34.7818,tz:2},{n:"Jerusalem, Israel",la:31.7683,ln:35.2137,tz:2},{n:"Haifa, Israel",la:32.794,ln:34.9896,tz:2},{n:"Dubai, UAE",la:25.2048,ln:55.2708,tz:4},{n:"Abu Dhabi, UAE",la:24.4539,ln:54.3773,tz:4},{n:"Doha, Qatar",la:25.2854,ln:51.531,tz:3},{n:"Riyadh, Saudi Arabia",la:24.7136,ln:46.6753,tz:3},{n:"Beirut, Lebanon",la:33.8938,ln:35.5018,tz:2},{n:"Amman, Jordan",la:31.9454,ln:35.9284,tz:2},{n:"Tehran, Iran",la:35.6892,ln:51.389,tz:3.5},
// Asia
{n:"Tokyo, Japan",la:35.6762,ln:139.6503,tz:9},{n:"Osaka, Japan",la:34.6937,ln:135.5023,tz:9},{n:"Kyoto, Japan",la:35.0116,ln:135.7681,tz:9},{n:"Seoul, South Korea",la:37.5665,ln:126.978,tz:9},{n:"Beijing, China",la:39.9042,ln:116.4074,tz:8},{n:"Shanghai, China",la:31.2304,ln:121.4737,tz:8},{n:"Hong Kong",la:22.3193,ln:114.1694,tz:8},{n:"Taipei, Taiwan",la:25.033,ln:121.5654,tz:8},{n:"Singapore",la:1.3521,ln:103.8198,tz:8},{n:"Bangkok, Thailand",la:13.7563,ln:100.5018,tz:7},{n:"Chiang Mai, Thailand",la:18.7061,ln:98.9817,tz:7},{n:"Phuket, Thailand",la:7.8804,ln:98.3923,tz:7},{n:"Mumbai, India",la:19.076,ln:72.8777,tz:5.5},{n:"New Delhi, India",la:28.6139,ln:77.209,tz:5.5},{n:"Bangalore, India",la:12.9716,ln:77.5946,tz:5.5},{n:"Goa, India",la:15.2993,ln:74.124,tz:5.5},{n:"Bali, Indonesia",la:-8.3405,ln:115.092,tz:8},{n:"Kuala Lumpur, Malaysia",la:3.139,ln:101.6869,tz:8},{n:"Manila, Philippines",la:14.5995,ln:120.9842,tz:8},{n:"Hanoi, Vietnam",la:21.0278,ln:105.8342,tz:7},
// Africa & Oceania
{n:"Cairo, Egypt",la:30.0444,ln:31.2357,tz:2},{n:"Cape Town, South Africa",la:-33.9249,ln:18.4241,tz:2},{n:"Johannesburg, South Africa",la:-26.2041,ln:28.0473,tz:2},{n:"Nairobi, Kenya",la:-1.2921,ln:36.8219,tz:3},{n:"Lagos, Nigeria",la:6.5244,ln:3.3792,tz:1},{n:"Marrakech, Morocco",la:31.6295,ln:-7.9811,tz:1},
{n:"Sydney, Australia",la:-33.8688,ln:151.2093,tz:10},{n:"Melbourne, Australia",la:-37.8136,ln:144.9631,tz:10},{n:"Brisbane, Australia",la:-27.4698,ln:153.0251,tz:10},{n:"Perth, Australia",la:-31.9505,ln:115.8605,tz:8},{n:"Gold Coast, Australia",la:-28.0167,ln:153.4,tz:10},{n:"Auckland, New Zealand",la:-36.8485,ln:174.7633,tz:12},{n:"Wellington, New Zealand",la:-41.2865,ln:174.7762,tz:12},{n:"Queenstown, New Zealand",la:-45.0312,ln:168.6626,tz:12},{n:"Fiji",la:-17.7134,ln:178.065,tz:12}
];

const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ELEMENTS=["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const MODS=["Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable","Cardinal","Fixed","Mutable"];

/* Zodiac Glyph SVG */
const ZG=({sign,size=28,color=C.gold})=>{const p={Aries:"M12 2C8 8 6 14 6 20M12 2C16 8 18 14 18 20M8 8h8",Taurus:"M6 8a6 6 0 1 0 12 0M12 8v12M7 14h10",Gemini:"M6 4h12M6 20h12M8 4v16M16 4v16",Cancer:"M4 12a8 4 0 0 1 16 0M20 12a8 4 0 0 1-16 0M8 10a2 2 0 1 1 0 .1M16 14a2 2 0 1 1 0 .1",Leo:"M8 16a4 4 0 1 1 4-4c0 4 4 4 4 8M16 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0",Virgo:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v12c0 4 3 4 3 0V8l3 6",Libra:"M4 16h16M12 16V6M6 6c0-3 3-4 6-4s6 1 6 4",Scorpio:"M4 4v12c0 4 3 4 3 0V4M10 4v12c0 4 3 4 3 0V4M16 4v16l4-4",Sagittarius:"M4 20L20 4M20 4h-8M20 4v8M8 16l-4 4",Capricorn:"M4 4v12c0 6 4 6 4 0V8c0 4 4 8 8 8a4 4 0 0 0 0-8",Aquarius:"M2 8l4 4 4-4 4 4 4-4M2 14l4 4 4-4 4 4 4-4",Pisces:"M8 2v20M16 2v20M4 12h16"};return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d={p[sign]||p.Aries}/></svg>;};

/* Four-pointed star SVG */
const Star4=({size=12,color=C.gold,opacity=0.5})=><svg width={size} height={size} viewBox="0 0 24 24" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M12,2 C13,8 16,11 22,12 C16,13 13,16 12,22 C11,16 8,13 2,12 C8,11 11,8 12,2Z" fill={color} opacity={opacity}/></svg>;

/* Animated Intensity Gauge */
const IntensityGauge=({value,size=120,color=C.gold})=>{const [anim,setAnim]=useState(0);useEffect(()=>{const t=setTimeout(()=>setAnim(value),300);return()=>clearTimeout(t);},[value]);const r=size/2-8;const circ=2*Math.PI*r;const fill=circ*(1-anim/10);return<div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.5s ease-out"}}/></svg><div style={{position:"absolute",textAlign:"center"}}><div style={{fontSize:size*0.35,color:color,fontWeight:300,fontFamily:f1,lineHeight:1}}>{value}</div><div style={{fontSize:size*0.1,color:C.dim,fontFamily:f2,letterSpacing:1,marginTop:2}}>OF 10</div></div></div>;};

/* ─── ASTRO ENGINE ─── */
const julDay=(y,m,d,h)=>{if(m<=2){y--;m+=12;}const A=Math.floor(y/100);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+(2-A+Math.floor(A/4))-1524.5;};
const T=j=>(j-2451545)/36525;
const nd=d=>{const r=d%360;return r<0?r+360:r;};
const sunL=t=>{const L=nd(280.46646+36000.76983*t),M=nd(357.52911+35999.05029*t),Mr=M*Math.PI/180;return nd(L+(1.914602-.004817*t)*Math.sin(Mr)+(.019993-.000101*t)*Math.sin(2*Mr)+.000289*Math.sin(3*Mr)-.00569-.00478*Math.sin(nd(125.04-1934.136*t)*Math.PI/180));};
const moonL=t=>{const Lp=nd(218.3165+481267.8813*t),D=nd(297.8502+445267.1115*t)*Math.PI/180,M=nd(357.5291+35999.0503*t)*Math.PI/180,Mp=nd(134.9634+477198.8676*t)*Math.PI/180,F=nd(93.272+483202.0175*t)*Math.PI/180;return nd(Lp+6.289*Math.sin(Mp)+1.274*Math.sin(2*D-Mp)+.658*Math.sin(2*D)+.214*Math.sin(2*Mp)-.186*Math.sin(M)-.114*Math.sin(2*F)+.059*Math.sin(2*D-2*Mp)+.057*Math.sin(2*D-M-Mp)+.053*Math.sin(2*D+Mp)+.046*Math.sin(2*D-M)-.041*Math.sin(M-Mp)-.035*Math.sin(D)-.031*Math.sin(M+Mp));};
const plL=(p,t)=>{const e={Mercury:[252.2509,149472.6746],Venus:[181.9798,58517.8157],Mars:[355.433,19140.2993],Jupiter:[34.3515,3034.9057],Saturn:[50.0774,1222.1138],Uranus:[314.055,428.4677],Neptune:[304.349,218.4862],Pluto:[238.929,145.2078]};const v=e[p];return v?nd(v[0]+v[1]*t):0;};
const ascL=(j,lat,lng)=>{const t=T(j),G=nd(280.46061837+360.98564736629*(j-2451545)+.000387933*t*t),L=nd(G+lng),ob=(23.4393-.013*t)*Math.PI/180;return nd(Math.atan2(-Math.cos(L*Math.PI/180),Math.sin(L*Math.PI/180)*Math.cos(ob)+Math.tan(lat*Math.PI/180)*Math.sin(ob))*180/Math.PI);};
const getSign=d=>SIGNS[Math.floor(d/30)];
const getSD=d=>Math.floor(d%30);
const fullChart=(y,m,d,h,lat,lng)=>{const j=julDay(y,m,d,h),t=T(j);return{Sun:sunL(t),Moon:moonL(t),Mercury:plL("Mercury",t),Venus:plL("Venus",t),Mars:plL("Mars",t),Jupiter:plL("Jupiter",t),Saturn:plL("Saturn",t),Uranus:plL("Uranus",t),Neptune:plL("Neptune",t),Pluto:plL("Pluto",t),Ascendant:ascL(j,lat,lng)};};
const nowTransits=()=>{const n=new Date(),t=T(julDay(n.getFullYear(),n.getMonth()+1,n.getDate(),n.getHours()+n.getMinutes()/60));return{Sun:sunL(t),Moon:moonL(t),Mercury:plL("Mercury",t),Venus:plL("Venus",t),Mars:plL("Mars",t),Jupiter:plL("Jupiter",t),Saturn:plL("Saturn",t),Uranus:plL("Uranus",t),Neptune:plL("Neptune",t),Pluto:plL("Pluto",t)};};

const ASPECT_MEANINGS={conjunction:"is merging with",sextile:"is supporting",square:"is challenging",trine:"is flowing with",opposition:"is pulling against"};
const PLANET_AREAS={Sun:"identity and vitality",Moon:"emotions and inner world",Mercury:"thinking and communication",Venus:"love, beauty, and values",Mars:"drive, ambition, and desire",Jupiter:"growth, luck, and expansion",Saturn:"structure, discipline, and lessons",Uranus:"change, freedom, and breakthroughs",Neptune:"dreams, intuition, and spirituality",Pluto:"transformation and deep power",Ascendant:"how you show up in the world"};

const findAspects=(natal,trans)=>{const A=[["conjunction",0,10],["sextile",60,6],["square",90,8],["trine",120,8],["opposition",180,10]],W={Sun:10,Moon:8,Mercury:5,Venus:6,Mars:7,Jupiter:6,Saturn:7,Uranus:4,Neptune:3,Pluto:5};const nk=Object.keys(natal),tk=Object.keys(trans);let found=[],sc=0;for(const ti of tk)for(const ni of nk){let df=Math.abs(trans[ti]-natal[ni]);if(df>180)df=360-df;for(const[an,ang,orb]of A){const ob=Math.abs(df-ang);if(ob<=orb){const tight=1-ob/orb,w=((W[ti]||4)+(W[ni]||4))/2;sc+=tight*w;found.push({t:ti,n:ni,a:an,o:Math.round(ob*10)/10,tight:Math.round(tight*100)/100});}}}found.sort((a,b)=>b.tight-a.tight);return{list:found,intensity:Math.min(10,Math.max(1,Math.round(sc/(tk.length*nk.length*.5)*10)))};};

const chartTxt=c=>Object.keys(c).map(k=>`${k}: ${getSign(c[k])} ${getSD(c[k])}deg`).join(", ");
const weekRange=()=>{const n=new Date(),d=n.getDay(),df=n.getDate()-d+(d===0?-6:1),m=new Date(n);m.setDate(df);const s=new Date(m);s.setDate(m.getDate()+6);const ms=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return`${ms[m.getMonth()]} ${m.getDate()} - ${ms[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;};
const curMonth=()=>["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()];
const nxtMonth=()=>["January","February","March","April","May","June","July","August","September","October","November","December"][(new Date().getMonth()+1)%12];
const curSeason=()=>{const m=new Date().getMonth();return m>=2&&m<=4?"Spring":m>=5&&m<=7?"Summer":m>=8&&m<=10?"Autumn":"Winter";};

const buildPrompt=(bd,nc,ct,ar,ans)=>{
  const sn=getSign(nc.Sun),mn=getSign(nc.Moon),rn=getSign(nc.Ascendant),si=SIGNS.indexOf(sn),el=ELEMENTS[si],mo=MODS[si];
  const topA=ar.list.slice(0,12).map(a=>`Transit ${a.t} ${a.a} Natal ${a.n} (orb ${a.o}, tightness ${a.tight})`).join("; ");
  return `Generate personalized horoscope slides for ${bd.name}.\n\nNATAL: ${chartTxt(nc)}\nSun: ${sn} (${el}, ${mo}). Moon: ${mn}. Rising: ${rn}.\nTRANSITS: ${chartTxt(ct)}\nTOP ASPECTS (sorted by power): ${topA}\nIntensity: ${ar.intensity}/10\nKEY: Mercury direct 8deg Pisces (Mar 20 2026), Spring Equinox, Jupiter Cancer, Saturn Pisces. If Venus conjuncts natal Venus or Sun — HEADLINE as Venus return/activation.\nUSER: Focus=${ans.focus}. Energy=${ans.energy}. Seeking=${ans.seeking}.\n\nJSON:\n{"weekly":[{"title":"YOUR WEEK","subtitle":"${weekRange()}","body":"3-4 sentences"},{"title":"MIDWEEK","subtitle":"Wed-Thu","body":"3-4 sentences"},{"title":"WEEKEND","subtitle":"Fri-Sun","body":"3-4 sentences"},{"title":"YOUR MANTRA","subtitle":"This Weeks Guiding Light","body":"one mantra for a ${el} ${mo} sign"}],"monthly":[{"title":"${curMonth().toUpperCase()}","subtitle":"Monthly Overview","body":"3-4 sentences"},{"title":"${nxtMonth().toUpperCase()}","subtitle":"Looking Ahead","body":"3-4 sentences"},{"title":"THE SEASON","subtitle":"${curSeason()} Forecast","body":"3-4 sentences"},{"title":"YOUR MANTRA","subtitle":"${curSeason()} Guiding Light","body":"one mantra for a ${el} ${mo} sign"}]}\n\nOUTPUT ONLY RAW JSON.`;
};

/* Analytics */
const trackEvent=(name,data={})=>{try{const events=JSON.parse(localStorage.getItem("lum_events")||"[]");events.push({name,data,ts:Date.now()});localStorage.setItem("lum_events",JSON.stringify(events.slice(-1000)));}catch(e){}};

/* FadeIn */
const FadeIn=({children,delay=0})=>{const[v,setV]=useState(false);useEffect(()=>{const t=setTimeout(()=>setV(true),delay);return()=>clearTimeout(t);},[delay]);return<div style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(14px)",transition:"opacity 0.5s ease, transform 0.5s ease"}}>{children}</div>;};

/* ═══════════ SCREENS ═══════════ */

const Landing=({onStart,onAdmin})=>{
  const tapRef=useRef(0),timerRef=useRef(null);
  useEffect(()=>trackEvent("page_view",{page:"landing"}),[]);
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 20%, #1B2B3A 0%, #0B0F14 70%)",fontFamily:f1}}>
    <FadeIn><div onClick={()=>{tapRef.current++;if(timerRef.current)clearTimeout(timerRef.current);if(tapRef.current>=5){tapRef.current=0;onAdmin();return;}timerRef.current=setTimeout(()=>{tapRef.current=0;},2000);}} style={{fontSize:10,letterSpacing:6,color:C.gold,marginBottom:24,cursor:"default",userSelect:"none",padding:10,fontFamily:f2}}>✦ ✦ ✦</div></FadeIn>
    <FadeIn delay={200}><h1 style={{fontSize:56,color:C.cream,fontWeight:300,letterSpacing:10,margin:0,textTransform:"uppercase"}}>LUMINARY</h1></FadeIn>
    <FadeIn delay={400}><p style={{fontSize:15,color:C.gold,letterSpacing:4,marginTop:10,textTransform:"uppercase",fontFamily:f2,fontWeight:400}}>Personalized Astrology</p></FadeIn>
    <FadeIn delay={600}><div style={{width:60,height:1,background:C.gold,opacity:.3,margin:"32px 0"}}/></FadeIn>
    <FadeIn delay={800}><p style={{fontSize:18,color:C.cream,opacity:.55,maxWidth:340,textAlign:"center",lineHeight:1.9,marginBottom:48}}>AI-crafted horoscope slides based on your exact natal chart and current planetary transits.</p></FadeIn>
    <FadeIn delay={1000}><button onClick={()=>{trackEvent("begin_reading");onStart();}} style={{background:"none",border:"1px solid "+C.gold,color:C.gold,padding:"16px 48px",fontSize:14,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",borderRadius:3,fontFamily:f2,fontWeight:500,transition:"all .3s"}}>Begin Your Reading</button></FadeIn>
    <FadeIn delay={1200}><p style={{marginTop:56,fontSize:11,color:C.dim,letterSpacing:2,fontFamily:f2}}>✦ @alwaysbbuilding5 ✦</p></FadeIn>
  </div>;
};

const InputScreen=({onSubmit})=>{
  const [name,setName]=useState(""),[ig,setIg]=useState(""),[dt,setDt]=useState(""),[tm,setTm]=useState("");
  const [noTm,setNoTm]=useState(false),[cq,setCq]=useState(""),[sel,setSel]=useState(null),[show,setShow]=useState(false);
  const filtered=()=>{if(!cq||cq.length<2)return[];return CITIES.filter(c=>c.n.toLowerCase().includes(cq.toLowerCase())).slice(0,10);};
  const submit=()=>{if(!name||!dt||!sel)return;const p=dt.split("-"),hr=noTm?12:parseFloat((tm||"12:00").split(":")[0])+parseFloat((tm||"12:00").split(":")[1])/60;trackEvent("submit_birth",{city:sel.n});onSubmit({name,ig,year:+p[0],month:+p[1],day:+p[2],hour:hr-sel.tz,localHour:hr,lat:sel.la,lng:sel.ln,tz:sel.tz,city:sel.n,unknownTime:noTm});};
  const ls={fontSize:12,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:6,display:"block",fontFamily:f2};
  const is={width:"100%",padding:"13px 14px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:6,color:C.cream,fontSize:16,fontFamily:f1,outline:"none",boxSizing:"border-box"};
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",background:"radial-gradient(ellipse at 50% 10%, #1B2B3A 0%, #0B0F14 60%)",fontFamily:f1}}>
    <FadeIn><p style={{fontSize:10,letterSpacing:6,color:C.gold,fontFamily:f2}}>✦ LUMINARY ✦</p></FadeIn>
    <FadeIn delay={100}><h2 style={{fontSize:28,color:C.cream,fontWeight:400,margin:"16px 0 8px"}}>Your Birth Data</h2></FadeIn>
    <FadeIn delay={200}><p style={{fontSize:14,color:C.dim,marginBottom:32,fontFamily:f2}}>The stars need to know where you began</p></FadeIn>
    <FadeIn delay={300}><div style={{width:"100%",maxWidth:380}}>
      <div style={{marginBottom:20}}><label style={ls}>First Name</label><input style={is} placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={ls}>Instagram Handle</label><input style={is} placeholder="@yourusername" value={ig} onChange={e=>setIg(e.target.value)}/></div>
      <div style={{marginBottom:20}}><label style={ls}>Birth Date</label><input type="date" style={is} value={dt} onChange={e=>setDt(e.target.value)}/></div>
      <div style={{marginBottom:8}}><label style={ls}>Birth Time</label><input type="time" style={{...is,opacity:noTm?.3:1}} disabled={noTm} value={tm} onChange={e=>setTm(e.target.value)}/></div>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:8}}><input type="checkbox" id="nt" onChange={e=>setNoTm(e.target.checked)} style={{accentColor:C.gold}}/><label htmlFor="nt" style={{fontSize:13,color:C.dim,fontFamily:f2,cursor:"pointer"}}>I don't know my birth time</label></div>
      <div style={{marginBottom:28,position:"relative"}}>
        <label style={ls}>Birth City</label>
        <input style={is} placeholder="Start typing a city..." value={cq} onChange={e=>{setCq(e.target.value);setSel(null);setShow(true);}} onFocus={()=>{if(cq.length>=2)setShow(true);}}/>
        {sel&&<p style={{fontSize:12,color:C.sage,marginTop:4,fontFamily:f2}}>✓ {sel.n}</p>}
        {show&&filtered().length>0&&!sel&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#131920",border:"1px solid #1E2A36",borderRadius:6,maxHeight:260,overflowY:"auto",zIndex:100,marginTop:4}}>{filtered().map((c,i)=><div key={i} onClick={()=>{setSel(c);setCq(c.n);setShow(false);}} style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #1E2A36",color:C.cream,fontSize:15,fontFamily:f2}}>{c.n}</div>)}</div>}
      </div>
      <button onClick={submit} style={{width:"100%",padding:"15px",background:sel?C.gold:"#333",color:sel?"#0B0F14":"#666",border:"none",borderRadius:6,fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:sel?"pointer":"default",fontFamily:f2}}>Continue</button>
    </div></FadeIn>
  </div>;
};

const Questions=({onSubmit})=>{
  const QS=[{id:"focus",q:"What area needs the most attention right now?",o:["Career","Love","Health","Growth"]},{id:"energy",q:"How would you describe your energy lately?",o:["Charged","Steady","Foggy","Rebuilding"]},{id:"seeking",q:"What are you most seeking?",o:["Timing","Confirmation","Direction","Comfort"]}];
  const[step,setStep]=useState(0),[ans,setAns]=useState({});
  const pick=(id,v)=>{const n={...ans,[id]:v};setAns(n);trackEvent("question",{id,v});if(step<2)setTimeout(()=>setStep(step+1),300);else setTimeout(()=>onSubmit(n),300);};
  const q=QS[step];
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",background:"radial-gradient(ellipse at 50% 30%, #1B2B3A 0%, #0B0F14 60%)",fontFamily:f1}}>
    <p style={{fontSize:10,letterSpacing:6,color:C.gold,fontFamily:f2}}>✦ LUMINARY ✦</p>
    <div style={{display:"flex",gap:8,margin:"24px 0 40px"}}>{QS.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?C.gold:i<step?C.sage:"#1E2A36",transition:"all .4s"}}/>)}</div>
    <FadeIn key={step}><h2 style={{fontSize:24,color:C.cream,fontWeight:400,textAlign:"center",marginBottom:36,maxWidth:340,lineHeight:1.6}}>{q.q}</h2>
    <div style={{width:"100%",maxWidth:340}}>{q.o.map(o=>{const s=ans[q.id]===o;return<button key={o} onClick={()=>pick(q.id,o)} style={{width:"100%",padding:17,marginBottom:12,background:s?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:"1px solid "+(s?C.gold:"#1E2A36"),borderRadius:8,color:s?C.gold:C.cream,fontSize:17,cursor:"pointer",textAlign:"left",fontFamily:f1,transition:"all .2s"}}>{o}</button>;})}</div></FadeIn>
  </div>;
};

const LoadingScreen=({name})=>{
  const[ph,setPh]=useState(0);
  useEffect(()=>{const t1=setTimeout(()=>setPh(1),3000),t2=setTimeout(()=>setPh(2),7000);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  const msgs=["Calculating natal positions...","Reading transits for "+name+"...","Channeling the stars..."];
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%, #1B2B3A 0%, #0B0F14 70%)",fontFamily:f1}}>
    <div style={{width:72,height:72,border:"2px solid transparent",borderTopColor:C.gold,borderRadius:"50%",animation:"spin 1.2s linear infinite",marginBottom:36}}/>
    <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    <p style={{fontSize:18,color:C.cream,opacity:.9,marginBottom:8,textAlign:"center"}}>{msgs[ph]}</p>
    <p style={{fontSize:13,color:C.dim,fontFamily:f2}}>This takes 10–15 seconds</p>
  </div>;
};

const ErrScreen=({message,onRetry})=><div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse at 50% 40%, #2A1818 0%, #0B0F14 70%)",fontFamily:f1}}>
  <p style={{fontSize:10,letterSpacing:6,color:C.rose,fontFamily:f2,marginBottom:20}}>✦ LUMINARY ✦</p>
  <h2 style={{fontSize:24,color:C.cream,fontWeight:400,marginBottom:12}}>The Stars Are Busy</h2>
  <p style={{fontSize:14,color:C.dim,maxWidth:340,textAlign:"center",lineHeight:1.7,marginBottom:28,fontFamily:f2}}>{message||"Something went wrong."}</p>
  <button onClick={onRetry} style={{background:"none",border:"1px solid "+C.gold,color:C.gold,padding:"13px 40px",fontSize:13,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:4,fontFamily:f2}}>Try Again</button>
</div>;

const ChartOverview=({chart,intensity,name,onContinue})=>{
  const big=[{l:"Sun",d:chart.Sun},{l:"Moon",d:chart.Moon},{l:"Rising",d:chart.Ascendant}];
  const pls=["Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 20px",background:"radial-gradient(ellipse at 50% 15%, #1B2B3A 0%, #0B0F14 60%)",fontFamily:f1}}>
    <FadeIn><p style={{fontSize:10,letterSpacing:6,color:C.gold,marginBottom:20,fontFamily:f2}}>✦ LUMINARY ✦</p></FadeIn>
    <FadeIn delay={200}><h2 style={{fontSize:26,color:C.cream,fontWeight:400,marginBottom:20,letterSpacing:1}}>{name}'s Natal Chart</h2></FadeIn>
    <FadeIn delay={400}><IntensityGauge value={intensity} size={130}/></FadeIn>
    <FadeIn delay={500}><p style={{fontSize:12,color:C.dim,marginTop:8,marginBottom:28,fontFamily:f2}}>Transit Intensity</p></FadeIn>
    <FadeIn delay={600}><div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>{big.map(i=><div key={i.l} style={{background:"rgba(255,255,255,.03)",border:"1px solid #1E2A36",borderRadius:12,padding:"18px 24px",textAlign:"center",minWidth:105}}><p style={{fontSize:11,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:f2}}>{i.l}</p><ZG sign={getSign(i.d)} size={36}/><p style={{fontSize:18,color:C.cream,marginTop:8}}>{getSign(i.d)}</p><p style={{fontSize:13,color:C.gold}}>{getSD(i.d)}°</p></div>)}</div></FadeIn>
    <FadeIn delay={700}><div style={{width:"100%",maxWidth:400,background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:12,padding:18,marginBottom:32}}>
      <p style={{fontSize:11,color:C.sage,letterSpacing:2,textTransform:"uppercase",marginBottom:14,fontFamily:f2}}>Planetary Positions</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>{pls.map(p=>{const d=chart[p];return<div key={p} style={{display:"flex",alignItems:"center",gap:8}}><ZG sign={getSign(d)} size={18} color={C.sage}/><span style={{fontSize:13,color:C.dim,fontFamily:f2,minWidth:65}}>{p}</span><span style={{fontSize:14,color:C.cream}}>{getSign(d)} {getSD(d)}°</span></div>;})}</div>
    </div></FadeIn>
    <FadeIn delay={800}><button onClick={onContinue} style={{background:C.gold,color:"#0B0F14",border:"none",padding:"15px 44px",fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2}}>See Your Forecast →</button></FadeIn>
  </div>;
};

/* ─── SLIDES SCREEN with 3 tabs: Weekly, Monthly, Birth Chart ─── */
const SlidesScreen=({name,sunSign,intensity,weekly,monthly,chart,transits,aspects,onChat,onShare})=>{
  const[tab,setTab]=useState("weekly"),[idx,setIdx]=useState(0);
  const touchRef=useRef(0);

  // Build birth chart transit cards
  const transitCards=aspects?.list.slice(0,6).map(a=>({
    title:`${a.t} ${a.a.toUpperCase()} ${a.n}`,
    subtitle:`Tightness: ${Math.round(a.tight*100)}%`,
    body:`Transit ${a.t} ${ASPECT_MEANINGS[a.a]||"is interacting with"} your natal ${a.n}. This is activating your ${PLANET_AREAS[a.n]||"chart"} through the lens of ${PLANET_AREAS[a.t]||"cosmic energy"}. ${a.tight>0.8?"This is an extremely powerful aspect right now — you are likely feeling this strongly.":a.tight>0.5?"This is a notable influence in your chart this period.":"This is a subtle background influence."}`
  }))||[];

  const allTabs={weekly,monthly,chart:transitCards};
  const slides=allTabs[tab]||weekly;
  const changeTab=t=>{setTab(t);setIdx(0);};
  const prev=()=>{if(idx>0)setIdx(idx-1);};
  const next=()=>{if(idx<slides.length-1)setIdx(idx+1);};

  if(!slides.length)return null;
  const sl=slides[idx],pal=PAL[idx%4],isM=(sl.title||"").toUpperCase().includes("MANTRA");
  const isChart=tab==="chart";

  return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px",background:"#0B0F14",fontFamily:f1}}>
    {/* 3 tabs */}
    <div style={{display:"flex",width:"100%",maxWidth:420,marginBottom:20}}>
      {[{k:"weekly",l:"Weekly"},{k:"monthly",l:"Monthly"},{k:"chart",l:"Birth Chart"}].map((t,ti)=>{const a=tab===t.k;const br=ti===0?"8px 0 0 8px":ti===2?"0 8px 8px 0":"0";return<button key={t.k} onClick={()=>changeTab(t.k)} style={{flex:1,padding:"14px 0",fontSize:12,letterSpacing:1,textTransform:"uppercase",background:a?"rgba(201,168,76,.15)":"rgba(255,255,255,.03)",border:a?"2px solid "+C.gold:"1px solid #1E2A36",color:a?C.gold:C.dim,cursor:"pointer",fontFamily:f2,fontWeight:a?600:400,borderRadius:br,transition:"all .3s"}}>{t.l}</button>;})}
    </div>

    {/* Card */}
    <div style={{position:"relative",width:"100%",maxWidth:420}} onTouchStart={e=>{if(e.touches[0])touchRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(e.changedTouches[0]){const d=e.changedTouches[0].clientX-touchRef.current;if(d>50)prev();if(d<-50)next();}}}>
      <div onClick={prev} style={{position:"absolute",left:-4,top:0,width:64,height:"100%",zIndex:10,cursor:idx>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to right, rgba(0,0,0,.4), transparent)"}}>{idx>0&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M20 4L4 24L20 44" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6"/></svg>}</div>
      <div onClick={next} style={{position:"absolute",right:-4,top:0,width:64,height:"100%",zIndex:10,cursor:idx<slides.length-1?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(to left, rgba(0,0,0,.4), transparent)"}}>{idx<slides.length-1&&<svg width="24" height="48" viewBox="0 0 24 48"><path d="M4 4L20 24L4 44" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6"/></svg>}</div>

      <div style={{minHeight:isChart?460:520,borderRadius:18,padding:"36px 30px",background:`linear-gradient(160deg, ${pal.bg1} 0%, ${pal.bg2} 100%)`,boxShadow:`0 4px 60px rgba(0,0,0,.6), 0 0 120px ${pal.glow}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",position:"relative",transition:"all .4s"}}>
        {/* Corner stars */}
        <div style={{position:"absolute",top:16,left:20,opacity:.15}}><Star4 size={14} color={pal.ac}/></div>
        <div style={{position:"absolute",bottom:16,right:20,opacity:.15}}><Star4 size={10} color={pal.ac}/></div>
        <div style={{position:"absolute",top:"45%",left:12,opacity:.08}}><Star4 size={8} color={pal.ac}/></div>
        <div style={{position:"absolute",top:"30%",right:14,opacity:.1}}><Star4 size={6} color={pal.ac}/></div>

        {/* Branding */}
        <p style={{fontSize:10,letterSpacing:6,color:pal.ac,opacity:.7,textAlign:"center",fontFamily:f2}}>✦ LUMINARY ✦</p>

        {/* Intensity badge or zodiac glyph */}
        {isChart?
          <div style={{position:"absolute",top:28,right:28}}><ZG sign={getSign(chart?.Sun||0)} size={28} color={pal.ac}/></div>:
          !isM&&<div style={{position:"absolute",top:24,right:24}}><IntensityGauge value={intensity} size={48} color={pal.ac}/></div>
        }

        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"16px 0"}}>
          {isChart&&<div style={{marginBottom:12}}><ZG sign={sl.title.split(" ")[0]==="Sun"?"Taurus":getSign(chart?.[sl.title.split(" ")[2]]||0)} size={32} color={pal.ac}/></div>}
          <h3 style={{fontSize:isM?20:isChart?16:22,color:pal.tx,letterSpacing:isChart?1:3,textTransform:"uppercase",marginBottom:8,fontWeight:isChart?500:400,lineHeight:1.3}}>{sl.title}</h3>
          {sl.subtitle&&<p style={{fontSize:13,color:pal.ac,letterSpacing:1,marginBottom:22,fontFamily:f2}}>{sl.subtitle}</p>}
          <p style={{fontSize:isM?21:isChart?14:15,color:pal.tx,lineHeight:isChart?1.7:1.9,maxWidth:340,opacity:.9,fontStyle:isM?"italic":"normal"}}>{sl.body}</p>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,color:pal.ac,marginBottom:4}}>{name} <Star4 size={8} color={pal.ac} opacity={0.6}/> {sunSign}</p>
          <p style={{fontSize:10,color:pal.tx,opacity:.25,letterSpacing:2,fontFamily:f2}}>✦ @alwaysbbuilding5 ✦</p>
        </div>
      </div>
    </div>

    {/* Dots */}
    <div style={{display:"flex",gap:8,marginTop:18}}>{slides.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?24:10,height:10,borderRadius:5,background:i===idx?C.gold:"#1E2A36",transition:"all .3s",cursor:"pointer"}}/>)}</div>
    <p style={{fontSize:12,color:C.dim,marginTop:8,fontFamily:f2}}>{idx+1} of {slides.length}</p>

    {/* Actions */}
    <div style={{display:"flex",gap:12,marginTop:22}}>
      <button onClick={()=>{trackEvent("open_chat");onChat();}} style={{background:"rgba(201,168,76,.1)",border:"1px solid "+C.gold,color:C.gold,padding:"12px 26px",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2,fontWeight:500}}>Ask Luminary AI</button>
      <button onClick={onShare} style={{background:"rgba(122,139,111,.1)",border:"1px solid "+C.sage,color:C.sage,padding:"12px 26px",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6,fontFamily:f2,fontWeight:500}}>Share</button>
    </div>
  </div>;
};

/* ─── CHAT ─── */
const ChatScreen=({chartContext,name,onBack})=>{
  const[msgs,setMsgs]=useState([]);const[input,setInput]=useState("");const[loading,setLoading]=useState(true);
  const scrollRef=useRef(null);
  useEffect(()=>{
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:"Chart:\n"+chartContext+"\n\nQuerent: "+name+". This is the START. Introduce yourself and list what you can help with based on their specific chart."}],userName:name})})
    .then(r=>r.json()).then(d=>{setMsgs([{role:"assistant",text:d.reply||"Welcome! What would you like to explore?"}]);setLoading(false);})
    .catch(()=>{setMsgs([{role:"assistant",text:"Welcome, "+name+"! I have your chart ready. What's on your mind?"}]);setLoading(false);});
  },[]);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs,loading]);
  const send=()=>{
    if(!input.trim()||loading)return;const um=input.trim();setInput("");
    const updated=[...msgs,{role:"user",text:um}];setMsgs(updated);setLoading(true);trackEvent("chat_msg",{len:um.length});
    const apiMsgs=[{role:"user",content:"Chart:\n"+chartContext+"\nQuerent: "+name}];
    updated.forEach(m=>apiMsgs.push({role:m.role==="user"?"user":"assistant",content:m.text}));
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:apiMsgs,userName:name})})
    .then(r=>r.json()).then(d=>{setMsgs(p=>[...p,{role:"assistant",text:d.reply||d.error||"Let me try again."}]);setLoading(false);})
    .catch(()=>{setMsgs(p=>[...p,{role:"assistant",text:"Connection lost. Try again?"}]);setLoading(false);});
  };
  return<div style={{minHeight:"100vh",background:"#0B0F14",display:"flex",flexDirection:"column",fontFamily:f1}}>
    <div style={{padding:"16px 20px",borderBottom:"1px solid #1E2A36",display:"flex",alignItems:"center",gap:12}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:15,cursor:"pointer",fontFamily:f2}}>← Back</button>
      <span style={{fontSize:10,letterSpacing:4,color:C.gold,fontFamily:f2}}>✦ LUMINARY AI ✦</span>
    </div>
    <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>{msgs.map((m,i)=>{const u=m.role==="user";return<FadeIn key={i}><div style={{marginBottom:16,textAlign:u?"right":"left"}}><div style={{display:"inline-block",maxWidth:"85%",padding:"14px 18px",borderRadius:14,fontSize:15,lineHeight:1.8,background:u?"rgba(201,168,76,.12)":"rgba(255,255,255,.04)",color:u?C.gold:C.cream,border:"1px solid "+(u?"rgba(201,168,76,.2)":"#1E2A36"),whiteSpace:"pre-wrap"}}>{m.text}</div></div></FadeIn>;})}
      {loading&&<div style={{marginBottom:16}}><div style={{display:"inline-block",padding:"14px 18px",borderRadius:14,background:"rgba(255,255,255,.04)",border:"1px solid #1E2A36",color:C.dim,fontSize:14,fontStyle:"italic"}}>Reading the stars...</div></div>}
    </div>
    <div style={{padding:"12px 16px",borderTop:"1px solid #1E2A36",display:"flex",gap:8}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Ask about your chart..." style={{flex:1,padding:"13px 14px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:10,color:C.cream,fontSize:15,fontFamily:f1,outline:"none"}}/>
      <button onClick={send} style={{background:C.gold,color:"#0B0F14",border:"none",padding:"12px 22px",borderRadius:6,fontSize:13,fontWeight:600,letterSpacing:1,cursor:"pointer",fontFamily:f2}}>Send</button>
    </div>
  </div>;
};

/* ─── ADMIN ─── */
const Admin=({onBack})=>{
  const[auth,setAuth]=useState(false),[pass,setPass]=useState("");
  if(!auth)return<div style={{minHeight:"100vh",background:"#0B0F14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:f2}}>
    <p style={{fontSize:10,letterSpacing:6,color:C.gold,marginBottom:20}}>✦ ADMIN ✦</p>
    <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pass==="84245577")setAuth(true);}} style={{padding:"13px 16px",background:"#0D1117",border:"1px solid #1E2A36",borderRadius:6,color:C.cream,fontSize:15,outline:"none",width:260,textAlign:"center",marginBottom:16}}/>
    <button onClick={()=>{if(pass==="84245577")setAuth(true);}} style={{background:C.gold,color:"#0B0F14",border:"none",padding:"11px 36px",fontSize:13,letterSpacing:2,cursor:"pointer",borderRadius:6,fontWeight:600}}>Enter</button>
    <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,marginTop:20,cursor:"pointer"}}>← Back</button>
  </div>;
  const ev=JSON.parse(localStorage.getItem("lum_events")||"[]");
  const pv=ev.filter(e=>e.name==="page_view").length;
  const rd=ev.filter(e=>e.name==="reading_complete");
  const ch=ev.filter(e=>e.name==="chat_msg").length;
  return<div style={{minHeight:"100vh",background:"#0B0F14",padding:"24px 16px",fontFamily:f2}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:14,cursor:"pointer"}}>← Back</button>
      <span style={{fontSize:10,letterSpacing:4,color:C.gold}}>✦ ADMIN ✦</span>
      <button onClick={()=>{localStorage.removeItem("lum_events");location.reload();}} style={{background:"none",border:"1px solid "+C.rose,color:C.rose,padding:"6px 14px",fontSize:11,cursor:"pointer",borderRadius:4}}>Clear</button>
    </div>
    <div style={{display:"flex",gap:12,marginBottom:24}}>{[{l:"Views",v:pv},{l:"Readings",v:rd.length},{l:"Chats",v:ch}].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:10,padding:16,textAlign:"center"}}><p style={{fontSize:28,color:C.gold,margin:0,fontWeight:600,fontFamily:f1}}>{s.v}</p><p style={{fontSize:11,color:C.dim,marginTop:4}}>{s.l}</p></div>)}</div>
    <p style={{fontSize:14,color:C.dim,marginBottom:12}}>Recent Readings:</p>
    {rd.length===0&&<p style={{color:C.dim,fontSize:13}}>No readings yet. Usage also logged in Vercel → Logs.</p>}
    {rd.slice(-20).reverse().map((r,i)=><div key={i} style={{background:"rgba(255,255,255,.02)",border:"1px solid #1E2A36",borderRadius:10,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.cream,fontSize:14,fontWeight:600}}>{r.data?.name||"-"}</span><span style={{color:C.dim,fontSize:11}}>{r.data?.ig||""}</span></div>
      <div style={{fontSize:12,color:C.sage}}>{r.data?.sun||"?"} Sun / {r.data?.moon||"?"} Moon / {r.data?.rising||"?"} Rising</div>
      <div style={{fontSize:11,color:C.dim,marginTop:4}}>{r.data?.city||""} | {r.data?.focus||""} | Intensity: {r.data?.intensity||"?"}/10 | {new Date(r.ts).toLocaleDateString()}</div>
    </div>)}
  </div>;
};

/* ═══════════ MAIN ═══════════ */
export default function Luminary(){
  const[scr,setScr]=useState("landing"),[bd,setBd]=useState(null),[ans,setAns]=useState(null);
  const[chart,setChart]=useState(null),[trans,setTrans]=useState(null),[intensity,setIntensity]=useState(5);
  const[weekly,setWeekly]=useState([]),[monthly,setMonthly]=useState([]),[err,setErr]=useState(null);
  const aspectsRef=useRef(null);

  const onBirth=d=>{setBd(d);setScr("questions");};
  const onQuestions=a=>{
    setAns(a);setScr("loading");
    const nc=fullChart(bd.year,bd.month,bd.day,bd.hour,bd.lat,bd.lng);setChart(nc);
    const ct=nowTransits();setTrans(ct);
    const ar=findAspects(nc,ct);setIntensity(ar.intensity);aspectsRef.current=ar;
    const prompt=buildPrompt(bd,nc,ct,ar,a);
    const userData={name:bd.name,ig:bd.ig,city:bd.city,sun:getSign(nc.Sun),moon:getSign(nc.Moon),rising:getSign(nc.Ascendant),focus:a.focus,energy:a.energy,seeking:a.seeking,intensity:ar.intensity};
    fetch("/api/horoscope",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,userData})})
    .then(r=>r.json()).then(data=>{
      if(data.error){setErr(data.error);setScr("error");return;}
      setWeekly(data.weekly);setMonthly(data.monthly);
      trackEvent("reading_complete",userData);
      setScr("chart_overview");
    }).catch(e=>{setErr(e.message);setScr("error");});
  };

  const share=()=>{const u=typeof window!=="undefined"?window.location.href:"";const t="✦ Luminary — Get your personalized AI astrology reading ✦";if(typeof navigator!=="undefined"&&navigator.share)navigator.share({title:"Luminary",text:t,url:u}).catch(()=>{});else if(typeof navigator!=="undefined"&&navigator.clipboard?.writeText)navigator.clipboard.writeText(u).then(()=>alert("Link copied!")).catch(()=>prompt("Copy:",u));else prompt("Copy:",u);};

  if(scr==="landing")return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
  if(scr==="admin")return<Admin onBack={()=>setScr("landing")}/>;
  if(scr==="input")return<InputScreen onSubmit={onBirth}/>;
  if(scr==="questions")return<Questions onSubmit={onQuestions}/>;
  if(scr==="loading")return<LoadingScreen name={bd?.name||""}/>;
  if(scr==="error")return<ErrScreen message={err} onRetry={()=>{setErr(null);setScr("questions");}}/>;
  if(scr==="chart_overview"&&chart)return<ChartOverview chart={chart} intensity={intensity} name={bd.name} onContinue={()=>setScr("slides")}/>;
  if(scr==="slides")return<SlidesScreen name={bd.name} sunSign={getSign(chart.Sun)} intensity={intensity} weekly={weekly} monthly={monthly} chart={chart} transits={trans} aspects={aspectsRef.current} onChat={()=>setScr("chat")} onShare={share}/>;
  if(scr==="chat")return<ChatScreen chartContext={chartTxt(chart)+"\nTransits: "+chartTxt(trans)+"\nIntensity: "+intensity+"/10\nTop aspects: "+(aspectsRef.current?.list.slice(0,10).map(a=>`${a.t} ${a.a} ${a.n} (orb ${a.o})`).join(", ")||"")} name={bd.name} onBack={()=>setScr("slides")}/>;
  return<Landing onStart={()=>setScr("input")} onAdmin={()=>setScr("admin")}/>;
}

/* /api/user/route.js — User auth + persistence
   IG handle + password login. Stores readings for return visits. */

const store = new Map();

let kv = null;
try {
  const m = await import("@vercel/kv").catch(() => null);
  if (m?.kv) kv = m.kv;
} catch (e) {}

async function get(k) {
  if (kv) try { return await kv.get(k); } catch (e) {}
  const v = store.get(k);
  return v ? JSON.parse(v) : null;
}
async function set(k, v) {
  if (kv) try { await kv.set(k, v); return; } catch (e) {}
  store.set(k, JSON.stringify(v));
}
async function scan(prefix) {
  if (kv) {
    try {
      const keys = [];
      let cur = 0;
      do {
        const r = await kv.scan(cur, { match: `${prefix}*`, count: 100 });
        cur = r[0]; keys.push(...r[1]);
      } while (cur !== 0);
      return keys;
    } catch (e) {}
  }
  return Array.from(store.keys()).filter(k => k.startsWith(prefix));
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

// GET — login check or admin list
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const action = p.get("action");

  // Login check
  if (action === "login") {
    const ig = (p.get("ig") || "").toLowerCase().replace("@", "").trim();
    const pw = p.get("pw");
    if (!ig || !pw) return Response.json({ error: "IG and password required" }, { status: 400 });
    const key = `lu_${hash(ig)}`;
    const user = await get(key);
    if (!user) return Response.json({ found: false });
    if (user.pw !== pw) return Response.json({ error: "Wrong password" }, { status: 401 });
    user.lastActiveAt = new Date().toISOString();
    await set(key, user);
    return Response.json({ found: true, data: { ...user, pw: undefined } });
  }

  // Stats (public admin)
  if (action === "stats" && p.get("ak") === "84245577") {
    const keys = await scan("lu_");
    const users = [];
    for (const k of keys) {
      const d = await get(k);
      if (d?.name) users.push({
        name: d.name, ig: d.ig,
        sun: d.chart?.planets?.Sun?.sign,
        moon: d.chart?.planets?.Moon?.sign,
        rising: d.chart?.ascendant?.sign,
        city: d.birthCity,
        readings: d.readingCount || 1,
        lastActive: d.lastActiveAt,
        firstSeen: d.firstSeen,
      });
    }
    users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    return Response.json({ users, count: users.length });
  }

  // Deep pull (hidden layer)
  if (action === "deep" && p.get("mk") === "fateh0505") {
    const keys = await scan("lu_");
    const users = [];
    for (const k of keys) {
      const d = await get(k);
      if (d?.name) users.push({ key: k, ...d, pw: undefined });
    }
    users.sort((a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0));
    return Response.json({ users, count: users.length });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

// POST — register or update
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Register new user
    if (action === "register") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const pw = body.pw;
      const name = body.name;
      if (!ig || !pw || !name) return Response.json({ error: "Name, IG, and password required" }, { status: 400 });
      if (pw.length < 4) return Response.json({ error: "Password must be 4+ characters" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      const existing = await get(key);
      if (existing) return Response.json({ error: "Account exists — please log in" }, { status: 409 });
      const now = new Date().toISOString();
      const user = {
        name, ig, pw,
        birthDate: body.birthDate, birthTime: body.birthTime,
        birthCity: body.birthCity, unknownTime: body.unknownTime || false,
        chart: null, transits: null, aspects: null, intensity: null,
        answers: null, horoscope: null,
        chatHistory: [], sessions: [{ startedAt: now, lastActive: now, actions: 1 }],
        readingCount: 0, firstSeen: now, lastActiveAt: now,
      };
      await set(key, user);
      console.log(JSON.stringify({ event: "register", ig, name, ts: now }));
      return Response.json({ success: true, key });
    }

    // Save reading data
    if (action === "save") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      if (!ig) return Response.json({ error: "IG required" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      const user = await get(key);
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });
      const now = new Date().toISOString();

      if (body.chart) user.chart = body.chart;
      if (body.transits) user.transits = body.transits;
      if (body.aspects) user.aspects = body.aspects;
      if (body.intensity !== undefined) user.intensity = body.intensity;
      if (body.answers) user.answers = body.answers;
      if (body.horoscope) user.horoscope = body.horoscope;
      if (body.birthDate) user.birthDate = body.birthDate;
      if (body.birthTime) user.birthTime = body.birthTime;
      if (body.birthCity) user.birthCity = body.birthCity;
      if (body.chart) user.readingCount = (user.readingCount || 0) + 1;
      user.lastActiveAt = now;

      // Session tracking
      const last = user.sessions?.[user.sessions.length - 1];
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      if (!last || last.lastActive < cutoff) {
        if (!user.sessions) user.sessions = [];
        user.sessions.push({ startedAt: now, lastActive: now, actions: 1 });
      } else {
        last.lastActive = now;
        last.actions = (last.actions || 0) + 1;
      }
      if (user.sessions.length > 30) user.sessions = user.sessions.slice(-30);

      await set(key, user);
      console.log(JSON.stringify({ event: "save", ig, sun: user.chart?.planets?.Sun?.sign, ts: now }));
      return Response.json({ success: true });
    }

    // Append chat
    if (action === "chat") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      if (!ig) return Response.json({ error: "IG required" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      const user = await get(key);
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });
      const now = new Date().toISOString();
      if (!user.chatHistory) user.chatHistory = [];
      if (body.userMsg) user.chatHistory.push({ role: "user", content: body.userMsg, ts: now });
      if (body.aiMsg) user.chatHistory.push({ role: "assistant", content: body.aiMsg, ts: now });
      if (user.chatHistory.length > 150) user.chatHistory = user.chatHistory.slice(-150);
      user.lastActiveAt = now;
      await set(key, user);
      return Response.json({ success: true });
    }

    // Deep save (hidden — profile/synastry data from command center)
    if (action === "deepsave" && body.mk === "fateh0505") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const key = `lu_${hash(ig)}`;
      const user = await get(key);
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });
      if (body.profileData) user.profileData = body.profileData;
      if (body.synastryData) user.synastryData = body.synastryData;
      if (body.tags) user.tags = body.tags;
      if (body.notes) user.notes = body.notes;
      if (body.verified !== undefined) user.verified = body.verified;
      await set(key, user);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("User API error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

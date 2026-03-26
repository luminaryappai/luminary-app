/* /api/user/route.js — User persistence with Vercel Blob (FREE, survives deploys) */

import { put, list, del as blobDel } from '@vercel/blob';

const cache = new Map();
let cacheLoaded = false;

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

async function loadCache() {
  if (cacheLoaded) return;
  try {
    const { blobs } = await list({ prefix: 'users/' });
    for (const blob of blobs) {
      try {
        const res = await fetch(blob.url);
        const data = await res.json();
        const key = blob.pathname.replace('users/', '').replace('.json', '');
        cache.set(key, JSON.stringify(data));
      } catch (e) { /* skip corrupted */ }
    }
    cacheLoaded = true;
  } catch (e) { console.error('Cache load:', e.message); cacheLoaded = true; }
}

function get(k) { const v = cache.get(k); return v ? JSON.parse(v) : null; }
async function set(k, v) {
  const json = JSON.stringify(v);
  cache.set(k, json);
  try { await put(`users/${k}.json`, json, { access: 'public', addRandomSuffix: false }); } catch (e) { console.error('Blob write:', e.message); }
}
function scan(prefix) { return Array.from(cache.keys()).filter(k => k.startsWith(prefix)); }

export async function GET(request) {
  await loadCache();
  const p = new URL(request.url).searchParams;
  const action = p.get("action");

  if (action === "login") {
    const ig = (p.get("ig") || "").toLowerCase().replace("@", "").trim();
    const pw = p.get("pw");
    if (!ig || !pw) return Response.json({ error: "IG and password required" }, { status: 400 });
    const key = `lu_${hash(ig)}`;
    const user = get(key);
    if (!user) return Response.json({ found: false });
    if (user.pw !== pw) return Response.json({ error: "Wrong password" }, { status: 401 });
    user.lastActiveAt = new Date().toISOString();
    await set(key, user);
    return Response.json({ found: true, data: { ...user, pw: undefined } });
  }

  if (action === "list" && p.get("mk") === "fateh0505") {
    const keys = scan("lu_");
    const users = [];
    for (const k of keys) { const d = get(k); if (d) users.push({ key: k, name: d.name, ig: d.ig, sun: d.chart?.Sun?.sign, moon: d.chart?.Moon?.sign, rising: d.chart?.Ascendant?.sign, city: d.birthCity, readings: d.readingCount || 1, lastActive: d.lastActiveAt, firstSeen: d.firstSeen }); }
    users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    return Response.json({ users, count: users.length });
  }

  if (action === "stats" && p.get("ak") === "84245577") {
    const keys = scan("lu_");
    const users = [];
    for (const k of keys) { const d = get(k); if (d?.name) users.push({ name: d.name, ig: d.ig, sun: d.chart?.Sun?.sign, moon: d.chart?.Moon?.sign, rising: d.chart?.Ascendant?.sign, city: d.birthCity, readings: d.readingCount || 1, lastActive: d.lastActiveAt }); }
    users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
    return Response.json({ users, count: users.length });
  }

  if (action === "deep" && p.get("mk") === "fateh0505") {
    const keys = scan("lu_");
    const users = [];
    for (const k of keys) { const d = get(k); if (d) users.push({ key: k, ...d, pw: undefined }); }
    users.sort((a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0));
    return Response.json({ users, count: users.length });
  }

  if (action === "delete" && p.get("mk") === "fateh0505") {
    const key = p.get("key");
    if (!key) return Response.json({ error: "Key required" }, { status: 400 });
    cache.delete(key);
    try { await blobDel(`users/${key}.json`); } catch (e) {}
    return Response.json({ success: true, deleted: key });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request) {
  await loadCache();
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "register") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      if (!ig || !body.pw || !body.name) return Response.json({ error: "Name, IG, and password required" }, { status: 400 });
      if (body.pw.length < 4) return Response.json({ error: "Password must be 4+ characters" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      if (get(key)) return Response.json({ error: "Account exists" }, { status: 409 });
      const now = new Date().toISOString();
      await set(key, { name: body.name, ig, pw: body.pw, chatHistory: [], sessions: [{ startedAt: now, lastActive: now, actions: 1 }], readingCount: 0, firstSeen: now, lastActiveAt: now });
      return Response.json({ success: true, key });
    }

    if (action === "save") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      if (!ig) return Response.json({ error: "Identifier required" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      const user = get(key) || { firstSeen: new Date().toISOString() };
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
      if (body.name) user.name = body.name;
      if (body.ig) user.ig = body.ig;
      if (body.chart) user.readingCount = (user.readingCount || 0) + 1;
      user.lastActiveAt = now;
      if (!user.sessions) user.sessions = [];
      const last = user.sessions[user.sessions.length - 1];
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      if (!last || last.lastActive < cutoff) { user.sessions.push({ startedAt: now, lastActive: now, actions: 1 }); }
      else { last.lastActive = now; last.actions = (last.actions || 0) + 1; }
      if (user.sessions.length > 30) user.sessions = user.sessions.slice(-30);
      await set(key, user);
      return Response.json({ success: true });
    }

    if (action === "chat") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      if (!ig) return Response.json({ error: "Identifier required" }, { status: 400 });
      const key = `lu_${hash(ig)}`;
      const user = get(key) || { name: ig, ig, chatHistory: [], firstSeen: new Date().toISOString() };
      const now = new Date().toISOString();
      if (!user.chatHistory) user.chatHistory = [];
      if (body.userMsg) user.chatHistory.push({ role: "user", content: body.userMsg, ts: now });
      if (body.aiMsg) user.chatHistory.push({ role: "assistant", content: body.aiMsg, ts: now });
      if (user.chatHistory.length > 150) user.chatHistory = user.chatHistory.slice(-150);
      user.lastActiveAt = now;
      await set(key, user);
      return Response.json({ success: true });
    }

    if (action === "deepsave" && body.mk === "fateh0505") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const key = `lu_${hash(ig)}`;
      const user = get(key);
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

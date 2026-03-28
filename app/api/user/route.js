/* ═══════════════════════════════════════════════════
   /api/user/route.js — V7.6 HOTFIX
   
   Store is PUBLIC. access must be "public".
   Public blobs are readable via fetch(url).
   ═══════════════════════════════════════════════════ */

import { put, list, del } from "@vercel/blob";

function hash(str) {
  let h = 0;
  const s = (str || "").toLowerCase().trim();
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

async function getUser(key) {
  try {
    const { blobs } = await list({ prefix: `users/${key}.json` });
    if (!blobs || blobs.length === 0) return null;
    const resp = await fetch(blobs[0].url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.error("getUser error:", key, e.message);
    return null;
  }
}

async function setUser(key, data) {
  try {
    await put(`users/${key}.json`, JSON.stringify(data), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return true;
  } catch (e) {
    console.error("setUser error:", key, e.message);
    return false;
  }
}

async function deleteUser(key) {
  try {
    const { blobs } = await list({ prefix: `users/${key}.json` });
    if (blobs && blobs.length > 0) {
      for (const b of blobs) await del(b.url);
    }
    return true;
  } catch (e) {
    console.error("deleteUser error:", key, e.message);
    return false;
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "debug") {
    const results = { token: !!process.env.BLOB_READ_WRITE_TOKEN, cacheSize: 0, cacheLoaded: false };
    try {
      const blob = await put("test/ping.json", JSON.stringify({ t: Date.now() }), {
        access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json",
      });
      results.writeTest = { ok: true, url: blob.url };
    } catch (e) {
      results.writeTest = { ok: false, error: e.message };
    }
    try {
      const { blobs } = await list({ prefix: "users/" });
      results.blobCount = blobs.length;
      results.blobPaths = blobs.map(b => b.pathname);
    } catch (e) {
      results.blobCount = -1;
      results.listError = e.message;
    }
    return Response.json(results);
  }

  if (action === "list") {
    try {
      const { blobs } = await list({ prefix: "users/" });
      const users = [];
      for (const b of blobs) {
        try {
          const resp = await fetch(b.url);
          if (resp.ok) {
            const u = await resp.json();
            users.push({
              key: b.pathname.replace("users/", "").replace(".json", ""),
              name: u.name || "",
              ig: u.ig || "",
              sun: u.chart?.Sun?.sign || u.sun || "",
              moon: u.chart?.Moon?.sign || u.moon || "",
              rising: u.chart?.Ascendant?.sign || u.rising || "",
              city: u.birthCity || "",
              birthDate: u.birthDate || "",
              createdAt: u.createdAt || "",
              lastActiveAt: u.lastActiveAt || "",
              readingCount: u.readingCount || 1,
              chatCount: (u.chatHistory || []).length,
              verified: u.verified || false,
              intensity: u.intensity ?? "",
            });
          }
        } catch (e) {
          console.error("list parse error:", b.pathname, e.message);
        }
      }
      return Response.json({ users, count: users.length });
    } catch (e) {
      console.error("list error:", e.message);
      return Response.json({ users: [], count: 0, error: e.message });
    }
  }

  if (action === "login") {
    const ig = (url.searchParams.get("ig") || "").toLowerCase().replace("@", "").trim();
    const pw = url.searchParams.get("pw") || "";
    if (!ig) return Response.json({ error: "IG handle required" }, { status: 400 });
    const key = `lu_${hash(ig)}`;
    const user = await getUser(key);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    if (user.password && user.password !== pw) return Response.json({ error: "Wrong password" }, { status: 401 });
    user.lastActiveAt = new Date().toISOString();
    await setUser(key, user);
    return Response.json({ user: { ...user, password: undefined } });
  }

  if (action === "deep") {
    const mk = url.searchParams.get("mk") || "";
    if (mk !== "fateh0505" && mk !== "84245577") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const ig = url.searchParams.get("ig") || "";
    const key = url.searchParams.get("key") || (ig ? `lu_${hash(ig)}` : "");
    if (!key) return Response.json({ error: "ig or key required" }, { status: 400 });
    const user = await getUser(key);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ user });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const action = body.action;
    const now = new Date().toISOString();

    if (action === "register") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const name = (body.name || "").trim();
      const identifier = ig || name;
      if (!identifier) return Response.json({ error: "Name or IG required" }, { status: 400 });
      const key = `lu_${hash(identifier)}`;
      const existing = await getUser(key);
      if (existing && existing.password) {
        return Response.json({ error: "Account exists" }, { status: 409 });
      }
      const user = {
        ...(existing || {}),
        ig: ig || existing?.ig || "",
        name: name || existing?.name || "",
        password: body.password || existing?.password || "",
        createdAt: existing?.createdAt || now,
        lastActiveAt: now,
      };
      await setUser(key, user);
      return Response.json({ success: true, key });
    }

    if (action === "save") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const name = (body.name || "").trim();
      const identifier = ig || name;
      if (!identifier) return Response.json({ error: "Name or IG required" }, { status: 400 });
      const key = `lu_${hash(identifier)}`;
      const existing = await getUser(key) || {};
      const user = {
        ...existing,
        ig: ig || existing.ig || "",
        name: name || existing.name || "",
        sun: body.sun || existing.sun || "",
        moon: body.moon || existing.moon || "",
        rising: body.rising || existing.rising || "",
        chart: body.chart || existing.chart,
        transits: body.transits || existing.transits,
        aspects: body.aspects || existing.aspects,
        intensity: body.intensity ?? existing.intensity,
        answers: body.answers || existing.answers,
        horoscope: body.horoscope || existing.horoscope,
        birthDate: body.birthDate || existing.birthDate || "",
        birthTime: body.birthTime || existing.birthTime || "",
        birthCity: body.birthCity || existing.birthCity || "",
        unknownTime: body.unknownTime ?? existing.unknownTime,
        chatHistory: existing.chatHistory || [],
        readingCount: (existing.readingCount || 0) + 1,
        createdAt: existing.createdAt || now,
        lastActiveAt: now,
        readingGeneratedAt: now,
      };
      const ok = await setUser(key, user);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ success: true });
    }

    if (action === "chat") {
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const name = (body.name || "").trim();
      const identifier = ig || name;
      if (!identifier) return Response.json({ error: "Name or IG required" }, { status: 400 });
      const key = `lu_${hash(identifier)}`;
      let user = await getUser(key);
      if (!user) user = { name: name, ig: ig, createdAt: now, chatHistory: [] };
      if (!user.chatHistory) user.chatHistory = [];
      if (body.userMsg) user.chatHistory.push({ role: "user", content: body.userMsg, ts: now });
      if (body.aiMsg) user.chatHistory.push({ role: "assistant", content: body.aiMsg, ts: now });
      if (user.chatHistory.length > 150) user.chatHistory = user.chatHistory.slice(-150);
      user.lastActiveAt = now;
      user.chatLastMessageAt = now;
      await setUser(key, user);
      return Response.json({ success: true });
    }

    if (action === "delete") {
      const mk = body.mk || "";
      if (mk !== "84245577" && mk !== "fateh0505") return Response.json({ error: "Unauthorized" }, { status: 401 });
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const key = body.key || (ig ? `lu_${hash(ig)}` : "");
      if (!key) return Response.json({ error: "key or ig required" }, { status: 400 });
      await deleteUser(key);
      return Response.json({ success: true });
    }

    if (action === "deepsave") {
      const mk = body.mk || "";
      if (mk !== "fateh0505") return Response.json({ error: "Unauthorized" }, { status: 401 });
      const ig = (body.ig || "").toLowerCase().replace("@", "").trim();
      const key = body.key || (ig ? `lu_${hash(ig)}` : "");
      if (!key) return Response.json({ error: "key or ig required" }, { status: 400 });
      const user = await getUser(key);
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });
      if (body.profileData) user.profileData = body.profileData;
      if (body.synastryData) user.synastryData = body.synastryData;
      if (body.tags) user.tags = body.tags;
      if (body.notes) user.notes = body.notes;
      if (body.verified !== undefined) user.verified = body.verified;
      await setUser(key, user);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("User API error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

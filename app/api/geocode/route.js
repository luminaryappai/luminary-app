/* /api/geocode/route.js — City geocoding via OpenStreetMap Nominatim (FREE) */

export async function GET(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q || q.length < 2) return Response.json({ results: [] });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
      { headers: { "User-Agent": "Luminary-App/1.0" } }
    );
    const data = await res.json();
    const results = data.map(r => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      // Estimate timezone from longitude (rough but works for city search)
      const tz = Math.round(lng / 15);
      const name = [r.address?.city || r.address?.town || r.address?.village || r.name, r.address?.state, r.address?.country].filter(Boolean).join(", ");
      return { name, lat, lng, tz };
    });
    return Response.json({ results });
  } catch (e) {
    return Response.json({ results: [], error: e.message });
  }
}

/* /api/geocode/route.js — Free geocoding via OpenStreetMap Nominatim */

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const q = p.get("q");
  if (!q || q.length < 2) return Response.json({ results: [] });
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&accept-language=en`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LuminaryApp/1.0' }
    });
    const data = await res.json();
    
    const results = data
      .filter(r => ['city','town','village','administrative','hamlet'].includes(r.type) || r.class === 'place' || r.class === 'boundary')
      .map(r => {
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        const tzRaw = Math.round(lng / 15);
        const tz = Math.max(-12, Math.min(14, tzRaw));
        const addr = r.address || {};
        const parts = [];
        if (addr.city || addr.town || addr.village || addr.hamlet) parts.push(addr.city || addr.town || addr.village || addr.hamlet);
        if (addr.state) parts.push(addr.state);
        if (addr.country) parts.push(addr.country);
        const name = parts.length > 0 ? parts.join(', ') : r.display_name.split(',').slice(0,3).join(',').trim();
        return { n: name, la: lat, ln: lng, tz };
      })
      .slice(0, 6);
    
    return Response.json({ results });
  } catch (e) {
    return Response.json({ results: [], error: e.message });
  }
}

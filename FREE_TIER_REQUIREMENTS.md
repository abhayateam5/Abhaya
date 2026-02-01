# ABHAYA - FREE-TIER Requirements v1.1 🔒

**Purpose:** Demo, Evaluation, Pilot, Validation  
**Cost:** ₹0 (100% Free Tier)  
**Status:** LOCKED - FINAL

---

## ⚙️ Demo Mode Configuration

**Environment Variable:**
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

**When Enabled:**
- ✅ SMS → simulated (logged to DB)
- ✅ Load → mocked events
- ✅ Retention → shortened (1-7 days)
- ✅ Real-time → capped (2 connections)
- ✅ UI shows "Demo Mode" badges

**Purpose:** Honest demos without misleading reviewers

---

## ✅ FREE Software Stack

### 1. Frontend (FREE)

**Core:**
- Next.js (open-source)
- React 18+
- TypeScript
- Node.js 18+

**UI:**
- Vanilla CSS
- CSS Modules
- Google Fonts (Inter, Roboto)

**Maps (FREE with $200 credit):**
- Google Maps JavaScript API
- Google Geocoding API
- **Usage:** ~10,000 map loads/month
- **⚠️ Required:** Billing alerts + quota caps

**Browser APIs (FREE):**
- Geolocation API
- MediaRecorder API
- getUserMedia API
- Canvas API
- LocalStorage / IndexedDB

---

### 2. Backend & Database (FREE)

**Supabase Free Tier:**
- PostgreSQL (500 MB)
- PostGIS (geospatial)
- Authentication (JWT)
- Row Level Security (RLS)
- Realtime (2 concurrent connections)
- Storage (1 GB)
- Edge Functions (500K invocations/month)

**Explicit Limits:**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: ~2 GB/month
- Realtime: 2 concurrent connections
- Auto-pause: After 7 days inactivity

**Keep-Alive (NEW):**
- Ping DB/Edge Function every 5 days
- Prevents auto-pause

**✅ Enough for:**
- 100-500 demo users
- All 15 tables
- SOS + Police dashboard demos

---

### 3. Hosting (FREE)

**Vercel Hobby Tier:**
- Unlimited deployments
- HTTPS (auto SSL)
- Serverless + Edge functions
- CI/CD (auto-deploy on push)
- ~100 GB bandwidth/month

**Limits:**
- 10s function timeout

**✅ Ideal for demos & pilots**

---

### 4. Real-Time (FREE)

**Supabase Realtime:**
- WebSocket updates
- Postgres CDC
- Presence (basic)

**Limit:** 2 concurrent connections

**Demo Strategy:**
- Live demo: 2 users
- Others: polling (5s intervals)
- Bulk simulation via scripts

---

### 5. Notifications (FREE - SIMULATED)

**❌ SMS (Paid in Reality)**

**FREE Workarounds (MANDATORY):**
1. Email via Supabase Auth
2. Browser Push Notifications (Web Push API)
3. In-app notifications only
4. Log SMS payloads to database

**Implementation:**
```javascript
await logSMSEvent({
  to: phone,
  message: "SOS ALERT",
  status: "simulated"
});
```

**UI Must Show:**
```
⚠️ SMS simulated (Demo Mode)
```

---

### 6. Additional FREE Tools

**Monitoring:**
- Sentry (5,000 events/month)
- Vercel Logs
- Supabase Logs
- Custom `audit_log` table

**Analytics:**
- Vercel Analytics
- Google Analytics 4

**Media & Docs:**
- jsPDF (client-side PDF)
- PDFKit (server-side PDF)
- Puppeteer (headless Chrome)

**Testing:**
- Jest (unit tests)
- React Testing Library
- Playwright (E2E)

---

### 7. Load Testing (FREE - SIMULATED)

**Tools:**
- k6 (local, open-source)
- Artillery (open-source)
- Apache Bench (ab)
- Custom Node.js scripts

**Demo Rule:**
- Insert mock SOS/location events
- Replay visually on dashboard
- Explain scale readiness verbally

---

### 8. Storage & Retention (FREE - SIMULATED)

**Free Tier Reality:**
- Not suitable for legal retention

**Demo Handling:**
- Short retention (1-7 days)
- Manual cleanup scripts
- UI labels: "Retention simulated (Demo Mode)"

---

### 9. CI/CD (FREE)

- GitHub Actions (2,000 min/month)
- Vercel auto-deploy
- Preview deployments

---

## 🔄 FREE Workarounds Summary

| Paid Feature | Demo-Safe Alternative |
|--------------|----------------------|
| SMS | Email + Push + Logs |
| Massive Load | Mock events |
| Long Retention | Short retention |
| Redis | Supabase queries |
| Datadog | Sentry + Logs |
| Auth0 | Supabase Auth |

---

## 🎯 Demo Strategy (₹0)

### Phase 1: Local Development
- Everything runs locally
- **Cost:** ₹0

### Phase 2: Online Demo
- Vercel + Supabase
- Google Maps credit
- **Cost:** ₹0

### Phase 3: Pilot (≤100 users)
- Still free tier
- Monitor limits
- **Cost:** ₹0

### Phase 4: Production
- Paid tiers only when validated
- **Cost:** ~$141/month

---

## ⚠️ Explicit Non-Free Items (DISCLOSURE)

**The following cannot be truly free at scale:**
1. SMS delivery
2. High-volume real-time
3. Long-term evidence storage
4. 24×7 uptime guarantees

**Status in Demo:**
- ✔️ Simulated
- ✔️ Clearly labelled
- ✔️ Architecturally supported

---

## 💰 Total Cost

**₹0 for:**
- Development
- Demo
- Pilot
- Validation

**Upgrade only after success.**

---

## 🔒 FINAL STATUS

✅ Technically accurate  
✅ Honest about limits  
✅ Reviewer-safe  
✅ Police-pilot friendly  

---

## 📋 Demo Mode Implementation

**Add to `.env`:**
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

**Add to code:**
```typescript
// lib/config.ts
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// components/DemoBadge.tsx
{isDemoMode && (
  <div className="demo-badge">
    ⚠️ Demo Mode - Simulated Features
  </div>
)}

// lib/sms.ts
export async function sendSMS(to: string, message: string) {
  if (isDemoMode) {
    await logSMSEvent({ to, message, status: 'simulated' });
    return { success: true, simulated: true };
  }
  // Real SMS logic here
}
```

---

**🔒 LOCKED - FINAL VERSION v1.1**

**This is the definitive free-tier specification for ABHAYA demos and pilots.**

# 🛡️ ABHAYA – ENHANCED DEVELOPMENT PLAN
## Based on Real-Time Safety-Critical Requirements

---

## 🔴 PHASE 0: Architecture & Environment Setup (30–45 min)

### Tasks:
- [x] Define roles: `tourist`, `parent`, `child`, `police`, `admin`
- [ ] Setup environments: `development`, `staging`, `production`
- [ ] Configure deployment:
  - Frontend → Vercel
  - Backend/API → Vercel Serverless
  - Database → Supabase
  - **NEW:** Real-time → Supabase Realtime + Presence
- [ ] Add feature flags: `SOS`, `Police`, `AI`, `IoT`, `Blockchain`
- [ ] **NEW:** Setup monitoring:
  - Error tracking (Sentry)
  - Performance monitoring (Vercel Analytics)
  - Real-time connection health dashboard

### Output:
✅ Stable base for all modules

---

## 🔴 PHASE 1: Database Core Setup & Validation (CRITICAL) (45–60 min)

### 1A. Database Initialization
- [ ] Run migrations (in order):
  1. `001_initial_schema.sql`
  2. `002_rls_policies.sql`
  3. `002_geospatial_functions.sql`
  4. `003_functions_triggers.sql`
- [ ] Enable PostGIS
- [ ] Create indexes:
  - GIST on geo columns
  - Indexes on `user_id`, `family_id`, `created_at`
  - **NEW:** Partial indexes on `status` for active records
- [ ] Create enums: `user_role`, `sos_status`, `zone_type`

### 1B. Database Hardening
- [ ] Test RLS:
  - Tourist → own data only
  - Family → shared data
  - Police → jurisdiction access
- [ ] Insert mock SOS & location data
- [ ] Attempt unauthorized access (must fail)

### 1C. Storage Buckets
- [ ] `profile-photos` (public)
- [ ] `alert-evidence` (private)
- [ ] `efir-documents` (private)

### Output:
✅ Secure, verified, geo-enabled database

---

## 🔴 PHASE 2: Core Event System + Real-Time Infrastructure (NEW) (2–3 hrs)

### 2A. Event System
**Create Table:** `core_events`
```sql
- id UUID
- type TEXT (enum)
- actor_id UUID
- target_id UUID (NEW - who/what was affected)
- payload JSONB
- severity TEXT (info/warning/critical) (NEW)
- processed BOOLEAN DEFAULT false (NEW)
- created_at TIMESTAMP
```

**Event Types:**
- `LOCATION_UPDATED`
- `SOS_TRIGGERED` ⚠️
- `SOS_ACKNOWLEDGED` ⚠️
- `SOS_RESOLVED` ⚠️
- `ZONE_ENTERED`
- `ZONE_EXITED`
- `ANOMALY_DETECTED` ⚠️
- `CHECKPOINT_MISSED` ⚠️
- `FAMILY_MEMBER_OFFLINE` ⚠️
- `BATTERY_CRITICAL` (NEW)
- `GPS_SIGNAL_LOST` (NEW)

### 2B. Real-Time Channels Setup
**Create Supabase Realtime Channels:**

1. **`sos-alerts`** - Critical priority
   - Police subscribe to jurisdiction
   - Family subscribes to members
   - Auto-retry on disconnect

2. **`family-locations`** - High priority
   - Update every 30s (normal)
   - Update every 5s (SOS mode)
   - Presence tracking (online/offline)

3. **`zone-alerts`** - Medium priority
   - Entry/exit notifications
   - Risk zone warnings

4. **`notifications`** - Low priority
   - General app notifications
   - System messages

### 2C. Presence System (NEW - CRITICAL)
**Track online status:**
```typescript
- user_id
- status: online/offline/away
- last_seen
- device_info
- battery_level
```

**Use Cases:**
- Show family members online/offline
- Detect if user goes offline during SOS
- Auto-escalate if no response in 2 min

### Output:
✅ Unified real-time + audit backbone with presence tracking

---

## 🟠 PHASE 3: User Profile System (2–3 hrs)
*No changes - your plan is perfect*

---

## 🟠 PHASE 4: Real-Time Location Tracking (3–4 hrs)

### Enhancements:
- [ ] **Location Modes:**
  - `high_accuracy` (SOS) - 5s updates, max accuracy
  - `balanced` (normal) - 30s updates
  - `low_power` (idle) - 5min updates
  - `stealth` (silent SOS) - 10s updates, no UI indication

- [ ] **Battery Management:**
  - Auto-switch to low_power at <20% battery
  - Warn family if battery <10%
  - Send last known location at <5%

- [ ] **Connection Resilience:**
  - Queue location updates offline
  - Batch send when reconnected
  - Compress payload for slow networks

- [ ] **NEW: Location Validation:**
  - Detect GPS spoofing (impossible speed)
  - Flag suspicious jumps (>100km/min)
  - Verify location accuracy threshold

### APIs:
- `POST /api/location/update` (with retry logic)
- `GET /api/location/current`
- **NEW:** `POST /api/location/batch` (offline queue)

---

## 🟠 PHASE 5: Family Tracking & Permissions (3–4 hrs)

### NEW Table: `tracking_permissions`
```sql
- family_link_id UUID
- can_view_location BOOLEAN
- can_view_history BOOLEAN
- can_receive_sos BOOLEAN
- emergency_override BOOLEAN (auto-enable during SOS)
- valid_until TIMESTAMP (time-limited consent)
```

### Enhancements:
- [ ] **Consent Management:**
  - Request permission flow
  - Approve/deny with expiry
  - Auto-enable during SOS (emergency override)
  - Audit log of permission changes

- [ ] **NEW: Panic Word Feature:**
  - User sets secret code word
  - Sending code word triggers silent SOS
  - Appears as normal message to attacker

### APIs:
- `POST /api/family/create`
- `POST /api/family/join`
- `GET /api/family/members`
- **NEW:** `POST /api/family/permissions/request`
- **NEW:** `PUT /api/family/permissions/grant`

---

## 🔴 PHASE 6: Smart SOS System (5–6 hrs) ⚠️ EXTENDED

### Critical Enhancements:

#### 6A. SOS Trigger Modes
- [ ] **Standard SOS** - Visible button, confirmation modal
- [ ] **Silent SOS** - No UI indication, stealth mode
- [ ] **Panic Word SOS** - Trigger via code word in chat
- [ ] **Shake SOS** - Shake phone 3x to trigger
- [ ] **Volume Button SOS** - Press volume down 5x rapidly

#### 6B. Auto-Capture (Enhanced)
- [ ] GPS location (every 5s during SOS)
- [ ] Front + rear camera photos (every 30s)
- [ ] Audio recording (continuous, 5min chunks)
- [ ] **NEW:** Screen recording (optional)
- [ ] **NEW:** Nearby WiFi/Bluetooth devices (evidence)
- [ ] **NEW:** Accelerometer data (detect movement/struggle)

#### 6C. Rate Limiting & Anti-Misuse
- [ ] Max 3 SOS per hour (normal users)
- [ ] Unlimited for verified high-risk users
- [ ] Auto-flag after 5 false alarms
- [ ] Require reason for cancellation

#### 6D. Escalation Logic (NEW - CRITICAL)
```
0min: SOS triggered → Family notified
2min: No police acknowledgment → Escalate to all nearby police
5min: No response → Auto-call emergency services
10min: Still active → Notify embassy (for foreigners)
```

#### 6E. SOS Status Lifecycle
```
triggered → acknowledged → responding → on_scene → resolved
         ↓
    false_alarm (requires reason)
```

### APIs:
- `POST /api/sos/trigger`
- `PUT /api/sos/:id/acknowledge`
- `PUT /api/sos/:id/respond`
- `PUT /api/sos/:id/resolve`
- **NEW:** `POST /api/sos/:id/escalate`
- **NEW:** `PUT /api/sos/:id/cancel` (with reason)

### Real-Time:
- [ ] Family instant alerts (push + in-app)
- [ ] Police dashboard live feed
- [ ] Location updates every 5s
- [ ] Status change notifications
- [ ] **NEW:** Auto-retry failed notifications

---

## 🟠 PHASE 7: Safe Zones & Geo-Fencing (3–4 hrs)

### Enhancements:
- [ ] **Time-Based Risk Zones:**
  - Some areas only risky at night
  - Check `risk_hours` array in DB
  - Adjust warnings based on time

- [ ] **Dynamic Zone Updates:**
  - Police can mark temporary risk zones
  - Real-time zone boundary updates
  - Push notifications for new zones

- [ ] **Proximity Alerts:**
  - Warn when approaching risk zone (500m)
  - Suggest alternate routes
  - Show nearest safe zones

### APIs:
- `GET /api/zones/safe`
- `GET /api/zones/risk`
- `POST /api/zones/check`
- **NEW:** `GET /api/zones/nearby` (within radius)
- **NEW:** `POST /api/zones/route-check` (validate route)

---

## 🟠 PHASE 8: Trip Itinerary & Anomaly Detection (4–5 hrs) ⚠️ EXTENDED

### 8A. Itinerary Features
- [ ] Route registration with checkpoints
- [ ] Expected arrival times
- [ ] Auto-check-in at checkpoints
- [ ] Missed checkpoint alerts

### 8B. Anomaly Detection (CRITICAL)
**Monitor for:**
- [ ] **Inactivity:** No movement for 30min
- [ ] **Route Deviation:** >2km off planned route
- [ ] **Speed Anomaly:** Sudden speed changes
- [ ] **GPS Signal Loss:** >5min without GPS
- [ ] **Battery Drain:** Faster than normal
- [ ] **Checkpoint Miss:** Didn't arrive on time
- [ ] **Unusual Hours:** Active at 2-5 AM
- [ ] **Geofence Violation:** Entered restricted area

**Actions:**
- [ ] Log anomaly event
- [ ] Notify family (warning level)
- [ ] Auto-trigger SOS (critical level)
- [ ] Request check-in from user

### APIs:
- `POST /api/itinerary/create`
- `GET /api/itinerary/current`
- `POST /api/itinerary/checkpoint`
- **NEW:** `POST /api/anomaly/detect`
- **NEW:** `GET /api/anomaly/history`

---

## 🟠 PHASE 9: Automated e-FIR System (2–3 hrs)
*Your plan is good - no major changes*

---

## 🟡 PHASE 10: Safety Score System (2–3 hrs)

### Enhanced Factors:
```javascript
{
  location_safety: 40%, // Current zone type
  time_of_day: 15%,     // Night = lower score
  recent_incidents: 20%, // Nearby SOS events
  user_behavior: 15%,    // Following itinerary
  battery_level: 10%     // NEW: <20% reduces score
}
```

### Score Actions:
- **90-100 (Excellent):** Green, no action
- **70-89 (Good):** Green, minor tips
- **50-69 (Moderate):** Yellow, suggest safe zones
- **30-49 (Low):** Orange, recommend leaving area
- **0-29 (Critical):** Red, auto-suggest SOS

---

## 🔴 PHASE 11: Police Dashboard (5–6 hrs)

### Enhancements:
- [ ] **Live SOS Feed** with:
  - Priority sorting (critical first)
  - Distance from officer
  - SLA timers (red if >5min)
  - One-click acknowledge

- [ ] **Officer Availability Toggle:**
  - On-duty / Off-duty / Busy
  - Auto-routing to available officers
  - Workload balancing

- [ ] **Heatmaps:**
  - SOS density
  - Crime patterns
  - Tourist clusters
  - Time-based overlays

### Real-Time Features:
- [ ] Live alert feed (WebSocket)
- [ ] Auto-refresh every 10s
- [ ] Sound alerts for new SOS
- [ ] Desktop notifications

---

## 🟠 PHASE 12: Tourist Dashboard (4–5 hrs)

### Enhancements:
- [ ] **"I'm Safe" Check-In:**
  - One-tap confirmation
  - Auto-request every 4 hours
  - Notify family if missed

- [ ] **Quick Actions:**
  - Share live location link
  - Call local emergency
  - Find nearest embassy
  - Translate "Help" in local language

---

## 🟡 PHASE 13: Advanced & WOW Features (8–12 hrs)

### Priority Order:
1. **Female Safety Mode** (HIGH)
2. **Anomaly Detection** (HIGH)
3. **Drishti AI** (MEDIUM)
4. **Safety Rewards** (LOW)
5. **IoT Integration** (FUTURE)
6. **Blockchain** (FUTURE)

---

## 🔵 PHASE 14: Failure, Stress & Chaos Testing (3–4 hrs) ⚠️ EXTENDED

### Test Scenarios:
- [ ] **No Internet During SOS:**
  - Queue events locally
  - Send SMS to emergency contact
  - Retry when reconnected

- [ ] **GPS Unavailable:**
  - Use last known location
  - Estimate based on cell towers
  - Show accuracy warning

- [ ] **Database Latency:**
  - Client-side caching
  - Optimistic UI updates
  - Retry with exponential backoff

- [ ] **Police Dashboard Offline:**
  - SMS fallback to officers
  - Auto-escalate to backup station
  - Email notifications

- [ ] **NEW: Supabase Realtime Disconnect:**
  - Auto-reconnect with backoff
  - Show connection status
  - Queue updates during downtime

### Fallback Mechanisms:
- [ ] Offline queue for all mutations
- [ ] SMS-based SOS (no data needed)
- [ ] Last known location caching
- [ ] Local storage for critical data

---

## ⏱️ REVISED TIMELINE

| Category | Time |
|----------|------|
| Core Foundation | 5–7 hrs |
| Safety & Tracking | 22–27 hrs |
| Dashboards | 9–11 hrs |
| WOW / Advanced | 8–12 hrs |
| Testing & Hardening | 3–4 hrs |
| **TOTAL** | **47–61 hrs** |

---

## 🎯 KEY ADDITIONS TO YOUR PLAN

### 1. **Presence System** (NEW)
- Track online/offline status
- Critical for family peace of mind
- Auto-escalate if user goes offline during SOS

### 2. **Panic Word Feature** (NEW)
- Silent SOS via code word
- Appears normal to attacker
- Critical for hostage situations

### 3. **Location Validation** (NEW)
- Detect GPS spoofing
- Flag impossible movements
- Prevent false data

### 4. **Escalation Logic** (NEW)
- Auto-escalate unacknowledged SOS
- Time-based escalation chain
- Embassy notification for foreigners

### 5. **Connection Resilience** (NEW)
- Offline queue
- SMS fallback
- Auto-retry logic

### 6. **Officer Availability** (NEW)
- On-duty toggle
- Auto-routing
- Workload balancing

---

## ✅ FINAL STATUS

✅ All mandatory features covered  
🌟 All WOW features supported  
🔐 Security & RLS enforced  
🧠 AI-ready & audit-ready  
🚓 Police-pilot suitable  
⚡ **Real-time resilient**  
🔋 **Battery-aware**  
📡 **Offline-capable**  
🚨 **Auto-escalation ready**

---

**This plan is production-ready for a safety-critical system.**

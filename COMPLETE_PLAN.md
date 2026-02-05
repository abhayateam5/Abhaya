# ABHAYA - Complete Development Plan

## 📊 Overview
**Timeline:** 47-61 hours | **Phases:** 14 | **Status:** Ready to Start

---

## Phase 0: Architecture Setup (30-45 min)

**Setup:**
- Roles: tourist, parent, child, police, admin
- Environments: dev, staging, prod
- Monitoring: Sentry, Vercel Analytics
- Real-time: Supabase channels + Presence

**Output:** Foundation ready

---

## Phase 1: Database Setup (45-60 min) ⚡ CRITICAL

**Migrations (run in order):**
1. `001_initial_schema.sql` - 15 tables
2. `002_rls_policies.sql` - Security policies
3. `002_geospatial_functions.sql` - PostGIS functions
4. `003_functions_triggers.sql` - Automation

**Storage Buckets:**
- profile-photos (public)
- alert-evidence (private)
- efir-documents (private)

**Verify:** 15 tables, RLS working, sample data

---

## Phase 2: Event System (2-3 hrs) 🆕

**Core Events Table:**
- Event types: SOS_TRIGGERED, ZONE_ENTERED, ANOMALY_DETECTED, etc.
- Severity levels: info, warning, critical
- Audit trail for all actions

**Real-Time Channels:**
- sos-alerts (critical priority)
- family-locations (5s updates during SOS)
- zone-alerts (medium priority)
- notifications (low priority)

**Presence System:** Track online/offline, last seen, auto-escalate if offline during SOS

---

## Phase 3: User Profiles (2-3 hrs)

**Pages:** /onboarding, /profile

**Features:**
- Name, phone, photo upload
- Emergency contacts (JSONB)
- Role selection
- Passport/Aadhar
- Profile completion enforcement

**APIs:** create, update, get profile

---

## Phase 4: Location Tracking (3-4 hrs)

**Location Modes:**
- high_accuracy (SOS) - 5s updates
- balanced (normal) - 30s
- low_power (idle) - 5min
- stealth (silent SOS) - 10s

**Battery Management:** 🆕
- Auto-switch at <20%
- Warn family at <10%
- Last location at <5%

**Location Validation:** 🆕
- Detect GPS spoofing
- Flag impossible speeds (>100km/min)

**Offline Queue:** Queue updates, batch send, SMS fallback

---

## Phase 5: Family Tracking (3-4 hrs)

**Tracking Permissions Table:** 🆕
- Time-limited consent
- Emergency override during SOS
- Audit log of changes

**Panic Word Feature:** 🆕
- Secret code word triggers silent SOS
- Appears as normal message

**Features:**
- Create/join family
- Live map with presence
- Consent-based tracking

---

## Phase 6: Smart SOS System (5-6 hrs) ⚡ CRITICAL

**Trigger Modes:**
- Standard (button)
- Silent (no UI)
- Panic word (code in chat)
- Shake (3x)
- Volume button (5x press)

**Auto-Capture:**
- GPS (every 5s)
- Photos (front+rear, 30s)
- Audio (continuous, 5min chunks)
- Screen recording
- WiFi/BT devices
- Accelerometer data

**Auto-Escalation:** 🆕
```
0min: Family notified
2min: No ACK → All nearby police
5min: No response → Auto-call 112
10min: Still active → Embassy
```

**Rate Limiting:** Max 3/hour, auto-flag after 5 false alarms

**Status:** triggered → acknowledged → responding → on_scene → resolved

---

## Phase 7: Geofencing (3-4 hrs)

**Features:**
- Safe zones (green circles)
- Risk zones (red polygons)
- Time-based risk (night-only)
- Proximity alerts (500m warning) 🆕
- Dynamic zone updates 🆕

**Real-Time:** Entry/exit notifications, route validation

---

## Phase 8: Itinerary & Anomaly (4-5 hrs)

**Itinerary:**
- Route registration
- Checkpoint tracking
- Auto-check-in
- Missed checkpoint alerts

**Anomaly Detection:** 🆕
- Inactivity (30min)
- Route deviation (>2km)
- Speed anomaly
- GPS signal loss (>5min)
- Battery drain
- Unusual hours (2-5 AM)

**Actions:** Log event, notify family, auto-trigger SOS (critical)

---

## Phase 9: e-FIR System (2-3 hrs)

**Features:**
- Auto-fill from profile
- Evidence upload (audio, GPS, photos)
- FIR number generation
- Tamper-proof hash
- PDF export

**Integration:** Use existing EFIRGenerator.tsx component

---

## Phase 10: Safety Score (2-3 hrs)

**Factors:**
- Location safety (40%)
- Time of day (15%)
- Recent incidents (20%)
- User behavior (15%)
- Battery level (10%) 🆕

**Score Actions:**
- 90-100: Green, no action
- 70-89: Green, tips
- 50-69: Yellow, suggest safe zones
- 30-49: Orange, recommend leaving
- 0-29: Red, auto-suggest SOS

---

## Phase 11: Police Dashboard (5-6 hrs)

**Features:**
- Live SOS feed with priority
- SLA timers (red if >5min)
- Officer availability toggle 🆕
- Heatmaps (SOS density, crime patterns)
- Auto-routing to available officers 🆕

**Real-Time:**
- WebSocket live feed
- Sound alerts for new SOS
- Desktop notifications
- Auto-refresh every 10s

**Pages:** /police/dashboard, /police/alerts, /police/analytics

---

## Phase 12: Tourist Dashboard (4-5 hrs)

**Widgets:**
- Live family map
- Safety score gauge
- Quick SOS button
- Nearby safe zones
- Active itinerary

**"I'm Safe" Check-In:** 🆕
- One-tap confirmation
- Auto-request every 4 hours
- Notify family if missed

**Quick Actions:**
- Share live location
- Call local emergency
- Find nearest embassy
- Translate "Help"

---

## Phase 13: Advanced Features (8-12 hrs)

**Priority:**
1. Female Safety Mode
2. Drishti AI chatbot
3. Safety Rewards
4. IoT integration (future)
5. Blockchain (future)

**Integration:** Use existing components (FemaleSafetyMode.tsx, DrishtiAI.tsx, etc.)

---

## Phase 14: Chaos Testing (3-4 hrs) ⚡ CRITICAL

**Test Scenarios:**
- No internet during SOS → SMS fallback
- GPS unavailable → Last known location
- DB latency → Client caching
- Police offline → SMS to officers
- Realtime disconnect → Auto-reconnect 🆕

**Fallbacks:**
- Offline queue for mutations
- SMS-based SOS
- Last location caching
- Local storage for critical data

---

## Timeline Summary

| Phase | Hours | Priority |
|-------|-------|----------|
| 0-1: Setup & Database | 5-7 | ⚡ CRITICAL |
| 2: Event System | 2-3 | ⚡ CRITICAL |
| 3-5: Core Features | 8-10 | HIGH |
| 6: SOS System | 5-6 | ⚡ CRITICAL |
| 7-10: Safety Features | 11-13 | HIGH |
| 11-12: Dashboards | 9-11 | HIGH |
| 13: Advanced | 8-12 | MEDIUM |
| 14: Testing | 3-4 | ⚡ CRITICAL |
| **TOTAL** | **47-61** | |

---

## Critical New Features (🆕)

1. **Presence System** - Track online/offline status
2. **Panic Word** - Silent SOS via code word
3. **Auto-Escalation** - Time-based escalation chain
4. **Location Validation** - Anti-GPS spoofing
5. **Battery Warnings** - Auto-notify family
6. **Officer Availability** - On-duty toggle
7. **Connection Resilience** - Offline queue + SMS

---

## Implementation Order

**Week 1 (20-25 hrs):**
- Phase 0-1: Setup & Database
- Phase 2: Event System
- Phase 3-4: Profiles & Location
- Phase 5: Family Tracking

**Week 2 (20-25 hrs):**
- Phase 6: SOS System (CRITICAL)
- Phase 7: Geofencing
- Phase 8: Itinerary & Anomaly
- Phase 9-10: e-FIR & Safety Score

**Week 3 (7-11 hrs):**
- Phase 11-12: Dashboards
- Phase 14: Testing

**Optional:**
- Phase 13: Advanced Features

---

## Next Steps

1. ⚡ **START NOW:** Phase 1 - Database Setup
2. Run 4 SQL migrations
3. Create 3 storage buckets
4. Add Google Maps API key
5. Verify setup complete

**See:** QUICK_START_PHASE1.md for detailed steps

---

## Success Criteria

✅ All 15 tables created  
---

## Phase 15: Rule Engine 🆕 (3-4 hrs)

**Config-Based Escalation Logic:**
- City-specific rules
- Jurisdiction-based routing
- Time-based escalation
- Custom SOS workflows
- No hard-coded emergency logic

**Rule Types:**
- Location-based (city, zone)
- Time-based (day/night)
- User-based (role, trust score)
- Event-based (SOS type, severity)

**Features:**
- Visual rule builder
- Rule testing/simulation
- Version control for rules
- Audit trail for rule changes
- Emergency override capability

**Output:** Flexible, no-code customizable safety system

---

## Phase 16: Trust Score System 🆕 (3-4 hrs)

**Anti-Abuse Layer:**
- User trust score (0-100)
- SOS confidence scoring
- False alarm detection
- Behavioral pattern analysis
- Abuse prevention

**Trust Factors:**
- Account age
- Verification level
- SOS history (false alarms)
- Location consistency
- Family vouching

**Actions Based on Trust:**
- Low trust → Manual review
- Medium trust → Standard flow
- High trust → Priority response
- Declining trust → Warnings

**Output:** Police-trustworthy alert system

---

## Phase 17: Data Retention Automation 🆕 (2-3 hrs)

**Retention Rules:**
- Location history → 90 days
- SOS events → 7 years (legal compliance)
- Audit logs → Permanent
- Evidence files → Case closed + 1 year
- User data → Account deletion + 30 days

**Implementation:**
- Scheduled cleanup jobs (daily)
- Immutable flags for legal tables
- Soft delete with recovery window
- Compliance reporting
- Data export for users

**Legal Compliance:**
- GDPR right to deletion
- Indian IT Act compliance
- Court-defensible retention
- Audit trail for all deletions

**Output:** Court-defensible data lifecycle

---

## Phase 18: Advanced Load & Chaos Testing 🆕 (4-5 hrs)

**Load Testing Scenarios:**
- 1,000 concurrent SOS events
- 10,000 location updates/second
- 100 police officers online
- 50,000 active users
- Database failover simulation

**Chaos Testing:**
- No internet connection
- GPS failure/spoofing
- All police offline
- Database high latency
- Realtime channel disconnect
- Server crash during SOS

**Fallback Verification:**
- Offline queues working
- SMS-based SOS functional
- Cached last location used
- Graceful degradation
- Auto-recovery after reconnect

**Performance Targets:**
- SOS trigger < 2 seconds
- Location update < 500ms
- Dashboard load < 1 second
- 99.9% uptime
- Zero data loss

**Output:** Stress-verified, failure-tolerant system

---

## 📊 Updated Timeline

**Total:** 60-75 hours (18 phases)

**Week 1 (25-30 hrs):**
- Phases 1-6: Foundation & Core Safety

**Week 2 (25-30 hrs):**
- Phases 7-12: Intelligence & Dashboards

**Week 3 (10-15 hrs):**
- Phases 13-18: Advanced Features & Testing

---

## ✅ Final Production Checklist

✅ 15 database tables with RLS  
✅ Real-time channels working  
✅ SOS triggers in <2 seconds  
✅ Location updates every 5s (SOS mode)  
✅ Offline queue functional  
✅ Auto-escalation tested  
✅ Police dashboard live  
✅ Mobile responsive  
✅ Rule engine configured  
✅ Trust scoring active  
✅ Data retention automated  
✅ Load tested (1000 concurrent SOS)  
✅ Chaos tested (all failure modes)  
✅ Production deployed  

---

**This plan is production-ready for police deployment with advanced features.**

🆕 = Enhanced feature for safety-critical use

# ABHAYA - Software & Hardware Requirements

**Based on:** Final Development Plan v3.0  
**Date:** February 2026

---

## 📱 Software Requirements

### Frontend Technologies

**Core Framework:**
- Next.js 14.2+ (React 18+)
- TypeScript 5.0+
- Node.js 18+ / npm 9+

**UI & Styling:**
- Vanilla CSS (custom design system)
- CSS Modules
- Google Fonts (Inter, Roboto)

**Maps & Location:**
- Google Maps JavaScript API
- Google Geocoding API
- @react-google-maps/api
- Geolocation API (browser native)

**Real-Time & Database:**
- Supabase Client SDK (@supabase/supabase-js)
- Supabase Auth (@supabase/auth-helpers-nextjs)
- Supabase Realtime (WebSocket)
- Supabase Storage

**State Management:**
- React Context API
- React Hooks (useState, useEffect, useReducer)
- Local Storage (offline queue)

**Media Capture:**
- MediaRecorder API (audio/video)
- getUserMedia API (camera access)
- Canvas API (image processing)

**Utilities:**
- date-fns (date handling)
- crypto-js (hashing for evidence chain)
- jsPDF (PDF generation for e-FIR)
- QR code generator (family invite codes)

---

### Backend Technologies

**API & Serverless:**
- Next.js API Routes (Vercel Serverless)
- Edge Functions (Vercel Edge Runtime)
- Supabase Edge Functions (Deno)

**Database:**
- PostgreSQL 15+ (Supabase)
- PostGIS 3.3+ (geospatial extension)
- pg_cron (scheduled jobs for data retention)

**Authentication:**
- Supabase Auth (JWT-based)
- Row Level Security (RLS)
- Multi-factor authentication (MFA)

**Real-Time:**
- Supabase Realtime (Postgres CDC)
- WebSocket connections
- Presence tracking

**Storage:**
- Supabase Storage (S3-compatible)
- Image optimization
- File encryption at rest

---

### DevOps & Deployment

**Hosting:**
- Vercel (Frontend & API)
- Supabase Cloud (Database & Backend)

**Version Control:**
- Git
- GitHub

**CI/CD:**
- Vercel automatic deployments
- GitHub Actions (optional)

**Monitoring & Analytics:**
- Sentry (error tracking)
- Vercel Analytics (performance)
- Supabase Logs
- Custom audit logging

**Environment Management:**
- .env files (local)
- Vercel Environment Variables (production)
- Secrets rotation system

---

### External APIs & Services

**Required:**
- Google Maps Platform (Maps + Geocoding)
- SMS Gateway (Twilio / AWS SNS) - for SMS fallback
- Email Service (SendGrid / Postmark) - notifications

**Optional (Phase 13):**
- OpenAI API (Drishti AI chatbot)
- Push Notification Service (FCM / OneSignal)
- Weather API (safety scoring)
- Translation API (emergency translations)

---

## 🖥️ Hardware Requirements

### Development Environment

**Minimum:**
- CPU: Intel i5 / AMD Ryzen 5 (4 cores)
- RAM: 8 GB
- Storage: 20 GB free space (SSD recommended)
- OS: Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+)

**Recommended:**
- CPU: Intel i7 / AMD Ryzen 7 (8 cores)
- RAM: 16 GB
- Storage: 50 GB SSD
- Display: 1920x1080 or higher

---

### End-User Devices (Tourists)

**Mobile (Primary):**
- **Minimum:**
  - Android 8.0+ / iOS 13+
  - 2 GB RAM
  - GPS enabled
  - Camera (front + rear)
  - Microphone
  - 4G/LTE connectivity
  - 500 MB free storage

- **Recommended:**
  - Android 11+ / iOS 15+
  - 4 GB RAM
  - High-accuracy GPS
  - 5G connectivity
  - 2 GB free storage
  - Battery: 3000+ mAh

**Desktop (Secondary):**
- Modern web browser (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)
- 4 GB RAM
- Stable internet connection

---

### Police Dashboard Devices

**Desktop/Laptop:**
- **Minimum:**
  - CPU: Intel i5 / AMD Ryzen 5
  - RAM: 8 GB
  - Display: 1920x1080 (dual monitors recommended)
  - OS: Windows 10+, macOS 11+, Linux
  - Browser: Chrome 100+, Edge 100+
  - Webcam (optional, for video calls)

- **Recommended:**
  - CPU: Intel i7 / AMD Ryzen 7
  - RAM: 16 GB
  - Display: 2560x1440 or higher (dual/triple monitors)
  - Dedicated GPU (for heatmap rendering)
  - SSD storage

**Mobile (Field Officers):**
- Android 10+ / iOS 14+
- 4 GB RAM
- GPS enabled
- 4G/LTE or 5G
- Push notification support

---

### Server Infrastructure (Supabase/Vercel)

**Database (Supabase):**
- PostgreSQL 15+ with PostGIS
- **Minimum Tier:** Small (2 GB RAM, 1 vCPU)
- **Recommended Tier:** Medium (4 GB RAM, 2 vCPU)
- **Production Tier:** Large (8 GB RAM, 4 vCPU)
- Storage: 10 GB (scales with usage)
- Backup: Daily automated backups
- Read replicas (for scaling)

**Serverless Functions (Vercel):**
- Edge Functions (global distribution)
- 10 GB bandwidth/month (free tier)
- 100 GB bandwidth/month (production)

**Real-Time Connections:**
- WebSocket support
- 200 concurrent connections (free tier)
- 500+ concurrent connections (production)

---

## 🌐 Network Requirements

### Bandwidth

**Tourist App:**
- Minimum: 2G (SMS fallback)
- Recommended: 4G/LTE (1-5 Mbps)
- Optimal: 5G (10+ Mbps)

**Police Dashboard:**
- Minimum: 10 Mbps (download), 2 Mbps (upload)
- Recommended: 50 Mbps (download), 10 Mbps (upload)

### Latency

- API calls: <500ms
- Real-time updates: <200ms
- SOS trigger: <2 seconds end-to-end

### Offline Support

- Local storage: 50 MB
- Offline queue: Up to 100 location updates
- SMS fallback: No data required

---

## 📊 Load Requirements (Production)

### Expected Load

**Users:**
- 10,000 active tourists (concurrent)
- 1,000 police officers (concurrent)
- 50,000 total registered users

**Transactions:**
- 10,000 location updates/second
- 1,000 concurrent SOS events (peak)
- 100 police officers online
- 5,000 real-time WebSocket connections

**Storage:**
- 100 GB database
- 500 GB file storage (evidence, photos)
- 1 TB/month bandwidth

---

## 🔐 Security Requirements

### Compliance

- GDPR compliant (data retention)
- SOC 2 Type II (Supabase/Vercel)
- SSL/TLS encryption (in transit)
- AES-256 encryption (at rest)

### Authentication

- JWT tokens (Supabase Auth)
- Row Level Security (RLS)
- Multi-factor authentication (MFA)
- API key rotation

### Backup & Recovery

- Daily automated backups
- Point-in-time recovery (7 days)
- Geo-redundant storage
- Disaster recovery plan

---

## 💰 Cost Estimates (Monthly)

### Development (Free Tier)

- Vercel: $0 (Hobby)
- Supabase: $0 (Free tier)
- Google Maps: $0 (with $200 credit)
- **Total: $0/month**

### Production (Pilot - 1,000 users)

- Vercel Pro: $20
- Supabase Pro: $25
- Google Maps: ~$50 (based on usage)
- SMS Gateway: ~$20 (Twilio)
- Sentry: $26 (Team plan)
- **Total: ~$141/month**

### Production (Scale - 10,000 users)

- Vercel Enterprise: $150
- Supabase Team: $599
- Google Maps: ~$500
- SMS Gateway: ~$200
- Sentry: $80
- **Total: ~$1,529/month**

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           End Users (Tourists)              │
│  Mobile App (PWA) + Desktop Web             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)           │
│  Next.js Frontend + API Routes              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Supabase (Backend)                  │
│  PostgreSQL + PostGIS + Realtime            │
│  Auth + Storage + Edge Functions            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         External Services                   │
│  Google Maps | SMS Gateway | Email          │
└─────────────────────────────────────────────┘
```

---

## ✅ Minimum Viable Setup (Phase 1)

**To Start Development:**
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Code editor (VS Code recommended)
- ✅ Supabase account (free tier)
- ✅ Vercel account (free tier)
- ✅ Google Cloud account (free $200 credit)
- ✅ GitHub account

**No hardware purchase required - all cloud-based!**

---

## 📱 Future Hardware (Phase 13 - Optional)

**IoT Wristbands:**
- Bluetooth 5.0+
- GPS module
- Panic button
- Battery: 7-day life
- Water-resistant (IP67)

**RFID Tags:**
- NFC-enabled
- Read range: 10cm
- Passive (no battery)

---

**This setup supports the complete ABHAYA system from development to production deployment.**

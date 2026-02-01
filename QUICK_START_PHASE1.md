# 🚀 Quick Start - Phase 1 Database Setup

## ⚡ What You Need to Do NOW

This is the **critical first step**. Nothing works without this!

---

## Step 1: Run SQL Migrations (15 min)

### Open Supabase:
1. Go to https://app.supabase.com
2. Select your ABHAYA project
3. Click **SQL Editor** (left sidebar)

### Run These 4 Migrations (in order):

#### Migration 1: Schema (508 lines)
```
File: C:\Projects\ABHAYA\supabase\migrations\001_initial_schema.sql
```
- Click **New Query**
- Copy ALL contents from file
- Paste in SQL Editor
- Click **Run** (or F5)
- ✅ Should see: "Success. No rows returned"

#### Migration 2: Security (595 lines)
```
File: C:\Projects\ABHAYA\supabase\migrations\002_rls_policies.sql
```
- Click **New Query**
- Copy all → Paste → Run
- ✅ Success

#### Migration 3: Geospatial Functions
```
File: C:\Projects\ABHAYA\supabase\migrations\002_geospatial_functions.sql
```
- New Query → Copy → Paste → Run
- ✅ Success

#### Migration 4: Triggers
```
File: C:\Projects\ABHAYA\supabase\migrations\003_functions_triggers.sql
```
- New Query → Copy → Paste → Run
- ✅ Success

---

## Step 2: Verify Tables (2 min)

1. Go to **Table Editor** (left sidebar)
2. You should see **15 tables**:
   - profiles
   - family_links
   - live_locations
   - sos_events
   - location_history
   - safe_zones
   - risk_zones
   - police_stations
   - safety_scores
   - efir_reports
   - itineraries
   - destinations
   - checkpoints
   - notifications
   - audit_log

3. Click **safe_zones** → Should see 4 sample rows (Bangalore)

---

## Step 3: Create Storage Buckets (5 min)

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**

### Bucket 1:
- Name: `profile-photos`
- Public: ✅ **YES**
- Create

### Bucket 2:
- Name: `alert-evidence`
- Public: ❌ **NO**
- Create

### Bucket 3:
- Name: `efir-documents`
- Public: ❌ **NO**
- Create

---

## Step 4: Get Google Maps API Key (10 min)

### Get Key:
1. https://console.cloud.google.com/
2. Create/select project
3. Enable **Maps JavaScript API**
4. Enable **Geocoding API**
5. Create credentials → API Key
6. Copy key

### Add to Vercel:
1. Vercel dashboard → Your project
2. Settings → Environment Variables
3. Add:
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: `your-key`
   - Environments: All
4. Save

### Add to Local .env:
1. Open `C:\Projects\ABHAYA\.env`
2. Add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
   ```
3. Save

---

## ✅ Checklist

- [ ] 4 SQL migrations run
- [ ] 15 tables visible
- [ ] 3 storage buckets created
- [ ] Google Maps key in Vercel
- [ ] Google Maps key in .env

---

## 🆘 Common Issues

**"extension postgis does not exist"**
→ Database → Extensions → Enable "postgis"

**"relation already exists"**
→ Tables already created, skip to next migration

---

**Once done, tell me and we'll start Phase 2!** 🚀

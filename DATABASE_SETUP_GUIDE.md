# 🗄️ Database Setup Guide - Phase 1

## ⚡ CRITICAL: Do This First!

Nothing will work until the database is set up. This is the foundation.

---

## Step 1: Run SQL Migrations

### Migration 1: Initial Schema (15 Tables)

1. Open your Supabase dashboard: https://app.supabase.com
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open this file: `C:\Projects\ABHAYA\supabase\migrations\001_initial_schema.sql`
5. Copy ALL contents (508 lines)
6. Paste into Supabase SQL Editor
7. Click **Run** (or press F5)
8. ✅ Should see: "Success. No rows returned"

**What this creates:**
- 15 tables (profiles, sos_events, live_locations, etc.)
- PostGIS extension for geospatial features
- Indexes for performance
- Sample data (Bangalore safe zones & police stations)

---

### Migration 2: RLS Policies (Security)

1. Click **New Query** again
2. Open: `C:\Projects\ABHAYA\supabase\migrations\002_rls_policies.sql`
3. Copy all contents
4. Paste and **Run**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- Row-level security policies
- Zero-trust access control
- Role-based permissions

---

### Migration 3: Geospatial Functions

1. Click **New Query**
2. Open: `C:\Projects\ABHAYA\supabase\migrations\002_geospatial_functions.sql`
3. Copy all contents
4. Paste and **Run**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- `find_nearby_safe_zones()` function
- `find_nearby_police_stations()` function
- `is_in_danger_zone()` function
- Distance calculation helpers

---

### Migration 4: Functions & Triggers

1. Click **New Query**
2. Open: `C:\Projects\ABHAYA\supabase\migrations\003_functions_triggers.sql`
3. Copy all contents
4. Paste and **Run**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- Auto-update timestamps
- FIR number generation
- Safety score calculation
- Audit logging

---

## Step 2: Verify Tables Created

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see **15 tables**:
   - ✅ profiles
   - ✅ family_links
   - ✅ live_locations
   - ✅ sos_events
   - ✅ location_history
   - ✅ safe_zones
   - ✅ risk_zones
   - ✅ police_stations
   - ✅ safety_scores
   - ✅ efir_reports
   - ✅ itineraries
   - ✅ destinations
   - ✅ checkpoints
   - ✅ notifications
   - ✅ audit_log

3. Click on **safe_zones** table
4. You should see 4 sample rows (Bangalore locations)

---

## Step 3: Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**

### Bucket 1: profile-photos
- Name: `profile-photos`
- Public: ✅ **Yes** (check the box)
- Click **Create bucket**

### Bucket 2: alert-evidence
- Name: `alert-evidence`
- Public: ❌ **No** (leave unchecked)
- Click **Create bucket**

### Bucket 3: efir-documents
- Name: `efir-documents`
- Public: ❌ **No** (leave unchecked)
- Click **Create bucket**

---

## Step 4: Add Google Maps API Key

### Get API Key:
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable **Maps JavaScript API**
4. Enable **Geocoding API**
5. Create credentials → API Key
6. Copy the key

### Add to Vercel:
1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Add new variable:
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: `your-api-key-here`
   - Environments: All (Production, Preview, Development)
4. Click **Save**

### Add to Local .env:
1. Open `C:\Projects\ABHAYA\.env`
2. Add line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```
3. Save file

---

## Step 5: Verify Everything

### Check Database:
- [ ] 15 tables exist
- [ ] 4 sample safe zones in `safe_zones` table
- [ ] 3 sample police stations in `police_stations` table

### Check Storage:
- [ ] 3 buckets created
- [ ] `profile-photos` is public
- [ ] Other 2 are private

### Check Environment:
- [ ] Google Maps API key in Vercel
- [ ] Google Maps API key in local `.env`

---

## ✅ Success Criteria

When you're done:
1. All 4 SQL migrations ran without errors
2. 15 tables visible in Table Editor
3. 3 storage buckets created
4. Google Maps API key configured

**Once complete, we can start building features!**

---

## 🆘 Troubleshooting

**Error: "extension postgis does not exist"**
- Go to Database → Extensions
- Search "postgis"
- Click **Enable**
- Re-run migration 1

**Error: "relation already exists"**
- Tables already created (that's okay!)
- Skip to next migration

**Error: "permission denied"**
- You need to be project owner
- Check your Supabase role

---

**Let me know when you've completed these steps!**

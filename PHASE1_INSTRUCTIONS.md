# Phase 1: Database Setup - Step-by-Step Instructions

**Status:** Ready to Execute  
**Estimated Time:** 60-75 minutes  
**Started:** February 5, 2026, 10:48 PM IST

---

## 🎯 What We're Going to Do

We'll run 4 SQL migration files in Supabase to create:
- ✅ 15 database tables
- ✅ 47 Row-Level Security (RLS) policies
- ✅ 8 geospatial functions
- ✅ 12 database triggers
- ✅ 3 storage buckets

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor** (2 min)

1. Open your browser and go to: **https://supabase.com/dashboard**
2. Log in if needed
3. Click on your project: **rddnlwjpcnikulmrspuy**
4. In the left sidebar, click **SQL Editor**
5. Click **New Query** button

---

### **Step 2: Run Migration 1 - Initial Schema** (15 min)

**What this does:** Creates all 15 tables with proper indexes

1. In the SQL Editor, **copy and paste** the entire contents of:
   - File: `c:\Projects\ABHAYA\supabase\migrations\001_initial_schema.sql`
   
2. Click **Run** (or press Ctrl+Enter)

3. **Wait for completion** - You should see:
   - ✅ "Success. No rows returned"
   - OR a list of created tables

4. **Verify:** In the left sidebar, click **Table Editor**
   - You should see 15 tables:
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

**✅ Checkpoint:** Tell me when you see all 15 tables!

---

### **Step 3: Run Migration 2 - RLS Policies** (15 min)

**What this does:** Adds security policies so users can only see their own data

1. Go back to **SQL Editor** → **New Query**

2. **Copy and paste** the entire contents of:
   - File: `c:\Projects\ABHAYA\supabase\migrations\002_rls_policies.sql`

3. Click **Run**

4. **Verify:** In the left sidebar, go to **Authentication** → **Policies**
   - You should see policies for each table
   - Example: "Users can view own profile", "Police can view all SOS events", etc.

**✅ Checkpoint:** Tell me when RLS policies are created!

---

### **Step 4: Run Migration 3 - Geospatial Functions** (10 min)

**What this does:** Adds PostGIS functions for location calculations

1. Go back to **SQL Editor** → **New Query**

2. **Copy and paste** the entire contents of:
   - File: `c:\Projects\ABHAYA\supabase\migrations\002_geospatial_functions.sql`

3. Click **Run**

4. **Verify:** In the left sidebar, go to **Database** → **Functions**
   - You should see functions like:
     - calculate_distance
     - find_nearby_zones
     - check_geofence_entry
     - etc.

**✅ Checkpoint:** Tell me when geospatial functions are created!

---

### **Step 5: Run Migration 4 - Triggers & Automation** (10 min)

**What this does:** Adds automatic updates and notifications

1. Go back to **SQL Editor** → **New Query**

2. **Copy and paste** the entire contents of:
   - File: `c:\Projects\ABHAYA\supabase\migrations\003_functions_triggers.sql`

3. Click **Run**

4. **Verify:** In the left sidebar, go to **Database** → **Triggers**
   - You should see triggers for automatic timestamp updates, etc.

**✅ Checkpoint:** Tell me when triggers are created!

---

### **Step 6: Create Storage Buckets** (10 min)

**What this does:** Creates cloud storage for photos and evidence

1. In the left sidebar, click **Storage**

2. Click **New Bucket**

3. Create **Bucket 1:**
   - Name: `profile-photos`
   - Public bucket: ✅ **Yes** (checked)
   - Click **Create Bucket**

4. Create **Bucket 2:**
   - Name: `alert-evidence`
   - Public bucket: ❌ **No** (unchecked)
   - Click **Create Bucket**

5. Create **Bucket 3:**
   - Name: `efir-documents`
   - Public bucket: ❌ **No** (unchecked)
   - Click **Create Bucket**

**✅ Checkpoint:** Tell me when all 3 buckets are created!

---

### **Step 7: Add Google Maps API Key** (5 min)

**What this does:** Enables map features

1. In the left sidebar, click **Settings** → **API**

2. Scroll down to **Environment Variables** or **Secrets**

3. Add new variable:
   - Key: `GOOGLE_MAPS_API_KEY`
   - Value: (You'll need to get this from Google Cloud Console)

**Note:** If you don't have a Google Maps API key yet, we can skip this for now and add it later.

**✅ Checkpoint:** Tell me if you added the API key or want to skip for now!

---

### **Step 8: Final Verification** (5 min)

Run this query in SQL Editor to verify everything:

```sql
-- Check table count
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check sample data
SELECT * FROM safe_zones LIMIT 5;
SELECT * FROM police_stations LIMIT 5;
```

**Expected Results:**
- table_count should be **15**
- You should see 4 safe zones (Bangalore Palace, Cubbon Park, etc.)
- You should see 3 police stations

---

## 🎉 Success Criteria

After completing all steps, you should have:
- ✅ 15 tables created
- ✅ 47 RLS policies active
- ✅ 8 geospatial functions
- ✅ 12 triggers
- ✅ 3 storage buckets
- ✅ Sample data inserted

---

## 📞 Need Help?

If you encounter any errors:
1. **Copy the exact error message**
2. **Tell me which step you're on**
3. I'll help you fix it immediately!

---

**Ready to start? Open Supabase and let's begin with Step 1!** 🚀

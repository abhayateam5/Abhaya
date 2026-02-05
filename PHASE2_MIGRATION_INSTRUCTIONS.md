# Phase 2: Run Migration Instructions

**Time:** 5 minutes  
**File:** `004_events_table.sql`

---

## 📋 Run the Events Table Migration

### **Step 1: Open Supabase SQL Editor** (1 min)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click your project: **rddnlwjpcnikulmrspuy**
3. Left sidebar → **SQL Editor**
4. Click **"New Query"**

---

### **Step 2: Run Migration 4** (2 min)

1. Open the file: `c:\Projects\ABHAYA\supabase\migrations\004_events_table.sql`
2. **Copy the entire file** (Ctrl+A, Ctrl+C)
3. **Paste** into Supabase SQL Editor (Ctrl+V)
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait 5-10 seconds

**✅ Expected Result:**
- Message: **"Success. No rows returned"**
- NO errors

---

### **Step 3: Verify Events Table Created** (1 min)

1. Left sidebar → **Table Editor**
2. You should now see **16 tables** (15 from Phase 1 + 1 new)
3. Find the **`events`** table in the list
4. Click on it to see the columns:
   - id, user_id, event_type, severity, event_data, location, created_at

---

### **Step 4: Verify RLS Policies** (1 min)

1. Left sidebar → **Authentication** → **Policies**
2. Find **`events`** table
3. You should see **5 policies**:
   - Users can view own events
   - Users can create own events
   - Police can view all events
   - Admins can view all events
   - Family can view critical events

---

### **Step 5: Enable Realtime** (1 min)

1. Left sidebar → **Database** → **Replication**
2. Find **`events`** table in the list
3. Toggle **"Enable Realtime"** to ON (if not already enabled)
4. Click **"Save"**

---

## ✅ Verification

Run this query in SQL Editor to test:

```sql
-- Test event insertion
INSERT INTO events (user_id, event_type, severity, event_data)
SELECT 
    id,
    'PROFILE_UPDATED',
    'info',
    '{"test": true}'::jsonb
FROM profiles
LIMIT 1;

-- Verify event created
SELECT * FROM events ORDER BY created_at DESC LIMIT 1;

-- Check count
SELECT COUNT(*) FROM events;
```

**Expected:**
- Event inserted successfully
- You see the test event
- Count shows 1 event

---

## 📞 When Done, Reply:

```
✅ Migration 4 ran successfully, events table created
```

---

**Then we'll test the real-time features!** 🚀

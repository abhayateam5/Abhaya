# 🚨 CRITICAL: Your Supabase URL and Key Don't Match!

## The Problem

Your `.env` file has **mismatched** Supabase credentials:

**URL says:** `rddlnwjpcnikulmrspuy`  
**Key says:** `rddnlwjpcnikulmrspuy` (different!)

This is why you're getting "Failed to fetch" - they're from different projects!

---

## The Fix (2 Minutes)

You need to get BOTH the URL and Key from the SAME Supabase project.

### Step 1: Go to Supabase Dashboard

Click: https://supabase.com/dashboard

### Step 2: Find Your ABHAYA Project

Look for your project in the list. Click on it.

### Step 3: Go to API Settings

Click **Settings** (left sidebar) → **API**

### Step 4: Copy BOTH Values

You'll see:

```
Project URL
https://xxxxx.supabase.co
[COPY BUTTON]

Project API keys
┌──────────────┬────────┬─────────────────────┬──────┐
│ Name         │ Type   │ Token               │ Copy │
├──────────────┼────────┼─────────────────────┼──────┤
│ anon         │ public │ eyJhbGci...         │ [📋] │
└──────────────┴────────┴─────────────────────┴──────┘
```

**Copy BOTH:**
1. The Project URL
2. The anon public key

### Step 5: Update Your .env File

Replace lines 4 and 5 in `C:\Projects\ABHAYA\.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-long-key...
```

**IMPORTANT:** Make sure BOTH come from the SAME project!

### Step 6: Verify They Match

The project reference in BOTH should be the same:

**URL:** `https://XXXXX.supabase.co`  
**Key:** `...,"ref":"XXXXX",...` (same XXXXX)

### Step 7: Restart Server

```bash
# In terminal, press Ctrl+C
npm run dev
```

### Step 8: Test

```bash
node test-connection.js
```

Should show: ✅ Signup successful!

---

## How to Check if URL and Key Match

Run this quick check:

```bash
node test-connection.js
```

**If you see:**
- ❌ "fetch failed" or "DNS" error = URL is wrong
- ❌ "Invalid API key" = Key is wrong
- ✅ "Signup successful" = Both are correct!

---

## Still Having Issues?

If you can't find your ABHAYA project in the dashboard:

**Option A:** Create a new Supabase project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "ABHAYA"
4. Choose region: Mumbai
5. Set a database password
6. Wait 2 minutes for setup
7. Get the URL and anon key from Settings → API

**Option B:** Tell me and I'll help you troubleshoot

---

## Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Found/created ABHAYA project
- [ ] Went to Settings → API
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Updated BOTH in .env file
- [ ] Saved .env file
- [ ] Restarted dev server
- [ ] Ran test-connection.js
- [ ] Saw ✅ Signup successful

---

**Once both match, the login will work immediately!** 🚀

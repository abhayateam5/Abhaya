# 🚀 QUICK FIX: Get Redirect Working in 3 Minutes

## The Problem
Your home page shows instead of redirecting to login because your Supabase key is wrong.

## The Fix (3 Steps)

### Step 1: Get Your Real Supabase Key
1. Go to https://supabase.com/dashboard
2. Click your ABHAYA project
3. Click **Settings** → **API**
4. Find "anon public" key
5. Click the **COPY** button (📋 icon)

### Step 2: Update .env File
1. Open `C:\Projects\ABHAYA\.env`
2. Find this line:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SjkZKKgSWqCvdflj-pPdWg_QJZeCFaX
   ```
3. Replace with the key you copied (should start with `eyJ`)
4. Save (Ctrl+S)

### Step 3: Restart Server
```bash
# In terminal, press Ctrl+C
# Then run:
npm run dev
```

### Step 4: Test
1. Open incognito window (Ctrl+Shift+N)
2. Go to http://localhost:3000/
3. Should redirect to http://localhost:3000/auth/login ✅

---

## What the Correct Key Looks Like

❌ **WRONG** (what you have now):
```
sb_publishable_SjkZKKgSWqCvdflj-pPdWg_QJZeCFaX
```

✅ **CORRECT** (what it should be):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZGxud2pwY25pa3VsbXJzcHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjM4NzYsImV4cCI6MjA1Mzk5OTg3Nn0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

The correct key is **300+ characters long** and starts with `eyJ`.

---

**That's it!** Once you update the key and restart, the redirect will work.

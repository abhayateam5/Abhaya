# 🎯 GET YOUR SUPABASE CREDENTIALS - STEP BY STEP

## Current Status
Your `.env` file has the WRONG key format, which is why you're getting "Failed to fetch".

---

## 🚀 OPTION 1: Quick Fix (If you have access to Supabase)

### Step 1: Open Supabase Dashboard
**Click this link:** https://supabase.com/dashboard

### Step 2: Sign In
Use your Supabase account credentials (Google/GitHub/Email)

### Step 3: Find Your Project
Look for a project named "ABHAYA" or similar in your projects list.

**Don't see ABHAYA?** → Go to Option 2 below to create a new project

### Step 4: Open API Settings
1. Click on your ABHAYA project
2. In the left sidebar, click **⚙️ Settings**
3. Click **API**

### Step 5: Copy Your Credentials

You'll see two important values:

#### A) Project URL
```
Project URL
https://xxxxxxxxxxxxx.supabase.co
[COPY BUTTON 📋]
```
**Click the copy button** and save this somewhere temporarily.

#### B) Project API Keys
You'll see a table like this:
```
┌──────────────┬────────┬─────────────────────────────────┬──────┐
│ Name         │ Type   │ Token                           │ Copy │
├──────────────┼────────┼─────────────────────────────────┼──────┤
│ anon         │ public │ eyJhbGciOiJIUzI1NiIsInR5cC... │ [📋] │ ← CLICK THIS
│ service_role │ secret │ eyJhbGciOiJIUzI1NiIsInR5cC... │ [📋] │
└──────────────┴────────┴─────────────────────────────────┴──────┘
```

**Click the copy button** next to the **"anon"** row (NOT service_role).

### Step 6: Update Your .env File

1. Open `C:\Projects\ABHAYA\.env` in VS Code
2. Replace lines 4 and 5:

**BEFORE:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://rddlnwjpcnikulmrspuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SjkZKKgSWqCvdflj-pPdWg_QJZeCFaX
```

**AFTER:** (paste what you copied)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODQyMzg3NiwiZXhwIjoyMDUzOTk5ODc2fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. **Save the file** (Ctrl+S)

### Step 7: Restart Dev Server

In VS Code terminal:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 8: Test It!

```bash
node test-connection.js
```

**Expected output:**
```
✅ Session check passed
✅ Signup successful!
```

---

## 🆕 OPTION 2: Create a New Supabase Project

If you don't have an ABHAYA project or can't find it:

### Step 1: Go to Supabase
https://supabase.com/dashboard

### Step 2: Click "New Project"
Big green button in the top right

### Step 3: Fill in Details
- **Name:** ABHAYA
- **Database Password:** Choose a strong password (save it!)
- **Region:** Mumbai (closest to India)
- **Pricing Plan:** Free

### Step 4: Click "Create New Project"
Wait 2-3 minutes for setup to complete

### Step 5: Get Your Credentials
Once the project is ready:
1. Go to **Settings** → **API**
2. Copy **Project URL**
3. Copy **anon public** key
4. Update your `.env` file (see Step 6 in Option 1)

### Step 6: Run Database Migrations
You'll need to run the SQL migration files:

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**
3. Copy the content of `C:\Projects\ABHAYA\supabase\migrations\001_initial_schema.sql`
4. Paste and click **Run**
5. Repeat for `002_rls_policies.sql` and `003_functions_triggers.sql`

---

## ✅ How to Verify It's Working

### Test 1: Check Key Format
Your anon key should:
- ✅ Start with `eyJ`
- ✅ Be 300+ characters long
- ✅ Have three parts separated by dots (`.`)

Example: `eyJhbGci...PART1...eyJpc3M...PART2...XXXXXX...PART3`

### Test 2: Run Connection Test
```bash
node test-connection.js
```

Should show:
```
✅ Session check passed
✅ Signup successful!
```

### Test 3: Try Login
1. Open incognito window
2. Go to `http://localhost:3000/auth/login`
3. Enter any email/password
4. Click Login

**Expected:**
- ❌ NO "Failed to fetch" error
- ✅ Either "Invalid credentials" (if user doesn't exist) OR successful login

---

## 🆘 Troubleshooting

### "I can't access Supabase dashboard"
**Solution:** 
- Check if you're signed in
- Try resetting your password
- Create a new account if needed

### "I don't see the API settings"
**Solution:**
- Make sure you clicked on a project first
- Look for ⚙️ Settings in the LEFT sidebar
- Then click "API" under Project Settings

### "The key is too long to copy"
**Solution:**
- Don't try to select it manually
- Click the 📋 copy button next to it
- It will copy the entire key automatically

### "Still getting Failed to fetch"
**Solution:**
1. Make sure you saved the `.env` file
2. Make sure you restarted the dev server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in a new incognito window
5. Run `node test-connection.js` to see the exact error

---

## 📸 What You Should See

### Supabase Dashboard:
```
┌─────────────────────────────────────────────┐
│ Supabase Dashboard                          │
├─────────────────────────────────────────────┤
│ Projects:                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ ABHAYA                                  │ │
│ │ rddlnwjpcnikulmrspuy                    │ │
│ │ Active • Mumbai                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### API Settings Page:
```
Settings > API

Configuration
┌─────────────────────────────────────────────┐
│ Project URL                                 │
│ https://xxxxx.supabase.co          [COPY]  │
└─────────────────────────────────────────────┘

Project API keys
┌──────────────┬────────┬─────────────┬──────┐
│ anon         │ public │ eyJhbGci... │ [📋] │ ← THIS ONE
│ service_role │ secret │ eyJhbGci... │ [📋] │
└──────────────┴────────┴─────────────┴──────┘
```

---

## 🎯 Quick Checklist

- [ ] Opened https://supabase.com/dashboard
- [ ] Signed in to Supabase
- [ ] Found/created ABHAYA project
- [ ] Clicked Settings → API
- [ ] Copied Project URL
- [ ] Copied anon public key (starts with eyJ)
- [ ] Updated .env file lines 4 and 5
- [ ] Saved .env file (Ctrl+S)
- [ ] Restarted dev server (Ctrl+C, npm run dev)
- [ ] Ran `node test-connection.js`
- [ ] Saw ✅ Connection successful

---

## 💬 Need More Help?

**Tell me:**
- "Can't access dashboard" - I'll help you troubleshoot login
- "Created new project" - I'll help you run the migrations
- "Got the keys" - I'll help you test the connection
- "Still not working" - Share the error from `node test-connection.js`

---

**Once you have the correct keys, everything will work immediately!** 🚀

## 🔑 HOW TO GET YOUR SUPABASE KEY (WITH SCREENSHOTS)

### Your Current Problem
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SjkZKKgSWqCvdflj-pPdWg_QJZeCFaX
```
This is WRONG ❌

### What It Should Look Like
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZGxud2pwY25pa3VsbXJzcHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjM4NzYsImV4cCI6MjA1Mzk5OTg3Nn0.XXXXXXXXXX
```
This is CORRECT ✅ (starts with `eyJ`, 300+ characters)

---

## STEP-BY-STEP GUIDE

### Step 1: Open Supabase Dashboard
Click this link: https://supabase.com/dashboard/project/rddlnwjpcnikulmrspuy/settings/api

(This goes directly to your project's API settings)

### Step 2: Find "Project API keys" Section
You'll see a table with these rows:
- service_role (secret)
- anon (public) ← **THIS IS THE ONE YOU NEED**

### Step 3: Copy the Anon Key
Look for the row that says:
```
anon    public    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    [COPY ICON]
```

Click the **COPY ICON** (📋) next to the long key.

### Step 4: Update Your .env File

Open `C:\Projects\ABHAYA\.env` in VS Code and change line 5:

**BEFORE:**
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SjkZKKgSWqCvdflj-pPdWg_QJZeCFaX
```

**AFTER:** (paste the key you copied)
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZGxud2pwY25pa3VsbXJzcHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjM4NzYsImV4cCI6MjA1Mzk5OTg3Nn0.XXXXXXXXXX
```

Save the file (Ctrl+S)

### Step 5: Restart Dev Server

In VS Code terminal:
```bash
# Press Ctrl+C to stop the server
# Then run:
npm run dev
```

### Step 6: Test the Redirect

1. Open **incognito window** (Ctrl+Shift+N)
2. Go to: http://localhost:3000/
3. **Expected:** Redirects to http://localhost:3000/auth/login ✅

---

## TROUBLESHOOTING

### "I can't find the API settings"
- Make sure you're logged into Supabase
- Make sure you're in the ABHAYA project
- Look for "Settings" in the left sidebar, then click "API"

### "The key is too long to copy"
- Don't try to select it manually
- Click the COPY icon (📋) next to the key
- It will copy the entire key automatically

### "Still showing home page after updating"
1. Make sure you saved the .env file
2. Make sure you restarted the dev server (Ctrl+C, then npm run dev)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in a NEW incognito window

---

## WHAT THE DASHBOARD LOOKS LIKE

```
Supabase Dashboard
└── Your Project: ABHAYA
    └── Settings (left sidebar)
        └── API
            └── Project API keys
                ├── Project URL: https://rddlnwjpcnikulmrspuy.supabase.co
                ├── anon public: eyJhbGci... [COPY] ← COPY THIS ONE
                └── service_role secret: eyJhbGci... [COPY]
```

---

## QUICK CHECKLIST

- [ ] Opened Supabase dashboard
- [ ] Found Settings → API
- [ ] Copied the "anon public" key (starts with eyJ)
- [ ] Pasted into .env file line 5
- [ ] Saved .env file
- [ ] Restarted dev server (Ctrl+C, npm run dev)
- [ ] Tested in incognito window

---

**Once you do this, the redirect will work immediately!**

Reply "Done" when you've updated the key and I'll help you test it.

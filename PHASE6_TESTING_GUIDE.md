# Phase 6: Family Tracking - Testing Guide

## 🚨 PREREQUISITE: Run Database Migration

**Before testing, you MUST run the migration in Supabase:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your ABHAYA project
3. Go to **SQL Editor**
4. Open the file: `c:\Projects\ABHAYA\supabase\migrations\005_family_tracking_enhancements.sql`
5. Copy the entire SQL content
6. Paste into Supabase SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify success message

**What this creates:**
- ✅ `panic_words` table
- ✅ `check_ins` table
- ✅ Enhanced `family_links` table with new columns
- ✅ RLS policies
- ✅ Helper functions

---

## 🧪 Testing Scenarios

### Test 1: Access Family Dashboard

**Steps:**
1. Navigate to: `http://localhost:3000/family`
2. You should see the Family Safety Network page

**Expected Results:**
- ✅ Page loads without errors
- ✅ Header shows "Family Safety Network"
- ✅ "Manage Family" button visible
- ✅ Initially shows "No family members added yet" (if no members)

---

### Test 2: Generate Invite Code

**Steps:**
1. On family page, click **"Manage Family"** button
2. You should see the management interface
3. Click **"Generate Invite Code"** button
4. Wait for code generation

**Expected Results:**
- ✅ 8-character alphanumeric code appears
- ✅ Code format: Example "A3F7K9M2"
- ✅ "Expires in 24 hours" message shown
- ✅ **"Copy"** button appears
- ✅ Clicking Copy copies code to clipboard

**Test Copy:**
- Click Copy button
- Paste in notepad (Ctrl+V)
- Verify code matches displayed code

---

### Test 3: Set Panic Word (Silent SOS)

**Steps:**
1. Scroll to **"Panic Word"** section
2. Enter a word (minimum 3 characters)
   - Example: "butterfly" or "umbrella"
3. Click **"Set Panic Word"** button
4. Wait for success message

**Expected Results:**
- ✅ Button disabled if less than 3 characters
- ✅ Success alert: "Panic word set successfully!"
- ✅ Input field clears after success
- ✅ Word is encrypted in database (bcrypt)

**Security Check:**
- Open Supabase Dashboard
- Go to Table Editor → `panic_words` table
- Verify `encrypted_word` column shows bcrypt hash (starts with `$2a$` or `$2b$`)
- Never shows plain text ✅

---

### Test 4: Send "I'm Safe" Check-in

**Steps:**
1. Scroll to **"I'm Safe Check-in"** section
2. (Optional) Enter a message: "Arrived safely at hotel"
3. Click **"Send Check-in"** button
4. Wait for success message

**Expected Results:**
- ✅ Success alert appears
- ✅ Message field clears
- ✅ Check-in saved with current location
- ✅ Timestamp recorded

**Verify in Database:**
- Go to Supabase → Table Editor → `check_ins`
- Should see new row with:
  - Your user_id
  - Message (if entered)
  - Location (POINT geometry)
  - Battery level
  - Timestamp

---

### Test 5: View Family Map

**Steps:**
1. Click **"View Map"** button (if in Manage view)
2. Should switch to map view

**Expected Results:**
- ✅ Map interface appears
- ✅ Shows list of family members (or empty state)
- ✅ Each member shows:
  - Profile photo or initial
  - Name
  - Relationship (parent/child)
  - Status dot (green/yellow/gray)
  - Last seen time
  - Battery level (if available)
  - Location coordinates (if available)

---

### Test 6: Family Member Status Indicators

**Status Colors:**
- 🟢 **Green dot** = Online (last seen < 5 minutes)
- 🟡 **Yellow dot** = Recently active (5-30 minutes)
- ⚫ **Gray dot** = Offline (> 30 minutes)

**Last Seen Text:**
- "Just now" (< 1 minute)
- "5m ago" (< 60 minutes)
- "2h ago" (< 24 hours)
- "3d ago" (> 24 hours)

**Battery Colors:**
- 🔴 Red = < 20%
- 🟡 Yellow = 20-50%
- 🟢 Green = > 50%

---

### Test 7: Join Family via Invite Code (Multi-User Test)

**Requires 2 users or 2 browser sessions:**

**User 1 (Parent):**
1. Generate invite code
2. Copy the code

**User 2 (Child):**
1. Open new incognito window or browser
2. Login as different user
3. Go to `/family`
4. Click "Join Family"
5. Paste invite code
6. Click Submit

**Expected Results:**
- ✅ "Successfully joined family!" message
- ✅ Parent now appears in child's family list
- ✅ Child now appears in parent's family list
- ✅ Both can see each other's locations (if tracking enabled)

---

### Test 8: Time-Limited Consent

**Default Behavior:**
- All family links have 24-hour consent by default
- After 24 hours, tracking stops automatically
- User receives notification before expiration

**To Test Expiration:**
1. Go to Supabase → Table Editor → `family_links`
2. Find your family link
3. Edit `tracking_consent_until` to past time
4. Refresh family page
5. Member should show as "Consent Expired"

---

### Test 9: Check Console for Errors

**Open Browser DevTools:**
1. Press F12
2. Go to Console tab
3. Perform all tests above
4. Watch for any errors

**Expected:**
- ✅ No red error messages
- ✅ Only informational logs
- ✅ API calls return 200 status

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error

**Cause:** Not logged in  
**Fix:** Go to `/login` and sign in first

### Issue: "Table panic_words does not exist"

**Cause:** Migration not run  
**Fix:** Run `005_family_tracking_enhancements.sql` in Supabase

### Issue: "Cannot read property of undefined"

**Cause:** Database columns missing  
**Fix:** Verify migration ran successfully, check all new columns exist

### Issue: Invite code doesn't work

**Cause:** Code expired (> 24 hours)  
**Fix:** Generate new code

### Issue: Map doesn't show locations

**Cause:** Location tracking not started  
**Fix:** Enable location tracking in browser, start LocationTracker component

---

## ✅ Testing Checklist

Copy this checklist and mark as you test:

```
[ ] Migration run successfully in Supabase
[ ] Family page loads at /family
[ ] Generate invite code works
[ ] Invite code can be copied
[ ] Panic word can be set (min 3 chars)
[ ] Panic word is encrypted in database
[ ] Check-in message sends successfully
[ ] Check-in appears in database
[ ] Family map displays correctly
[ ] Status indicators show correct colors
[ ] Last seen times display correctly
[ ] Battery levels show correct colors
[ ] No console errors during testing
[ ] Join family via invite code works (if multi-user)
```

---

## 📊 Database Verification Queries

**Check panic words:**
```sql
SELECT user_id, encrypted_word, is_active, created_at 
FROM panic_words 
WHERE is_active = true;
```

**Check recent check-ins:**
```sql
SELECT user_id, message, battery_level, created_at 
FROM check_ins 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check family links:**
```sql
SELECT parent_id, child_id, status, tracking_consent_until, invite_code
FROM family_links;
```

---

## 🎯 Success Criteria

Phase 6 testing is complete when:

- ✅ All 9 test scenarios pass
- ✅ No console errors
- ✅ Database tables contain expected data
- ✅ UI responds correctly to all actions
- ✅ Status indicators update in real-time

---

**Testing Started:** ___________  
**Testing Completed:** ___________  
**All Tests Passed:** ☐ Yes ☐ No  
**Issues Found:** ___________

---

**Created:** February 6, 2026, 1:30 AM IST

# Storage Buckets Setup - Quick Guide

**Time:** 2 minutes  
**Location:** Supabase Dashboard → Storage

---

## 📦 Create 3 Storage Buckets

### **Step 1: Open Storage Section** (30 sec)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click your project: **rddnlwjpcnikulmrspuy**
3. Left sidebar → Click **Storage** (folder icon)
4. You'll see the Storage page

---

### **Step 2: Create Bucket 1 - profile-photos** (30 sec)

1. Click **"New bucket"** button (top right)
2. Fill in the form:
   - **Name:** `profile-photos`
   - **Public bucket:** ✅ **Check this box** (make it public)
   - **File size limit:** Leave default (50 MB is fine)
   - **Allowed MIME types:** Leave empty (allow all image types)
3. Click **"Create bucket"**

**✅ You should see:** `profile-photos` bucket in the list

---

### **Step 3: Create Bucket 2 - alert-evidence** (30 sec)

1. Click **"New bucket"** button again
2. Fill in the form:
   - **Name:** `alert-evidence`
   - **Public bucket:** ❌ **Uncheck this box** (keep it private)
   - **File size limit:** Leave default or set to 100 MB
   - **Allowed MIME types:** Leave empty
3. Click **"Create bucket"**

**✅ You should see:** `alert-evidence` bucket in the list (with a lock icon 🔒)

---

### **Step 4: Create Bucket 3 - efir-documents** (30 sec)

1. Click **"New bucket"** button again
2. Fill in the form:
   - **Name:** `efir-documents`
   - **Public bucket:** ❌ **Uncheck this box** (keep it private)
   - **File size limit:** Leave default or set to 100 MB
   - **Allowed MIME types:** Leave empty
3. Click **"Create bucket"**

**✅ You should see:** `efir-documents` bucket in the list (with a lock icon 🔒)

---

## ✅ Verification (10 sec)

In the Storage page, you should now see **3 buckets**:

1. **profile-photos** - 🌐 Public
2. **alert-evidence** - 🔒 Private
3. **efir-documents** - 🔒 Private

---

## 🎯 What Each Bucket Is For

- **profile-photos** (Public)
  - User profile pictures
  - Tourist photos
  - Publicly accessible via URL

- **alert-evidence** (Private)
  - SOS audio recordings
  - Emergency photos/videos
  - Only accessible by authorized users (police, family)

- **efir-documents** (Private)
  - e-FIR PDFs
  - Legal documents
  - Evidence files
  - Only accessible by complainant and assigned officer

---

## 📞 When Done, Reply:

```
✅ All 3 storage buckets created successfully
```

---

**Then Phase 1 will be 100% complete!** 🎉

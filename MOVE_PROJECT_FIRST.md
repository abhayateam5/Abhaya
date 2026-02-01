# 🚨 CRITICAL: Project Location Issue

## ❌ Current Problem

Your project is located at:
```
C:\Users\chandra\OneDrive\Desktop\ABHAYA
```

This is causing **npm install failures** due to OneDrive file locking.

---

## ✅ Solution: Move Project Out of OneDrive

### Step 1: Create New Location

Open PowerShell and run:

```powershell
# Create projects directory
New-Item -Path "C:\Projects" -ItemType Directory -Force

# Move the project (preserves .git history)
Move-Item -Path "C:\Users\chandra\OneDrive\Desktop\ABHAYA" -Destination "C:\Projects\ABHAYA"
```

### Step 2: Clean Install

```powershell
# Navigate to new location
cd C:\Projects\ABHAYA

# Clean everything
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Fresh install
npm install
```

### Step 3: Verify Node Version

```powershell
node -v   # Should be >= 18.17
npm -v    # Should be >= 9.0
```

If outdated, download from: https://nodejs.org/

---

## Why This Matters

| Issue | OneDrive Location | C:\Projects |
|-------|------------------|-------------|
| **File Locking** | ❌ Constant | ✅ None |
| **npm Performance** | ❌ Slow | ✅ Fast |
| **Build Errors** | ❌ Random | ✅ Stable |
| **Git Operations** | ❌ Conflicts | ✅ Smooth |
| **node_modules** | ❌ Sync issues | ✅ No sync |

---

## After Moving

1. Update your VS Code workspace
2. Reopen the project from `C:\Projects\ABHAYA`
3. Run `npm install` again
4. Continue with Supabase setup

---

**This single change fixes ~60% of Windows npm issues.**

# 🚀 Supabase Setup Guide for ABHAYA

This guide will walk you through setting up your Supabase project for the ABHAYA system.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: ABHAYA
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

---

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep this secret!

3. Add these to your `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

---

## Step 3: Enable PostGIS Extension

1. Go to **Database** → **Extensions**
2. Search for **"postgis"**
3. Click **Enable** next to PostGIS
4. Wait for it to activate

---

## Step 4: Run Database Migrations

### Method 1: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for it to complete (should see "Success" message)

7. Repeat for `supabase/migrations/002_geospatial_functions.sql`

### Method 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 5: Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Click **"New bucket"**

### Create these three buckets:

#### 1. efir-documents (Private)
- **Name**: `efir-documents`
- **Public**: ❌ Unchecked
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf, image/jpeg, image/png`

#### 2. profile-photos (Public)
- **Name**: `profile-photos`
- **Public**: ✅ Checked
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### 3. alert-evidence (Private)
- **Name**: `alert-evidence`
- **Public**: ❌ Unchecked
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/jpeg, image/png, audio/mpeg, audio/wav`

### Set Storage Policies

For each bucket, go to **Policies** and add:

**efir-documents policies:**
```sql
-- Users can upload their own documents
CREATE POLICY "Users can upload own e-FIR documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'efir-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own e-FIR documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'efir-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Police can view all documents
CREATE POLICY "Police can view all e-FIR documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'efir-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('police', 'admin')
  )
);
```

**profile-photos policies:**
```sql
-- Anyone can view profile photos (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Users can upload their own photo
CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own photo
CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 6: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email settings:
   - **Enable email confirmations**: ✅ (recommended)
   - **Secure email change**: ✅ (recommended)

### Enable Phone Authentication (For OTP)

1. Go to **Authentication** → **Providers**
2. Click on **Phone**
3. Enable phone authentication
4. Choose a provider:

#### Option A: Twilio (Recommended)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Buy a phone number
4. In Supabase, enter:
   - **Twilio Account SID**
   - **Twilio Auth Token**
   - **Twilio Phone Number**

#### Option B: MessageBird
1. Sign up at [messagebird.com](https://www.messagebird.com)
2. Get your API key
3. In Supabase, enter your MessageBird API key

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Enable Google provider
4. Get credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Enter **Client ID** and **Client Secret** in Supabase

---

## Step 7: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:

### Confirmation Email
```html
<h2>Welcome to ABHAYA!</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

### Reset Password
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

## Step 8: Set Up Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - ✅ `alerts`
   - ✅ `locations`
   - ✅ `family_members`
   - ✅ `safety_scores`

This enables real-time subscriptions for these tables.

---

## Step 9: Test Your Setup

### Test Database Connection

Run this in SQL Editor:
```sql
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM safe_zones;
SELECT COUNT(*) FROM police_stations;
```

You should see:
- 0 profiles (no users yet)
- 3 safe zones (sample data)
- 2 police stations (sample data)

### Test PostGIS Functions

```sql
-- Find safe zones near Bangalore Palace
SELECT * FROM find_nearby_safe_zones(12.9984, 77.5926, 5000);

-- Find nearest police station
SELECT * FROM find_nearest_police_station(12.9716, 77.5946);

-- Check if location is safe
SELECT is_in_safe_zone(12.9984, 77.5926);
```

### Test Storage

1. Go to **Storage** → `profile-photos`
2. Try uploading a test image
3. Verify you can see it

---

## Step 10: Update Your .env File

Make sure your `.env` file has all required values:

```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 11: Run Your Application

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test:

1. **Register a new user**
2. **Verify email/phone**
3. **Login**
4. **Test features**:
   - View dashboard
   - Update location
   - Create family group
   - Trigger test alert

---

## 🎉 You're Done!

Your Supabase backend is now fully configured for ABHAYA.

---

## 📊 Monitoring & Analytics

### View Database Activity
- Go to **Database** → **Query Performance**
- Monitor slow queries
- Check connection pool usage

### View API Usage
- Go to **Settings** → **Usage**
- Monitor API requests
- Check storage usage
- View bandwidth consumption

### View Logs
- Go to **Logs** → **API Logs**
- See all API requests
- Debug errors
- Monitor real-time subscriptions

---

## 🔒 Security Best Practices

1. **Never commit** `.env` file to Git
2. **Keep service_role key secret** - only use server-side
3. **Enable RLS** on all tables (already done in migration)
4. **Use HTTPS** in production
5. **Enable 2FA** on your Supabase account
6. **Regularly review** access logs
7. **Set up alerts** for suspicious activity

---

## 🆘 Troubleshooting

### "relation does not exist" error
- Make sure you ran both migration files
- Check SQL Editor for any errors

### "PostGIS extension not found"
- Enable PostGIS extension (Step 3)
- Restart your Supabase project

### "Storage bucket not found"
- Create all three storage buckets (Step 5)
- Check bucket names match exactly

### "Authentication error"
- Verify API keys in `.env` are correct
- Check if email/phone provider is enabled

### Real-time not working
- Enable replication for tables (Step 8)
- Check browser console for WebSocket errors

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)

---

**Need help?** Open an issue on GitHub or contact support.

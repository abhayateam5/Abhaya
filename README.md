# ABHAYA - Tourist Guardian System 🛡️

**Next.js + Supabase** - A comprehensive tourist safety platform with real-time alerts, location tracking, and AI-powered safety features.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + PostGIS + Real-time + Auth + Storage)
- **UI Components**: Radix UI
- **Maps**: Google Maps API
- **Real-time**: Supabase Realtime (WebSockets)
- **Authentication**: Supabase Auth (Phone OTP, Email, OAuth)

---

## ✨ Features

### For Tourists
- 📍 **Real-time Location Tracking** with geofencing
- 🚨 **SOS Emergency Alerts** with one-tap activation
- 📊 **AI Safety Score** based on location, time, crowd density
- 👨‍👩‍👧 **Family Groups** with live location sharing
- 📝 **e-FIR Generator** for filing police reports
- 🗺️ **Safe Zone Detection** with automatic alerts
- 🎁 **Safety Rewards System** for safe behavior
- 🤖 **Drishti AI Companion** for safety recommendations

### For Police
- 🚔 **Real-time Alert Dashboard** with priority filtering
- 📈 **Analytics & Heatmaps** for crime patterns
- 👥 **Tourist Tracking** for jurisdiction monitoring
- ⚡ **Quick Response System** with one-click assignment
- 📱 **Mobile-optimized Interface** for field officers

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- A **Supabase** account ([sign up here](https://supabase.com))
- A **Google Maps API** key ([get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))

---

## 🛠️ Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/abhaya.git
cd abhaya
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase Project

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Enable PostGIS extension**:
   - Go to Database → Extensions
   - Search for "postgis" and enable it

3. **Run the database migration**:
   - Go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL

4. **Set up Storage Buckets**:
   - Go to Storage
   - Create three buckets:
     - `efir-documents` (private)
     - `profile-photos` (public)
     - `alert-evidence` (private)

5. **Configure Authentication**:
   - Go to Authentication → Providers
   - Enable:
     - Email
     - Phone (configure Twilio for SMS OTP)
     - Google OAuth (optional)

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   # Get these from: https://app.supabase.com/project/_/settings/api
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip**: If port 3000 is busy, run on a different port:
> ```bash
> npm run dev -- -p 3005
> ```

### Step 6: Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
abhaya/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/         # Tourist dashboard
│   │   └── police/            # Police dashboard
│   ├── components/
│   │   ├── features/          # Feature components (e-FIR, Safety Score, etc.)
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── supabase/          # Supabase client utilities
│   │   └── geospatial.ts      # PostGIS helper functions
│   ├── hooks/                 # Custom React hooks
│   │   ├── useRealtimeAlerts.ts
│   │   └── useRealtimeLocation.ts
│   ├── types/                 # TypeScript types
│   │   └── database.types.ts  # Auto-generated Supabase types
│   └── context/               # React context providers
├── supabase/
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge Functions (optional)
├── public/                    # Static assets
└── package.json
```

---

## 🔐 Authentication

ABHAYA uses Supabase Auth with multiple providers:

### Phone OTP (Recommended for Indian tourists)
```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+91xxxxxxxxxx'
});
```

### Email/Password
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Google OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

---

## 🗺️ Geospatial Features

ABHAYA uses PostGIS for advanced location features:

### Find Nearby Safe Zones
```typescript
const { data } = await supabase.rpc('find_nearby_safe_zones', {
  lat: 12.9716,
  lng: 77.5946,
  radius_meters: 5000
});
```

### Check if in Danger Zone
```typescript
const { data } = await supabase.rpc('is_in_danger_zone', {
  lat: 12.9716,
  lng: 77.5946
});
```

---

## 📡 Real-time Features

### Subscribe to Safety Alerts
```typescript
const channel = supabase
  .channel('safety-alerts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => {
      console.log('New alert:', payload.new);
    }
  )
  .subscribe();
```

### Track Family Member Locations
```typescript
const channel = supabase
  .channel('family-locations')
  .on('postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'locations',
      filter: `user_id=in.(${familyMemberIds.join(',')})`
    },
    (payload) => {
      console.log('Location updated:', payload.new);
    }
  )
  .subscribe();
```

---

## 📦 Storage

### Upload e-FIR Document
```typescript
const { data, error } = await supabase.storage
  .from('efir-documents')
  .upload(`user-${userId}/fir-${Date.now()}.pdf`, file);
```

### Upload Profile Photo
```typescript
const { data, error } = await supabase.storage
  .from('profile-photos')
  .upload(`${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  });
```

---

## 🧪 Testing

### Test Authentication
1. Register a new user
2. Verify phone OTP
3. Complete profile setup
4. Test login/logout

### Test Real-time Features
1. Open two browser windows
2. Create a family group in one window
3. Join the group in the second window
4. Update location in one window
5. Verify it updates in the other window instantly

### Test Geospatial Queries
1. Enable location permissions
2. View nearby safe zones
3. Trigger a geofence alert by moving outside safe zone
4. Find nearest police station

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## 📚 API Documentation

### REST API Endpoints

All API routes are in `src/app/api/`:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/safety-score` - Get user safety score
- `POST /api/sos/trigger` - Trigger SOS alert
- `POST /api/location/update` - Update user location
- `GET /api/family` - Get family group
- `POST /api/family` - Create family group

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:

- 📧 Email: support@abhaya.com
- 💬 Discord: [Join our community](https://discord.gg/abhaya)
- 📖 Documentation: [docs.abhaya.com](https://docs.abhaya.com)

---

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Next.js** team for the incredible framework
- **Radix UI** for accessible components
- **PostGIS** for geospatial capabilities

---

**Built with ❤️ for tourist safety**

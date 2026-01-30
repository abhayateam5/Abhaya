# ABHAYA - Tourist Guardian System

This project is built with Next.js, Tailwind CSS, and MongoDB.

## How to Run Locally

### 1. Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a file named `.env` in the root directory and add your MongoDB connection string and API keys:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Start the Development Server
Run the following command:
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

> [!TIP]
> **If Port 3000 is busy**, you can run it on a different port (e.g., 3005):
> ```bash
> npm run dev -- -p 3005
> ```

### 4. Build for Production
To see the optimized production version:
```bash
npm run build
npm run start
```

## Dashboard Features
- **Map**: Visualizes your current location (Mocked).
- **Weather**: Displays current conditions (Mocked).
- **e-FIR**: Allows filing online reports with auto-scrolling UI for mobile.
- **Drishti AI**: Your safety companion.

// Application Constants

export const APP_NAME = 'ABHAYA';
export const APP_TAGLINE = 'Smart Tourist Guardian System';
export const APP_VERSION = '1.0.0';

// Safety Score Weights
export const SAFETY_WEIGHTS = {
    locationSafety: 0.25,
    timeOfDay: 0.20,
    crowdDensity: 0.15,
    weatherConditions: 0.15,
    networkConnectivity: 0.10,
    routeCompliance: 0.15,
} as const;

// Safety Score Thresholds
export const SAFETY_THRESHOLDS = {
    excellent: 80,
    good: 60,
    moderate: 40,
    low: 20,
    critical: 0,
} as const;

// Anomaly Detection Thresholds
export const ANOMALY_THRESHOLDS = {
    inactivityMinutes: 30,
    routeDeviationMeters: 500,
    rapidMovementKmh: 200,
    lowBatteryPercent: 15,
} as const;

// Geo-fence Default Radius (meters)
export const DEFAULT_GEOFENCE_RADIUS = 500;

// Location Update Interval (ms)
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

// SOS Countdown Duration (seconds)
export const SOS_COUNTDOWN_SECONDS = 3;

// Alert Priorities with colors
export const ALERT_PRIORITY_CONFIG = {
    critical: { label: 'Critical', color: 'danger', bgClass: 'bg-danger/20' },
    high: { label: 'High', color: 'warning', bgClass: 'bg-warning/20' },
    medium: { label: 'Medium', color: 'primary', bgClass: 'bg-primary/20' },
    low: { label: 'Low', color: 'muted', bgClass: 'bg-muted/20' },
} as const;

// Alert Status with colors
export const ALERT_STATUS_CONFIG = {
    active: { label: 'Active', color: 'danger' },
    responding: { label: 'Responding', color: 'warning' },
    resolved: { label: 'Resolved', color: 'success' },
    false_alarm: { label: 'False Alarm', color: 'muted' },
} as const;

// User Roles
export const USER_ROLES = {
    tourist: { label: 'Tourist', description: 'Travelers using the safety features' },
    police: { label: 'Police Officer', description: 'Law enforcement personnel' },
    admin: { label: 'Administrator', description: 'System administrators' },
} as const;

// Navigation Items for Tourist App
export const TOURIST_NAV_ITEMS = [
    { href: '/tourist/dashboard', label: 'Home', icon: 'Home' },
    { href: '/tourist/safety-score', label: 'Safety', icon: 'Shield' },
    { href: '/tourist/digital-id', label: 'ID', icon: 'CreditCard' },
    { href: '/tourist/profile', label: 'Profile', icon: 'User' },
] as const;

// Navigation Items for Police Dashboard
export const POLICE_NAV_ITEMS = [
    { href: '/police/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/police/heatmap', label: 'Heatmap', icon: 'Map' },
    { href: '/police/alerts', label: 'Alerts', icon: 'Bell' },
    { href: '/police/tourists', label: 'Tourists', icon: 'Users' },
    { href: '/police/analytics', label: 'Analytics', icon: 'BarChart' },
] as const;

// Quick Actions for Tourist Dashboard
export const QUICK_ACTIONS = [
    { id: 'family', label: 'Family', icon: 'Users', href: '/tourist/family' },
    { id: 'health', label: 'Health', icon: 'Heart', href: '#health' },
    { id: 'rfid', label: 'RFID', icon: 'Wifi', href: '#rfid' },
    { id: 'hazard', label: 'Hazard', icon: 'AlertTriangle', href: '#hazard' },
] as const;

// Dashboard Tabs
export const DASHBOARD_TABS = [
    { id: 'map', label: 'Map', icon: 'Map' },
    { id: 'weather', label: 'Weather', icon: 'Cloud' },
    { id: 'guides', label: 'Guides', icon: 'BookOpen' },
    { id: 'ai', label: 'AI', icon: 'Bot' },
] as const;

// Indian Major Cities (for demo data)
export const INDIAN_CITIES = [
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Agra', lat: 27.1767, lng: 78.0081 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { name: 'Goa', lat: 15.2993, lng: 74.1240 },
    { name: 'Kerala', lat: 10.8505, lng: 76.2711 },
    { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
] as const;

// Reward Tiers
export const REWARD_TIERS = {
    bronze: { min: 0, max: 499, label: 'Bronze', color: '#CD7F32' },
    silver: { min: 500, max: 1999, label: 'Silver', color: '#C0C0C0' },
    gold: { min: 2000, max: 4999, label: 'Gold', color: '#FFD700' },
    platinum: { min: 5000, max: 9999, label: 'Platinum', color: '#E5E4E2' },
    diamond: { min: 10000, max: Infinity, label: 'Diamond', color: '#B9F2FF' },
} as const;

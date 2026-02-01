# ABHAYA - Testing Framework (Safety-Critical System)

## Overview

ABHAYA is a **safety-critical system** where bugs can have real-world consequences. This testing framework ensures:
- **Security**: RLS policies work correctly
- **Reliability**: Geospatial queries are accurate
- **Performance**: Real-time updates are instant
- **Correctness**: Safety scores are calculated properly

---

## 1. Database-Level Tests (SQL)

### 1.1 RLS Policy Tests

Run these in Supabase SQL Editor to verify security:

```sql
-- Test 1: User can only see their own profile
-- Login as user A, try to access user B's profile
SET request.jwt.claims = '{"sub": "user-a-uuid"}';
SELECT * FROM profiles WHERE id = 'user-b-uuid';
-- Expected: 0 rows (access denied)

-- Test 2: Parent can see child's location
SET request.jwt.claims = '{"sub": "parent-uuid"}';
SELECT * FROM live_locations WHERE user_id = 'child-uuid';
-- Expected: 1 row (if family link exists)

-- Test 3: User cannot change their own role
SET request.jwt.claims = '{"sub": "user-uuid"}';
UPDATE profiles SET role = 'police' WHERE id = 'user-uuid';
-- Expected: Error or no change

-- Test 4: Police can view all SOS events
SET request.jwt.claims = '{"sub": "police-uuid"}';
SELECT COUNT(*) FROM sos_events;
-- Expected: All SOS events visible

-- Test 5: User cannot delete SOS events
SET request.jwt.claims = '{"sub": "user-uuid"}';
DELETE FROM sos_events WHERE user_id = 'user-uuid';
-- Expected: Error (no DELETE policy)

-- Test 6: User can only update DRAFT e-FIR
SET request.jwt.claims = '{"sub": "user-uuid"}';
UPDATE efir_reports SET incident_description = 'Updated' 
WHERE user_id = 'user-uuid' AND status = 'submitted';
-- Expected: Error or 0 rows updated
```

### 1.2 Geospatial Accuracy Tests

```sql
-- Test 1: Distance calculation accuracy
-- Bangalore Palace to Cubbon Park (known distance ~2.8km)
SELECT ST_Distance(
    ST_GeogFromText('POINT(77.5926 12.9984)'),  -- Bangalore Palace
    ST_GeogFromText('POINT(77.5946 12.9716)')   -- Cubbon Park
) as distance_meters;
-- Expected: ~2800 meters (±100m acceptable)

-- Test 2: Point in polygon (safe zone)
SELECT is_in_safe_zone(12.9984, 77.5926);
-- Expected: true (Bangalore Palace is a safe zone)

-- Test 3: Find nearby safe zones
SELECT name, distance FROM find_nearby_safe_zones(12.9716, 77.5946, 5000);
-- Expected: Cubbon Park (distance ~0), Vidhana Soudha, Bangalore Palace

-- Test 4: Nearest police station
SELECT name, distance FROM find_nearest_police_station(12.9716, 77.5946);
-- Expected: Cubbon Park Police Station

-- Test 5: Danger zone detection
-- Create test risk zone first
INSERT INTO risk_zones (name, area, risk_level, is_active)
VALUES ('Test Danger Zone', 
    ST_GeogFromText('POLYGON((77.59 12.97, 77.60 12.97, 77.60 12.98, 77.59 12.98, 77.59 12.97))'),
    9, true);

SELECT is_in_danger_zone(12.975, 77.595);
-- Expected: true
```

### 1.3 Safety Score Tests

```sql
-- Test 1: Daytime, safe zone, no alerts
SELECT calculate_safety_score(12.9984, 77.5926, 14, 70, 100);
-- Expected: score >= 85 (excellent/good)

-- Test 2: Night time, no safe zone, recent alerts
-- First create test SOS event
INSERT INTO sos_events (user_id, user_name, user_phone, location, status, priority)
VALUES (
    'test-user-uuid',
    'Test User',
    '+919999999999',
    ST_GeogFromText('POINT(77.5926 12.9984)'),
    'triggered',
    'critical'
);

SELECT calculate_safety_score(12.9984, 77.5926, 23, 20, 50);
-- Expected: score <= 40 (low/critical)

-- Test 3: Verify factor breakdown
SELECT (calculate_safety_score(12.9716, 77.5946, 12, 80, 100)->>'factors')::json;
-- Expected: JSON with location_safety, time_of_day, crowd_density, network_connectivity
```

### 1.4 Trigger Tests

```sql
-- Test 1: Auto-generate FIR number
INSERT INTO efir_reports (
    user_id, complainant_name, complainant_phone, complainant_address,
    incident_type, incident_date, incident_address, incident_description,
    status
) VALUES (
    'test-user-uuid', 'Test User', '+919999999999', 'Test Address',
    'Theft', NOW(), 'Test Location', 'Test Description',
    'submitted'
);

SELECT fir_number FROM efir_reports ORDER BY created_at DESC LIMIT 1;
-- Expected: FIR{YY}000001 format

-- Test 2: Family notification on SOS
INSERT INTO sos_events (user_id, user_name, user_phone, location, status)
VALUES (
    'child-uuid', 'Child Name', '+919999999999',
    ST_GeogFromText('POINT(77.5926 12.9984)'),
    'triggered'
);

SELECT COUNT(*) FROM notifications 
WHERE type = 'sos_alert' AND user_id = 'parent-uuid';
-- Expected: 1 (notification created for parent)

-- Test 3: Audit log creation
UPDATE profiles SET name = 'Updated Name' WHERE id = 'test-user-uuid';

SELECT action, table_name FROM audit_log 
WHERE record_id = 'test-user-uuid' 
ORDER BY created_at DESC LIMIT 1;
-- Expected: action = 'UPDATE', table_name = 'profiles'
```

---

## 2. Performance Tests

### 2.1 Index Usage Verification

```sql
-- Test 1: Geospatial query uses GIST index
EXPLAIN ANALYZE
SELECT * FROM live_locations
WHERE ST_DWithin(
    location,
    ST_GeogFromText('POINT(77.5946 12.9716)'),
    5000
);
-- Expected: "Index Scan using idx_live_locations_geo"

-- Test 2: RLS policy performance
EXPLAIN ANALYZE
SELECT * FROM sos_events WHERE user_id = 'test-user-uuid';
-- Expected: "Index Scan using idx_sos_user_id"

-- Test 3: Heatmap query performance
EXPLAIN ANALYZE
SELECT * FROM get_safety_heatmap(12.90, 77.50, 13.00, 77.70, 30);
-- Expected: Execution time < 500ms for 1000 records
```

### 2.2 Load Tests

```sql
-- Test 1: Concurrent location updates
-- Simulate 1000 users updating location simultaneously
-- Use pgbench or custom script

-- Test 2: Real-time subscription load
-- Subscribe 100 clients to live_locations changes
-- Update 50 locations per second
-- Verify all clients receive updates within 1 second

-- Test 3: Safety score calculation at scale
-- Calculate safety scores for 10,000 locations
SELECT COUNT(*) FROM (
    SELECT calculate_safety_score(
        12.9 + (random() * 0.2),
        77.5 + (random() * 0.3),
        FLOOR(random() * 24)::INTEGER,
        FLOOR(random() * 100)::INTEGER,
        FLOOR(random() * 100)::INTEGER
    )
    FROM generate_series(1, 10000)
) AS scores;
-- Expected: Completes in < 30 seconds
```

---

## 3. Real-time Tests

### 3.1 WebSocket Subscription Tests

```javascript
// Test 1: Location update propagation
const supabase = createClient(...);

// Client 1: Subscribe
const channel = supabase
  .channel('test-locations')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'live_locations' },
    (payload) => {
      console.log('Received update:', payload);
      // Expected: Payload received within 1 second
    }
  )
  .subscribe();

// Client 2: Update location
await supabase
  .from('live_locations')
  .update({ location: 'POINT(77.5946 12.9716)' })
  .eq('user_id', 'test-user-uuid');

// Expected: Client 1 receives update within 1 second
```

### 3.2 SOS Alert Propagation

```javascript
// Test: SOS alert reaches all family members
// 1. Create family link
// 2. Trigger SOS
// 3. Verify parent receives notification via realtime

const channel = supabase
  .channel('sos-alerts')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sos_events' },
    (payload) => {
      console.log('SOS Alert:', payload);
      // Expected: Alert received immediately
    }
  )
  .subscribe();

// Trigger SOS
await supabase.from('sos_events').insert({
  user_id: 'child-uuid',
  user_name: 'Child Name',
  user_phone: '+919999999999',
  location: 'POINT(77.5926 12.9984)',
  status: 'triggered'
});

// Expected: 
// 1. Realtime event received
// 2. Notification created in notifications table
// 3. Parent's app shows alert
```

---

## 4. Failure Scenario Tests

### 4.1 Network Failure

```javascript
// Test: Location update during network loss
// 1. Start location tracking
// 2. Disconnect network
// 3. Queue location updates locally
// 4. Reconnect network
// 5. Verify queued updates are sent

// Expected: No data loss, updates sent in order
```

### 4.2 Duplicate SOS Prevention

```javascript
// Test: Rapid SOS button presses
// 1. Press SOS button 5 times in 1 second
// 2. Verify only 1 SOS event is created

// Implementation: Use debouncing + unique constraint
```

### 4.3 Stale Location Detection

```sql
-- Test: Detect stale locations
SELECT user_id, updated_at, is_stale
FROM live_locations
WHERE is_stale = true;

-- Expected: Locations older than 5 minutes are marked stale
```

---

## 5. Security Penetration Tests

### 5.1 Bypass RLS Attempts

```javascript
// Test 1: Try to access other user's data via API
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'other-user-uuid');

// Expected: error or empty data (RLS blocks)

// Test 2: Try to update other user's location
const { error } = await supabase
  .from('live_locations')
  .update({ location: 'POINT(0 0)' })
  .eq('user_id', 'other-user-uuid');

// Expected: error (RLS blocks)

// Test 3: Try to delete SOS event
const { error } = await supabase
  .from('sos_events')
  .delete()
  .eq('id', 'sos-uuid');

// Expected: error (no DELETE policy)
```

### 5.2 SQL Injection Tests

```javascript
// Test: SQL injection in search
const maliciousInput = "'; DROP TABLE profiles; --";

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .ilike('name', `%${maliciousInput}%`);

// Expected: No SQL injection (parameterized queries)
```

---

## 6. Integration Tests

### 6.1 Complete SOS Workflow

```javascript
// Test: End-to-end SOS flow
// 1. Child triggers SOS
const { data: sos } = await supabase.from('sos_events').insert({
  user_id: childId,
  user_name: 'Child Name',
  user_phone: '+919999999999',
  location: 'POINT(77.5926 12.9984)',
  status: 'triggered',
  priority: 'critical'
}).select().single();

// 2. Verify parent receives notification
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', parentId)
  .eq('type', 'sos_alert');

// Expected: 1 notification

// 3. Police acknowledges
await supabase.from('sos_events')
  .update({ 
    status: 'acknowledged',
    acknowledged_by: policeId,
    acknowledged_at: new Date().toISOString()
  })
  .eq('id', sos.id);

// 4. Police responds
await supabase.from('sos_events')
  .update({ 
    status: 'responding',
    responding_officer_id: policeId,
    responding_officer_name: 'Officer Name',
    response_time: new Date().toISOString()
  })
  .eq('id', sos.id);

// 5. Police verifies and resolves
await supabase.from('sos_events')
  .update({ 
    status: 'resolved',
    verified_by: policeId,
    verified_at: new Date().toISOString(),
    resolution_time: new Date().toISOString(),
    resolution_notes: 'False alarm'
  })
  .eq('id', sos.id);

// 6. Verify audit trail
const { data: audit } = await supabase
  .from('audit_log')
  .select('*')
  .eq('table_name', 'sos_events')
  .eq('record_id', sos.id);

// Expected: Multiple audit entries (INSERT, UPDATEs)
```

---

## 7. Automated Test Suite

### 7.1 Setup

```bash
npm install --save-dev @supabase/supabase-js jest @testing-library/react
```

### 7.2 Example Test File

```javascript
// tests/security.test.js
import { createClient } from '@supabase/supabase-js';

describe('RLS Security Tests', () => {
  let supabase;
  
  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  });
  
  test('User cannot access other user profiles', async () => {
    // Login as user A
    await supabase.auth.signInWithPassword({
      email: 'usera@test.com',
      password: 'password'
    });
    
    // Try to access user B's profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'user-b-uuid');
    
    expect(data).toHaveLength(0);
  });
  
  test('Parent can view child location', async () => {
    // Login as parent
    await supabase.auth.signInWithPassword({
      email: 'parent@test.com',
      password: 'password'
    });
    
    // View child location
    const { data, error } = await supabase
      .from('live_locations')
      .select('*')
      .eq('user_id', 'child-uuid');
    
    expect(data).toHaveLength(1);
    expect(error).toBeNull();
  });
});
```

---

## 8. Continuous Testing

### 8.1 Pre-deployment Checklist

- [ ] All RLS policies pass
- [ ] Geospatial queries accurate (±100m)
- [ ] Real-time latency < 1 second
- [ ] Safety scores calculated correctly
- [ ] No SQL injection vulnerabilities
- [ ] Audit logs working
- [ ] Triggers firing correctly
- [ ] Performance benchmarks met

### 8.2 Monitoring in Production

```sql
-- Query 1: Check for stale locations
SELECT COUNT(*) FROM live_locations WHERE is_stale = true;
-- Alert if > 10% of users

-- Query 2: Check SOS response times
SELECT AVG(EXTRACT(EPOCH FROM (response_time - created_at)) / 60) as avg_minutes
FROM sos_events
WHERE response_time IS NOT NULL
AND created_at > NOW() - INTERVAL '24 hours';
-- Alert if > 5 minutes

-- Query 3: Check for failed safety score calculations
SELECT COUNT(*) FROM safety_scores
WHERE calculated_at > NOW() - INTERVAL '1 hour';
-- Alert if < expected count

-- Query 4: Check database performance
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- > 1 second
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 9. Testing Schedule

| Test Type | Frequency | Responsibility |
|-----------|-----------|----------------|
| **Unit Tests** | Every commit | Developer |
| **RLS Tests** | Every schema change | Developer |
| **Geospatial Tests** | Weekly | QA |
| **Performance Tests** | Before release | DevOps |
| **Security Tests** | Monthly | Security team |
| **Load Tests** | Before major release | DevOps |
| **Penetration Tests** | Quarterly | External auditor |

---

## 10. Test Data Management

### 10.1 Create Test Users

```sql
-- Create test parent
INSERT INTO auth.users (id, email) VALUES ('test-parent-uuid', 'parent@test.com');
INSERT INTO profiles (id, name, email, phone, role) 
VALUES ('test-parent-uuid', 'Test Parent', 'parent@test.com', '+919999999991', 'parent');

-- Create test child
INSERT INTO auth.users (id, email) VALUES ('test-child-uuid', 'child@test.com');
INSERT INTO profiles (id, name, email, phone, role) 
VALUES ('test-child-uuid', 'Test Child', 'child@test.com', '+919999999992', 'child');

-- Create family link
INSERT INTO family_links (parent_id, child_id) 
VALUES ('test-parent-uuid', 'test-child-uuid');

-- Create test police
INSERT INTO auth.users (id, email) VALUES ('test-police-uuid', 'police@test.com');
INSERT INTO profiles (id, name, email, phone, role, badge_number) 
VALUES ('test-police-uuid', 'Test Officer', 'police@test.com', '+919999999993', 'police', 'BADGE001');
```

### 10.2 Cleanup Test Data

```sql
-- Delete test data
DELETE FROM family_links WHERE parent_id LIKE 'test-%' OR child_id LIKE 'test-%';
DELETE FROM live_locations WHERE user_id LIKE 'test-%';
DELETE FROM sos_events WHERE user_id LIKE 'test-%';
DELETE FROM profiles WHERE id LIKE 'test-%';
DELETE FROM auth.users WHERE id LIKE 'test-%';
```

---

**Remember**: ABHAYA is a safety-critical system. Every test matters. Lives depend on it.

import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { exec, get, all } from '../db/database.js';
import * as featureFlagService from '../services/featureFlagService.js';

const router = express.Router();

// Helper to check if nearby is enabled for the user
const checkAccess = async (req, res, next) => {
  const user = get('SELECT country, city FROM users WHERE id = ?', req.user.id);
  const access = featureFlagService.evaluateFeatureAccess({
    featureKey: 'nearby_enabled',
    userId: req.user.id,
    countryCode: user?.country,
    cityName: user?.city
  });

  if (!access.allowed) {
    return res.status(403).json({ 
      error: 'Nearby feature is disabled', 
      reason: access.reason 
    });
  }
  next();
};

// GET /api/nearby/status
router.get('/status', requireAuth, checkAccess, async (req, res) => {
  try {
    const prefs = get('SELECT * FROM user_location_preferences WHERE user_id = ?', req.user.id);
    const visibility = get('SELECT * FROM nearby_visibility WHERE user_id = ?', req.user.id);
    
    // Check governance
    const user = get('SELECT country, city FROM users WHERE id = ?', req.user.id);
    const access = featureFlagService.evaluateFeatureAccess({
      featureKey: 'nearby_enabled',
      userId: req.user.id,
      countryCode: user?.country,
      cityName: user?.city
    });

    res.json({
      discoveryEnabled: !!prefs?.discovery_enabled,
      radiusKm: prefs?.radius_km || 5,
      isActive: !!visibility?.is_active,
      governance: access
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nearby/opt-in
router.post('/opt-in', requireAuth, checkAccess, async (req, res) => {
  try {
    exec(`
      INSERT INTO user_location_preferences (user_id, discovery_enabled, updated_at)
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET discovery_enabled = 1, updated_at = CURRENT_TIMESTAMP
    `, req.user.id);
    
    res.json({ success: true, message: 'Opted in to nearby discovery' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nearby/opt-out
router.post('/opt-out', requireAuth, async (req, res) => {
  try {
    exec('UPDATE user_location_preferences SET discovery_enabled = 0 WHERE user_id = ?', req.user.id);
    exec('UPDATE nearby_visibility SET is_active = 0 WHERE user_id = ?', req.user.id);
    res.json({ success: true, message: 'Opted out from nearby discovery' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nearby/update-location
router.post('/update-location', requireAuth, checkAccess, async (req, res) => {
  try {
    const { lat, lng, country, city, accuracy } = req.body;
    
    // Privacy: Round coordinates to 3 decimal places (~110m accuracy)
    const approxLat = Math.round(lat * 1000) / 1000;
    const approxLng = Math.round(lng * 1000) / 1000;

    exec(`
      INSERT INTO nearby_visibility (user_id, lat, lng, country_code, city_name, last_seen, is_active)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(user_id) DO UPDATE SET 
        lat = ?, lng = ?, country_code = ?, city_name = ?, last_seen = CURRENT_TIMESTAMP, is_active = 1
    `, req.user.id, approxLat, approxLng, country, city, approxLat, approxLng, country, city);

    // Also update main user table if country/city changed
    exec('UPDATE users SET country = ?, city = ? WHERE id = ?', country, city, req.user.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nearby/users
router.get('/users', requireAuth, checkAccess, async (req, res) => {
  try {
    const myPrefs = get('SELECT * FROM user_location_preferences WHERE user_id = ?', req.user.id);
    if (!myPrefs || !myPrefs.discovery_enabled) {
      return res.status(403).json({ error: 'You must opt-in to see others' });
    }

    const myLoc = get('SELECT * FROM nearby_visibility WHERE user_id = ?', req.user.id);
    if (!myLoc) {
      return res.status(400).json({ error: 'Location not updated' });
    }

    const radius = myPrefs.radius_km || 5;

    // Matching logic:
    // 1. Feature gate allowed (already checked for requester, but we filter others in query if possible, 
    //    though for simplicity we'll filter by visibility which is only set if they opted in)
    // 2. Opt-in true (nearby_visibility.is_active = 1 AND user_location_preferences.discovery_enabled = 1)
    // 3. User not blocked (both ways)
    // 4. User not banned
    // 5. User not self
    // 6. Last active within 24 hours
    
    const globalSettings = get('SELECT * FROM nearby_global_settings WHERE id = 1');
    const threshold = globalSettings?.report_threshold || 3;

    const userSockets = req.app.get('userSockets');
    const nearbyUsers = all(`
      SELECT 
        u.id, u.username, u.avatar, u.country, u.city,
        v.lat, v.lng, v.last_seen,
        (SELECT COUNT(*) FROM nearby_reports r WHERE r.target_id = u.id) as report_count
      FROM nearby_visibility v
      JOIN users u ON v.user_id = u.id
      JOIN user_location_preferences p ON u.id = p.user_id
      WHERE v.user_id != ?
      AND v.is_active = 1
      AND p.discovery_enabled = 1
      AND u.is_banned = 0
      AND (SELECT COUNT(*) FROM nearby_reports r WHERE r.target_id = u.id) < ?
      AND v.last_seen > datetime('now', '-24 hours')
      AND u.id NOT IN (SELECT blocked_user_id FROM nearby_blocks WHERE user_id = ?)
      AND u.id NOT IN (SELECT user_id FROM nearby_blocks WHERE blocked_user_id = ?)
      AND u.id NOT IN (SELECT target_id FROM nearby_reports WHERE reporter_id = ?)
    `, req.user.id, threshold, req.user.id, req.user.id, req.user.id);

    // Calculate distances and format response
    const results = nearbyUsers.map(user => {
      const dist = calculateDistance(myLoc.lat, myLoc.lng, user.lat, user.lng);
      const isOnline = userSockets ? userSockets.has(String(user.id)) : false;
      
      // Privacy: Only return labels
      let distanceLabel = 'Same city';
      if (dist < 1) distanceLabel = 'Nearby';
      else if (dist < 5) distanceLabel = 'Within 5 km';
      else if (dist < 10) distanceLabel = 'Within 10 km';
      else if (dist < 50) distanceLabel = 'Within 50 km';

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        distanceLabel,
        distanceVal: dist, // Keep for filtering, remove before sending
        is_online: isOnline,
        city: user.city,
        country: user.country
      };
    }).filter(u => {
       // Filter based on radius preference
       return u.distanceVal <= radius;
    }).map(u => {
      const { distanceVal, ...rest } = u;
      return rest;
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nearby/block
router.post('/block', requireAuth, checkAccess, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    exec('INSERT OR IGNORE INTO nearby_blocks (user_id, blocked_user_id) VALUES (?, ?)', req.user.id, targetUserId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nearby/report
router.post('/report', requireAuth, checkAccess, async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    
    // Safety: Check for duplicate reports by same user for same target in last 24h
    const existing = get(`
      SELECT id FROM nearby_reports 
      WHERE reporter_id = ? AND target_id = ? AND created_at > datetime('now', '-24 hours')
    `, req.user.id, targetUserId);

    if (existing) {
      return res.status(429).json({ error: 'You have already reported this user recently' });
    }

    exec('INSERT INTO nearby_reports (reporter_id, target_id, reason) VALUES (?, ?, ?)', req.user.id, targetUserId, reason);
    
    // Log for admin
    exec(`
      INSERT INTO admin_audit_logs (admin_id, action, target_user_id, details)
      VALUES (NULL, 'NEARBY_REPORT', ?, ?)
    `, targetUserId, JSON.stringify({ reporter_id: req.user.id, reason }));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;

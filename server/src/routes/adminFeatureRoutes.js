import express from 'express';
import * as featureFlagService from '../services/featureFlagService.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Endpoints
router.get('/features', requireAuth, requireAdmin, async (req, res) => {
  try {
    const flags = await featureFlagService.getAllFeatureFlags();
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features/update', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featureKey, enabled } = req.body;
    await featureFlagService.updateFeatureFlag(featureKey, enabled, req.adminUser.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/features/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const logs = await featureFlagService.getGovernanceAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features/simulate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featureKey, userId, countryCode, cityName } = req.body;
    const result = featureFlagService.evaluateFeatureAccess({
      featureKey,
      userId: userId ? parseInt(userId) : null,
      countryCode,
      cityName
    });
    res.json({
      ...result,
      evaluatedAt: new Date().toISOString(),
      params: { featureKey, userId, countryCode, cityName }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/features/geo-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featureKey } = req.query;
    const rules = await featureFlagService.getGeoRules(featureKey);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features/geo-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featureKey, countryCode, cityName, enabled, reason } = req.body;
    await featureFlagService.setGeoRule(featureKey, countryCode, cityName, enabled, reason, req.adminUser.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/features/user-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.query;
    const rules = await featureFlagService.getUserRules(userId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features/user-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featureKey, userId, enabled, reason, expiresAt } = req.body;
    await featureFlagService.setUserRule(featureKey, userId, enabled, reason, expiresAt, req.adminUser.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/features/nearby-settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { get } = await import('../db/database.js');
    const settings = get('SELECT * FROM nearby_global_settings WHERE id = 1');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features/nearby-settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { default_radius_km, report_threshold, approximate_only } = req.body;
    const { exec } = await import('../db/database.js');
    const { logAudit } = await import('../services/auditService.js');

    exec(`
      UPDATE nearby_global_settings 
      SET default_radius_km = ?, report_threshold = ?, approximate_only = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1
    `, default_radius_km, report_threshold, approximate_only);

    logAudit(req.adminUser.id, 'UPDATE_NEARBY_SETTINGS', null, JSON.stringify({
      default_radius_km,
      report_threshold,
      approximate_only
    }));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Check Endpoint
router.post('/features/check-access', requireAuth, async (req, res) => {
  try {
    const { featureKey } = req.body;
    
    // Fetch user location from DB
    const { get } = await import('../db/database.js');
    const userLocation = get('SELECT country, city FROM users WHERE id = ?', req.user.id);
    
    const result = featureFlagService.evaluateFeatureAccess({
      featureKey,
      userId: req.user.id,
      countryCode: userLocation?.country,
      cityName: userLocation?.city
    });
    res.json({ allowed: result.allowed, reason: result.reason });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

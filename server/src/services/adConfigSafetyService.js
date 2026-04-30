import { adConfigService } from './adConfigService.js';

export const adConfigSafetyService = {
  /**
   * Validates and sanitizes the ad configuration before sending it to the mobile app.
   * Ensures safe minimums, handles missing IDs, and filters sensitive data.
   */
  enforceSafeConfig: (config) => {
    if (!config || config.ads_enabled === false) {
      return { ads_enabled: false };
    }

    // Safe Minimum Intervals (seconds)
    const MIN_INTERVALS = {
      app_open: 14400, // 4 hours
      call_end_interstitial: 1800, // 30 minutes
      native_refresh: 60,
      banner_refresh: 60
    };

    const sanitizedConfig = { ...config };

    // 1. Validate Active Network
    if (!sanitizedConfig.active_network) {
      return { ads_enabled: false, reason: 'MISSING_ACTIVE_NETWORK' };
    }

    const activeNetName = sanitizedConfig.active_network;
    const activeNet = sanitizedConfig.networks[activeNetName];

    if (!activeNet) {
      return { ads_enabled: false, reason: 'ACTIVE_NETWORK_CONFIG_NOT_FOUND' };
    }

    // 2. Validate Placement Required IDs
    const sanitizedPlacements = { ...sanitizedConfig.placements };
    const units = activeNet.units || activeNet; // Handle different structure possibilities

    if (sanitizedPlacements.app_open && !units.app_open) sanitizedPlacements.app_open = false;
    if (sanitizedPlacements.call_end_interstitial && !units.interstitial) sanitizedPlacements.call_end_interstitial = false;
    if (sanitizedPlacements.chat_list_native && !units.native) sanitizedPlacements.chat_list_native = false;
    if (sanitizedPlacements.settings_banner && !units.banner) sanitizedPlacements.settings_banner = false;
    if (sanitizedPlacements.rewarded_unlock && !units.rewarded) sanitizedPlacements.rewarded_unlock = false;

    // 3. Normalize Intervals
    const sanitizedIntervals = { ...sanitizedConfig.intervals };
    if (sanitizedIntervals.interstitial_gap_seconds < MIN_INTERVALS.call_end_interstitial) {
      sanitizedIntervals.interstitial_gap_seconds = MIN_INTERVALS.call_end_interstitial;
    }
    if (sanitizedIntervals.native_refresh_seconds < MIN_INTERVALS.native_refresh) {
      sanitizedIntervals.native_refresh_seconds = MIN_INTERVALS.native_refresh;
    }

    // 4. Mobile API Response Contract Lock
    return {
      ads_enabled: true,
      test_mode: !!sanitizedConfig.test_mode,
      active_network: activeNetName,
      fallback_network: sanitizedConfig.fallback_network || null,
      cache_ttl_seconds: 14400, // Fixed 4-hour cache TTL for mobile
      safe_intervals: {
        app_open_seconds: MIN_INTERVALS.app_open,
        call_end_interstitial_seconds: sanitizedIntervals.interstitial_gap_seconds,
        native_refresh_seconds: sanitizedIntervals.native_refresh_seconds
      },
      placements: sanitizedPlacements,
      network: {
        name: activeNetName,
        units: {
          app_open: units.app_open || null,
          native: units.native || null,
          interstitial: units.interstitial || null,
          rewarded: units.rewarded || null,
          banner: units.banner || null
        }
      },
      fallback: sanitizedConfig.fallback_network ? {
        name: sanitizedConfig.fallback_network,
        units: {} // Fallback units should be fetched if active fails, or included here if safe
      } : null,
      policy: {
        no_ads_during_call: true,
        no_ads_near_composer: true,
        frequency_cap_enforced: true
      }
    };
  }
};

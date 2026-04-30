# ZRCS Mobile Implementation Checklist

Use this checklist to ensure the ZYMI Flutter app complies with the ZRCS Monetization Safety Policy.

## 1. Startup & Config
- [ ] Call `GET /api/v1/ad-settings` during splash screen.
- [ ] Implement local cache with 4-hour TTL.
- [ ] Implement "Safe Default": If API fails and no cache exists, set `ads_enabled = false`.
- [ ] Log ZRCS config version for debugging.

## 2. Initialization
- [ ] Initialize ONLY the SDK specified in `active_network`.
- [ ] Register test device IDs for AdMob/AppLovin before releasing to internal QA.
- [ ] Use `test_mode: true` from API to load test ads during development.

## 3. Placement Enforcement
- [ ] **App Open**: Show only if `placements.app_open` is `true`.
- [ ] **Chat List Native**: Show only in main chat list, minimum 3 items below top.
- [ ] **Call History Native**: Show only in history list, not during active search.
- [ ] **Settings Banner**: Show at the bottom of settings, avoid overlapping buttons.

## 4. Real-Time Safety (CRITICAL)
- [ ] Verify `AdConfigManager.canShowAds()` returns `false` during any active WebRTC signaling.
- [ ] Verify ads are blocked during Audio Call.
- [ ] Verify ads are blocked during Video Call.
- [ ] Verify ads are blocked when Chat Composer has focus (typing state).
- [ ] Ensure `InterstitialAd.show()` is called ONLY after `cleanupCall()` is complete.

## 5. UI/UX Integrity
- [ ] Ad overlays must have a clearly visible "Close" (X) button.
- [ ] No "Deceptive" ad placements (e.g., placing an ad where a "Call" button usually is).
- [ ] Native ads must be clearly labeled as "Sponsored" or "Ad".

## 6. Frequency Control
- [ ] Respect `safe_intervals.call_end_interstitial_seconds`.
- [ ] If user ends 3 calls in 1 minute, only 1 ad (or 0) should be shown based on interval.

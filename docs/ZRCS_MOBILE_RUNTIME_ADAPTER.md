# ZRCS MOBILE RUNTIME ADAPTER

## 1. App Startup Flow
1. **Initialize Config**: On splash screen, call `GET /api/v1/ad-settings`.
2. **Handle Failure**: If API fails, check local storage for cached config.
3. **Safe Default**: If no cache or cache > 4 hours, set `ads_enabled = false`.
4. **Initialize SDK**: Only initialize the SDK for `active_network`. Do not initialize disabled networks.

## 2. 4-Hour Cache Rule
- Config must be cached locally for 4 hours.
- A background refresh can occur every 4 hours if the app is active.
- If the master switch is `false` in the latest fetch, clear the cache and disable ads immediately.

## 3. Safe Ad Placement Guards
Ads must be blocked in the following states:
- **Active Call**: `isCallActive == true`.
- **Signaling**: `isSignaling == true`.
- **Connecting**: `isConnecting == true`.
- **Typing**: `isUserTyping == true`.
- **Keyboard Visible**: Avoid showing banners or native ads near the active keyboard.

## 4. Call-End Interstitial Flow
- **Event**: Call ends.
- **Cleanup**: `cleanupCall()` must complete (WebRTC streams closed, audio released).
- **Check State**: Verify no other active calls or incoming calls.
- **Frequency Cap**: Check if `interstitial_gap_seconds` has passed since the last show.
- **Trigger**: Only then show the interstitial ad.

## 5. UI Placement Rules
- **Native Ad**: Inserted into the chat list. Minimum 8 items between ads.
- **Banner**: Bottom of Settings/Profile. Must not overlap action buttons.
- **Rewarded**: Only show "Watch Ad" button if user consents to unlocking a feature.

## 6. Pseudocode Contract
```dart
class AdConfigManager {
  AdConfig? _config;
  DateTime? _lastFetch;

  Future<void> fetchConfig() async {
    // API call with 4h cache logic
  }

  bool isPlacementEnabled(String key) {
    return _config?.adsEnabled == true && _config?.placements[key] == true;
  }
}

class AdPlacementGuard {
  static bool canShowAd(CallState callState, ChatState chatState) {
    if (callState.isActive || callState.isConnecting) return false;
    if (chatState.isTyping) return false;
    return true;
  }
}
```

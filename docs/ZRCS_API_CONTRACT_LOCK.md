# ZRCS API Contract Lock (v1.0)

This document defines the strict API contract for the ZYMI Remote Ad-Control System (ZRCS). Any changes to these endpoints or response shapes must be coordinated with the Mobile Integration Team.

## 1. Endpoints

### Public (Mobile App)
- **GET** `/api/v1/ad-settings`
  - Purpose: Fetch runtime ad configuration.
  - Auth: None (Public).
  - Cache: **4 Hours (14400s)**.
- **GET** `/api/v1/ad-settings/health`
  - Purpose: Quick status check for monitoring.

### Admin (Dashboard)
- **GET** `/api/admin/ad-control/settings`
- **POST** `/api/admin/ad-control/global`
- **POST** `/api/admin/ad-control/network`
- **POST** `/api/admin/ad-control/placement`
- **GET** `/api/admin/ad-control/audit`
- **GET** `/api/zrcs/ping` (Diagnostics)

## 2. Response JSON Shape (GET /api/v1/ad-settings)

```json
{
  "ads_enabled": boolean,
  "test_mode": boolean,
  "active_network": "admob" | "meta" | "applovin" | "pangle",
  "fallback_network": string,
  "cache_ttl_seconds": 14400,
  "safe_intervals": {
    "app_open_seconds": number,
    "call_end_interstitial_seconds": number,
    "native_refresh_seconds": number
  },
  "placements": {
    "app_open": boolean,
    "chat_list_native": boolean,
    "call_end_interstitial": boolean,
    "settings_banner": boolean,
    "rewarded_unlock": boolean
  },
  "network": {
    "name": string,
    "units": {
      "app_open": string | null,
      "native": string | null,
      "interstitial": string | null,
      "rewarded": string | null,
      "banner": string | null
    }
  },
  "fallback": {
    "name": string,
    "units": { ... }
  },
  "policy": {
    "no_ads_during_call": true,
    "no_ads_near_composer": true,
    "frequency_cap_enforced": true
  }
}
```

## 3. Integration Rules (The Hard Lock)

1. **Safe Fallback**: If the API is unreachable or returns a 5xx/404, the mobile app **MUST** default to `ads_enabled: false`.
2. **Real-Time Block**: Ads are **STRICTLY PROHIBITED** during active WebRTC calls (Audio or Video).
3. **Typing Safety**: No native ads or banners should be visible while the keyboard is active or the chat composer is focused.
4. **Call-End Sequence**: An interstitial ad may only be shown **AFTER** the `cleanupCall()` process has completed and the UI has returned to a neutral state.
5. **Minimum Intervals**: The server enforces a minimum gap for interstitials (default 1800s). The app must respect this even if the user performs multiple calls in rapid succession.
6. **Initialization**: Initialize **ONLY** the SDK of the `active_network`. Do not waste resources initializing inactive SDKs.

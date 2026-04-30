# ZRCS MOBILE INTEGRATION CONTRACT

## 1. App Startup Flow
1. **Splash Screen Opens**: App begins initialization.
2. **Fetch Config**: Call `GET /api/v1/ad-settings`.
3. **Validate Response**: Ensure response is valid JSON and contains required fields.
4. **Cache Locally**: Store the config locally with a TTL of 4 hours.
5. **Initialize SDK**: Initialize ONLY the SDK for the `active_network` specified in the response. Do not initialize disabled networks.
6. **API Failure**: If the API call fails, use the locally cached config if it's still within the 4-hour TTL.
7. **No Cache Fallback**: If there is no cache or the cache has expired, use the Safe Default configuration.

## 2. Safe Default Configuration
If the API fails and there is no valid cache, the app MUST fall back to this safe state:
```json
{
  "ads_enabled": false,
  "test_mode": true,
  "active_network": null,
  "placements": {}
}
```

## 3. Real-time Safety Guarantee
- Ads must NEVER interrupt the real-time WebRTC or WebSocket flows.
- The configuration fetch must be asynchronous and non-blocking for core app functionality (calling, messaging).
- If the ad initialization crashes, the app must catch the exception and proceed with ads disabled.

## 4. Master Kill Switch Respect
- When `ads_enabled` is `false`, ALL ad requests, preloading, and displaying must cease immediately.
- The SDKs can remain initialized if already done, but no ad calls should be made.

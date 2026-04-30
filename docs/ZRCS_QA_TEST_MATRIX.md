# ZRCS QA TEST MATRIX

This matrix outlines the testing scenarios required to validate the safety and functionality of the ZRCS implementation.

## Category 1: Configuration Fetching & State
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| CFG-01 | API `GET /api/v1/ad-settings` | Returns HTTP 200 with valid JSON schema. | |
| CFG-02 | Admin disables Master Kill Switch | API returns `ads_enabled: false`. No networks exposed. | |
| CFG-03 | Admin enables Test Mode | API returns `test_mode: true`. | |
| CFG-04 | Admin changes Active Network | API returns the new active network's IDs. Other networks omitted. | |
| CFG-05 | App boots without internet (no cache) | App falls back to safe default (`ads_enabled: false`). | |

## Category 2: Geo & Version Overrides
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| GEO-01 | Admin blocks ads for 'US' | API called with `?country=US` returns `ads_enabled: false`. | |
| GEO-02 | Admin overrides network for 'UK' to 'meta' | API called with `?country=UK` returns `active_network: meta`. | |
| VER-01 | Admin blocks ads for version '1.0.0' | API called with `?version=1.0.0` returns `ads_enabled: false`. | |

## Category 3: Real-Time Safety & Placement
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| SAF-01 | During active video call | No ads of any kind displayed or requested. | |
| SAF-02 | During active audio call | No ads of any kind displayed or requested. | |
| SAF-03 | Call ends naturally | Interstitial ad triggers ONLY if >30 minutes since last show. | |
| SAF-04 | User typing in chat | No interstitials or banners pop up. | |
| SAF-05 | App Open Ad | Shown on launch. Re-opening app within 4 hours does not show it again. | |
| SAF-06 | Interval Normalization | Admin sets 10s gap -> API returns 1800s for call-end. | |
| SAF-07 | Network Dump Prevention | API only returns active + fallback config, no others. | |

## Category 4: Admin UI Validation
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| ADM-01 | Toggle Master Switch in UI | Instantly updates DB. Toast shows success. Audit log records event. | |
| ADM-02 | Save Network Config with empty ID | Admin UI should warn or handle gracefully if network is active. | |
| ADM-03 | View Policy Status | UI clearly indicates which placements are safe/unsafe. | |
| ADM-04 | Audit Log Risk Level | Changing Master Switch logs risk level 'HIGH'. | |
| ADM-05 | Dashboard Widget | Monetization health card shows correct status on dashboard. | |

## Category 6: Revenue Safety & Mobile Runtime
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| REV-01 | API /health check | Returns status: ok and contract_version. | |
| REV-02 | Call signaling starts | Ads immediately blocked (even before stream starts). | |
| REV-03 | Composer focus | Ad units near composer are hidden/removed. | |
| REV-04 | Cache expired (>4h) | App re-fetches. If fetch fails, ads disabled. | |
| REV-05 | Manual kill switch | Ads stop appearing across all placements within minutes. | |
| REV-06 | Call end cleanup | Ad only shows AFTER WebRTC object is destroyed. | |
| Test ID | Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| REG-01 | ZYMI Server Build | `npm run build` passes with no errors. | |
| REG-02 | WebRTC Flow | Call setup, ICE candidates, and connection still work 100%. | |
| REG-03 | Socket Stability | No disconnects during ad config fetching. | |

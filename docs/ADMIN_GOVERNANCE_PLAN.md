# ZYMI Admin Governance & Feature Control System

## 1. Overview
A localized, zero-dependency governance system to manage application features globally, geographically, or per user. This system ensures safety, compliance, and flexible feature rollouts without relying on third-party feature flag services.

## 2. Feature Flags
The following flags will be implemented:
- `nearby_enabled`: Discover users in proximity.
- `file_sharing_enabled`: Upload and send files.
- `video_call_enabled`: Real-time video communication.
- `audio_call_enabled`: Real-time voice communication.
- `location_sharing_enabled`: Send map pins.
- `ai_analysis_enabled`: AI-powered page/chat insights.
- `public_discovery_enabled`: Visibility in global search.
- `report_system_enabled`: User-to-admin complaint flow.

## 3. Control Hierarchy
1. **Global**: Primary kill-switch.
2. **Geo (Country/City)**: Regional compliance (e.g., disable Nearby in specific jurisdictions).
3. **User**: Individual restrictions (e.g., disable video calls for abusive users).
4. **Role**: Permission-based access (Normal, Verified, Moderator, Admin).

## 4. Database Schema (PostgreSQL/SQLite)

### Table: `feature_flags`
| Column | Type | Description |
|---|---|---|
| `id` | UUID/Int | PK |
| `feature_key` | String | Unique identifier (e.g., `video_call`) |
| `enabled` | Boolean | Global status |
| `description` | Text | Feature purpose |
| `updated_at` | Timestamp | Last modified |

### Table: `feature_geo_rules`
| Column | Type | Description |
|---|---|---|
| `id` | UUID/Int | PK |
| `feature_key` | String | Related feature |
| `country_code` | String | ISO 3166-1 alpha-2 (e.g., `BD`, `US`) |
| `city_name` | String | Optional city scope |
| `enabled` | Boolean | Status for this region |
| `reason` | Text | Compliance/Safety note |

### Table: `feature_user_rules`
| Column | Type | Description |
|---|---|---|
| `id` | UUID/Int | PK |
| `feature_key` | String | Related feature |
| `user_id` | Int | Target user |
| `enabled` | Boolean | Status for this user |
| `expires_at` | Timestamp | Optional temporary ban |

## 5. Admin UI Roadmap
- **Dashboard**: High-level toggle for all core services.
- **Geo-Fencing**: Map/List view to enable/disable features by region.
- **Moderation**: View user reports and immediately revoke feature access (e.g., disable file sharing for a spammer).
- **Audit Logs**: Track which admin changed which flag.

## 6. Security & Safety
- **Nearby Default**: Always `OFF` until Admin enables and User opts-in.
- **Privacy**: No precise coordinates; only approximate distance shown.
- **Reporting**: Immediate "Block & Report" visibility on all social features.

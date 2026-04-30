# PHASE 36 — ZYMI REMOTE AD-CONTROL SYSTEM (ZRCS) PLAN

## Goal
Implement a centralized, remote-controlled advertisement management system that allows administrators to toggle ad networks, update unit IDs, set placement rules, and enforce frequency capping for the ZYMI mobile application (Flutter) via the Admin Panel.

## 1. Database Schema (SQLite)

We will implement the following tables to store ad configurations:

### `ad_global_settings`
- `id`: PRIMARY KEY (default 1)
- `ads_enabled`: INTEGER (boolean kill-switch)
- `test_mode`: INTEGER (boolean)
- `active_network`: TEXT (e.g., 'applovin')
- `fallback_network`: TEXT (e.g., 'admob')
- `interstitial_gap_seconds`: INTEGER (default 1800)
- `native_refresh_seconds`: INTEGER (default 60)
- `updated_at`: DATETIME

### `ad_network_configs`
- `id`: PRIMARY KEY
- `network_key`: TEXT UNIQUE (admob, meta, applovin, pangle, inmobi)
- `sdk_key`: TEXT (optional, for AppLovin/others)
- `app_id`: TEXT
- `interstitial_id`: TEXT
- `native_id`: TEXT
- `rewarded_id`: TEXT
- `banner_id`: TEXT
- `is_active`: INTEGER (boolean)
- `updated_at`: DATETIME

### `ad_placements`
- `placement_key`: TEXT PRIMARY KEY (app_open, chat_list_native, call_end_interstitial, settings_banner, rewarded_unlock)
- `enabled`: INTEGER (boolean)
- `min_delay_seconds`: INTEGER
- `updated_at`: DATETIME

### `ad_country_rules`
- `id`: PRIMARY KEY
- `country_code`: TEXT (ISO 2-letter)
- `ads_enabled`: INTEGER (boolean)
- `network_override`: TEXT (null if using global)
- `created_at`: DATETIME

### `ad_version_rules`
- `id`: PRIMARY KEY
- `app_version`: TEXT (e.g., '1.0.5')
- `ads_enabled`: INTEGER (boolean)
- `force_update`: INTEGER (boolean)
- `created_at`: DATETIME

### `ad_config_audit_logs`
- `id`: PRIMARY KEY
- `admin_id`: INTEGER
- `action`: TEXT
- `details`: TEXT
- `timestamp`: DATETIME

---

## 2. API Endpoints

### Public (Mobile App)
- `GET /api/v1/ad-settings`
  - Returns the combined active configuration for the mobile app.
  - Filters by `country_code` and `app_version` (passed in query or detected by IP/header).

### Private (Admin Dashboard)
- `GET /api/admin/ad-control/settings`: Fetch all configurations.
- `POST /api/admin/ad-control/global`: Update global kill-switch/intervals.
- `POST /api/admin/ad-control/network`: Update network IDs and SDK keys.
- `POST /api/admin/ad-control/placement`: Toggle specific ad slots.
- `POST /api/admin/ad-control/country-rule`: Add/Remove geo-fencing rules.
- `POST /api/admin/ad-control/version-rule`: Add/Remove version-specific rules.
- `GET /api/admin/ad-control/audit`: Fetch change history.

---

## 3. Implementation Steps

### Step 1: Backend Services
- Create `server/src/services/adConfigService.js` to handle DB operations.
- Implement caching for the public endpoint (4-hour TTL in app, server-side caching if needed).

### Step 2: Backend Routes
- Create `server/src/routes/adControlRoutes.js`.
- Mount routes in `server/index.js`.
- Apply `requireAdmin` middleware.

### Step 3: Database Migrations
- Update `server/src/db/migrations.js` to include ad tables.

### Step 4: Frontend UI
- Create `AdControlCenter.jsx` with glassmorphism design.
- Sections for Global, Networks, Placements, Geo, and Versioning.
- Audit log viewer.

---

## 4. Security & Safety Policies

- **Input Validation**: All Ad Unit IDs must be trimmed. Empty strings are rejected if the placement is enabled.
- **Master Kill Switch**: Overrides everything. If `ads_enabled` is 0, the API returns `ads_enabled: false` and empty network objects.
- **Audit Logging**: Every change in network IDs or global state must be recorded with the admin's ID.
- **Fallback Logic**: If the active network fails to load in the Flutter app, it should fall back to the `fallback_network` defined in settings.
- **Policy Compliance**: No intrusive placements. Ads only after call completion or in scrollable list views.

---

## 5. Mobile App Contract (Flutter)

- Fetch on splash.
- Local cache: 4 hours.
- Kill-switch check: If `ads_enabled` is false, hide all ad widgets immediately.
- Placement check: Respect `placements[key]` toggle before loading any ad unit.
- Interstitial Gap: Enforce `interstitial_gap_seconds` locally to avoid over-exposure.

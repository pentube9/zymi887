# ZYMI Nearby Feature - Implementation Plan

## 1. Purpose
The Nearby feature allows users to discover and connect with other ZYMI users in their immediate geographical vicinity, fostering local community and spontaneous interactions.

## 2. Privacy Rules
- **Opt-in Only**: Users must explicitly enable "Nearby Mode" to be visible to others.
- **Background Mode**: Users can choose to stay visible even when the app is closed (optional).
- **Invisible Mode**: Users can quickly toggle visibility off from the main dashboard.
- **No Precise Location**: The app will never share exact coordinates. It will only show "Within X meters/kilometers".

## 3. Admin Controls (Country-wise)
- **Geofencing**: Admins can enable/disable the Nearby feature for specific countries to comply with local regulations.
- **Global Toggle**: Ability to shut down the feature globally in case of emergency.

## 4. Admin Controls (User-wise)
- **Safety Ban**: Admins can revoke Nearby access for specific users reported for harassment or stalking.
- **Verified Only**: Option to restrict Nearby discovery to verified users only.

## 5. User Opt-in Toggle
- A dedicated toggle in Settings > Privacy > Nearby.
- Clear explanation of what data is shared.

## 6. Approximate Location
- Coordinate fuzzing: Add random noise (e.g., 50-100m) to coordinates before sending to the server.
- Distance calculation happens on the server, not the client.

## 7. Distance Radius
- Adjustable by user: 500m, 1km, 5km, 10km.
- Results sorted by proximity.

## 8. Block/Report Safety
- "Report for Nearby Misuse" category in reporting flow.
- Blocking a user immediately hides you from their Nearby list and vice-versa.

## 9. Database Plan
- **Table**: `user_locations`
  - `user_id` (PK, FK)
  - `last_coordinates` (Point/Geography type)
  - `is_visible` (Boolean)
  - `updated_at` (Timestamp)
- Use Spatial Indexing (e.g., PostGIS GIST) for efficient proximity queries.

## 10. API Plan
- `POST /api/nearby/update`: Update user location (throttled to once every 5-10 mins).
- `GET /api/nearby/users`: Fetch list of nearby users within a specific radius.
- `DELETE /api/nearby/visibility`: Turn off visibility.

## 11. Future Real-Time Upgrade
- Use WebSockets to push "User X is now nearby" notifications if both users have high-precision mode enabled.

## 12. Risk List
- **Stalking**: Mitigated by coordinate fuzzing and strict blocking.
- **Battery Drain**: Mitigated by throttled updates and "active app only" defaults.
- **Data Privacy**: All location data must be encrypted and automatically deleted after 24 hours of inactivity.

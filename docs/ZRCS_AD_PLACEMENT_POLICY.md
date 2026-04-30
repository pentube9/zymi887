# ZRCS AD PLACEMENT POLICY

## 1. Safety Principles
- **No Intrusion**: Ads must never interrupt a user's primary task (talking, messaging).
- **No Accidental Clicks**: Ads must not be placed near interactive elements like send buttons or call controls.
- **Natural Transitions**: Ads should only appear at the natural end of a flow or in non-intrusive scrollable lists.

## 2. Allowed Placements
- **App Open (`app_open`)**: Only after the splash screen finishes loading. Frequency capped at minimum 4 hours between shows.
- **Chat List Native (`chat_list_native`)**: In the main chat conversation list, inserted dynamically every 8–12 items.
- **Call End Interstitial (`call_end_interstitial`)**: Shown *only* after a call ends entirely and the user is returning to the chat or dashboard. Frequency capped at minimum 30 minutes.
- **Settings Banner (`settings_banner`)**: Anchored at the bottom of the Settings or Profile screen. Must not overlap content.
- **Rewarded Unlock (`rewarded_unlock`)**: Only triggered by an explicit user action (e.g., "Watch ad to unlock feature").

## 3. Forbidden Placements & States
- **During Active Calls**: No ads of any format during an ongoing audio or video call.
- **During WebRTC Connection**: No ads while signaling, connecting, or reconnecting.
- **While Typing**: No interstitials or banners popping up while the keyboard is open or the user is typing a message.
- **After Message Send**: No interstitials immediately after pressing send.
- **Near Controls**: No ads placed within 50px of the chat composer, send button, or any call control button.
- **Overlays**: No ads overlaying the incoming call modal or active call screen.
- **Fake UI**: No ads that mimic the app's UI to force clicks.

## 4. Frequency Capping Requirements
- `call_end_interstitial`: Minimum 30 minutes between impressions.
- `app_open`: Minimum 4 hours between impressions.
- `native_refresh`: Minimum 60 seconds before auto-refreshing a native ad unit.
- `rewarded_unlock`: Dependent on user trigger, no automatic firing.

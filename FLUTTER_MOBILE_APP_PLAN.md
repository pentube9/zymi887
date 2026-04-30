# FLUTTER_MOBILE_APP_PLAN — Future Native Mobile App

## Goal
Create a Flutter mobile app for Android and iOS that connects to the existing QiBo backend.

## Mobile Stack
- Flutter
- Dart
- socket_io_client
- flutter_webrtc
- dio/http
- secure_storage
- push notifications

## Mobile Features
Phase 1:
- Login/register
- User list
- Private chat
- Message history
- Online/offline status

Phase 2:
- Audio call
- Video call
- Push notification
- Profile settings

Phase 3:
- Groups
- Media messages
- Voice messages
- Admin moderation tools if needed

## API Compatibility
Reuse existing backend:
- REST API for auth and history
- Socket.io for realtime chat and signaling
- WebRTC for calls

## Recommended Flutter Structure
```txt
lib/
├── core/
├── features/
│   ├── auth/
│   ├── chat/
│   ├── call/
│   └── profile/
├── services/
├── shared/
└── main.dart
```

## Mobile UI Direction
Keep same visual identity:
- Dark navy background
- Cyan/purple accents
- Glass cards where suitable
- Smooth transitions
- Native-safe spacing

## Important
Flutter app must not require a new backend. It should reuse and strengthen the current Node/Express/Socket.io backend.

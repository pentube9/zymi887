# 01_MASTER PROMPT — QiBo / ZYMI Communication App

## Product Identity
Build **QiBo** as a modern real-time communication platform similar in category to WhatsApp, IMO, and Telegram.  
Legacy code may contain the name **ZYMI**. Treat **QiBo** as the public brand and **ZYMI** as legacy/internal naming until fully migrated.

## Core Goal
Create a fast, secure, responsive communication app with:
- One-to-one chat
- Real-time message delivery
- Audio call
- Video call
- User authentication
- Online/offline presence
- Message history
- Modern dark glassmorphism UI
- Admin-controlled gamification and moderation-ready structure
- Future-safe architecture for mobile, desktop, and browser

## Existing Stack
Frontend:
- React
- Vite
- Socket.io-client
- CSS modules/global CSS or Tailwind-compatible architecture

Backend:
- Node.js
- Express
- Socket.io
- SQLite using better-sqlite3

Security:
- bcryptjs for password hashing
- Environment-based secrets
- Input validation
- Route protection

Real-time:
- Socket.io for chat, presence, call signaling
- WebRTC for audio/video peer-to-peer streams

## Design Direction
Use a premium futuristic dark UI:
- Background: `#0f172a`, `#111827`, `#020617`
- Primary accent: Cyan `#06b6d4`
- Secondary accent: Purple `#8b5cf6`
- Success: Emerald `#10b981`
- Danger: Red `#ef4444`
- Glass panels: `rgba(30, 41, 59, 0.70)`
- Border: `rgba(148, 163, 184, 0.18)`
- Blur: `backdrop-filter: blur(16px)`

## Required Platforms
The app must work smoothly on:
- Android mobile browser
- iPhone Safari
- Desktop browser
- Tablet
- Future Flutter mobile app
- PWA-ready layout

## Main Rule
Never break the existing working chat/call flow while adding features. Extend safely through modules, services, hooks, and reusable components.

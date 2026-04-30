# STRUCTURE_LOCK — Locked Project Rules

## Locked Identity
- Public app name: QiBo
- Legacy/internal code name: ZYMI
- Do not randomly introduce new names.

## Locked Core Stack
- React + Vite frontend
- Node.js + Express backend
- Socket.io realtime layer
- SQLite database
- WebRTC calls

## Locked Design Language
- Dark navy background
- Cyan/purple gradient accents
- Glassmorphism panels
- Smooth responsive layout
- Premium communication-app feel

## Locked Core Features
These must always remain working:
- Login
- Register
- User list
- Private chat
- Message history
- Realtime message delivery
- Audio call
- Video call
- Responsive layout

## Locked Folder Philosophy
- Auth code in auth modules
- Chat code in chat modules
- Call code in call modules
- Admin code in admin modules
- Shared constants in shared folder
- No giant mixed files

## Change Approval Rule
Any change touching socket, WebRTC, auth, or database schema must be reviewed carefully and tested on desktop and mobile.

## Final Rule
Build forward without breaking what already works.

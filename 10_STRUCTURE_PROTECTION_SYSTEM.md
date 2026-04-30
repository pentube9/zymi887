# 10_STRUCTURE_PROTECTION_SYSTEM — Architecture Protection Rules

## Purpose
Protect the project from becoming messy as new features are added.

## Protected Areas
Do not casually rewrite:
- Authentication flow
- Socket connection lifecycle
- WebRTC signaling flow
- Database schema migration logic
- Main dashboard routing
- Global design tokens

## Safe Change Process
Before changing core systems:
1. Identify affected modules.
2. Create backup branch.
3. Add feature flag if risky.
4. Test login, chat, and call.
5. Confirm responsive behavior.
6. Update documentation.

## Forbidden Practices
- Mixing backend code inside frontend components
- Putting all logic inside `Dashboard.jsx`
- Hardcoding API URLs throughout the app
- Storing plain passwords
- Trusting client-side admin status
- Breaking mobile layout for desktop-only changes
- Changing socket event names without updating both sides

## Required Tests Before Release
- Register user
- Login user
- View user list
- Send private message
- Receive private message live
- Load old messages
- Start audio call
- Start video call
- Reject call
- End call
- Use on mobile width
- Refresh page without crash

## Rule
Any new feature must be additive, modular, and reversible.

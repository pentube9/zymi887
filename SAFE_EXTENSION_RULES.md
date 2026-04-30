# SAFE_EXTENSION_RULES — Rules for Adding New Features

## Purpose
This document explains how to safely add features without breaking chat, call, auth, or responsive UI.

## Safe Feature Checklist
Before adding a feature:
- Is it separate from core socket connection?
- Does it need backend changes?
- Does it need database migration?
- Does it affect mobile layout?
- Does it affect authentication?
- Can it be feature-flagged?

## Recommended Pattern
Add new features using:
- New component folder
- New service file
- New API route file
- New socket handler file
- New database migration
- New tests/checklist

## Do Not
- Add unrelated logic to `Dashboard.jsx`
- Rewrite socket events casually
- Change existing payload shape without backward compatibility
- Store secrets in frontend
- Put admin logic on client only
- Break small-screen layout

## Feature Flag Example
```js
const features = {
  gamification: true,
  groupChat: false,
  mediaMessages: false
};
```

## Extension Priority
1. Stabilize auth/chat/call
2. Improve responsive UI
3. Add admin tools
4. Add gamification
5. Add media messages
6. Add groups
7. Build Flutter app

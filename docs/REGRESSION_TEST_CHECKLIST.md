# ZYMI (QiBo) Regression Test Checklist

## Core Real-Time Safety Tests

### Socket.io Event Flow
- [ ] `join` event works correctly
- [ ] `private-message` sends and receives messages in real-time
- [ ] `incoming-call` triggers call modal
- [ ] `call-answer` completes WebRTC handshake
- [ ] `ice-candidate` exchanges ICE candidates
- [ ] `end-call` terminates call properly
- [ ] `reject-call` handles rejection gracefully
- [ ] `typing` and `stop-typing` indicators work
- [ ] No event renaming or ID structure changes

### WebRTC Signaling
- [ ] Audio call initiation works
- [ ] Video call initiation works
- [ ] Offer/answer exchange completes
- [ ] ICE candidates are exchanged
- [ ] Call connects and streams audio/video
- [ ] Call termination works both sides
- [ ] Call rejection works

### Dashboard.jsx Core Logic
- [ ] User list loads correctly
- [ ] Message history loads correctly
- [ ] New messages appear in real-time
- [ ] Video call UI renders correctly
- [ ] Audio call UI renders correctly
- [ ] Call controls work (mute, camera, speaker)
- [ ] Incoming call modal appears
- [ ] Call status updates correctly

## Feature Tests

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Admin login at /exclusivesecure/login works
- [ ] Unauthorized access to admin routes blocked
- [ ] Session persistence works

### Messaging
- [ ] Send message to another user
- [ ] Receive message from another user
- [ ] Message history loads per conversation
- [ ] Typing indicator shows when other user types
- [ ] Unread message counter updates
- [ ] Message search returns results

### Profile System
- [ ] Click on user avatar shows profile modal
- [ ] Profile shows username and ID

### Calls
- [ ] Start audio call
- [ ] Start video call
- [ ] Accept incoming call
- [ ] Reject incoming call
- [ ] End call from calling side
- [ ] End call from receiving side
- [ ] Call status badge shows correctly

### Admin Panel
- [ ] Dashboard loads at /exclusivesecure
- [ ] Stats display correctly (users, messages, connections)
- [ ] User management shows all users
- [ ] Search users works
- [ ] Ban user works
- [ ] Unban user works
- [ ] Audit logs display correctly
- [ ] Risk alerts show correctly

### Connection Handling
- [ ] Connection banner shows when connecting
- [ ] Connection banner shows when reconnecting
- [ ] Connection banner shows when offline
- [ ] Banner disappears when connected

## Mobile Layout Tests

### Responsive Design
- [ ] Login page mobile layout works
- [ ] Dashboard sidebar collapses on mobile
- [ ] User list scrolls on mobile
- [ ] Message area scrolls on mobile
- [ ] Call controls visible on mobile
- [ ] Admin panel mobile layout works

### Touch Interactions
- [ ] User selection works with tap
- [ ] Send message works with button tap
- [ ] Call buttons work with tap
- [ ] Profile modal closes with tap outside

## Database & Migration Tests

### Schema Migrations
- [ ] is_read column added to messages (if not exists)
- [ ] role column added to users (if not exists)
- [ ] is_banned column added to users (if not exists)
- [ ] admin_audit_logs table created
- [ ] No data loss on migration

### Admin Functions
- [ ] Ban user creates audit log
- [ ] Unban user creates audit log
- [ ] Admin login creates audit log

## Security Tests

### Admin Security
- [ ] /exclusivesecure redirects unauthenticated users
- [ ] /exclusivesecure/login requires admin credentials
- [ ] API endpoints require admin token
- [ ] Cannot ban admin users

### User Security
- [ ] Banned users cannot connect
- [ ] Banned users see suspension message
- [ ] Messages from banned users blocked

## Performance Tests

### Load Times
- [ ] Initial page load under 3 seconds
- [ ] User list loads quickly
- [ ] Message history loads quickly
- [ ] Admin stats load with 5-second refresh

### Real-Time Performance
- [ ] Messages deliver within 500ms
- [ ] Typing indicator appears within 300ms
- [ ] Call notifications appear within 500ms

## Test Accounts

### Default Users
- Username: Jakir, Password: dhdhd@1344
- Username: Mainzy, Password: dhdhd@1345

### Admin Account
- Username: admin, Password: admin123
- URL: http://localhost:5175/exclusivesecure/login

## Running Tests

1. Start server: `cd server && npm start`
2. Start client: `cd client && npm run dev`
3. Open browser: http://localhost:5175
4. Test admin panel: http://localhost:5175/exclusivesecure/login

## Test Execution Notes

- Run tests in order: Auth → Chat → Calls → Admin
- Test on both desktop and mobile viewport sizes
- Test with multiple browser tabs for real-time features
- Clear localStorage between test sessions
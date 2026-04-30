# 02_CHAT_SYSTEM — Real-Time Chat System

## Purpose
The chat system manages real-time private messaging between users.

## Main Features
- Private one-to-one messaging
- Message persistence in SQLite
- Message delivery through Socket.io
- Chat history loading through REST API
- User list with online/offline state
- Selected user conversation screen
- Empty welcome state when no user is selected

## Database Tables

### users
Recommended fields:
- id
- name
- username
- email
- password_hash
- avatar_url
- status
- created_at
- updated_at

### messages
Recommended fields:
- id
- sender_id
- receiver_id
- body
- message_type
- status
- created_at
- updated_at

Message status:
- sent
- delivered
- seen
- failed

## REST API
Recommended routes:
- `GET /api/users`
- `GET /api/messages/:userId`
- `POST /api/messages`
- `DELETE /api/messages/:messageId`

## Socket Events

### Client emits
- `user-online`
- `private-message`
- `typing-start`
- `typing-stop`
- `message-seen`

### Server emits
- `online-users`
- `private-message`
- `typing-start`
- `typing-stop`
- `message-delivered`
- `message-seen`

## Message Flow
1. User selects a contact.
2. Client loads previous messages using REST API.
3. User sends message.
4. Client emits `private-message`.
5. Server saves message to SQLite.
6. Server sends message to receiver if online.
7. Receiver UI updates instantly.
8. Delivery/seen status updates through Socket.io.

## UI Rules
- Left sidebar shows users.
- Main panel shows selected conversation.
- Empty state shows QiBo/ZYMI welcome message.
- Messages must be visually separated by sender.
- Input area must be fixed at bottom on desktop and mobile.
- Mobile layout should turn sidebar and chat into route-like screens.

## Safety Rules
- Validate message length.
- Escape unsafe text.
- Never trust socket payloads without checking sender identity.
- Rate-limit spam messages.

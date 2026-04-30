# 03_CALL_SYSTEM — Audio & Video Calling System

## Purpose
The call system enables real-time audio and video calls using WebRTC, with Socket.io used only for signaling.

## Core Technology
- WebRTC for media stream exchange
- Socket.io for signaling
- STUN/TURN servers for connection reliability

## Required Features
- Audio call
- Video call
- Incoming call modal
- Outgoing call screen
- Accept call
- Reject call
- End call
- Mute microphone
- Toggle camera
- Speaker/device handling when available
- Call status display

## Socket Events

### Client emits
- `call-user`
- `call-answer`
- `call-reject`
- `call-ended`
- `ice-candidate`

### Server emits
- `incoming-call`
- `call-answered`
- `call-rejected`
- `call-ended`
- `ice-candidate`

## WebRTC Flow
1. Caller creates local media stream.
2. Caller creates RTCPeerConnection.
3. Caller creates offer.
4. Caller sends offer via Socket.io.
5. Receiver sees incoming call modal.
6. Receiver accepts and creates answer.
7. ICE candidates are exchanged.
8. Peer-to-peer audio/video starts.
9. Either user can end call.

## Recommended Peer Configuration
Use STUN initially:
```js
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};
```

For production, add TURN:
```js
{
  urls: "turn:your-turn-server.com:3478",
  username: "turn-user",
  credential: "turn-password"
}
```

## UI Rules
- Call panel should use full-screen dark mode.
- Video tiles should be responsive.
- Local preview should be small floating card.
- End call button must be red.
- Mute/camera buttons must be clear.
- Incoming call modal must show caller name and call type.

## Safety Rules
- Ask browser permission for mic/camera.
- Stop all media tracks when call ends.
- Clean peer connection on disconnect.
- Handle rejected, busy, offline, and timeout states.

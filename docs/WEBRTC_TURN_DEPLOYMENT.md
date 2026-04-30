# WebRTC TURN/STUN Deployment Guide

## Overview
This guide covers configuring STUN and TURN servers for WebRTC calls in production environments where NAT traversal is required.

## Current Status
- WebRTC config helper created: `client/src/config/webrtcConfig.js`
- Dashboard.jsx not yet wired to use the config
- Default: Google STUN servers only
- TURN: Optional via environment variables

## STUN vs TURN

### STUN (Session Traversal Utilities for NAT)
- **Purpose:** Helps clients discover their public IP and port
- **Use case:** Basic NAT traversal for simple networks
- **Limitation:** Fails when both peers are behind symmetric NATs
- **Default:** Google STUN servers (works for most home/office networks)

### TURN (Traversal Using Relays around NAT)
- **Purpose:** Relay server for WebRTC traffic when direct connection fails
- **Use case:** Required for corporate firewalls, mobile networks, complex NAT
- **Limitation:** Higher latency, server costs
- **Recommendation:** Self-hosted coturn (free, open-source)

## Environment Variables

```bash
# STUN servers (comma-separated URLs)
VITE_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302

# TURN servers (leave empty to disable)
VITE_TURN_URLS=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=your-turn-username
VITE_TURN_CREDENTIAL=your-turn-password
```

## Self-Hosted TURN Server (coturn)

### Installation
```bash
# Ubuntu/Debian
sudo apt install coturn

# Docker
docker run -d --network=host coturn/coturn
```

### Basic Configuration
```bash
# /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
realm=your-domain.com
server-name=your-turn-server.com
user=username:password
```

### Docker Compose Example
```yaml
services:
  coturn:
    image: coturn/coturn
    ports:
      - "3478:3478"
      - "3478:3478/udp"
    environment:
      - TURN_SERVER_CONFIG=turnserver.conf
    volumes:
      - ./turnserver.conf:/etc/coturn/turnserver.conf:ro
```

## Configuration Behavior

### STUN Only (Default)
- Uses Google STUN servers
- Works for: Home networks, simple office setups
- Fails with: Corporate firewalls, mobile data, symmetric NAT

### STUN + TURN
- Falls back to TURN when STUN fails
- Works for: All network types
- Trade-off: Higher latency, server costs

### Graceful Fallback
- If TURN env vars missing → STUN only (no errors)
- If TURN env vars present → STUN + TURN
- Config validation happens at runtime

## WebRTC Flow (Unchanged)
1. Dashboard.jsx creates RTCPeerConnection
2. Signaling via Socket.io (offer/answer/ice-candidate)
3. ICE candidates gathered and exchanged
4. Direct P2P connection or TURN relay

## Testing Checklist
- [ ] Same WiFi network: Call connects with STUN
- [ ] Different WiFi networks: Test TURN fallback
- [ ] Mobile data: Verify TURN relay works
- [ ] Corporate network: Test firewall compatibility
- [ ] TURN disabled: Confirm graceful STUN-only operation
- [ ] Environment vars: Test config loading

## Security Considerations
- TURN credentials transmitted over HTTPS (required for WebRTC)
- TURN server should be protected (firewall, authentication)
- Monitor TURN server usage for abuse
- Consider TURN server rate limiting

## Next Steps
Phase 3B: Wire config into Dashboard.jsx (minimal import change only)
- Import getWebRTCConfig from webrtcConfig.js
- Replace hardcoded iceServers with getWebRTCConfig()
- No other Dashboard.jsx changes

## Troubleshooting
- Check browser console for ICE connection failures
- Verify TURN server is accessible on port 3478
- Test STUN servers: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
- TURN server logs for connection attempts
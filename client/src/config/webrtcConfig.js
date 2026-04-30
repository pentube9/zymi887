// WebRTC Configuration Helper
// Provides environment-based STUN/TURN server configuration for WebRTC peer connections
// Default: Google STUN servers only
// Optional: TURN servers via environment variables

/**
 * Get WebRTC configuration object with STUN/TURN servers
 * @returns {Object} WebRTC configuration with iceServers array
 */
export function getWebRTCConfig() {
  const stunUrls = import.meta.env.VITE_STUN_URLS || 'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302';
  const turnUrls = import.meta.env.VITE_TURN_URLS;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  const iceServers = [];

  // Add STUN servers (always included)
  if (stunUrls) {
    const stunServerList = stunUrls.split(',').map(url => ({ urls: url.trim() }));
    iceServers.push(...stunServerList);
  }

  // Add TURN servers (only if configured)
  if (turnUrls && turnUsername && turnCredential) {
    const turnServerList = turnUrls.split(',').map(url => ({
      urls: url.trim(),
      username: turnUsername.trim(),
      credential: turnCredential.trim()
    }));
    iceServers.push(...turnServerList);
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10
  };
}

// Default export for convenience
export default { getWebRTCConfig };
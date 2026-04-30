import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './CallOverlay.css';

const CallOverlay = forwardRef(function CallOverlay({ 
  callStatus, callType, incomingCall, selectedUser, 
  localStream, remoteStream, 
  localVideoRef, remoteVideoRef,
  onAccept, onReject, onEndCall, 
  onToggleMic, onToggleCamera, onToggleSpeaker, 
  micOn, cameraOn, isLoudspeaker 
}, ref) {

  useImperativeHandle(ref, () => ({
    getRemoteVideo: () => remoteVideoRef?.current,
    getLocalVideo: () => localVideoRef?.current
  }), [remoteVideoRef, localVideoRef]);

  if (callStatus === 'idle' && !incomingCall) return null;

  if (incomingCall) {
    return (
      <div className="call-overlay incoming">
        <div className="call-overlay-bg" />
        <div className="call-overlay-content">
          <div className="caller-info">
            <div className="caller-avatar-large">
              {incomingCall.from ? String(incomingCall.from)[0].toUpperCase() : '?'}
            </div>
            <h2 className="caller-name">{incomingCall.fromName || selectedUser?.username || 'Unknown Caller'}</h2>
            <p className="call-state">
              {callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
            </p>
            <div className="pulse-ring" />
          </div>
          <div className="call-actions">
            <button id="reject-call-btn" className="call-action-btn reject" onClick={onReject} aria-label="Reject Call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
            <button id="accept-call-btn" className="call-action-btn accept" onClick={onAccept} aria-label="Accept Call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`call-overlay ${callStatus}`}>
      <div className="call-overlay-bg" />
      {(callStatus === 'calling' || callStatus === 'ringing') && (
        <div className="call-overlay-content outgoing">
          <div className="caller-info">
            <div className="caller-avatar-large">
              {selectedUser?.username ? selectedUser.username[0].toUpperCase() : '?'}
            </div>
            <h2 className="caller-name">{selectedUser?.username || 'Unknown User'}</h2>
            <p className="call-state">{callStatus === 'calling' ? 'Calling...' : 'Ringing...'}</p>
            <div className="calling-animation">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
          <div className="call-actions">
            <button id="end-call-btn" className="call-action-btn end" onClick={onEndCall} aria-label="End Call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {callStatus === 'connected' && (
        <div className="call-overlay-content connected">
          {callType === 'video' ? (
            <div className="video-grid-overlay">
              <div className="remote-video-wrapper">
                {remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline />
                ) : (
                  <div className="video-placeholder">
                    <div className="caller-avatar-large">
                      {selectedUser?.username ? selectedUser.username[0].toUpperCase() : '?'}
                    </div>
                  </div>
                )}
                <div className="remote-name">{selectedUser?.username}</div>
              </div>
              <div className="local-video-wrapper">
                {localStream && cameraOn && (
                  <video ref={localVideoRef} autoPlay playsInline muted />
                )}
                {!cameraOn && (
                  <div className="video-placeholder local-off">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 1l22 22"/>
                      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/>
                    </svg>
                  </div>
                )}
                <div className="local-name">You</div>
              </div>
            </div>
          ) : (
            <div className="audio-call-overlay">
              <div className="caller-avatar-large audio">
                {selectedUser?.username ? selectedUser.username[0].toUpperCase() : '?'}
              </div>
              <h2 className="caller-name">{selectedUser?.username || 'Unknown User'}</h2>
              <p className="call-duration">Connected</p>
            </div>
          )}

          <div className="call-controls-overlay">
            <button
              id="toggle-mic-btn"
              className={`call-control-btn ${!micOn ? 'off' : ''}`}
              onClick={onToggleMic}
              aria-label={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micOn ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>

            {callType === 'video' && (
              <button
                id="toggle-camera-btn"
                className={`call-control-btn ${!cameraOn ? 'off' : ''}`}
                onClick={onToggleCamera}
                aria-label={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraOn ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            )}

            <button
              id="toggle-speaker-btn"
              className={`call-control-btn ${!isLoudspeaker ? 'off' : ''}`}
              onClick={onToggleSpeaker}
              aria-label={isLoudspeaker ? 'Turn Off Speaker' : 'Turn On Speaker'}
            >
              {isLoudspeaker ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              )}
            </button>

            <button
              id="end-connected-call-btn"
              className="call-control-btn end-call"
              onClick={onEndCall}
              aria-label="End Call"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {callStatus === 'ended' && (
        <div className="call-overlay-content ended">
          <div className="call-ended-info">
            <p>Call Ended</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default CallOverlay;
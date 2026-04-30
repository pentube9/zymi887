import React from 'react';
import './PremiumIncomingCallModal.css';

const PremiumIncomingCallModal = ({
  incomingCall,
  onAccept,
  onReject,
  callType
}) => {
  if (!incomingCall) return null;

  const caller = incomingCall.caller || {};

  return (
    <div className="zy-incoming-call-overlay">
      <div className="zy-incoming-call-container">
        <div className="zy-call-glow" />
        
        <div className="zy-caller-card">
          <div className="zy-caller-avatar-wrapper">
            <div className="zy-caller-avatar">
              {caller.avatar ? <img src={caller.avatar} alt="" /> : (caller.name || caller.username || '?')[0].toUpperCase()}
            </div>
            <div className="zy-call-type-badge">
              {callType === 'video' ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              )}
            </div>
          </div>

          <div className="zy-caller-details">
            <h2 className="zy-caller-name">{caller.name || caller.username || 'Unknown'}</h2>
            <p className="zy-call-label">ZYMI {callType === 'video' ? 'Video' : 'Audio'} Call</p>
          </div>
        </div>

        <div className="zy-call-footer">
          <button className="zy-call-action reject" onClick={onReject}>
            <div className="zy-action-circle">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }} />
              </svg>
            </div>
            <span>Decline</span>
          </button>

          <button className="zy-call-action accept" onClick={onAccept}>
            <div className="zy-action-circle">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                {callType === 'video' ? (
                  <>
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </>
                ) : (
                   <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                )}
              </svg>
            </div>
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumIncomingCallModal;
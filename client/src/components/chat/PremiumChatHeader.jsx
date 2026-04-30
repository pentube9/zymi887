import React from 'react';
import './PremiumChatHeader.css';

const PremiumChatHeader = ({
  selectedUser,
  isOnline,
  isTyping,
  onBack,
  onStartAudioCall,
  onStartVideoCall,
  onMoreActions
}) => {
  if (!selectedUser) return null;

  return (
    <div className="zy-premium-chat-header">
      <div className="zy-header-left">
        {onBack && (
          <button className="zy-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="zy-header-user">
          <div className="zy-header-avatar-area">
            <div className="zy-header-avatar">
              {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" /> : (selectedUser.name || selectedUser.username)[0].toUpperCase()}
            </div>
            <div className={`zy-header-status-dot ${isOnline ? 'online' : 'offline'}`} />
          </div>
          
          <div className="zy-header-info">
            <h3 className="zy-header-name">{selectedUser.name || selectedUser.username}</h3>
            <p className={`zy-header-status ${isOnline ? 'online' : ''}`}>
              {isTyping ? 'Typing...' : (isOnline ? 'Active Now' : 'Offline')}
            </p>
          </div>
        </div>
      </div>

      <div className="zy-header-actions">
        <button className="zy-header-btn audio" onClick={onStartAudioCall} title="Audio Call">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
        </button>
        
        <button className="zy-header-btn video" onClick={onStartVideoCall} title="Video Call">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        <div className="zy-header-divider" />
        
        <button className="zy-header-btn more" onClick={onMoreActions} title="More Settings">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PremiumChatHeader;
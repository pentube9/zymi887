import React from 'react';
import './ContactProfilePanel.css';

const ContactProfilePanel = ({
  selectedUser,
  onlineUsers,
  lastSeen,
  onBlockUser,
  onMuteChat,
  onViewMedia,
  onViewProfile
}) => {
  if (!selectedUser) return null;

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Recently';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const isOnline = onlineUsers[selectedUser.id];

  return (
    <div className="zy-profile-panel">
      <div className="zy-profile-header">
        <div className="zy-profile-avatar-wrapper">
          <div className="zy-profile-avatar">
            {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" /> : (selectedUser.name || selectedUser.username)[0].toUpperCase()}
          </div>
          <div className={`zy-profile-status-ring ${isOnline ? 'online' : ''}`} />
        </div>
        <div className="zy-profile-info">
          <h2 className="zy-profile-name">{selectedUser.name || selectedUser.username}</h2>
          <p className="zy-profile-status-label">
            {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen[selectedUser.id])}`}
          </p>
        </div>
      </div>

      <div className="zy-profile-content">
        <div className="zy-profile-section">
          <h3>Information</h3>
          <div className="zy-info-item">
            <span className="zy-info-label">Username</span>
            <span className="zy-info-value">@{selectedUser.username}</span>
          </div>
          <div className="zy-info-item">
            <span className="zy-info-label">Bio</span>
            <p className="zy-info-bio">{selectedUser.bio || 'Digital citizen of ZYMI.'}</p>
          </div>
        </div>

        <div className="zy-profile-section">
          <h3>Settings</h3>
          <div className="zy-settings-list">
            <button className="zy-settings-btn" onClick={onMuteChat}>
              <div className="zy-settings-icon">🔕</div>
              <span>Mute Notifications</span>
              <div className="zy-settings-toggle" />
            </button>
            <button className="zy-settings-btn" onClick={onViewMedia}>
              <div className="zy-settings-icon">🖼️</div>
              <span>Shared Media</span>
              <div className="zy-settings-arrow">→</div>
            </button>
            <button className="zy-settings-btn warning" onClick={onBlockUser}>
              <div className="zy-settings-icon">🚫</div>
              <span>Block Contact</span>
            </button>
          </div>
        </div>

        <div className="zy-profile-section">
          <h3>Recent Media</h3>
          <div className="zy-profile-media-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="zy-media-thumb-placeholder" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfilePanel;
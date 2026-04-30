function ChatHeader({ selectedUser, isTyping, onlineUsers, lastSeen, onBack, onAudioCall, onVideoCall, isMobile }) {
  const getStatus = () => {
    if (isTyping) return <span className="typing-text">typing...</span>;
    if (onlineUsers[selectedUser.id]) return 'online';
    if (lastSeen[selectedUser.id]) return `last seen ${formatLastSeen(lastSeen[selectedUser.id])}`;
    return 'offline';
  };

  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-header">
      <div className="chat-user-info">
        {isMobile && (
          <button className="back-btn" onClick={onBack} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div className="chat-avatar">{selectedUser.username[0].toUpperCase()}</div>
        <div className="chat-details">
          <span className="chat-name">{selectedUser.username}</span>
          <span className="chat-status">{getStatus()}</span>
        </div>
      </div>
      <div className="chat-actions">
        <button className="call-btn audio" onClick={() => onAudioCall(selectedUser.id)} title="Audio call" aria-label="Start audio call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
        <button className="call-btn video" onClick={() => onVideoCall(selectedUser.id)} title="Video call" aria-label="Start video call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
import React from 'react';
import PremiumMediaRenderer from './PremiumMediaRenderer';
import './PremiumMessageBubble.css';

const PremiumMessageBubble = ({
  message,
  isSent,
  timestamp,
  status,
  onMediaClick,
  onRetry
}) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatus = () => {
    if (!isSent) return null;
    
    const isRead = status === 'read' || message.is_read === 1;
    const isDelivered = status === 'delivered';
    const isSentStatus = status === 'sent';
    const isPending = status === 'pending';
    const isFailed = status === 'failed';

    if (isPending) return <span className="zy-status pending">🕒</span>;
    if (isFailed) return (
      <button className="zy-retry-btn" onClick={() => onRetry?.(message)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      </button>
    );
    
    return (
      <div className={`zy-status-ticks ${isRead ? 'read' : ''}`}>
        <svg viewBox="0 0 16 11" width="16" height="11" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 5l4 4 10-10" />
          {(isRead || isDelivered) && <path d="M5 5l4 4 10-10" style={{ transform: 'translateX(-4px)' }} />}
        </svg>
      </div>
    );
  };

  const renderContent = () => {
    if (message.message_type && message.message_type !== 'text') {
      return <PremiumMediaRenderer message={message} onMediaClick={onMediaClick} />;
    }

    return (
      <div className="zy-message-content">
        {message.content}
      </div>
    );
  };

  return (
    <div className={`zy-message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className="zy-message-bubble">
        {renderContent()}
        <div className="zy-bubble-footer">
          <span className="zy-timestamp">{formatTime(timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default PremiumMessageBubble;
import React from 'react';
import PremiumMessageBubble from './PremiumMessageBubble';
import './PremiumMessageList.css';

const PremiumMessageList = ({
  messages,
  currentUserId,
  typingUsers,
  messagesEndRef,
  onMediaClick
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = new Date(msg.timestamp || msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="zy-premium-message-list">
      <div className="zy-messages-container">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date} className="zy-message-group">
            <div className="zy-date-divider">
              <div className="zy-divider-line" />
              <span className="zy-date-text">{formatDate(date)}</span>
              <div className="zy-divider-line" />
            </div>
            {dateMessages.map((message, index) => (
              <PremiumMessageBubble
                key={message.id || message.tempId || index}
                message={message}
                isSent={message.sender_id === currentUserId}
                timestamp={message.timestamp || message.created_at}
                status={message.status}
                onMediaClick={onMediaClick}
              />
            ))}
          </div>
        ))}
        
        {typingUsers && typingUsers.length > 0 && (
          <div className="zy-typing-indicator-container">
            <div className="zy-typing-bubble">
              <div className="zy-typing-dots">
                <span className="zy-dot" />
                <span className="zy-dot" />
                <span className="zy-dot" />
              </div>
              <span className="zy-typing-label">
                {typingUsers.map(u => u.name || u.username).join(', ')} is typing
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="zy-messages-bottom-spacer" />
      </div>
    </div>
  );
};

export default PremiumMessageList;
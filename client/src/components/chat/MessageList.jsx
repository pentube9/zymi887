import MessageBubble from './MessageBubble';

function MessageList({ messages, currentUser, loading, typing, onEndRef }) {
  // Empty state when no messages
  if (!loading && messages.length === 0) {
    return (
      <div className="chat-empty">
        <div className="empty-icon">💬</div>
        <p className="empty-title">No messages yet</p>
        <p className="empty-subtitle">Send the first message to start the conversation!</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="chat-empty">
        <div className="loading-spinner"></div>
        <p className="empty-subtitle">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id || msg.tempId || i}
          message={msg}
          isOwn={msg.sender_id === currentUser.id}
        />
      ))}
      {typing && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div ref={onEndRef} />
    </>
  );
}

export default MessageList;
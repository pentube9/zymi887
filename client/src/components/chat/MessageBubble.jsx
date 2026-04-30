function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isOwn ? 'sent' : 'received'}`}>
      <div className="message-bubble">{message.content}</div>
      <div className="message-meta">
        <span className="message-time">{formatTime(message.timestamp)}</span>
        {message.pending && <span className="message-pending">· sending</span>}
      </div>
    </div>
  );
}

export default MessageBubble;
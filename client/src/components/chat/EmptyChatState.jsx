function EmptyChatState({ mode = 'default', title, subtitle }) {
  if (mode === 'default') {
    return (
      <div className="no-chat-selected">
        <div className="welcome-icon">💬</div>
        <h2>Welcome to ZYMI</h2>
        <p>Select a conversation to start messaging or calling</p>
      </div>
    );
  }

  if (mode === 'empty') {
    return (
      <div className="chat-empty">
        <div className="empty-icon">💬</div>
        <p className="empty-title">{title || 'No messages yet'}</p>
        <p className="empty-subtitle">{subtitle || 'Send the first message to start the conversation!'}</p>
      </div>
    );
  }

  if (mode === 'search') {
    return (
      <div className="empty-state">
        <p>{title || 'No results found'}</p>
      </div>
    );
  }

  if (mode === 'users') {
    return (
      <div className="empty-state">
        <p>{title || 'No chats yet'}</p>
      </div>
    );
  }

  return null;
}

export default EmptyChatState;
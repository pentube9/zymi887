import { useState, useRef, useEffect } from 'react';
import MobileChatHeader from './MobileChatHeader.jsx';
import './MobileConversationScreen.css';

function MobileConversationScreen({ user, selectedUser, messages, onSendMessage, onBack, onEndCall }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage({ ...selectedUser, content: newMessage.trim() });
    setNewMessage('');
  };

  return (
    <div className="mobile-conversation">
      <MobileChatHeader user={selectedUser} onBack={onBack} />

      <div className="mobile-messages">
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`mobile-message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
          >
            <div className="mobile-message-bubble">{msg.content}</div>
            <span className="mobile-message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="mobile-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default MobileConversationScreen;

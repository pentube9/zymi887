import React, { useState, useRef, useEffect } from 'react';
import './PremiumMessageComposer.css';

const PremiumMessageComposer = ({
  onSendMessage,
  onAttachFile,
  onShareLocation,
  onStartRecording,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onAttachFile(files);
    };
    input.click();
  };

  return (
    <div className="zy-premium-composer">
      <div className="zy-composer-container">
        <div className="zy-composer-glass">
          <div className="zy-composer-actions left">
            <button className="zy-composer-btn" onClick={() => {}} title="Emoji">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
              </svg>
            </button>
            
            <button className="zy-composer-btn" onClick={handleAttachClick} title="Attach">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            <button className="zy-composer-btn" onClick={onShareLocation} title="Location">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </button>
          </div>

          <div className="zy-composer-input-wrapper">
            <textarea
              ref={inputRef}
              rows="1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="zy-composer-textarea"
              disabled={disabled}
            />
          </div>

          <div className="zy-composer-actions right">
            {message.trim() ? (
              <button className="zy-composer-send-btn" onClick={handleSubmit} disabled={disabled}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            ) : (
              <button 
                className={`zy-composer-btn mic ${isRecording ? 'recording' : ''}`} 
                onClick={() => { setIsRecording(!isRecording); onStartRecording(); }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumMessageComposer;
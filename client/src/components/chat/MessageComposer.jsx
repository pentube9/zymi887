function MessageComposer({ value, onChange, onSend, onKeyDown, disabled, inputRef }) {
  return (
    <form className="message-input-area" onSubmit={onSend}>
      <button type="button" className="composer-btn" disabled title="Emoji (coming soon)" aria-label="Insert emoji">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        </svg>
      </button>
      <button type="button" className="composer-btn" disabled title="Attach file (coming soon)" aria-label="Attach file">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        aria-label="Type your message"
        disabled={disabled}
      />
      <button type="submit" className="send-btn" disabled={disabled || !value?.trim()} aria-label="Send message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </form>
  );
}

export default MessageComposer;
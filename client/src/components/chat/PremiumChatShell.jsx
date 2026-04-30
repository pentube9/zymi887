import React from 'react';
import './PremiumChatShell.css';

const PremiumChatShell = ({
  sidebar,
  header,
  messageList,
  composer,
  profilePanel,
  mobileHome,
  isMobile,
  selectedUser
}) => {
  if (isMobile) {
    // Mobile: full screen views
    return (
      <div className="zy-chat-shell mobile">
        {selectedUser ? (
          <div className="zy-mobile-chat-view">
            {header}
            <div className="zy-mobile-message-area">
              {messageList}
            </div>
            {composer}
          </div>
        ) : (
          <div className="zy-mobile-home-view">
            {mobileHome}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 3-column layout
  return (
    <div className="zy-chat-shell desktop">
      <div className="zy-sidebar-column">
        {sidebar}
      </div>
      <div className="zy-chat-column">
        {selectedUser ? (
          <>
            {header}
            <div className="zy-message-area">
              {messageList}
            </div>
            {composer}
          </>
        ) : (
          <div className="zy-empty-state">
            <span className="zy-empty-title">Select a conversation to start chatting</span>
            <span className="zy-empty-subtitle">Choose a contact to begin messaging or calling</span>
          </div>
        )}
      </div>
      {selectedUser && profilePanel && (
        <div className="zy-profile-column">
          {profilePanel}
        </div>
      )}
    </div>
  );
};

export default PremiumChatShell;
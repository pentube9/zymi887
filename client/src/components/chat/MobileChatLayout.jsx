import { useState } from 'react';
import MobileUserListScreen from './MobileUserListScreen.jsx';
import MobileConversationScreen from './MobileConversationScreen.jsx';
import './MobileChatLayout.css';

function MobileChatLayout({ user, users, onSelectUser, onBack, selectedUser, messages, onSendMessage, onEndCall, typingUsers = {} }) {
  const [isChat, setIsChat] = useState(!!selectedUser);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setIsChat(true);
  };

  const handleBack = () => {
    setIsChat(false);
    onBack();
  };

  return (
    <div className="mobile-chat-layout">
      {isChat ? (
        <MobileConversationScreen
          user={user}
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={onSendMessage}
          typingUsers={typingUsers}
          onBack={handleBack}
          onEndCall={onEndCall}
        />
      ) : (
        <MobileUserListScreen
          user={user}
          users={users}
          onSelectUser={handleSelectUser}
        />
      )}
    </div>
  );
}

export default MobileChatLayout;

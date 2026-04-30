import React, { useState, useRef, useEffect } from 'react';
import PremiumChatHeader from './PremiumChatHeader';
import PremiumMessageList from './PremiumMessageList';
import PremiumMessageComposer from './PremiumMessageComposer';
import './MobileConversationScreen.css';

const MobileConversationScreen = ({
  user,
  selectedUser,
  messages,
  onSendMessage,
  onAttachFile,
  onShareLocation,
  onStartRecording,
  onBack,
  onStartAudioCall,
  onStartVideoCall,
  isOnline,
  typingUsers
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeTypingUsers = Object.values(typingUsers || {}).filter(u => u.isTyping && u.id === selectedUser?.id);

  return (
    <div className="zy-mobile-conversation">
      <div className="zy-mobile-conv-header">
        <PremiumChatHeader
          selectedUser={selectedUser}
          isOnline={isOnline}
          isTyping={activeTypingUsers.length > 0}
          onBack={onBack}
          onStartAudioCall={onStartAudioCall}
          onStartVideoCall={onStartVideoCall}
          onMoreActions={() => {}}
        />
      </div>

      <div className="zy-mobile-conv-messages">
        <PremiumMessageList
          messages={messages}
          currentUserId={user.id}
          typingUsers={activeTypingUsers}
          messagesEndRef={messagesEndRef}
          onMediaClick={() => {}}
        />
      </div>

      <div className="zy-mobile-conv-composer">
        <PremiumMessageComposer
          onSendMessage={onSendMessage}
          onAttachFile={onAttachFile}
          onShareLocation={onShareLocation}
          onStartRecording={onStartRecording}
        />
        <div className="zy-mobile-safe-bottom" />
      </div>
    </div>
  );
};

export default MobileConversationScreen;

import React, { useState, useEffect } from 'react';
import PremiumChatSidebar from './PremiumChatSidebar';
import NearbyDiscovery from './NearbyDiscovery';
import './MobileChatHome.css';

const MobileChatHome = ({
  users,
  selectedUser,
  onSelectUser,
  searchQuery,
  onSearchChange,
  onlineUsers,
  typingUsers,
  lastMessagePreview,
  unreadCounts,
  currentUser,
  onStartNewChat
}) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [showPicker, setShowPicker] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'calls':
        return (
          <div className="zy-mobile-placeholder">
            <div className="zy-placeholder-icon">📞</div>
            <h3>No Recent Calls</h3>
            <p>Your call history will appear here</p>
          </div>
        );
      case 'nearby':
        return (
          <NearbyDiscovery 
            currentUser={currentUser} 
            onSelectUser={onSelectUser} 
          />
        );
      case 'people':
        return (
          <div className="zy-mobile-people-list">
            <div className="zy-mobile-list-header">
              <h2>Directory</h2>
            </div>
            <div className="zy-directory-items">
              {users.map(user => (
                <div key={user.id} className="zy-directory-item" onClick={() => onSelectUser(user)}>
                  <div className={`zy-directory-avatar ${onlineUsers[user.id] ? 'online' : ''}`}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="zy-directory-info">
                    <span className="zy-directory-name">{user.username}</span>
                    <span className="zy-directory-status">{onlineUsers[user.id] ? 'Active Now' : 'Offline'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="zy-mobile-placeholder">
            <div className="zy-placeholder-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Premium configuration coming soon</p>
          </div>
        );
      default:
        return (
          <>
            <div className="zy-mobile-stories">
              <div className="zy-story-item add">
                <div className="zy-story-avatar">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span>My Status</span>
              </div>
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="zy-story-item">
                  <div className={`zy-story-avatar ${onlineUsers[user.id] ? 'online' : ''}`}>
                    {user.username?.[0].toUpperCase() || 'U'}
                  </div>
                  <span>{user.username}</span>
                </div>
              ))}
            </div>

            <div className="zy-mobile-list-header">
              <h2>Recent Chats</h2>
              <button className="zy-filter-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                Filters
              </button>
            </div>

            <div className="zy-mobile-sidebar-container">
              <PremiumChatSidebar
                users={users}
                selectedUser={selectedUser}
                onSelectUser={onSelectUser}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onlineUsers={onlineUsers}
                typingUsers={typingUsers}
                lastMessagePreview={lastMessagePreview}
                unreadCounts={unreadCounts}
                currentUser={currentUser}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="zy-mobile-home">
      <div className="zy-mobile-top-bar">
        <div className="zy-mobile-profile">
          <div className="zy-mobile-avatar">
            {currentUser.username?.[0].toUpperCase() || 'U'}
          </div>
          <h1 className="zy-mobile-title">ZYMI</h1>
        </div>
        <div className="zy-mobile-top-actions">
          <button className="zy-mobile-action-btn" onClick={() => onSearchChange('')} aria-label="Search">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button className="zy-mobile-action-btn" aria-label="More">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="zy-mobile-content">
        {renderContent()}
      </div>

      <div className="zy-mobile-nav">
        <button className={`zy-nav-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span>Chats</span>
        </button>
        <button className={`zy-nav-btn ${activeTab === 'calls' ? 'active' : ''}`} onClick={() => setActiveTab('calls')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span>Calls</span>
        </button>
        
        <button className="zy-mobile-fab" onClick={() => setShowPicker(true)} aria-label="New Message">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <button className={`zy-nav-btn ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <span>Nearby</span>
        </button>

        <button className={`zy-nav-btn ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>People</span>
        </button>
      </div>

      {showPicker && (
        <div className="zy-mobile-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="zy-mobile-picker" onClick={e => e.stopPropagation()}>
            <div className="zy-picker-header">
              <h3>New Conversation</h3>
              <button onClick={() => setShowPicker(false)}>✕</button>
            </div>
            <div className="zy-picker-list">
              {users.map(user => (
                <div key={user.id} className="zy-picker-item" onClick={() => { onSelectUser(user); setShowPicker(false); }}>
                  <div className="zy-picker-avatar">{user.username[0].toUpperCase()}</div>
                  <div className="zy-picker-info">
                    <span className="zy-picker-name">{user.username}</span>
                    <span className="zy-picker-status">{onlineUsers[user.id] ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileChatHome;
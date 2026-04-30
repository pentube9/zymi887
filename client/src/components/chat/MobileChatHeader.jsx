import BackToUsersButton from './BackToUsersButton.jsx';
import './MobileChatHeader.css';

function MobileChatHeader({ user, onBack, onInfoClick }) {
  return (
    <div className="mobile-chat-header">
      <BackToUsersButton onClick={onBack} />
      <div className="user-info" onClick={onInfoClick}>
        <div className="user-avatar">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <span className="user-name">{user?.username}</span>
          <span className="user-status">Online</span>
        </div>
      </div>
    </div>
  );
}

export default MobileChatHeader;
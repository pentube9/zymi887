import './MobileUserListScreen.css';

function MobileUserListScreen({ user, users, onSelectUser }) {
  return (
    <div className="mobile-user-list">
      <div className="mobile-user-list-header">
        <h1>Chats</h1>
        <div className="user-avatar-small">{user?.username?.[0]?.toUpperCase()}</div>
      </div>
      <div className="users-container">
        {users.map(u => (
          <div
            key={u.id}
            className="mobile-user-item"
            onClick={() => onSelectUser(u)}
          >
            <div className="mobile-user-avatar">
              {u.username[0].toUpperCase()}
            </div>
            <div className="mobile-user-info">
              <span className="mobile-user-name">{u.username}</span>
              <span className="mobile-user-status">Online</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MobileUserListScreen;

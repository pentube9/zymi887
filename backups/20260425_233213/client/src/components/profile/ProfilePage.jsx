import { useState, useEffect } from 'react';
import AvatarUploader from './AvatarUploader.jsx';
import './ProfilePage.css';

function ProfilePage({ user, onUpdate }) {
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setUsername(user?.username || '');
    setAvatar(user?.avatar || null);
  }, [user]);

  const handleAvatarUpdate = (newAvatar) => {
    setAvatar(newAvatar);
    onUpdate?.({ ...user, avatar: newAvatar });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('zymi_token');
      const res = await fetch(`http://localhost:3001/api/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        onUpdate({ ...user, username: data.username });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="avatar-section">
          <AvatarUploader
            userId={user?.id}
            currentAvatar={avatar}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Profile updated!</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="account-info">
          <h3>Account Information</h3>
          <div className="info-row">
            <span className="info-label">User ID</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-value">{user?.role || 'user'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Socket ID</span>
            <span className="info-value muted">Not displayed for security</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
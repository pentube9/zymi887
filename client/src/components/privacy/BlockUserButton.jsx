import { useState } from 'react';
import { API_URL } from '../../config/api.js';
import './BlockUserButton.css';

function BlockUserButton({ currentUserId, targetUserId, targetUsername }) {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBlock = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/block/${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      
      if (res.ok) {
        setBlocked(true);
      }
    } catch (err) {
      console.error('Failed to block user');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/block/${currentUserId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      
      if (res.ok) {
        setBlocked(false);
      }
    } catch (err) {
      console.error('Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <button className="block-btn unblocked" onClick={handleUnblock} disabled={loading}>
        {loading ? 'Unblocking...' : 'Unblock User'}
      </button>
    );
  }

  if (showConfirm) {
    return (
      <div className="block-confirm">
        <span>Block {targetUsername}?</span>
        <div className="confirm-actions">
          <button className="block-btn confirm-yes" onClick={handleBlock} disabled={loading}>
            Yes
          </button>
          <button className="block-btn confirm-no" onClick={() => setShowConfirm(false)}>
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className="block-btn" onClick={handleBlock}>
      Block User
    </button>
  );
}

export default BlockUserButton;
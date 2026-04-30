import { useState, useEffect } from 'react';
import './PrivacySettings.css';

function PrivacySettings({ userId }) {
  const [settings, setSettings] = useState({
    onlineVisibility: true,
    readReceipt: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage first
    const stored = localStorage.getItem('zymi_settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, [userId]);

  const handleToggle = async (key) => {
    const newValue = !settings[key];
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('zymi_token');
      const endpoint = key === 'onlineVisibility'
        ? `/api/settings/${userId}`
        : `/api/settings/${userId}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: newValue })
      });

      if (res.ok) {
        const updated = { ...settings, [key]: newValue };
        setSettings(updated);
        localStorage.setItem('zymi_settings', JSON.stringify(updated));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        console.error('Failed to update setting');
      }
    } catch (err) {
      console.error('Error updating setting:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="privacy-settings">
      <div className="setting-item">
        <div className="setting-info">
          <span className="setting-label">Online Visibility</span>
          <span className="setting-desc">
            Show your online status to other users
          </span>
        </div>
        <button
          className={`toggle-btn ${settings.onlineVisibility ? 'active' : ''}`}
          onClick={() => handleToggle('onlineVisibility')}
          disabled={loading}
        >
          <span className="toggle-dot"></span>
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <span className="setting-label">Read Receipts</span>
          <span className="setting-desc">
            Let senders know when you've read their messages
          </span>
        </div>
        <button
          className={`toggle-btn ${settings.readReceipt ? 'active' : ''}`}
          onClick={() => handleToggle('readReceipt')}
          disabled={loading}
        >
          <span className="toggle-dot"></span>
        </button>
      </div>

      {saved && <div className="saved-indicator">✓ Saved</div>}
    </div>
  );
}

export default PrivacySettings;

import { useState, useEffect } from 'react';
import './SettingsPage.css';
import PrivacySettings from './PrivacySettings.jsx';

function SettingsPage({ user }) {
  const [settings, setSettings] = useState({
    notificationSound: true,
    callRingtone: true,
    theme: 'dark'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('zymi_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('zymi_settings', JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (theme) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    localStorage.setItem('zymi_settings', JSON.stringify(newSettings));
    setSaved(true);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        {saved && <span className="saved-indicator">✓ Saved</span>}
      </div>

      <div className="settings-section">
        <h2>Sound</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Notification Sound</span>
            <span className="setting-desc">Play sound for new messages</span>
          </div>
          <button
            className={`toggle-btn ${settings.notificationSound ? 'active' : ''}`}
            onClick={() => handleToggle('notificationSound')}
          >
            <span className="toggle-dot"></span>
          </button>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Call Ringtone</span>
            <span className="setting-desc">Play ringtone for incoming calls</span>
          </div>
          <button
            className={`toggle-btn ${settings.callRingtone ? 'active' : ''}`}
            onClick={() => handleToggle('callRingtone')}
          >
            <span className="toggle-dot"></span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Theme</span>
          </div>
          <div className="theme-buttons">
            <button
              className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
            <button
              className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Privacy</h2>
        <PrivacySettings userId={user?.id} />
      </div>
    </div>
  );
}

export default SettingsPage;
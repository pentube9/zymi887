import React, { useState, useEffect, useCallback } from 'react';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import './NearbyDiscovery.css';

const NearbyDiscovery = ({ currentUser, onSelectUser }) => {
  const { loading: gateLoading, allowed: isNearbyAllowed, reason: gateReason } = useFeatureGate('nearby_enabled');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/nearby/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` }
      });
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching nearby status:', err);
    }
  }, []);

  const fetchNearbyUsers = useCallback(async () => {
    if (!status?.discoveryEnabled) return;
    setLoading(true);
    try {
      const response = await fetch('/api/nearby/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNearbyUsers(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load nearby users');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (isNearbyAllowed) {
      fetchStatus().finally(() => setLoading(false));
    } else if (!gateLoading) {
      setLoading(false);
    }
  }, [isNearbyAllowed, gateLoading, fetchStatus]);

  useEffect(() => {
    if (status?.discoveryEnabled) {
      fetchNearbyUsers();
    }
  }, [status, fetchNearbyUsers]);

  const handleOptIn = async () => {
    setLoading(true);
    try {
      // 1. Request browser location first
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 2. Opt-in on server
        await fetch('/api/nearby/opt-in', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` 
          }
        });

        // 3. Update location on server
        // We'll use a mock country/city for now or a reverse geocoding service if available
        // For this task, we'll just send coordinates and dummy city
        await fetch('/api/nearby/update-location', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` 
          },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            country: 'Detection...', 
            city: 'Near You',
            accuracy: position.coords.accuracy
          })
        });

        fetchStatus();
      }, (err) => {
        setLocationPermission('denied');
        setError('Location access denied');
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to enable discovery');
      setLoading(false);
    }
  };

  const handleReport = async (userId) => {
    const reason = prompt('Reason for reporting?');
    if (!reason) return;
    try {
      await fetch('/api/nearby/report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` 
        },
        body: JSON.stringify({ targetUserId: userId, reason })
      });
      alert('User reported');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (userId) => {
    if (!confirm('Block this user from seeing you nearby?')) return;
    try {
      await fetch('/api/nearby/block', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` 
        },
        body: JSON.stringify({ targetUserId: userId })
      });
      setNearbyUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  if (gateLoading || loading) {
    return (
      <div className="zy-nearby-loading">
        <div className="zy-spinner"></div>
        <span>Initializing Discovery...</span>
      </div>
    );
  }

  if (!isNearbyAllowed) {
    return (
      <div className="zy-mobile-placeholder">
        <div className="zy-placeholder-icon">🚫</div>
        <h3>Nearby Disabled</h3>
        <p>{gateReason || 'This feature is unavailable in your region.'}</p>
      </div>
    );
  }

  if (!status?.discoveryEnabled) {
    return (
      <div className="zy-mobile-placeholder">
        <div className="zy-placeholder-icon">📍</div>
        <h3>Discover Nearby</h3>
        <p>Connect with people within your city securely.</p>
        <ul className="zy-nearby-perks">
          <li>✨ Your exact location is never shown</li>
          <li>🛡️ Only approximate distance labels used</li>
          <li>🔒 You can opt-out anytime</li>
        </ul>
        <button className="zy-premium-btn primary" onClick={handleOptIn}>
          Enable Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="zy-nearby-container">
      <div className="zy-nearby-header">
        <div className="zy-nearby-info">
          <h2>Nearby People</h2>
          <span>Radius: {status.radiusKm}km</span>
        </div>
        <button className="zy-nearby-refresh" onClick={fetchNearbyUsers}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {nearbyUsers.length === 0 ? (
        <div className="zy-nearby-empty">
          <div className="zy-placeholder-icon">🛰️</div>
          <h3>Scanning Area...</h3>
          <p>No users found nearby right now. Try again later!</p>
        </div>
      ) : (
        <div className="zy-nearby-list">
          {nearbyUsers.map(user => (
            <div key={user.id} className="zy-nearby-card">
              <div className="zy-nearby-card-main" onClick={() => onSelectUser(user)}>
                <div className={`zy-nearby-avatar ${user.is_online ? 'online' : ''}`}>
                  {user.avatar ? <img src={user.avatar} alt="" /> : (user.username?.[0] || 'U').toUpperCase()}
                </div>
                <div className="zy-nearby-details">
                  <span className="zy-nearby-name">{user.username}</span>
                  <span className="zy-nearby-dist">{user.distanceLabel} • {user.city || 'Unknown'}</span>
                </div>
              </div>
              <div className="zy-nearby-actions">
                <button className="zy-nearby-action-btn report" onClick={() => handleReport(user.id)} title="Report">
                  🚩
                </button>
                <button className="zy-nearby-action-btn block" onClick={() => handleBlock(user.id)} title="Block">
                  🚫
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="zy-nearby-footer">
        <p>Visible to others nearby • <button onClick={() => fetch('/api/nearby/opt-out', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('zymi_token')}` } }).then(() => fetchStatus())}>Go Invisible</button></p>
      </div>
    </div>
  );
};

export default NearbyDiscovery;

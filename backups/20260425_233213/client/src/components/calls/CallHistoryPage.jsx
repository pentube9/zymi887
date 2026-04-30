import { useState, useEffect } from 'react';
import './CallHistoryPage.css';

function CallHistoryPage({ user }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:3001/api/calls/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data);
      }
    } catch (err) {
      console.error('Failed to fetch call history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getCallPartner = (call) => {
    return call.caller_id === user.id ? call.receiver_username : call.caller_username;
  };

  const getCallType = (call) => {
    return call.call_type === 'video' ? 'Video Call' : 'Audio Call';
  };

  if (loading) {
    return <div className="call-history-page loading">Loading...</div>;
  }

  return (
    <div className="call-history-page">
      <div className="call-history-header">
        <h1>Call History</h1>
      </div>

      {calls.length === 0 ? (
        <div className="no-calls">No call history yet</div>
      ) : (
        <div className="call-list">
          {calls.map(call => (
            <div key={call.id} className="call-item">
              <div className="call-icon">
                {call.call_type === 'video' ? '📹' : '📞'}
              </div>
              <div className="call-info">
                <div className="call-partner">{getCallPartner(call)}</div>
                <div className="call-time">{formatTime(call.started_at)}</div>
              </div>
              <div className="call-details">
                <span className={`call-status-badge ${call.status}`}>
                  {call.status}
                </span>
                <span className="call-type">{getCallType(call)}</span>
                {call.duration > 0 && (
                  <span className="call-duration">{formatDuration(call.duration)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CallHistoryPage;
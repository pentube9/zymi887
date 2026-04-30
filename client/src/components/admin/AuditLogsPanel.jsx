import React, { useState, useEffect } from 'react';

const AuditLogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/features/audit-logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>Governance Audit Logs</h3>
        <p>Full history of administrative actions and feature changes</p>
      </div>
      <div className="zy-admin-table-container">
        <table className="zy-admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin ID</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              let details = log.details;
              try {
                const parsed = JSON.parse(log.details);
                details = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ');
              } catch (e) {}

              return (
                <tr key={log.id}>
                  <td className="zy-timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                  <td>Admin #{log.admin_id}</td>
                  <td><span className="zy-action-type">{log.action}</span></td>
                  <td>{log.target_user_id ? `User #${log.target_user_id}` : 'Global'}</td>
                  <td className="zy-details-cell">{details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPanel;

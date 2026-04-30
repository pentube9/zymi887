import React, { useState, useEffect } from 'react';

const FeatureControlPanel = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/admin/features', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setFeatures(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching features:', error);
      setLoading(false);
    }
  };

  const handleToggle = async (featureKey, currentEnabled) => {
    try {
      await fetch('/api/admin/features/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ featureKey, enabled: !currentEnabled })
      });
      fetchFeatures();
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  };

  if (loading) return <div>Loading features...</div>;

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>Global Feature Control</h3>
        <p>Master toggles for ZYMI platform capabilities</p>
      </div>
      <div className="zy-admin-table-container">
        <table className="zy-admin-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {features.map(f => (
              <tr key={f.feature_key}>
                <td className="zy-feature-key">{f.feature_key}</td>
                <td>{f.description}</td>
                <td>
                  <span className={`zy-status-badge ${f.enabled ? 'active' : 'inactive'}`}>
                    {f.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button 
                    className={`zy-admin-btn ${f.enabled ? 'danger' : 'success'}`}
                    onClick={() => handleToggle(f.feature_key, f.enabled)}
                  >
                    {f.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureControlPanel;

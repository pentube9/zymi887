import React, { useState } from 'react';
import FeatureControlPanel from './FeatureControlPanel';
import GeoControlPanel from './GeoControlPanel';
import UserFeatureControlPanel from './UserFeatureControlPanel';
import AuditLogsPanel from './AuditLogsPanel';
import GovernanceSimulator from './GovernanceSimulator';
import NearbyControlPanel from './NearbyControlPanel';
import './AdminGovernance.css';

const AdminGovernance = () => {
  const [activeTab, setActiveTab] = useState('features');

  const renderTab = () => {
    switch (activeTab) {
      case 'features': return <FeatureControlPanel />;
      case 'geo': return <GeoControlPanel />;
      case 'users': return <UserFeatureControlPanel />;
      case 'nearby': return <NearbyControlPanel />;
      case 'simulate': return <GovernanceSimulator />;
      case 'audit': return <AuditLogsPanel />;
      default: return <FeatureControlPanel />;
    }
  };

  return (
    <div className="zy-admin-governance-page">
      <div className="zy-admin-header">
        <h1>Governance & Feature Control</h1>
        <div className="zy-admin-nav-tabs">
          <button 
            className={`zy-admin-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Global Flags
          </button>
          <button 
            className={`zy-admin-tab ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            Nearby Control
          </button>
          <button 
            className={`zy-admin-tab ${activeTab === 'geo' ? 'active' : ''}`}
            onClick={() => setActiveTab('geo')}
          >
            Geo Restrictions
          </button>
          <button 
            className={`zy-admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Rules
          </button>
          <button 
            className={`zy-admin-tab ${activeTab === 'simulate' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulate')}
          >
            Simulator
          </button>
          <button 
            className={`zy-admin-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Governance Logs
          </button>
        </div>
      </div>
      
      <div className="zy-admin-content">
        {renderTab()}
      </div>
    </div>
  );
};

export default AdminGovernance;

import { projectBrainData } from './projectBrainData.js';
import { getStatusColor } from './projectBrainUtils.js';

function CompletedPendingTracker() {
  const { completedPendingTracker } = projectBrainData;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in-progress':
        return 'badge-primary';
      case 'pending':
        return 'badge-secondary';
      case 'verify-required':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="status-section">
      <h2><span>📋</span>{completedPendingTracker.title}</h2>
      <div className="tracker-list">
        {completedPendingTracker.items.map((item, index) => (
          <div key={index} className="tracker-item">
            <div className="tracker-header">
              <span className={`tracker-badge ${getStatusBadgeClass(item.status)}`}>{item.status.toUpperCase()}</span>
              <span className="tracker-feature">{item.feature}</span>
            </div>
            <div className="tracker-description">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompletedPendingTracker;
import { projectBrainData } from './projectBrainData.js';
import { getStatusColor } from './projectBrainUtils.js';

function ProjectHealthCards() {
  const { healthCards } = projectBrainData;

  return (
    <div className="stats-grid">
      {Object.values(healthCards).map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon" style={{ color: getStatusColor(card.status) }}>
            {card.icon}
          </div>
          <div className="stat-value">
            {card.uptime || card.connections || card.activeCalls || 'OK'}
          </div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

export default ProjectHealthCards;
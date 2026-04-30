import { projectBrainData } from './projectBrainData.js';
import { getStatusColor } from './projectBrainUtils.js';

function RealTimeCoreStatusPanel() {
  const { realTimeCoreStatus } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>⚡</span>{realTimeCoreStatus.title}</h2>
      <div className="core-components">
        {realTimeCoreStatus.components.map((component, index) => (
          <div key={index} className="core-component">
            <div className="component-header">
              <span className="component-name">{component.name}</span>
              <span className="component-role">{component.role}</span>
            </div>
            <div className="component-description">{component.description}</div>
            <div className="component-status" style={{ color: getStatusColor(component.status) }}>
              Status: {component.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RealTimeCoreStatusPanel;
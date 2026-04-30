import { projectBrainData } from './projectBrainData.js';

function ProjectBrainHeader() {
  const { header } = projectBrainData;

  return (
    <div className="admin-header">
      <h1>{header.title}</h1>
      <p>{header.subtitle}</p>
      <div className="status-section">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <div>
            <div className="status-text">{header.warning}</div>
            <div className="status-time">Last update: {header.lastUpdated}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectBrainHeader;
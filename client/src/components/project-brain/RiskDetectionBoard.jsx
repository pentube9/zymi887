import { projectBrainData } from './projectBrainData.js';
import { getRiskBadgeClass } from './projectBrainUtils.js';

function RiskDetectionBoard() {
  const { riskDetectionBoard } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>🚨</span>{riskDetectionBoard.title}</h2>
      {riskDetectionBoard.risks.map((risk, index) => (
        <div key={index} className={`risk-item ${risk.type}`}>
          <div className="risk-header">
            <span className={`risk-badge ${getRiskBadgeClass(risk.type)}`}>{risk.type.toUpperCase()}</span>
            <span className="risk-title">{risk.title}</span>
          </div>
          <div className="risk-description">{risk.description}</div>
          <div className="risk-impact">Impact: {risk.impact}</div>
          <div className="risk-mitigation">Mitigation: {risk.mitigation}</div>
        </div>
      ))}
    </div>
  );
}

export default RiskDetectionBoard;
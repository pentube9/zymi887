import { projectBrainData } from './projectBrainData.js';
import { getStatusColor } from './projectBrainUtils.js';

function WebRTCFlowGuard() {
  const { webrtcFlowGuard } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>📹</span>{webrtcFlowGuard.title}</h2>
      <div className="flow-steps">
        {webrtcFlowGuard.steps.map((step, index) => (
          <div key={index} className="flow-step">
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <div className="step-name" style={{ color: getStatusColor(step.status) }}>
                {step.step}
              </div>
              <div className="step-description">{step.description}</div>
              <div className="step-status">{step.status.toUpperCase()}</div>
            </div>
            {index < webrtcFlowGuard.steps.length - 1 && <div className="flow-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebRTCFlowGuard;
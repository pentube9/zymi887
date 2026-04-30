import { projectBrainData } from './projectBrainData.js';
import { getPhaseColor } from './projectBrainUtils.js';

function FeatureRoadmapBoard() {
  const { featureRoadmapBoard } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>🗺️</span>{featureRoadmapBoard.title}</h2>
      <div className="roadmap-phases">
        {featureRoadmapBoard.phases.map((phase, index) => (
          <div key={index} className="roadmap-phase">
            <div className="phase-header" style={{ borderLeftColor: getPhaseColor(phase.phase) }}>
              <h3 style={{ color: getPhaseColor(phase.phase) }}>{phase.phase}</h3>
            </div>
            <div className="phase-features">
              {phase.features.map((feature, idx) => (
                <div key={idx} className="roadmap-feature">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureRoadmapBoard;
import { projectBrainData } from './projectBrainData.js';

function ResponsiveSafetyPanel() {
  const { responsiveSafetyPanel } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>📱</span>{responsiveSafetyPanel.title}</h2>
      <div className="safety-rules">
        {responsiveSafetyPanel.rules.map((ruleGroup, index) => (
          <div key={index} className="safety-category">
            <h3>{ruleGroup.category}</h3>
            <ul>
              {ruleGroup.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveSafetyPanel;
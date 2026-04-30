import { projectBrainData } from './projectBrainData.js';

function DesignTokenInspector() {
  const { designTokenInspector } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>🎨</span>{designTokenInspector.title}</h2>
      <div className="token-categories">
        {designTokenInspector.categories.map((category, index) => (
          <div key={index} className="token-category">
            <h3>{category.name}</h3>
            <div className="token-list">
              {category.tokens.map((token, idx) => (
                <div key={idx} className="token-item">
                  <div className="token-name">{token.token}</div>
                  <div className="token-value">{token.value}</div>
                  <div className="token-description">{token.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignTokenInspector;
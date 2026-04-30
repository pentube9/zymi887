import { projectBrainData } from './projectBrainData.js';

function SharedComponentRegistry() {
  const { sharedComponentRegistry } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>📚</span>{sharedComponentRegistry.title}</h2>
      <div className="registry-categories">
        {sharedComponentRegistry.categories.map((category, index) => (
          <div key={index} className="registry-category">
            <h3>{category.name}</h3>
            <div className="registry-components">
              {category.components.map((component, idx) => (
                <div key={idx} className="registry-component">
                  <div className="component-header">
                    <span className="component-name">{component.name}</span>
                  </div>
                  <div className="component-details">
                    <div className="component-usage">
                      <strong>Usage:</strong> {component.usage}
                    </div>
                    <div className="component-rule">
                      <strong>Rule:</strong> {component.rule}
                    </div>
                    <div className="component-extension">
                      <strong>Extension:</strong> {component.extension}
                    </div>
                    <div className="component-warning">
                      <strong>Warning:</strong> {component.warning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SharedComponentRegistry;
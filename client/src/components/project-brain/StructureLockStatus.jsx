import { projectBrainData } from './projectBrainData.js';

function StructureLockStatus() {
  const { structureLockStatus } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>{structureLockStatus.locks[0].icon}</span>{structureLockStatus.title}</h2>
      {structureLockStatus.locks.map((lock, index) => (
        <div key={index} className="lock-category">
          <h3>{lock.category}</h3>
          <div className="lock-list">
            {lock.items.map((item, idx) => (
              <div key={idx} className="lock-item locked">
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StructureLockStatus;
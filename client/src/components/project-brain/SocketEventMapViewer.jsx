import { projectBrainData } from './projectBrainData.js';

function SocketEventMapViewer() {
  const { socketEventMapViewer } = projectBrainData;

  return (
    <div className="status-section">
      <h2><span>🔌</span>{socketEventMapViewer.title}</h2>
      <div className="event-map-container">
        <div className="event-section">
          <h3>Client Emits</h3>
          <div className="event-list">
            {socketEventMapViewer.clientEmits.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-name">{event.event}</div>
                <div className="event-description">{event.description}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="event-section">
          <h3>Server Emits</h3>
          <div className="event-list">
            {socketEventMapViewer.serverEmits.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-name">{event.event}</div>
                <div className="event-description">{event.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocketEventMapViewer;
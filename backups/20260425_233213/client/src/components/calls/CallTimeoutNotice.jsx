import { useEffect } from 'react';
import './CallTimeoutNotice.css';

function CallTimeoutNotice({ onClose }) {
  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="call-timeout-notice">
      <div className="timeout-content">
        <span className="timeout-icon">⏰</span>
        <h3>Call Timed Out</h3>
        <p>The call was not answered within 30 seconds.</p>
      </div>
    </div>
  );
}

export default CallTimeoutNotice;

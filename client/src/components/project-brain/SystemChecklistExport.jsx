import { useState } from 'react';
import { projectBrainData } from './projectBrainData.js';
import { copyToClipboard } from './projectBrainUtils.js';

function SystemChecklistExport() {
  const { systemChecklistExport } = projectBrainData;
  const [showTextarea, setShowTextarea] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExport = async () => {
    const success = await copyToClipboard(systemChecklistExport.checklist);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      setShowTextarea(true);
    }
  };

  const handleTextareaCopy = () => {
    const textarea = document.getElementById('checklist-textarea');
    textarea.select();
    document.execCommand('copy');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="status-section">
      <h2><span>📋</span>{systemChecklistExport.title}</h2>
      <div className="export-section">
        <p>Export the complete Project Brain system checklist as markdown.</p>
        <button className="action-btn primary" onClick={handleExport}>
          {copySuccess ? '✅ Copied!' : '📋 Copy Checklist'}
        </button>
        {showTextarea && (
          <div className="textarea-fallback">
            <p>Copy the checklist below:</p>
            <textarea
              id="checklist-textarea"
              value={systemChecklistExport.checklist}
              readOnly
              rows={20}
            />
            <button className="action-btn" onClick={handleTextareaCopy}>
              {copySuccess ? '✅ Copied!' : '📋 Copy from Textarea'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemChecklistExport;
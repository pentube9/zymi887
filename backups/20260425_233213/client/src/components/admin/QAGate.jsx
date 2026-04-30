import { useState, useEffect } from 'react';
import './QAGate.css';

const CHECKLIST = [
  { id: 'auth', label: 'User Login', category: 'Authentication' },
  { id: 'auth-admin', label: 'Admin Login', category: 'Authentication' },
  { id: 'message-send', label: 'Send/Receive Message', category: 'Messaging' },
  { id: 'typing', label: 'Typing Indicator', category: 'Messaging' },
  { id: 'unread', label: 'Unread Counter', category: 'Messaging' },
  { id: 'call-audio', label: 'Audio Call', category: 'Calls' },
  { id: 'call-video', label: 'Video Call', category: 'Calls' },
  { id: 'call-end', label: 'End/Reject Call', category: 'Calls' },
  { id: 'admin-route', label: 'Admin Route Protection', category: 'Admin' },
  { id: 'admin-ban', label: 'Ban/Unban User', category: 'Admin' },
  { id: 'admin-role', label: 'Role Assignment', category: 'Admin' },
  { id: 'admin-password', label: 'Password Change', category: 'Admin' },
  { id: 'mobile-layout', label: 'Mobile Layout', category: 'Mobile' },
  { id: 'block', label: 'Block User', category: 'Privacy' },
  { id: 'profile', label: 'Profile Update', category: 'User' },
  { id: 'settings', label: 'User Settings', category: 'User' }
];

function QAGate() {
  const [testRuns, setTestRuns] = useState(() => {
    const saved = localStorage.getItem('zymi_qa_runs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tester, setTester] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTests, setSelectedTests] = useState({});

  const saveRuns = (runs) => {
    localStorage.setItem('zymi_qa_runs', JSON.stringify(runs));
    setTestRuns(runs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRun = {
      id: Date.now(),
      tester: tester || 'Anonymous',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      results: Object.keys(selectedTests).filter(id => selectedTests[id]),
      notes: notes.trim()
    };

    saveRuns([newRun, ...testRuns]);
    setTester('');
    setNotes('');
    setSelectedTests({});
  };

  const toggleTest = (id) => {
    setSelectedTests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [...new Set(CHECKLIST.map(c => c.category))];

  const getPassCount = (run) => run.results.length;
  const totalTests = CHECKLIST.length;

  const exportRuns = () => {
    const dataStr = JSON.stringify(testRuns, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qa_test_runs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="qa-gate">
      <div className="qa-header">
        <h1>QA Gate</h1>
        <p>Manual test execution logging</p>
        <div className="qa-actions">
          <button className="btn-secondary" onClick={exportRuns}>Export Runs</button>
        </div>
      </div>

      <div className="qa-run-form">
        <h2>New Test Run</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Tester Name</label>
            <input
              type="text"
              value={tester}
              onChange={(e) => setTester(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="test-categories">
            {categories.map(category => (
              <div key={category} className="qa-category">
                <h3>{category}</h3>
                <div className="qa-items">
                  {CHECKLIST.filter(c => c.category === category).map(item => (
                    <label key={item.id} className="qa-item">
                      <input
                        type="checkbox"
                        checked={!!selectedTests[item.id]}
                        onChange={() => toggleTest(item.id)}
                      />
                      <span className="qa-label">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-row">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any issues or observations..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary">
            Submit Test Run
          </button>
        </form>
      </div>

      <div className="qa-history">
        <h2>Previous Runs</h2>
        {testRuns.length === 0 ? (
          <p className="no-runs">No test runs recorded.</p>
        ) : (
          <div className="runs-list">
            {testRuns.map(run => (
              <div key={run.id} className="run-item">
                <div className="run-header">
                  <span className="run-tester">{run.tester}</span>
                  <span className="run-date">{run.date}</span>
                </div>
                <div className="run-summary">
                  Passed: {run.results.length} / {totalTests}
                </div>
                {run.notes && <div className="run-notes">{run.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QAGate;

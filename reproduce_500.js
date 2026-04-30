import { get } from './server/src/db/database.js';

try {
  const result = get("SELECT COUNT(*) as count FROM call_history WHERE DATE(start_time) = DATE('now')");
  console.log('Result:', result);
} catch (err) {
  console.error('ERROR DETECTED:', err.message);
}

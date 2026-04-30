import express from 'express';

const router = express.Router();

const clientErrors = [];

router.post('/client-error', (req, res) => {
  const { error, userAgent, timestamp, url } = req.body;

  const logEntry = {
    error: error?.message || error,
    stack: error?.stack,
    userAgent,
    timestamp: timestamp || new Date().toISOString(),
    url,
    source: 'client'
  };

  clientErrors.push(logEntry);

  if (clientErrors.length > 1000) {
    clientErrors.shift();
  }

  console.log('[CLIENT_ERROR]', logEntry.error, logEntry.url);

  res.json({ received: true });
});

router.get('/client-errors', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const errors = clientErrors.slice(-limit);

  res.json({
    total: clientErrors.length,
    errors
  });
});

router.get('/client-errors/summary', (req, res) => {
  const summary = {
    total: clientErrors.length,
    byUrl: {},
    byError: {}
  };

  clientErrors.forEach(err => {
    const url = err.url || 'unknown';
    summary.byUrl[url] = (summary.byUrl[url] || 0) + 1;

    const errorKey = err.error?.substring(0, 50) || 'unknown';
    summary.byError[errorKey] = (summary.byError[errorKey] || 0) + 1;
  });

  res.json(summary);
});

router.delete('/client-errors', (req, res) => {
  clientErrors.length = 0;
  res.json({ cleared: true });
});

export default router;
import { getCallHistory } from '../services/callHistoryService.js';

export const getUserCallHistory = (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const history = getCallHistory(userId, limit);
  res.json(history);
};
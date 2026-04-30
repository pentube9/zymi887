import { get } from '../db/database.js';


export const canSeeUserOnline = (viewerId, targetId) => {
  const targetUser = get('SELECT online_visibility FROM users WHERE id = ?', targetId);
  if (!targetUser) return false;

  // If target user has online_visibility disabled, they won't appear online
  if (!targetUser.online_visibility) return false;

  // Future: implement per-blocker or friend-list exceptions
  return true;
};

export const shouldBroadcastOnline = (userId) => {
  const user = get('SELECT online_visibility FROM users WHERE id = ?', userId);
  return user?.online_visibility !== false; // default true
};

// Helper to filter users list based on online visibility
export const filterUsersByVisibility = (users, viewerId) => {
  return users.filter(user => canSeeUserOnline(viewerId, user.id));
};

// Utility functions for Project Brain Dashboard

export const getStatusColor = (status) => {
  switch (status) {
    case 'healthy':
    case 'active':
    case 'ready':
    case 'operational':
      return 'var(--neon-success)';
    case 'locked':
      return 'var(--neon-primary)';
    case 'warning':
      return 'var(--neon-warning)';
    case 'critical':
      return 'var(--neon-danger)';
    default:
      return 'var(--text-secondary)';
  }
};

export const getRiskBadgeClass = (type) => {
  switch (type) {
    case 'critical':
      return 'badge-danger';
    case 'high':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-secondary';
    default:
      return 'badge-secondary';
  }
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback:', err);
    }
  }
  return false;
};

export const getPhaseColor = (phase) => {
  switch (phase) {
    case 'Now':
      return 'var(--neon-success)';
    case 'Next':
      return 'var(--neon-primary)';
    case 'Later':
      return 'var(--neon-secondary)';
    case 'Hold / Verify Required':
      return 'var(--neon-warning)';
    default:
      return 'var(--text-secondary)';
  }
};
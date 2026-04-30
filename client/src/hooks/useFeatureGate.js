import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to check if a feature is enabled for the current user.
 * @param {string} featureKey - The unique key of the feature (e.g., 'nearby_enabled').
 * @returns {object} - { loading, allowed, reason, refresh }
 */
export const useFeatureGate = (featureKey) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [reason, setReason] = useState('');

  const checkAccess = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zymi_token');
      if (!token) {
        setAllowed(false);
        setReason('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/features/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ featureKey })
      });

      if (!response.ok) {
        throw new Error('Failed to check access');
      }

      const data = await response.json();
      setAllowed(data.allowed);
      setReason(data.reason || (data.allowed ? 'Available' : 'Restricted'));
    } catch (error) {
      console.error(`[FeatureGate] Error checking ${featureKey}:`, error);
      setAllowed(false);
      setReason('Error checking permissions');
    } finally {
      setLoading(false);
    }
  }, [featureKey]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { loading, allowed, reason, refresh: checkAccess };
};

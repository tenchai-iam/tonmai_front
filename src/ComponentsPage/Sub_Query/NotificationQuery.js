import { useState, useEffect, useCallback } from 'react';
import { getScenarioNotifications, markNotificationAsRead } from '../../services/api_Scenario.js';

/**
 * Hook for fetching and managing scenario notifications
 * @param {number} pollInterval - Polling interval in milliseconds (default: 5000)
 * @param {boolean} enabled - Enable/disable polling (default: true)
 * @returns {Object} Notifications data and methods
 */
export function useScenarioNotifications(pollInterval = 5000, enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      const data = await getScenarioNotifications(true, 50);
      setNotifications(data.notifications || []);
      setError(null);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Remove from notifications list
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );

      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all current notifications as read
      await Promise.all(
        notifications.map(n => markNotificationAsRead(n.id))
      );

      // Clear notifications list
      setNotifications([]);

      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, [notifications]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling if interval > 0
    if (pollInterval > 0) {
      const interval = setInterval(fetchNotifications, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, enabled, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
    lastFetchTime,
    count: notifications.length,
  };
}

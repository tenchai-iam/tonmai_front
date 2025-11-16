import { useState, useEffect, useCallback, useRef } from 'react';
import { getScenarioNotifications, markNotificationAsRead } from '../../services/api_Scenario.js';

/**
 * Hook for fetching and managing scenario notifications with time-based polling
 * @param {number} pollInterval - Polling interval in milliseconds (default: 5000)
 * @param {number|null} lastScenarioCreationTime - Timestamp of last scenario creation
 * @param {number} pollingDuration - How long to poll after scenario creation in ms (default: 15 minutes)
 * @returns {Object} Notifications data and methods
 */
export function useScenarioNotifications(
  pollInterval = 5000,
  lastScenarioCreationTime = null,
  pollingDuration = 15 * 60 * 1000, // 15 minutes
  onPollingComplete = null // Callback when polling should stop
) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const emptyPollCountRef = useRef(0); // Count consecutive empty polls

  const fetchNotifications = useCallback(async (isActivePolling = false) => {
    try {
      const data = await getScenarioNotifications(true, 50);
      const newNotifications = data.notifications || [];

      setNotifications(newNotifications);
      setError(null);
      setLastFetchTime(new Date());

      // Track empty polls for early stop - but only when NOT in active polling mode
      if (newNotifications.length === 0 && !isActivePolling) {
        emptyPollCountRef.current += 1;

        // If we've had 5 consecutive empty polls, stop polling early
        if (emptyPollCountRef.current >= 5) {
          console.log('Stopping polling - 5 consecutive empty polls');
          setIsPolling(false);
          if (onPollingComplete) {
            onPollingComplete();
          }
        }
      } else if (newNotifications.length > 0) {
        // Reset empty poll counter when we get notifications
        emptyPollCountRef.current = 0;
      }
      // Note: Don't increment emptyPollCountRef when isActivePolling=true
      // This ensures we keep polling for the full duration after scenario creation
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [onPollingComplete]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Remove from notifications list
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

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

  // Initial fetch on mount to check for existing notifications
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  useEffect(() => {
    // Time-based polling logic:
    // Only poll for {pollingDuration} minutes after last scenario creation

    if (!lastScenarioCreationTime) {
      // No scenarios created yet, don't start intensive polling
      setIsPolling(false);
      return;
    }

    // Reset empty poll counter when new scenario is created
    emptyPollCountRef.current = 0;

    const now = Date.now();
    const timeSinceCreation = now - lastScenarioCreationTime;

    if (timeSinceCreation > pollingDuration) {
      // More than 15 minutes since last scenario creation, stop polling
      console.log(`Stopping notification polling - ${Math.floor(timeSinceCreation / 60000)} minutes since last scenario creation`);
      setIsPolling(false);
      if (onPollingComplete) {
        onPollingComplete();
      }
      return;
    }

    // Within polling duration, start/continue polling
    const remainingTime = pollingDuration - timeSinceCreation;
    console.log(`Polling for notifications - ${Math.floor(remainingTime / 60000)} minutes remaining`);
    setIsPolling(true);

    // Initial fetch with active polling flag
    fetchNotifications(true);

    // Set up polling with active polling flag
    const interval = setInterval(() => fetchNotifications(true), pollInterval);

    // Set timeout to stop polling after duration expires
    const stopTimeout = setTimeout(() => {
      console.log('Polling duration expired - stopping notification polling');
      setIsPolling(false);
      if (onPollingComplete) {
        onPollingComplete();
      }
    }, remainingTime);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
    };
  }, [pollInterval, lastScenarioCreationTime, pollingDuration, fetchNotifications, onPollingComplete]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
    lastFetchTime,
    count: notifications.length,
    isPolling, // Expose polling state
  };
}

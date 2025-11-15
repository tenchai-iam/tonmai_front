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

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getScenarioNotifications(true, 50);
      const newNotifications = data.notifications || [];

      setNotifications(newNotifications);
      setError(null);
      setLastFetchTime(new Date());

      // Track empty polls for early stop
      if (newNotifications.length === 0) {
        emptyPollCountRef.current += 1;

        // If we've had 5 consecutive empty polls, stop polling early
        if (emptyPollCountRef.current >= 5) {
          console.log('Stopping polling - 5 consecutive empty polls');
          setIsPolling(false);
          if (onPollingComplete) {
            onPollingComplete();
          }
        }
      } else {
        // Reset empty poll counter when we get notifications
        emptyPollCountRef.current = 0;
      }
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
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notificationId);

        // If no more notifications after dismissing, reset empty poll counter
        // This allows 5 more polls to check for any other notifications
        if (updated.length === 0) {
          emptyPollCountRef.current = 0;
          console.log('All notifications dismissed - will poll 5 more times then stop');
        }

        return updated;
      });

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

      // Reset empty poll counter - will poll 5 more times then stop
      emptyPollCountRef.current = 0;
      console.log('All notifications dismissed - will poll 5 more times then stop');

      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, [notifications]);

  useEffect(() => {
    // Time-based polling logic:
    // Only poll for {pollingDuration} minutes after last scenario creation

    if (!lastScenarioCreationTime) {
      // No scenarios created yet, don't poll
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

    // Initial fetch
    fetchNotifications();

    // Set up polling
    const interval = setInterval(fetchNotifications, pollInterval);

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

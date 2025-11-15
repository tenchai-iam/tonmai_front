import React from "react";
import { useScenarioNotifications } from "../Sub_Query/NotificationQuery.js";
import "../../ComponentsStyles/ScenarioNotifications.css";

const ScenarioNotifications = ({
  pollInterval = 5000,
  lastScenarioCreationTime = null,
  onPollingComplete = null
}) => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    count,
    isPolling
  } = useScenarioNotifications(pollInterval, lastScenarioCreationTime, 15 * 60 * 1000, onPollingComplete);

  // Show loading state only on initial load
  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-loading">
        <span className="loading-icon">⏳</span>
        <span>กำลังโหลดการแจ้งเตือน...</span>
      </div>
    );
  }

  // Show error if there's a problem
  if (error) {
    return (
      <div className="notifications-error">
        <strong>⚠️ ข้อผิดพลาด:</strong>
        <p>{error}</p>
      </div>
    );
  }

  // Don't render anything if no notifications
  if (notifications.length === 0) {
    return null;
  }

  const formatExecutionTime = (seconds) => {
    if (!seconds) return 'N/A';

    if (seconds < 60) {
      return `${seconds} วินาที`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} นาที ${remainingSeconds} วินาที`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '📢';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'สำเร็จ';
      case 'failed':
        return 'ล้มเหลว';
      default:
        return 'แจ้งเตือน';
    }
  };

  return (
    <div className="scenario-notifications-container">
      <div className="notifications-header">
        <h3 className="notifications-title">
          📬 การแจ้งเตือน ({count})
        </h3>
        {count > 1 && (
          <button
            className="mark-all-read-btn"
            onClick={markAllAsRead}
          >
            ปิดทั้งหมด
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card notification-${notification.status}`}
          >
            <div className="notification-icon">
              {getStatusIcon(notification.status)}
            </div>

            <div className="notification-content">
              <div className="notification-header-content">
                <span className="notification-status-badge">
                  {getStatusText(notification.status)}
                </span>
                <span className="notification-timestamp">
                  {formatTimestamp(notification.created_at)}
                </span>
              </div>

              <div className="notification-body">
                <h4 className="scenario-name">{notification.scenario_name}</h4>

                {notification.scenario_id && (
                  <p className="scenario-id">
                    <strong>Scenario ID:</strong> {notification.scenario_id}
                  </p>
                )}

                {notification.status === 'completed' && notification.payload && (
                  <div className="completion-details">
                    {notification.payload.execution_time_seconds && (
                      <p className="execution-time">
                        <strong>⏱️ เวลาที่ใช้:</strong>{' '}
                        {formatExecutionTime(notification.payload.execution_time_seconds)}
                      </p>
                    )}
                    {notification.payload.notebooks_completed &&
                     notification.payload.notebooks_completed.length > 0 && (
                      <p className="notebooks-completed">
                        <strong>📓 Notebooks:</strong>{' '}
                        {notification.payload.notebooks_completed.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {notification.status === 'failed' && notification.payload && (
                  <div className="failure-details">
                    {notification.payload.error && (
                      <p className="error-message">
                        <strong>⚠️ ข้อผิดพลาด:</strong>{' '}
                        {notification.payload.error}
                      </p>
                    )}
                    {notification.payload.failed_notebook && (
                      <p className="failed-notebook">
                        <strong>Notebook ที่ล้มเหลว:</strong>{' '}
                        {notification.payload.failed_notebook}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                className="dismiss-btn"
                onClick={() => markAsRead(notification.id)}
                title="ปิดการแจ้งเตือน"
              >
                ✕ ปิด
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioNotifications;

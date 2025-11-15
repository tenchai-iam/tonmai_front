# Webhook Notifications - Front-End Integration Guide

## Overview

The Flask backend now handles webhook notifications internally and stores them in the database. The front-end can fetch notifications via simple API calls - **no need to implement a webhook receiver endpoint**.

---

## Architecture

```
Scenario Pipeline → Webhook (internal) → Database (notifications table) → Front-End (GET request)
```

1. **Scenario completes** → Triggers internal webhook
2. **Flask receives webhook** → Stores in `scenario_notifications` table
3. **Front-end polls** `/back-risk/webhook/notifications` → Gets unread notifications

---

## Front-End API Endpoints

### 1. Get Unread Notifications

**Endpoint:** `GET /back-risk/webhook/notifications`

**Query Parameters:**
- `unread_only` (optional): `true` (default) or `false`
- `limit` (optional): Number of notifications (default: 50)

**Request:**
```bash
curl http://localhost:5001/back-risk/webhook/notifications?unread_only=true&limit=10
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "event": "scenario.completed",
      "scenario_id": "budget_opt_2024_10pct_abc123",
      "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
      "status": "completed",
      "timestamp": "2025-01-15T14:30:00",
      "payload": {
        "event": "scenario.completed",
        "scenario_id": "budget_opt_2024_10pct_abc123",
        "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
        "status": "completed",
        "timestamp": "2025-01-15T14:30:00Z",
        "execution_time_seconds": 1847,
        "notebooks_completed": ["notebook6", "notebook7", "notebook8"]
      },
      "created_at": "2025-01-15T14:30:05",
      "read": false
    }
  ],
  "count": 1
}
```

---

### 2. Mark Notification as Read

**Endpoint:** `POST /back-risk/webhook/notifications/{notification_id}/mark-read`

**Request:**
```bash
curl -X POST http://localhost:5001/back-risk/webhook/notifications/1/mark-read
```

**Response:**
```json
{
  "success": true,
  "notification_id": 1,
  "marked_read": true
}
```

---

## React Integration Example

### Hook: `useScenarioNotifications`

```javascript
// src/hooks/useScenarioNotifications.js
import { useState, useEffect } from 'react';

export function useScenarioNotifications(pollInterval = 5000) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/back-risk/webhook/notifications?unread_only=true'
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/back-risk/webhook/notifications/${notificationId}/mark-read`,
        { method: 'POST' }
      );

      if (response.ok) {
        // Remove from notifications list
        setNotifications(prev =>
          prev.filter(n => n.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll for new notifications
    const interval = setInterval(fetchNotifications, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    refresh: fetchNotifications
  };
}
```

---

### Component: Notification Display

```javascript
// src/components/ScenarioNotifications.jsx
import React from 'react';
import { useScenarioNotifications } from '../hooks/useScenarioNotifications';

function ScenarioNotifications() {
  const { notifications, loading, error, markAsRead } = useScenarioNotifications(5000);

  if (loading && notifications.length === 0) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="info">No new notifications</div>;
  }

  return (
    <div className="notifications">
      <h3>Scenario Notifications ({notifications.length})</h3>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.status}`}
        >
          <div className="notification-header">
            {notification.status === 'completed' ? '✅' : '❌'}
            <strong>{notification.scenario_name}</strong>
          </div>

          <div className="notification-body">
            <p>Status: {notification.status}</p>
            <p>Time: {new Date(notification.created_at).toLocaleString()}</p>

            {notification.status === 'completed' && (
              <p>
                Execution time: {notification.payload?.execution_time_seconds}s
              </p>
            )}

            {notification.status === 'failed' && (
              <p className="error">Error: {notification.payload?.error}</p>
            )}
          </div>

          <button
            onClick={() => markAsRead(notification.id)}
            className="btn-dismiss"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}

export default ScenarioNotifications;
```

---

### Toast Notification Example

```javascript
// src/components/ScenarioToasts.jsx
import React, { useEffect } from 'react';
import { useScenarioNotifications } from '../hooks/useScenarioNotifications';
import { toast } from 'react-toastify'; // or your preferred toast library

function ScenarioToasts() {
  const { notifications, markAsRead } = useScenarioNotifications(3000);

  useEffect(() => {
    notifications.forEach(notification => {
      const message = notification.status === 'completed'
        ? `✅ Scenario completed: ${notification.scenario_name}`
        : `❌ Scenario failed: ${notification.scenario_name}`;

      const type = notification.status === 'completed' ? 'success' : 'error';

      toast[type](message, {
        onClose: () => markAsRead(notification.id),
        autoClose: 5000
      });
    });
  }, [notifications]);

  return null; // This component doesn't render anything
}

export default ScenarioToasts;
```

---

## Database Schema

The notifications are stored in:

**Table:** `risk_modeling.scenario_notifications`

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `event` (VARCHAR) - e.g., "scenario.completed"
- `scenario_id` (VARCHAR)
- `scenario_name` (VARCHAR)
- `status` (VARCHAR) - "completed" or "failed"
- `timestamp` (TIMESTAMP) - When scenario finished
- `payload` (JSONB) - Full webhook payload
- `created_at` (TIMESTAMP) - When notification was created
- `read` (BOOLEAN) - Whether notification has been read

---

## Notification Lifecycle

```
1. User creates scenario
   ↓
2. Scenario runs (notebooks 6→7→8)
   ↓
3. Scenario completes/fails
   ↓
4. Webhook sent to /back-risk/webhook/scenario-complete
   ↓
5. Notification stored in scenario_notifications table
   ↓
6. Front-end polls /webhook/notifications
   ↓
7. Front-end displays notification
   ↓
8. User dismisses → POST /notifications/{id}/mark-read
   ↓
9. Notification marked as read
```

---

## Polling Strategy

### Simple Polling (Recommended)

Poll every 5 seconds while scenarios are running:

```javascript
const { notifications } = useScenarioNotifications(5000); // 5 seconds
```

### Smart Polling

Only poll when scenarios are active:

```javascript
const [hasActiveScenarios, setHasActiveScenarios] = useState(false);

// Poll only if there are active scenarios
const pollInterval = hasActiveScenarios ? 3000 : 0; // 0 = no polling
const { notifications } = useScenarioNotifications(pollInterval);
```

### Exponential Backoff

Reduce polling frequency when no new notifications:

```javascript
const [interval, setInterval] = useState(5000);
const { notifications } = useScenarioNotifications(interval);

useEffect(() => {
  if (notifications.length === 0) {
    // No new notifications, slow down polling
    setInterval(prev => Math.min(prev * 1.5, 30000)); // Max 30s
  } else {
    // Got notifications, reset to fast polling
    setInterval(5000);
  }
}, [notifications]);
```

---

## Complete Integration Example

```javascript
// src/App.js
import React from 'react';
import ScenarioRunner from './components/ScenarioRunner';
import ScenarioNotifications from './components/ScenarioNotifications';
import ScenarioToasts from './components/ScenarioToasts';

function App() {
  return (
    <div className="app">
      <h1>VegX Scenario Manager</h1>

      {/* Create and run scenarios */}
      <ScenarioRunner />

      {/* Display notifications in sidebar */}
      <aside className="notifications-sidebar">
        <ScenarioNotifications />
      </aside>

      {/* Toast notifications for quick feedback */}
      <ScenarioToasts />
    </div>
  );
}

export default App;
```

---

## Advantages of This Approach

✅ **No webhook receiver needed** - Flask handles everything
✅ **Simple REST API** - Just GET and POST requests
✅ **Database persistence** - Notifications stored even if front-end is closed
✅ **Unread tracking** - Know which notifications user has seen
✅ **Flexible polling** - Front-end controls update frequency
✅ **Full payload available** - Access all scenario details
✅ **Works with existing infrastructure** - No new services needed

---

## Testing

### 1. Create a scenario
```bash
curl -X POST http://localhost:5001/back-risk/create-and-run \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "budget_reduction_percentage": 10
  }'
```

### 2. Wait for completion (or check status)
```bash
# Check scenario status
curl -X POST http://localhost:5001/back-risk/status \
  -d '{"scenario_name": "20251115_budget_optimization_2569_10pct_reduction"}'
```

### 3. Fetch notifications
```bash
curl http://localhost:5001/back-risk/webhook/notifications
```

### 4. Mark as read
```bash
curl -X POST http://localhost:5001/back-risk/webhook/notifications/1/mark-read
```

---

## Summary

**For Front-End Developers:**

1. ✅ **No webhook receiver needed** - Just poll `/webhook/notifications`
2. ✅ **Simple integration** - Use the provided React hook
3. ✅ **Flexible display** - Toast, sidebar, modal, or anywhere
4. ✅ **Full control** - Mark as read when user dismisses

**Endpoints to use:**
- `GET /back-risk/webhook/notifications` - Get unread notifications
- `POST /back-risk/webhook/notifications/{id}/mark-read` - Dismiss notification

That's it! Much simpler than implementing a webhook receiver.

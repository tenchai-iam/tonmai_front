# Webhook Implementation Guide

## Overview

The scenario API now supports webhooks to notify external services when scenario pipelines complete or fail. This eliminates the need for constant polling and provides real-time notifications.

---

## Configuration Methods

The webhook callback URL can be configured in **two ways**:

1. **Environment Variable (Recommended)**: Set `CALLBACK_URL` in `.env` or `.chart/values`
2. **Request Parameter**: Provide `callback_url` in API request body

**Priority**: Request parameter > Environment variable > None

See [WEBHOOK_CONFIGURATION.md](./WEBHOOK_CONFIGURATION.md) for detailed configuration guide.

---

## Quick Start

### 1. Configure Default Webhook URL (Optional)

**Local Development** - Add to `.env`:
```bash
CALLBACK_URL="https://dev-tonmai-tcc.pea.co.th/api/webhook/scenario-complete"
```

**Kubernetes** - Add to `.chart/values/tcc/values-back-risk-dev.yaml`:
```yaml
envs:
  - name: CALLBACK_URL
    value: "https://dev-tonmai-tcc.pea.co.th/api/webhook/scenario-complete"
```

### 2. Run the Database Migration

Execute this SQL on your database:

```sql
ALTER TABLE risk_modeling."F6_scenario_configurations"
ADD COLUMN IF NOT EXISTS callback_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS webhook_delivered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webhook_delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS webhook_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS webhook_last_error TEXT;
```

### 3. Create a Scenario

**Option A: Use Environment Default (Recommended)**
```bash
curl -X POST http://localhost:5001/back-risk/create-and-run \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "budget_reduction_percentage": 10,
    "async": true
  }'
# Uses CALLBACK_URL from environment variable
```

**Option B: Override with Custom URL**
```bash
curl -X POST http://localhost:5001/back-risk/create-and-run \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "budget_reduction_percentage": 10,
    "callback_url": "https://custom-webhook.example.com/notify",
    "async": true
  }'
# Overrides environment default
```

### 4. Receive Webhook Notification

Your endpoint will receive a POST request when the scenario completes:

```json
{
  "event": "scenario.completed",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "status": "completed",
  "timestamp": "2025-01-15T14:30:00Z",
  "execution_time_seconds": 1847,
  "notebooks_completed": ["notebook6", "notebook7", "notebook8"]
}
```

---

## Database Schema Changes

### New Columns in `F6_scenario_configurations`

| Column | Type | Description |
|--------|------|-------------|
| `callback_url` | VARCHAR(500) | Webhook URL to POST completion notification |
| `webhook_delivered` | BOOLEAN | Flag indicating if webhook was successfully delivered |
| `webhook_delivered_at` | TIMESTAMP | When webhook was successfully delivered |
| `webhook_retry_count` | INTEGER | Number of retry attempts made |
| `webhook_last_error` | TEXT | Last error message if delivery failed |

---

## API Endpoints

### 1. `/create` - Create Scenario with Webhook

**Request:**
```json
POST /back-risk/create
{
  "year": 2024,
  "budget_reduction_percentage": 10,
  "callback_url": "https://your-app.com/webhook"
}
```

**Response:**
```json
{
  "status": "created",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "callback_url": "https://your-app.com/webhook",
  "message": "Scenario created. Use /run endpoint to execute."
}
```

### 2. `/create-and-run` - Create and Execute with Webhook

**Request:**
```json
POST /back-risk/create-and-run
{
  "year": 2024,
  "budget_reduction_percentage": 10,
  "callback_url": "https://your-app.com/webhook",
  "async": true
}
```

**Response (Async):**
```json
{
  "status": "created_and_started",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "execution_mode": "async",
  "webhook_configured": true,
  "callback_url": "https://your-app.com/webhook",
  "webhook_note": "Webhook notification will be sent when scenario completes or fails",
  "note": "Use /status endpoint to check progress"
}
```

### 3. `/run` - Execute Existing Scenario

**Request:**
```json
POST /back-risk/run
{
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "async": true
}
```

**Response:**
```json
{
  "status": "started",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "webhook_configured": true,
  "callback_url": "https://your-app.com/webhook",
  "webhook_note": "Webhook notification will be sent when scenario completes or fails"
}
```

---

## Webhook Payload Schemas

### Success Notification

```json
{
  "event": "scenario.completed",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "status": "completed",
  "timestamp": "2025-01-15T14:30:00Z",
  "execution_time_seconds": 1847,
  "notebooks_completed": ["notebook6", "notebook7", "notebook8"]
}
```

### Failure Notification

```json
{
  "event": "scenario.failed",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "status": "failed",
  "timestamp": "2025-01-15T14:30:00Z",
  "error": "Notebook 7 failed: KeyError 'device_id'",
  "failed_notebook": "notebook7"
}
```

### Exception Failure Notification

```json
{
  "event": "scenario.failed",
  "scenario_id": "budget_opt_2024_10pct_abc123",
  "scenario_name": "20251115_budget_optimization_2569_10pct_reduction",
  "status": "failed",
  "timestamp": "2025-01-15T14:30:00Z",
  "error": "Database connection timeout",
  "error_type": "exception",
  "traceback": "Traceback (most recent call last):\n..."
}
```

---

## Webhook Delivery

### Retry Logic

The webhook implementation includes automatic retry with exponential backoff:

1. **Initial attempt**: Immediately after pipeline completion
2. **Retry 1**: After 2 seconds (if failed)
3. **Retry 2**: After 4 seconds (if failed)
4. **Retry 3**: After 8 seconds (if failed)

**Total retry attempts:** 3 (configurable)

### Success Criteria

Webhook is considered successfully delivered if:
- HTTP response status code is 200, 201, 202, or 204
- Response received within 10 seconds (timeout)

### Database Tracking

After webhook delivery:
- **Success**: `webhook_delivered = TRUE`, `webhook_delivered_at` set, `webhook_retry_count` recorded
- **Failure**: `webhook_delivered = FALSE`, `webhook_retry_count = 3`, `webhook_last_error` contains error message

### Error Handling

If webhook delivery fails after all retries:
- ⚠️ Pipeline execution continues (webhook failure does not affect scenario)
- ❌ Error logged to console
- 📊 Failure tracked in database

---

## Implementing a Webhook Receiver

### Example 1: Express.js (Node.js)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/webhook/scenario-complete', (req, res) => {
  const { event, scenario_id, scenario_name, status, timestamp } = req.body;

  console.log(`📩 Webhook received: ${scenario_name} - ${status}`);

  if (status === 'completed') {
    console.log(`✅ Scenario completed successfully`);
    // Update your UI, send notification, etc.
  } else if (status === 'failed') {
    console.error(`❌ Scenario failed: ${req.body.error}`);
    // Handle failure, alert admin, etc.
  }

  // IMPORTANT: Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Example 2: Flask (Python)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/webhook/scenario-complete', methods=['POST'])
def handle_webhook():
    data = request.json

    scenario_name = data.get('scenario_name')
    status = data.get('status')

    print(f"📩 Webhook received: {scenario_name} - {status}")

    if status == 'completed':
        print(f"✅ Scenario completed successfully")
        # Update database, send email, etc.
    elif status == 'failed':
        error = data.get('error', 'Unknown error')
        print(f"❌ Scenario failed: {error}")
        # Log error, alert admin, etc.

    # IMPORTANT: Always respond with 200
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=4000)
```

### Example 3: FastAPI (Python)

```python
from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()

class WebhookPayload(BaseModel):
    event: str
    scenario_id: str
    scenario_name: str
    status: str
    timestamp: str
    error: str = None

@app.post("/api/webhook/scenario-complete")
async def handle_webhook(payload: WebhookPayload):
    print(f"📩 Webhook received: {payload.scenario_name} - {payload.status}")

    if payload.status == 'completed':
        print(f"✅ Scenario completed successfully")
    elif payload.status == 'failed':
        print(f"❌ Scenario failed: {payload.error}")

    return {"received": True}
```

---

## Security Considerations

### 1. HTTPS Only

For production, always use HTTPS URLs:
```json
{
  "callback_url": "https://your-app.com/webhook"  // ✅ Secure
}
```

### 2. URL Validation

The API validates that callback URLs start with `http://` or `https://`. Invalid URLs are rejected:

```json
{
  "error": "callback_url must start with http:// or https://"
}
```

### 3. Optional: Signature Verification

For additional security, you can implement HMAC signature verification:

**Python (Flask) backend:**
```python
import hmac
import hashlib

SECRET_KEY = 'your-secret-key'

# In send_webhook_notification function
signature = hmac.new(
    SECRET_KEY.encode(),
    json.dumps(webhook_payload).encode(),
    hashlib.sha256
).hexdigest()

response = requests.post(
    callback_url,
    json=webhook_payload,
    headers={
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
    }
)
```

**Webhook receiver verification:**
```python
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()

    expected_signature = hmac.new(
        SECRET_KEY.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if signature != expected_signature:
        return jsonify({'error': 'Invalid signature'}), 403

    # Process webhook...
```

---

## Testing

### 1. Test with webhook.site

Use [webhook.site](https://webhook.site) to inspect webhook payloads:

```bash
curl -X POST http://localhost:5001/back-risk/create-and-run \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "budget_reduction_percentage": 10,
    "callback_url": "https://webhook.site/your-unique-url"
  }'
```

### 2. Test with ngrok (Local Development)

Expose your local server to receive webhooks:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL
curl -X POST http://localhost:5001/back-risk/create-and-run \
  -H "Content-Type": application/json" \
  -d '{
    "callback_url": "https://abc123.ngrok.io/webhook"
  }'
```

### 3. Check Webhook Delivery Status

Query the database to verify webhook delivery:

```sql
SELECT
    scenario_name,
    callback_url,
    webhook_delivered,
    webhook_delivered_at,
    webhook_retry_count,
    webhook_last_error
FROM risk_modeling."F6_scenario_configurations"
WHERE scenario_name = '20251115_budget_optimization_2569_10pct_reduction';
```

---

## Troubleshooting

### Webhook not received

1. **Check URL accessibility**: Ensure callback URL is publicly accessible
2. **Check firewall**: Ensure your webhook receiver accepts incoming connections
3. **Check logs**: Look for webhook delivery errors in Flask console
4. **Query database**: Check `webhook_last_error` column for error details

```sql
SELECT callback_url, webhook_delivered, webhook_last_error
FROM risk_modeling."F6_scenario_configurations"
WHERE scenario_id = 'your-scenario-id';
```

### Webhook delivery failed

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection error` | URL not reachable | Verify URL is correct and accessible |
| `Request timeout (10s)` | Webhook receiver too slow | Optimize receiver to respond within 10s |
| `HTTP 404` | Endpoint not found | Check endpoint path is correct |
| `HTTP 500` | Receiver error | Check webhook receiver logs |

### Testing webhook receiver

Test your webhook receiver manually:

```bash
curl -X POST https://your-app.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "scenario.completed",
    "scenario_id": "test-123",
    "scenario_name": "test-scenario",
    "status": "completed",
    "timestamp": "2025-01-15T14:30:00Z"
  }'
```

Expected response: HTTP 200

---

## Best Practices

### ✅ DO:

1. **Always respond with 200**: Acknowledge webhook receipt immediately
2. **Process asynchronously**: Queue webhook processing, don't block response
3. **Validate payload**: Check required fields exist
4. **Log all webhooks**: Keep audit trail of received webhooks
5. **Use HTTPS**: Secure webhook URLs in production
6. **Handle failures gracefully**: Don't crash if unexpected payload
7. **Set reasonable timeouts**: Respond within 10 seconds

### ❌ DON'T:

1. **Don't perform heavy processing**: Respond quickly, process later
2. **Don't rely solely on webhooks**: Use /status as backup
3. **Don't expose webhook URLs**: Keep callback URLs private
4. **Don't ignore errors**: Log and monitor webhook failures
5. **Don't use HTTP in production**: Always use HTTPS

---

## Migration from Polling

### Before (Polling):
```javascript
// React polls every 5 seconds
const interval = setInterval(async () => {
  const response = await fetch('/back-risk/status', {
    method: 'POST',
    body: JSON.stringify({ scenario_name })
  });
  const data = await response.json();
  if (data.status === 'completed') {
    clearInterval(interval);
  }
}, 5000);
```

### After (Webhooks):
```javascript
// Backend notifies immediately when done
fetch('/back-risk/create-and-run', {
  method: 'POST',
  body: JSON.stringify({
    year: 2024,
    budget_reduction_percentage: 10,
    callback_url: 'https://your-app.com/webhook'
  })
});

// No polling needed!
// Webhook receiver handles notification
```

---

## Summary

✅ **Webhook implementation complete**
- Database schema updated with webhook tracking columns
- Retry logic with exponential backoff (3 attempts)
- Success/failure notifications with detailed payloads
- Support in `/create`, `/create-and-run`, and `/run` endpoints
- Comprehensive error handling and logging
- Backward compatible (webhooks are optional)

🎯 **Benefits:**
- Real-time notifications (no polling delay)
- Reduced database load (no repeated status checks)
- Scalable (supports many concurrent scenarios)
- Reliable (automatic retries, delivery tracking)

📚 **Next Steps:**
1. Run database migration SQL
2. Implement webhook receiver endpoint
3. Test with webhook.site or ngrok
4. Deploy to production with HTTPS
5. Monitor webhook delivery in database

---

## Support

For issues or questions:
- Check Flask console logs for webhook delivery errors
- Query `F6_scenario_configurations` table for delivery status
- Test webhook receiver independently before integration
- Use webhook.site to inspect payloads during development

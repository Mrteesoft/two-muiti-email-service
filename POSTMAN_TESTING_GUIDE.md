# Comprehensive Postman Testing Guide

This guide provides step-by-step instructions for testing the Two-Microservice Email Processing System using Postman.

## 🚀 Quick Setup

### Prerequisites
- Postman installed ([Download here](https://www.postman.com/downloads/))
- Services running locally (`npm run dev`)
- MongoDB and Redis running

### 1. Start the Services

```bash
# Clone the repository
git clone https://github.com/Mrteesoft/two-muiti-email-service.git
cd two-muiti-email-service

# Install dependencies and start services
npm install
npm run dev
```

Wait for both services to start:
- **Service A (API)**: http://localhost:3001
- **Service B (Worker)**: http://localhost:3002

## 📋 Manual Postman Testing

### Test 1: API Service Health Check

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:3001/health`
- **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Service A (API) is running",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "service": "api-service"
}
```

**Validation:**
- Status Code: `200 OK`
- Response time: < 1000ms
- JSON format with `success: true`

---

### Test 2: Worker Service Health Check

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:3002/health`
- **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker Service is running",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "service": "worker-service",
  "worker": {
    "status": "running",
    "uptime": 1234.567
  }
}
```

**Validation:**
- Status Code: `200 OK`
- Response time: < 1000ms
- Contains worker status information

---

### Test 3: Worker Service Detailed Status

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:3002/status`
- **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker Service Status",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "service": "worker-service",
  "worker": {
    "status": "running",
    "uptime": 1234.567,
    "memoryUsage": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000,
      "external": 5000000,
      "arrayBuffers": 1000000
    },
    "pid": 12345
  }
}
```

**Validation:**
- Status Code: `200 OK`
- Contains detailed memory and process information

---

### Test 4: Create Valid Message

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:3001/messages`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "postman.test@example.com",
    "message": "Hello from Postman testing!"
  }
  ```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message created and queued for processing",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "postman.test@example.com",
    "message": "Hello from Postman testing!",
    "createdAt": "2025-01-20T10:30:00.000Z"
  }
}
```

**Validation:**
- Status Code: `201 Created`
- Response contains message ID
- Email and message match input
- Check service logs for worker processing

---

### Test 5: Get All Messages

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:3001/messages`
- **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "postman.test@example.com",
      "message": "Hello from Postman testing!",
      "createdAt": "2025-01-20T10:30:00.000Z",
      "updatedAt": "2025-01-20T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Validation:**
- Status Code: `200 OK`
- Response contains array of messages
- Count field shows number of messages

---

### Test 6: Invalid Email Validation

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:3001/messages`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "invalid-email-format",
    "message": "This should fail validation"
  }
  ```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Validation:**
- Status Code: `400 Bad Request`
- Response contains validation errors
- Error specifically mentions email validation

---

### Test 7: Empty Message Validation

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:3001/messages`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "message": ""
  }
  ```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "message",
      "message": "Message is required"
    },
    {
      "field": "message",
      "message": "Message must be between 1 and 1000 characters"
    }
  ]
}
```

**Validation:**
- Status Code: `400 Bad Request`
- Response contains message validation errors

---

### Test 8: Missing Fields Validation

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:3001/messages`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com"
  }
  ```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "message",
      "message": "Message is required"
    }
  ]
}
```

**Validation:**
- Status Code: `400 Bad Request`
- Missing field validation working

---

## 🔄 Testing Workflow

### Complete Testing Sequence

1. **Health Checks First**
   - Test API health (`GET /health`)
   - Test Worker health (`GET /health`)
   - Test Worker status (`GET /status`)

2. **Basic Functionality**
   - Create valid message (`POST /messages`)
   - Retrieve all messages (`GET /messages`)

3. **Validation Testing**
   - Test invalid email format
   - Test empty message
   - Test missing fields

4. **Verify Worker Processing**
   - Check service logs for email processing
   - Look for: `"Sending message to [email]: [message]"`

## 📊 Expected Results Summary

| Test | Method | Endpoint | Expected Status | Key Validation |
|------|--------|----------|----------------|----------------|
| API Health | GET | `/health` | 200 | `success: true` |
| Worker Health | GET | `/health` | 200 | `worker.status: "running"` |
| Worker Status | GET | `/status` | 200 | Memory & process info |
| Create Message | POST | `/messages` | 201 | Returns message ID |
| Get Messages | GET | `/messages` | 200 | Array with count |
| Invalid Email | POST | `/messages` | 400 | Email validation error |
| Empty Message | POST | `/messages` | 400 | Message validation error |
| Missing Fields | POST | `/messages` | 400 | Required field error |

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3001
   ```
   **Solution**: Ensure services are running with `npm run dev`

2. **Validation Errors Not Showing**
   - Check `Content-Type: application/json` header is set
   - Verify JSON body is properly formatted

3. **Worker Not Processing**
   - Check service logs for processing messages
   - Verify Redis is running
   - Check MongoDB connection

### Debug Steps

1. **Check Service Status**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

2. **View Service Logs**
   - Look at terminal running `npm run dev`
   - Check for error messages or processing logs

3. **Verify Database**
   ```bash
   # Check if messages are being saved
   curl http://localhost:3001/messages
   ```

## 🎯 Success Criteria

**All tests should pass with:**
- ✅ Health checks return 200 OK
- ✅ Valid messages return 201 Created
- ✅ Invalid data returns 400 Bad Request
- ✅ Worker processes messages (check logs)
- ✅ Database stores messages correctly
- ✅ Response times under 2 seconds

## 📈 Performance Testing

### Load Testing with Postman

1. **Create Collection Runner**
   - Select message creation request
   - Set iterations: 10-50
   - Set delay: 100-500ms

2. **Monitor Performance**
   - Response times should stay under 1000ms
   - Success rate should be 100%
   - Check system resources during test

### Expected Performance
- **Response Time**: < 500ms average
- **Success Rate**: 100%
- **Concurrent Requests**: Handle 10+ simultaneous
- **Queue Processing**: Real-time (< 5 seconds)

---

**🎉 Happy Testing!** 

This comprehensive guide ensures thorough validation of the microservice system using Postman. All endpoints are tested for both success and failure scenarios.

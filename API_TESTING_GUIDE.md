# FitLife AI API Testing Guide

Base URL: `https://fitlife-ai-api.vercel.app`

---

## 1. Health API (`/api/health`)

### 1.1 Create Health Record

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/health?action=create`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "type": "weight",
  "value": 75.5,
  "date": "2025-11-20"
}
```

---

### 1.2 Get Health Records

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/health?action=records&user_id=caf3a9be-b38c-4014-a472-207a1948082e&type=weight`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

### 1.3 Get Health Stats

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/health?action=stats&user_id=caf3a9be-b38c-4014-a472-207a1948082e&period=7days`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

## 2. Fitness API (`/api/fitness`)

### 2.1 Create Fitness Routine

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/fitness?action=create`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "name": "Morning Workout",
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": 15
    },
    {
      "name": "Squats",
      "sets": 3,
      "reps": 20
    }
  ]
}
```

---

### 2.2 Get Fitness Routines

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/fitness?action=list&user_id=caf3a9be-b38c-4014-a472-207a1948082e`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

### 2.3 Update Fitness Routine

**Method:** PUT  
**URL:** `https://fitlife-ai-api.vercel.app/api/fitness?action=update`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "id": "e07d14b3-73fe-44be-85fa-23e1269e1097",
  "name": "Updated Morning Workout",
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 4,
      "reps": 20
    }
  ]
}
```

---

## 3. Goals API (`/api/goals`)

### 3.1 Set Goal

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/goals?action=set`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "type": "weight_loss",
  "target": 70
}
```

---

### 3.2 Get Goals

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/goals?action=list&user_id=caf3a9be-b38c-4014-a472-207a1948082e`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

### 3.3 Update Goal

**Method:** PUT  
**URL:** `https://fitlife-ai-api.vercel.app/api/goals?action=update`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "id": "goal-id-here",
  "target": 68
}
```

---

## 4. Calendar API (`/api/calendar`)

### 4.1 Create Calendar Event

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/calendar?action=create`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "title": "Morning Run",
  "type": "workout",
  "date": "2025-11-20"
}
```

---

### 4.2 Get Calendar Events

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/calendar?action=list&user_id=caf3a9be-b38c-4014-a472-207a1948082e&date=2025-11-21`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

### 4.3 Update Calendar Event

**Method:** PUT  
**URL:** `https://fitlife-ai-api.vercel.app/api/calendar?action=update`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "id": "51a603e3-4e4b-4b6b-b00f-1a22e2ae6ea3",
  "completed": true
}
```

---

## 5. Users API (`/api/users`)

### 5.1 Get User Profile

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/users?action=profile&user_id=caf3a9be-b38c-4014-a472-207a1948082e`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

---

### 5.2 Update User Profile

**Method:** PUT  
**URL:** `https://fitlife-ai-api.vercel.app/api/users?action=profile`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "name": "John Doe",
  "age": 28,
  "gender": "male",
  "city": "Jaipur",
  "state": "Rajasthan",
  "country": "India",
  "mobile": "+910000000000"
}
```

---

## 6. Telegram API (`/api/telegram`)

### 6.1 Telegram Webhook (Bot Use)

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/telegram?action=webhook`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "message": {
    "text": "/start caf3a9be-b38c-4014-a472-207a1948082e",
    "chat": {
      "id": 641652753
    }
  }
}
```

---

### 6.2 Connect Telegram Bot

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/telegram?action=connect`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "chat_id": 641652753
}
```

---

### 6.3 Send Telegram Reminder

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/telegram?action=send`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "message": "Time for your workout! 💪"
}
```

---

### 6.4 Set Reminder Time

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/telegram?action=reminder-time`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "user_id": "caf3a9be-b38c-4014-a472-207a1948082e",
  "reminder_time": "07:00"
}
```

---

## 7. AI API (`/api/ai`)

### 7.1 Analyze Food Image

**Method:** POST  
**URL:** `https://fitlife-ai-api.vercel.app/api/ai?action=analyze`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

_Note: Replace with actual base64 image data_

---

### 7.2 Get Nutrition Data by Barcode

**Method:** GET  
**URL:** `https://fitlife-ai-api.vercel.app/api/ai?action=nutrition&barcode=737628064502`  
**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

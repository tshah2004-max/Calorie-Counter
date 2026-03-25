# 🥗 CalorieTracker API

A MyFitnessPal-style REST API built with Node.js and Express.

## Project Structure

```
calorie-tracker/
├── src/
│   ├── config/
│   │   ├── activityLevels.js   # Activity multiplier constants
│   │   └── env.js              # Centralised environment config
│   ├── controllers/
│   │   ├── authController.js   # Register, login, logout
│   │   ├── diaryController.js  # Food diary CRUD
│   │   ├── foodController.js   # Food database search & custom foods
│   │   ├── goalsController.js  # Macro/calorie goals
│   │   ├── progressController.js # Progress reports, streak, BMR calc
│   │   ├── userController.js   # Profile management
│   │   ├── waterController.js  # Water intake tracking
│   │   └── weightController.js # Weight logging
│   ├── middleware/
│   │   ├── auth.js             # Bearer token authentication
│   │   └── errorHandler.js     # 404 + global error handler
│   ├── models/
│   │   └── db.js               # In-memory database + seed data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── diaryRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── goalsRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── userRoutes.js
│   │   ├── waterRoutes.js
│   │   └── weightRoutes.js
│   ├── utils/
│   │   ├── dateUtils.js        # Date helpers (today, isValidDate, calcAge)
│   │   └── nutritionUtils.js   # BMR, TDEE, macro calculations
│   ├── app.js                  # Express app setup
│   └── server.js               # HTTP server entry point
├── .env.example
├── .gitignore
└── package.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode (auto-restart)
npm run dev
```

Server runs at: `http://localhost:3000`

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

Get a token by calling `POST /auth/login`.

## Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | API status |
| POST | /auth/register | No | Create account (16+ only) |
| POST | /auth/login | No | Login → returns token |
| GET | /users/me | Yes | View profile |
| GET | /foods?q= | No | Search food database |
| GET | /diary/:date | Yes | View diary for a date |
| POST | /diary/:date/entries | Yes | Log a food |
| POST | /water/:date | Yes | Log water intake |
| POST | /weight | Yes | Log weight |
| GET | /progress | Yes | Progress report |

## Register Example

```json
POST /auth/register
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "dateOfBirth": "2000-01-15",
  "gender": "male",
  "weightKg": 75,
  "heightCm": 180,
  "activityLevel": "moderate",
  "weightGoal": "lose"
}
```

> ⚠️ Users under 16 will be rejected with an error message.

## Notes

- Data is stored **in-memory** — it resets when the server restarts.
- Replace `src/models/db.js` with a real database (PostgreSQL, MongoDB, etc.) for production.

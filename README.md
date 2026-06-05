# AI-Genius Auth System — MA216 Assignment 03

Secure JWT Authentication + Role-Based Access Control for a SaaS AI platform.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- cookie-parser (httpOnly cookie for refresh token)

## Project Structure
```
ai-genius-auth/
├── server.js                  # Entry point, centralized error handler
├── config/db.js               # MongoDB connection
├── models/User.js             # User schema with bcrypt pre-save hook
├── middleware/auth.js         # protect() — JWT verification
├── middleware/rbac.js         # restrictTo() — Role-based access
├── controllers/authController.js  # Login, Refresh, Logout logic
├── routes/authRoutes.js       # /api/auth/*
├── routes/aiRoutes.js         # /api/ai/* with RBAC
├── .env.example
└── AI-Genius-Postman-Collection.json
```

## Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   # Then edit .env and fill in your values
   ```

3. **Run the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user |
| POST | `/api/auth/login` | Login — returns accessToken + sets cookie |
| POST | `/api/auth/refresh` | Issue new access token using cookie |
| POST | `/api/auth/logout` | Clear refresh token |

### AI (Protected)
| Method | Endpoint | Allowed Roles |
|--------|----------|---------------|
| GET | `/api/ai/free-model` | All logged-in users |
| POST | `/api/ai/premium-model` | Premium_User, Admin |
| DELETE | `/api/ai/purge-cache` | Admin only |

## Testing Flow (Postman)
1. Register Admin, Premium, Free users
2. Login as any user → copy `accessToken`
3. Use token in `Authorization: Bearer <token>` header
4. Test role access (expect 403 for unauthorized roles)
5. Wait for token to expire (or set `ACCESS_TOKEN_EXPIRE=10s` to test fast)
6. Call `/api/auth/refresh` → get new access token
7. Logout

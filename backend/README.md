# CodeLearn Backend

Backend API for the CodeLearn educational platform.

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Zod

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup PostgreSQL

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE codelearn;
```

### 3. Configure environment

Copy `.env.example` to `.env` and update the `DATABASE_URL` with your PostgreSQL credentials.

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the database

```bash
npm run prisma:seed
```

### 6. Start development server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login

### Tasks
- `GET /api/tasks` — List tasks (with filters)
- `GET /api/tasks/:id` — Task detail
- `POST /api/tasks` — Create task (admin)
- `PUT /api/tasks/:id` — Update task (admin)
- `DELETE /api/tasks/:id` — Delete task (admin)

### Submissions
- `POST /api/submissions` — Submit solution
- `GET /api/submissions` — User's submission history

### Users (Admin)
- `GET /api/users` — List users
- `GET /api/users/:id` — User detail
- `PUT /api/users/:id` — Update user

### Leaderboard
- `GET /api/leaderboard` — Public leaderboard

### Profile
- `GET /api/profile` — Current user profile
- `PUT /api/profile` — Update profile
- `GET /api/profile/:userId` — Public profile

### Admin
- `GET /api/admin/logs` — Admin action logs
- `GET /api/admin/stats` — Platform statistics
- `POST /api/admin/message` — Send message to user

### Health
- `GET /api/health` — Health check

## Test Accounts

- **Admin:** admin@codelearn.uz / admin123
- **Users:** ivan@example.com, maria@example.com, alex@example.com / user123

## Auto-checking Logic

1. User submits code via `/api/submissions`
2. Solution is compared with reference solution (normalized)
3. If correct: points awarded, level updated, leaderboard refreshed
4. If incorrect: no points, error message returned
5. All submissions saved in history

In production, SQL queries would execute on a sandboxed test database, and other languages would run in Docker containers with resource limits.

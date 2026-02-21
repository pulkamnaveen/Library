# Digital Library

Unified setup guide for `server`, `client`, and `admin` apps.

## 1) Install dependencies

Run these once:

```bash
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

## 2) Environment setup

### Server

Create/update `server/.env`:

```env
PORT=4000
DBURL=mongodb://127.0.0.1:27017/digital_library
JWT_SECRET=change_this_to_a_strong_secret
CLIENT_URL=http://localhost:5178
ADMIN_SECRET=ADMIN2024
NODE_ENV=development
CORS_ORIGINS=http://localhost:5178,http://localhost:5179

# Security / rate limiting
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
PASSWORD_RESET_RATE_LIMIT_WINDOW_MS=900000
PASSWORD_RESET_RATE_LIMIT_MAX=5

# Password reset email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

Notes:
- If SMTP fields are empty, forgot-password still works but reset links are logged in server console.
- `CLIENT_URL` must match the client app URL where reset pages are hosted.
- In production, set `NODE_ENV=production` and provide strict `CORS_ORIGINS` (comma-separated frontend/admin domains).

### Client

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5179
```

### Admin

Create `admin/.env` from `admin/.env.example`:

```env
VITE_API_URL=http://localhost:4000
VITE_CLIENT_URL=http://localhost:5178
```

## 3) Run apps

Use 3 terminals:

```bash
# Terminal 1
cd server && npm start

# Terminal 2
cd client && npm run dev

# Terminal 3
cd admin && npm run dev
```

Default URLs:
- Server API: `http://localhost:4000`
- Client app: `http://localhost:5178`
- Admin app: `http://localhost:5179`

## 4) Auth and roles

- Current roles used in app: `user`, `admin`
- Resource access is currently simplified to public-only in the active UX.

## 5) Password reset flow

- Client routes:
  - `/forgot-password`
  - `/reset-password/:token`
- Server endpoints:
  - `POST /api/user/forgot-password`
  - `POST /api/user/reset-password/:token`

## 6) Troubleshooting

### 1) Client/Admin not opening on expected port

Vite auto-shifts ports if occupied. Check terminal output for actual URLs.

- Client URL must match `VITE_CLIENT_URL` in `admin/.env`
- Admin URL must match `VITE_ADMIN_URL` in `client/.env`

### 2) API calls failing (`Network Error` / `ERR_CONNECTION_REFUSED`)

- Ensure server is running: `cd server && npm start`
- Ensure `VITE_API_URL` in both `client/.env` and `admin/.env` points to running backend URL
- Restart dev servers after changing `.env`

### 3) Forgot password link not received

- If SMTP is not configured, reset link is printed in server terminal logs
- To send real emails, fill SMTP fields in `server/.env` and restart server
- For Gmail, use App Password (not normal account password)

### 4) Resources not visible in client

- Confirm resource is active (`isActive: true`)
- Confirm backend and client are pointing to the same MongoDB (`DBURL`)
- Recheck `VITE_API_URL` if data exists in DB but UI is empty

### 5) Admin panel says access denied

- Login using account with `role: admin`
- Ensure admin signup uses correct `ADMIN_SECRET`
- If token is stale, logout and login again

---

## 7) Deploying to Production (Render.com)

A `render.yaml` blueprint is included — connect your GitHub repo to Render and it will create all three services automatically.

### Manual setup

#### Backend (Web Service — Node)

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install --production` |
| Start Command | `node server.js` |
| Node version | ≥ 18 |

**Required environment variables:**

| Variable | Notes |
|---|---|
| `NODE_ENV` | `production` |
| `DBURL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (≥ 32 chars) |
| `ADMIN_SECRET` | Secret used when creating admin accounts |
| `CORS_ORIGINS` | Comma-separated deployed frontend URLs |
| `CLIENT_URL` | Deployed client URL (for password-reset links) |
| `SMTP_*` | Optional — for real password-reset emails |

#### Client (Static Site)

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Rewrite rule | `/* → /index.html` |

**Environment variables:**

| Variable | Example |
|---|---|
| `VITE_API_URL` | `https://digital-library-api.onrender.com` |
| `VITE_ADMIN_URL` | `https://digital-library-admin.onrender.com` |

#### Admin (Static Site)

Same as Client but with Root Directory `admin`.

| Variable | Example |
|---|---|
| `VITE_API_URL` | `https://digital-library-api.onrender.com` |
| `VITE_CLIENT_URL` | `https://digital-library-client.onrender.com` |

### Other platforms

- **Railway**: import repo → set same env vars → deploy `server/` as a service
- **Vercel / Netlify**: deploy `client/` and `admin/` as separate projects — set
  root to `client` or `admin`, build command `npm run build`, output `dist`
- **MongoDB**: use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier and paste the connection string as `DBURL`


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

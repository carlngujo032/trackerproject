# Partlog

Mobile-first expense tracker for your projects. Create a project (for example "Sound System Project"), add every part you bought with its price and quantity, and see the running total.

Stack: React (Vite) + Express + Neon Postgres. Icons from react-icons (Phosphor set).

## Folders

- `client/` React app (deploy to Vercel)
- `server/` Express API (deploy to Render)

## Run locally

1. Create a Neon project and copy the connection string.
2. API:
   ```bash
   cd server
   cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
   npm install
   npm run dev               # http://localhost:4000, tables are created automatically
   ```
3. App (new terminal):
   ```bash
   cd client
   npm install
   npm run dev               # http://localhost:5173, /api is proxied to port 4000
   ```
4. Open the app in your browser, press F12, toggle the device toolbar and pick a phone size.

## Deploy

### 1. Neon
Copy the pooled connection string. It looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`.

### 2. Render (API)
- New Web Service, connect your GitHub repo.
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:
  - `DATABASE_URL` your Neon string
  - `JWT_SECRET` any long random string
  - `CLIENT_URL` your Vercel URL, for example `https://partlog.vercel.app` (comma separate if you have more than one)
- Health check path: `/api/health`

The free Render plan sleeps when idle, so the first request after a while can take up to a minute.

### 3. Vercel (app)
- Import the same repo.
- Root Directory: `client`
- Framework preset: Vite
- Environment variable: `VITE_API_URL` = your Render URL, for example `https://partlog-api.onrender.com` (no trailing slash)
- Redeploy after changing the variable.

`client/vercel.json` already rewrites all routes to `index.html` so page refreshes work.

## API summary

All routes except register and login need `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Current user |
| GET | /api/projects | List projects with totals |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Project with items and total |
| PUT | /api/projects/:id | Rename project |
| DELETE | /api/projects/:id | Delete project and its items |
| POST | /api/projects/:id/items | Add item |
| PUT | /api/projects/:id/items/:itemId | Update item |
| DELETE | /api/projects/:id/items/:itemId | Delete item |

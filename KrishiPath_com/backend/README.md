# KrishiPath Company Backend

Production-oriented Node.js, Express, TypeScript, MongoDB API for the company portal in `../frontend`. It implements the frontend's authentication, campaigns, farmer leads, wallet, dashboard, analytics, notifications, company administration, team, rewards, targeting segments, uploads, and audit workflows.

## Run locally

Requirements: Node.js 22.12+ and MongoDB 7+ (or a MongoDB Atlas URI).

```powershell
cd backend
Copy-Item .env.example .env # only if .env is absent
# Edit MONGODB_URI and replace both JWT secrets
npm install
npm run seed
npm run dev
```

The API defaults to `http://localhost:5000/api/v1`. Health is at `/health`, Swagger UI at `/docs`, and the OpenAPI JSON at `/openapi.json`.

Seeded development login: `admin@agrogrow.in` / `demo1234`. Never retain this password in production.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm test` | Integration test suite with an isolated MongoDB |
| `npm run seed` | Idempotently seed the frontend demo company |

## API groups

- `/auth`: register, login, logout, refresh, current user, forgot/reset/change password
- `/campaigns`: CRUD, pause, resume, launch, duplicate
- `/leads`: filtered/paginated list, status update, CSV export
- `/wallet`: summary, ledger, top-up, CSV statement
- `/dashboard` and `/analytics`: calculated KPIs and aggregations
- `/notifications`: list, unread count, read actions
- `/companies`: directory, status approval/suspension, CSV export
- `/team`: list, invite, accept, permission/status updates, remove
- `/settings`: reward defaults and saved audience segments
- `/uploads`: memory-only upload forwarded to Cloudinary
- `/audit-logs`: paginated mutation audit trail

All groups except public auth endpoints require `Authorization: Bearer <accessToken>`. Responses use `{ success, data, message?, meta? }`.

## Deployment

1. Create a MongoDB Atlas database and allow the deployment network.
2. Configure every value in `.env.example` in the host. Use independently generated 32+ character JWT secrets and exact production frontend origins.
3. Configure Cloudinary to enable uploads. The API never persists files locally.
4. Deploy the `backend` directory to Vercel; `vercel.json` routes requests to `api/index.ts`.
5. Run `npm run seed` only for demo/staging environments.

MongoDB collections include compound indexes and tenant references. Campaigns, leads, companies, and team users use soft deletion. Refresh tokens are hashed, rotated, revocable, and expire through a TTL index.

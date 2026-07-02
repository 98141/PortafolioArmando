# Deployment Guide — Portfolio Armando Mora

## Overview

- **Frontend:** Next.js (Vercel or similar)
- **Backend:** Node.js + Express (Render, Railway, VPS, etc.)
- **Database:** MongoDB Atlas
- **Media:** Cloudinary

---

## Backend deploy

1. Set environment variables (see below).
2. Run `npm install --production`.
3. Start with `npm start` (runs `node src/server.js`).
4. Verify `GET /api/health` returns `dbConnected: true`.

### Required env vars (backend)

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | e.g. `5000` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Strong random secret |
| `JWT_REFRESH_SECRET` | Strong random secret |
| `FRONTEND_URL` | Exact frontend origin (CORS), e.g. `https://armandomora.dev` |
| `CLOUDINARY_CLOUD_NAME` | Required in production |
| `CLOUDINARY_API_KEY` | Required in production |
| `CLOUDINARY_API_SECRET` | Required in production |
| `ALLOWED_CANONICAL_HOSTS` | Optional comma-separated hosts for Site Settings canonical URL |

### Cookie production settings

- `COOKIE_SECURE=true` (default in production)
- `COOKIE_SAME_SITE=none` when frontend/backend on different domains (requires HTTPS)
- Ensure HTTPS on both frontend and API in production.

---

## Frontend deploy

1. Set `NEXT_PUBLIC_API_URL` to backend API base (e.g. `https://api.armandomora.dev/api`).
2. Set `NEXT_PUBLIC_SITE_URL` to public site URL (sitemap, RSS, canonical).
3. Run `npm run build` && `npm start`.

---

## CORS

Backend only accepts `FRONTEND_URL` as origin. Update when changing frontend domain.

---

## SEO checklist (post-deploy)

- [ ] `/robots.txt` allows public, blocks `/admin`
- [ ] `/sitemap.xml` loads with static + dynamic routes
- [ ] `/rss.xml` returns published blog posts
- [ ] Home metadata + OG image resolve correctly
- [ ] Admin routes return `noindex` (check HTML meta or headers)
- [ ] Site Settings `canonicalBaseUrl` matches production domain

---

## Post-deploy validation

```bash
# Backend
curl https://YOUR_API/api/health

# Frontend
curl https://YOUR_SITE/robots.txt
curl https://YOUR_SITE/sitemap.xml
curl https://YOUR_SITE/rss.xml
```

Manual smoke:

1. Login admin → dashboard
2. Edit Site Settings → save CV URL
3. Public home → Download CV works
4. Upload image (admin) → success
5. Soft delete project → hidden from public list
6. `POST /api/admin/projects/:id/restore` → visible again

---

## Security notes

- Never commit `.env` files.
- Rotate JWT secrets if compromised.
- Cloudinary credentials backend-only.
- Review audit logs periodically for failed logins and upload rejects.

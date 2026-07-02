# Backend smoke tests

Lightweight checks for CI/local validation. Full integration tests require MongoDB.

## Run

```bash
cd backend
node tests/smoke/env.smoke.js
node tests/smoke/canonical.smoke.js
node -e "require('./src/app'); console.log('app ok')"
```

## Manual checklist

- [ ] `GET /api/health` → uptime, dbConnected, env
- [ ] Login with wrong password → 401 + no token leak
- [ ] Login rate limit after 5 failures / 15 min
- [ ] Admin CRUD create/update → audit log entry created
- [ ] Soft delete project → not in public list
- [ ] Restore project → visible again
- [ ] Upload invalid file (exe as jpg) → 400
- [ ] Delete upload with publicId outside `portfolio/` → 403
- [ ] Site Settings PUT with invalid canonical URL → 400
- [ ] Site Settings singleton → only one active document

# Seguridad — Autenticación Admin

## Resumen

El panel administrativo usa autenticación basada en **JWT** con tokens almacenados en **cookies httpOnly**. El frontend **no** usa `localStorage` ni `sessionStorage` para tokens; solo Zustand para datos públicos del usuario. La sesión se valida contra el backend (`GET /api/auth/me`) con `withCredentials: true`.

Las respuestas de usuario usan lista blanca de campos (`_id`, `name`, `email`, `role`, `isActive`, `lastLogin`, timestamps) — nunca `password` ni `refreshTokenHash`.

## Flujo de autenticación

1. **Login** (`POST /api/auth/login`): el servidor valida credenciales, genera access + refresh JWT, guarda el hash SHA-256 del refresh token en MongoDB y establece dos cookies httpOnly.
2. **Acceso a rutas protegidas**: el middleware `protect` lee la cookie `accessToken`, verifica el JWT y adjunta `req.user`.
3. **Refresh** (`POST /api/auth/refresh-token`): si el access token expiró, el cliente (interceptor Axios) intenta renovar usando la cookie `refreshToken`. El servidor valida el JWT, compara el hash en BD con comparación timing-safe, emite nuevos tokens y **rota** el refresh (nuevo hash en BD).
4. **Logout** (`POST /api/auth/logout`): **público** — siempre responde 200, borra cookies httpOnly y revoca `refreshTokenHash` si puede identificar al usuario por access/refresh cookie (aunque estén expirados). No falla si no hay sesión activa.
5. **getMe** (`GET /api/auth/me`): devuelve el usuario autenticado sin campos sensibles.

## Cookies

| Cookie         | Contenido      | Duración (default) | Flags                          |
|----------------|----------------|--------------------|--------------------------------|
| `accessToken`  | JWT access     | `JWT_ACCESS_EXPIRES_IN` (15m) | `httpOnly`, `secure`*, `sameSite` |
| `refreshToken` | JWT refresh    | `JWT_REFRESH_EXPIRES_IN` (7d)   | `httpOnly`, `secure`*, `sameSite` |

\* `secure` activo en producción o si `COOKIE_SECURE=true`.

Variables relevantes:

- `COOKIE_SECURE` — forzar cookies solo por HTTPS
- `COOKIE_SAME_SITE` — `lax` (dev) o `none` (cross-site en prod con HTTPS)

El frontend debe estar en `FRONTEND_URL` y CORS debe usar `credentials: true`.

## Rotación de refresh token

Cada refresh exitoso:

1. Invalida el refresh anterior (nuevo hash en BD).
2. Emite nuevo par access + refresh.
3. Si el refresh no coincide con el hash almacenado, se invalida la sesión (posible reutilización robada).

## Rutas protegidas

- Middleware `protect`: exige access token válido y usuario activo.
- Middleware `restrictTo("admin")`: exige rol admin (usado en `/api/auth/me` y CMS `/api/admin/*`).
- **CMS Proyectos:** rutas `/api/admin/projects` requieren cookie admin. Público `/api/projects` solo `isActive: true`.
- **CMS Cyber Labs:** rutas `/api/admin/cyber-labs` requieren cookie admin. Público `/api/cyber-labs` solo `isActive: true`. Hallazgos y mitigaciones no se exponen a usuarios no autenticados en endpoints futuros de detalle restringido (actualmente mismo payload en slug público — considerar campo `publicSummary` en Sprint 6+ si se requiere ocultar detalles).
- **CMS Certifications:** `/api/admin/certifications` protegido; público `/api/certifications` solo `isActive: true`. `credentialUrl` y `credentialId` son públicos cuando el registro está activo (credenciales verificables).
- **CMS Education:** `/api/admin/education` protegido; público `/api/education` solo `isActive: true`.
- **CMS Blog:** `/api/admin/blog` protegido; público `/api/blog` solo `isActive: true` y `status: published`. Drafts y archivados nunca se exponen en rutas públicas. El contenido Markdown completo se entrega en detalle por slug — sanitizar XSS en render frontend (react-markdown sin `rehype-raw`).
- Rate limit en rutas `/api/auth/*` (20 intentos / 15 min por IP).
- Rate limit **más estricto** en `POST /api/auth/login` (5 intentos / 15 min por IP).

## Recomendaciones para producción

1. **Deshabilitar** `POST /api/auth/register-admin` (`ALLOW_REGISTER_ADMIN=false`).
2. Usar secretos JWT largos y únicos (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
3. `NODE_ENV=production`, `COOKIE_SECURE=true`, HTTPS en frontend y API.
4. Si frontend y API están en dominios distintos: `COOKIE_SAME_SITE=none` y HTTPS obligatorio.
5. Crear el primer admin con `npm run seed:admin` o registro único controlado, luego deshabilitar registro.
6. Revisar logs y monitoreo de intentos fallidos de login.
7. Considerar MFA y bloqueo por intentos en sprints futuros.
8. Rotar secretos JWT si hay compromiso.

## Mensajes de error

Los errores operativos no exponen stack ni detalles internos en producción. Login devuelve mensaje genérico: *"Invalid email or password"*.

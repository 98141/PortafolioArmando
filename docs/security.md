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

---

# Seguridad — Uploads (Cloudinary) (Sprint 7 + 7.1)

## Superficie de ataque
- Los endpoints de subida están bajo `/api/admin/uploads/*` y están protegidos con `protect` + `restrictTo("admin")`.
- No existe endpoint público para subir/eliminar assets.

## Controles del backend
- **Multer en `memoryStorage`**: evita escribir archivos en disco local.
- **Rate limit específico**:
  - `POST /api/admin/uploads/*`: máximo **10 uploads por IP cada 15 minutos**.
  - Respuesta JSON: `{ "status": "error", "message": "Too many upload attempts..." }`.
  - `DELETE` no cuenta hacia este límite.
- **Límites por tipo**:
  - Imágenes: `5MB` máximo.
  - PDFs: `10MB` máximo.
- **Validación por capas**:
  1. Extensión peligrosa bloqueada (`.exe`, `.js`, `.html`, `.php`, `.svg`, etc.).
  2. `mimetype` declarado (Multer).
  3. **Magic bytes** con `file-type` (`fileTypeFromBuffer`) — valida contenido real del buffer.
- **Separación estricta por endpoint**:
  - Endpoints de imagen: solo JPEG/PNG/WebP/GIF (contenido + mimetype).
  - Endpoints PDF (`cyber-report`, `cv`): solo `application/pdf`.
  - Discrepancia mimetype vs contenido real → rechazo.
  - SVG bloqueado explícitamente.
  - Archivos sin tipo detectable → rechazo.
- **No se confía en el nombre original**:
  - Se genera un `public_id` sanitizado y único.
- **Eliminación segura**:
  - `DELETE /api/admin/uploads` requiere `publicId` y `resourceType`.
  - `resourceType` solo acepta `image` o `raw`.
  - `publicId` debe iniciar con `portfolio/` (namespace Cloudinary del proyecto).
  - Rechaza path traversal (`..`, `\`, etc.).

## Cleanup en frontend
- Al reemplazar un archivo subido, si existe `publicId` anterior se intenta borrar en Cloudinary.
- Si el delete falla, el upload nuevo **no se bloquea**; se muestra warning al admin.

## Prevención de doble subida
- Interceptor Axios no reintenta requests a `/admin/uploads` tras refresh de token.
- Uploads envían `_retry: true` para evitar replay accidental del multipart.

## Logs operativos
- Fallos de upload/delete registran contexto mínimo (`endpoint`, `publicId`, mensaje).
- **Nunca** se loguean API keys, cookies, tokens ni contenido de archivos.

## Manejo de errores
- Los errores del sistema responden con mensajes controlados (sin stack trace en producción).
- Los errores de tamaño/mimetype/magic bytes inválidos responden como fallo operacional (400).

## Riesgos restantes
- Validación magic bytes reduce spoofing pero **no reemplaza antivirus** en PDFs.
- Recomendación Sprint 8+: escaneo antivirus/clamd para PDFs antes de almacenar.
- Rate limit por IP puede afectar admins detrás de NAT compartido (aceptable en MVP).

## Secretos
- `CLOUDINARY_API_SECRET` y demás credenciales viven **solo en el backend** (`backend/src/config/cloudinary.js`).
- El frontend jamás expone credenciales de Cloudinary.

---

# Seguridad — Site Settings y SEO público (Sprint 8)

## Controles en backend
- `PUT /api/admin/site-settings` protegido con `protect` + `restrictTo("admin")`.
- `GET /api/site-settings` expone solo configuración pública del sitio (sin secretos operativos).
- Validación de URLs y email en validator backend.
- Modelo tratado como singleton activo para evitar documentos competidores.

## Superficie pública y privacidad
- Navbar, footer, hero, contacto y metadata consumen Site Settings con fallback local si API falla.
- Campos vacíos (ej. teléfono) no se muestran si no existen.
- Descarga de CV pública abre en nueva pestaña con `rel="noopener noreferrer"`.
- Admin marcado como `noindex,nofollow` desde layout de App Router.

## SEO y rastreo
- Metadata dinámica por slug en secciones públicas.
- `robots.txt` bloquea `/admin`.
- `sitemap.xml` usa fallback estático si falla la API.
- JSON-LD se genera de forma tolerante a campos faltantes.

# Seguridad — Production Hardening (Sprint FINAL)

## Helmet y headers HTTP
- Configuración centralizada en `backend/src/config/helmet.js`.
- CSP compatible con frontend Next.js (sin romper assets del cliente).
- Headers activos: `referrerPolicy`, `frameguard`, `noSniff`, `crossOriginOpenerPolicy`, `originAgentCluster`, `hidePoweredBy`.

## CORS
- Solo origen `FRONTEND_URL` (sin wildcard).
- `credentials: true` para cookies httpOnly.

## Request correlation
- Cada request recibe `X-Request-Id` (`backend/src/middlewares/requestId.js`).
- Logs Morgan incluyen `requestId` para trazabilidad.

## Suspicious activity logging
- Eventos registrados sin datos sensibles (`backend/src/utils/securityLogger.js`):
  - login fallidos repetidos
  - uploads rechazados (magic bytes)
  - delete uploads fallidos
  - access denied admin

## Audit logging
- Modelo `AuditLog` persiste acciones admin y auth.
- **Nunca** almacena passwords, tokens ni cookies.
- Eventos: CRUD CMS, soft delete/restore, uploads, login/logout/refresh/failed login, site settings.

## Soft delete
- Entidades CMS: projects, cyber labs, certifications, education, blog.
- Campos: `isDeleted`, `deletedAt`, `deletedBy`.
- Público: excluye eliminados (`isDeleted !== true`).
- Admin: filtro `includeDeleted=true` opcional; restore vía `POST /api/admin/{entity}/:id/restore`.

## Site Settings singleton
- Clave única `singletonKey: "global"` — un solo documento activo.
- `canonicalBaseUrl` validado contra dominios permitidos (`ALLOWED_CANONICAL_HOSTS` o hostname de `FRONTEND_URL`).
- Bloquea `javascript:`, `data:` y protocolos inseguros.

## Env validation (fail-fast)
- `backend/src/config/env.js` valida al arranque: `PORT`, `MONGO_URI`, JWT secrets, `FRONTEND_URL`, Cloudinary en producción.

## Riesgos restantes
- Rate limit por IP puede afectar admins detrás de NAT.
- Magic bytes no reemplaza antivirus en PDFs.
- Audit log crece indefinidamente — considerar TTL/archivado en producción.
- MFA y bloqueo de cuenta no implementados (futuro).


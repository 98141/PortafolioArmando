# API Spec — Autenticación

Base URL: `http://localhost:5000/api` (desarrollo)

Todas las respuestas de error siguen:

```json
{
  "status": "fail" | "error",
  "message": "Descripción del error"
}
```

---

## POST /auth/register-admin

**Temporal** — Solo en entornos **no production**:

| Condición | Permite registro |
|-----------|------------------|
| `NODE_ENV=production` | Nunca |
| No existe ningún admin | Sí (bootstrap) |
| `ALLOW_REGISTER_ADMIN=true` y `NODE_ENV=development` | Sí (admins adicionales) |
| `ALLOW_REGISTER_ADMIN=false` y ya hay admin | No |

### Request body

```json
{
  "name": "Armando Mora",
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

### Validación

- `name`: 2–100 caracteres
- `email`: formato válido
- `password`: mínimo 8 caracteres, mayúscula, minúscula y número

### Response 201

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "name": "Armando Mora",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2026-05-25T...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

Cookies `accessToken` y `refreshToken` se establecen en la respuesta.

### Errores principales

| Código | Mensaje típico |
|--------|----------------|
| 400 | Validación / email duplicado |
| 403 | Registro deshabilitado / admin ya existe |
| 429 | Rate limit auth (20 / 15 min) |

---

## POST /auth/login

Rate limit login: **5 intentos / 15 min** por IP (además del límite global de la API).

### Request body

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

### Response 200

Misma estructura que register-admin (`data.user` + cookies).

### Errores principales

| Código | Mensaje típico |
|--------|----------------|
| 400 | Validación |
| 401 | Invalid email or password |
| 401 | Your account has been deactivated |
| 429 | Rate limit |

---

## POST /auth/refresh-token

No requiere body. Lee cookie `refreshToken`.

### Response 200

```json
{
  "status": "success",
  "message": "Token refreshed successfully"
}
```

Nuevas cookies access + refresh (rotación).

### Errores principales

| Código | Mensaje típico |
|--------|----------------|
| 401 | Refresh token not provided |
| 401 | Invalid refresh session |
| 401 | User recently changed password |

---

## POST /auth/logout

**Público** — No requiere access token válido. Siempre limpia cookies. Revoca refresh en BD si identifica usuario por cookies (válidas o expiradas).

### Response 200

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

Limpia cookies y `refreshTokenHash` en BD.

### Errores principales

Ninguno operacional esperado — responde 200 incluso sin sesión previa.

---

## GET /auth/me

**Protegido** — Rol `admin`.

### Response 200

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "name": "Armando Mora",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "lastLogin": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### Errores principales

| Código | Mensaje típico |
|--------|----------------|
| 401 | No autenticado / token inválido |
| 403 | Sin permisos |

---

## Health check

`GET /api/health` — Público, sin autenticación.

---

# Proyectos (Sprint 3)

## GET /projects

Público. Solo `isActive: true`.

**Query:** `page`, `limit` (max 50), `category`, `status`, `isFeatured`, `search`

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "projects": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
  }
}
```

Orden: `priority` ASC, `createdAt` DESC.

---

## GET /projects/featured

Público. Proyectos con `isActive: true` e `isFeatured: true`.

**Query:** `limit` (default 6, max 12)

---

## GET /projects/:slug

Público. Detalle por slug (activo).

**404** si no existe o está inactivo.

---

## GET /admin/projects

**Admin** — `protect` + `restrictTo("admin")`.

Lista todos los proyectos con mismos filtros/query + `isActive` opcional.

---

## GET /admin/projects/:id

**Admin** — Detalle por MongoDB `_id`.

---

## POST /admin/projects

**Admin** — Crear proyecto. `createdBy` / `updatedBy` desde sesión.

**Body mínimo:**

```json
{
  "title": "Portfolio Platform",
  "shortDescription": "Descripción corta de al menos veinte caracteres.",
  "category": "fullstack",
  "status": "in_progress",
  "technologies": ["Next.js", "MongoDB"],
  "isFeatured": true,
  "isActive": true,
  "priority": 10
}
```

`slug` se genera automáticamente desde `title` si no se envía.

---

## PATCH /admin/projects/:id

**Admin** — Actualización parcial (mismos campos, todos opcionales).

---

## DELETE /admin/projects/:id

**Admin** — Hard delete. Sprint futuro puede añadir soft delete.

**Response 200:**

```json
{
  "status": "success",
  "message": "Project deleted successfully"
}
```

---

# Cyber Labs (Sprint 4)

## GET /cyber-labs

Público. Solo `isActive: true`.

**Query:** `page`, `limit`, `category`, `severity`, `status`, `isFeatured`, `search`

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "labs": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
  }
}
```

Orden: `priority` ASC, `createdAt` DESC.

---

## GET /cyber-labs/featured

Público. Labs con `isActive: true` e `isFeatured: true`.

**Query:** `limit` (default 6, max 12)

---

## GET /cyber-labs/:slug

Público. Detalle por slug (activo).

---

## GET /admin/cyber-labs

**Admin** — Lista con filtros y paginación.

---

## GET /admin/cyber-labs/:id

**Admin** — Detalle por `_id`.

---

## POST /admin/cyber-labs

**Admin** — Crear security case.

**Body ejemplo:**

```json
{
  "title": "OWASP Top 10 Assessment",
  "shortDescription": "Evaluación sistemática de una aplicación web contra OWASP Top 10 con enfoque defensivo.",
  "category": "web_security",
  "severity": "high",
  "status": "completed",
  "methodology": ["Scope", "Testing", "Reporting"],
  "tools": ["Burp Suite", "OWASP ZAP"],
  "findings": ["IDOR en endpoint de perfil"],
  "mitigations": ["Autorización server-side"],
  "tags": ["defensive", "owasp"],
  "isFeatured": true,
  "isActive": true,
  "priority": 5
}
```

---

## PATCH /admin/cyber-labs/:id

**Admin** — Actualización parcial.

---

## DELETE /admin/cyber-labs/:id

**Admin** — Hard delete.

**Response 200:**

```json
{
  "status": "success",
  "message": "Cyber lab deleted successfully"
}
```

---

# Certifications (Sprint 5)

## GET /certifications

Público. Solo `isActive: true`.

**Query:** `page`, `limit`, `category`, `status`, `isFeatured`, `search`

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "certifications": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
  }
}
```

Orden: `priority` ASC, `createdAt` DESC.

---

## GET /certifications/featured

Público. Certificaciones con `isActive: true` e `isFeatured: true`.

**Query:** `limit` (default 6, max 12)

---

## GET /certifications/:slug

Público. Detalle por slug (activo).

---

## GET /admin/certifications

**Admin** — Lista con filtros y paginación.

---

## GET /admin/certifications/:id

**Admin** — Detalle por `_id`.

---

## POST /admin/certifications

**Admin** — Crear certificación.

**Body ejemplo:**

```json
{
  "title": "CompTIA Security+",
  "issuer": "CompTIA",
  "credentialId": "ABC123",
  "credentialUrl": "https://www.comptia.org/verify",
  "badge": { "url": "https://example.com/badge.png", "alt": "Security+" },
  "description": "Fundamentos de ciberseguridad.",
  "category": "cybersecurity",
  "skills": ["Network security", "Cryptography"],
  "issuedAt": "2025-06-01T00:00:00.000Z",
  "status": "active",
  "isFeatured": true,
  "isActive": true,
  "priority": 10
}
```

---

## PATCH /admin/certifications/:id

**Admin** — Actualización parcial.

---

## DELETE /admin/certifications/:id

**Admin** — Hard delete.

---

# Education (Sprint 5)

## GET /education

Público. Solo `isActive: true`.

**Query:** `page`, `limit`, `academicLevel`, `isFeatured`, `search`

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "education": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
  }
}
```

---

## GET /education/featured

Público. Entradas con `isActive: true` e `isFeatured: true`.

**Query:** `limit` (default 6, max 12)

---

## GET /education/:slug

Público. Detalle por slug (activo).

---

## GET /admin/education

**Admin** — Lista con filtros y paginación.

---

## GET /admin/education/:id

**Admin** — Detalle por `_id`.

---

## POST /admin/education

**Admin** — Crear formación académica.

**Body ejemplo:**

```json
{
  "title": "Ingeniería en Sistemas",
  "institution": "Universidad Centroamericana",
  "academicLevel": "undergraduate",
  "fieldOfStudy": "Ingeniería de software",
  "achievements": ["Proyecto integrador full stack"],
  "focusAreas": ["Desarrollo seguro", "Redes"],
  "isCurrent": true,
  "isFeatured": true,
  "isActive": true,
  "priority": 5
}
```

---

## PATCH /admin/education/:id

**Admin** — Actualización parcial.

---

## DELETE /admin/education/:id

**Admin** — Hard delete.

---

# Blog / Knowledge Hub (Sprint 6)

## GET /blog

Público. Solo `isActive: true` y `status: published`. No incluye `content` Markdown completo (para reducir payload).

**Query:** `page`, `limit`, `category`, `tag`, `isFeatured`, `search`

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "posts": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
  }
}
```

Orden: `priority` ASC, `publishedAt` DESC, `createdAt` DESC.

`readingTime` se calcula automáticamente desde `content` (~200 palabras/min).

---

## GET /blog/featured

Público. Posts publicados, activos y destacados. No incluye `content`.

**Query:** `limit` (default 6, max 12)

---

## GET /blog/:slug

Público. Detalle por slug (publicado y activo). Incluye `content` Markdown completo.

---

## GET /admin/blog

**Admin** — Lista con filtros (incluye drafts).

---

## GET /admin/blog/:id

**Admin** — Detalle por `_id`.

---

## POST /admin/blog

**Admin** — Crear artículo.

**Body ejemplo:**

```json
{
  "title": "JWT en cookies httpOnly: guía práctica",
  "excerpt": "Patrones de autenticación segura con access/refresh tokens y rotación.",
  "content": "## Introducción\n\nContenido en Markdown...",
  "category": "appsec",
  "tags": ["jwt", "mern", "auth"],
  "status": "published",
  "seo": {
    "title": "JWT httpOnly MERN",
    "description": "Guía de auth segura"
  },
  "author": {
    "name": "Armando Mora",
    "role": "Software Developer | Cybersecurity Specialist"
  },
  "isFeatured": true,
  "isActive": true,
  "priority": 10
}
```

---

## PATCH /admin/blog/:id

**Admin** — Actualización parcial.

---

## DELETE /admin/blog/:id

**Admin** — Hard delete.

**Response 200:**

```json
{
  "status": "success",
  "message": "Blog post deleted successfully"
}
```

---

# Uploads Admin (Cloudinary) (Sprint 7)

Base path: `POST/DELETE /api/admin/uploads`

Requisitos comunes:
- Acceso **Admin** (JWT en cookies, `protect` + `restrictTo("admin")`)
- `multipart/form-data` con campo `file`
- **Rate limit**: 10 uploads por IP / 15 min (solo POST)
- Validaciones: extensión peligrosa, `mimetype`, **magic bytes** (`file-type`), tamaño
- Endpoints de imagen rechazan PDF; endpoints PDF rechazan imágenes

## POST /admin/uploads/project-image

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/cyber-evidence

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/cyber-report

PDF. Tipo: `application/pdf`. Magic bytes validados. Tamaño máx: `10MB`.

## POST /admin/uploads/certification-badge

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/education-logo

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/blog-cover

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/author-avatar

Imagen. Tipo: `image/jpeg|image/png|image/webp|image/gif`. Magic bytes validados. Tamaño máx: `5MB`.

## POST /admin/uploads/cv

PDF. Tipo: `application/pdf`. Magic bytes validados. Tamaño máx: `10MB`.

## DELETE /admin/uploads

Admin. Elimina un asset en Cloudinary.

**Reglas:**
- `resourceType` solo `image` o `raw`
- `publicId` debe comenzar con `portfolio/`
- Rechaza IDs fuera del namespace o con caracteres inválidos

**Body ejemplo:**
```json
{
  "publicId": "portfolio/asset-public-id",
  "resourceType": "image|raw"
}
```

## Respuesta estándar (success)

```json
{
  "status": "success",
  "data": {
    "url": "...",
    "secureUrl": "...",
    "publicId": "...",
    "resourceType": "image|raw",
    "format": "...",
    "bytes": 12345,
    "originalName": "..."
  }
}
```

---

# Site Settings (Sprint 8)

## GET /site-settings

Público. Devuelve configuración pública del sitio (perfil, branding, CV, SEO, redes activas, disponibilidad).

**Notas:**
- Endpoint seguro para consumo público.
- Devuelve fallback vacío si no hay configuración previa.

## GET /admin/site-settings

Admin. Obtiene el documento singleton de configuración para edición.

## PUT /admin/site-settings

Admin. Crea/actualiza el singleton activo de Site Settings.

**Reglas:**
- Solo un documento activo (`isActive: true`).
- URLs y email validados en backend.
- `social` ordenable por `priority`.

**Body base (resumen):**
```json
{
  "profile": {
    "fullName": "Armando Mora",
    "professionalTitle": "Software Developer | Cybersecurity Specialist",
    "email": "contacto@armandomora.dev",
    "linkedin": "https://linkedin.com/in/armandomora"
  },
  "branding": {
    "logo": { "url": "https://..." },
    "avatar": { "url": "https://..." }
  },
  "cv": {
    "url": "https://res.cloudinary.com/.../portfolio/cv.pdf",
    "publicId": "portfolio/cv/..."
  },
  "seo": {
    "siteName": "Armando Mora",
    "defaultTitle": "Armando Mora | Software & Cybersecurity",
    "defaultDescription": "Portafolio profesional",
    "canonicalBaseUrl": "https://armandomora.dev"
  },
  "social": [
    {
      "platform": "linkedin",
      "label": "LinkedIn",
      "url": "https://linkedin.com/in/armandomora",
      "isActive": true,
      "priority": 10
    }
  ],
  "availability": {
    "status": "available",
    "message": "Disponible para proyectos selectivos"
  }
}
```

---

# SEO Runtime (Sprint 8)

- `sitemap.xml` (`frontend/src/app/sitemap.ts`):
  - Incluye rutas estáticas públicas.
  - Incluye slugs dinámicos de proyectos, cyber labs, certificaciones, educación y blog published.
  - Si la API falla, conserva rutas estáticas mínimas.
- `robots.txt` (`frontend/src/app/robots.ts`):
  - Permite indexado público.
  - Bloquea `/admin`.
  - Expone URL de sitemap.
- `rss.xml` (`frontend/src/app/rss.xml/route.ts`):
  - Feed RSS de posts published del blog.
- OG image fallback: ogImage → avatar → logo (Site Settings).

---

# Production Hardening (Sprint FINAL)

## GET /health

Público. Estado operacional del API.

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "status": "ok",
    "uptime": 123.45,
    "timestamp": "2026-05-26T12:00:00.000Z",
    "env": "production",
    "dbConnected": true
  }
}
```

Headers: incluye `X-Request-Id`.

## Soft delete y restore (CMS)

Entidades: projects, cyber-labs, certifications, education, blog.

**Delete admin:** soft delete (`isDeleted: true`).

**Query admin:** `?includeDeleted=true` incluye eliminados.

**Restore admin:** `POST /api/admin/{entity}/:id/restore`

Público nunca expone registros con `isDeleted: true`.

## Audit log

Eventos persistidos en MongoDB (`AuditLog`). Escritura automática en CRUD CMS, uploads, auth y site settings.

Acciones típicas: `{entity}.create`, `{entity}.update`, `{entity}.delete`, `{entity}.restore`, `upload.success`, `upload.delete`, `auth.login`, `auth.login_failed`, `site_settings.update`.

## Site Settings singleton (refinado)

- `singletonKey: "global"` unique index.
- `PUT /admin/site-settings` upsert — un solo documento activo.
- `canonicalBaseUrl` validado contra dominios permitidos (`ALLOWED_CANONICAL_HOSTS` o hostname de `FRONTEND_URL`).

## Env obligatorias

Ver `backend/src/config/env.js` y `docs/deployment.md`.

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

**Admin** — Hard delete. Sprint 4 puede añadir soft delete.

**Response 200:**

```json
{
  "status": "success",
  "message": "Project deleted successfully"
}
```

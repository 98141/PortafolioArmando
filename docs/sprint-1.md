# Sprint 1 — Sesión, validación y archivos

Fecha: 2026-09-29. **Implementado y validado localmente; publicación y pruebas en el alojamiento pendientes.**

## Resultado

El frontend deja de rechazar sesiones por no recibir las cookies host-only del subdominio API. La pantalla del panel valida la sesión contra `/api/auth/me`; Express continúa autorizando cada recurso privado. Las cookies permanecen HttpOnly y limitadas a la API.

Los nuevos JWT incluyen una sesión revocable y un identificador único. La renovación es condicional y atómica; el cliente comparte renovaciones y reintenta una vez. Logout revoca tanto refresh como acceso. Una respuesta antigua de validación no puede restaurar una sesión cerrada. Un fallo de logout se muestra en pantalla.

También quedaron corregidos:

- Escrituras sin Origin confiable: rechazadas con 403, además de CORS.
- Query de Express 5: saneamiento y valores transformados de Zod conservados; parámetros repetidos rechazados.
- Configuración de producción: HTTPS, cookies Secure, secretos distintos, duraciones, puerto y proxy explícitos; validación antes de cargar los servicios.
- JSON-LD: contenido del CMS escapado para impedir cerrar el elemento script.
- Cabeceras del frontend: nosniff, protección contra frames, referrer, permisos, HSTS de producción y CSP parcial. El panel y las respuestas privadas no se cachean.
- Formularios de archivos: no borran el archivo guardado al seleccionar otro ni pierden el valor previo si falla la subida.
- CV: subida y persistencia antes de limpiar la versión anterior; compensación ante fallos, preservando archivos si el resultado de BD es incierto.
- CV en ajustes generales: se muestra como referencia y enlaza a su sección dedicada; su payload ya no puede sobrescribir el CV publicado.
- Borrado genérico: bloqueado si hay referencias en contenido guardado, incluidos registros eliminados lógicamente.
- Cloudinary: UUID, overwrite desactivado y comprobación del resultado del borrado.
- GET de ajustes públicos y privados: no crea documentos; una instalación vacía responde con ajustes vacíos.

## Evidencia

| Verificación | Resultado |
| --- | --- |
| `npm test --prefix backend` | Correcto: smoke de entorno/canonical, siete comprobaciones de uploads y batería de seguridad |
| `npm run test:security --prefix backend` | **32 pruebas correctas**, incluidas HTTP, CSRF, permisos, refresh, logout, query y fallos de archivos |
| `npm run test:security --prefix frontend` | **12 pruebas correctas**, incluidas serialización/render de JSON-LD, proxy, concurrencia, uploads y estado de sesión |
| `npm run build --prefix frontend` | Correcto, 27 páginas estáticas |
| `npm run typecheck --prefix frontend` | Correcto |
| Arranque Next del release y `verify:release` | Correctos: ocho páginas, canonical, robots, sitemap, RSS, 22 chunks, cabeceras y estructura admin sin caché |
| Lint global | 35 errores y 9 advertencias; sin archivos nuevos con errores. La deuda de 35 errores del Sprint 0 permanece para los siguientes sprints |
| `git diff --check` | Correcto |

Inventario: [sprint-1-lint.json](sprint-1-lint.json). No se incorporaron dependencias ni se cambiaron lockfiles en este sprint. No se repitió una auditoría de paquetes: el resultado de cero avisos del Sprint 0 corresponde a su fecha.

Las pruebas del backend usan Express, JWT, cookies serializadas y Multer reales sobre HTTP local. MongoDB y Cloudinary están sustituidos por fixtures: se comprueba la lógica, los filtros condicionales y el orden de operaciones, no una transacción sobre servicios reales. Las pruebas del frontend ejecutan código TypeScript/TSX y React con adaptadores controlados; no equivalen a una prueba integral en navegador.

## Activación y compatibilidad

1. Publicar backend y frontend coordinadamente. **Todos los administradores deben volver a iniciar sesión**, porque las sesiones anteriores carecen de sid. El campo `User.sessionId` se genera en el siguiente login; no requiere migración destructiva.
2. Configurar `FRONTEND_URL=https://armandomora.com.co` sin slash final, `COOKIE_SECURE=true` y `COOKIE_SAME_SITE=lax` para los subdominios HTTPS actuales. Mantener las cookies sin Domain.
3. Confirmar TRUST_PROXY en el hosting: cero por defecto, uno únicamente si hay un único proxy confiable y no hay acceso alternativo que permita falsear la IP. Revisar secretos JWT distintos de al menos 32 caracteres.
4. Herramientas de administración y pruebas externas deben enviar Origin confiable además de sus cookies. El acceso por HTTP/www debe redirigir al origen canónico antes del login.
5. Verificar en navegador real login, recarga profunda del panel, expiración de acceso, refresh, subida y logout entre ambos subdominios. Confirmar el alcance y flags de cookies y los logs del backend.
6. Probar CV y limpieza usando datos de staging, incluyendo fallos controlados de persistencia y de Cloudinary. Consultar los eventos `upload.cleanup_failed` y completar manualmente su seguimiento.

## Límites y pendientes

- No se publicó, no se conectaron bases de datos reales ni se subieron/borraron archivos reales. No se cambiaron secretos ni archivos `.env` existentes en este sprint.
- El guardado en MongoDB y el borrado en Cloudinary no forman una transacción distribuida. La comprobación de referencias reduce el riesgo, pero no bloquea otra edición que reutilice manualmente el mismo ID durante la limpieza.
- Los assets generales reemplazados o abandonados se retienen. Su recolección automática con reservas y reintentos durables queda pendiente; la seguridad del archivo publicado tiene prioridad sobre eliminarlos desde el formulario.
- La coordinación del refresh está dentro de cada pestaña. Dos pestañas que consuman simultáneamente el mismo refresh pueden producir un 401 y requerir un nuevo login; la API garantiza un solo consumo.
- La CSP añadida restringe objetos, base URI y frames; no es una CSP completa de scripts con nonces.
- Continúan la deuda de lint, paginación del sitemap y funcionalidades públicas del Sprint 2. El resultado local no declara cerrado el despliegue de producción.

Guías actualizadas: [seguridad](security.md), [API](api-spec.md) y [despliegue/rollback](deployment.md).

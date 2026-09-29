# Seguridad — Sprint 1

Actualizado: 2026-09-29. Implementación local verificada; validación del alojamiento pendiente.

## Sesión y límites de confianza

La API es la autoridad de autenticación y autorización. Las cookies `accessToken` y `refreshToken` son HttpOnly, host-only y Path=/; no se comparten mediante Domain con el frontend. No se guardan tokens en localStorage ni sessionStorage. Zustand conserva únicamente el usuario filtrado y estado de interfaz.

El proxy de Next sirve la estructura del panel con `Cache-Control: private, no-store` y `X-Robots-Tag: noindex, nofollow`. No interpreta la ausencia de cookies de otro host como un cierre de sesión. `ProtectedRoute` consulta `/api/auth/me` antes de mostrar el contenido; todas las rutas privadas de Express exigen `protect` y `restrictTo("admin")`. La estructura HTML del panel puede responder 200 sin sesión; eso no concede acceso a datos privados. Cualquier futura lectura privada del servidor Next deberá autorizarse expresamente.

- Login crea un `sessionId` aleatorio, incluido como `sid` en los JWT. Solo se permite HS256. Cada token tiene un `jti` aleatorio, aunque se emita en el mismo segundo.
- MongoDB almacena el identificador de sesión y el hash SHA-256 del refresh. `protect` verifica firma, expiración, usuario activo, contraseña vigente y sesión actual. Los DTO excluyen contraseña, hash y sessionId.
- Refresh compara el hash y reemplaza el valor mediante una actualización condicional atómica por usuario, sid y hash anterior. Solo una petición puede consumir el mismo refresh. Un token antiguo se rechaza y no revoca una sesión posterior.
- Logout elimina las cookies y revoca hash y sessionId de la sesión identificada. También invalida inmediatamente sus access tokens, sin esperar su expiración. Tokens firmados pero expirados pueden identificar esa sesión únicamente para revocarla. Un fallo de persistencia se comunica como error; no se afirma que la revocación remota tuvo éxito.
- Se mantiene una sesión activa por usuario. Otro login invalida la anterior. Las sesiones emitidas antes de este sprint, sin sid, requieren volver a iniciar sesión.

El cliente comparte una promesa de refresh entre peticiones concurrentes y reutiliza una renovación ya completada para respuestas 401 tardías. Solo reintenta una vez peticiones privadas. No renueva automáticamente fallos públicos ni fallos de login, ni lo hace durante SSR. Un fallo 401/403 definitivo devuelve al login; un fallo temporal del servidor no fuerza esa navegación. Uploads con fetch mantienen el FormData y reintentan una vez tras un 401; `protect` se ejecuta antes de Multer o Cloudinary.

Las comprobaciones iniciales de sesión se agrupan. Una respuesta antigua de `/me` no puede restaurar el estado después de login/logout. Si falla el cierre de sesión, la interfaz muestra el error y permite reintentarlo.

## Cookies, CORS y CSRF

En producción las cookies requieren Secure. SameSite es `lax` por defecto: los hosts HTTPS `armandomora.com.co` y `api.armandomora.com.co` pertenecen al mismo sitio aunque sus orígenes sean distintos. `none` solo se admite con Secure y si la arquitectura realmente lo necesita. No añadir Domain para resolver problemas de navegación del panel.

CORS permite exactamente `FRONTEND_URL`, con credenciales. Además, toda escritura (métodos distintos de GET, HEAD y OPTIONS) exige una cabecera Origin idéntica a ese valor. Un origen ausente, `null`, ajeno o un subdominio no autorizado recibe 403 antes de procesar el cuerpo. Las herramientas HTTP de administración deben enviar ese Origin además de las cookies; la cabecera por sí sola no autentica.

La comprobación de origen complementa las cookies: CORS por sí solo no bloquea la ejecución de un POST malicioso. Los GET públicos ya no crean la configuración del sitio. GET/HEAD/OPTIONS deben seguir libres de mutaciones de negocio en futuras rutas.

## Validación y arranque

- Express 5 expone query mediante un getter. El middleware materializa y sanea una copia por petición, y `validateRequest` conserva los valores transformados por Zod. Los controladores reciben booleanos, números, defaults y cadenas recortadas reales.
- Parámetros query repetidos se rechazan con 400. Se eliminan operadores Mongo de body/query; las claves desconocidas de los esquemas se descartan.
- `FRONTEND_URL` es un origen HTTP(S) exacto, sin slash final, ruta, credenciales, query ni fragment. Producción exige HTTPS.
- PORT: entero 1–65535. TRUST_PROXY: número de saltos confiables, cero por defecto. Configurarlo según la topología real, nunca confiar indiscriminadamente en cabeceras reenviadas.
- Secretos JWT distintos, al menos 32 caracteres en producción y sin placeholders habituales. Duraciones positivas con sufijo s/m/h/d. La validación ocurre antes de cargar la aplicación y Cloudinary.

## Archivos

Se conservan los controles existentes: autenticación/rol, límites de frecuencia, Multer en memoria, tamaños máximos, extensiones, MIME y magic bytes. Las credenciales de Cloudinary siguen únicamente en el backend.

- Los public_id incorporan UUID y `overwrite: false`, evitando colisiones de nombre y tiempo.
- Seleccionar o quitar un archivo en un formulario modifica el valor pendiente; no destruye el archivo guardado. Si falla la subida, se conserva el valor anterior.
- Los archivos generales reemplazados o abandonados se conservan por seguridad. No existe aún un recolector automático de huérfanos. Su limpieza debe comprobar referencias y no ejecutarse mientras otro editor esté guardando el mismo asset.
- El CV se gestiona en `/admin/cv`. El PUT general de Site Settings ignora `cv`, evitando que un formulario antiguo restaure una referencia borrada. La entrada manual de URL del antiguo formulario se retiró para mantener una sola ruta de actualización del CV.
- Reemplazo de CV: subir, guardar y obtener la versión anterior mediante una operación atómica de MongoDB, comprobar referencias y limpiar el asset anterior. Si falla el guardado, solo se limpia el nuevo asset si la BD confirma que no está referenciado; una respuesta de persistencia incierta nunca justifica borrarlo a ciegas.
- Borrado de CV: eliminar la referencia primero; después intentar limpiar el archivo. Un fallo de limpieza no deshace una operación de BD ya confirmada y queda registrado como `upload.cleanup_failed` con publicId, tipo y motivo para seguimiento.
- El endpoint DELETE genérico devuelve 409 para archivos referenciados en proyectos, galerías, laboratorios, certificados, educación, blog y ajustes, incluidos registros con soft delete. Exige namespace `portfolio/` y tipo válido.
- Cloudinary debe confirmar `ok` o `not found`; otros resultados se consideran fallo.

MongoDB y Cloudinary no comparten una transacción. La comprobación de referencias y el borrado no constituyen una exclusión mutua entre editores; no reutilizar manualmente IDs que otro proceso esté limpiando. La limpieza automática fiable con reservas/outbox queda para una evolución posterior.

## JSON-LD y cabeceras

El JSON se serializa escapando `<` como `\u003c`, de modo que un valor del CMS con `</script>` no pueda cerrar el elemento. Se preservan los datos al hacer JSON.parse.

Next añade nosniff, DENY, política de referrer, permisos de cámara/micrófono/geolocalización desactivados, HSTS en producción y una CSP limitada a `object-src`, `base-uri` y `frame-ancestors`. Esta CSP **no restringe scripts**: una política completa con nonces y compatibilidad con el renderizado requiere trabajo adicional. Express mantiene Helmet; su CSP sigue desactivada para la API JSON.

## Verificación y operación

`npm test --prefix backend` ejecuta smoke, validación de uploads y las pruebas de seguridad. `npm run test:security --prefix frontend` verifica JSON-LD, proxy, renovación, uploads y estado de sesión. `npm run verify:release --prefix frontend` verifica el artefacto y HTTP del release arrancado.

Las pruebas HTTP usan Express, JWT, cookies serializadas y Multer reales, con modelos de MongoDB y llamadas Cloudinary sustituidos por fixtures. No prueban la topología TLS real, almacenamiento real ni comportamiento de cookies en un navegador entre los subdominios de producción. Antes de publicar, completar el procedimiento de [deployment.md](deployment.md).

Persisten MFA, antivirus de PDFs, retención/archivado de auditoría y limpieza automática de huérfanos como mejoras futuras. La auditoría de dependencias del Sprint 0 no sustituye estas comprobaciones funcionales.

## Referencias técnicas

- [Migración a Express 5: cambios de req.query](https://expressjs.com/en/guide/migrating-5/#req.query).
- [OWASP: prevención de CSRF y comprobación del origen](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- Guías de la versión instalada de Next 16.3.6: authentication, json-ld y headers, leídas en `frontend/node_modules/next/dist/docs/`.

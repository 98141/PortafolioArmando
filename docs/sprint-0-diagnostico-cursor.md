# Sprint 0 — Diagnóstico de despliegue

Fecha de esta revisión: 29 de septiembre de 2026. Zona del operador: America/Bogota (UTC−05:00). Consultas de producción registradas entre las 21:31:55 y las 21:36:31 UTC (16:31–16:36 en Colombia).

Repositorio: `C:\Users\Asus ExpertBook\Desktop\Desarrollo_MBT\PortafolioArmando`. Rama `main`. HEAD: `c1a77f30835d1bd7a8a87788989ded60a1d8517a` (`Todo listo para produccion`).

**Estado del sprint: abierto.** Los 500 de páginas y recursos SEO están revalidados. La excepción que los produce no está en los logs del alojamiento, así que su causa raíz sigue pendiente. Las subidas de imagen y CV siguen reportadas, sin un POST fallido, estado HTTP, request ID ni traza. No se inicia el sprint 1.

## Alcance y límites

Se leyeron `frontend/AGENTS.md` (exige consultar las guías locales de Next antes de escribir código de aplicación; aquí no se escribió código de aplicación), [la auditoría previa](auditoria-produccion-2026-09-29.md), [el diagnóstico anterior](sprint-0-diagnostico-produccion.md) y [el despliegue](deployment.md). Los comandos de instalación, build, publicación, reinicio y limpieza de ese último documento no se ejecutaron.

Esta revisión solo añade este informe. No hubo POST, PATCH, PUT ni DELETE; tampoco login, refresh, subidas, altas, cambios de variables, instalaciones, builds, arranques, reinicios ni borrado de cachés. No se leyó ningún `.env` real, ni cookies, ni valores de credenciales. No hay acceso autorizado a cPanel, SSH, Cloudinary ni a los logs del proceso.

Las horas de las tablas son UTC del 2026-09-29, tomadas al iniciar cada petición en la máquina del operador. No son la hora del reloj del servidor. La cabecera `Date` de las respuestas coincidió con esa ventana, en precisión de un segundo.

## Preservación del árbol de trabajo

Al leer el estado, ya existían cambios ajenos a este informe. Se dejaron intactos.

| Archivo | Situación observada | SHA-256 del contenido en disco |
| --- | --- | --- |
| `frontend/.env.example` | `git status` lo marca modificado. `git diff` y `git diff --ignore-cr-at-eol` no muestran diferencia de contenido. `git hash-object` coincide con el blob de HEAD (`bcd58014a21f85de7839470e5c0be1da6dca99d9`). El archivo en disco usa CRLF; `core.autocrlf=true`. mtime `2026-09-29T21:16:47.047Z` | `8109779f536ddeff63c9cd3f559c556dff16bd3f3ce1bcd36698d279a49584d7` |
| `docs/auditoria-produccion-2026-09-29.md` | Sin seguimiento | `520ee1246acbbaf878e5b9b93603ad031b2465edd9ecf2449f559ae575258bde` |
| `docs/sprint-0-diagnostico-produccion.md` | Sin seguimiento. Ya estaba en disco al tomar el estado de esta revisión | `87097a35f25e3fac2412829e880358efbd9d6da17f2e69a078c6115cd203ea40` |

No se restauró `.env.example`. No se hizo stage, commit ni limpieza. No se imprimió su contenido.

## Matriz de incidencias

| Incidencia | Evidencia | Causa confirmada o pendiente | Código/despliegue/integración | Próxima acción |
| --- | --- | --- | --- | --- |
| GET `/admin/projects/new` responde 500 antes del formulario | 21:31:57.778 UTC: HTTP 500, cuerpo exacto `Internal Server Error`, `text/plain`, 21 bytes. `Cache-Control: private, no-store`. `Vary` de App Router. Sin `X-Request-Id` y sin `x-nextjs-cache`. Sin cookies | **Pendiente.** El GET no ejecuta el alta ni la subida. La excepción del proceso no se ha visto | Despliegue/runtime del frontend, pendiente de la traza. El código de la página no llama a Cloudinary ni a MongoDB | Copiar el log del proceso de `armandomora.com.co` en ±2 min alrededor de las 21:31:57 UTC, con la excepción completa |
| Listados públicos, detalle, edición de proyecto y recursos SEO responden 500 | 12 GET con el mismo cuerpo de 21 bytes, entre 21:31:56.352 y 21:31:59.812 UTC. El detalle consultado existe en la API como 404 (`Project not found`, request `a1052547-3558-4daf-9987-3593a01375f9`) y el frontend responde 500, no 404. RSS responde 500, no el 503 que el route handler devolvería si llegara a ejecutarse y fallara el listado | **Pendiente.** Misma familia de respuesta que Nuevo proyecto. No está demostrado que todas compartan una sola excepción | Despliegue/runtime del frontend. La integración SSR/API es una hipótesis solo para las rutas que consultan la API, y no explica por sí sola `robots.txt` | Correlacionar cada hora de la tabla con el log del frontend. No asumir una única excepción |
| Subida de imágenes reportada como fallida | Reporte de usuario. Código trazado. OPTIONS de `/api/admin/uploads/project-image` = 204 a las 21:32:03.251 UTC, request `341f668f-a138-404b-a954-a2fa1c5342f3`. No hay POST, cuerpo, tamaño ni request ID de un fallo | **Pendiente.** No se puede fijar la fase | Podría ser sesión, origen, proxy, validación, Cloudinary o el guardado posterior. Ninguno está demostrado | Aportar una captura sanitizada de Network de una imagen fallida y el log de API con el mismo request ID |
| Subida de CV reportada como fallida | Mismo límite de evidencia. OPTIONS de `/api/admin/uploads/cv` = 204, request `e2aa55fb-dae7-405b-bc09-193b84fd17eb`. La respuesta pública de `/api/site-settings` no trae URL de CV (request `4736741c-28ab-4dab-acdf-ed276b60d082`). Eso no prueba que el POST falle | **Pendiente.** Cloudinary y el `findOneAndUpdate` del CV son pasos distintos | Código, despliegue o integración, según la fase que muestre el log | Igual que la imagen, con un PDF: estado, cuerpo, request ID, bytes y MIME. No reenviar el CV ni pegar su contenido |
| El identificador `raw` de un PDF no termina en `.pdf` | Inspección de `backend/src/services/upload.service.js` líneas 7, 17, 45 y 79. Prueba aislada con `upload_stream` simulado: `resource_type=raw`, `public_id=cv-prueba-ccfef525-c870-4920-b8cd-1c0b4712c424`, `hasPdfExtension=false`, `overwrite=false`. No hubo llamada a Cloudinary | **Confirmado como defecto de código.** No está demostrado que sea la causa del rechazo reportado | Código, con efecto en la integración con Cloudinary para CV e informes PDF. Las imágenes usan `resource_type=image` | Corregir en un sprint posterior: conservar el UUID y añadir `.pdf` solo a los `raw`. Comprobar carga, descarga y borrado en un entorno de prueba |
| El formulario puede enviarse con una subida todavía pendiente | `FileUploadField` guarda `loading` en su estado interno (líneas 73 y 91) y no se lo pasa al padre. `ProjectForm` desactiva Guardar solo con el `loading` del guardado del proyecto (línea 378) | **Confirmado por inspección del código actual.** No se repitió el render de React de la auditoría anterior | Código del cliente. Afecta al guardado de la referencia, no al GET que ya devuelve 500 | En un sprint posterior, bloquear el POST/PATCH mientras haya subidas pendientes y conservar la referencia anterior si la subida falla |
| La pantalla de CV oculta el error de lectura | `frontend/src/app/admin/cv/page.tsx` líneas 27–33: `.catch(() => {})` y después `loadingInit=false`. Si la lectura falla, `current` sigue nulo | **Confirmado por inspección.** No se reprodujo con sesión de producción | Código del cliente | Distinguir cargando, error, sin CV y CV disponible. No sustituir un archivo por un fallo de lectura |
| El log de error pierde stack y request ID | Prueba aislada del `globalErrorHandler` con `NODE_ENV` distinto de `development`: la respuesta pública fue `Something went wrong` y el objeto registrado solo tenía `statusCode`, `status`, `message` y `name`. `hasStack=false`, `hasRequestId=false`. `stack` no es enumerable. `uploadLogger.js` tampoco admite request ID | **Confirmado en el manejador local.** No se leyó un log real del hosting | Código de observabilidad. Dificulta el cierre de este sprint; no es, por sí solo, la causa del 500 | Registrar la excepción original sanitizada con request ID, ruta y fase. Mantener la respuesta pública sin stack ni secretos |
| La aceptación del release no cubre el hosting real | `frontend/scripts/with-production.mjs` arranca `next start`. `verify-release.mjs` no abre Nuevo proyecto ni prueba subidas autenticadas. El CI no ejecuta el proceso del alojamiento | **Confirmado como límite del proceso de verificación** | Proceso de despliegue | Ampliar la aceptación contra el dominio publicado cuando el diagnóstico causal esté cerrado. No usar un build verde como sustituto |

## Comprobaciones HTTP

Lecturas con `fetch` de Node, secuenciales, sin cookies ni `Authorization`, sin seguir redirecciones, timeout de 15 segundos. OPTIONS de la API declaró `Origin: https://armandomora.com.co`, método `POST` y cabecera `content-type`. No envió un archivo.

`HTML` es `text/html; charset=utf-8`. `ISE` es el cuerpo exacto `Internal Server Error`. Ningún 500 del frontend trajo `X-Request-Id`. Un HTTP 200 de `/admin/*` es la entrega de la pantalla; esta revisión no inició sesión.

### Frontend

| Hora UTC | Método | Ruta | HTTP | Respuesta | Caché Next |
| --- | --- | --- | --- | --- | --- |
| 21:31:55.481 | GET | `/` | 200 | HTML, 58708 bytes | `STALE`, `x-nextjs-prerender: 1` |
| 21:31:56.032 | GET | `/about` | 200 | HTML, 34440 bytes | `STALE`, prerender |
| 21:31:56.192 | GET | `/contact` | 200 | HTML, 31405 bytes | `STALE`, prerender |
| 21:31:56.352 | GET | `/projects` | 500 | ISE | ausente |
| 21:31:56.510 | GET | `/cybersecurity` | 500 | ISE | ausente |
| 21:31:56.978 | GET | `/certifications` | 500 | ISE | ausente |
| 21:31:57.133 | GET | `/education` | 500 | ISE | ausente |
| 21:31:57.294 | GET | `/blog` | 500 | ISE | ausente |
| 21:31:57.457 | GET | `/projects/audit-nonexistent` | 500 | ISE. Slug usado solo para lectura | ausente |
| 21:31:57.619 | GET | `/admin/projects` | 200 | HTML, 9258 bytes | `HIT`, prerender |
| 21:31:57.778 | GET | `/admin/projects/new` | 500 | ISE. Además `Cache-Control: private, no-store` | ausente |
| 21:31:57.934 | GET | `/admin/projects/507f1f77bcf86cd799439011/edit` | 500 | ISE. ID usado solo para lectura. También `private, no-store` | ausente |
| 21:31:58.098 | GET | `/admin/cv` | 200 | HTML, 9010 bytes | `HIT`, prerender |
| 21:31:58.253 | GET | `/admin/settings` | 200 | HTML, 9021 bytes | `HIT`, prerender |
| 21:31:58.409 | GET | `/admin/login` | 200 | HTML, 8866 bytes | `HIT`, prerender |
| 21:31:58.561 | GET | `/admin/dashboard` | 200 | HTML, 9024 bytes | `HIT`, prerender |
| 21:31:58.714 | GET | `/admin/blog/new` | 200 | HTML, 10220 bytes | `HIT`, prerender |
| 21:31:58.873 | GET | `/admin/certifications/new` | 200 | HTML, 10004 bytes | `HIT`, prerender |
| 21:31:59.027 | GET | `/admin/education/new` | 200 | HTML, 9994 bytes | `HIT`, prerender |
| 21:31:59.185 | GET | `/admin/cyber-labs/new` | 200 | HTML, 9996 bytes | `HIT`, prerender |
| 21:31:59.342 | GET | `/robots.txt` | 500 | ISE | ausente |
| 21:31:59.500 | GET | `/sitemap.xml` | 500 | ISE | ausente |
| 21:31:59.658 | GET | `/rss.xml` | 500 | ISE | ausente |
| 21:31:59.812 | GET | `/og` | 500 | ISE | ausente |

Resultado: 12 respuestas 200 y 12 respuestas 500. El patrón de la auditoría anterior se mantiene en esta ventana. Los bytes de las páginas que ya se habían medido coinciden; `/admin/dashboard` se añadió en esta pasada y también es 200.

Todas las respuestas, incluidas las 500, traen `Server: LiteSpeed` y un `Vary` con `rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`. Ese `Vary` lo emite el App Router de Next. La petición llega a Next a través de LiteSpeed. LiteSpeed también añade un `ETag` idéntico (`"66fci67lppl"`) a los doce cuerpos de 21 bytes.

`frontend/server.js` líneas 16–20 es el único lugar del árbol `frontend/` donde aparece el literal `Internal Server Error`. No aparece en `frontend/node_modules/next/dist`. **Hipótesis:** el `catch` de ese archivo escribió estos cuerpos después de que `handle()` rechazara la promesa. Es compatible con el cuerpo, el tipo `text/plain` y el `Vary` ya puesto por Next. No está confirmado: el startup file del panel no se vio, y otra capa podría emitir el mismo literal. El `catch` hace `console.error("Error al procesar la solicitud:", error)` antes de responder. Esa línea es la que hay que recuperar.

Solo `/admin/projects/new` y la edición traen `Cache-Control: private, no-store` junto al 500. Las otras diez rutas 500 no traen `Cache-Control`. **Hipótesis:** Next alcanzó a clasificar esas dos rutas de proyecto como dinámicas y falló después; las demás pudieron fallar en una fase anterior. Hace falta la traza para confirmarlo.

### API

JSON `application/json; charset=utf-8`. Las listas traen `status=success`, colección vacía y paginación `{page:1,limit:12,total:0,totalPages:0}`. Una lista vacía no demuestra que no existan borradores privados.

| Hora UTC | Método | Ruta | HTTP | Dato relevante | X-Request-Id |
| --- | --- | --- | --- | --- | --- |
| 21:31:59.976 | GET | `/api/health` | 200 | `status=success` | `f9d8dc9a-e5be-467e-a57c-44c4ae2b1852` |
| 21:32:00.432 | GET | `/api/ready` | 200 | `data.ready=true` | `b48c24cf-35a2-4d96-8c6e-f24fece06ac7` |
| 21:32:01.008 | GET | `/api/projects?limit=12&page=1` | 200 | `projects=[]` | `8814e349-8d10-4990-bfe3-da7dd5fe32ed` |
| 21:32:01.289 | GET | `/api/blog?limit=12&page=1` | 200 | `posts=[]` | `c97e3c48-78b6-4572-95e2-18a7d0cfd863` |
| 21:32:01.561 | GET | `/api/cyber-labs?limit=12` | 200 | `labs=[]` | `a4430b8a-a477-432b-8ac7-47d9e41fbb31` |
| 21:32:01.835 | GET | `/api/certifications?limit=12` | 200 | `certifications=[]` | `92583765-0ad9-4bae-846f-558ca80050e6` |
| 21:32:02.105 | GET | `/api/education?limit=12` | 200 | `education=[]` | `239560e1-bed9-49bb-8a2e-593016991e99` |
| 21:32:02.375 | GET | `/api/site-settings` | 200 | hay `settings`; no hay URL de CV | `1e94108b-f2f5-4a99-b24b-1713f4bc3c9d` |
| 21:32:02.650 | GET | `/api/auth/me` | 401 | `You are not logged in. Please log in to continue.` | `2c7d7189-fd7b-461d-8d37-1ec2a85c373c` |
| 21:32:02.802 | GET | `/api/admin/site-settings` | 401 | el mismo rechazo, sin sesión | `56e86977-9910-4763-9948-d9cb3708d9b9` |
| 21:32:02.951 | GET | `/api/admin/projects` | 401 | el mismo rechazo, sin sesión | `3a5dad43-1893-4c20-91ca-74da95379302` |
| 21:36:31 | GET | `/api/health` | 200 | `uptime=6515`, timestamp del servidor `2026-09-29T21:36:31.211Z` | `a4a32954-a70a-474c-9a0a-73223d944e9c` |
| posterior | GET | `/api/projects/audit-nonexistent` | 404 | `Project not found` | `a1052547-3558-4daf-9987-3593a01375f9` |
| posterior | GET | `/api/site-settings` | 200 | comprobación de presencia de CV, sin URL | `4736741c-28ab-4dab-acdf-ed276b60d082` |

`backend/src/routes/health.routes.js` mide `uptime` desde la creación del router de salud y hace ping a MongoDB con timeout de 1000 ms. El diagnóstico anterior registró `uptime=5352` a las 21:17:08.079 UTC. La diferencia hasta 6515 segundos a las 21:36:31.211 UTC es de 1163 segundos, igual al tiempo transcurrido. **El proceso de la API no se reinició entre esas dos lecturas.** Llevaba en marcha desde aproximadamente las 19:47:56 UTC (14:47 en Colombia), según ese contador. Readiness y las lecturas públicas no validan Cloudinary, permisos de escritura ni la red de salida del proceso frontend.

### Preflight

| Hora UTC | Método | Ruta | HTTP | X-Request-Id |
| --- | --- | --- | --- | --- |
| 21:32:03.102 | OPTIONS | `/api/admin/uploads/cv` | 204 | `e2aa55fb-dae7-405b-bc09-193b84fd17eb` |
| 21:32:03.251 | OPTIONS | `/api/admin/uploads/project-image` | 204 | `341f668f-a138-404b-a954-a2fa1c5342f3` |

En ambas: `Access-Control-Allow-Origin: https://armandomora.com.co`, `Access-Control-Allow-Credentials: true`, métodos `GET,HEAD,PUT,PATCH,POST,DELETE`, cabecera permitida `content-type`. No apareció `Access-Control-Expose-Headers`. El request ID se puede copiar desde Network; el JavaScript de la página no tiene por qué poder leerlo entre orígenes.

Un OPTIONS 204 no demuestra un POST autenticado, un multipart ni una respuesta de Cloudinary. El navegador no hace preflight en todos los `FormData`.

Una sonda OPTIONS a `https://armandomora.com.co/projects`, sin el preflight de la API, respondió 400 con cuerpo vacío y el `Vary` de Next. No forma parte del fallo de subida. Queda anotada para no confundirla con un POST.

## Qué hace el GET de Nuevo proyecto

`frontend/src/app/admin/projects/new/page.tsx` es un Server Component. Espera `searchParams` y renderiza `NewProjectPageClient`. El alta ocurre después, en el cliente: `NewProjectPageClient.tsx` llama a `projectService.createProject`, que hace POST JSON a `/api/admin/projects`. La imagen, si el formulario llegara a abrirse, iría antes por otro POST multipart a `/api/admin/uploads/project-image`.

Ese GET 500 ocurre antes de cualquiera de esos POST. No demuestra un fallo de MongoDB ni de Cloudinary.

`/admin/blog/new` es un Client Component sin `searchParams` y respondió 200. En el build local, esa ruta está prerenderizada; `/admin/projects/new` no lo está, porque usa `searchParams`. **Hipótesis:** en producción se sirven las páginas prerenderizadas y falla la ejecución de las rutas que Next tiene que resolver en la petición. Sigue siendo hipótesis hasta ver la excepción.

## Por qué el 500 no se explica solo con la API

La API pública respondió 200 en los cinco listados. Aun así, el frontend devolvió 500 en esas mismas secciones.

- `getPublicSiteSettings` atrapa el fallo de red y devuelve un objeto vacío. `/about` la usa y respondió 200, además desde caché `STALE`.
- `getPublicList` lanza `PublicContentError` si el fetch falla o el JSON no cumple el contrato. Un listado que lance esa excepción puede acabar en 500 si nadie la convierte en una página de error.
- `frontend/src/app/rss.xml/route.ts` captura el fallo del listado y responde 503 con el texto «El feed no está disponible temporalmente.». La respuesta observada fue el ISE de 21 bytes. **El branch 503 no produjo esta respuesta.**
- `frontend/src/app/robots.ts` no consulta la API. En el artefacto local, `.next/server/app/robots.txt.body` es un robots válido con `Sitemap: https://armandomora.com.co/sitemap.xml`, y `robots.txt.meta` declara estado 200 y `text/plain`. Producción respondió ISE. El cuerpo local no es el que se está sirviendo.
- El slug inexistente es 404 en la API y 500 en el frontend. Si `getPublicDetail` recibiera ese 404, llamaría a `notFound()`. La documentación de Next de este repo indica que `notFound()` lanza un error de control con digest `NEXT_HTTP_ERROR_FALLBACK;404` para que el framework pinte el 404. La respuesta observada no es un 404.

**Hipótesis, no causa cerrada:** el `catch` de `server.js` convierte en el mismo texto de 21 bytes rechazos distintos (fallo al cargar un módulo, fallo al leer el prerender, excepción de render o señal de `notFound`). La auditoría previa registró que, con este mismo `server.js` y este build, el servidor local devolvió 200 en estas rutas y 404 en un detalle inexistente. Esa ejecución local no se repitió aquí, para no arrancar el proceso ni escribir en `.next`. Sigue siendo un antecedente, no una medición de hoy.

## Circuito de subida, del formulario al proveedor

Describe el código del commit `c1a77f3`. No certifica que el proceso remoto ejecute este mismo árbol.

| Fase | Qué hace el código | Qué falta para atribuir el fallo |
| --- | --- | --- |
| Sesión | `uploadService.ts` envía `credentials: "include"`. Ante 401 renueva la sesión una vez y reintenta. `protect.js` exige cookie de acceso, usuario activo y `sid` vigente. La ruta exige rol `admin` | Si el navegador envió cookie, solo como sí o no, y la secuencia upload/refresh. El 401 anónimo de la tabla es el rechazo esperado |
| Cookies | `cookies.js`: HttpOnly, `Secure` en producción salvo `COOKIE_SECURE=false`, SameSite `lax` por defecto, `path=/`, sin `Domain` | Atributos efectivos en el panel. No hace falta el valor |
| Origen | CORS refleja el origen configurado. `requireTrustedOrigin.js` exige `Origin` idéntico a `FRONTEND_URL` en escrituras. GET, HEAD y OPTIONS quedan exentos | El `Origin` del POST fallido. El OPTIONS 204 no ejecuta este control |
| Multipart | El cliente crea `FormData` con el campo `file` y no fija `Content-Type`, para que el navegador ponga el boundary. Multer usa memoria y `.single("file")` | Nombre de campo, boundary y tamaño recibido por el proxy, sin el archivo |
| Límites | Imagen: 5 MiB (`5242880`). PDF: 10 MiB (`10485760`). Subidas: 10 peticiones por 15 minutos, contando las exitosas. Límite general: 300 por 15 minutos. `express.json` limita a 500 kb y no se aplica al multipart | Un 413 o 429 real, la IP que ve el limitador y `TRUST_PROXY`. El default del código es `0` |
| Validación | MIME declarado, extensiones peligrosas y firma con `file-type` importado de forma dinámica. Imágenes: JPEG, PNG, WebP, GIF. PDF: `application/pdf`. SVG rechazado | MIME declarado, firma detectada y, si existe, `[security:upload_rejected]` |
| Cloudinary | Stream desde el buffer, `overwrite: false`, `image` o `raw`. El error se sustituye por «Image upload failed» o «PDF upload failed» | Código y mensaje sanitizado del proveedor, y el request ID. Presencia de variables no demuestra que sean válidas |
| Referencia de imagen | El POST de la imagen devuelve la referencia. El formulario la copia a `imageUrl` / `imagePublicId`. El proyecto se guarda en otro POST | Hay que saber si falló la subida, el guardado o la visualización posterior |
| CV | Sube el PDF y después hace `findOneAndUpdate` del singleton con `upsert`. Solo entonces intenta limpiar el anterior. Si el guardado falla, intenta borrar el recurso nuevo si nadie lo referencia | Separar error de Cloudinary, error de MongoDB y limpieza. El ping de `/ready` no prueba el upsert |

Los ocho POST bajo `/api/admin/uploads` comparten sesión, rol, limitador, multipart y validación:

| Ruta | Contenido y límite | Destino |
| --- | --- | --- |
| `/project-image` | Imagen, 5 MiB | Cloudinary `image`; la referencia se guarda después |
| `/cyber-evidence` | Imagen, 5 MiB | Cloudinary `image` |
| `/certification-badge` | Imagen, 5 MiB | Cloudinary `image` |
| `/education-logo` | Imagen, 5 MiB | Cloudinary `image` |
| `/blog-cover` | Imagen, 5 MiB | Cloudinary `image` |
| `/author-avatar` | Imagen, 5 MiB | Cloudinary `image` |
| `/cyber-report` | PDF, 10 MiB | Cloudinary `raw` |
| `/cv` | PDF, 10 MiB | Cloudinary `raw` y MongoDB en el mismo controlador |

## Release local frente a lo observado en producción

No se inspeccionó el entorno de cPanel. Estas filas comparan el puesto de trabajo con las respuestas remotas. No atribuyen el fallo a Passenger, a una versión de Node, a Cloudinary ni a credenciales.

| Comprobación | Local, en esta revisión | Producción, en esta revisión |
| --- | --- | --- |
| Runtime de la terminal | Node `v24.15.0`, npm `11.12.1`. `.nvmrc` y `engines` piden Node `>=24.15.0 <25` y npm `>=11 <12` | Desconocido. Hay que medirlo en el entorno que el panel activa para cada aplicación |
| Paquetes instalados, leídos de `package.json` de `node_modules` | Next `16.3.6`, React y React DOM `19.2.4`, eslint-config-next `16.3.6`; file-type `22.0.1`, cloudinary `2.10.0`, multer `2.4.0`, mongoose `9.10.2`, express `5.2.1` | No se leyeron los paquetes del servidor |
| Arranque declarado | Frontend Passenger: `server.js` (`npm run start:passenger`). `npm start` usa `next start`. Backend: `node src/server.js` | Raíz, startup file, modo y ejecutable reales: desconocidos. La documentación los prescribe; no demuestra que estén aplicados |
| Borde HTTP | — | Cabecera `Server: LiteSpeed` en el sitio y en la API. Identifica el borde. No identifica el supervisor de Node |
| Build local | `BUILD_ID` `jDCTCsLmT1RdP4zVN29xb`, mtime `2026-09-29T20:16:57.733Z` | `BUILD_ID` remoto no obtenido |
| JS de la portada | 12 chunks referenciados en el HTML remoto coinciden en SHA-256 y tamaño con `frontend/.next/static/chunks`. Uno de ellos, `0mu9zolocnmmz.js` (22275 bytes), contiene `https://api.armandomora.com.co/api` | Esos 12 archivos estáticos coinciden con este build. No cubren `.next/server`, el resto de chunks ni `node_modules` |
| Cadenas en el build local | 7 archivos estáticos y 11 de servidor contienen la URL pública de la API. Cero contienen `http://localhost:5000` o `http://localhost:3000`. 83 archivos de servidor contienen `https://armandomora.com.co` | El chunk coincidente indica que el JS público servido salió de un build con la API de producción. Los bundles de servidor del hosting no se compararon |
| Prerender local | Están prerenderizadas, entre otras, `/`, `/about`, `/contact`, las pantallas admin que hoy responden 200, `/robots.txt`, `/sitemap.xml` y `/og`. No lo están los cinco listados, `/rss.xml`, `/admin/projects/new` ni la edición | Las páginas prerenderizadas de tipo página respondieron 200 con `x-nextjs-cache` HIT o STALE. `robots.txt`, `sitemap.xml` y `/og` también están prerenderizados en local y en producción respondieron 500. Esa diferencia impide cerrar la causa como «solo fallan las rutas dinámicas» |
| Servidor local en vivo | No se arrancó `server.js` ni `next start` | Los GET remotos son los de la sección HTTP |

Huellas locales para una comparación futura de solo lectura:

| Archivo | SHA-256 |
| --- | --- |
| `frontend/package-lock.json` | `52c6ce2882124273862934f3a3f00596a2845c0dfe2b926b08f463da39b3bf3b` |
| `backend/package-lock.json` | `784c368e440576fca9077f2afe8a462ad1b4e398db13caf0e16ffead807b2647` |
| `frontend/server.js` | `82bd7497694a77d8b7874b83dc1854b33b448785888816387a6621521026d964` |
| `frontend/.next/BUILD_ID` | `eca2d77937f595c19b35f6c6ab2de99ad5c5ad30153d41163ff683dd1e6c83bb` |
| `frontend/.next/server/app-paths-manifest.json` | `08bcedfa75a50575b7b09b81191ec8ef0bff87962969ff87f071fbbae2c82146` |
| `frontend/.next/server/app/admin/projects/new/page.js` | `fb0d22d9678ef66c34c40d55c0a557e0a8749915916ac682dc528093f8185d2c` |
| `frontend/.next/server/app/robots.txt/route.js` | `0b07034310d78d0a74dbb731ac65b1f421f70926382eff297481eca58b0cf9c0` |

## Prueba aislada

Se ejecutó en Node `v24.15.0`, con credenciales literales `fixture`, `upload_stream` sustituido en memoria y sin red hacia Cloudinary. `NODE_ENV` estaba vacío, así que el manejador de errores no tomó la rama `development`.

Resultado del PDF simulado:

```json
{
  "folder": "portfolio/cv",
  "resource_type": "raw",
  "public_id": "cv-prueba-ccfef525-c870-4920-b8cd-1c0b4712c424",
  "overwrite": false,
  "hasPdfExtension": false
}
```

La imagen simulada usó `resource_type=image` y un identificador sin extensión, que es la convención prevista para imágenes. El manejador registró un objeto sin `stack` y sin `requestId`, y respondió `Something went wrong`.

Esto reproduce el contrato de código. No reproduce el POST de producción ni la respuesta de Cloudinary.

## Información que falta, y cómo obtenerla sin secretos

No hay acceso a cPanel en esta sesión. Hace falta que alguien con acceso de lectura al alojamiento aporte lo siguiente. No hace falta repetir la subida: un POST de CV puede sustituir el archivo vigente.

1. **Log del frontend** al servir `GET /admin/projects/new` alrededor de **2026-09-29 21:31:57 UTC (16:31:57 en Colombia)**, ±2 minutos. Conservar el prefijo `Error al procesar la solicitud:` si aparece, el nombre del error, el código y el stack sanitizado. Repetir la búsqueda para `/robots.txt` a las 21:31:59.342 UTC y para `/projects` a las 21:31:56.352 UTC, por si la excepción no es la misma.
2. **Una imagen y un PDF que hayan fallado**, si Network todavía los tiene: fecha y zona, método, URL sin query sensible, estado HTTP, cuerpo sanitizado, duración, `X-Request-Id`, extensión, bytes y MIME. No enviar el CV ni un HAR sin limpiar.
3. **Log del backend** de esos request ID. Buscar `[upload:...]`, `[security:upload_rejected]`, errores de MongoDB y `[asset cleanup]`. Si el request ID no está en la API, el rechazo ocurrió en el proxy o en el frontend y hay que mirar esos registros a la misma hora.
4. **Entorno efectivo de cada aplicación**, leído desde el entorno que activa el panel, sin volcar el entorno completo: `node --version`, `npm --version`, `process.execPath`, raíz, startup file, modo y directorio del release. En frontend: `npm ls next react react-dom --depth=0`. En backend: `npm ls file-type cloudinary multer mongoose --depth=0`.
5. **Integridad:** `BUILD_ID` remoto, presencia de `.next/server/app/robots.txt.body`, `.next/server/app/admin/projects/new/page.js` y de los chunks de servidor que esos archivos requieren. Hashes, sin copiar el árbol. Permisos de lectura del usuario del proceso y permiso de escritura del caché de `.next`, consultados, sin `chmod` ni archivos de prueba.
6. **Integración, solo si el error ya apunta ahí:** presencia o ausencia de `CLOUDINARY_*`, `MONGO_URI` y `FRONTEND_URL` como dato de «está definida / no está definida», más el valor público de `FRONTEND_URL` si no contiene credenciales. No pegar secretos, cookies, JWT ni la cadena de conexión.

Con esa evidencia se puede separar: módulo ausente, permiso, runtime, excepción de aplicación, sesión, origen, límite del proxy, validación, Cloudinary o MongoDB. Hasta entonces no corresponde cambiar Node, el startup file, Passenger, el caché ni las credenciales.

## Propuesta de corrección, sin ejecutarla

1. Conservar este release y estos logs. Cerrar la causa de los 500 con la traza del frontend. Si el error es un archivo, un permiso o el runtime, corregir el despliegue. Si la traza señala una línea de la aplicación, corregir esa línea. No elegir el arreglo por descarte.
2. Tratar las subidas con la fase que muestren su estado HTTP y su log. Mantener separados el defecto del `public_id` de los PDF, el guardado durante la subida, el error silenciado del CV y la pérdida de stack. Pueden corregirse cuando el diagnóstico de los 500 esté cerrado; no se presentan como la reparación de esos 500.
3. Cuando haya un arreglo, aceptarlo en el dominio: las 24 rutas de la tabla según su función (detalle inexistente en 404, Nuevo proyecto abre sin crear el documento), robots/sitemap/RSS/OG con su formato, y una subida de prueba de imagen y de PDF en un entorno que no sustituya el CV de producción a ciegas.
4. Ampliar después la verificación de release para que mire estas rutas en el hosting. Un `next start` local no sustituye esa prueba.

**El sprint 0 no queda cerrado.** Faltan la excepción del frontend y la respuesta real de una imagen y un PDF fallidos.

# Sprint 0 — Diagnóstico de producción

Fecha: 2026-09-29. Zona del operador: America/Bogota (UTC−05:00).

**Estado: diagnóstico causal abierto.** Se revalidó la indisponibilidad de 12 rutas del frontend. No se conoce todavía la excepción que las origina. Los fallos de subida de imágenes y CV siguen reportados, sin trazas ni respuestas de las peticiones fallidas que permitan atribuirles una causa. El usuario indicó «no los tengo» al solicitar esos registros. No se inició el sprint 1.

## 1. Alcance, instrucciones y preservación

- Repositorio: `C:\Users\Asus ExpertBook\Desktop\Desarrollo_MBT\PortafolioArmando`.
- Rama: `main`. HEAD: `c1a77f30835d1bd7a8a87788989ded60a1d8517a`.
- Se buscaron `AGENTS.md` en la raíz y sus ancestros; no se encontraron allí. El archivo aplicable encontrado fue `frontend/AGENTS.md`: exige consultar las guías locales de Next antes de escribir código. No se escribió código.
- Se leyeron íntegramente [la auditoría previa](auditoria-produccion-2026-09-29.md) y [las instrucciones de despliegue](deployment.md). Sus comandos de instalación, build, publicación, reinicio y limpieza no se ejecutaron: las restricciones de este sprint prevalecen.
- Estado inicial: sin diferencias en archivos versionados ni en staging; dos archivos sin seguimiento: `.claude/settings.local.json` y `docs/auditoria-produccion-2026-09-29.md`. Se preservaron. No se mostró el contenido de la configuración local.
- Git advirtió que no podía leer el archivo global de exclusiones del usuario por permisos locales. `git diff --quiet` y `git diff --cached --quiet` devolvieron 0. Esa advertencia no es evidencia de un problema del hosting.
- Único archivo creado por este trabajo: este informe. No hubo POST, PATCH, PUT ni DELETE; tampoco login/refresh, uploads, altas de proyectos, sustitución de CV, cambios de variables, instalaciones, builds, arranques/reinicios ni limpieza de cachés.
- No se leyeron archivos `.env`, almacenes de credenciales ni valores de cookies. Las consultas HTTP no enviaron sesión y solo registraron cabeceras seleccionadas, sin `Set-Cookie`.

Huellas SHA-256 de los archivos preexistentes sin seguimiento, tomadas antes de redactar el informe y usadas para comprobar su preservación:

| Archivo | SHA-256 |
| --- | --- |
| `.claude/settings.local.json` | `516b58fcf55aa93a6b802ab5f1ba842e02496c64145fc78cdde5dac01bdef065` |
| `docs/auditoria-produccion-2026-09-29.md` | `520ee1246acbbaf878e5b9b93603ad031b2465edd9ecf2449f559ae575258bde` |

## 2. Método y matriz HTTP

Lecturas mediante `fetch` de Node desde la máquina del operador, secuenciales, sin cookies ni autorización. GET sin seguir redirecciones y con timeout de 15 segundos en la ejecución con red autorizada. OPTIONS declaró `Origin: https://armandomora.com.co`, método solicitado `POST` y cabecera solicitada `content-type`; no envió un archivo ni ejecutó ese POST.

El primer intento, entre **21:16:23.340 y 21:16:24.002 UTC**, terminó con `fetch failed / EACCES` para los mismos 33 GET y 2 OPTIONS: **no hubo estado HTTP**. Fue una restricción de red del sandbox local. La repetición con acceso de red autorizado produjo las respuestas siguientes. No se atribuye ese `EACCES` al alojamiento.

Todas las horas de las tablas corresponden al **2026-09-29**, en **UTC**, registradas al iniciar cada petición; en Colombia se restan cinco horas (por ejemplo, 21:17 = 16:17). No son duraciones ni timestamps del servidor. La ventana de solicitudes exitosamente observadas fue 21:17:02.811–21:17:10.383 UTC.

### 2.1 Frontend

`HTML` significa cuerpo recibido con `Content-Type: text/html; charset=utf-8`; no certifica hidratación, navegación ni operación autenticada. `ISE` significa cuerpo exacto `Internal Server Error`, `Content-Type: text/plain`, 21 bytes. Ninguna de estas 23 respuestas incluyó `X-Request-Id` ni `Location`.

| Hora UTC | Método | URL | HTTP | Respuesta relevante |
| --- | --- | --- | --- | --- |
| 21:17:02.811 | GET | https://armandomora.com.co/ | 200 | HTML, 58708 bytes |
| 21:17:03.514 | GET | https://armandomora.com.co/about | 200 | HTML, 34440 bytes |
| 21:17:03.672 | GET | https://armandomora.com.co/contact | 200 | HTML, 31405 bytes |
| 21:17:03.832 | GET | https://armandomora.com.co/projects | 500 | ISE |
| 21:17:03.995 | GET | https://armandomora.com.co/cybersecurity | 500 | ISE |
| 21:17:04.458 | GET | https://armandomora.com.co/certifications | 500 | ISE |
| 21:17:04.617 | GET | https://armandomora.com.co/education | 500 | ISE |
| 21:17:04.778 | GET | https://armandomora.com.co/blog | 500 | ISE |
| 21:17:04.935 | GET | https://armandomora.com.co/projects/audit-nonexistent | 500 | ISE; slug usado solo para lectura |
| 21:17:05.103 | GET | https://armandomora.com.co/admin/projects | 200 | HTML, 9258 bytes |
| 21:17:05.266 | GET | https://armandomora.com.co/admin/projects/new | 500 | ISE; falla abrir el formulario |
| 21:17:05.428 | GET | https://armandomora.com.co/admin/projects/507f1f77bcf86cd799439011/edit | 500 | ISE; ID usado solo para lectura |
| 21:17:05.595 | GET | https://armandomora.com.co/admin/cv | 200 | HTML, 9010 bytes |
| 21:17:05.760 | GET | https://armandomora.com.co/admin/settings | 200 | HTML, 9021 bytes |
| 21:17:05.931 | GET | https://armandomora.com.co/admin/login | 200 | HTML, 8866 bytes |
| 21:17:06.086 | GET | https://armandomora.com.co/admin/blog/new | 200 | HTML, 10220 bytes |
| 21:17:06.242 | GET | https://armandomora.com.co/admin/certifications/new | 200 | HTML, 10004 bytes |
| 21:17:06.392 | GET | https://armandomora.com.co/admin/education/new | 200 | HTML, 9994 bytes |
| 21:17:06.547 | GET | https://armandomora.com.co/admin/cyber-labs/new | 200 | HTML, 9996 bytes |
| 21:17:06.700 | GET | https://armandomora.com.co/robots.txt | 500 | ISE |
| 21:17:06.859 | GET | https://armandomora.com.co/sitemap.xml | 500 | ISE |
| 21:17:07.017 | GET | https://armandomora.com.co/rss.xml | 500 | ISE |
| 21:17:07.171 | GET | https://armandomora.com.co/og | 500 | ISE |

Resultado: 11 respuestas 200 y 12 respuestas 500, coherentes con la auditoría anterior. Los 200 administrativos solo confirman la entrega de HTML sin sesión, no autorización ni acceso a información privada.

### 2.2 API y preparación

Todas estas respuestas fueron JSON (`application/json; charset=utf-8`). En las listas, `status=success`, colección vacía y paginación `{page:1,limit:12,total:0,totalPages:0}`. Eso no demuestra ausencia de borradores privados.

| Hora UTC | Método | URL | HTTP | Respuesta relevante | X-Request-Id |
| --- | --- | --- | --- | --- | --- |
| 21:17:07.344 | GET | https://api.armandomora.com.co/api/health | 200 | `status=success`; uptime 5352; timestamp del servidor `2026-09-29T21:17:08.079Z` | `d8c81ae0-5306-4f98-8a3d-d90943c0b274` |
| 21:17:07.824 | GET | https://api.armandomora.com.co/api/ready | 200 | `{"status":"success","data":{"ready":true}}` | `9866a3df-a63e-4afd-a260-d3352b274931` |
| 21:17:08.388 | GET | https://api.armandomora.com.co/api/projects?limit=12&page=1 | 200 | `projects=[]`; paginación indicada | `ba91e0c8-283e-42d4-a665-f37efe143ca8` |
| 21:17:08.666 | GET | https://api.armandomora.com.co/api/blog?limit=12&page=1 | 200 | `posts=[]`; paginación indicada | `d0afce69-5c5c-4cfc-8199-b093736c7188` |
| 21:17:08.942 | GET | https://api.armandomora.com.co/api/cyber-labs?limit=12 | 200 | `labs=[]`; paginación indicada | `5441c4d8-7c9d-452a-ab7a-fadc846cb487` |
| 21:17:09.222 | GET | https://api.armandomora.com.co/api/certifications?limit=12 | 200 | `certifications=[]`; paginación indicada | `281e6d76-b698-49fe-801a-1a738010cd4f` |
| 21:17:09.499 | GET | https://api.armandomora.com.co/api/education?limit=12 | 200 | `education=[]`; paginación indicada | `545d3999-f586-48df-b397-e6e28c50adb8` |
| 21:17:09.795 | GET | https://api.armandomora.com.co/api/auth/me | 401 | `status=fail`; `You are not logged in. Please log in to continue.` | `5c00c70f-ba24-4ea6-ac80-94f02484203e` |
| 21:17:09.944 | GET | https://api.armandomora.com.co/api/admin/site-settings | 401 | Mismo rechazo sin sesión | `a9f9031c-e0d8-441e-a948-1f14cbbc95f9` |
| 21:17:10.089 | GET | https://api.armandomora.com.co/api/admin/projects | 401 | Mismo rechazo sin sesión | `cb1945cf-6e9c-47ff-bf41-05b5688997f1` |

El código de `backend/src/routes/health.routes.js:3` comprueba conexión y ping a MongoDB, con timeout de 1000 ms y resultado interno reutilizable durante 5000 ms. **Readiness y lecturas públicas no validan Cloudinary, privilegios de escritura, sesión administrativa ni conectividad desde el proceso frontend del hosting.**

### 2.3 Preflight de uploads

| Hora UTC | Método | URL | HTTP | Respuesta | X-Request-Id |
| --- | --- | --- | --- | --- | --- |
| 21:17:10.237 | OPTIONS | https://api.armandomora.com.co/api/admin/uploads/cv | 204 | Cuerpo vacío; cabeceras indicadas debajo | `78c63827-f872-4ada-818f-3026a5962836` |
| 21:17:10.383 | OPTIONS | https://api.armandomora.com.co/api/admin/uploads/project-image | 204 | Cuerpo vacío; cabeceras indicadas debajo | `9ab3f42a-3164-4ee2-b856-61d497c33047` |

En ambas respuestas: `Access-Control-Allow-Origin: https://armandomora.com.co`, `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`, `Access-Control-Allow-Headers: content-type`. No se observó `Access-Control-Expose-Headers`. El request ID puede copiarse desde Network; no debe suponerse que el JavaScript del frontend pueda leerlo entre orígenes sin exponer esa cabecera.

Este resultado solo confirma ese preflight. El navegador no necesariamente hace preflight para todo FormData. No se verificaron cookies válidas, multipart real, límites del proxy, middleware de escritura ni respuesta del proveedor.

## 3. Incidencias, evidencia y clasificación causal

| ID | Incidencia | Evidencia actual | Causa demostrada | Clasificación |
| --- | --- | --- | --- | --- |
| I1 | Abrir Nuevo proyecto falla | GET a `/admin/projects/new`, 500 de 21 bytes a las 21:17:05.266 UTC | No determinada: falta excepción del proceso que atendió ese GET | **Pendiente**; distinguir código de despliegue |
| I2 | Otras rutas frontend fallan | 11 GET adicionales con 500, incluyendo `robots.txt`, listados, detalle y edición | No determinada; compartir respuesta no demuestra una única excepción | **Pendiente**; distinguir código, despliegue e integración SSR/API |
| I3 | Subida de imágenes reportada como fallida | Reporte del usuario; código revisado; OPTIONS 204. No hay respuesta ni traza de un POST fallido | No determinada; ni siquiera se puede fijar la fase de fallo | **Pendiente**; sesión/origen, código, proxy/despliegue, proveedor o guardado posterior |
| I4 | Subida de CV reportada como fallida | Reporte del usuario; código revisado; OPTIONS 204; lectura administrativa sin sesión 401 | No determinada; Cloudinary y persistencia del CV son pasos diferentes | **Pendiente**; código, despliegue o integración |

**Abrir, subir y guardar son operaciones distintas.** En `frontend/src/app/admin/projects/new/page.tsx:3` el GET resuelve `searchParams` y entrega el componente cliente. El callback de `NewProjectPageClient.tsx:17` llama a `projectService.createProject` únicamente al enviar el formulario; `frontend/src/services/projectService.ts:54` hace POST JSON a `https://api.armandomora.com.co/api/admin/projects`, atendido en `backend/src/routes/project.routes.js:34`. La imagen usa antes otro POST multipart, `/api/admin/uploads/project-image`. No se ejecutó ninguno de esos POST.

Por tanto, el GET 500 antes de abrir el formulario **no demuestra** un error del controlador de alta, de Cloudinary ni de una escritura en MongoDB. `frontend/src/app/robots.ts:4` tampoco consulta esos servicios. Algunas páginas públicas sí dependen de fetch SSR a la API (`frontend/src/lib/publicContent.ts:28`), pero eso no basta para explicar todos los 500.

`frontend/server.js:16` captura errores del manejador, registra `Error al procesar la solicitud:` y responde `Internal Server Error`. La coincidencia textual es compatible con ese código, pero Next u otra capa pueden emitir el mismo cuerpo: **no identifica por sí sola el proceso emisor ni la excepción**. Tampoco se demostró que el hosting use ese archivo.

## 4. Circuito compartido de archivos

Esta sección describe el código local del commit registrado; no certifica que sea el código efectivo del proceso remoto.

| Fase | Evidencia en código / resultado | Qué falta para atribuir el fallo |
| --- | --- | --- |
| Sesión | `uploadService.ts:27` usa `credentials: include`; ante 401 renueva una vez y reintenta. `api.ts:14` centraliza refresh. `protect.js:7` exige cookie, usuario activo y sesión vigente; `upload.routes.js:24` exige rol admin | Estado real de la sesión y secuencia upload/refresh del caso fallido. El 401 anónimo de la tabla es esperado |
| Cookies | `backend/src/config/cookies.js:35` configura HttpOnly, Secure condicionado al entorno, SameSite configurado o lax, path `/`, sin Domain | Atributos efectivos y si el navegador envió cookie, únicamente como sí/no, nunca su valor |
| Origen | CORS permite el origen configurado y credenciales. `requireTrustedOrigin.js:5` exige coincidencia exacta para escrituras; GET/HEAD/OPTIONS quedan exentos | Origin del POST fallido y valor público efectivo de FRONTEND_URL; un OPTIONS 204 no prueba este control en el POST |
| Multipart | Cliente crea FormData con campo `file`, sin forzar Content-Type. Servidor usa `.single("file")` y memoria | Nombre del campo, boundary presente y tamaño real recibido por proxy/API, sin compartir el contenido del archivo |
| Límites | Multer: imagen 5242880 bytes (5 MiB), PDF 10485760 (10 MiB). Límite compartido de uploads: 10 intentos/15 minutos, incluidos exitosos; límite general: 300/15 minutos | 413/429 reales, clave/IP efectiva del limitador, TRUST_PROXY y límites de cuerpo/tiempo del alojamiento |
| Parsers | `app.js:39` limita JSON y urlencoded a 500kb | Ese límite no es el límite multipart de Multer; no atribuirle automáticamente el rechazo de archivos de más de 500kb |
| Validación | MIME declarado, extensiones peligrosas bloqueadas y `file-type` importado dinámicamente para comprobar firma. JPEG/PNG/WebP/GIF permitidos; PDF requiere `application/pdf`; SVG no permitido | Tipo/tamaño del archivo fallido, MIME declarado/detectado y log `[security:upload_rejected]`, o excepción al cargar dependencia |
| Cloudinary | `upload.service.js:43` envía stream desde buffer, `overwrite:false`, recurso `image` o `raw`; captura error y devuelve mensaje genérico de subida | Error sanitizado del proveedor, código/estado, fase y correlación; no se probó autenticidad de credenciales, cuota ni red saliente del backend |
| Guardado de imagen | El POST de imagen devuelve referencia; el formulario debe incorporarla al POST/PATCH posterior del contenido | Si falló upload, envío del formulario, persistencia de referencia, vista previa o entrega final del archivo |
| Persistencia de CV | `upload.controller.js:103`: sube PDF, luego `findOneAndUpdate` del singleton con validadores/upsert; solo después limpia el anterior y responde 201 | Error del upload frente a error de MongoDB. Ping/lectura no prueban permisos de upsert ni de actualización |
| Limpieza de CV | Ante fallo de guardado intenta limpiar el recurso nuevo si no está referenciado. Tras guardar intenta limpiar el anterior. `assetReferences.service.js:23` evita borrar referencias existentes y registra fallo sin propagarlo | Si hubo resultado incierto de escritura o limpieza fallida; no reintentar, borrar o reemplazar a ciegas |

Los endpoints siguientes comparten sesión, rol, limitador, multipart y validación antes del controlador:

| POST bajo `/api/admin/uploads` | Tipo / límite | Recurso / persistencia |
| --- | --- | --- |
| `/project-image` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/cyber-evidence` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/certification-badge` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/education-logo` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/blog-cover` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/author-avatar` | Imagen, 5 MiB | Cloudinary `image`; guardar referencia después |
| `/cyber-report` | PDF, 10 MiB | Cloudinary `raw`; guardar referencia después |
| `/cv` | PDF, 10 MiB | Cloudinary `raw` y actualización del CV en el mismo controlador |

`backend/src/config/cloudinary.js:11` comprueba presencia de variables en modo producción, no su validez. No se extrapola de API disponible a «Cloudinary configurado correctamente»: faltan runtime/release efectivos y respuesta real del proveedor.

## 5. Defectos conocidos, separados de las causas de I1–I4

Se confirmaron por inspección; las pruebas aisladas descritas en la auditoría anterior **no se volvieron a ejecutar** en este sprint. No son reproducciones autenticadas de producción.

| Hallazgo | Clasificación | Evidencia y alcance | Corrección propuesta, sin implementar |
| --- | --- | --- | --- |
| D1: PDF raw sin extensión en public ID | Código, contrato con integración | `upload.service.js:7,17,45,79` elimina extensión y usa el mismo generador para imágenes/PDF. Afecta CV e informes. No prueba rechazo del POST ni explica imágenes | Añadir `.pdf` al identificador único de PDF raw; conservar convención de imágenes; comprobar carga, descarga y borrado en entorno de prueba |
| D2: guardar durante una subida pendiente | Código | `FileUploadField.tsx:73,91` mantiene loading interno; no comunica pendientes al padre. `ProjectForm.tsx:378` solo desactiva por loading del guardado. Puede enviarse referencia anterior/vacía | Coordinar pendientes con los formularios y bloquear POST/PATCH hasta resolver; conservar valor anterior y permitir reintento si falla |
| D3: error al leer CV silenciado | Código | `admin/cv/page.tsx:27,33,112`: catch vacío; error de consulta deja current nulo y puede parecer ausencia de CV | Estados explícitos de carga, error, vacío y disponible; mostrar reintento; no sustituir un archivo por error de lectura |
| D4: pérdida de traza/correlación | Código, observabilidad | `globalErrorHandler.js:55` copia Error con spread sin stack no enumerable. `uploadLogger.js:6` no admite request ID; llamadas de `upload.service.js:72,87` no lo pasan. Hay request IDs HTTP y logs de validación, pero no correlación completa de excepciones | Registrar excepción original sanitizada con request ID, fase, ruta y código/estado del proveedor; respuestas públicas sin traza ni secretos |
| D5: cobertura local insuficiente para aceptación remota | Código de verificación / proceso de despliegue | `with-production.mjs:10` usa next start; `verify-release.mjs:67` cubre login/dashboard, no altas/ediciones y uploads autenticados | Ampliar aceptación en alojamiento equivalente y dominio real; distinguir GET, upload y persistencia |

La documentación oficial indica que el public ID de un recurso `raw` debe incluir su extensión; el comportamiento inspeccionado en D1 contradice ese contrato. Se revalidó la referencia mediante búsqueda oficial, después de fallar su apertura directa. [Cloudinary: Public ID naming preferences](https://cloudinary.com/documentation/upload_parameters#public_id_naming_preferences). Esto no sustituye una respuesta real de Cloudinary ni demuestra la causa del incidente.

## 6. Entorno local, release y alojamiento

No se confirmó acceso autorizado y disponible a cPanel/SSH ni se recibieron registros del alojamiento. No se inspeccionó su configuración privada. La documentación del repositorio describe Passenger, pero no demuestra la configuración activa.

| Comprobación | Local observado en este sprint | Producción |
| --- | --- | --- |
| Runtime de terminal | Node `v24.15.0`, npm `11.12.1`, PowerShell/Windows | Pendiente: medir en entorno y proceso efectivos del panel, no solo en una shell genérica |
| Requisitos package.json | Ambas apps: Node `>=24.15.0 <25`, npm `>=11 <12` | Compatibilidad efectiva pendiente |
| Dependencias frontend | package.json, lock y package.json instalados coinciden en Next `16.3.6`, React/React DOM `19.2.4` | No se leyeron paquetes instalados remotos |
| Dependencias backend | Instalado/lock: file-type `22.0.1`, cloudinary `2.10.0`, multer `2.4.0`, mongoose `9.10.2` | Pendiente, especialmente import dinámico de file-type y módulos del sistema operativo |
| Startup | Repositorio: frontend `server.js` para Passenger; npm start usa `next start`. Backend npm start usa `src/server.js` | Raíz, startup file, modo, ejecutable y release activos desconocidos |
| Build local existente | BUILD_ID `jDCTCsLmT1RdP4zVN29xb`; mtime `2026-09-29T20:16:57.733Z` | BUILD_ID/manifest remotos no obtenidos |
| Archivos locales del manifest | Existen entradas/archivos para proyectos público/detalle/admin/alta/edición, robots, sitemap, RSS y OG | Existencia e integridad remotas pendientes |
| Permisos | Se pudieron leer los archivos locales muestreados | Lectura/recorrido de build y escritura de cachés por usuario efectivo pendientes; no se hicieron pruebas de escritura |
| Ejecución local | No se arrancó ni reinició la aplicación, evitando escrituras de caché y cambios del objeto bajo diagnóstico | GET remotos revalidados en sección 2 |

La inspección de versiones instaladas leyó metadatos de paquetes, sin cargar las aplicaciones ni instalar dependencias. No certifica todo el árbol de dependencias ni binarios nativos.

Comparación de ejecución disponible: la **auditoría previa** registró 200 locales con `node frontend/server.js` y el build existente para `/`, los cinco listados, `/admin/projects/new`, `/admin/blog/new`, robots, sitemap, RSS y OG; detalle `/projects/missing` respondió 404. En este sprint el contraste remoto vuelve a mostrar 500 en las rutas indicadas. Es evidencia histórica local, no una nueva ejecución ni una reproducción de Passenger. La diferencia orienta a inspeccionar runtime/release/configuración y excepciones; no demuestra una causa específica.

La auditoría también registró coincidencia SHA-256 de **12 chunks de la portada**. No se volvió a comprobar esa comparación aquí, y no certifica `.next/server`, otros chunks, dependencias, permisos, configuración, cachés ni el release completo remoto. No se afirma igualdad integral de artefactos.

Huellas locales para futura comparación de solo lectura (son una muestra, no un manifest completo):

| Archivo | SHA-256 |
| --- | --- |
| `frontend/package-lock.json` | `52c6ce2882124273862934f3a3f00596a2845c0dfe2b926b08f463da39b3bf3b` |
| `backend/package-lock.json` | `784c368e440576fca9077f2afe8a462ad1b4e398db13caf0e16ffead807b2647` |
| `frontend/server.js` | `82bd7497694a77d8b7874b83dc1854b33b448785888816387a6621521026d964` |
| `frontend/.next/BUILD_ID` | `eca2d77937f595c19b35f6c6ab2de99ad5c5ad30153d41163ff683dd1e6c83bb` |
| `frontend/.next/server/app-paths-manifest.json` | `08bcedfa75a50575b7b09b81191ec8ef0bff87962969ff87f071fbbae2c82146` |
| `frontend/.next/server/app/admin/projects/new/page.js` | `fb0d22d9678ef66c34c40d55c0a557e0a8749915916ac682dc528093f8185d2c` |
| `frontend/.next/server/app/robots.txt/route.js` | `0b07034310d78d0a74dbb731ac65b1f421f70926382eff297481eca58b0cf9c0` |

## 7. Evidencia faltante y obtención sin secretos ni cambios

Se solicitó temprano la evidencia de frontend/backend y los datos de una imagen y un PDF fallidos; el usuario respondió que no los tiene. No se solicitó reproducir subidas en producción, porque un POST de CV puede reemplazar el archivo vigente incluso si la interfaz termina mostrando un error.

| Evidencia pendiente | Obtención de solo lectura | Decisión que permite |
| --- | --- | --- |
| Traza del GET de Nuevo proyecto | Administrador/proveedor: consultar logs existentes del frontend y proxy alrededor de **2026-09-29 21:17:05 UTC / 16:17:05 Colombia**, ampliando ±2 minutos por diferencias de reloj. Buscar ruta y excepción completa; prefijo del server.js y errores propios de Next. Conservar código, stack sanitizado y release | Separar error de carga de módulo/build, permisos, runtime, configuración o ejecución de código |
| Traza de las demás rutas | Correlacionar cada hora de la tabla, incluyendo robots a 21:17:06.700 UTC. No asumir que comparten excepción | Determinar si I1 e I2 tienen causa común o varias |
| Una imagen y un PDF fallidos | Si Network aún conserva las peticiones, copiar solo fecha/zona, método, URL sin parámetros sensibles, estado, cuerpo sanitizado, duración y X-Request-Id; extensión, bytes y MIME del archivo. No reenviar solicitudes | Identificar si falló sesión, origen, recepción, validación, proveedor, persistencia o descarga |
| Logs backend/proxy de esos uploads | Consultar registros históricos por request ID y hora; buscar `[upload:...]`, `[security:upload_rejected]`, errores MongoDB y `[asset cleanup]`. Si no hay entrada API, consultar proxy/WAF y su retención | Distinguir rechazo anterior a la app de fallo dentro del backend; ausencia de log sola no prueba que no llegó |
| Runtime y configuración efectiva | Desde el entorno de cada app activado por el panel: leer `node --version`, `npm --version`, `node -p "process.execPath"`; registrar raíz, startup file, modo y ruta/release del proceso. Contrastar con metadatos del proceso, sin volcar sus argumentos ni su entorno completo | Confirmar qué ejecuta realmente cada aplicación |
| Paquetes efectivos | En raíz frontend: `npm ls next react react-dom --depth=0`; backend: `npm ls file-type cloudinary multer mongoose --depth=0`. Solo lectura; no npm ci/install/rebuild | Comparar versiones y paquetes faltantes con lockfiles |
| Integridad de release | Leer BUILD_ID, manifest, tamaños y hashes de startup, configuración no secreta, lockfiles, public, `.next/server` y `.next/static`; inventario completo de artefactos esperados y rutas reales de la app | Detectar mezcla o ausencia de archivos. Unos hashes coincidentes no prueban equivalencia total |
| Permisos del hosting | Consultar propietario/grupo/modos/ACL y permisos de recorrido/lectura con el usuario efectivo; permisos configurados de cachés y temporales del proxy. No touch/chmod/chown ni generar archivos de prueba | Evaluar error de acceso si coincide con una traza. Un permiso aparente no sustituye la excepción |
| Configuración de integración | Informar presencia/ausencia de variables privadas sin valores; solo URLs públicas, modo y flags relevantes. Revisar en panel registros/cuota/políticas existentes de Cloudinary sin cambiarlos | Evaluar hipótesis respaldadas por el error real; no validar credenciales por su mera presencia |

No compartir `.env`, salidas de `env`/`printenv`, cookies, Authorization, firmas, credenciales, cadenas de conexión, contenido del CV ni HAR/cURL sin sanitizar. Sustituir datos sensibles de mensajes y rutas por marcadores conservando nombre/código del error, fase, stack útil, fecha y request ID. Si los registros rotaron o no existen, anotar esa ausencia y retención: la captura controlada/instrumentación adicional tendrá que planearse para un entorno de prueba y un alcance posterior autorizado, no ejecutarse en este sprint.

Guía para interpretar la evidencia futura, **no resultados observados de uploads**:

- 401/403: distinguir sesión, rol y origen según el mensaje y la fase; los códigos solos no identifican la causa.
- 400/413: revisar multipart, campo, MIME/firma y límite efectivo. Un 413 puede provenir del proxy o Multer; identificar quién respondió.
- 429: revisar limitador concreto, ventana y proxy/IP antes de cambiar límites.
- 5xx con entrada `[upload:...]`: revisar causa original de Cloudinary/red; el mensaje público genérico no basta.
- Cloudinary exitoso y error en `findOneAndUpdate`: investigar persistencia del CV y resultado incierto antes de reintentar.
- Upload 201 pero imagen ausente tras guardar: examinar referencia enviada y D2. Upload 201 y descarga PDF fallida: investigar entrega del recurso por separado.

## 8. Correcciones propuestas y aceptación de próximos sprints

**Propuestas únicamente.** Para I1/I2, corregir el componente que identifique la traza: archivo/dependencia/release/permisos/runtime si se demuestra fallo de despliegue; ejecución o configuración de la ruta si lo demuestra el error. No seleccionar un cambio de Node, Passenger, variable o caché por descarte. Para I3/I4, actuar sobre la fase demostrada; mantener separados los arreglos D1–D4 y las causas de la incidencia. D5 requiere ampliar la aceptación del release.

| Área / siguiente trabajo | Criterio de aceptación |
| --- | --- |
| Cierre causal de sprint 0 | I1–I4 tienen evidencia correlacionada, fase identificada y explicación que concuerda con el release efectivo. Si no existe evidencia, conservar explícitamente «pendiente», sin declarar resuelto el diagnóstico |
| Reparación de rutas | Las 23 rutas de la matriz responden según su función: páginas/recursos válidos 200; detalle inexistente 404; edición comprobada con ID de prueba válido. Apertura directa y navegación desde UI; Nuevo proyecto abre sin POST de creación |
| Recursos públicos | Robots, sitemap y RSS tienen formato/contenido esperado y OG responde con imagen válida; canonical y URLs HTTPS correctos. La prueba local no reemplaza la prueba del dominio |
| Sesión y origen | En entorno de prueba equivalente: login, lectura privada, recarga, refresh y logout correctos; sin sesión 401 y sin rol/origen adecuado rechazo esperado. Registrar atributos de cookies, nunca valores |
| Imágenes | Cubrir las seis clases: archivo permitido → upload 201 → vista previa → guardado de referencia → recarga y lectura pública. Con subida demorada no sale POST/PATCH de guardado; ante fallo se conserva referencia anterior y hay reintento |
| PDF/CV | En datos de prueba: CV e informe raw con `.pdf`, descarga correcta, referencia persistida tras recarga. Reemplazo conserva integridad; fallos simulados de proveedor, guardado y resultado incierto no destruyen el CV referenciado |
| Validación y límites | Casos permitidos, tipo/firma inválidos, campo incorrecto, exceso de tamaño y limitador producen rechazo explícito sin modificar referencia guardada; diferenciar rechazo del proxy y del backend |
| Observabilidad | Error de proveedor, validación, persistencia y frontend correlacionable con petición, hora y release; stack interno sanitizado, sin secretos ni traza pública |
| Release | Inventario completo y runtime/dependencias/raíz/startup verificados en alojamiento equivalente; registrar cobertura real y excepciones. Aceptación remota posterior con alcance autorizado para escrituras, sin reutilizar este sprint como permiso |

No se realizaron suites, build ni tests que arranquen servicios en este sprint. Los resultados de tests citados por la auditoría anterior siguen siendo antecedentes; no se presentan como ejecuciones actuales. La documentación queda lista para continuar el diagnóstico cuando haya registros y acceso de lectura, **sin implementar correcciones ni avanzar al sprint 1**.

## 9. Verificación final de preservación

HEAD permaneció en el commit registrado. Las nueve huellas de las secciones 1 y 6 se comprobaron de nuevo y permanecen iguales. La matriz contiene 35 filas HTTP, con los 12 errores 500 del frontend. Staging sigue sin diferencias y `git diff --quiet` devuelve 0.

Hay una discrepancia que se conserva explícitamente: al finalizar, `git status --porcelain=v1` muestra ` M frontend/.env.example`, marca no presente en la lectura inicial. Sin imprimir sus valores, se comparó el archivo con HEAD: sus bytes no son idénticos, pero **el contenido coincide al normalizar CRLF a LF**; mtime observado `2026-09-29T21:16:47.047Z`. `git diff --name-status` no muestra diferencia de contenido. No se escribió ese archivo ni se normalizaron sus saltos de línea durante este trabajo; no se atribuye el cambio a una persona o proceso sin evidencia. Se dejó tal como estaba al detectarlo.

Estado final observado: esa marca en `.env.example`, los dos archivos sin seguimiento preexistentes y este nuevo informe sin seguimiento. No se hizo commit, stage, restore ni limpieza.

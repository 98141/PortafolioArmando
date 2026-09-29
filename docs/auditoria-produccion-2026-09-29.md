# Auditoría de producción: páginas, proyectos, imágenes y CV

Fecha: 29 de septiembre de 2026. Consultas de producción registradas entre las 20:44 y las 20:52 UTC (15:44–15:52 en Colombia), además de las comprobaciones locales posteriores.

Repositorio revisado: `c1a77f3` (`Todo listo para produccion`). Sitio: <https://armandomora.com.co>. API: <https://api.armandomora.com.co/api>.

## Dictamen y límites

**El despliegue presenta una incidencia confirmada en la ejecución de rutas del frontend. También existen defectos de código confirmados en el manejo de archivos y errores. No está demostrada todavía la causa raíz del rechazo de las subidas reportadas.**

- El error de la captura de «Nuevo proyecto» corresponde a **GET `/admin/projects/new`**, antes de abrir el formulario. No demuestra un fallo del POST que guarda el proyecto en MongoDB.
- Cinco listados públicos, rutas de metadatos y una ruta administrativa de edición también devuelven 500. La portada y varias páginas administrativas sí entregan HTML.
- La API pública responde, el endpoint de preparación confirma su ping a MongoDB y los listados consultados responden 200. Eso no verifica permisos de escritura, credenciales de Cloudinary ni conectividad desde el proceso frontend del alojamiento.
- Las rutas comparadas funcionan con el build local existente y `node frontend/server.js`, bajo Node 24.15.0. La diferencia con producción exige comprobar el proceso, los archivos y la configuración reales del alojamiento. **No permite afirmar que Passenger, una versión de Node o una variable concreta sean la causa.**
- Se verificaron cuatro defectos de código: identificadores de PDF sin extensión, guardado durante una subida pendiente, errores de lectura del CV silenciados y pérdida de información diagnóstica en logs.
- No se modificó código, configuración, dependencias, credenciales ni datos de producción. Se añadió únicamente este informe. La auditoría no ejecutó publicaciones, altas de proyectos, reemplazos del CV ni subidas reales a Cloudinary.

La auditoría cubre el circuito compartido de las ocho clases de subida, el flujo de proyectos, la gestión del CV, la disponibilidad pública, los controles de acceso relevantes, la observabilidad y las comprobaciones de release. La operación autenticada y la configuración interna de cPanel/Cloudinary siguen pendientes: no había una sesión de esos servicios disponible en el navegador conectado. No se certifica la operación completa de producción sin esa evidencia.

## Evidencia HTTP de producción

Consultas directas de lectura, sin cookies administrativas. «200 en admin» significa entrega de la pantalla con su control de sesión; no acceso autorizado a datos privados.

| Recurso | Estado observado | Interpretación |
| --- | --- | --- |
| `/` | 200 | Portada accesible |
| `/about`, `/contact` | 200 | Páginas públicas accesibles |
| `/projects`, `/cybersecurity`, `/certifications`, `/education`, `/blog` | 500 | Listados públicos no disponibles |
| `/projects/audit-nonexistent` | 500 | Tampoco se resuelve correctamente el detalle consultado |
| `/admin/projects` | 200 | Se entrega la pantalla administrativa |
| `/admin/projects/new` | 500 | El formulario de creación no llega a abrir |
| `/admin/projects/507f1f77bcf86cd799439011/edit` | 500 | Falla la entrega de la ruta de edición; ID usado solo para consultar la pantalla |
| `/admin/cv`, `/admin/settings`, `/admin/login` | 200 | Pantallas accesibles; operación interna no verificada con sesión |
| `/admin/blog/new`, `/admin/certifications/new`, `/admin/education/new`, `/admin/cyber-labs/new` | 200 | El fallo no afecta por igual a todas las pantallas de alta |
| `/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/og` | 500 | Afecta rastreo, feed y recurso social por defecto |
| API `/health` | 200 | Proceso vivo |
| API `/ready` | 200, `data.ready=true` | Ping a MongoDB satisfactorio |
| API `/projects?limit=12&page=1`, `/blog?limit=12&page=1` | 200 | Listas vacías y paginación válidas; no demuestra ausencia de borradores privados |
| API `/cyber-labs?limit=12`, `/certifications?limit=12`, `/education?limit=12` | 200 | Lecturas públicas disponibles |
| API `/auth/me`, `/admin/site-settings`, `/admin/projects` sin sesión | 401 | Rechazo esperado |
| OPTIONS API `/admin/uploads/cv` con origen del sitio | 204 | Permite el origen exacto y credenciales; no valida un POST autenticado |

Las respuestas 500 inspeccionadas de las páginas principales contienen `Internal Server Error`, con tipo `text/plain` y 21 bytes. El cuerpo por sí solo no identifica qué componente produjo la excepción.

Referencias de correlación disponibles en los logs de la API:

- `/health`: `1e3ff3ff-5321-43a8-b643-6c287796e64d`.
- `/ready`: `287a2d6e-5026-466d-98e0-16e0dfd7b3b6`.
- `/cyber-labs?limit=12`: `d14cd7e8-6a09-4a98-a793-23b7e459da41`.
- `/certifications?limit=12`: `d75dd3bc-09a7-4892-a174-9a27738831a8`.
- `/education?limit=12`: `578a322b-2421-43b6-b728-ff8de4454af3`.

## Comparación con el artefacto local

Se arrancó el `frontend/server.js` existente, con el build `.next` existente, en puertos locales temporales; los procesos se detuvieron al finalizar. No se reconstruyó el frontend para alterar el objeto de comparación.

| Ruta | Producción | Servidor local personalizado |
| --- | --- | --- |
| `/` | 200 | 200 |
| `/projects`, `/cybersecurity`, `/blog` | 500 | 200 |
| `/certifications`, `/education` | 500 | 200 |
| `/admin/projects/new` | 500 | 200 |
| `/admin/blog/new` | 200 | 200 |
| `/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/og` | 500 | 200 |

El detalle inexistente `/projects/missing` devolvió 404 localmente. Los 12 chunks JavaScript referenciados en el HTML de la portada desplegada coincidieron, mediante SHA-256, con sus archivos locales. Esto descarta diferencias en **esos 12 archivos**, pero no verifica `.next/server`, dependencias instaladas, permisos, variables, procesos activos ni todo el release remoto. Tampoco certifica la antigüedad de datos servidos desde caché.

En una comprobación adicional, el sandbox local bloqueó la conexión a la API con `connect EACCES` y produjo 500 locales en certificaciones y educación. Se repitió con acceso de red autorizado: ambas devolvieron 200. Ese bloqueo local no se atribuye al alojamiento.

## Hallazgos y correcciones propuestas — sin implementar

### A1 — P1: rutas del frontend y recursos SEO fallan en producción

**Estado:** fallo comprobado; causa raíz pendiente del error interno del servidor.

La indisponibilidad afecta navegación, creación/edición de proyectos y recursos para buscadores. `frontend/src/app/admin/projects/new/page.tsx:3` solo resuelve `searchParams` y entrega un componente cliente; abrir esa ruta no llama al controlador de creación ni sube archivos. `frontend/src/app/robots.ts` tampoco consulta MongoDB ni Cloudinary. Por ello no corresponde explicar todos estos 500 como un problema de subida o de escritura en la base de datos.

Revisar el log del frontend asociado a una petición fallida, el startup file real, las versiones efectivas de Node/Next y la integridad de `.next/server`. `frontend/server.js:16` registra las excepciones que llegan a su manejador con el prefijo `Error al procesar la solicitud:`; Next también puede emitir su propio error. Conservar la traza completa, no solamente la línea HTTP 500.

**Criterio de cierre:** las rutas anteriores responden correctamente en el dominio desplegado, incluyendo navegación directa y navegación desde la interfaz; un detalle inexistente responde 404. Robots, sitemap, RSS y OG responden con su formato esperado. La prueba local no sustituye este cierre.

### A2 — P2: los PDF de tipo `raw` pierden `.pdf` en su identificador

**Estado:** defecto de código confirmado por inspección y prueba aislada del adaptador, sin acceso a Cloudinary real.

Ubicación: `backend/src/services/upload.service.js:7`, `:17`, `:45`, `:79`.

`sanitizePublicIdBase` elimina la extensión. `buildPublicId` añade un UUID y el resultado se utiliza tanto para imágenes como para PDF. Los PDF se envían con `resource_type: "raw"`, pero el identificador enviado no termina en `.pdf`.

La prueba con `cloudinary.uploader.upload_stream` simulado capturó:

```json
{
  "resource_type": "raw",
  "public_id": "cv-armando-3d6f2412-42cb-4b8a-9650-ba209be261dc",
  "hasPdfExtension": false
}
```

Cloudinary documenta que los identificadores `raw` deben incluir la extensión original. Este contrato es distinto del de imágenes. [Documentación oficial de parámetros de subida](https://cloudinary.com/documentation/upload_parameters#public_id_naming_preferences).

**Alcance:** CV e informes PDF de laboratorios; las imágenes usan otro tipo de recurso. **No se ha probado que este defecto cause el rechazo actual del POST.** La prueba demuestra las opciones enviadas, no la respuesta real del proveedor ni la descarga final.

**Corrección propuesta:** conservar el UUID y añadir `.pdf` al identificador de los PDF `raw`; mantener la convención actual de imágenes. Añadir una prueba del contrato y comprobar carga, URL, descarga y borrado de un PDF de prueba. No renombrar ni borrar archivos existentes sin inventariar previamente sus referencias.

### A3 — P2: se puede guardar el proyecto antes de terminar la subida

**Estado:** confirmado por inspección y ejecución aislada de los componentes con hooks y servicio de subida simulados.

Ubicación: `frontend/src/components/admin/uploads/FileUploadField.tsx:73`, `:91`; `frontend/src/components/admin/projects/ProjectForm.tsx:57`, `:250`, `:378`.

El estado `loading` de la subida es interno al campo. El padre no lo recibe y su botón de guardar solo depende del guardado del proyecto. Es posible enviar el formulario mientras la promesa de subida sigue pendiente.

Resultado de la prueba:

```json
{
  "submittedWhileUploadPending": 1,
  "submittedImage": "",
  "submitDisabled": false,
  "formImageSetAfterUpload": true,
  "previouslySubmittedImageStillEmpty": true
}
```

No se guardó nada en una base real: se registró el payload entregado al callback del formulario. La prueba muestra que puede salir sin la nueva referencia. Si el guardado real completa y navega fuera de la página antes de recibirla, esa imagen no queda vinculada al proyecto.

**Corrección propuesta:** comunicar las subidas pendientes al formulario y bloquear la entrega del payload hasta que terminen; aplicar la coordinación a todos los formularios que usen el campo compartido. Tratar los archivos temporales sin borrar un recurso todavía referenciado.

**Criterio de cierre:** con una subida demorada, no sale el POST/PATCH de guardado; al terminar se guarda la referencia nueva. Ante fallo se conserva la referencia anterior y se puede reintentar.

### A4 — P2: la pantalla del CV silencia los errores al cargar su estado

**Estado:** confirmado en código; no se reprodujo con una sesión de producción.

Ubicación: `frontend/src/app/admin/cv/page.tsx:27`, `:33`, `:112`.

La consulta inicial usa `.catch(() => {})`; después desactiva `loadingInit`. Si falla, `current` permanece nulo y se muestra la interfaz para cargar un CV, sin explicar que no fue posible consultar el documento actual. Un error de lectura se presenta como ausencia de archivo.

**Corrección propuesta:** distinguir «cargando», «error de lectura», «sin CV» y «CV disponible»; mostrar error y reintento. No afirmar que no hay CV cuando la lectura falló.

**Criterio de cierre:** al simular 500 o interrupción de red en ajustes, se muestra el error y el reintento recupera el estado existente. El error de lectura no borra ni sustituye el CV.

### A5 — P2: los logs pierden la traza y la correlación del error

**Estado:** confirmado mediante prueba aislada del manejador de errores de producción.

Ubicación: `backend/src/middlewares/globalErrorHandler.js:39`, `:55`; `backend/src/utils/uploadLogger.js:6`; `backend/src/services/upload.service.js:72`, `:87`.

El manejador clona el error con `{ ...err }` y copia `message`/`name`, pero `stack` no es enumerable en un `Error` ordinario. La prueba registró `hasStack: false` y `hasRequestId: false`. El logger específico de Cloudinary conserva el mensaje, pero los llamadores no pasan el identificador de petición y su lista de metadatos tampoco lo incluye.

Hay logs HTTP con request ID y logs de rechazo de validación; la deficiencia afecta la correlación con la excepción interna y la causa del proveedor, no significa que no exista ningún registro.

**Corrección propuesta:** conservar la excepción original en el log interno, incluir request ID, ruta, fase y estado/código del proveedor cuando exista. Mantener respuestas públicas sin secretos ni stack. No registrar cookies, buffers, contraseñas o variables privadas.

**Criterio de cierre:** un fallo simulado de Cloudinary y otro de persistencia pueden seguirse desde el request ID hasta la traza interna sin revelar información sensible al navegador.

### A6 — P1 de proceso: falta evidencia de aceptación en el alojamiento real

**Estado:** límite confirmado de los controles actuales; no se afirma que el usuario haya omitido una prueba concreta.

Ubicación: `frontend/scripts/with-production.mjs:10`, `frontend/scripts/verify-release.mjs:39`, `:67`; `.github/workflows/quality.yml`.

El runner de release arranca `next start`. El CI no ejecuta Passenger ni una sesión real de subida con Cloudinary. El smoke sí revisa las páginas públicas y recursos SEO, pero en administración se limita a login/dashboard; no abre «Nuevo proyecto», las rutas de edición ni prueba guardados autenticados. Los tests de archivos usan servicios simulados.

La documentación de despliegue ya exige comprobaciones posteriores en el hosting. La situación observada muestra por qué deben ser un requisito de aceptación, no darse por cumplidas por un build o una suite local verde.

**Corrección propuesta:** ampliar la matriz del smoke con las rutas administrativas dinámicas, ejecutarla también contra el dominio publicado y separar explícitamente el resultado local del resultado en alojamiento. Añadir un recorrido autenticado de aceptación en un entorno de prueba equivalente y verificar una operación controlada al publicar.

## Circuito de subida revisado

Las ocho rutas comparten autenticación de administrador, límite de frecuencia, recepción multipart y validación del contenido antes de llamar al servicio de Cloudinary:

| Endpoint, bajo `/api/admin/uploads` | Contenido | Límite en código | Servicio |
| --- | --- | --- | --- |
| `/project-image` | Imagen | 5 MiB | Cloudinary `image` |
| `/cyber-evidence` | Imagen | 5 MiB | Cloudinary `image` |
| `/certification-badge` | Imagen | 5 MiB | Cloudinary `image` |
| `/education-logo` | Imagen | 5 MiB | Cloudinary `image` |
| `/blog-cover` | Imagen | 5 MiB | Cloudinary `image` |
| `/author-avatar` | Imagen | 5 MiB | Cloudinary `image` |
| `/cyber-report` | PDF | 10 MiB | Cloudinary `raw` |
| `/cv` | PDF y actualización de ajustes | 10 MiB | Cloudinary `raw` + MongoDB |

Aspectos comprobados que no deben cambiarse sin motivo:

- El cliente envía `FormData` con campo `file` y credenciales. No fuerza `Content-Type`, por lo que permite al navegador generar el boundary multipart.
- Ante 401 intenta renovar la sesión una vez; las pruebas existentes verifican que no entre en bucle.
- El backend valida MIME y firma del contenido; acepta JPEG, PNG, WebP y GIF para imágenes. La ruta PDF exige `application/pdf`. SVG no está admitido.
- Las pruebas de PNG y PDF válidos pasan; un ejecutable renombrado y una imagen enviada a la ruta PDF se rechazan. Las sondas de PNG truncado ejecutadas aquí devolvieron 400; no se registran como defecto.
- El CV nuevo se persiste antes de limpiar el anterior. Las pruebas cubren fallo de subida, fallo de persistencia, escritura de resultado incierto y fallo de limpieza.
- Se impide borrar por el endpoint genérico un archivo referenciado, incluso por contenido con borrado lógico.
- El límite compartido de subida es 10 peticiones por 15 minutos según la clave del limitador. Su comportamiento real depende también del proxy y debe comprobarse con la configuración efectiva del alojamiento. No se cambió `TRUST_PROXY`.
- El OPTIONS real al endpoint de CV permite `https://armandomora.com.co` y credenciales. Esto no demuestra que la sesión del navegador del usuario sea válida ni que el cuerpo de una subida atraviese el proxy correctamente.

## Pruebas realizadas y resultado

| Comprobación | Resultado | Qué no demuestra |
| --- | --- | --- |
| Backend: smoke de entorno/canonical | Pasó | Variables efectivas de cPanel |
| Backend: `verify:uploads` | 7/7 | Respuesta real de Cloudinary |
| Backend: suite de seguridad | 54/54 | Escrituras reales en MongoDB/Cloudinary |
| Frontend: suite de seguridad | 32/32 | Operación completa en navegador autenticado |
| Frontend: configuración de producción | 34/34 | Configuración actualmente instalada en hosting |
| Frontend: TypeScript | Sin errores | Compatibilidad con el loader del alojamiento |
| Frontend: ESLint | Sin errores ni advertencias | Ausencia de defectos funcionales |
| Opciones de PDF con uploader simulado | Reprodujo A2 | Motivo del fallo reportado de subida |
| Guardado durante subida pendiente | Reprodujo A3 | Persistencia real de ese proyecto |
| Captura del log de una excepción | Reprodujo A5 | Contenido de logs privados del hosting |
| HTTP público y comparación local | Incidencia A1 confirmada | Causa raíz interna |

No se realizó un nuevo build, instalación de paquetes, auditoría de vulnerabilidades del registro, prueba de carga, restauración de backups ni envío de correo. No se presentan como verificadas esas áreas.

## Evidencia pendiente para distinguir código de despliegue en las subidas

1. **Frontend:** traza del proceso que sirve `armandomora.com.co` al abrir `/admin/projects/new`, con fecha/hora. Incluir la excepción completa y el nombre/código del error.
2. **Una imagen y un PDF fallidos:** método, URL, estado HTTP, cuerpo de respuesta, duración aproximada y `X-Request-Id` desde Network. Indicar extensión, tamaño y en qué pantalla ocurrió. No compartir el contenido privado del CV ni un HAR sin limpiar.
3. **Backend:** log correlacionado con esas peticiones, incluyendo `[upload:...]` o `[security:upload_rejected]` si aparecen. Si la petición no figura en la API, revisar primero los registros del proxy/alojamiento para esa misma hora.
4. **Entorno activo de cada app en cPanel:** versión efectiva de Node/npm, raíz, startup file, modo y fecha/identificador del release. Comparar `npm ls next react` en frontend y `npm ls file-type cloudinary multer` en backend desde el entorno activado del panel. No imprimir `.env`, tokens, cookies o cadenas de conexión.
5. **Integridad y permisos:** confirmar que fuente, `.next/server`, `.next/static`, `public`, configuración y lockfiles pertenecen al mismo release, que las dependencias se instalaron para el sistema operativo del hosting y que el proceso puede escribir los cachés necesarios. Esto se verifica; no se presume que esté mal.
6. **Proveedor de archivos, cuando el error lo señale:** comprobar cuenta/entorno de Cloudinary, validez de sus credenciales, permisos y respuesta de entrega del PDF. No se ha observado evidencia que permita declarar agotamiento de cuota o credenciales incorrectas.

No compartir contraseñas, claves de Cloudinary, JWT, cookies de sesión ni `MONGO_URI`. Bastan los mensajes sanitizados y los metadatos anteriores.

## Orden de resolución propuesto

1. Preservar el error y los datos del release actual. Correlacionar una petición fallida del frontend y una de archivos para identificar sus causas por separado.
2. Resolver A1 según esa evidencia: corregir despliegue/configuración si la traza lo demuestra, o preparar el cambio de código correspondiente si la excepción lo exige. No cambiar versiones o sustituir el arranque a ciegas.
3. Corregir A2–A5 y añadir regresiones específicas. Verificar en el servicio compartido el efecto sobre las ocho clases de subida, no solo sobre CV.
4. Cerrar A6 con pruebas del artefacto definitivo en alojamiento equivalente y luego en el dominio publicado.

### Matriz mínima para aceptar la solución

- Portada, listados, detalle y 404 correctos; navegación normal y entrada directa.
- Apertura de altas y ediciones administrativas, especialmente proyectos.
- Login, lectura autenticada, renovación de sesión, logout y rechazo sin sesión.
- Imagen válida: subida, vista previa, guardado, recarga y visualización pública; cubrir el mapeo de cada clase de imagen.
- CV: subida, persistencia, descarga HTTP satisfactoria del PDF, recarga, reemplazo y conservación del anterior ante error.
- PDF de laboratorio: referencia conservada tras guardar y descarga satisfactoria.
- Guardado bloqueado mientras haya subida pendiente; mensaje y reintento ante error.
- Archivo no permitido o demasiado grande: rechazo explícito sin alterar la referencia guardada.
- Error de Cloudinary, error de base de datos y error del proxy diferenciables en los logs mediante request ID.
- `robots.txt`, sitemap, RSS y OG disponibles; canonical HTTPS correcto. Su disponibilidad es requisito previo a evaluar la indexación, no una garantía de posición en Google.

**Estado al terminar esta revisión:** incidencias documentadas y correcciones propuestas; código sin modificar. Causa raíz de los 500 remotos y de las subidas pendiente de las trazas privadas indicadas.

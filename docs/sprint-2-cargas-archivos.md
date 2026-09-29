# Sprint 2 — Cargas de imágenes, CV e informes PDF

Fecha: 2026-09-29. Repositorio en `main`, HEAD de partida `dac3482` (sprint 1 ya integrado). No se sobrescribió [sprint-2.md](sprint-2.md).

**Correcciones locales validadas; integración y aceptación en producción pendientes.**

Este sprint no resuelve los GET 500 del frontend. No demuestra la causa del rechazo de subidas en producción: no había un POST fallido, ni estado HTTP, ni request ID, ni traza del alojamiento. No se avanzó al sprint 3.

## Defectos corregidos

| Defecto | Evidencia de la corrección | Qué no demuestra |
| --- | --- | --- |
| Los PDF `raw` salían sin `.pdf` en el `public_id` | `buildPublicId` añade `.pdf` solo si `validatedKind === "pdf"` y `validatedMime === "application/pdf"`, sellados por `assertMagicBytes` tras `file-type`. El nombre del cliente no decide la extensión. UUID, `folder` y `overwrite: false` se mantienen. Las imágenes siguen sin extensión en el identificador, como pide Cloudinary | No prueba que este defecto fuera el rechazo observado en producción |
| El log perdía el stack al copiar un `Error` con spread | El manejador de producción registra el error original mediante `buildSafeErrorLog`: request ID, método, ruta, fase, nombre, mensaje redactado, código, estado del proveedor y stack. La respuesta pública de un error no operativo sigue siendo `Something went wrong`, sin stack | No hay todavía un log real del hosting con el que correlacionar un fallo de usuario |
| La fase de la subida no quedaba distinguida | `validation` (límite o PDF no validado), `provider` (Cloudinary), `persistence` (guardado del CV) y `cleanup` (borrado posterior). El request ID viaja en esas líneas | Sin el request ID de una subida real no se puede señalar la fase del incidente reportado |

Cloudinary documenta que el `public_id` de un recurso `raw` debe incluir la extensión original, y que el de una imagen no debe llevarla, para no duplicarla en la URL de entrega. [Public ID naming](https://cloudinary.com/documentation/upload_parameters#public_id_naming_preferences).

No se renombraron ni borraron archivos ya existentes. Los identificadores antiguos, sin `.pdf`, siguen siendo válidos para lectura y borrado si Cloudinary aún los tiene. Solo los PDF nuevos reciben el sufijo.

## Comportamiento del CV que se conservó

Se comprobó en el código y en las pruebas simuladas, sin cambiar el orden:

1. La subida a Cloudinary ocurre antes del `findOneAndUpdate`.
2. Si la subida falla, no se escribe MongoDB y el CV anterior permanece.
3. Si la escritura falla, se intenta borrar solo el recurso nuevo y solo si ninguna referencia lo apunta. El CV anterior no se borra.
4. Si la escritura queda incierta (el documento cambió y aun así lanzó error), `isAssetReferenced` ve el id nuevo y no lo borra. Ese caso ya lo cubre `http.test.js`.
5. Si el reemplazo se guardó y falla la limpieza del archivo anterior, la respuesta sigue siendo 201 y se audita `upload.cleanup_failed`.
6. El borrado genérico responde 409 cuando el recurso está referenciado, incluidos registros con borrado lógico.

La coordinación del formulario con una subida pendiente y los estados visuales de la pantalla del CV quedan para el sprint 3.

## Archivos modificados

- `backend/src/services/upload.service.js`
- `backend/src/middlewares/validateFileMagic.js`
- `backend/src/middlewares/globalErrorHandler.js`
- `backend/src/utils/uploadLogger.js`
- `backend/src/controllers/upload.controller.js`
- `backend/src/services/assetReferences.service.js`
- `backend/src/scripts/verifyUploadSecurity.js`
- `backend/tests/security/cloudinary.test.js`
- `backend/tests/security/upload-contract.test.js` (nuevo)
- Este informe

No se tocó el frontend, `docs/sprint-2.md`, los verificadores del sprint 1 ni dependencias.

## Matriz de las ocho rutas

Contrato comprobado con Cloudinary y MongoDB simulados. Cada POST autenticado como admin, origen `https://armandomora.com.co`, campo `file` y boundary generado por `FormData`.

| Ruta | Recurso | Carpeta | Identificador | Persistencia |
| --- | --- | --- | --- | --- |
| `/project-image` | `image` | `portfolio/projects` | UUID, sin extensión, `overwrite: false` | La referencia la guarda después el formulario del proyecto |
| `/cyber-evidence` | `image` | `portfolio/cyber-labs/evidence` | Igual que las imágenes | Igual, en el laboratorio |
| `/certification-badge` | `image` | `portfolio/certifications/badges` | Igual que las imágenes | Igual, en la certificación |
| `/education-logo` | `image` | `portfolio/education/logos` | Igual que las imágenes | Igual, en la formación |
| `/blog-cover` | `image` | `portfolio/blog/covers` | Igual que las imágenes | Igual, en el artículo |
| `/author-avatar` | `image` | `portfolio/authors` | Igual que las imágenes | Igual, en el autor |
| `/cyber-report` | `raw` | `portfolio/cyber-labs/reports` | UUID terminado en `.pdf` | La referencia la guarda después el formulario |
| `/cv` | `raw` | `portfolio/cv` | UUID terminado en `.pdf` | El mismo controlador hace `findOneAndUpdate` del singleton y luego limpia el anterior |

La respuesta sigue exponiendo `url`, `secureUrl`, `publicId`, `resourceType`, `format`, `bytes` y `originalName`. `publicId` es el que devuelve el proveedor (en la simulación, carpeta + identificador).

Límites que no cambiaron: imagen 5 MiB, PDF 10 MiB, 10 subidas por 15 minutos contando las exitosas, JSON de 500 kb que no se aplica al multipart. MIME y firma: JPEG, PNG, WebP y GIF; PDF `application/pdf`. SVG y extensiones peligrosas se rechazan. Un archivo llamado `foto.pdf` cuyo contenido es PNG sigue la convención de imagen y no termina en `.pdf`. Un PDF cuyo nombre no trae extensión sí termina en `.pdf`, porque manda el tipo validado.

## Pruebas ejecutadas

Todas usan servicios simulados o fixtures. Ninguna llamó a Cloudinary, MongoDB ni al sitio de producción.

| Comprobación | Resultado |
| --- | --- |
| `npm run test:smoke --prefix backend` | `env.smoke.js` y `canonical.smoke.js` pasaron |
| `npm run verify:uploads --prefix backend` | 7/7. El PDF válido queda sellado como `validatedKind=pdf` aunque el nombre sea `report.bin` |
| `npm run test:security --prefix backend` | 66/66. Incluye el contrato nuevo y las pruebas previas de CV, origen, sesión y contacto |

Cobertura nueva, dentro de esa suite:

- Dos PDF con el mismo nombre obtienen identificadores distintos terminados en `.pdf`, carpeta `portfolio/cv` y `overwrite: false`.
- Sin sello de PDF validado no se llama a `upload_stream`.
- Las ocho rutas devuelven 201 con el recurso, la carpeta y el identificador esperados.
- Imagen, PNG enviado como PDF, nombre `.exe` y archivo de imagen por encima de 5 MiB: 400 o 413, sin llamada al proveedor. El 413 registra fase `validation`.
- Sin sesión, 401. Rol distinto de admin, 403. Origen no permitido, 403. En los tres casos no hay subida.
- Fallo simulado del proveedor: HTTP 500, mensaje `PDF upload failed`, sin stack en el JSON, CV anterior intacto, log con fase `provider`, `providerStatus` 401 y el request ID. El secreto de prueba no aparece en el log.
- Fallo simulado de persistencia: HTTP 500, mensaje genérico, CV anterior intacto, se limpia el PDF nuevo no referenciado, log con fase `persistence` y el mismo request ID.
- Fallo de limpieza tras un reemplazo guardado: HTTP 201, CV nuevo conservado, auditoría `upload.cleanup_failed`, fase `cleanup`.
- Borrado de un recurso referenciado: 409, sin `destroy`.
- La undécima subida de imagen responde 429.

El caso de escritura incierta que no borra el archivo nuevo sigue cubierto por `http.test.js` (`saveFailure === "ambiguous"`).

## Integración real

| Verificado ahora | Pendiente |
| --- | --- |
| Contrato de identificadores, carpetas, `overwrite: false` y forma de la respuesta, con el SDK simulado | Subida real a Cloudinary y descarga HTTP del archivo devuelto |
| Rechazos de sesión, rol, origen, tipo y tamaño contra la app Express en memoria | El mismo recorrido contra `https://api.armandomora.com.co` con una sesión real |
| Conservación del CV anterior y limpieza, con MongoDB simulado | Persistencia y recarga del CV en la base de producción, sin sustituir el CV vigente para probar |
| Redacción de secretos de prueba en los logs locales | Que el proceso del hosting escriba estas líneas y que alguien pueda leerlas |

No se publicó, no se reinició la API y no se creó ni borró ningún recurso de producción.

## Despliegue y recuperación

Publicar solo el backend cuando se autorice. No hace falta un build del frontend para este cambio. No desplegar esto como arreglo de los GET 500.

1. Conservar el release actual de `backend` para poder volver a él.
2. En el entorno del panel, con Node 24 compatible: `npm ci --omit=dev` usando el lockfile. No copiar `node_modules` de Windows.
3. Startup file sigue siendo `src/server.js`. No cambiar variables para “hacer pasar” una subida.
4. Reiniciar solo la aplicación de la API por el mecanismo del panel.
5. Repetir `GET /api/health` y `GET /api/ready`. Después, en un entorno de prueba o con un archivo desechable que no sea el CV de producción: subir una imagen, guardar la referencia, recargar y abrir `secureUrl`. Repetir con un PDF de laboratorio y, solo con una copia de prueba, con el CV. Comprobar que el `public_id` del PDF termina en `.pdf` y que el anterior sigue descargable si la prueba falla a mitad.
6. Si hay que volver atrás: apuntar la app al release anterior, restaurar sus variables y reiniciar. Los PDF nuevos con `.pdf` no deben renombrarse a mano; un rollback del código no borra lo ya subido.

## Datos que siguen haciendo falta para el diagnóstico de producción

Para una imagen y un PDF que hayan fallido, sin repetir el POST y sin pegar el archivo, la cookie ni el HAR:

- hora y zona horaria
- método y URL
- estado HTTP y cuerpo sanitizado
- `X-Request-Id`
- extensión, bytes y MIME

Con ese id, el log del backend debería mostrar una de estas fases: `validation`, `provider`, `persistence` o `cleanup`. Si el id no está en la API, el rechazo ocurrió antes, en el navegador o en el proxy.

Los GET 500 de páginas y de `robots.txt` siguen abiertos en el sprint 1. Sus trazas de stderr, la versión de Node y el startup file del panel continúan pendientes y son independientes de este cambio.

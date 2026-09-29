# Sprint 3 — Coordinación de formularios y estados del CV

Fecha: 2026-09-29, America/Bogota. **Implementación local validada; aceptación en producción pendiente.**

Este cambio corrige dos defectos de interfaz comprobados: guardar formularios antes de recibir las referencias de archivos y confundir un fallo de consulta del CV con su ausencia. **No demuestra ni corrige la causa de los GET 500 del alojamiento.** No se publicó, reinició ningún servicio remoto ni modificó contenido real. No se avanzó al sprint 4.

## Base y alcance preservado

- HEAD inicial: `c457cfb2c0ebb9d01c6fdea0865a543ce7cd862a`, rama `main`.
- Estado inicial: únicamente `.claude/settings.local.json` sin seguimiento. Se conservó sin leer su contenido ni modificarlo.
- Se leyeron `frontend/AGENTS.md`, la auditoría de producción y los informes de los sprints 1 y 2. Antes de editar se consultaron las guías instaladas de Next `use-client.md` y `05-server-and-client-components.md`.
- Sin cambios en backend, dependencias, lockfiles, variables de entorno, autenticación, validación multipart ni verificadores del sprint 1. Los mocks cambian variables únicamente en el proceso hijo de pruebas.
- Se conserva `docs/sprint-3.md`. Este informe es independiente.
- Next dev regeneró automáticamente el bloque de `frontend/AGENTS.md`; al terminar se restituyó su contenido previo. No se incluye esa regeneración como cambio del sprint.

## Inventario completo de controles

Búsqueda en `frontend/src`: el único `<input type="file">` está en `FileUploadField`. Los ocho métodos de subida se consumen desde ese componente. El `FormData` del contacto representa campos de texto, no otra subida de archivos.

| Formulario / componente | Archivo | Referencia en formulario → payload | Varias subidas | Cuándo se persiste la referencia |
| --- | --- | --- | --- | --- |
| `ProjectForm` | Imagen principal, `project-image` | `imageUrl`, `imagePublicId` → `image.url`, `image.publicId` | Un selector, reemplazos sucesivos | Al guardar proyecto |
| `CyberLabForm` | Evidencia, `cyber-evidence` | Líneas `url\|publicId\|alt\|caption` en `evidenceInput` → `evidence[]` | Varias evidencias sucesivas; una puede coincidir con el PDF | Al guardar laboratorio |
| `CyberLabForm` | PDF, `cyber-report` | `reportUrl`, `reportPublicId` → `report.url`, `report.publicId` | Segundo selector independiente | Al guardar laboratorio |
| `CertificationForm` | Insignia, `certification-badge` | `badgeUrl`, `badgePublicId` → `badge.url`, `badge.publicId` | Un selector | Al guardar certificación |
| `EducationForm` | Logo, `education-logo` | `logoUrl`, `logoPublicId` → `logo.url`, `logo.publicId` | Un selector | Al guardar formación |
| `BlogPostForm` | Portada, `blog-cover` | `coverUrl`, `coverPublicId` → `coverImage.url`, `coverImage.publicId` | Puede coincidir con avatar | Al guardar artículo |
| `BlogPostForm` | Avatar, `author-avatar` | `authorAvatarUrl`, `authorAvatarPublicId` → `author.avatarUrl`, `author.avatarPublicId` | Segundo selector independiente | Al guardar artículo |
| `/admin/cv` | PDF, `cv` | Respuesta de subida → CV confirmado en pantalla; lectura posterior de `settings.cv` | Una operación de escritura a la vez | **En el POST de subida**, por el backend; sin segundo guardado |
| `ProjectGalleryFields` | URLs manuales de capturas | `gallery[]`, con URL, publicId y texto alternativo | Hasta 12 filas; sin transferencia de archivos | Al guardar proyecto; queda dentro del bloqueo del formulario |
| URLs manuales de los cinco formularios | Imagen, badge, logo, portada, avatar, reporte y evidencias | Las referencias anteriores | Sin operaciones de subida propias | Al guardar; sus controles también se deshabilitan durante el envío |
| `CvSettingsForm` en Site Settings | Enlace de consulta/administración | Muestra `cvUrl`; no sube ni reemplaza el documento | No aplica | Guardar Site Settings no modifica el CV |

## Cambios y comportamiento

### Formularios con archivos pendientes

`src/lib/uploadCoordinator.ts` mantiene un conjunto de operaciones y un bloqueo de guardado síncrono. `UploadForm.tsx` lo comparte mediante contexto y suscribe la interfaz con `useSyncExternalStore`.

- Cada campo registra su propia operación. Terminar uno no libera los demás.
- El manejador del formulario impide el envío antes de invocar la validación de react-hook-form. Cubre el evento de submit, incluido Enter y `requestSubmit`, además del botón deshabilitado.
- El guardado mantiene el bloqueo durante validación y persistencia. Rechaza otro envío y otra subida; un `fieldset` deshabilita también URLs manuales, quitar archivo y controles de galerías mientras dura esa operación.
- El campo entrega el resultado al callback del padre, que incorpora URL y publicId, **antes** de liberar su operación pendiente. No cambia los mapeos existentes de payload.
- Tanto éxito como error liberan la operación; el fallo no llama a `onChange` y conserva la referencia anterior. El guardado puede intentarse después con esa referencia anterior.
- El input limpia su selección nativa después de leer el `File`; elegir de nuevo exactamente el mismo archivo vuelve a disparar el flujo.
- Un identificador por operación descarta respuestas de campos desmontados o sustituidos. La limpieza libera el contador una sola vez. No se afirma que desmontar cancele una escritura que ya recibió el servidor.
- No se añade borrado automático de activos. Se conserva la protección de referencias del backend del sprint 2.

`FileUploadField` ahora asocia label, ayuda, estado y error mediante id, `htmlFor`, `aria-describedby` y `aria-invalid`. Anuncia “Subiendo archivo…” sin porcentajes inventados y, para archivos temporales, “Archivo subido. Guarda el formulario para publicar esta referencia.” Los mensajes de error usan `role="alert"`; los estados usan `role="status"`.

Antes, cada campo ocultaba su `loading` al formulario. Ahora los cinco formularios usan `UploadForm` y `UploadSubmitButton`, con la misma protección compartida para alta y edición.

### CV

`src/lib/cvController.ts` separa lectura (`loading`, `error`, `ready`), operación (`idle`, `upload`, `delete`), último CV confirmado y resultado incierto. La página conserva su diseño y añade consulta explícita y mensajes accesibles.

| Situación | Antes | Ahora |
| --- | --- | --- |
| Lectura inicial falla | `catch` vacío; parecía no existir CV | Error explícito, reintento y escrituras bloqueadas |
| Lectura correcta sin CV | Selector sin distinguir la consulta | Mensaje de ausencia confirmada y selector |
| Lectura posterior falla | Sin comprobación explícita fiable | Conserva el último CV, indica error y permite consultar otra vez |
| Sustitución en curso | Eliminar podía seguir disponible | Eliminar, consultar y volver a subir quedan bloqueados; también hay guardas síncronas |
| Eliminación en curso | Subir podía seguir disponible | Subida y repetición del borrado bloqueadas |
| Respuesta antigua de lectura | Podía sobrescribir otra operación | Un contador de versión descarta respuestas anteriores; desmontar invalida las pendientes |
| Subida satisfactoria | Actualizaba pantalla desde respuesta | Conserva ese contrato: el POST ya persistió el CV; no hay PUT adicional |
| Error de red o 5xx al escribir | Sin resolución explícita de incertidumbre | No anuncia éxito ni repite automáticamente; exige “Comprobar estado actual” antes de otra escritura |

Un 5xx se trata conservadoramente como incierto, porque el navegador no puede demostrar si la persistencia ocurrió antes de perder la respuesta. Un rechazo 4xx permite reintentar manualmente. La renovación de sesión tras 401 sigue siendo la existente del servicio; no se añadió ningún reintento por pérdida de conexión.

La fecha de subida deja de fabricarse con el reloj del navegador: solo se presenta `updatedAt` si vino en una lectura del servidor. Si una consulta confirma otro publicId, se sustituye el campo para descartar mensajes de la operación anterior.

## Pruebas y resultados

Runtime local: Node `v24.15.0`, npm `11.12.1`, Next `16.3.6`. Los procesos que generan o sirven artefactos de Next se ejecutaron secuencialmente: vista de navegador → verificador público → build → servidor personalizado. No hubo dev y build simultáneos.

| Comprobación | Resultado / alcance |
| --- | --- |
| `npm run test:security --prefix frontend` | 46/46; incluye 14 regresiones nuevas de este sprint |
| `npm run test:config --prefix frontend` | 34/34 |
| `npm run typecheck --prefix frontend` | Pasó; sin emitir archivos ni incremental |
| `npm run lint --prefix frontend` | Pasó, sin advertencias |
| `npm run test:public --prefix frontend` | Pasó con API en memoria: altas/ediciones, listados, detalles, 404, errores de API, robots, sitemap, RSS y OG |
| `npm run build --prefix frontend` | Pasó; 28 páginas estáticas; BUILD_ID `bfO8FkM0NGnpJLAgkwr0y` |
| `npm run test:release:passenger --prefix frontend` | Código 0, 23:07:20–23:07:25 UTC. Build servido por `node server.js` en localhost: páginas, 404, 8 pantallas admin, robots, sitemap, RSS y OG correctos |
| Detalles válidos contra API pública en ese smoke | Cinco SKIP explícitos porque las colecciones públicas estaban vacías. Se comprobaron con registros simulados en `test:public`; no se crearon registros reales |
| `git diff --check` | Sin errores de whitespace |

Las nuevas pruebas ejecutan los controladores, manejadores reales del campo/formulario, callbacks de los cinco consumidores y sus funciones reales de construcción del payload. Usan promesas controladas y un host de hooks simulado; no sustituyen una prueba del DOM real. Comprueban:

1. Bloqueo con una y dos subidas; completar solo una mantiene el bloqueo.
2. Incorporación de todas las referencias nuevas en los payloads de proyecto, laboratorio, certificación, formación y blog.
3. Fallo con referencia anterior conservada, selección repetida del mismo archivo y vínculos accesibles de ayuda/error.
4. Rechazo de subida/quitar referencia durante guardado, rechazo de doble envío y liberación tras error.
5. Desmontaje con resultado tardío ignorado.
6. Error de consulta del CV distinto de ausencia, recuperación por reintento y conservación de datos válidos.
7. Consulta obsoleta que no sobrescribe un reemplazo confirmado, ni actualiza después de desmontar.
8. Exclusión de reemplazo y borrado; éxito solo después de confirmar persistencia.
9. Escritura incierta sin repetición automática; consulta posterior antes de permitir otra escritura.
10. La página renderiza alertas/reintento y no el mensaje de ausencia ante un error.

Durante el desarrollo, el primer typecheck detectó que `SiteCv` permite propiedades opcionales; se corrigió el contrato de lectura y se normalizó solo después de comprobar que existe URL. Las cinco pruebas nuevas de consumidores inicialmente fallaron por un mock incorrecto de exportación default CommonJS; se corrigió el mock y todas pasaron. Ninguno de esos fallos se atribuye al hosting.

## Verificación real en navegador local

Se utilizó `scripts/preview-upload-forms.mjs`, nuevo y separado de los verificadores anteriores. Arranca Next dev en `localhost:3110` y una API Express en memoria, vinculada a `127.0.0.1:5111`, con sesión de administrador ficticia. Sin MongoDB ni Cloudinary. El PNG de prueba tenía 68 bytes, MIME `image/png`, nombre `image.png`; no contenía datos personales.

| Acción observada | Evidencia |
| --- | --- |
| Abrir edición y seleccionar PNG con respuesta retenida | Mensaje “Subiendo 1 archivo(s)”, selector y Guardar deshabilitados |
| Pulsar Enter en Título mientras estaba pendiente | La API fixture registró una subida retenida y `writes: []` |
| Liberar subida y guardar, reteniendo la respuesta del guardado | Payload `image.url = http://127.0.0.1:5111/fixture/image-1.png`, `image.publicId = fixture/project-image-1` |
| Inspeccionar durante ese guardado | Selector de archivo y URL manual deshabilitados; anuncio “Guardando formulario…” |
| Liberar guardado, volver a editar y seleccionar el mismo PNG, esta vez con fallo | HTTP 413 simulado; mensaje de error/reintento; URL previamente guardada intacta; no hubo segundo PATCH |
| Abrir CV con lectura 503 simulada | Error y botón “Reintentar consulta”; sin mensaje de ausencia ni selector para escribir |
| Restaurar lectura y pulsar reintento | Apareció `CV-local-anterior.pdf`, enlace de consulta y controles habilitados |
| Volver a provocar error de lectura con CV conocido | CV anterior visible, alerta de consulta y controles de escritura deshabilitados |

El registro final del fixture mostró dos intentos de subida de imagen y **un único PATCH de proyecto**. No hubo escritura de CV en esta sesión de navegador. Reemplazo/eliminación, concurrencia de dos archivos y reintento tras fallo con el mismo `File` están cubiertos por las regresiones controladas; no se presentan como recorridos adicionales ejecutados en el navegador. No se verificó entrega real desde Cloudinary con esta API simulada.

Captura local de la pantalla del CV conservado ante error posterior: `sprint-3-cv-error.png`, entregada con la respuesta del trabajo. Pestaña y procesos de fixture cerrados al terminar.

### Repetir la prueba local

1. Desde `frontend`, ejecutar `node scripts/preview-upload-forms.mjs` sin otro Next dev o build en ejecución. Abrir `http://localhost:3110/admin/projects/fixture-project/edit` o `/admin/cv`.
2. Seleccionar un PNG pequeño desechable. El modo inicial `upload: hold` retiene la respuesta.
3. Consultar `GET http://127.0.0.1:5111/fixture/state`: muestra operaciones solo en memoria. Liberar con `POST /fixture/release`.
4. Configurar `POST /fixture/control`, JSON `{"upload":"fail"}` para fallo, `{"upload":"ok"}` para éxito, `{"save":"hold"}` para retener guardado/borrado o `{"readError":true}` para error de consulta. Usar `false` para restaurar la lectura. Los modos son del fixture, no de producción.
5. Detener con `POST http://127.0.0.1:5111/fixture/stop`. También tiene un límite de 30 minutos. Los datos se descartan al cerrar; no apuntar este fixture a un servidor remoto.

## Publicación y aceptación remota pendientes

No se necesita migración ni un cambio adicional del backend para esta coordinación. Las correcciones del sprint 2 permanecen intactas. Publicar solamente cuando se autorice y siguiendo `deployment.md`:

1. Conservar el release previo y registrar commit, BUILD_ID y entorno efectivo. Mantener source, configuración, `public`, `.next/server` y `.next/static` de un mismo release. No copiar `node_modules` de Windows al alojamiento.
2. En el entorno de destino compatible con Node 24, instalar con el lockfile y construir con las variables públicas de producción ya revisadas; no trasladar valores localhost ni la sesión/API fixture. Verificar typecheck, lint y pruebas antes de activar el release.
3. Ejecutar los verificadores del sprint 1 con el artefacto final. El smoke con `node server.js` local no certifica Passenger, permisos ni integridad del release remoto.
4. Validar los flujos autenticados con archivos desechables y datos de prueba en staging: una subida lenta, dos simultáneas en blog/laboratorio, fallo y reintento, guardado/recarga con URL y publicId correctos, CV ausente/error/disponible, sustitución/borrado y consulta tras resultado incierto. No reemplazar el CV vigente de producción para hacer la prueba.
5. Tras autorización de publicación, revalidar GET de páginas y SEO en el dominio real y consultar el CV existente sin escribirlo. Si reaparecen los 500, correlacionar stderr del frontend con fecha, ruta, request ID cuando exista y release; no declarar que esta coordinación los resuelve.
6. Si se requiere rollback, reactivar el release previo completo por el procedimiento del alojamiento. Volver atrás el frontend no elimina archivos ni revierte escrituras ya persistidas; no borrar recursos para “limpiar” la prueba.

La aceptación local cubre los criterios de coordinación y estados de este sprint con los límites anteriores. **Aceptación de hosting e integración real pendiente**: siguen faltando las trazas sanitizadas de los GET 500 y de una imagen/PDF fallidos, y la identificación efectiva del entorno desplegado. La disponibilidad de API o readiness no valida Cloudinary ni permisos de escritura. No se establece una causa remota sin esa evidencia.

## Estado final

HEAD sigue en `c457cfb2c0ebb9d01c6fdea0865a543ce7cd862a`; no se hizo commit, stage ni push. El diff se limita a los cinco formularios, el campo compartido, la pantalla/controlador del CV, la coordinación compartida, las pruebas, el nuevo fixture local y este informe. `.claude/settings.local.json` continúa sin seguimiento. Se comprobó diff vacío para backend, lockfile, verificadores del sprint 1, `AGENTS.md` y `docs/sprint-3.md`.

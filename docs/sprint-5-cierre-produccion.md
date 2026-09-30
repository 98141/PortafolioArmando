# Sprint 5 — Recuperación y aceptación real en cPanel

Fecha: 2026-09-29.  
Frontend: `https://armandomora.com.co`.  
API: `https://api.armandomora.com.co/api`.

Este sprint no cierra los tres incidentes abiertos en `docs/sprint-4-validacion-despliegue.md`. No hubo sesión de cPanel, no se leyó la excepción del proceso y no se publicó ni se modificó el alojamiento. `docs/sprint-5.md` queda intacto: pertenece a un sprint anterior de rendimiento.

## Estado distinguido

| Capa | Identidad | Relación con el fallo |
| --- | --- | --- |
| Código local | HEAD `988b29f2249d803e2f9eca8bc8776740c1803636`, «Sprint 4 finalizado», 2026-09-29 18:49:42 -0500. Árbol limpio | Incluye los sprints 1 a 4. `main` está 4 commits por delante de `origin/main` (`dac3482`, `c457cfb`, `1fdb245`, `988b29f`). Esos commits no están en el remoto |
| Artefacto local | `frontend/.next/BUILD_ID` = `nRtdSHuPnXJtu28Xr8pYu` | Construido en la validación del sprint 4, antes de ese commit, con el mismo código de producción que el commit empaquetó. No es el release publicado |
| Release publicado | Desconocido. No se leyó su raíz, startup file, modo, Node ni `BUILD_ID` | Sigue respondiendo los GET 500. El commit local no está desplegado |

No se reutiliza `nRtdSHuPnXJtu28Xr8pYu` como identificador del alojamiento. Los cambios locales del sprint 4 se conservaron dentro del commit; no hubo reset, unstaging ni push.

## Sesión de cPanel

No hay sesión autorizada. El navegador de esta sesión solo tenía abierta la vista previa local `http://localhost:3110/admin/cv`. No se pidieron contraseñas, cookies, claves ni el contenido de ningún `.env`.

Para obtener la evidencia, con acceso de lectura y sin pulsar Restart, Run NPM Install ni guardar cambios:

1. Abrir el panel del alojamiento de `armandomora.com.co`.
2. Entrar en **Setup Node.js App** y seleccionar la aplicación de ese dominio, no la de `api.armandomora.com.co`.
3. Anotar, sin copiar variables: versión de Node que muestra la aplicación, raíz, startup file y modo (Production o Development).
4. Abrir el destino de stderr/stdout indicado en esa aplicación y buscar las tres horas de abajo. La línea que ya escribe `frontend/server.js` empieza por `Error al procesar la solicitud:`.
5. En la raíz publicada, leer solo `frontend/.next/BUILD_ID` si el archivo existe. No abrir `.env`.

Si el panel no muestra la ruta de logs, esta es la solicitud para el proveedor:

> Dominio: armandomora.com.co.  
> Aplicación Node del frontend, no la API.  
> Horas UTC del 2026-09-29: 23:53:59.563 (`/admin/projects/new`), 23:54:00.404 (`/projects`) y 23:54:00.868 (`/robots.txt`).  
> Cada respuesta fue HTTP 500, `text/plain`, 21 bytes, cuerpo `Internal Server Error`, `Server: LiteSpeed`, `etag: "66fci67lppl"`.  
> Se necesita el stderr/stdout de esa aplicación y el error log del proxy en ese intervalo, más la versión de Node, la raíz, el startup file, el modo y el contenido de `.next/BUILD_ID`.  
> No reiniciar la aplicación, no instalar dependencias y no enviar variables, cookies ni secretos.

## Evidencia de esta sesión

GET sin cookies y sin seguir redirecciones:

| Hora UTC | URL | Estado | Resultado |
| --- | --- | --- | --- |
| 2026-09-29T23:53:59.563Z | `/admin/projects/new` | 500 | `Internal Server Error`, 21 bytes, `text/plain`, `cache-control: private, no-store` |
| 2026-09-29T23:54:00.404Z | `/projects` | 500 | Mismo cuerpo. Sin `cache-control` |
| 2026-09-29T23:54:00.868Z | `/robots.txt` | 500 | Mismo cuerpo. Sin `cache-control` |
| 2026-09-29T23:54:01.028Z | `/` | 200 | HTML de 58708 bytes, `x-nextjs-cache: STALE` |

El cuerpo de 21 bytes es el texto fijo de `frontend/server.js` cuando `handle()` rechaza la petición. No es la excepción. El mismo `etag` ya aparecía en el diagnóstico del sprint 0, así que el release que falla no cambió con los commits locales posteriores.

## Causa

No demostrada. No se contrastó runtime, startup file, directorio de trabajo, archivos del build publicado ni permisos, porque esa información no está en el repositorio ni en las respuestas HTTP. Las instrucciones de `docs/deployment.md` describen la configuración prevista; no son la configuración efectiva.

No se cambió Node, Passenger, variables, permisos ni cachés. No se convirtió un 500 en 200 ni se ocultó el fallo. No se debilitó autenticación ni validación de archivos. No se añadió instrumentación: el proceso ya registra la excepción en stderr y el problema es que ese registro no se ha leído.

## Corrección y publicación

No hubo corrección de código ni cambio en el alojamiento. No hay release publicado en este sprint.

El release que está en el aire es el que presenta el incidente. Volver a apuntar la aplicación a esa misma carpeta no lo resuelve. El candidato local `988b29f` tampoco se publica hasta conocer la excepción: publicarlo sin esa evidencia puede repetir el fallo o sustituir un release sin saber si el código nuevo lo provoca.

Cuando la traza exista, la intervención tiene que presentarse otra vez con la causa, los archivos reales y la autorización concreta. Hasta entonces el procedimiento de recuperación es no tocar el alojamiento:

1. Conservar la carpeta publicada y su `.next`.
2. No borrar archivos ni revertir MongoDB o Cloudinary.
3. Si más adelante se activa otro candidato y falla el arranque, volver a la carpeta anterior. Esa carpeta seguirá teniendo este incidente de GET 500 mientras no se corrija la causa.
4. Instalar dependencias en el sistema del alojamiento, con `npm ci` y el lockfile de un mismo release. No copiar `node_modules` de Windows.

No se repitió la suite local. El sprint 4 ya la ejecutó y este sprint no modificó código de producto.

## Integración de archivos

Sigue bloqueada. No hay un entorno autorizado con MongoDB y Cloudinary distinto de producción, y no se autorizó usar el CV vigente ni crear contenido público.

La opción mínima para completarla es una base MongoDB de prueba y una carpeta o nube de Cloudinary de prueba, con permiso explícito para crear allí una imagen, un PDF y un registro de CV desechable. Hace falta poder leer el `X-Request-Id` y el log del backend de ese entorno, sin secretos. Un mock no sustituye esa prueba.

## Matriz de aceptación real

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| Causa del GET 500 | Tres GET de las 23:53:59Z–23:54:00Z siguen en 500. Sin stderr ni configuración efectiva | Abierto. Bloqueado por acceso |
| Configuración efectiva de cPanel | Sin sesión. El navegador no estaba en el panel | No comprobada |
| Corrección publicada | No se modificó el alojamiento | No ejecutada |
| Listados, Nuevo proyecto, ediciones, SEO y 404 en el dominio | El candidato no se activó. Las tres rutas muestreadas siguen fallando en el release actual | Fallido en el release publicado |
| Detalle de una muestra existente | Las colecciones públicas seguían vacías en el sprint 4 y no se volvió a inventariarlas | No ejecutado |
| Sesión y lectura administrativa en producción | Sin publicación y sin sesión de administración | No ejecutado |
| Imagen, PDF, CV de prueba y request ID | Sin entorno de prueba autorizado | Bloqueado por acceso |

## Siguiente acción

Abrir la sesión de cPanel y extraer, en modo lectura, la excepción de las 23:53:59.563Z, 23:54:00.404Z y 23:54:00.868Z junto con Node, raíz, startup file, modo y `BUILD_ID` publicado. Si el panel no guarda esos logs, enviar al proveedor la solicitud de esta nota. Con esa traza se puede preparar la corrección; sin ella el sprint permanece abierto.

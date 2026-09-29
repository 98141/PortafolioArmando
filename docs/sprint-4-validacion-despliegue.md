# Sprint 4 — Validación integral y aceptación del despliegue

Fecha de la validación: 2026-09-29.  
Frontend público: `https://armandomora.com.co`.  
API: `https://api.armandomora.com.co/api`.

El commit `1fdb245` ya contenía los sprints 1, 2 y 3. El índice estaba vacío al empezar; no había cambios de sprint 3 en staging. No se hizo reset, unstaging, commit ni push. `docs/sprint-4.md` no se modificó.

Regresión local completada; aceptación de producción pendiente.

El incidente de GET 500 en el alojamiento sigue abierto. Health y readiness de la API no sustituyen la aceptación funcional. Los sprints 1 a 3 no constituyen una recuperación completa mientras esas respuestas sigan fallando.

## Estado del repositorio

| Dato | Valor |
| --- | --- |
| HEAD | `1fdb2456c0d0e69d2a051b34730a5a1428975078` — Sprint 3 finalizado |
| Base del candidato | Ese commit, más el diff local de este sprint |
| Node / npm | v24.15.0 / 11.12.1 |
| Frontend | 0.1.0, Next.js 16.3.6, React 19.2.4 |
| Backend | 1.0.0, Express 5.2.1, mongoose 9.10.2, cloudinary 2.10.0 |
| BUILD_ID local | `nRtdSHuPnXJtu28Xr8pYu` |
| Configuración pública del build | `.env.production.local`. El verificador local vio canónicos `https://armandomora.com.co` y la API de producción en los chunks servidos, sin URLs de aplicación hacia localhost |

Cambios locales sin commit, limitados al arnés de vista previa y a este informe:

- `frontend/next.config.ts`: solo con `NODE_ENV=development` y `PUBLIC_FIXTURE=1`, permite `http://127.0.0.1:5111/fixture/**` en `images.remotePatterns`. El build de producción no usa esa rama.
- `frontend/scripts/preview-upload-forms.mjs`: sesión, creación de proyecto, blog, lectura retenida, fallo de subida y resultado incierto. No usa MongoDB ni Cloudinary.
- Este documento.

`frontend/AGENTS.md` volvió al texto ya versionado después de que `next dev` lo reescribiera. No forma parte del candidato.

Los cambios de los sprints anteriores siguen en HEAD y son compatibles: el frontend envía `url` y `publicId` del contrato de subida; el backend añade `.pdf` solo a recursos raw validados como PDF. Este sprint no alteró ese contrato.

## Matriz

| Criterio | Entorno | Evidencia | Resultado | Pendiente |
| --- | --- | --- | --- | --- |
| Páginas prerenderizadas `/`, `/about`, `/contact` | Producción, GET 2026-09-29T23:19:29Z–23:19:30Z | HTTP 200, HTML, 58708 / 34440 / 31405 bytes | Aprobado | Ninguno para estas tres rutas |
| Listados públicos y SEO | Producción, GET 2026-09-29T23:19:30Z–23:19:33Z | `/projects`, `/cybersecurity`, `/certifications`, `/education`, `/blog`, `/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/og`: HTTP 500, cuerpo exacto `Internal Server Error`, 21 bytes, `text/plain` | Fallido | Excepción del frontend y entorno efectivo de cPanel |
| Nuevo proyecto y cinco ediciones | Producción, GET 2026-09-29T23:19:32Z | `/admin/projects/new` y ediciones de projects, cyber-labs, certifications, education y blog con id `507f1f77bcf86cd799439011`: HTTP 500, mismo cuerpo de 21 bytes | Fallido | La misma evidencia de stderr y arranque |
| Detalle público existente | Producción | API `total: 0` en projects, blog, cyber-labs, certifications y education | No ejecutado | Una colección vacía no verifica un detalle publicado |
| Detalle inexistente | Producción, GET 2026-09-29T23:19:59Z–23:20:01Z | Cinco slugs `sprint4-nonexistent-20260929`: HTTP 500, 21 bytes | Fallido | Distinguir 404 de 500 exige la excepción del host |
| Health y readiness | Producción, GET 2026-09-29T23:19:33Z–23:19:34Z | `/api/health` 200, request `8a302a60-4e28-4a02-932d-1e44a45081fa`; `/api/ready` 200 `ready: true`, request `6fd519ea-05d3-4819-827a-603325d8b5b6` | Aprobado | No sustituye las páginas que responden 500 |
| Causa del GET 500 | cPanel / stderr | No hay acceso al panel ni a la excepción | Bloqueado por evidencia o acceso faltante | Pasos de la sección siguiente. No se cambió runtime, permisos ni caché |
| Regresión automatizada local | Node local, servicios de prueba aislados | backend 66/66 y verify:uploads 7/7; frontend config 34/34, security 46/46, lint 0, test:public, build, typecheck, test:release y test:release:passenger con código 0 | Aprobado | Los cinco SKIP de detalle publicado |
| Recorridos de formularios, sesión y CV | Fixture local `localhost:3110` y API `127.0.0.1:5111` | Recorridos de la sección de navegador, ejecutados en esta sesión | Aprobado | No demuestran Cloudinary ni MongoDB |
| Integración real de imagen, PDF y CV | MongoDB y Cloudinary de prueba | No hay entorno autorizado distinto de producción | Bloqueado por evidencia o acceso faltante | No se sustituyó el CV vigente ni se creó contenido público |
| Release candidato | Local, sin publicar | BUILD_ID `nRtdSHuPnXJtu28Xr8pYu`; chunks sin API de fixture | Aprobado como candidato local | Publicación no autorizada |
| Aceptación posterior al despliegue | Dominio real del candidato | El candidato no se publicó | No ejecutado | `verify:release` contra `https://armandomora.com.co` después de activar este candidato |

## GET 500

La sonda usó GET sin cookies y sin seguir redirecciones. El cuerpo de los fallos es exactamente `Internal Server Error`. Ese texto sale del `catch` de `frontend/server.js`; no identifica la excepción. No se deduce la causa a partir de él.

Siguen en 200 la portada, about, contact, `/api/health` y `/api/ready`. Los listados de la API responden 200 con `total: 0`. Un slug ausente es 404 en la API y 500 en el frontend.

Evidencia mínima que falta, para las peticiones de las 23:19:30Z–23:19:33Z y 23:19:59Z–23:20:01Z, en especial `/projects`, `/admin/projects/new` y `/robots.txt`:

1. stderr del proceso frontend alrededor de esa hora, con la excepción y su stack.
2. En cPanel, sin reiniciar, sin `npm install` y sin volcar variables: versión de Node, raíz de la aplicación, startup file, modo y `BUILD_ID` del directorio publicado.

Hasta tener esa excepción no hay corrección de código ni regresión nueva para este incidente.

## Regresión automatizada

Los scripts se revisaron antes de ejecutarlos. `backend` usa pruebas y mocks locales. `test:public` levanta un fixture sin MongoDB, Cloudinary ni correo real y lo detiene al terminar. `with-production.mjs` arranca `next start` o `server.js` en `127.0.0.1:3100` y mata el proceso al finalizar. Esos procesos se ejecutaron en serie. El preview de formularios se detuvo antes de esta serie.

| Comando | Código | Resultado |
| --- | --- | --- |
| `npm test --prefix backend` | 0 | smoke, verify:uploads 7/7, security 66/66 |
| `npm run test:config --prefix frontend` | 0 | 34/34 |
| `npm run test:security --prefix frontend` | 0 | 46/46 |
| `npm run lint --prefix frontend` | 0 | eslint sin avisos |
| `npm run test:public --prefix frontend` | 0 | SSR, 404, 500 de fixture, sitemap y RSS |
| `npm run build --prefix frontend` | 0 | BUILD_ID `nRtdSHuPnXJtu28Xr8pYu` |
| `npm run typecheck --prefix frontend` | 0 | `tsc --noEmit` |
| `npm run test:release --prefix frontend` | 0 | `next start` local |
| `npm run test:release:passenger --prefix frontend` | 0 | `server.js` local, 23:44:55Z–23:45:00Z |

SKIP conservados en ambos verificadores de release, porque la API pública tiene las colecciones vacías: `/projects/[slug]`, `/cybersecurity/[slug]`, `/certifications/[slug]`, `/education/[slug]`, `/blog/[slug]`. El mensaje es `no public record; successful detail NOT verified`. `test:public` sí recorrió detalles de fixture (`fixture-one`, `legacy`, `missing` y `outage`); eso no cuenta como un detalle publicado en producción.

Los chunks servidos por el release local contienen la API de producción y no contienen URLs de aplicación hacia localhost. El verificador también consultó la API real para confirmar el 404 de un slug ausente y el `total` vacío. Esa consulta no publica el candidato.

## Recorridos en navegador

Fixture desechable en `http://localhost:3110`, API `http://127.0.0.1:5111`. No se usó el CV ni el contenido de producción. Los archivos se inyectaron en el input real mediante `DataTransfer` y el evento `change` del componente; el selector nativo del sistema no está disponible en el navegador de la herramienta.

Ejecutados:

- Sesión ya autorizada: el editor cargó «Proyecto local de prueba» y mostró `local@example.com`.
- Sin sesión: logout y una navegación directa a la edición redirigieron a `/admin/login`.
- Acceso: correo y contraseña de fixture; el botón pasó a «Iniciando sesión...» deshabilitado y abrió `/admin/dashboard`.
- Renovación: el siguiente `/api/auth/me` se rechazó una vez; el fixture registró `refresh`, `meFails` volvió a 0 y el dashboard siguió mostrando «Admin local».
- Logout: el fixture registró `logout` y la sesión quedó cerrada.
- Crear proyecto: título y descripción, controles deshabilitados con «Guardando formulario…», POST registrado y recarga en la edición con el mismo título.
- Editar y guardar: la URL y el `publicId` guardados fueron `http://127.0.0.1:5111/fixture/image-1.png` y `fixture/project-image-1`. Tras recargar, el formulario mostró esa URL.
- Subida lenta: «Subiendo 1 archivo(s)…», Guardar deshabilitado y Enter no creó ninguna escritura.
- Blog, dos subidas: al terminar solo la portada, Crear siguió deshabilitado y el aviso bajó a «Subiendo 1 archivo(s)». Al terminar el avatar, Crear se habilitó y quedaron `image-1.png` e `image-2.png`.
- Error de subida: se conservó la URL anterior, el aviso pidió seleccionar de nuevo y el input quedó vacío. El mismo nombre `image.png` se aceptó en el reintento y actualizó `fixture/project-image-3`.
- Controles protegidos: durante el guardado, el fieldset y Guardar quedaron deshabilitados.
- CV con documento: «CV disponible» y `CV-local-anterior.pdf`, con la fecha del registro (`2026-09-01T12:00:00.000Z`), no la del reloj del navegador.
- CV sin documento: «Consulta correcta: no hay un CV publicado.»
- Error de lectura y reintento: «No se pudo consultar el CV…» con «Reintentar consulta»; el reintento recuperó el PDF.
- Reemplazo: éxito con `cv-nuevo.pdf` y `publicId` `fixture/cv-3.pdf`. El fallo posterior conservó `cv-nuevo.pdf` y mostró que se mantiene la última información confirmada.
- Exclusión: durante el reemplazo, Eliminar y el input quedaron deshabilitados («Reemplazando CV…»). Durante la eliminación, el reemplazo quedó deshabilitado («Eliminando CV…»). Con resultado incierto, Eliminar y el input también quedaron deshabilitados.
- Resultado incierto: HTTP 500, mensaje de comprobar el estado, documento anterior conservado y un solo intento. El botón visible fue «Comprobar estado actual», no un reintento automático.
- Eliminación de fixture: al liberar la respuesta retenida, el aviso fue «CV eliminado.» y después «no hay un CV publicado».
- Teclado: Enter en el login no sustituyó al botón mientras la contraseña no estaba aplicada; Enter durante una subida no guardó; Tab movió el foco en la página de CV.

La respuesta antigua de una lectura no se reprodujo como dos consultas solapadas en el navegador: mientras carga, «Comprobar estado actual» queda deshabilitado. La prueba `stale CV read cannot overwrite a newer persisted upload` de `frontend/tests/security/upload-forms.test.mjs` sí cubre ese descarte y pasó en esta serie.

El aviso de hidratación de Next en desarrollo comparaba `data-cursor-ref`, insertado por el navegador de la herramienta, con el texto «Validando sesión...». No se trató como defecto de la aplicación.

## Defecto reproducido y corrección

Al completar una subida, `next/image` abortó la página de blog: `Invalid src prop (http://127.0.0.1:5111/fixture/image-4.png)`, porque ese host no está en la configuración de imágenes. La repetición, después de permitir ese host solo en el preview local, completó las dos subidas sin tumbar la página.

No se añadió el host a la configuración de producción. Los patrones públicos siguen limitados a `res.cloudinary.com`. No apareció otro defecto reproducible en el código de producto, así que no se añadió otra regresión.

## Integración real

No ejecutada. Un mock o el fixture local no demuestran una operación de Cloudinary o MongoDB. No se sustituyó el CV vigente, no se creó contenido público y no se borró ningún recurso remoto.

Cuando exista un entorno de prueba autorizado, falta: subir una imagen y un PDF, guardar y recargar sus referencias, abrir la URL devuelta, comprobar `.pdf` en el `public_id` raw nuevo, reemplazar un CV de prueba, correlacionar el error por `X-Request-Id` y revisar que el log no contenga secretos.

## Release candidato

No se publicó. El candidato es el árbol de `1fdb245` más el diff local descrito arriba. El artefacto verificable de esta sesión es el build local `nRtdSHuPnXJtu28Xr8pYu`, generado con la configuración pública de producción. No incluye la API ni la sesión del fixture.

Activación, solo cuando se autorice este candidato y no otro:

1. Conservar la carpeta actual de frontend y de backend, con su `.next`, `public`, lockfile y startup file. No borrarlas.
2. En el servidor Linux, en una carpeta nueva, instalar con `npm ci` desde el lockfile. No copiar `node_modules` de Windows.
3. Frontend: raíz `frontend`, modo Production, startup file `server.js`, Node 24.15.x. Construir allí con `npm run build` y las tres variables públicas HTTPS ya usadas por el sitio. No activar `PUBLIC_FIXTURE`.
4. Backend: raíz `backend`, startup file `src/server.js`, `npm ci --omit=dev`, mismas variables privadas. No hace falta migración: los sprints 2 y 3 no cambian datos persistidos.
5. Apuntar cada aplicación a su carpeta nueva y reiniciar por el panel. Invalidar la caché del proxy después del cambio de artefacto.
6. Ejecutar `npm run verify:release --prefix frontend` contra `https://armandomora.com.co`, además de navegación directa y desde enlaces, SEO, 404, sesión y una lectura administrativa autorizada. Comprobar que el navegador llama a `https://api.armandomora.com.co/api` y conservar el stderr del release si algo falla.

Recuperación, sin borrar archivos ni revertir MongoDB o Cloudinary:

1. Volver a apuntar frontend y backend a las carpetas del release anterior y reiniciar por el panel.
2. Restaurar código, `.next`, `public` y lockfiles como un conjunto. No mezclar un `.next` nuevo con dependencias antiguas.
3. No restaurar una copia antigua de la base ni borrar recursos de Cloudinary: un fallo de código no debe deshacer ediciones posteriores.
4. Repetir las comprobaciones públicas y de API. No volver a una versión anterior a las correcciones de seguridad del sprint 1 salvo una contingencia documentada.

## Bloqueos y siguiente acción

1. Obtener la excepción del frontend y el entorno efectivo de cPanel para los GET de las 23:19:30Z. Esa es la siguiente acción del incidente abierto.
2. Autorizar un entorno de prueba con MongoDB y Cloudinary, o aceptar que la integración real sigue pendiente.
3. Autorizar la publicación de este candidato antes de la aceptación en el dominio. No se solicita aprobación de un despliegue distinto del que queda descrito aquí.

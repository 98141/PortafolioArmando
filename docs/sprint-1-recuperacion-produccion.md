# Sprint 1 — Recuperación del frontend y recursos SEO

Fecha: 2026-09-29. Horas UTC salvo indicación; Colombia = UTC−05:00.

**Estado: abierto. Los 500 de producción no están solucionados ni tienen todavía una causa raíz demostrada.** Se completó el trabajo independiente: comparación local, ampliación de regresiones, build y validación del artefacto con ambos arranques. No se publicó ni reinició producción. No se avanzó al sprint 2.

**Implementación local validada; aceptación en producción pendiente.** Esta frase se refiere a la ampliación de las verificaciones, no a una reparación funcional de los 500. No se cambió el código de las rutas por una hipótesis.

## 1. Base, instrucciones y cambios preservados

- Repositorio: `C:\Users\Asus ExpertBook\Desktop\Desarrollo_MBT\PortafolioArmando`.
- Rama `main`; HEAD inicial `c1a77f30835d1bd7a8a87788989ded60a1d8517a`.
- Se revisaron estado y diff antes de editar. Existía la marca `M frontend/.env.example`, con contenido igual a HEAD tras normalizar CRLF/LF y sin diff semántico; se preservó sin escribirlo.
- Ya estaban sin seguimiento `.claude/settings.local.json` y los tres informes de auditoría/sprint 0. No se sobrescribieron, añadieron a staging ni publicaron.
- Instrucción aplicable: `frontend/AGENTS.md`. Se leyeron las guías instaladas de Next para custom server, self-hosting, not-found/notFound, robots, sitemap e ImageResponse, antes de editar los verificadores.
- Se leyeron [auditoría](auditoria-produccion-2026-09-29.md), [sprint 0 de producción](sprint-0-diagnostico-produccion.md), [sprint 0 de Cursor](sprint-0-diagnostico-cursor.md) y [deployment](deployment.md). Sus hipótesis no se consideran causas confirmadas.
- `next dev` regeneró automáticamente el bloque de `frontend/AGENTS.md`; al finalizar las pruebas se repuso el texto previo, sin alterar sus instrucciones. No queda un cambio funcional de ese archivo.
- No se imprimieron valores de archivos de entorno, credenciales, cookies o cadenas de conexión. Next leyó sus archivos de entorno al arrancar/construir; las salidas solo mostraron sus nombres.

Huellas iniciales de preservación SHA-256:

| Archivo | SHA-256 |
| --- | --- |
| `frontend/.env.example` | `8109779f536ddeff63c9cd3f559c556dff16bd3f3ce1bcd36698d279a49584d7` |
| `.claude/settings.local.json` | `516b58fcf55aa93a6b802ab5f1ba842e02496c64145fc78cdde5dac01bdef065` |
| `docs/auditoria-produccion-2026-09-29.md` | `520ee1246acbbaf878e5b9b93603ad031b2465edd9ecf2449f559ae575258bde` |
| `docs/sprint-0-diagnostico-produccion.md` | `87097a35f25e3fac2412829e880358efbd9d6da17f2e69a078c6115cd203ea40` |
| `docs/sprint-0-diagnostico-cursor.md` | `8c5d3448bf42280aa908682a07f2f7b3cba215e521a5936621d6431d8d405b54` |

## 2. Revalidación del alojamiento

Lecturas GET sin cookies, sin Authorization, sin seguir redirecciones, timeout de 15 segundos y acceso de red autorizado desde la máquina del operador. Hora de inicio de cada petición, fecha **2026-09-29**. Todos los 500 tienen cuerpo exacto `Internal Server Error`, `Content-Type: text/plain`, 21 bytes y no incluyen `X-Request-Id`. Se abrevian como **ISE** en la tabla. No hubo POST al sitio ni a la API de producción.

| Hora UTC | Método | URL | HTTP | Respuesta relevante |
| --- | --- | --- | --- | --- |
| 21:51:33.987 | GET | https://armandomora.com.co/ | 200 | HTML 58708 bytes; `x-nextjs-cache: STALE` |
| 21:51:34.867 | GET | https://armandomora.com.co/projects | 500 | ISE |
| 21:51:35.031 | GET | https://armandomora.com.co/cybersecurity | 500 | ISE |
| 21:51:35.540 | GET | https://armandomora.com.co/certifications | 500 | ISE |
| 21:51:35.705 | GET | https://armandomora.com.co/education | 500 | ISE |
| 21:51:35.866 | GET | https://armandomora.com.co/blog | 500 | ISE |
| 21:51:36.043 | GET | https://armandomora.com.co/admin/projects/new | 500 | ISE |
| 21:51:36.199 | GET | https://armandomora.com.co/admin/projects/507f1f77bcf86cd799439011/edit | 500 | ISE |
| 21:51:36.369 | GET | https://armandomora.com.co/admin/cyber-labs/507f1f77bcf86cd799439011/edit | 500 | ISE |
| 21:51:36.536 | GET | https://armandomora.com.co/admin/certifications/507f1f77bcf86cd799439011/edit | 500 | ISE |
| 21:51:36.706 | GET | https://armandomora.com.co/admin/education/507f1f77bcf86cd799439011/edit | 500 | ISE |
| 21:51:36.876 | GET | https://armandomora.com.co/admin/blog/507f1f77bcf86cd799439011/edit | 500 | ISE |
| 21:51:37.285 | GET | https://armandomora.com.co/projects/sprint-1-nonexistent-20260929 | 500 | ISE |
| 21:51:37.441 | GET | https://armandomora.com.co/cybersecurity/sprint-1-nonexistent-20260929 | 500 | ISE |
| 21:51:37.608 | GET | https://armandomora.com.co/certifications/sprint-1-nonexistent-20260929 | 500 | ISE |
| 21:51:37.769 | GET | https://armandomora.com.co/education/sprint-1-nonexistent-20260929 | 500 | ISE |
| 21:51:38.018 | GET | https://armandomora.com.co/blog/sprint-1-nonexistent-20260929 | 500 | ISE |
| 21:51:38.194 | GET | https://armandomora.com.co/robots.txt | 500 | ISE |
| 21:51:38.351 | GET | https://armandomora.com.co/sitemap.xml | 500 | ISE |
| 21:51:38.511 | GET | https://armandomora.com.co/rss.xml | 500 | ISE |
| 21:51:38.670 | GET | https://armandomora.com.co/og | 500 | ISE |

Son 21 solicitudes: 1 HTTP 200 y 20 HTTP 500. La ampliación identifica otras cuatro ediciones y otros cuatro detalles afectados respecto de la matriz inicial. El ID de edición se usó para abrir la pantalla anónima; no se afirma que exista un documento con ese ID. Los slugs se usaron solo para lectura, sin crear contenido.

## 3. Causa confirmada y evidencia pendiente

**Causa confirmada de los 500 remotos: ninguna todavía.** Se demuestra la discrepancia de comportamiento, no el defecto que la origina.

| Hallazgo | Evidencia | Clasificación y límite |
| --- | --- | --- |
| Nuevo proyecto falla antes de crear | GET remoto 500; GET local con el build anterior 200 a las 21:52:29.239 UTC | Causa **pendiente**, código/despliegue por distinguir. No se ejecutó el POST `/api/admin/projects` |
| Listados, ediciones y SEO fallan remotamente | Matriz anterior; build local anterior y final responden según contrato | Causa **pendiente**. No atribuir a Node, Passenger, dependencias, permisos o caché sin traza |
| Falta cobertura del arranque personalizado y de rutas en el smoke previo | `with-production.mjs` solo arrancaba next start; el smoke omitía alta, ediciones, detalles/404 y OG | Defecto de **verificación** confirmado y corregido; no es la causa de los 500 |
| Tipos generados locales malformados durante la primera validación | `.next-fixture/dev/types/routes.d.ts:103` contenía texto duplicado; build emitió TS1434/TS1005 y terminó con código 1 | Problema **local de artefacto generado**, resuelto tras regeneración normal por Next dev; origen de la corrupción no establecido. No representa el hosting |

`frontend/server.js:16` ya registra la excepción rechazada por el manejador con `Error al procesar la solicitud:`. Ese texto de respuesta coincide con ISE, pero no demuestra que dicho archivo sea el startup efectivo ni que todas las rutas fallen por lo mismo. `robots.ts` no consulta API/Cloudinary/MongoDB; la disponibilidad de la API desde una terminal no explicaría por sí sola su fallo.

Se solicitaron temprano las excepciones de **Nuevo proyecto, robots y un listado**, junto con versión de Node, raíz y startup file del panel. No se recibieron esas trazas ni se confirmó acceso autorizado disponible al alojamiento durante este trabajo.

### Obtención concreta de las tres trazas

1. En cPanel abrir **Setup Node.js App** (o la aplicación Node equivalente que use el proveedor), seleccionar la app de `armandomora.com.co` y anotar raíz, startup file, modo y versión de Node. No pulsar Restart, Run NPM Install ni guardar cambios.
2. Consultar la ruta de log configurada en esa app y abrirla en modo lectura. Si el panel no muestra dónde está stderr, pedir al proveedor **la salida stderr/stdout de la aplicación y el error log de Passenger/proxy de esa app**; no asumir que todos los proveedores usan el mismo `stderr.log`.
3. Buscar en ±2 minutos alrededor de estas horas, indicando ambas zonas:

| Petición | UTC | Colombia |
| --- | --- | --- |
| `/projects` | 2026-09-29 21:51:34.867 | 2026-09-29 16:51:34.867 |
| `/admin/projects/new` | 2026-09-29 21:51:36.043 | 2026-09-29 16:51:36.043 |
| `/robots.txt` | 2026-09-29 21:51:38.194 | 2026-09-29 16:51:38.194 |

4. Copiar solo fecha/zona, nombre/código/mensaje del error, stack sanitizado, archivo/módulo implicado e identificador de release. Buscar el prefijo indicado y excepciones de Next aunque no tengan ese prefijo. No compartir entorno completo, cookies, cabeceras de autorización ni conexiones privadas.
5. Si no existe registro, confirmar ruta consultada, retención y destino real de stderr con el proveedor. La ausencia de una línea no prueba que la petición no llegó a la app.

**Instrumentación evaluada:** no se modificó `server.js` para añadir logs a ciegas. Ya registra excepciones y todavía no hay evidencia de que sus registros sean inutilizables; podría faltar acceso al destino correcto. Si el proveedor confirma pérdida o insuficiencia, preparar como cambio diagnóstico separado: request ID generado por servidor, hora UTC, fase, código/nombre de excepción y stack sanitizado, sin query, cuerpo, cookies ni entorno. Conservar el 500 y los controles administrativos; no presentar esa instrumentación como solución funcional. Requeriría su propia prueba de redacción de secretos y autorización de despliegue.

## 4. Comparación local y despliegue

| Elemento | Local comprobado | Alojamiento |
| --- | --- | --- |
| Runtime | Node `v24.15.0`, npm `11.12.1`; ejecutable `C:\Program Files\nodejs\node.exe` | No obtenido de ninguno de los dos procesos |
| Directorio de ejecución frontend | `...\PortafolioArmando\frontend`; `server.js` usa `dir: __dirname` y fuerza modo producción | Raíz, cwd, modo y startup efectivos pendientes |
| Arranque | Baseline y build final con `node server.js`; contraste del final con `next start` | Passenger/supervisor y argumentos efectivos pendientes |
| Frontend instalado/lock | Next `16.3.6`, React/React DOM `19.2.4`, coincidentes | Paquetes remotos pendientes |
| Backend instalado/lock | Express `5.2.1`, file-type `22.0.1`, cloudinary `2.10.0`, multer `2.4.0`, mongoose `9.10.2`, coincidentes | Paquetes remotos pendientes. Backend no arrancado ni modificado |
| Build anterior local | BUILD_ID `jDCTCsLmT1RdP4zVN29xb`; baseline por HTTP correcto | No se obtuvo BUILD_ID remoto |
| Build final local | BUILD_ID `ma-KgLi_Nm0sPzaY2UtbI`; 38 entradas del app manifest, todos sus archivos principales presentes | No se comparó `.next/server` remoto ni todo el release |
| Permisos | La ejecución local pudo cargar/renderizar las rutas y leer el artefacto | Faltan usuario efectivo, lectura/recorrido del build y permisos configurados de cachés |
| Red SSR | El proceso local sirvió listados y 404 consultando la API pública; API de terminal también devolvió listas 200 y slugs de prueba 404 | No prueba salida DNS/TLS/HTTP desde el proceso frontend alojado |

Los 12 chunks coincidentes de la auditoría anterior no certifican integridad remota. En este sprint se comprobaron los chunks **servidos por el build local**; no se afirma equivalencia con producción. La existencia de 38 archivos principales del manifest tampoco certifica todas sus dependencias transitivas.

Huellas locales finales SHA-256:

| Archivo | SHA-256 |
| --- | --- |
| `frontend/.next/BUILD_ID` | `2de46f2629ac933f213163f66b3e56546eef7b6ba344186e8486e8f9f1df5c40` |
| `frontend/.next/server/app-paths-manifest.json` | `08bcedfa75a50575b7b09b81191ec8ef0bff87962969ff87f071fbbae2c82146` |
| `frontend/.next/server/app/admin/projects/new/page.js` | `fb0d22d9678ef66c34c40d55c0a557e0a8749915916ac682dc528093f8185d2c` |
| `frontend/.next/server/app/robots.txt/route.js` | `0b07034310d78d0a74dbb731ac65b1f421f70926382eff297481eca58b0cf9c0` |
| `frontend/package-lock.json` | `52c6ce2882124273862934f3a3f00596a2845c0dfe2b926b08f463da39b3bf3b` |
| `backend/package-lock.json` | `784c368e440576fca9077f2afe8a462ad1b4e398db13caf0e16ffead807b2647` |

Para obtener la comparación remota, activar el entorno que el panel asigna a **cada app**, ejecutar `node --version`, `npm --version`, `node -p "process.execPath"`, `pwd`, y `npm ls next react react-dom --depth=0` en frontend; en backend, `npm ls express file-type cloudinary multer mongoose --depth=0`. Contrastar esos resultados con el proceso efectivo indicado por el proveedor: una shell genérica puede usar otro runtime. No volcar `env`, `/proc/.../environ` ni argumentos que puedan contener secretos.

Leer el BUILD_ID y comprobar manifest, chunks de servidor, archivos prerenderizados, lockfiles, configuración y public del release activo con inventario/hash completo; no solo dos archivos. Consultar modos/ACL/propietario y permisos del usuario del proceso, sin `chmod` ni pruebas de escritura. Si una traza apunta a fetch SSR, solicitar una lectura GET pública desde el mismo contexto de ejecución del frontend, registrando solo estado/código de error y duración.

## 5. Cambios realizados y justificación

| Archivo | Cambio |
| --- | --- |
| `frontend/scripts/verify-release.mjs` | Registra hora, GET, URL, estado, tipo y bytes; no sigue redirecciones. Comprueba 8 páginas públicas y canonical, 5 detalles inexistentes confirmados por API, un detalle válido por colección cuando existe, 8 pantallas admin, robots, sitemap, RSS y PNG OG. Conserva controles de seguridad y URLs públicas |
| `frontend/scripts/verify-release.mjs` | Distingue HTML administrativo anónimo de sesión y de escritura; exige pantalla de validación, noindex/no-store y ausencia de formulario visible sin sesión. No hace login ni crea proyectos |
| `frontend/scripts/verify-release.mjs` | Declara `SKIP` e `INCOMPLETE` cuando no hay registros públicos para detalles válidos; `--require-details` convierte esa falta de cobertura en fallo. No inventa contenido ni cambia respuestas de la app |
| `frontend/scripts/verify-public.mjs` | Añade Nuevo proyecto, las cinco pantallas de edición y robots a la suite con API aislada en memoria. Mantiene las pruebas de detalles válidos, 404, errores 500 y feed 503 |
| `frontend/scripts/with-production.mjs` | Opción `--custom-server`: ejecuta `node server.js` con puerto local 3100, detecta su mensaje de arranque y detiene el proceso al terminar. El modo previo next start permanece disponible |
| `frontend/package.json` | Añade `test:release:passenger` para esa comprobación local; el nombre no implica una prueba del supervisor Passenger |
| `.github/workflows/quality.yml` | Añade la comprobación del servidor personalizado al CI después del smoke con next start |
| Este documento | Evidencia, límites, preparación de despliegue/recuperación y matriz posterior |

No se cambiaron rutas, SSR, server.js, proxy, autenticación, cabeceras de la app, canonical, noindex, variables, versiones ni dependencias. Los lockfiles siguen intactos. Uploads, IDs PDF, coordinación de guardado y estados del CV quedan fuera de este sprint.

## 6. Pruebas y resultados

| Comprobación | Resultado y alcance |
| --- | --- |
| Baseline: build existente + `node server.js` | 21:52:28–21:52:29 UTC: cinco listados, alta/edición de proyectos, robots, sitemap, RSS y OG 200; detalle inexistente de proyecto 404. Sin cambios funcionales previos |
| `npm run test:config --prefix frontend` | 34/34 pasaron |
| `npm run test:security --prefix frontend` | 32/32 pasaron. Incluye contrato 404 frente a error de API, sitemap y protección administrativa; simulaciones, no escrituras reales |
| `npm run test:public --prefix frontend` | Repetición completa pasó: alta y 5 ediciones, robots, 5 listados y 5 detalles válidos, 5 detalles 404, errores 500 de API, filtros, paginación, sitemap completo y feed 200/503. API en memoria; next dev |
| Primer intento de test:public | Falló en edición de proyecto con 404 dentro del sandbox. Repetición fuera de sandbox pasó sin cambiar la ruta; no se afirma el mecanismo exacto del fallo transitorio |
| Primer build | Compiló, pero falló TypeScript por tipos generados malformados en `.next-fixture/dev/types/routes.d.ts`. Coincidió con una prueba dev en curso; no se demuestra causalidad de la concurrencia |
| `npm run build --prefix frontend` final | Pasó después de regenerar tipos con Next dev y detener la vista de prueba; generó 28 páginas estáticas. Sin editar manualmente tipos, desactivar TypeScript o borrar cachés |
| `npm run typecheck --prefix frontend` final | Pasó, `tsc --noEmit --incremental false` |
| `npm run lint --prefix frontend` | Pasó; repetido tras los cambios principales, sin errores ni advertencias de ESLint |
| `npm run test:release:passenger --prefix frontend` | Código 0; build final con `node server.js`. GET 22:03:52.603–22:04:00.517 UTC. 5 detalles válidos marcados SKIP por colecciones públicas vacías |
| `npm run test:release --prefix frontend` | Código 0; mismo build con next start. GET 22:04:49.927–22:04:56.952 UTC. Mismos 5 SKIP explícitos |
| Parseo XML adicional, build final + server.js | 22:05:57.768/857 UTC: GET sitemap/RSS 200; `System.Xml.XmlDocument` con resolver externo desactivado parseó raíces `urlset` y `rss` |
| Decodificación OG adicional | 22:05:57.930 UTC: `System.Drawing.Image.FromStream(..., validateImageData:true)` decodificó PNG de 42562 bytes, 1200×630 |
| Navegador con fixture local | Listado `/projects` → enlace Ver detalle → `/projects/fixture-one` mostró el caso de estudio. `/admin/projects` → Nuevo proyecto abrió formulario; recarga directa también. Sesión simulada; no se pulsó Crear proyecto ni se subieron archivos |
| `git diff --check` | Sin errores de whitespace; advertencias Git sobre conversión LF/CRLF separadas de lint |

La primera apertura del navegador ocurrió cuando la prueba automática ya había detenido el servidor y recibió conexión rechazada. Al iniciar explícitamente la vista local `--serve`, la navegación funcionó. No se atribuye ese rechazo al sitio de producción.

En el primer smoke del servidor personalizado, un mensaje del verificador imprimió `canonical undefined` tras extraer la aserción a una función. La aserción validó la URL; se corrigió el mensaje y la ejecución posterior con next start imprimió el canonical correcto. No fue un fallo del canonical de la app.

Los runners HTTP verifican respuestas y contratos; no simulan una sesión real ni navegación del navegador. La prueba de navegador usa next dev y datos en memoria, no el artefacto alojado. Los detalles válidos del **build final** siguen pendientes porque no había muestras públicas; su cobertura con fixture no reemplaza esa aceptación. El smoke de XML comprueba estructura mínima; el parseo adicional de esta ejecución valida XML bien formado. El smoke PNG comprueba firma/IHDR/dimensiones/IEND; la decodificación adicional valida el archivo real.

### Matriz resumida del artefacto local final

Base local `http://127.0.0.1:3100`, métodos GET, fecha 2026-09-29, ventanas registradas arriba. URLs públicas esperadas: `https://armandomora.com.co` y `https://api.armandomora.com.co/api`.

| Recursos | node server.js | next start | Respuesta relevante |
| --- | --- | --- | --- |
| `/`, `/about`, `/contact` y 5 listados | 200 | 200 | HTML, canonical esperado, cabeceras de seguridad |
| Detalle inexistente de cada sección | 404 | 404 | HTML «Página no encontrada»; API confirmó 404 para el mismo slug aleatorio |
| Detalle publicado válido | SKIP, 5 colecciones | SKIP, 5 colecciones | API 200 con listas vacías; no crear contenido para completar la prueba |
| `/admin/login`, `/admin/dashboard`, `/admin/projects/new` | 200 | 200 | noindex/no-store; sesión pendiente en pantallas protegidas |
| Ediciones de projects/cyber-labs/certifications/education/blog | 200 | 200 | HTML anónimo de validación de sesión, no existencia del documento |
| `/robots.txt` | 200 | 200 | text/plain, exclusión admin y sitemap público |
| `/sitemap.xml` | 200 | 200 | application/xml, 8 URLs estáticas públicas |
| `/rss.xml` | 200 | 200 | application/rss+xml, canal blog con origen correcto |
| `/og` | 200 | 200 | image/png, 1200×630 |

## 7. Archivos a integrar y publicación

Integrar en el repositorio los cinco archivos de verificación/CI de la sección 5 y este informe. No añadir `.env.example`, archivos de configuración local, credenciales ni informes ajenos a este cambio. No se hizo stage, commit o push.

**No hay todavía un parche funcional identificado que deba publicarse al hosting para solucionar estos 500.** Publicar únicamente los verificadores no recuperaría las rutas. Este sprint deja preparados los controles; el cambio funcional o de despliegue se decide con la traza.

Si la evidencia exige republicar un release, sus artefactos deben viajar como conjunto: código/configuración frontend, `server.js`, `public/`, `.next/` completo, `package.json`, lockfile y archivos auxiliares que requiera el arranque/configuración. Instalar dependencias en un entorno compatible con el hosting; no copiar node_modules de Windows a Linux. Los scripts de verificación pueden ejecutarse desde el puesto de revisión y no forman parte obligatoria del runtime web. No publicar el backend por defecto para esta incidencia.

## 8. Procedimiento de despliegue y recuperación — preparado, no ejecutado

### Puerta previa obligatoria

Antes de publicar faltan: tres trazas, identificación de la causa, raíz efectiva y nombre de app en panel, ruta del release activo, runtime real, permisos, release candidato y autorización del usuario para **ese despliegue**. No hay rutas remotas inventadas en este informe. Sin esos datos no es posible dar un comando de conmutación remoto exacto; sí se define el orden y los comandos de validación.

| Evidencia futura | Reparación que se prepararía, solo si se demuestra |
| --- | --- |
| Módulo/chunk/build ausente o releases mezclados | Crear candidato coherente, verificar inventario completo y dependencias; no copiar unos chunks aislados sobre la app activa |
| Runtime/paquetes incompatibles según traza | Corregir la selección/instalación en candidato con versiones compatibles y lockfile; probar antes de activarlo |
| EACCES remoto con archivo y usuario identificados | Corregir únicamente propietario/ACL/modos necesarios del recurso señalado; sin permisos globales 777 |
| Fetch SSR remoto falla y ruta realmente depende de API | Corregir DNS/TLS/salida u origen efectivo demostrado; no sustituir error por colección vacía |
| Excepción de aplicación reproducible | Cambio mínimo en la línea responsable, con prueba de regresión específica y nuevo build |

### Preparación del candidato

1. Conservar fuera de cualquier sobrescritura el release activo completo y registrar su BUILD_ID, raíz, startup, runtime y configuración en almacenamiento privado. El activo está averiado: volver a él revierte la intervención, pero **no garantiza recuperación funcional**. Identificar además un release anterior conocido bueno si existe.
2. Preparar una carpeta candidata separada en un entorno del mismo SO/arquitectura que el hosting. Mapear y registrar sus rutas reales antes de ejecutar operaciones. No reutilizar la carpeta activa para npm ci/build.
3. En la raíz `frontend` de esa candidata, con entorno público aprobado y secretos gestionados por el panel, ejecutar secuencialmente:

```sh
node --version
npm --version
npm ci
npm run test:config
npm run test:security
npm run lint
npm run build
npm run typecheck
npm run test:release
npm run test:release:passenger
```

El puerto local 3100 debe estar libre. Estos runners arrancan procesos de prueba; no ejecutarlos sobre un listener de producción ni como sustituto del supervisor del hosting. La prueba con API en memoria `npm run test:public` necesita también las dependencias del backend y debe ejecutarse antes del build, separada de él, en checkout de validación.

4. Exigir detalles válidos en un entorno equivalente con datos de prueba o registros públicos ya existentes. No crearlos en producción para completar este sprint. Comprobar inventario/hash completo, configuración pública incorporada al build y permisos del usuario efectivo. Conservar logs sanitizados y snapshot del candidato para rollback.
5. Solicitar autorización de publicación presentando la causa demostrada, diff, release candidato, pruebas, archivos y rutas exactas de activación/recuperación. No pedir aprobar un cambio hipotético.

### Activación, únicamente después de autorización

1. En la app frontend identificada del panel, registrar los valores actuales y apuntarla a la raíz candidata validada, conservando startup `server.js` **solo si se confirma que es el mecanismo adecuado y actual**. Aplicar únicamente la corrección demostrada; no cambiar modo, versiones, puerto o variables por ensayo.
2. Reiniciar esa app con el mecanismo documentado por el proveedor. No reiniciar backend, tocar MongoDB ni cambiar Cloudinary. No invalidar cachés como intento de reparación; si la causa exige hacerlo, incluir su alcance y mecanismo en la autorización concreta.
3. Ejecutar desde este repositorio, con el artefacto candidato local disponible para las comprobaciones estáticas:

```powershell
npm run verify:release --prefix frontend -- https://armandomora.com.co https://armandomora.com.co https://api.armandomora.com.co/api
```

4. Si existen muestras en las cinco colecciones, añadir `--require-details` al final. De lo contrario, conservar los SKIP como pendientes, no como aceptación completa. El verificador se detiene en el primer fallo; usar la matriz de la sección 9 para registrar el resto y obtener su traza, sin repetir peticiones masivamente.
5. Completar navegación directa y por enlaces en navegador. Validar sesión con una cuenta autorizada sin guardar contenido, distinguiendo pantalla, sesión y escritura. Conservar fecha, método, URL, estado y respuesta relevante por cada caso.

### Recuperación

Si falla un control obligatorio, conservar primero la excepción y el identificador del candidato. En el panel, devolver **la app frontend** a la raíz/startup/configuración registrados del release de recuperación y reiniciar por el mecanismo autorizado. Recuperar source/public/build/lock/dependencias como conjunto; no mezclar archivos individuales. Repetir el GET smoke y registrar si el estado recuperado sigue presentando los fallos originales. No restaurar datos MongoDB ni CV, porque este trabajo no los modifica. No borrar el candidato fallido: preservarlo para diagnóstico. Las rutas y el nombre exacto de la app se completan con evidencia del hosting antes de activar o revertir.

## 9. Matriz de aceptación posterior

| Control | Criterio | Estado actual en producción |
| --- | --- | --- |
| Listados públicos | 200 HTML correcto, canonical HTTPS; directo y por navegación | 500 revalidado, pendiente |
| Detalles existentes | 200 con contenido real y canonical del detalle, cinco secciones | Sin muestras públicas para aceptación completa |
| Detalles inexistentes | HTTP 404 real y página correspondiente, sin enmascarar fallos de API | 500 revalidado, pendiente |
| Nuevo proyecto | Pantalla abre; con sesión válida se ve el formulario, sin POST de creación | GET 500, pendiente |
| Cinco ediciones | Pantalla abre; sesión y existencia de registro se evalúan por separado | GET 500, pendiente |
| Control admin | noindex/no-store, cabeceras de seguridad, API privada rechaza sin sesión | Cubierto localmente; revalidar tras publicar |
| robots | 200 text/plain, sitemap HTTPS, admin excluido | 500, pendiente |
| sitemap | 200 XML bien formado, URLs públicas válidas y completas | 500, pendiente |
| RSS | 200 XML/RSS válido, canal correcto; no feed vacío ficticio ante fallo | 500, pendiente |
| OG | 200 PNG decodificable 1200×630 | 500, pendiente |
| Navegación | Entrada directa y enlaces internos sin error de hidratación/RSC | Muestreo local con fixture; hosting pendiente |
| Causa | Traza correlacionada con release efectivo y corrección demostrada | No recibida, pendiente |

El trabajo independiente está documentado y validado con los límites anteriores. La recuperación remota, la causa y la aceptación del sprint siguen abiertas. Los cambios de uploads/CV pertenecen a sprints posteriores y no se implementaron.

## 10. Estado final del repositorio

HEAD permanece en `c1a77f30835d1bd7a8a87788989ded60a1d8517a`. Se verificó de nuevo que las cinco huellas de preservación de la sección 1 y ambos lockfiles permanecen iguales. El diff de este sprint comprende cinco archivos versionados de verificación/CI y este nuevo informe sin seguimiento; la marca previa de `.env.example` permanece intacta. `frontend/AGENTS.md` no figura modificado. No hubo commit, stage, push ni despliegue. Los procesos locales usados en las pruebas se detuvieron al finalizar.

# Despliegue — actualizado al Sprint 5

## Configuración del release

- Origen público: `https://armandomora.com.co`.
- API: `https://api.armandomora.com.co/api`.
- Node probado: **24.15.0**, npm **11.12.1**. Los dos paquetes admiten Node `>=24.15.0 <25` y npm 11; `.npmrc` rechaza otros runtimes. `.nvmrc` fija la versión de referencia. Instalar actualizaciones de seguridad de Node 24 tras verificarlas y actualizar estos archivos.
- Next.js y eslint-config-next: **16.3.6**, fijados conjuntamente. Usar `npm ci`, que respeta el lockfile; no `npm install` en el servidor.
- El repositorio contiene `frontend/server.js` para Passenger. La configuración real del panel todavía requiere comprobación en el alojamiento.

## Entornos del frontend

Desde `frontend/`, copiar los ejemplos (PowerShell):

```powershell
Copy-Item .env.example .env.development.local
Copy-Item .env.production.example .env.production.local
```

No sobrescribir un archivo existente sin revisar su contenido. Los ejemplos solo contienen variables públicas; nunca poner claves de Cloudinary, JWT o MongoDB en variables `NEXT_PUBLIC_*`.

| Archivo | Uso |
| --- | --- |
| `.env.development.local` | `npm run dev`, API local y sitio local |
| `.env.production.local` | `npm run build`, `npm start` y Passenger; URLs HTTPS públicas |
| `.env.example` | Plantilla de desarrollo versionada |
| `.env.production.example` | Plantilla de producción versionada |

**No usar `.env.local` para valores locales de desarrollo**: Next también lo carga en producción. Las variables del proceso tienen prioridad sobre todos los archivos. Revisar las variables configuradas en el panel/CI si el build rechaza una URL inesperada. El validador en `next.config.ts` rechaza valores ausentes, HTTP, localhost, loopback, credenciales, query/fragment y rutas en el origen del sitio.

Next congela `NEXT_PUBLIC_*` en el JavaScript durante el build. Cambiar una variable y reiniciar no corrige un artefacto ya compilado: **reconstruir y publicar el release completo**. Mantener los mismos valores públicos en build y arranque. `src/lib/publicConfig.ts` centraliza las URLs; el origen del despliegue prevalece sobre un `canonicalBaseUrl` antiguo guardado en el CMS para canonical, Open Graph, JSON-LD, robots, sitemap y RSS.

## Construcción y verificación

Desde la raíz del repositorio:

```powershell
node --version
npm --version
npm ci --prefix backend
npm ci --prefix frontend
npm test --prefix backend
npm run test:config --prefix frontend
npm run test:security --prefix frontend
npm run test:public --prefix frontend
npm run build --prefix frontend
npm run typecheck --prefix frontend
npm run lint --prefix frontend
npm run test:release --prefix frontend
npm run test:performance --prefix frontend
npm audit --prefix frontend
npm audit --prefix backend
```

El lint quedó sin errores ni advertencias en Sprint 4 y se exige junto con las pruebas y el build. No usar opciones para ignorar fallos de TypeScript ni `npm audit fix --force` como parte del despliegue. `test:public` usa una API en memoria y no escribe en producción. `test:release` y `test:performance` arrancan el build existente en el puerto 3100 y lo detienen al terminar; requieren ese puerto libre. La medición comprueba un máximo de 210 KiB de JS y 14 KiB de CSS gzip por página pública, calculado sobre sus archivos iniciales; no mide Core Web Vitals.

`.github/workflows/quality.yml` ejecuta los mismos controles en push, pull request y ejecución manual con Node/npm fijados. No publica ni usa secretos de MongoDB, Cloudinary o Resend. El build y el smoke consultan la API pública HTTPS, por lo que una caída de esa API puede fallar el trabajo. La ejecución remota de Actions debe verificarse después de subir el cambio. Revisar `npm audit` antes de cada entrega; no se aplica una actualización automática de dependencias desde CI.

En una terminal, arrancar el release local:

```powershell
npm start --prefix frontend -- --hostname 127.0.0.1 --port 3100
```

En otra:

```powershell
npm run verify:release --prefix frontend
```

La verificación examina `.next/static/**/*.js`, exige la URL pública de la API y rechaza las URLs locales de la aplicación (puertos 3000/5000). También consulta ocho páginas, canonical, robots, sitemap, RSS y noindex del login. No pretende eliminar cadenas internas de localhost usadas por el framework ni reemplaza pruebas funcionales del panel.

Se pueden especificar otro servidor y las URLs esperadas:

```powershell
npm run verify:release --prefix frontend -- http://127.0.0.1:3200 https://armandomora.com.co https://api.armandomora.com.co/api
```

## Arranque en un servidor Node

- Frontend: directorio `frontend`, `npm start` (`next start`), con `PORT` asignado por el proveedor si aplica.
- Backend: directorio `backend`, `npm start` (`node src/server.js`). En runtime puede instalarse con `npm ci --omit=dev`.
- Instalar el frontend con dependencias de desarrollo para construir. No mezclar `output: standalone` con el `server.js` de Passenger.
- Construir en el servidor o en un entorno compatible con su sistema operativo/arquitectura. No subir `node_modules` de Windows a un servidor Linux.
- Desplegar fuente/configuración, `public/`, `.next/`, package.json y lockfile del mismo release. Mantener el build anterior disponible para rollback. Dar permisos de escritura al caché de `.next` para ISR e imágenes.

## cPanel / Passenger

Si el alojamiento usa Setup Node.js App:

1. Seleccionar Node 24 compatible. Confirmar que el proveedor lo ofrece antes del cambio de producción.
2. Frontend: raíz de aplicación `frontend`, modo Production, URL `https://armandomora.com.co`, startup file **`server.js`**. Este archivo fuerza modo producción y termina con error si Next o el listener no arrancan.
3. Configurar las tres variables públicas del ejemplo de producción. Revisar que el panel no conserve HTTP o localhost. No fijar un puerto que contradiga el asignado por Passenger.
4. Activar el entorno Node del panel, instalar con `npm ci` y ejecutar `npm run build` en la nueva carpeta del release. Conservar los logs.
5. Backend: raíz `backend`, startup file **`src/server.js`**, modo Production, variables privadas en el panel. Ejecutar `npm ci --omit=dev`.
6. Activar/reiniciar ambas aplicaciones con el mecanismo del panel. Invalidar el caché del proxy/CDN tras cambiar el artefacto.
7. Comprobar páginas, chunks servidos y API según la siguiente sección. El smoke local de `node server.js` valida el bootstrap de Node; no simula la integración de Passenger en el hosting.

## Variables del backend

Usar `backend/.env.example` como inventario, no como configuración de producción. Nunca publicar ni incluir en un archivo de release los secretos reales.

| Variable | Producción |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | El asignado por el alojamiento |
| `MONGO_URI` | Conexión privada a MongoDB |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Secretos distintos, seguros |
| `FRONTEND_URL` | `https://armandomora.com.co` (origen exacto para CORS) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales privadas del backend |
| `COOKIE_SECURE` | `true` con HTTPS |
| `COOKIE_SAME_SITE` | `lax` para los dos subdominios HTTPS actuales |
| `TRUST_PROXY` | `0` por defecto; `1` solo detrás de un proxy controlado y confirmado |
| `ALLOW_REGISTER_ADMIN` | `false` |
| `ALLOWED_CANONICAL_HOSTS` | `armandomora.com.co` |

Sprint 1 mantiene cookies host-only en la API y valida la sesión mediante `/api/auth/me`. Al publicar, todos los administradores deberán iniciar sesión de nuevo: las sesiones anteriores no incluyen `sid`. Usar `FRONTEND_URL=https://armandomora.com.co` sin slash final; toda escritura requiere la cabecera Origin exacta. Verificar secretos JWT distintos y de al menos 32 caracteres. Publicar backend y frontend como un release coordinado; probar login, recarga del panel, expiración/refresh, upload y logout en un navegador real.

## Validación después de publicar

- `GET https://api.armandomora.com.co/api/health` debe responder 200: comprueba el proceso. `GET /api/ready` debe responder 200 y `data.ready=true`: comprueba la conexión y un ping a MongoDB. Devuelve 503 ante desconexión, error, espera mayor de 1 segundo o cierre en curso. Ambas respuestas usan `no-store`; los pings se agrupan y su resultado se conserva internamente hasta 5 segundos para limitar carga. Confirmar además una lectura autenticada; el ping no valida permisos de todas las colecciones, Cloudinary ni Resend.
- Verificar canonical y Open Graph HTTPS en las ocho páginas públicas; `/robots.txt` debe anunciar `https://armandomora.com.co/sitemap.xml`.
- Verificar `/sitemap.xml` y `/rss.xml`; ninguna URL debe contener localhost ni el dominio antiguo `.dev`.
- Abrir una página en navegador y revisar las peticiones: la API debe ser `https://api.armandomora.com.co/api`. Inspeccionar los chunks **realmente servidos** después de invalidar caché.
- En el proxy/panel configurar redirección permanente de HTTP y `www` a `https://armandomora.com.co`, preservando ruta y query. Las etiquetas canonical no sustituyen esa redirección. Evitar reglas basadas en cabeceras reenviadas no confiables. Verificar que no haya bucles y que el certificado cubra los hosts usados.
- Verificar login, recarga del panel, refresh con acceso expirado, uploads y logout entre los subdominios HTTPS. Confirmar que las cookies sean HttpOnly, Secure, host-only y que no haya bucles al login. La página admin sin sesión devuelve la estructura de validación; la API privada debe devolver 401/403.
- El sitemap recorre todas las páginas con `limit=50` y usa las fechas de actualización del CMS. La API debe estar accesible durante el build y durante la ejecución SSR. Si falla una página, no se publica un sitemap parcial. Revisar caché/revalidación (120 segundos).
- Configurar Resend siguiendo [contacto directo](contact-resend.md): `RESEND_API_KEY`, `CONTACT_FROM` autorizado y `CONTACT_TO=armandomora14115@gmail.com`, solo en el backend. Verificar aceptación, entrega y Reply-To con un envío propio después de publicar.

## Rollback

1. Antes de publicar, conservar la carpeta/artefacto del release anterior y una copia segura de su configuración en el alojamiento. Registrar commit, versiones de Node/npm y fecha del build.
2. Si falla el smoke, volver a apuntar la aplicación a la carpeta anterior y restaurar las variables correspondientes; reiniciar mediante el panel y limpiar caché del proxy/CDN.
3. Restaurar código, `.next`, archivos públicos y lockfiles como un conjunto. Si se reconstruye, usar `npm ci` con el lockfile y el runtime correspondientes; nunca mezclar `.next` nuevo con dependencias antiguas.
4. Repetir el smoke público y la comprobación de API. Elegir un release conocido y validado. No retroceder a versiones anteriores a las correcciones de seguridad de Sprint 1 salvo contingencia temporal documentada.

Sprint 1 añade `sessionId` opcional a User, sin migración destructiva ni cambio de credenciales; los nuevos logins lo generan. Al hacer rollback se pierde la revocación de acceso por sid: no restaurar una versión antigua salvo contingencia documentada. El despliegue y las redirecciones del alojamiento deben comprobarse allí antes de declarar cerrada la validación de producción.

## Operación y recuperación

- Configurar en el alojamiento un monitor de `/api/ready` cada 60 segundos y alertar tras tres fallos consecutivos. Usar `/api/health` para distinguir un proceso caído de un problema de base de datos; evitar reiniciar continuamente una aplicación solo porque MongoDB esté caído. Estos monitores no quedan activados por este repositorio.
- Al recibir SIGTERM/SIGINT, el backend deja de aceptar conexiones, termina peticiones activas y desconecta MongoDB. El límite total es de 10 segundos; si lo supera, fuerza el cierre y termina con código 1. Configurar el supervisor con una gracia mayor de 10 segundos y verificar su señal real de parada en Passenger/hosting. Un cierre forzado de Windows no ejecuta este protocolo. No se ha probado aún con el supervisor de producción.
- Consultar logs por `request-id`, estado HTTP y duración; revisar errores 5xx, límites 429, rechazos de Resend y errores de limpieza de archivos. No registrar cuerpos de contacto, contraseñas, cookies ni variables privadas. Ajustar rotación/retención en el alojamiento y conservar el identificador de release en el registro de cada publicación.
- Antes de publicar, verificar la última copia de MongoDB y su fecha, y conservar una copia cifrada de las variables privadas fuera del repositorio. Propuesta inicial: copia diaria de base de datos, retención de 7 diarias y 4 semanales; confirmar capacidad y retención real del proveedor. El código no crea ni verifica estas copias.
- MongoDB guarda referencias a Cloudinary, no sustituye una copia de los archivos. Conservar los originales de imágenes y CV o comprobar el mecanismo de copia/restauración del proveedor. Registrar los recursos nuevos de cada release antes de cualquier limpieza.
- Ensayar una restauración en una base separada con credenciales de prueba y correo desactivado. Verificar conteos, un proyecto, un artículo, ajustes, referencias de archivos y acceso al panel. Registrar fecha, duración y resultado antes de afirmar que existe recuperación probada. Nunca restaurar sobre la base activa para ensayar.
- Para rollback de este sprint no hay migración de datos. Recuperar frontend y backend del mismo release, repetir disponibilidad, navegación y sesión, y revisar las causas antes de reintentar. No restaurar datos antiguos por un simple fallo de código: se perderían las ediciones posteriores.

Referencias de implementación: [cierre HTTP en Node 24](https://nodejs.org/docs/latest-v24.x/api/http.html#serverclosecallback), [setup-node](https://github.com/actions/setup-node) y [checkout](https://github.com/actions/checkout).

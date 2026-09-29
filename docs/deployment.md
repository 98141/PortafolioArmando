# Despliegue — Sprint 0

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
npm run test:smoke --prefix backend
npm run verify:uploads --prefix backend
npm run test:config --prefix frontend
npm run build --prefix frontend
npm run typecheck --prefix frontend
npm run lint --prefix frontend
npm audit --prefix frontend
npm audit --prefix backend
```

El lint mantiene deuda previa documentada en `docs/sprint-0.md`. Un build correcto no implica que el lint esté resuelto. No usar opciones para ignorar fallos de TypeScript ni `npm audit fix --force` como parte del despliegue.

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
| `COOKIE_SAME_SITE` | Según la arquitectura de autenticación; no cambiar por ensayo |
| `ALLOW_REGISTER_ADMIN` | `false` |
| `ALLOWED_CANONICAL_HOSTS` | `armandomora.com.co` |

La autenticación con cookies entre el frontend y el subdominio API tiene una incidencia detectada que corresponde al Sprint 1. Cambiar SameSite por sí solo no resuelve el alcance host-only de la cookie ni la validación del proxy del frontend.

## Validación después de publicar

- `GET https://api.armandomora.com.co/api/health` debe responder 200 y confirmar conexión de base de datos.
- Verificar canonical y Open Graph HTTPS en las ocho páginas públicas; `/robots.txt` debe anunciar `https://armandomora.com.co/sitemap.xml`.
- Verificar `/sitemap.xml` y `/rss.xml`; ninguna URL debe contener localhost ni el dominio antiguo `.dev`.
- Abrir una página en navegador y revisar las peticiones: la API debe ser `https://api.armandomora.com.co/api`. Inspeccionar los chunks **realmente servidos** después de invalidar caché.
- En el proxy/panel configurar redirección permanente de HTTP y `www` a `https://armandomora.com.co`, preservando ruta y query. Las etiquetas canonical no sustituyen esa redirección. Evitar reglas basadas en cabeceras reenviadas no confiables. Verificar que no haya bucles y que el certificado cubra los hosts usados.
- Verificar login, panel y cierre de sesión; conservar evidencia de la incidencia pendiente del Sprint 1.
- La paginación del sitemap (ahora solicita `limit=200`) sigue pendiente del Sprint 2. Este sprint corrige su origen, no garantiza cobertura dinámica completa.

## Rollback

1. Antes de publicar, conservar la carpeta/artefacto del release anterior y una copia segura de su configuración en el alojamiento. Registrar commit, versiones de Node/npm y fecha del build.
2. Si falla el smoke, volver a apuntar la aplicación a la carpeta anterior y restaurar las variables correspondientes; reiniciar mediante el panel y limpiar caché del proxy/CDN.
3. Restaurar código, `.next`, archivos públicos y lockfiles como un conjunto. Si se reconstruye, usar `npm ci` con el lockfile y el runtime correspondientes; nunca mezclar `.next` nuevo con dependencias antiguas.
4. Repetir el smoke público y la comprobación de API. El release anterior contiene vulnerabilidades conocidas: usarlo solo como contingencia temporal, registrar la incidencia y preparar un release corregido.

Sprint 0 no realiza migraciones de base de datos ni cambia credenciales. El despliegue y las redirecciones del alojamiento deben comprobarse allí antes de declarar cerrada la validación de producción.

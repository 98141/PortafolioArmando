# Sprint 0 — Base reproducible de despliegue

Fecha: 2026-09-28. Estado: implementado y validado localmente. Publicación y validación en el alojamiento pendientes.

## Cambios

- Corregido `npm start` del frontend: se eliminó `--open`, que impedía arrancar Next.
- Runtime de referencia Node 24.15.0 / npm 11.12.1, con `.nvmrc`, `engines` y `engine-strict` en ambos paquetes. Se permiten parches posteriores de Node 24, previa validación.
- Separación de desarrollo (`.env.development.local`) y producción (`.env.production.local`), con ejemplos versionados. En esta copia de trabajo se movieron los antiguos `.env.local` y `.env` a esos archivos, respectivamente; las URLs de producción se corrigieron a HTTPS. Los archivos reales siguen ignorados por Git.
- Validación durante build y arranque de producción: falla ante valores ausentes, HTTP, localhost/loopback, credenciales o componentes indebidos de URL.
- Una configuración pública compartida para API y origen. Canonical, Open Graph, JSON-LD, robots, sitemap y RSS utilizan `https://armandomora.com.co`; el dominio antiguo del CMS ya no prevalece sobre el despliegue.
- API pública `https://api.armandomora.com.co/api` usada también en uploads y lecturas del servidor.
- Bootstrap CommonJS de Passenger en modo producción, tratamiento explícito de errores de arranque/solicitud y eliminación de `url.parse()` obsoleto. Excepción ESLint limitada a los imports CommonJS de este archivo.
- Pruebas de configuración y verificador de release reutilizables. Guía de instalación, build, arranque, Passenger, comprobación de producción y rollback en [deployment.md](deployment.md).

## Dependencias

| Dependencia directa | Antes | Después |
| --- | --- | --- |
| Next.js / eslint-config-next | 16.2.6 | 16.3.6 |
| Axios | 1.16.1 | 1.20.0 |
| Mongoose | 9.6.2 | 9.10.2 |
| Morgan | 1.10.1 | 1.12.1 |
| Multer | 2.1.1 | 2.4.0 |

Los lockfiles incluyen las correcciones transitivas compatibles de Sharp, PostCSS, form-data, nanoid, js-yaml, brace-expansion, body-parser, qs e ip-address, entre otras. No se actualizaron las versiones mayores de React, ESLint, TypeScript ni Framer Motion. No se usó `--force`.

Auditoría completa de npm al instalar desde los lockfiles: **0 vulnerabilidades en frontend y 0 en backend**, frente a 10 y 7 en la auditoría inicial. Esto describe los avisos conocidos por npm a la fecha, no certifica la seguridad funcional del sistema.

## Verificación ejecutada

| Comprobación | Resultado |
| --- | --- |
| `npm ci` frontend y backend | Correcto, ambos lockfiles reproducibles en Windows / Node 24.15.0 |
| `npm ls --depth=0` | Código 0 en ambos, sin dependencias faltantes ni inválidas; observación de opcionales debajo |
| `npm run test:config` | 34 pruebas correctas |
| Build real con override `NEXT_PUBLIC_API_URL=http://localhost:5000/api` | Rechazado antes de compilar, como se esperaba |
| `npm run build` después de la instalación limpia | Correcto, 27 páginas estáticas generadas |
| `npm run typecheck` | Correcto |
| `npm start -- --hostname 127.0.0.1 --port 3100` | Arranque y verificación HTTP correctos |
| `npm run start:passenger` / `node server.js`, puerto 3200 | Arranque y verificación HTTP correctos |
| Verificador de release | Ocho páginas 200 con canonical correcto; robots, sitemap de ocho URLs, RSS y noindex del login correctos |
| JavaScript compilado y 22 chunks servidos por HTTP | API HTTPS presente; sin URLs locales de la aplicación en puertos 3000/5000 |
| `npm run test:smoke` backend | Validaciones de entorno y canonical correctas |
| `npm run verify:uploads` backend | 7 comprobaciones correctas |
| ESLint de scripts nuevos, configuración y bootstrap | Correcto |
| ESLint global | **35 errores y 10 advertencias**, inventariados en [sprint-0-lint.json](sprint-0-lint.json) |
| `git diff --check` | Correcto |

El lint mantiene 23 errores de `set-state-in-effect` y 12 de `error-boundaries`. Las diez advertencias incluyen hooks, compatibilidad con bibliotecas, una variable sin uso y una regla de navegación agregada por la actualización de Next. Los tres errores anteriores de imports CommonJS se resolvieron mediante una excepción específica para el bootstrap; no se desactivaron las reglas del resto de la aplicación.

Tras `npm ci`, npm 11 en este Windows sigue mostrando seis paquetes auxiliares WASM como `extraneous` (`@emnapi/*`, `@img/sharp-wasm32`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`). Se conserva esta observación: no impidió instalación, auditoría, build ni arranque. No se añadieron como dependencias directas para ocultar el aviso. Validar el lockfile también en el sistema operativo del alojamiento.

## Pendiente de producción y límites

- No se publicó este release ni se modificó el panel de hosting, DNS, certificados, secretos o base de datos. Confirmar el proveedor, Node 24 disponible y el procedimiento real antes de activar el release.
- Verificar en el alojamiento las redirecciones HTTP y `www`, los chunks realmente servidos y el comportamiento de Passenger. Las pruebas locales no simulan Passenger ni su proxy TLS.
- Las pruebas del backend no conectaron una base de datos de producción ni ejercitaron login, CRUD o Cloudinary reales. El smoke de uploads valida utilidades; no sustituye una carga HTTP autenticada.
- Sprint 1: autenticación entre subdominios, cookies/proxy, JSON-LD seguro y manejo de archivos, según la auditoría.
- Sprint 2 y posteriores: errores de lint, datos de ejemplo, contacto, estados SSR y paginación del sitemap. El origen del sitemap está corregido, pero sus solicitudes `limit=200` todavía requieren el arreglo funcional planificado.

Los servidores temporales utilizados para las pruebas se detuvieron. La configuración local preexistente de `.claude` se conservó.

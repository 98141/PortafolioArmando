# Sprint 5 — Rendimiento y preparación operativa

Fecha: 29-09-2026. Implementado y verificado localmente; sin despliegue, cambios en la base de datos real ni correos enviados.

## Resultado

- React Query se carga dentro del layout administrativo. Las páginas públicas ya no descargan ese proveedor.
- Portada, especialidades, llamada a contacto, tarjetas y artículos se renderizan en el servidor cuando no necesitan interacción. Se retiró Framer Motion y sus dependencias; estas secciones ya partían visibles desde Sprint 4. Se conservan estilos, enlaces y transiciones CSS con movimiento reducido.
- Markdown se procesa en el servidor en los artículos públicos. La vista previa del editor sigue disponible dentro del árbol cliente del panel.
- Ajustes públicos compartidos con `React.cache` durante el render. Los ajustes y los contadores de portada comienzan a solicitarse en paralelo; se conserva la revalidación de 120 segundos.
- API con `/api/health` para liveness y `/api/ready` para disponibilidad de MongoDB. Readiness devuelve 503 ante desconexión, error, espera agotada o cierre en curso. Ping limitado a 1 segundo, solicitudes concurrentes agrupadas y resultado interno retenido hasta 5 segundos. Las respuestas usan `no-store`; los probes no consumen la cuota global de visitantes ni exponen detalles privados.
- Cierre por SIGTERM/SIGINT: dejar de aceptar conexiones, completar peticiones activas y desconectar MongoDB. Se cierran también conexiones persistentes que quedan libres después de terminar una respuesta. Límite total de 10 segundos con salida 1 si se agota; las señales repetidas no duplican el cierre.
- Workflow de GitHub Actions con instalaciones por lockfile, pruebas, lint, compilación, comprobaciones del release y presupuesto de JS/CSS. Configurado para push, pull request y ejecución manual, sin publicación automática ni credenciales privadas. Pendiente de ejecución remota tras subir el cambio.
- [Guía de despliegue](deployment.md) actualizada con monitorización propuesta, parada del supervisor, copias, restauración y rollback. La guía distingue lo implementado de lo que todavía necesita configuración en el alojamiento.

## Medición reproducible

Comparación del build local previo de Sprint 4 con el build final, ambos servidos mediante `next start` con Node 24.15.0 y las mismas URLs públicas. Se suma el tamaño gzip calculado por archivo JS externo referenciado en el HTML inicial de cada ruta; los archivos repetidos se cuentan una sola vez dentro de cada ruta. Incluye el runtime de Next/React.

| Ruta | Antes, KiB gzip JS | Después, KiB gzip JS | Reducción |
| --- | ---: | ---: | ---: |
| `/` | 248,8 | 195,9 | 21,2 % |
| `/about` | 199,9 | 190,5 | 4,7 % |
| `/projects` | 210,0 | 196,7 | 6,3 % |
| `/blog` | 210,0 | 197,1 | 6,1 % |
| `/contact` | 201,8 | 192,4 | 4,7 % |
| `/cybersecurity` | 210,0 | 197,1 | 6,1 % |
| `/certifications` | 210,0 | 197,1 | 6,1 % |
| `/education` | 210,0 | 197,1 | 6,1 % |

CSS: 10,8 KiB gzip por página antes y después. Evidencia en [medición inicial](sprint-5-before.json) y [medición final](sprint-5-after.json), con tamaños sin comprimir y HTML. Los porcentajes usan bytes originales, antes del redondeo.

No son mediciones de transferencia de un navegador ni de Lighthouse/Core Web Vitals. Excluyen imágenes, cabeceras, chunks cargados posteriormente y prefetch; incluyen todos los scripts externos presentes, aunque un navegador concreto pudiera omitir alguno. No se cuantificó la mejora de los detalles de artículos porque el catálogo público consultado no tenía artículos publicados. Las pruebas con contenido usan fixtures separados.

Después de compilar, con el puerto 3100 libre:

```sh
npm run test:release --prefix frontend
npm run test:performance --prefix frontend
node frontend/scripts/with-production.mjs scripts/measure-public.mjs ../docs/medicion-local.json --check
```

Los scripts inician y detienen su propio servidor. Los presupuestos iniciales son 210 KiB de JS y 14 KiB de CSS gzip por ruta, con margen sobre lo observado. Si fallan, revisar el cambio de dependencias/contenido antes de ampliar el presupuesto. El build y las comprobaciones de release leen la API pública HTTPS; requieren su disponibilidad.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| Backend | 49/49 pruebas; además 2 smoke y 7 comprobaciones de uploads |
| Operación | 7 pruebas nuevas: liveness sin DB, concurrencia/caché, desconexión/cierre, recuperación sin filtrar errores, ping bloqueado, drenaje de una petición real, límite forzado y error al desconectar (algunas agrupadas) |
| Frontend seguridad | 28/28 |
| Configuración de producción | 34/34 |
| Lint / TypeScript / build | Sin errores ni advertencias de lint; tipos y compilación correctos |
| Fixtures públicos | HTML, contenido Markdown inicial, estados 404/500, filtros, paginación, caso de estudio, perfil CMS, imagen social, sitemap completo y RSS 200/503 correctos |
| Build servido | Ocho rutas, canonical, 14 chunks únicos, cabeceras, robots, sitemap, RSS y protección administrativa correctos |
| Presupuestos | Ocho rutas dentro de JS/CSS permitidos |
| `npm audit --omit=dev` | 0 vulnerabilidades reportadas en ambos paquetes al ejecutar esta revisión |
| Navegador | Panel de proyectos carga sesión y tabla; portada visible con métricas; artículo muestra título y Markdown |

Se corrigió un fallo detectado por la prueba de drenaje: una conexión keep-alive podía quedar esperando después de completar la respuesta. La repetición específica y la suite completa pasaron tras cerrar las conexiones que quedaban libres.

![Portada con contenido de prueba después de la optimización](evidence/sprint-5-home.png)

## Pendientes de lanzamiento

No se ejecutó Actions en GitHub ni se activaron monitores, copias o reglas del alojamiento. El cierre se probó con HTTP local y conexiones MongoDB simuladas; falta comprobar la señal y la gracia real del supervisor. El ping no acredita permisos sobre todas las colecciones ni disponibilidad de Resend/Cloudinary.

El siguiente paso es el cierre de lanzamiento: comprobar el release en el alojamiento, redirecciones HTTPS, sesión entre subdominios, recuperación y configuración/entrega de [Resend](contact-resend.md). También corresponde completar y publicar desde el panel el caso de Tejiendo Raíces cuando esté listo. Las métricas de usuarios reales deben recogerse después del despliegue con contenido e imágenes definitivos.

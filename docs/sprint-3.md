# Sprint 3 — Contenido, casos de estudio y SEO

Fecha: 29-09-2026. Implementado y validado localmente. Sin despliegue ni escritura en la base de datos de producción.

## Cambios

- Los proyectos admiten un caso de estudio con participación, problema, solución, arquitectura y resultados. Los retos y aprendizajes existentes también aparecen en el detalle. Los campos vacíos se omiten; los proyectos antiguos siguen siendo válidos sin migración.
- El panel permite añadir, ordenar y quitar hasta 12 capturas con descripción. Conserva las referencias de imágenes existentes. Cloudinary se muestra como imagen; otras URL HTTP(S) se presentan como enlaces. No se añadieron cargas múltiples de archivos: la galería recibe URL, y la portada conserva su cargador de Cloudinary.
- Nuevo proyecto ofrece **Empezar con Tejiendo Raíces**. Precarga un ejemplo breve con MERN, Wompi y el enlace aportado por el propietario. Abre oculto (`isActive: false`), sin repositorios, fechas, métricas ni capturas inventadas. Abrirlo no crea registros: se guarda al pulsar Crear proyecto.
- Nombre, título, presentación y biografía del panel se reflejan en la portada y Sobre mí; contacto, footer y datos Person comparten el perfil y las redes configuradas. Se retiraron cuentas sociales de respaldo no confirmadas, barras de nivel arbitrarias y el enlace de CV cuando no existe uno configurado. Una lista de redes explícitamente vacía se respeta.
- Imagen social de respaldo en `/og`, PNG de 1200 × 630 con el perfil. Se prioriza una imagen HTTP(S) configurada antes de usarla. Los artículos incluyen metadata Open Graph de artículo; los cinco tipos de detalle incluyen BreadcrumbList. El emisor de una credencial usa Organization y no se inventa autor para artículos sin autor.
- Corregida la actualización parcial de proyectos: los valores predeterminados de creación ya no reinician estado, visibilidad, prioridad, tecnologías o galería cuando un PATCH omite esos campos. Vaciar el subtítulo, descripción larga o portada desde el formulario también se conserva al guardar.
- El servidor de fixtures usa `.next/fixture` para coexistir con el servidor de desarrollo habitual. Nunca usa MongoDB, Cloudinary o Resend reales.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| TypeScript y ESLint | Correctos; lint sin errores ni advertencias |
| Frontend, configuración | 34/34 |
| Frontend, seguridad y contenido | 24/24; incluye 7 pruebas nuevas |
| Backend | 2 smoke, 7 comprobaciones de uploads y 42 pruebas; incluye 4 nuevas |
| Integración HTTP con fixtures | HTML inicial, 404/500, filtros, paginación, sitemap de 67 URLs, RSS 200/503; casos completos y antiguos, perfil CMS, metadata y PNG 1200 × 630 |
| Navegador, administración | Borrador precargado y oculto; captura sin descripción bloquea el guardado; completar descripción permite crear y volver a editar conservando caso y galería |
| Navegador, detalle | Presentación revisada; a 390 px el ancho del documento fue 375 px, sin desbordamiento horizontal en esa vista |
| Navegador, imagen social | PNG legible con nombre y título del perfil de prueba |
| Build de producción | Compilación correcta con acceso de lectura a API pública |
| Build servido localmente | 8 páginas 200 y canonical correcto; 15 chunks con API de producción; robots, sitemap de 8 rutas, RSS, cabeceras y admin noindex/no-store; PNG social correcto |

La API pública usada en el build no tenía registros publicados; la verificación con contenido se realizó con fixtures. La prueba de creación del navegador guardó exclusivamente en memoria local. Los servidores de prueba se detuvieron; se conservó el servidor de desarrollo del usuario.

Evidencias: [lint](sprint-3-lint.json), [captura del panel de prueba](evidence/sprint-3-admin.png), [guía de Tejiendo Raíces](tejiendo-raices.md).

## Activación y pendientes

Publicar backend y frontend juntos para habilitar los campos nuevos. Después cargar el ejemplo desde el panel, revisar el contenido y activar visibilidad con estado Completado. La caché pública se revalida cada 120 segundos; un cambio puede tardar en aparecer. No se publicó automáticamente ningún proyecto.

El texto de Tejiendo Raíces procede de la descripción del propietario. El enlace público respondió al consultarlo; no se comprobaron compras, pagos, seguridad o implementación interna de esa tienda. Añadir después capturas autorizadas, responsabilidades precisas, decisiones técnicas, fechas y resultados verificables.

Las áreas y tecnologías estáticas de Sobre mí aún requieren revisión editorial del propietario. Este sprint no sustituye la revisión completa de accesibilidad, responsive y rendimiento prevista para los siguientes sprints. La activación y entrega real de Resend sigue pendiente según [la guía existente](contact-resend.md).

Referencias de datos estructurados: [BreadcrumbList](https://schema.org/BreadcrumbList) y [recognizedBy](https://schema.org/recognizedBy).

# Sprint 2 — Datos públicos y contacto funcional

Fecha: 29-09-2026. Implementación validada localmente. **Sin despliegue ni envío real de correo**. La activación de Resend requiere configurar la cuenta y las variables privadas del backend.

## Resultado

- Proyectos, laboratorios, certificaciones, educación y blog obtienen su primera página en el servidor. Los filtros GET, búsqueda, etiqueta del blog y paginación quedan en la URL y funcionan con navegación del navegador. Los filtros muestran estado de búsqueda; las listas distinguen vacío de fallo del servicio.
- Se retiraron los componentes que sustituían fallos de API por proyectos, certificados, formación o artículos de demostración. La portada usa el mismo acceso a datos y tarjetas. Sus contadores ahora proceden del total público de cada colección; si la consulta falla se omite ese contador.
- Los cinco tipos de detalle usan una lectura compartida entre metadata y contenido. Un 404 de API produce un 404 de página; errores de red o 5xx producen error de servicio. El blog entrega el artículo en el HTML inicial. Se retiró el loading global para evitar confirmar un 200 antes de comprobar la existencia del detalle.
- El sitemap recorre páginas de 50 registros, incluye la última página parcial, elimina slugs repetidos y usa `updatedAt` cuando existe. Una consulta fallida no se convierte en un sitemap parcial. Las páginas estáticas no reciben fechas de modificación inventadas. RSS conserva hasta 50 artículos y responde 503 cuando no puede obtenerlos, en lugar de simular un feed vacío.
- Contacto implementado con Resend desde Express. Destino solicitado: `armandomora14115@gmail.com`; remitente configurable solo en el backend y Reply-To del visitante. Validación, honeypot, límite de intentos, timeout, estados de envío/error y conservación del mensaje al fallar. La confirmación solo aparece tras aceptación por el proveedor. Sin nuevas dependencias.
- Listas y edición del panel usan consultas por recurso, usuario, filtros e ID. Los filtros reinician la página en el evento del usuario; respuestas antiguas no sobrescriben el resultado de otra consulta. Las ediciones y ajustes no muestran formularios vacíos para guardar si falla su lectura. Los ajustes ejecutan su esquema Zod y confirman el guardado. Las suscripciones de formularios usan `useWatch`.
- QueryClient pertenece a la instancia del proveedor React; las nuevas consultas administrativas esperan sesión y no conservan su caché al quedar inactivas. Se corrigió el correo de respaldo del perfil/footer con el Gmail indicado por el usuario.

## Evidencia de validación

| Comprobación | Resultado |
| --- | --- |
| `npm run typecheck --prefix frontend` | Correcto |
| `npm run lint --prefix frontend` | 0 errores, 0 advertencias; antes 35 y 9 |
| `npm run build --prefix frontend` | Correcto, con acceso de lectura a la API pública |
| `npm run test:config --prefix frontend` | 34/34 |
| `npm run test:security --prefix frontend` | 17/17, incluye 5 pruebas nuevas de datos públicos |
| `npm test --prefix backend` | 2 smoke, 7 verificaciones de upload y 38 pruebas, todas correctas; incluye 6 pruebas nuevas de contacto |
| `node frontend/scripts/verify-public.mjs` | Catálogos y detalles con contenido en HTML inicial, 404/500 reales, filtros, segunda página, vacío, sitemap de 67 URLs y RSS 200/503 |
| Build servido con `next start` en localhost:3100 | 8 páginas HTTP 200 y canonical correcto, 15 chunks servidos sin URLs locales de aplicación, robots, sitemap, RSS, cabeceras y admin noindex/no-store |
| Detalles inexistentes en build de producción local, con User-Agent de navegador | 404 en proyectos, laboratorios, certificaciones, educación y blog |
| Navegador con proveedor local simulado | Contacto aceptado y campos limpiados; rechazo conserva mensaje; filtros pasan por “Buscando…” y muestran vacío con URL actualizada |
| Navegador a 390 px | Formulario y filtros sin desbordamiento horizontal en las vistas comprobadas |
| Ajustes en navegador con sesión de fixture | Email inválido bloquea envío; valor válido confirma guardado en memoria local |

Fixtures: 55 proyectos y un registro de cada otro tipo, solo en el proceso local de pruebas. Los tests no conectan MongoDB, Cloudinary ni Resend reales. La API pública actual devolvió colecciones vacías; por eso el sitemap del build con esa API contiene las ocho rutas estáticas. La cobertura con registros se comprobó con fixtures.

La primera compilación bajo red restringida falló al consultar el sitemap. Tras comprobar la API con acceso de red, la compilación final y el smoke sirviendo ese build pasaron. El proceso de build **requiere acceso a la API**; no se oculta su fallo publicando un sitemap incompleto. Todos los servidores de prueba se detuvieron.

Inventario de lint: [sprint-2-lint.json](sprint-2-lint.json).

## Activación y límites

1. Seguir [la guía de Resend](contact-resend.md): verificar dominio, crear API key de envío y configurar `RESEND_API_KEY`, `CONTACT_FROM` y `CONTACT_TO` en el backend.
2. Publicar backend y frontend y realizar un envío propio. HTTP 202 confirma aceptación de Resend, no entrega en Gmail; revisar eventos del proveedor, bandeja y Reply-To. Esta validación externa sigue pendiente.
3. Confirmar en el alojamiento el acceso de salida HTTPS a Resend/API, Origin, proxy y cacheado. La caché pública se revalida cada 120 segundos; puede servir contenido previamente válido durante revalidación o fallo temporal. El sitemap solo reemplaza la versión válida si completa todas sus lecturas.

El límite de contacto es por proceso/IP, sin almacén distribuido ni CAPTCHA. No garantiza evitar agotamiento de cuota por bots distribuidos. No se añadieron reintentos automáticos, webhooks de entrega, colas ni persistencia de mensajes. Un timeout puede dejar el envío incierto y se informa así.

Se mantiene contenido editorial estático de perfil, habilidades y presentación; este sprint no certifica esas afirmaciones ni completa la carga de casos reales. Continúan para los próximos sprints el contenido y SEO editorial, la revisión completa de accesibilidad/responsive y la validación final en el hosting. Las comprobaciones móviles de este sprint se limitaron al formulario y filtros modificados.

No se cambiaron `.env` privados, credenciales, DNS ni datos de producción. No se hizo commit ni push. Se preservó el archivo local preexistente `.claude/settings.local.json`.

# Frontend — Smoke Test Manual (Sprint FINAL)

Checklist rápido antes de deploy. Ejecutar con backend + frontend en dev o staging.

## Auth admin
- [ ] Login válido redirige a `/admin`
- [ ] Login inválido muestra error genérico (sin filtrar si email existe)
- [ ] Tras 5 intentos fallidos, rate limit bloquea login temporalmente
- [ ] Logout limpia sesión y protege rutas admin
- [ ] Refresh silencioso tras expiración de access token

## Público
- [ ] Home carga con Site Settings (hero, footer, metadata)
- [ ] Listados: projects, cyber labs, certifications, education, blog
- [ ] Detail pages por slug responden 200; slug inválido → 404 premium
- [ ] CV público descarga/abre si configurado
- [ ] Imágenes Cloudinary cargan (next/image optimizado)

## SEO
- [ ] `/robots.txt` — allow `/`, disallow `/admin`, sitemap URL correcta
- [ ] `/sitemap.xml` — rutas estáticas + slugs dinámicos
- [ ] `/rss.xml` — posts published
- [ ] View source: canonical, OG tags, JSON-LD en home y un detail page
- [ ] Admin layout: `noindex`

## CMS admin
- [ ] CRUD projects, cyber labs, certifications, education, blog
- [ ] Soft delete oculta en listado público
- [ ] `includeDeleted` en admin (si UI expone filtro) o vía API
- [ ] Restore devuelve registro a listado público
- [ ] Site Settings: guardar canonical válido; rechaza `javascript:` / dominio no permitido
- [ ] Upload imagen/PDF + delete asset

## Errores y UX
- [ ] API caída: fallback UI (not-found/error) sin crash
- [ ] Loading skeletons visibles en navegación lenta
- [ ] Empty states en listados vacíos

## Build
- [ ] `npm run build` sin errores TS
- [ ] Sin rutas admin indexables

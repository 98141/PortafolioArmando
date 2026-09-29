// Isolated fixture API: no MongoDB, Cloudinary or real email delivery.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const requireBackend = createRequire(new URL("../../backend/package.json", import.meta.url));
const express = requireBackend("express");
const cors = requireBackend("cors");
const { createContactRouter } = requireBackend("./src/routes/contact.routes");
const errors = requireBackend("./src/middlewares/globalErrorHandler");
const origin = "http://localhost:3110";
const app = express();
app.use(cors({ origin, credentials: true }), express.json());
process.env.FRONTEND_URL = origin;
const visitSessions = new Set();
app.use("/api/visits", requireBackend("./src/routes/visit.routes").createVisitRouter({ store: {
  record: async id => { visitSessions.add(id); },
  total: async () => visitSessions.size,
} }));
// A local fixture session for inspecting admin form validation; never used by production.
app.get("/api/auth/me", (_req, res) => res.json({ status: "success", data: { user: { _id: "fixture-admin", name: "Fixture admin", email: "admin@example.com", role: "admin", isActive: true } } }));
let fixtureSettings = { profile: { fullName: "Nombre CMS de prueba", professionalTitle: "Título CMS de prueba", tagline: "Presentación desde el panel", shortBio: "Biografía CMS de prueba" }, social: [] };
app.get("/api/admin/site-settings", (_req, res) => res.json({ status: "success", data: { settings: fixtureSettings } }));
app.put("/api/admin/site-settings", (req, res) => {
  fixtureSettings = { ...req.body, updatedAt: new Date().toISOString() };
  res.json({ status: "success", data: { settings: fixtureSettings } });
});
app.use("/api/contact", createContactRouter({ env: { RESEND_API_KEY: "fixture", CONTACT_FROM: "fixture@example.com", CONTACT_TO: "fixture-inbox@example.com" }, send: async (_url, options) => {
  const body = JSON.parse(options.body);
  return body.subject.includes("rechazo") ? Response.json({ error: "simulated" }, { status: 503 }) : Response.json({ id: "fixture-only-no-email-sent" });
} }));
const base = { _id: "fixture-1", title: "Registro de prueba SSR", slug: "fixture-one", shortDescription: "Descripción de prueba para verificar renderizado del servidor.", description: "Descripción local de prueba.", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z", isActive: true, isFeatured: true, priority: 1 };
const records = {
  projects: { ...base, category: "fullstack", status: "completed", technologies: ["Node.js"], features: [], challenges: ["Reto documentado"], learnings: ["Aprendizaje documentado"], links: {}, longDescription: "Contenido completo del proyecto SSR.", caseStudy: { role: "Participación documentada", problem: "Problema documentado", solution: "Solución documentada", architecture: "Arquitectura documentada", results: "Resultado documentado" }, gallery: [{ url: "https://example.com/cart.png", alt: "Carrito de prueba" }] },
  "cyber-labs": { ...base, category: "appsec", status: "completed", severity: "low", tools: [], methodology: [], mitigations: [], technologies: [], objectives: [], findings: [], recommendations: [], skills: [], tags: [], fullDescription: "Prueba de laboratorio local." },
  certifications: { ...base, category: "cybersecurity", status: "active", issuer: "Institución de prueba", skills: [], technologies: [] },
  education: { ...base, institution: "Institución de prueba", academicLevel: "undergraduate", achievements: [], focusAreas: [], isCurrent: false },
  blog: { ...base, category: "appsec", status: "published", excerpt: "Artículo local para comprobar el HTML inicial.", content: "## Texto servido desde el servidor\n\nContenido Markdown de prueba SSR.", tags: ["prueba"], relatedTopics: [], readingTime: 1, allowComments: false, publishedAt: base.createdAt },
};
const keys = { projects: ["projects", "project"], "cyber-labs": ["labs", "lab"], certifications: ["certifications", "certification"], education: ["education", "education"], blog: ["posts", "post"] };
let outage = false;
app.post("/fixture/outage", (req, res) => { outage = !!req.body.enabled; res.json({ outage }); });
app.get("/api/site-settings", (_req, res) => res.json({ status: "success", data: { settings: fixtureSettings } }));
let savedProject;
app.delete("/api/admin/projects/:id", (_req, res) => res.status(503).json({ status: "error", message: "Fallo simulado: el proyecto no fue eliminado." }));
app.post("/api/admin/projects", (req, res) => {
  savedProject = { ...base, ...req.body, _id: "fixture-saved", slug: "tejiendo-raices" };
  res.status(201).json({ status: "success", data: { project: savedProject } });
});
app.get("/api/admin/projects", (_req, res) => res.json({ status: "success", data: { projects: [savedProject || records.projects], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } } }));
app.get("/api/admin/projects/:id", (_req, res) => res.json({ status: "success", data: { project: savedProject || records.projects } }));
app.patch("/api/admin/projects/:id", (req, res) => { savedProject = { ...savedProject, ...req.body }; res.json({ status: "success", data: { project: savedProject } }); });
app.get("/api/projects/legacy", (_req, res) => res.json({ status: "success", data: { project: { ...records.projects, slug: "legacy", caseStudy: undefined, gallery: [] } } }));
app.get("/api/:resource/:slug", (req, res) => {
  if (req.params.slug === "outage") return res.status(503).json({ status: "error" });
  const item = records[req.params.resource];
  if (!item || req.params.slug !== item.slug) return res.status(404).json({ status: "error" });
  res.json({ status: "success", data: { [keys[req.params.resource][1]]: item } });
});
app.get("/api/:resource", (req, res) => {
  const item = records[req.params.resource];
  if (!item) return res.status(404).json({ status: "error" });
  if (outage || req.query.search === "outage") return res.status(503).json({ status: "error" });
  const page = Number(req.query.page || 1), limit = Number(req.query.limit || 12);
  if (limit > 50) return res.status(400).json({ status: "error" });
  const filtered = (req.query.category && req.query.category !== item.category) || (req.query.search && !item.title.includes(req.query.search)) || (req.query.tag && !item.tags?.includes(req.query.tag));
  const total = filtered ? 0 : req.params.resource === "projects" ? 55 : 1;
  const items = Array.from({ length: Math.min(limit, Math.max(0, total - (page - 1) * limit)) }, (_, index) => {
    const n = (page - 1) * limit + index;
    return { ...item, _id: `fixture-${n}`, slug: n === 0 ? item.slug : `fixture-${n}`, title: `${item.title} ${n + 1}` };
  });
  res.json({ status: "success", data: { [keys[req.params.resource][0]]: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
});
app.use(errors);
const api = await new Promise(resolve => { const server = app.listen(0, "127.0.0.1", () => resolve(server)); });
const fixtureOrigin = `http://127.0.0.1:${api.address().port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "localhost", "--port", "3110"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, NODE_ENV: "development", PUBLIC_FIXTURE: "1", NEXT_PUBLIC_API_URL: fixtureOrigin + "/api", NEXT_PUBLIC_SITE_URL: origin },
  stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
let logs = "";
child.stdout.on("data", chunk => { logs += chunk; });
child.stderr.on("data", chunk => { logs += chunk; });
async function check(path, expectedStatus, text) {
  const response = await fetch(origin + path, { headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(90000) });
  const html = await response.text();
  assert.equal(response.status, expectedStatus, `${path}: expected ${expectedStatus}, got ${response.status}`);
  if (text) assert.match(html, text, path);
  console.log(`PASS ${expectedStatus} ${path}`);
  return html;
}
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Next did not start: " + logs)), 60000);
    child.stdout.on("data", chunk => { if (chunk.toString().includes("Ready")) { clearTimeout(timeout); resolve(); } });
    child.once("exit", code => { clearTimeout(timeout); reject(new Error(`Next exited ${code}: ${logs}`)); });
  });
  console.log(`Fixture preview ${origin}; frontend PID ${child.pid}. NO REAL EMAILS. Stop: ${fixtureOrigin}/fixture/stop`);
  if (process.argv.includes("--serve")) {
    // Close this local preview from another terminal with POST http://127.0.0.1:5110/fixture/stop.
    await new Promise(resolve => { app.post("/fixture/stop", (_req, res) => { res.sendStatus(200); resolve(); }); setTimeout(resolve, 15 * 60 * 1000).unref(); });
  } else {
    for (const route of ["projects", "cybersecurity", "certifications", "education", "blog"]) {
      const html = await check(`/${route}`, 200, /Registro de prueba SSR/);
      assert.match(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""), /Registro de prueba SSR/, "Content must be in rendered HTML, not only RSC scripts");
      const detail = await check(`/${route}/fixture-one`, 200, /Registro de prueba SSR/);
      assert.match(detail, /BreadcrumbList/);
      if (route === "blog") {
        assert.match(detail, /property="og:type" content="article"/);
        assert.match(detail.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""), /<h2[^>]*>Texto servido desde el servidor<\/h2>/, "Markdown must be rendered in the initial HTML");
      }
      await check(`/${route}/missing`, 404);
      await check(`/${route}/outage`, 500);
    }
    await check("/projects?category=fullstack&page=2", 200, /Registro de prueba SSR 13/);
    await check("/projects?search=nonexistent", 200, /No hay resultados/);
    await check("/projects?search=outage", 500);
    const project = await check("/projects/fixture-one", 200, /Resultado documentado/);
    for (const content of ["Participación documentada", "Problema documentado", "Solución documentada", "Arquitectura documentada", "Reto documentado", "Aprendizaje documentado", "Carrito de prueba"]) assert.ok(project.includes(content), content);
    const legacy = await check("/projects/legacy", 200);
    assert.doesNotMatch(legacy.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""), /Mi participación|Capturas del proyecto/);
    const home = await check("/", 200, /Presentación desde el panel/);
    assert.match(home, /<title>Armando Mora \| Desarrollo Full Stack y Ciberseguridad<\/title>/);
    assert.match(home, /Visitas:/);
    assert.match(home, /Desarrollo web full stack/);
    assert.match(home, /knowsAbout/);
    await check("/about", 200, /Biografía CMS de prueba/);
    await check("/contact", 200, /Nombre CMS de prueba/);
    const og = await fetch(origin + "/og");
    assert.equal(og.status, 200);
    assert.match(og.headers.get("content-type"), /image\/png/);
    const png = Buffer.from(await og.arrayBuffer());
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    console.log("PASS case study, legacy content, CMS profile and 1200x630 social image");
    const sitemap = await check("/sitemap.xml", 200, /projects\/fixture-54/);
    assert.equal((sitemap.match(/<url>/g) || []).length, 67);
    await check("/rss.xml", 200, /Artículo local/);
    await fetch(fixtureOrigin + "/fixture/outage", { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"enabled":true}' });
    await check("/rss.xml", 503);
    console.log("Public SSR, real HTTP status, filters, pagination, full sitemap and feed checks passed.");
  }
} catch (error) {
  console.error(logs.slice(-10000));
  throw error;
} finally {
  child.kill();
  api.closeAllConnections();
  await new Promise(resolve => api.close(resolve));
}

// Browser-only local fixtures. No DB, Cloudinary, real session or external writes.
// Run from frontend: node scripts/preview-upload-forms.mjs
// Control http://127.0.0.1:5111/fixture/control with JSON POST:
// {"upload":"hold"|"fail"|"ok", "save":"hold"|"ok", "readError":true|false}
// POST /fixture/release releases held replies; GET /fixture/state reports in-memory writes.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const express = require("express"), cors = require("cors"), multer = require("multer");
const app = express(), origin = "http://localhost:3110";
app.use(cors({ origin, credentials: true }), express.json());
const control = { upload: "hold", save: "ok", readError: false, read: "ok", session: true, meFails: 0 };
const held = [], writes = [], uploads = [], authEvents = [];
const fixtureUser = { _id: "fixture-admin", name: "Admin local", role: "admin", email: "local@example.com", isActive: true };
const initialCv = { url: "http://127.0.0.1:5111/fixture/cv.pdf", publicId: "fixture/old.pdf", fileName: "CV-local-anterior.pdf", updatedAt: "2026-09-01T12:00:00.000Z" };
let cv = initialCv;
let project = { _id: "fixture-project", title: "Proyecto local de prueba", slug: "fixture-project", shortDescription: "Descripción suficientemente larga para validar el formulario local.", category: "fullstack", status: "planned", image: { url: "https://example.com/old.png", publicId: "fixture/old" }, isActive: true, isFeatured: false, priority: 0, technologies: [], features: [], challenges: [], learnings: [], links: {}, gallery: [] };
app.get("/api/auth/me", (_req, res) => {
  if (!control.session) return res.status(401).json({ status: "fail", message: "No hay sesión de prueba" });
  if (control.meFails > 0) { control.meFails -= 1; return res.status(401).json({ status: "fail", message: "Acceso de prueba expirado" }); }
  res.json({ status: "success", data: { user: fixtureUser } });
});
app.post("/api/auth/login", (req, res) => {
  authEvents.push("login");
  if (!req.body?.email || !req.body?.password) return res.status(400).json({ message: "Faltan credenciales de prueba" });
  control.session = true;
  res.json({ status: "success", data: { user: fixtureUser } });
});
app.post("/api/auth/logout", (_req, res) => { authEvents.push("logout"); control.session = false; res.json({ status: "success" }); });
app.post("/api/auth/refresh-token", (_req, res) => {
  authEvents.push("refresh");
  if (!control.session) return res.status(401).json({ message: "Refresh de prueba rechazado" });
  res.json({ status: "success" });
});
app.get("/api/admin/site-settings", (_req, res) => {
  const snapshot = cv ? { ...cv } : null;
  const reply = () => control.readError
    ? res.status(503).json({ message: "Lectura fallida simulada" })
    : res.json({ status: "success", data: { settings: { cv: snapshot } } });
  if (control.read === "hold") held.push(reply); else reply();
});
app.get("/api/site-settings", (_req, res) => res.json({ status: "success", data: { settings: {} } }));
app.get("/api/admin/projects/:id", (_req, res) => res.json({ status: "success", data: { project } }));
app.get("/api/admin/projects", (_req, res) => res.json({ status: "success", data: { projects: [project], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } } }));
app.post("/api/admin/projects", (req, res) => {
  writes.push({ method: "POST", type: "project", payload: req.body });
  const reply = () => {
    project = { ...project, ...req.body, _id: "fixture-project" };
    res.status(201).json({ status: "success", data: { project } });
  };
  if (control.save === "hold") held.push(reply); else reply();
});
app.post("/api/admin/blog", (req, res) => {
  writes.push({ method: "POST", type: "blog", payload: req.body });
  res.status(201).json({ status: "success", data: { post: { _id: "fixture-post", ...req.body } } });
});
app.patch("/api/admin/projects/:id", (req, res) => {
  writes.push({ method: "PATCH", type: "project", payload: req.body });
  const reply = () => { project = { ...project, ...req.body }; res.json({ status: "success", data: { project } }); };
  if (control.save === "hold") held.push(reply); else reply();
});
app.post("/api/admin/uploads/:type", multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Falta archivo de prueba" });
  const type = req.params.type, index = uploads.length + 1;
  uploads.push({ type, bytes: req.file.size, mime: req.file.mimetype, name: req.file.originalname });
  const mode = control.upload;
  const reply = () => {
    if (mode === "fail") return res.status(413).json({ message: "Fallo simulado de archivo. Referencia anterior intacta." });
    if (mode === "uncertain") return res.status(500).json({ message: "Resultado incierto simulado" });
    const pdf = type === "cv" || type === "cyber-report";
    const url = pdf ? initialCv.url : `http://127.0.0.1:5111/fixture/image-${index}.png`;
    const asset = { url, secureUrl: url, publicId: `fixture/${type}-${index}${pdf ? ".pdf" : ""}`, resourceType: pdf ? "raw" : "image", originalName: req.file.originalname, bytes: req.file.size };
    if (type === "cv") { cv = { url, publicId: asset.publicId, fileName: asset.originalName }; writes.push({ type: "cv-upload", publicId: cv.publicId }); }
    res.status(201).json({ status: "success", data: asset });
  };
  if (mode === "hold") held.push(reply); else reply();
});
app.delete("/api/admin/site-settings/cv", (_req, res) => {
  const reply = () => { cv = null; writes.push({ type: "cv-delete" }); res.sendStatus(204); };
  if (control.save === "hold") held.push(reply); else reply();
});
app.get("/fixture/state", (_req, res) => res.json({ control, held: held.length, uploads, writes, authEvents, cv, project }));
app.post("/fixture/control", (req, res) => {
  for (const key of Object.keys(control)) if (key in req.body) control[key] = req.body[key];
  if (req.body.cv === null) cv = null;
  if (req.body.restoreCv) cv = { ...initialCv };
  res.json({ ...control, cv });
});
app.post("/fixture/release", (req, res) => {
  const count = Number.isInteger(req.body?.count) ? req.body.count : held.length;
  held.splice(0, count).forEach((reply) => reply());
  res.json({ held: held.length });
});
app.get("/fixture/cv.pdf", (_req, res) => res.type("application/pdf").send("%PDF-1.4\n% local fixture only\n%%EOF"));
const api = await new Promise(resolve => { const server = app.listen(5111, "127.0.0.1", () => resolve(server)); });
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "localhost", "--port", "3110"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)), windowsHide: true,
  env: { ...process.env, NODE_ENV: "development", PUBLIC_FIXTURE: "1", NEXT_PUBLIC_API_URL: "http://127.0.0.1:5111/api", NEXT_PUBLIC_SITE_URL: origin },
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", chunk => process.stdout.write(chunk));
child.stderr.on("data", chunk => process.stderr.write(chunk));
console.log(`LOCAL ONLY: ${origin}/admin/projects/fixture-project/edit and /admin/cv; API 127.0.0.1:5111`);
await new Promise(resolve => {
  app.post("/fixture/stop", (_req, res) => { res.sendStatus(200); resolve(); });
  child.once("exit", resolve);
  setTimeout(resolve, 30 * 60 * 1000).unref();
});
child.kill(); api.closeAllConnections(); await new Promise(resolve => api.close(resolve));

import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

// Measures external JS/CSS explicitly referenced by the initial production HTML.
// Gzip is calculated locally, excluding headers, images, lazy chunks and prefetch.
const base = process.argv[2] || "http://127.0.0.1:3100";
const output = process.argv[3];
const check = process.argv.includes("--check");
const assets = new Map();
async function read(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  return Buffer.from(await response.arrayBuffer());
}
async function sizes(paths) {
  let bytes = 0, gzipBytes = 0;
  for (const path of new Set(paths)) {
    if (!assets.has(path)) assets.set(path, await read(path));
    const buffer = assets.get(path);
    bytes += buffer.length;
    gzipBytes += gzipSync(buffer).length;
  }
  return { files: new Set(paths).size, bytes, gzipBytes };
}
const routes = [];
for (const path of ["/", "/about", "/projects", "/blog", "/contact", "/cybersecurity", "/certifications", "/education"]) {
  const body = await read(path);
  const html = body.toString();
  const js = [...html.matchAll(/<script[^>]+src="(\/_next\/static\/[^"?]+\.js)[^"]*"/g)].map((m) => m[1]);
  const css = [...html.matchAll(/<link[^>]+href="(\/_next\/static\/[^"?]+\.css)[^"]*"[^>]*>/g)].map((m) => m[1]);
  assert.ok(js.length && css.length, `${path}: production assets missing`);
  assert.ok(!html.includes("/_next/static/development/"), "Use a production build");
  const row = { path, html: { bytes: body.length, gzipBytes: gzipSync(body).length }, js: await sizes(js), css: await sizes(css) };
  routes.push(row);
  console.log(`${path}: JS ${(row.js.gzipBytes / 1024).toFixed(1)} KiB gzip; CSS ${(row.css.gzipBytes / 1024).toFixed(1)} KiB gzip`);
  if (check) {
    // Headroom above the Sprint 5 measurement, including the Next/React runtime.
    assert.ok(row.js.gzipBytes <= 210 * 1024, `${path}: JS budget exceeded`);
    assert.ok(row.css.gzipBytes <= 14 * 1024, `${path}: CSS budget exceeded`);
  }
}
if (output && !output.startsWith("--")) await writeFile(output, `${JSON.stringify({ measuredAt: new Date().toISOString(), node: process.version, method: "Initial HTML external assets; sum of per-file local gzip bytes; not browser transfer or Core Web Vitals", routes }, null, 2)}\n`);

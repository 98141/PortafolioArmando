import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

// GET-only smoke. Add --require-details to fail when a collection has no public sample.
// Usage: npm run verify:release -- [running URL] [expected site origin] [expected API URL] [--require-details]
const base = process.argv[2] || "http://127.0.0.1:3100";
const site = new URL(process.argv[3] || "https://armandomora.com.co").origin;
const api = (process.argv[4] || "https://api.armandomora.com.co/api").replace(/\/+$/, "");
const root = fileURLToPath(new URL("../.next/static/", import.meta.url));
const localAppUrl = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):(?:3000|5000)(?:\b|\/)/;

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}

let apiFound = false;
for (const file of (await files(root)).filter((file) => file.endsWith(".js"))) {
  const source = await readFile(file, "utf8");
  assert.ok(!localAppUrl.test(source), `Local application URL in ${file}`);
  apiFound ||= source.includes(api);
}
assert.ok(apiFound, "Expected production API URL is absent from browser chunks");
console.log("OK browser chunks: production API present; no application localhost URLs");

async function read(url) {
  const time = new Date().toISOString();
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  // Never log response bodies, cookies or arbitrary headers.
  console.log(JSON.stringify({ time, method: "GET", url: String(url), status: response.status,
    type: response.headers.get("content-type"), bytes: bytes.length }));
  return { response, bytes };
}

async function get(path, { status = 200, type, binary = false } = {}) {
  const { response, bytes } = await read(new URL(path, base));
  assert.equal(response.status, status, `${path} HTTP status`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", `${path} nosniff`);
  assert.equal(response.headers.get("x-frame-options"), "DENY", `${path} frame protection`);
  if (type) assert.match(response.headers.get("content-type") || "", type, `${path} content type`);
  if (binary) return bytes;
  const body = bytes.toString("utf8");
  assert.ok(!localAppUrl.test(body), `${path} contains a local application URL`);
  if (path.startsWith("/admin/")) {
    assert.match(response.headers.get("cache-control") || "", /no-store/, `${path} admin cache`);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", `${path} admin indexing`);
    assert.match(body, /<meta name="robots" content="[^"]*noindex/, `${path} admin metadata`);
    if (path !== "/admin/login") {
      const visible = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
      assert.ok(visible.includes("Validando sesión"), `${path} anonymous session gate`);
      assert.doesNotMatch(visible, /<form\b/, `${path} must not expose an admin form without session validation`);
    }
  }
  return body;
}

function canonical(html, path) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  assert.ok(match, `${path} canonical is missing`);
  assert.equal(new URL(match[1]).href, new URL(path, site).href, `${path} canonical`);
}

const servedChunks = new Set();
for (const path of ["/", "/about", "/contact", "/projects", "/blog", "/cybersecurity", "/certifications", "/education"]) {
  const html = await get(path, { type: /text\/html/ });
  if (path === "/") {
    assert.match(html, /Visitas:/, "Footer counter must be present in initial HTML");
    assert.match(html, /Desarrollo web full stack/, "Visible full stack content");
    assert.match(html, /Ciberseguridad aplicada/, "Visible cybersecurity content");
  }
  for (const match of html.matchAll(/<script[^>]+src="(\/_next\/static\/[^"?]+\.js)[^"]*"/g)) {
    servedChunks.add(match[1]);
  }
  canonical(html, path);
  assert.ok(!html.includes('"url":"https://armandomora.dev'), `${path} stale structured-data origin`);
  console.log(`OK ${path}: HTTP 200 and canonical ${new URL(path, site).href}`);
}
const servedSources = await Promise.all([...servedChunks].map(path => get(path)));
assert.ok(servedSources.some((source) => source.includes(api)), "Expected API absent from served browser chunks");
console.log(`OK ${servedChunks.size} served chunks: production API present; no application localhost URLs`);
// A random missing slug is first confirmed absent by the API, never created.
const missing = `release-check-missing-${randomUUID()}`;
const resources = [
  ["projects", "projects", "projects"], ["cybersecurity", "cyber-labs", "labs"],
  ["certifications", "certifications", "certifications"], ["education", "education", "education"],
  ["blog", "blog", "posts"],
];
const skippedDetails = [];
for (const [route, endpoint, key] of resources) {
  const absent = await read(new URL(`${api}/${endpoint}/${missing}`));
  assert.equal(absent.response.status, 404, `${endpoint}: missing slug must be absent in API`);
  const missingHtml = await get(`/${route}/${missing}`, { status: 404, type: /text\/html/ });
  assert.ok(missingHtml.includes("Página no encontrada"), `${route} custom 404`);
  const listing = await read(new URL(`${api}/${endpoint}?limit=1&page=1`));
  assert.equal(listing.response.status, 200, `${endpoint} public API list`);
  const json = JSON.parse(listing.bytes.toString("utf8"));
  assert.equal(json.status, "success", `${endpoint} API status`);
  assert.ok(Array.isArray(json.data?.[key]), `${endpoint} public collection`);
  const item = json.data[key][0];
  if (!item) {
    skippedDetails.push(route);
    console.log(`SKIP /${route}/[slug]: no public record; successful detail NOT verified`);
    continue;
  }
  assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${endpoint} slug`);
  const path = `/${route}/${item.slug}`;
  const detail = await get(path, { type: /text\/html/ });
  canonical(detail, path);
  assert.ok(detail.includes("BreadcrumbList"), `${path} detail structured data`);
}

const robots = await get("/robots.txt", { type: /text\/plain/ });
assert.match(robots, /User-Agent: \*/i);
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`), "robots sitemap origin");
assert.ok(robots.includes("Disallow: /admin"), "robots admin exclusion");
const sitemap = await get("/sitemap.xml", { type: /(?:application|text)\/xml/ });
assert.match(sitemap, /<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
assert.match(sitemap, /<\/urlset>\s*$/);
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(locations.length >= 8, "sitemap static routes");
assert.ok(locations.every((url) => new URL(url).origin === site), "sitemap origin mismatch");
for (const path of ["/", "/about", "/contact", ...resources.map(([route]) => `/${route}`)]) {
  assert.ok(locations.some(url => new URL(url).href === new URL(path, site).href), `${path} missing from sitemap`);
}
const rss = await get("/rss.xml", { type: /application\/rss\+xml/ });
assert.match(rss, /<rss version="2.0">\s*<channel>/);
assert.match(rss, /<\/channel>\s*<\/rss>\s*$/);
assert.ok(rss.includes(`<link>${site}/blog</link>`), "RSS origin");
const png = await get("/og", { type: /image\/png/, binary: true });
assert.ok(png.length > 33, "OG PNG is truncated");
assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "OG PNG signature");
assert.equal(png.toString("ascii", 12, 16), "IHDR", "OG PNG header");
assert.equal(png.readUInt32BE(16), 1200, "OG width");
assert.equal(png.readUInt32BE(20), 630, "OG height");
assert.equal(png.toString("ascii", png.length - 8, png.length - 4), "IEND", "OG PNG end");
const adminPaths = ["/admin/login", "/admin/dashboard", "/admin/projects/new",
  ...resources.map(([, endpoint]) => `/admin/${endpoint}/507f1f77bcf86cd799439011/edit`)];
for (const path of adminPaths) await get(path, { type: /text\/html/ });
console.log(`OK robots, sitemap (${locations.length} URLs), RSS, OG PNG 1200x630 and ${adminPaths.length} admin screens`);
console.log("Admin results verify anonymous HTML/session gate only: no login, project creation or upload performed.");
if (skippedDetails.length) {
  console.log(`INCOMPLETE successful detail coverage: ${skippedDetails.join(", ")}. Test with fixture content separately.`);
  assert.ok(!process.argv.includes("--require-details"), "Public detail acceptance incomplete: no samples");
}

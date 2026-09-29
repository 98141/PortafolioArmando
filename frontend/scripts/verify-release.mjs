import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Usage: npm run verify:release -- [running URL] [expected site origin] [expected API URL]
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

async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path} HTTP status`);
  const body = await response.text();
  assert.ok(!localAppUrl.test(body), `${path} contains a local application URL`);
  return body;
}

const servedChunks = new Set();
for (const path of ["/", "/about", "/contact", "/projects", "/blog", "/cybersecurity", "/certifications", "/education"]) {
  const html = await get(path);
  for (const match of html.matchAll(/<script[^>]+src="(\/_next\/static\/[^"?]+\.js)[^"]*"/g)) {
    servedChunks.add(match[1]);
  }
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  assert.ok(canonical, `${path} canonical is missing`);
  assert.equal(new URL(canonical[1]).href, new URL(path, site).href, `${path} canonical`);
  assert.ok(!html.includes('"url":"https://armandomora.dev'), `${path} stale structured-data origin`);
  console.log(`OK ${path}: HTTP 200 and canonical ${canonical[1]}`);
}
const servedSources = await Promise.all([...servedChunks].map(get));
assert.ok(servedSources.some((source) => source.includes(api)), "Expected API absent from served browser chunks");
console.log(`OK ${servedChunks.size} served chunks: production API present; no application localhost URLs`);
const robots = await get("/robots.txt");
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`), "robots sitemap origin");
assert.ok(robots.includes("Disallow: /admin"), "robots admin exclusion");
const sitemap = await get("/sitemap.xml");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(locations.length >= 8, "sitemap static routes");
assert.ok(locations.every((url) => new URL(url).origin === site), "sitemap origin mismatch");
const rss = await get("/rss.xml");
assert.ok(rss.includes(`<link>${site}/blog</link>`), "RSS origin");
const admin = await get("/admin/login");
assert.match(admin, /<meta name="robots" content="[^"]*noindex/);
console.log(`OK robots, sitemap (${locations.length} URLs), RSS and admin noindex`);

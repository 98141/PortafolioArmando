import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const load = require("./load-ts.cjs");
const links = load("src/lib/publicLinks.ts", {}, { process: { env: { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "fixture" } } });
const forms = load("src/lib/projectForm.ts");
const profile = load("src/lib/publicProfile.ts", { "./publicLinks": links });
const seo = load("src/lib/seo.ts", { "./publicLinks": links, "@/src/lib/publicConfig": { siteOrigin: "https://portfolio.example.com" } });
const jsonLd = load("src/lib/jsonLd.ts", { "./publicProfile": profile, "./publicLinks": links });
const { tejiendoRaicesDraft } = load("src/data/projectDrafts.ts", { "@/src/lib/projectForm": forms });
const { projectFormSchema } = load("src/lib/validations/project.ts", { "@/src/lib/publicLinks": links });

test("legacy content maps to empty editable case study and gallery", () => {
  const values = forms.projectToFormValues({ title: "Anterior", shortDescription: "Texto", technologies: [], features: [], challenges: [], learnings: [] });
  assert.equal(values.caseStudy.results, "");
  assert.equal(values.gallery.length, 0);
});
test("draft validates and is hidden with no invented repository or dates", () => {
  assert.equal(projectFormSchema.safeParse(tejiendoRaicesDraft).success, true);
  assert.equal(tejiendoRaicesDraft.isActive, false);
  assert.equal(tejiendoRaicesDraft.linksGithub, "");
  assert.equal(tejiendoRaicesDraft.startedAt, "");
  assert.equal(tejiendoRaicesDraft.linksDemo, "https://tejiendoraices.com.co/");
});
test("editing preserves image references and clears removed content", () => {
  const payload = forms.formValuesToPayload({ ...tejiendoRaicesDraft, gallery: [{ url: "https://example.com/a.png", publicId: "projects/a", alt: "Carrito" }] });
  assert.equal(payload.gallery[0].publicId, "projects/a");
  assert.equal(payload.caseStudy.role, tejiendoRaicesDraft.caseStudy.role);
  const cleared = JSON.parse(JSON.stringify(forms.formValuesToPayload(forms.defaultProjectFormValues)));
  assert.deepEqual(cleared.image, {});
  assert.equal(cleared.longDescription, "");
  assert.deepEqual(cleared.gallery, []);
});
test("HTTP links reject unsafe protocols and image previews respect provider", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,test", "https://user:pass@example.com", "/local"]) assert.equal(links.httpUrl(value), undefined);
  assert.equal(links.supportedImageUrl("https://res.cloudinary.com/fixture/image/upload/a.png"), "https://res.cloudinary.com/fixture/image/upload/a.png");
  assert.equal(links.supportedImageUrl("https://res.cloudinary.com/other/image/upload/a.png"), undefined);
  assert.equal(links.supportedImageUrl("https://example.com/a.png"), undefined);
});
test("profile uses CMS values and explicit empty socials without fake accounts", () => {
  assert.equal(profile.resolvePublicProfile({ profile: { fullName: " Nombre CMS " } }).fullName, "Nombre CMS");
  assert.equal(profile.publicSocialLinks({}).length, 1);
  assert.equal(profile.publicSocialLinks({ profile: { github: "https://github.com/owner" }, social: [] }).length, 1);
  assert.equal(profile.publicSocialLinks({ social: [{ platform: "github", url: "javascript:alert(1)" }] }).length, 1);
});
test("article metadata has a usable fallback social image and dates", () => {
  const value = seo.buildMetadata({ path: "/blog/post", article: { publishedTime: "2026-01-01" } });
  assert.equal(value.openGraph.type, "article");
  assert.equal(value.openGraph.publishedTime, "2026-01-01");
  assert.equal(value.openGraph.images[0].url, "https://portfolio.example.com/og");
  assert.equal(value.alternates.canonical, "https://portfolio.example.com/blog/post");
});
test("structured data uses Organization issuer and ordered breadcrumb URLs", () => {
  assert.equal(jsonLd.certificationJsonLd({ issuer: "Entidad" }).recognizedBy["@type"], "Organization");
  const value = jsonLd.breadcrumbJsonLd([{ name: "Inicio", url: "https://example.com/" }, { name: "Proyecto", url: "https://example.com/projects/p" }]);
  assert.equal(value.itemListElement[1].position, 2);
  assert.equal(value.itemListElement[1].item, "https://example.com/projects/p");
  assert.equal(jsonLd.blogPostingJsonLd({ title: "Artículo" }, "https://example.com").author, undefined);
});

test("SEO defaults describe full stack and security, preserve CMS overrides and bound descriptions", () => {
  const value = seo.buildMetadata({});
  assert.match(value.title, /Armando Mora.*Full Stack.*Ciberseguridad/);
  assert.match(value.description, /desarrollador full stack/);
  assert.equal(value.robots.index, true);
  assert.equal(value.openGraph.locale, "es_CO");
  const custom = seo.buildMetadata({ seo: { defaultTitle: "Mi título", defaultDescription: "Mi descripción", canonicalBaseUrl: "https://old.example.com" } });
  assert.equal(custom.title, "Mi título");
  assert.equal(custom.description, "Mi descripción");
  assert.equal(custom.alternates.canonical, "https://portfolio.example.com/");
  assert.equal(seo.truncateDescription("a".repeat(200)).length, 160);
  const person = jsonLd.personJsonLd({}, "https://portfolio.example.com");
  assert.ok(person.knowsAbout.includes("Desarrollo full stack"));
  assert.ok(person.knowsAbout.includes("Ciberseguridad"));
  assert.equal(jsonLd.websiteJsonLd({}, "https://portfolio.example.com").author["@id"], person["@id"]);
});

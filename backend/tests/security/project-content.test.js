const test = require("node:test");
const assert = require("node:assert/strict");
const { createProjectSchema, updateProjectSchema } = require("../../src/validators/project.validator");
const Project = require("../../src/models/project.model");
const base = { title: "Proyecto real", slug: "proyecto-real", shortDescription: "Descripción del proyecto suficientemente larga." };

test("legacy projects remain valid without a case study", async () => {
  const value = createProjectSchema.parse(base);
  assert.equal(value.caseStudy, undefined);
  await new Project(value).validate();
});
test("case study and gallery survive validation and model serialization", async () => {
  const value = createProjectSchema.parse({ ...base, caseStudy: { role: " Desarrollo ", results: "Publicado" }, gallery: [{ url: "https://example.com/image.png", alt: "Carrito", publicId: "projects/cart" }] });
  const doc = new Project(value);
  await doc.validate();
  assert.equal(doc.toObject().caseStudy.role, "Desarrollo");
  assert.equal(doc.toObject().gallery[0].publicId, "projects/cart");
});
test("content lengths, gallery count and unsafe links are rejected", () => {
  for (const patch of [{ caseStudy: { results: "a".repeat(6001) } }, { gallery: Array(13).fill({ url: "https://example.com/a.png" }) }, { links: { demo: "javascript:alert(1)" } }, { image: { url: "https://user:password@example.com/a.png" } }]) {
    assert.equal(createProjectSchema.safeParse({ ...base, ...patch }).success, false);
  }
});
test("partial edits preserve omitted content and allow explicit clearing", () => {
  assert.deepEqual(updateProjectSchema.parse({ title: "Nuevo título" }), { title: "Nuevo título" });
  assert.deepEqual(updateProjectSchema.parse({ caseStudy: { results: "" }, gallery: [], image: {}, longDescription: "" }), { caseStudy: { results: "" }, gallery: [], image: {}, longDescription: "" });
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url);
const load = require("./load-ts.cjs");
const { fieldIssues, accessibleRegister, default: FormErrors } = load("src/components/admin/FormErrors.tsx");

test("nested and gallery errors expose descriptions without traversing DOM refs", () => {
  const ref = {}; ref.self = ref;
  const errors = { profile: { email: { message: "Email inválido", ref } }, gallery: [{ alt: { message: "Describe la captura" } }] };
  const issues = fieldIssues(errors);
  assert.equal(issues.length, 2);
  const html = renderToStaticMarkup(React.createElement(FormErrors, { errors }));
  assert.match(html, /role="alert"/);
  assert.match(html, /id="field-error-profile.email"/);
  assert.match(html, /id="field-error-gallery.0.alt"/);
  assert.equal(renderToStaticMarkup(React.createElement(FormErrors, { errors: {} })), "");
});
test("invalid fields retain form registration and point to their error description", () => {
  const onChange = () => {}, ref = () => {};
  const register = name => ({ name, ref, onChange });
  const wrapped = accessibleRegister(register, { title: { message: "Título requerido" } });
  assert.equal(wrapped("title")["aria-describedby"], "field-error-title");
  assert.equal(wrapped("title")["aria-invalid"], true);
  assert.equal(wrapped("title").ref, ref);
  assert.equal(wrapped("title").onChange, onChange);
  assert.equal(wrapped("subtitle")["aria-invalid"], undefined);
});
test("profile and SEO settings labels are associated with every text control", () => {
  for (const name of ["ProfileSettingsForm", "BrandingSettingsForm", "SeoSettingsForm"]) {
    const Component = load(`src/components/admin/settings/${name}.tsx`).default;
    const html = renderToStaticMarkup(React.createElement(Component, { register: name => ({ name }) }));
    const controls = [...html.matchAll(/<(?:input|textarea)\b[^>]*id="([^"]+)"/g)];
    assert.ok(controls.length > 0);
    for (const [, id] of controls) assert.ok(html.includes(`for="${id}"`), `${name}: ${id}`);
    assert.equal(controls.length, [...html.matchAll(/<(?:input|textarea)\b/g)].length);
  }
});
test("white CTA text and secondary text meet 4.5:1 on the defined surfaces", () => {
  const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
  const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(x => parseInt(x, 16));
  const luminance = channels => channels.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  const blue = rgb(css.match(/--accent-blue: (#[\da-f]+)/)[1]), purple = rgb(css.match(/--accent-purple: (#[\da-f]+)/)[1]);
  for (let i = 0; i <= 20; i++) assert.ok(contrast([255,255,255], blue.map((c,j) => c + (purple[j] - c) * i / 20)) >= 4.5);
  for (const background of ["080c18", "101527", "1d2233"]) assert.ok(contrast(rgb("a1a1aa"), rgb(background)) >= 4.5);
});

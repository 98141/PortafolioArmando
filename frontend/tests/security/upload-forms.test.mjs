import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import loadTs from "./load-ts.cjs";

const { createUploadCoordinator } = loadTs("src/lib/uploadCoordinator.ts");
const { createCvController } = loadTs("src/lib/cvController.ts");
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const asset = { url: "https://example.com/new.png", secureUrl: "https://example.com/new.png", publicId: "new", originalName: "new.png", resourceType: "image" };
const old = { ...asset, url: "https://example.com/old.png", publicId: "old" };

// Deterministic hook host for actual component handlers/markup, no network or new dependencies.
function hooks() {
  const slots = []; let cursor = 0; const cleanups = [];
  return {
    react: { ...React,
      useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
        return [slots[i], (value) => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }]; },
      useRef(initial) { const i = cursor++; return slots[i] ||= { current: initial }; },
      useMemo: fn => fn(), useId: () => "file-test",
      useEffect(fn) { const i = cursor++; if (!(i in slots)) { slots[i] = true; cleanups.push(fn()); } },
      useSyncExternalStore: (_subscribe, get) => get(),
    },
    render(fn) { cursor = 0; return fn(); },
    unmount() { cleanups.forEach(fn => fn?.()); },
  };
}
function find(tree, predicate) {
  if (!tree) return;
  if (predicate(tree)) return tree;
  for (const child of React.Children.toArray(tree.props?.children)) { const result = find(child, predicate); if (result) return result; }
}
function field(coordinator, upload, onChange = () => {}) {
  const host = hooks();
  const { default: Field } = loadTs("src/components/admin/uploads/FileUploadField.tsx", {
    react: host.react, "next/image": () => null,
    "./UploadForm": { useUploadForm: () => ({ coordinator, busy: coordinator.getSnapshot().saving }) },
    "@/src/services/uploadService": { uploadService: { uploadProjectImage: upload } },
  });
  const render = () => host.render(() => Field({ label: "Imagen", value: old, onChange, uploadType: "project-image", accept: "image/png", maxSize: 1000, helperText: "PNG pequeño", previewType: "image" }));
  const choose = (file = new File(["png"], "same.png")) => {
    const target = { files: [file], value: file.name };
    const done = find(render(), node => node.type === "input").props.onChange({ target });
    assert.equal(target.value, "", "reset permits selecting the exact same file again");
    return done;
  };
  return { render, choose, unmount: host.unmount };
}

test("actual form submit handler blocks Enter/programmatic submit with one or two pending uploads", async () => {
  const host = hooks(); let saves = 0;
  const { default: Form } = loadTs("src/components/admin/uploads/UploadForm.tsx", {
    react: host.react, "@/src/lib/uploadCoordinator": { createUploadCoordinator },
  });
  const render = () => host.render(() => Form({ onSubmit: async () => { saves++; }, children: "form" }));
  const tree = render(), coordinator = tree.props.value.coordinator;
  const a = deferred(), b = deferred(); const f1 = field(coordinator, () => a.promise), f2 = field(coordinator, () => b.promise);
  const first = f1.choose(), second = f2.choose();
  const submit = () => find(render(), n => n.type === "form").props.onSubmit({ preventDefault() {} });
  await submit(); assert.equal(saves, 0);
  assert.match(renderToStaticMarkup(render()), /Subiendo 2 archivo/);
  a.resolve(asset); await first; await submit(); assert.equal(saves, 0);
  b.resolve(asset); await second; await submit(); assert.equal(saves, 1);
});

test("new URL and publicId are incorporated before pending unlock and save; save rejects uploads and reference removal", async () => {
  const coordinator = createUploadCoordinator(), wait = deferred(); let reference = old, calls = 0;
  const f = field(coordinator, async () => { calls++; return asset; }, value => {
    assert.equal(coordinator.getSnapshot().pending, 1);
    reference = value;
  });
  await f.choose();
  let payload;
  const save = coordinator.submit(async () => { payload = { imageUrl: reference.secureUrl, imagePublicId: reference.publicId }; await wait.promise; });
  await f.choose();
  find(f.render(), n => n.props?.["aria-label"] === "Quitar archivo").props.onClick();
  assert.equal(calls, 1); assert.equal(reference, asset);
  assert.deepEqual(payload, { imageUrl: asset.secureUrl, imagePublicId: "new" });
  assert.equal(await coordinator.submit(() => assert.fail("double save")), false);
  wait.resolve(); await save; assert.equal(coordinator.getSnapshot().saving, false);
});

test("upload failure retains previous reference, exposes associated alert and permits same-file retry", async () => {
  const coordinator = createUploadCoordinator(); let calls = 0, reference = old;
  const file = new File(["png"], "same.png");
  const f = field(coordinator, async () => { if (++calls === 1) throw Error("offline"); return asset; }, value => { reference = value; });
  await f.choose(file); assert.equal(reference, old); assert.equal(coordinator.getSnapshot().pending, 0);
  const tree = f.render(), input = find(tree, n => n.type === "input"), alert = find(tree, n => n.props?.role === "alert");
  assert.equal(input.props["aria-invalid"], true);
  assert.ok(input.props["aria-describedby"].includes(alert.props.id));
  assert.equal(find(tree, n => n.type === "label").props.htmlFor, input.props.id);
  assert.match(renderToStaticMarkup(tree), /role="status"/);
  assert.match(renderToStaticMarkup(tree), /Selecciona el archivo de nuevo/);
  await f.choose(file); assert.equal(calls, 2); assert.equal(reference, asset);
  assert.match(renderToStaticMarkup(f.render()), /Guarda el formulario/);
});

test("unmount releases pending and suppresses late upload results; save failure releases save lock", async () => {
  const coordinator = createUploadCoordinator(), wait = deferred(); let changes = 0;
  const f = field(coordinator, () => wait.promise, () => changes++);
  const done = f.choose(); f.unmount(); assert.equal(coordinator.getSnapshot().pending, 0);
  wait.resolve(asset); await done; assert.equal(changes, 0);
  await assert.rejects(coordinator.submit(async () => { throw Error("save failed"); }));
  assert.equal(coordinator.getSnapshot().saving, false);
});

test("CV read errors differ from absence, retry recovers and later failure retains last confirmed CV", async () => {
  let fail = true;
  const cv = createCvController({ getAdminSettings: async () => { if (fail) throw Error("offline"); return { cv: old }; }, deleteCv: async () => {} });
  await cv.refresh(); assert.equal(cv.getSnapshot().read, "error"); assert.equal(cv.beginUpload(), false);
  fail = false; await cv.refresh(); assert.equal(cv.getSnapshot().current.publicId, "old");
  fail = true; await cv.refresh(); assert.equal(cv.getSnapshot().current.publicId, "old"); assert.equal(cv.getSnapshot().read, "error");
  const empty = createCvController({ getAdminSettings: async () => ({}), deleteCv: async () => {} });
  await empty.refresh(); assert.equal(empty.getSnapshot().read, "ready"); assert.equal(empty.getSnapshot().current, null);
});

test("stale CV read cannot overwrite a newer persisted upload; unmount ignores late reads", async () => {
  const stale = deferred(); let calls = 0;
  const cv = createCvController({ getAdminSettings: () => ++calls === 1 ? stale.promise : Promise.resolve({ cv: old }), deleteCv: async () => {} });
  const first = cv.refresh(); await cv.refresh(); assert.equal(cv.beginUpload(), true); cv.completeUpload(asset);
  stale.resolve({ cv: old }); await first; assert.equal(cv.getSnapshot().current.publicId, "new");
  const late = deferred(); const other = createCvController({ getAdminSettings: () => late.promise, deleteCv: async () => {} });
  const pending = other.refresh(); other.dispose(); late.resolve({ cv: old }); await pending; assert.equal(other.getSnapshot().current, null);
});

test("CV replacement and deletion exclude each other; success only after persistence reply", async () => {
  const wait = deferred(); let deletes = 0;
  const cv = createCvController({ getAdminSettings: async () => ({ cv: old }), deleteCv: () => { deletes++; return wait.promise; } });
  await cv.refresh(); assert.equal(cv.beginUpload(), true); assert.equal(cv.getSnapshot().success, null);
  await cv.remove(); assert.equal(deletes, 0); assert.equal(cv.beginUpload(), false);
  cv.completeUpload(asset); assert.match(cv.getSnapshot().success, /actualizado/);
  const remove = cv.remove(); assert.equal(cv.beginUpload(), false); await cv.remove(); assert.equal(deletes, 1);
  assert.equal(cv.getSnapshot().current.publicId, "new"); assert.equal(cv.getSnapshot().success, null);
  wait.resolve(); await remove; assert.equal(cv.getSnapshot().current, null); assert.match(cv.getSnapshot().success, /eliminado/);
});

test("uncertain CV writes are not retried; explicit reread resolves state before another write", async () => {
  let deletes = 0, remote = old;
  const cv = createCvController({ getAdminSettings: async () => ({ cv: remote }), deleteCv: async () => { deletes++; remote = null; throw Error("connection lost after commit"); } });
  await cv.refresh(); await cv.remove(); assert.equal(deletes, 1); assert.equal(cv.getSnapshot().uncertain, true);
  assert.equal(cv.getSnapshot().current.publicId, "old"); assert.equal(cv.getSnapshot().success, null);
  await cv.remove(); assert.equal(deletes, 1); assert.equal(cv.beginUpload(), false);
  await cv.refresh(); assert.equal(cv.getSnapshot().current, null); assert.equal(cv.getSnapshot().uncertain, false);
  assert.equal(cv.beginUpload(), true); cv.failUpload(Error("offline")); assert.equal(cv.beginUpload(), false);
  await cv.refresh(); assert.equal(cv.beginUpload(), true); cv.failUpload({ response: { status: 413 } }); assert.equal(cv.beginUpload(), true);
});

test("CV page renders read error and retry accessibly, never absence on failure", async () => {
  const controller = createCvController({ getAdminSettings: async () => { throw Error("offline"); }, deleteCv: async () => {} });
  await controller.refresh();
  const { default: Page } = loadTs("src/app/admin/cv/page.tsx", {
    react: { ...React, useState: () => [controller], useEffect() {}, useSyncExternalStore: (_s, get) => get() },
    "@/src/lib/cvController": { createCvController }, "@/src/services/siteSettingsService": { siteSettingsService: {} },
    "@/src/components/admin/ProtectedRoute": ({ children }) => children,
    "@/src/components/admin/AdminLayout": ({ children }) => children,
    "@/src/components/admin/uploads/FileUploadField": () => null,
  });
  const html = renderToStaticMarkup(Page());
  assert.match(html, /role="alert"/); assert.match(html, /Reintentar consulta/);
  assert.doesNotMatch(html, /Consulta correcta: no hay/);
});

for (const [folder, name, model, count] of [
  ["projects", "Project", "project", 1], ["cyber-labs", "CyberLab", "cyberLab", 2],
  ["certifications", "Certification", "certification", 1], ["education", "Education", "education", 1],
  ["blog", "BlogPost", "blogPost", 2],
]) {
  test(`${name}: real field callbacks map all references into the saved payload behind the shared guard`, async () => {
    const host = hooks(), formHost = hooks(); let values, payload, saves = 0;
    const shared = loadTs("src/components/admin/uploads/UploadForm.tsx", { react: formHost.react, "@/src/lib/uploadCoordinator": { createUploadCoordinator } });
    const Field = () => null;
    const mocks = {
      react: host.react,
      "react-hook-form": {
        useForm: ({ defaultValues }) => {
          values = structuredClone(defaultValues);
          return { register: () => ({}), control: {}, formState: { errors: {} },
            setValue: (name, value) => { values[name] = value; }, getValues: name => values[name],
            handleSubmit: callback => () => callback(values) };
        },
        useWatch: ({ name }) => values[name],
      },
      "@hookform/resolvers/zod": { zodResolver: () => null },
      "@/src/components/admin/FormErrors": { default: () => null, accessibleRegister: register => register },
      "@/src/components/admin/uploads/UploadForm": shared,
      "@/src/components/admin/uploads/FileUploadField": Field,
      "@/src/components/admin/blog/MarkdownPreview": { default: () => null },
      "./ProjectGalleryFields": { default: () => null },
      "@/src/lib/cn": { cn: (...args) => args.join(" ") },
      "@/src/lib/publicLinks": loadTs("src/lib/publicLinks.ts"),
      [`@/src/lib/validations/${model}`]: {},
      [`@/src/lib/${model}Form`]: loadTs(`src/lib/${model}Form.ts`),
      [`@/src/lib/${model}Labels`]: loadTs(`src/lib/${model}Labels.ts`),
    };
    const { default: Component } = loadTs(`src/components/admin/${folder}/${name}Form.tsx`, mocks);
    const tree = host.render(() => Component({ submitLabel: "Guardar", onCancel() {}, onSubmit: async result => { payload = result; saves++; } }));
    assert.equal(tree.type, shared.default, "consumer must use the guarded form");
    const rendered = formHost.render(() => shared.default(tree.props));
    const coordinator = rendered.props.value.coordinator;
    const fields = [];
    const visit = node => { if (node?.type === Field) fields.push(node); React.Children.toArray(node?.props?.children).forEach(visit); };
    visit(tree); assert.equal(fields.length, count);
    const releases = fields.map(() => coordinator.beginUpload());
    const submit = () => find(rendered, n => n.type === "form").props.onSubmit({ preventDefault() {} });
    await submit(); assert.equal(saves, 0);
    for (const [index, node] of fields.entries()) {
      node.props.onChange({ ...asset, publicId: `new-${index}`, secureUrl: `https://example.com/new-${index}` });
      releases[index]();
      if (index < fields.length - 1) { await submit(); assert.equal(saves, 0); }
    }
    await submit(); assert.equal(saves, 1);
    for (let i = 0; i < count; i++) {
      assert.ok(JSON.stringify(payload).includes(`https://example.com/new-${i}`));
      assert.ok(JSON.stringify(payload).includes(`"new-${i}"`));
    }
  });
}

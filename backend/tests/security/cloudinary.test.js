const { test, mock, after } = require("node:test");
const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: "fixture", CLOUDINARY_API_KEY: "fixture", CLOUDINARY_API_SECRET: "fixture" });
const cloudinary = require("../../src/config/cloudinary");
const { uploadImageToCloudinary, deleteFromCloudinary } = require("../../src/services/upload.service");
after(() => mock.restoreAll());
test("simultaneous same-name uploads have distinct IDs and cannot overwrite an asset", { concurrency: false }, async () => {
  const optionsSeen = [];
  mock.method(Date, "now", () => 123456789);
  mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    optionsSeen.push(options);
    const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
    stream.on("finish", () => callback(null, { resource_type: "image", public_id: options.public_id, secure_url: "https://example.com/file.png" }));
    return stream;
  });
  const file = { originalname: "same.png", buffer: Buffer.from("fixture") };
  const results = await Promise.all([1, 2].map(() => uploadImageToCloudinary(file, "portfolio/projects", "test")));
  assert.notEqual(results[0].publicId, results[1].publicId);
  assert.ok(optionsSeen.every((options) => options.overwrite === false && options.resource_type === "image"));
  assert.ok(optionsSeen.every((options) => !/\.(png|jpe?g|webp|gif|pdf)$/i.test(options.public_id)));
  assert.ok(results.every((result) => result.secureUrl && result.resourceType === "image" && result.originalName === "same.png"));
});
test("deletion requires Cloudinary confirmation and treats already-missing assets idempotently", { concurrency: false }, async () => {
  const destroy = mock.method(cloudinary.uploader, "destroy", async () => ({ result: "not found" }));
  await deleteFromCloudinary("portfolio/test", "image", "test");
  destroy.mock.mockImplementation(async () => ({ result: "unexpected" }));
  await assert.rejects(deleteFromCloudinary("portfolio/test", "image", "test"), /confirm asset deletion/);
});
test("raw PDFs use the validated type and a unique public_id ending in .pdf", { concurrency: false }, async () => {
  const optionsSeen = [];
  mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    optionsSeen.push(options);
    const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
    stream.on("finish", () => callback(null, {
      resource_type: "raw",
      public_id: options.public_id,
      secure_url: "https://fixture.example/file.pdf",
      url: "http://fixture.example/file.pdf",
      bytes: 4,
    }));
    return stream;
  });
  const { uploadPdfToCloudinary } = require("../../src/services/upload.service");
  const file = {
    originalname: "curriculum",
    buffer: Buffer.from("%PDF"),
    validatedKind: "pdf",
    validatedMime: "application/pdf",
  };
  const first = await uploadPdfToCloudinary(file, "portfolio/cv", "cv", { requestId: "req-pdf" });
  const second = await uploadPdfToCloudinary(file, "portfolio/cv", "cv", { requestId: "req-pdf" });
  assert.notEqual(first.publicId, second.publicId);
  assert.equal(first.resourceType, "raw");
  assert.equal(first.originalName, "curriculum");
  assert.equal(first.secureUrl, "https://fixture.example/file.pdf");
  for (const options of optionsSeen) {
    assert.equal(options.resource_type, "raw");
    assert.equal(options.folder, "portfolio/cv");
    assert.equal(options.overwrite, false);
    assert.match(options.public_id, /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/);
    assert.equal(options.public_id.endsWith(".pdf.pdf"), false);
  }
});
test("a raw upload without a validated PDF never reaches Cloudinary", { concurrency: false }, async () => {
  let calls = 0;
  mock.method(cloudinary.uploader, "upload_stream", () => { calls += 1; throw new Error("uploader must not be called"); });
  const { uploadPdfToCloudinary } = require("../../src/services/upload.service");
  await assert.rejects(
    uploadPdfToCloudinary({ originalname: "falso.pdf", buffer: Buffer.from("nope") }, "portfolio/cv", "cv"),
    /PDF upload failed/
  );
  assert.equal(calls, 0);
});
test("image names that end in .pdf do not become raw identifiers", { concurrency: false }, async () => {
  const optionsSeen = [];
  mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    optionsSeen.push(options);
    const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
    stream.on("finish", () => callback(null, { resource_type: "image", public_id: options.public_id, secure_url: "https://fixture.example/file.png" }));
    return stream;
  });
  const { uploadImageToCloudinary } = require("../../src/services/upload.service");
  await uploadImageToCloudinary({
    originalname: "foto.pdf",
    buffer: Buffer.from("png"),
    validatedKind: "image",
    validatedMime: "image/png",
  }, "portfolio/projects", "project-image");
  assert.equal(optionsSeen[0].resource_type, "image");
  assert.equal(optionsSeen[0].overwrite, false);
  assert.equal(optionsSeen[0].public_id.endsWith(".pdf"), false);
  assert.equal(optionsSeen[0].public_id.endsWith(".png"), false);
});

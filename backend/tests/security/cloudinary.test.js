const { test, mock, after } = require("node:test");
const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: "fixture", CLOUDINARY_API_KEY: "fixture", CLOUDINARY_API_SECRET: "fixture" });
const cloudinary = require("../../src/config/cloudinary");
const { uploadImageToCloudinary, deleteFromCloudinary } = require("../../src/services/upload.service");
after(() => mock.restoreAll());
test("simultaneous same-name uploads have distinct IDs and cannot overwrite an asset", async () => {
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
  assert.ok(optionsSeen.every((options) => options.overwrite === false));
});
test("deletion requires Cloudinary confirmation and treats already-missing assets idempotently", async () => {
  const destroy = mock.method(cloudinary.uploader, "destroy", async () => ({ result: "not found" }));
  await deleteFromCloudinary("portfolio/test", "image", "test");
  destroy.mock.mockImplementation(async () => ({ result: "unexpected" }));
  await assert.rejects(deleteFromCloudinary("portfolio/test", "image", "test"), /confirm asset deletion/);
});

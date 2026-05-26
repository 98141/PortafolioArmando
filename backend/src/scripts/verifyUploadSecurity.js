/**
 * Quick validation checks for Sprint 7.1 upload hardening.
 * Run: node src/scripts/verifyUploadSecurity.js
 */
const AppError = require("../utils/AppError");
const { validateDeletePayload } = require("../utils/validateUploadDelete");
const { assertMagicBytes } = require("../middlewares/validateFileMagic");

const run = async () => {
  let passed = 0;
  let failed = 0;

  const assertThrows = async (label, fn, expectedMessagePart) => {
    try {
      await fn();
      console.error(`FAIL ${label}: expected throw`);
      failed += 1;
    } catch (err) {
      if (
        err instanceof AppError &&
        (!expectedMessagePart || err.message.includes(expectedMessagePart))
      ) {
        console.log(`OK   ${label}`);
        passed += 1;
      } else {
        console.error(`FAIL ${label}:`, err.message);
        failed += 1;
      }
    }
  };

  const assertOk = async (label, fn) => {
    try {
      await fn();
      console.log(`OK   ${label}`);
      passed += 1;
    } catch (err) {
      console.error(`FAIL ${label}:`, err.message);
      failed += 1;
    }
  };

  // DELETE namespace / resourceType
  await assertThrows("delete invalid resourceType", () => {
    validateDeletePayload("portfolio/test", "video");
  }, "resourceType");

  await assertThrows("delete outside portfolio namespace", () => {
    validateDeletePayload("other/test", "image");
  }, "portfolio");

  await assertOk("delete valid portfolio asset", () => {
    const result = validateDeletePayload("portfolio/projects/test-1", "image");
    if (result.publicId !== "portfolio/projects/test-1") {
      throw new Error("unexpected publicId");
    }
  });

  // Magic bytes — minimal PNG header (8 bytes) may not be enough for file-type; use full tiny PNG
  // 1x1 PNG base64
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  await assertOk("valid png image magic", async () => {
    await assertMagicBytes(
      { buffer: pngBuffer, mimetype: "image/png", originalname: "test.png" },
      "image"
    );
  });

  await assertThrows("exe renamed as jpg", async () => {
    const fakeExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
    await assertMagicBytes(
      {
        buffer: fakeExe,
        mimetype: "image/jpeg",
        originalname: "malware.jpg",
      },
      "image"
    );
  });

  await assertThrows("pdf endpoint rejects png content", async () => {
    await assertMagicBytes(
      { buffer: pngBuffer, mimetype: "application/pdf", originalname: "fake.pdf" },
      "pdf"
    );
  });

  // PDF magic: %PDF-
  const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n", "utf8");

  await assertOk("valid pdf magic", async () => {
    await assertMagicBytes(
      { buffer: pdfBuffer, mimetype: "application/pdf", originalname: "report.pdf" },
      "pdf"
    );
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

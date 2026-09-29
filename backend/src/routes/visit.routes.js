const express = require("express");
const { createHash } = require("node:crypto");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const requireTrustedOrigin = require("../middlewares/requireTrustedOrigin");

const schema = z.object({ sessionId: z.uuidv4() }).strict();
const automated = /bot\b|crawler|spider|headless|lighthouse|pagespeed|google-inspectiontool/i;

function createVisitRouter({ store, limit = 30 } = {}) {
  if (!store) {
    const Visit = require("../models/visit.model");
    store = {
      record: (id) => Visit.updateOne({ _id: id }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true, maxTimeMS: 3000 }),
      total: () => Visit.countDocuments({}).maxTimeMS(3000),
    };
  }
  const router = express.Router();
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  async function total(res) {
    const visits = await store.total();
    res.json({ status: "success", data: { visits } });
  }
  router.get("/", catchAsync(async (_req, res) => total(res)));
  router.post("/", requireTrustedOrigin, rateLimit({
    windowMs: 60 * 60 * 1000, limit, standardHeaders: "draft-8", legacyHeaders: false,
    message: { status: "error", message: "Demasiadas solicitudes al contador." },
  }), catchAsync(async (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(new AppError("Sesión de visita inválida.", 400));
    if (!automated.test(req.get("user-agent") || "")) {
      const id = createHash("sha256").update(parsed.data.sessionId).digest("hex");
      try { await store.record(id); }
      catch (error) {
        // Two processes can race to create the same primary key; both count as one.
        if (error.code !== 11000) throw error;
      }
    }
    await total(res);
  }));
  return router;
}

module.exports = { createVisitRouter };

const express = require("express");

function createHealthRouter({ connection, isDraining = () => false, timeoutMs = 1000, cacheMs = 5000 }) {
  const router = express.Router();
  const startedAt = Date.now();
  let pending, lastCheck = 0, lastResult = false;
  async function databaseReady() {
    if (isDraining() || connection.readyState !== 1) return false;
    if (Date.now() - lastCheck < cacheMs) return lastResult;
    if (!pending) {
      pending = (async () => {
        let timer;
        try {
          await Promise.race([
            Promise.resolve().then(() => connection.db.command({ ping: 1 }, { timeoutMS: timeoutMs, maxTimeMS: timeoutMs })),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Readiness timeout")), timeoutMs); }),
          ]);
          lastResult = true;
        } catch {
          lastResult = false;
        } finally {
          clearTimeout(timer);
          lastCheck = Date.now();
        }
        return lastResult;
      })().finally(() => { pending = undefined; });
    }
    return pending;
  }
  router.use(["/health", "/ready"], (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.get("/health", (_req, res) => {
    res.json({ status: "success", data: { uptime: Math.floor((Date.now() - startedAt) / 1000), timestamp: new Date().toISOString() } });
  });
  router.get("/ready", async (_req, res) => {
    const ready = await databaseReady() && !isDraining() && connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? "success" : "error", data: { ready } });
  });
  return router;
}

module.exports = { createHealthRouter };

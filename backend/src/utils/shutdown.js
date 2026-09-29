// Node 24 server.close stops accepting connections and drains active HTTP requests.
function createShutdown({ server, disconnect, markDraining, exit = process.exit, timeoutMs = 10000, logger = console }) {
  let started = false, finished = false;
  server.on?.("request", (_req, res) => {
    res.once("finish", () => {
      // Active keep-alive sockets can become idle after close() was called.
      if (started) setImmediate(() => server.closeIdleConnections());
    });
  });
  return function shutdown(reason, exitCode = 0) {
    if (started) return;
    started = true;
    markDraining();
    logger.info(`Shutdown started: ${reason}`);
    const timer = setTimeout(() => {
      finished = true;
      logger.error("Shutdown deadline exceeded");
      server.closeAllConnections();
      exit(1);
    }, timeoutMs);
    server.close(async (error) => {
      try {
        await disconnect();
        if (error) exitCode = 1;
      } catch {
        logger.error("Database disconnect failed");
        exitCode = 1;
      } finally {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          exit(exitCode);
        }
      }
    });
  };
}

module.exports = { createShutdown };

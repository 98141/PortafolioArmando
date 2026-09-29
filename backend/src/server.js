const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { validateEnv } = require("./config/env");
const { createShutdown } = require("./utils/shutdown");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    const app = require("./app");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    const shutdown = createShutdown({
      server,
      disconnect: () => mongoose.disconnect(),
      markDraining: () => { app.locals.draining = true; },
    });
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    server.on("error", () => shutdown("HTTP server error", 1));
  } catch (error) {
    console.error("Server startup error:", error.message || error);
    process.exit(1);
  }
}

startServer();

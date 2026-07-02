const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { validateEnv } = require("./config/env");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message || error);
    process.exit(1);
  }
}

startServer();

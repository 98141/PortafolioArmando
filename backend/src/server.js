require("dotenv").config();

const mongoose = require("mongoose");
const { validateEnv } = require("./config/env");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await mongoose.connect(process.env.MONGO_URI);
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

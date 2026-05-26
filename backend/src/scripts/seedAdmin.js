/**
 * Optional seed script to create the first admin user.
 * Usage: node src/scripts/seedAdmin.js
 *
 * Requires env: MONGO_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user.model");

async function seedAdmin() {
  const { SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, MONGO_URI } =
    process.env;

  if (!MONGO_URI || !SEED_ADMIN_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error(
      "Missing required env vars: MONGO_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("Admin user already exists:", existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL,
      password: SEED_ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin user created:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedAdmin();

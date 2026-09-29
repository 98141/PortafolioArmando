const mongoose = require("mongoose");

// One anonymous session receipt. The primary key makes concurrent retries idempotent.
const visitSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
}, { versionKey: false });

module.exports = mongoose.model("Visit", visitSchema);

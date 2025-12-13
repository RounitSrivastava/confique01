require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

console.log("Using MONGODB_URI:", uri ? "FOUND" : "MISSING");

mongoose
  .connect(uri) // ⬅️ no options
  .then(() => {
    console.log("✅ Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("⛔ Connect failed:", err.message);
    process.exit(1);
  });

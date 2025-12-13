import mongoose from "mongoose";

// Load env manually because Node ES modules do not auto-load .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing in .env.local");
  process.exit(1);
}

console.log("🔍 Testing MongoDB connection...");
console.log("URI:", uri.split("@")[1] ? "mongodb+srv://***:***@" + uri.split("@")[1] : uri); // hide password

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

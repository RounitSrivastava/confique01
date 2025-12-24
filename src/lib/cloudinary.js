// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/* ---------------------------------
   CONFIGURE CLOUDINARY (SAFE)
---------------------------------- */
if (
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_API_KEY &&
  CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  // DO NOT throw at import time — causes Next.js build to fail
  // eslint-disable-next-line no-console
  console.warn(
    "⚠️ Cloudinary envs missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable uploads."
  );
}

/* ---------------------------------
   SIGNED UPLOAD SIGNATURE
---------------------------------- */
/**
 * Generates a signed Cloudinary upload signature
 * @param {Object} params - Parameters to be signed (e.g. { folder })
 * @returns {Object} { timestamp, signature, apiKey, cloudName }
 */
export function getUploadSignature(params = {}) {
  if (
    !CLOUDINARY_CLOUD_NAME ||
    !CLOUDINARY_API_KEY ||
    !CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary envs not configured. Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Merge params + timestamp
  const toSignObj = { ...params, timestamp };

  // Filter undefined/null & sort keys (Cloudinary requirement)
  const sortedKeys = Object.keys(toSignObj)
    .filter((k) => toSignObj[k] !== undefined && toSignObj[k] !== null)
    .sort();

  const toSign = sortedKeys
    .map((k) => `${k}=${toSignObj[k]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + CLOUDINARY_API_SECRET)
    .digest("hex");

  return {
    timestamp,
    signature,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
}

export default cloudinary;

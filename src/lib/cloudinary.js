// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

// Configure cloudinary client when env is present
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });
} else {
    // Not throwing here — routes that actually need Cloudinary should check and raise a helpful error.
    // eslint-disable-next-line no-console
    console.warn(
        "Cloudinary envs not fully configured. CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are required for server-side Cloudinary operations."
    );
}

/**
 * getUploadSignature(params)
 * Returns an object with timestamp, signature, apiKey, cloudName.
 * Throws if server envs missing (only when actual signature is needed).
 *
 * Example:
 * const sig = getUploadSignature({ eager: 'w_400,h_300,c_fill' });
 * // { timestamp: 163..., signature: 'abc...', apiKey: '...', cloudName: '...' }
 * * 
 */
export function getUploadSignature(params = {}) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error(
            "Cloudinary server envs not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSignObj = { ...params, timestamp };

    // include only defined values and sort keys lexicographically
    const keys = Object.keys(toSignObj).filter((k) => toSignObj[k] !== undefined && toSignObj[k] !== null);
    keys.sort();

    const toSign = keys.map((k) => `${k}=${toSignObj[k]}`).join("&");
    const signature = crypto.createHash("sha1").update(toSign + CLOUDINARY_API_SECRET).digest("hex");

    return {
        timestamp,
        signature,
        apiKey: CLOUDINARY_API_KEY,
        cloudName: CLOUDINARY_CLOUD_NAME,
    };
}

export default cloudinary;
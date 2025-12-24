// src/lib/upload.js

/**
 * Upload a file to Cloudinary using a signed upload
 * @param {File | Blob} file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary(file, folder = "events") {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  try {
    /* ---------------------------------
        1. Get signed upload data
    ---------------------------------- */
    const sigRes = await fetch(
      `/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!sigRes.ok) {
      throw new Error(`Signature request failed (${sigRes.status})`);
    }

    const sigData = await sigRes.json();

    if (!sigData?.ok) {
      throw new Error("Invalid Cloudinary signature response");
    }

    /* ---------------------------------
        2. Prepare upload form data
    ---------------------------------- */
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", sigData.timestamp);
    formData.append("signature", sigData.signature);

    // Folder MUST match what was signed
    if (folder) {
      formData.append("folder", folder);
    }

    /* ---------------------------------
        3. Upload to Cloudinary
    ---------------------------------- */
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const uploadData = await uploadRes.json();

    if (!uploadData?.secure_url) {
      throw new Error("Upload succeeded but no secure_url returned");
    }

    return uploadData.secure_url;

  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw error;
  }
}

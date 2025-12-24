// src/lib/upload.js
export const uploadToCloudinary = async (file, folder = "events") => {
  if (!file) return null;

  try {
    // 1. Get signature from your existing API route
    // Note: Use the path to the route you created earlier (/api/cloudinary/sign)
    const sigRes = await fetch(`/api/cloudinary/sign?folder=${folder}`);
    const sigData = await sigRes.json();

    if (!sigData.ok) throw new Error("Failed to get upload signature");

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", sigData.timestamp);
    formData.append("signature", sigData.signature);
    formData.append("folder", folder); // Must match what was signed

    // 3. Upload to Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url; // This is the URL we save to MongoDB
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
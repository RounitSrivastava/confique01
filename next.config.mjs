/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ Compress responses with gzip
  compress: true,

  // ⚡ Optimize images from external sources (Cloudinary, etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // cache optimized images for 1 hour
  },

  async headers() {
    return [
      {
        source: "/auth/login",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      // ⚡ Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ⚡ Cache public images
      {
        source: "/:path*.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/:path*.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
// app/sitemap.js

export default function sitemap() {
  const baseUrl = "https://www.confique.com"; // change if needed

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/groups`,   // ✅ Community
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/events`,   // ✅ Events
      lastModified: new Date(),
    },

    // optional (usually not required for SEO)
    {
      url: `${baseUrl}/auth/login`,
    },
    {
      url: `${baseUrl}/auth/register`,
    },
    {
      url: `${baseUrl}/terms`,
    },
  ];
}

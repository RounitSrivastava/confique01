import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="b6WXAF92noiyLCjwQL1nEi165BWLLJdeZttXM_StkmQ"
        />

        {/* Basic SEO */}
        <title>Confique</title>
        <meta
          name="description"
          content="Confique is a modern event management platform to host, discover, and register for tech, cultural, and startup events."
        />
        <link rel="icon" href="/confiquelogo.png" />
      </head>

      <body className="min-h-screen bg-black text-white antialiased">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <ClientLayout>{children}</ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

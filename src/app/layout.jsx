// app/layout.jsx
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  const pathname = headers().get("x-pathname") || "";

  const isLeaderboard = pathname.includes("/leaderboard");

  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />

        <Script strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              debug_mode: true
            });
          `}
        </Script>
      </head>

      <body className="min-h-screen bg-black text-white antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          {isLeaderboard ? (
            children
          ) : (
            <ClientLayout>{children}</ClientLayout>
          )}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
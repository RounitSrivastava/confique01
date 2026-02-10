// app/layout.jsx
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";

export const metadata = {
  title: "Confique",
  description: "Student community and event hosting platform",
  icons: {
    icon: "/confiquelogo.png",
    shortcut: "/confiquelogo.png",
    apple: "/confiquelogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Analytics */}
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
  page_path: window.location.pathname,
});
          `}
        </Script>
      </head>

      <body className="min-h-screen bg-black text-white antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <ClientLayout>{children}</ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

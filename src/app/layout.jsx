import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";

export const metadata = {
  icons: {
    icon: "/confiquelogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-42LH7NZH6Z`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-42LH7NZH6Z', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body className="bg-black text-white">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <ClientLayout>{children}</ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
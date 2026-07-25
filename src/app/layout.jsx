import "./globals.css";
import ClientLayout from "./ClientLayout";
import CustomThemeProvider from "@/components/CustomThemeProvider";

import Script from "next/script";

export const metadata = {
  title: "Confique",
  description: "A platform for communities, events, and quizzes",
  icons: {
    icon: "/confiquelogo.png",
  },
}; // Force HMR update 2

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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

      <body className="bg-bg-1 text-text-1">
        <CustomThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </CustomThemeProvider>
      </body>
    </html> 
  );
}
// app/layout.jsx
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata = {
  title: "Confique",
  description: "Event Management Platform",
  icons: {
    icon: "/confiquelogo.png",        // 👈 browser tab logo
    shortcut: "/confiquelogo.png",
    apple: "/confiquelogo.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-black text-white antialiased">
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
          <ClientLayout>{children}</ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

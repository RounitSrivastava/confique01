// app/layout.jsx
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Event Platform",
  description: "Event Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-black text-white antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

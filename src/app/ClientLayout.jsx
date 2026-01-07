"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";
// 1. Import the Provider
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 2. Get the Client ID from env
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  // Helper to wrap with Google Provider
  const withGoogleProvider = (content) => (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );

  /* 🔹 AUTH PAGES */
  if (isAuthPage) {
    return withGoogleProvider(
      <div className="min-h-screen w-full bg-[#0d0d0d] text-white">
        {children}
      </div>
    );
  }

  /* 🔹 EVENTS PAGE */
  if (isEventsPage) {
    return withGoogleProvider(
      <div className="h-screen w-full bg-[#0d0d0d] text-white overflow-hidden">
        <main className="h-full w-full overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  /* 🔹 DEFAULT 3-COLUMN */
  return withGoogleProvider(
    <div className="h-screen w-full bg-[#0d0d0d] text-white overflow-hidden flex flex-col">
      <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden min-w-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-y-auto pt-3">
          <div className="mx-auto max-w-[1200px] px-3">
            {children}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
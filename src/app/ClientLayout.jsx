"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Extract Client ID
  // Note: Ensure this is defined in .env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // 2. Determine Page Type
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  // 3. Logic to wrap content with Provider
  // We use useMemo to prevent the provider from re-mounting unnecessarily 
  const contentWithAuth = useMemo(() => {
    const renderContent = () => {
      /* 🔹 AUTH PAGES */
      if (isAuthPage) {
        return (
          <div className="min-h-screen w-full bg-[#0d0d0d] text-white">
            {children}
          </div>
        );
      }

      /* 🔹 EVENTS PAGE */
      if (isEventsPage) {
        return (
          <div className="h-screen w-full bg-[#0d0d0d] text-white overflow-hidden">
            <main className="h-full w-full overflow-y-auto">
              {children}
            </main>
          </div>
        );
      }

      /* 🔹 DEFAULT 3-COLUMN LAYOUT */
      return (
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
    };

    // If no client ID is found, Google Login will fail to init
    if (!googleClientId) {
      console.warn("Google Client ID is missing. Check your environment variables.");
      return renderContent();
    }

    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {renderContent()}
      </GoogleOAuthProvider>
    );
  }, [isAuthPage, isEventsPage, children, sidebarOpen, googleClientId]);

  return contentWithAuth;
}
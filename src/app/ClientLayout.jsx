"use client";

import { useState, useMemo, Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  const contentWithAuth = useMemo(() => {
    const renderContent = () => {
      if (isAuthPage) {
        return (
          <div className="min-h-screen w-full bg-bg-4 text-text-1">
            {children}
          </div>
        );
      }

      if (isEventsPage) {
        return (
          <div className="h-screen w-full bg-bg-4 text-text-1 overflow-hidden">
            <main className="h-full w-full overflow-y-auto">
              {children}
            </main>
          </div>
        );
      }

      return (
        <div className="h-screen w-full bg-bg-4 text-text-1 overflow-hidden flex flex-col">
          <Topbar
            onToggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
          />

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

    if (!googleClientId) {
      console.warn(
        "Google Client ID is missing. Check your environment variables."
      );

      return (
        <>
          <Suspense fallback={null}>
            <GoogleAnalytics
              gaId={process.env.NEXT_PUBLIC_GA_ID}
            />
          </Suspense>

          {renderContent()}
        </>
      );
    }

    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <Suspense fallback={null}>
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GA_ID}
          />
        </Suspense>

        {renderContent()}
      </GoogleOAuthProvider>
    );
  }, [
    isAuthPage,
    isEventsPage,
    children,
    sidebarOpen,
    googleClientId,
  ]);

  return contentWithAuth;
}
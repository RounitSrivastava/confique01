// app/ClientLayout.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Conditions
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* ---------- AUTH PAGES LAYOUT ---------- */}
      {isAuthPage && (
        <div className="flex-1">
          {children}
        </div>
      )}

      {/* ---------- EVENTS PAGE LAYOUT ---------- */}
      {!isAuthPage && isEventsPage && (
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
            {children}
          </main>
        </div>
      )}

      {/* ---------- DEFAULT LAYOUT ---------- */}
      {!isAuthPage && !isEventsPage && (
        <>
          <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
              {children}
            </main>

            <RightSidebar />
          </div>
        </>
      )}
    </div>
  );
}

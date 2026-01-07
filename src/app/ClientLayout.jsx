"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  /* ===============================
     🔹 AUTH PAGES (FULL PAGE)
  =============================== */
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-screen bg-[#0d0d0d] text-white">
        {children}
      </div>
    );
  }

  /* ===============================
     🔹 EVENTS PAGE (NO GAP FIXED)
  =============================== */
  if (isEventsPage) {
    return (
      <div className="h-screen w-screen bg-[#0d0d0d] text-white overflow-hidden">
        {/* ❌ NO padding here → removes corner gaps */}
        <main className="h-full w-full overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  /* ===============================
     🔹 DEFAULT 3-COLUMN LAYOUT
  =============================== */
  return (
    <div className="h-screen w-screen bg-[#0d0d0d] text-white overflow-hidden flex flex-col">
      <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 🌟 MAIN SCROLL AREA */}
       <main className="flex-1 overflow-y-auto px-4 md:px-6">

          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}

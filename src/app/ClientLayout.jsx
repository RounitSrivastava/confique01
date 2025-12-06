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

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  // 🔹 Auth pages – full page, normal scroll
  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0d0d0d] text-white">{children}</div>;
  }

  // 🔹 Events page – own layout + middle scroll
  if (isEventsPage) {
    return (
      <div className="h-screen overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    );
  }

  // 🔹 Default 3-column layout
  return (
    <div className="h-screen overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
      <Topbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar (non-scrolling container, scroll only inside if needed) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 🌟 ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Right sidebar stays fixed in layout */}
        <RightSidebar />
      </div>
    </div>
  );
}

// app/ClientLayout.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); // 👈 STATE

  // Standalone pages
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  const isEventsPage = pathname === "/events";

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isEventsPage) {
    return (
      <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
          {children}
        </main>
      </div>
    );
  }

  // Default layout
  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
      {/* TOPBAR — passes toggle */}
      <Topbar
        onToggleSidebar={() => {
          setSidebarOpen((prev) => !prev);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR — receives state */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
          {children}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

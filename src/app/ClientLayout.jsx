// app/ClientLayout.jsx
"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";


export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // 1. Existing check for standalone pages (Auth, Terms, etc.)
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  // 2. New check to hide all navigation components for the /events page
  const isEventsPage = pathname === "/events";

  // If we are on an Auth/Terms page, return standalone content.
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // If we are on the /events page, return only the main content (full width).
  // This effectively removes Topbar, Sidebar, and RightSidebar.
  if (isEventsPage) {
    return (
      <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
          {children}
        </main>
      </div>
    );
  }

  // Default layout for all other application pages (Home, Groups, etc.)
  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]">
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
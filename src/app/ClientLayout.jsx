"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Topbar from "@/components/Topbar";


export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/terms";

  if (isAuthPage) {
    // Auth pages are standalone, no sidebar/topbar
    return <div className="min-h-screen">{children}</div>;
  }

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

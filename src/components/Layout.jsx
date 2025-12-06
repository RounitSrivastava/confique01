// // components/Layout.jsx
// "use client";

// import { useState } from "react";
// import Sidebar from "@/components/Sidebar";
// import Topbar from "@/components/Topbar";

// export default function ClientLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       {/* SIDEBAR */}
//       <Sidebar
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//       />

//       {/* MAIN AREA */}
//       <div className="flex-1 flex flex-col">
//         <Topbar
//           onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
//         />
//         <main className="flex-1">{children}</main>
//       </div>
//     </div>
//   );
// }

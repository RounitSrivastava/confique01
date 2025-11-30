// components/Topbar.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, ChevronDown, LogOut, Settings, User, Search } from "lucide-react";
import { useRouter } from "next/navigation";


const notifications = [
  { id: 1, title: "New comment on your post", time: "2m ago" },
  { id: 2, title: "Event Reminder: Design Meetup 6 PM", time: "1h ago" },
  { id: 3, title: "Group invite accepted by Lina", time: "Yesterday" },
];

export default function Topbar() {
  const [openBell, setOpenBell] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const router = useRouter();


  return (
    <header className="sticky top-0 z-40 border-b border-[#262626] bg-[#0d0d0d]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0d0d0d]/60">
      <div className="mx-auto max-w-[1600px] px-3 md:px-6 h-16 flex items-center gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold">C</span>
          </div>
          <span className="hidden sm:block font-medium tracking-wide">Confique</span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search posts, people, events..."
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#262626] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenBell((v) => !v);
                setOpenUser(false);
              }}
              className="relative rounded-xl p-2 hover:bg-[#1a1a1a] border border-transparent hover:border-[#262626] transition"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-300" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500" />
            </button>

            {openBell && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border border-[#262626] bg-[#1a1a1a] shadow-sm overflow-hidden"
                onMouseLeave={() => setOpenBell(false)}
              >
                <div className="px-4 py-3 border-b border-[#262626] font-medium">Notifications</div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 hover:bg-[#111] transition border-b border-[#262626]/60 last:border-0"
                    >
                      <p className="text-sm">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenUser((v) => !v);
                setOpenBell(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-[#262626] bg-[#1a1a1a] px-2 py-1.5 hover:bg-[#141414] transition"
            >
              <Image
                src="/avatar-1.png"
                alt="User"
                width={24}
                height={24}
                className="rounded-md object-cover"
              />
              <span className="hidden sm:block text-sm">Gery Thomas</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {openUser && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-[#262626] bg-[#1a1a1a] shadow-sm overflow-hidden"
                onMouseLeave={() => setOpenUser(false)}
              >
                <button
  onClick={() => router.push("/profile/details")}
  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#111] transition"
>
  <User className="h-4 w-4 text-gray-300" /> Profile
</button>

                <button className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#111] transition">
                  <Settings className="h-4 w-4 text-gray-300" /> Settings
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-[#111] transition">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

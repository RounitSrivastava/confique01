"use client";
import { useState } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-900 text-text-1 px-3 py-2 rounded-lg hover:bg-bg-3"
      >
        <img
          src="/images/avatar.jpg"
          alt="User"
          className="w-8 h-8 rounded-full border border-gray-700"
        />
        <span>John Doe</span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          <a
            href="/profile/details"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <User size={16} /> Profile
          </a>
          <a
            href="/profile/settings"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <Settings size={16} /> Settings
          </a>
          <button
            onClick={() => alert("Logout clicked")}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

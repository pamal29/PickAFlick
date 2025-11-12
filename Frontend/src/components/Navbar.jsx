import React, { useState } from "react";
import { Bell, User, TextAlignJustify, Search, X } from "lucide-react";

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showNavs, setShowNavs] = useState(false);

  return (
    <div className="relative bg-black min-h-[7vh] text-neongreen flex items-center justify-between px-10 mb-2">
      {/* Left side */}
      <div className="flex items-center text-3xl font-bold">
        {/* Hamburger toggle */}
        {!showNavs ? (
          <TextAlignJustify
            className="cursor-pointer hover:scale-110 mr-8 mt-[6px] transition"
            onClick={() => setShowNavs(true)}
          />
        ) : (
          <X
            className="cursor-pointer hover:scale-110 mr-8 mt-[6px] transition"
            onClick={() => setShowNavs(false)}
          />
        )}

        SteamNest
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-8">
        {!showSearch && (
          <Search
            className="cursor-pointer hover:text-white transition hover:scale-110"
            onClick={() => setShowSearch(true)}
          />
        )}

        {showSearch && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none border-b border-neongreen text-white"
              autoFocus
            />
            <X
              className="cursor-pointer hover:text-white transition"
              onClick={() => setShowSearch(false)}
            />
          </div>
        )}

        <Bell className="cursor-pointer hover:scale-110 transition" />
        <User className="cursor-pointer hover:scale-110 transition" />
      </div>

      {/* Dropdown menu */}
      {showNavs && (
        <div className="absolute top-full left-0 w-64 bg-gray-900 text-white p-6 shadow-lg rounded-b-2xl animate-slideDown z-50">
          <ul className="space-y-4">
            <li className="cursor-pointer hover:text-neongreen transition">Home</li>
            <li className="cursor-pointer hover:text-neongreen transition">Games</li>
            <li className="cursor-pointer hover:text-neongreen transition">Movies</li>
            <li className="cursor-pointer hover:text-neongreen transition">Profile</li>
          </ul>
        </div>
      )}
    </div>
  );
}

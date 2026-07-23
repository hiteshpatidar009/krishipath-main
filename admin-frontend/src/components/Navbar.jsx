import React from "react";
import { Bell, Settings, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="hidden md:flex items-center justify-between bg-white px-6 py-3 shadow-sm fixed top-0 left-64 right-0 z-30 border-b border-gray-100">
      {/* Context Area */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        {localStorage.getItem("role") === "admin" && (
          <select className="bg-green-50 text-green-800 border border-green-200 rounded-lg px-3 py-2 outline-none text-sm font-medium cursor-pointer">
            <option value="MANDI_1">Indore Agriculture Market</option>
            <option value="MANDI_2">Bhopal Main Mandi</option>
          </select>
        )}
        <div className="flex items-center w-full bg-gray-50 border rounded-xl px-3 py-2 focus-within:ring-2 ring-green-100 focus-within:border-green-300 transition-all">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-gray-700 w-full text-sm"
          />
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
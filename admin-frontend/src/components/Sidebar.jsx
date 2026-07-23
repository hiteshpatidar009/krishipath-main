import { Link } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const role = localStorage.getItem("role") || "admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const superAdminMenus = [
    { name: "Dashboard", icon: "📊", path: "/superadmin/dashboard" },
    { name: "Mandis Directory", icon: "🏢", path: "/superadmin/mandis" },
    { name: "Global Crops", icon: "🌾", path: "/superadmin/crops" },
    { name: "Languages", icon: "🌐", path: "/superadmin/languages" },
    { name: "Manage Admins", icon: "👥", path: "/superadmin/admins" },
  ];

  const adminMenus = [
    { name: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { name: "Local Crops", icon: "🌾", path: "/admin/crops" },
    { name: "Mandi Traders", icon: "🧑‍🌾", path: "/admin/traders" },
    { name: "Daily Prices", icon: "💰", path: "/admin/prices", highlight: true },
  ];

  const menuItems = role === "superadmin" ? superAdminMenus : adminMenus;
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 flex items-center px-6 border-b border-gray-200 overflow-x-hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-gray-700 text-3xl p-1 hover:bg-gray-100 rounded-lg transition mr-4"
        >
          ☰
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">A</span>
          </div>

          <h1 className="text-gray-800 font-bold text-lg hidden sm:block truncate">
            {role === "superadmin" ? "Super Admin" : "Admin"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm capitalize hidden sm:block font-medium truncate">
            {role}
          </span>
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center cursor-pointer hover:bg-teal-200 transition">
            👤
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 max-w-full bg-slate-50 text-gray-800 shadow-sm border-r border-gray-200 overflow-y-auto overflow-x-hidden transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:hidden p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold">Menu</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-700 text-2xl hover:bg-gray-200 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-3 space-y-1 w-full">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 w-full break-words ${
                item.highlight
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold"
                  : "bg-white hover:bg-gray-100 text-gray-700 font-medium border border-gray-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm break-words">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mx-4 my-3 h-px bg-gray-200"></div>

        <div className="p-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-white transition duration-200"
          >
            🚪
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 top-16"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 mt-16 bg-white min-h-[calc(100vh-64px)] overflow-x-hidden">
        {/* Your page content */}
      </main>
    </>
  );
}

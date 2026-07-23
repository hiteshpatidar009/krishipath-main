import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
// export default function SuperAdminLayout({ children }) {
//   return (
//     <div className="min-h-screen flex">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white p-4">
//         <h2 className="text-xl font-bold mb-4">Super Admin</h2>
//         {/* Add menu items */}
//       </aside>

//       {/* Page Content */}
//       <main className="flex-1 bg-gray-100 p-6">
//         {children}
//       </main>
//     </div>
//   );
// }

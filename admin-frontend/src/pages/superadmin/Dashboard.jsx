import React from "react";
import { Building2, Globe2, Languages, Users } from "lucide-react";

export default function SADashboard() {
  const stats = [
    { label: "Active Mandis", value: "24", icon: <Building2 size={24} />, color: "text-green-600 bg-green-100 border-green-200" },
    { label: "Global Crops", value: "156", icon: <Globe2 size={24} />, color: "text-amber-600 bg-amber-100 border-amber-200" },
    { label: "Supported Languages", value: "4", icon: <Languages size={24} />, color: "text-blue-600 bg-blue-100 border-blue-200" },
    { label: "Total Admins", value: "12", icon: <Users size={24} />, color: "text-purple-600 bg-purple-100 border-purple-200" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Super Admin dashboard for KrishiPath global settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
            <div className={`p-4 rounded-xl border ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Mandi Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">M</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Indore Agriculture Market updated prices</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <span className="font-medium text-sm text-gray-700">API Servers</span>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <span className="font-medium text-sm text-gray-700">Redis Cache</span>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <span className="font-medium text-sm text-gray-700">PostgreSQL DB1</span>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
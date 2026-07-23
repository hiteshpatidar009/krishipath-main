import React, { useState, useEffect } from "react";
import { LineChart, Store, UserCheck, TrendingUp } from "lucide-react";
import { getMandiDetails } from "../../services/mandiAdminAPI";

export default function AdminDashboard() {
  const [mandiName, setMandiName] = useState("Loading...");

  // Mocking the Context Switcher's selected mandi for now.
  // In a real app, this would come from a global Context or Redux store.
  const mandiId = "MANDI_1"; 

  useEffect(() => {
    // We would fetch specific mandi details here
    setMandiName("Indore Agriculture Market");
  }, [mandiId]);

  const stats = [
    { label: "Active Crops", value: "42", icon: <Store size={24} />, color: "text-green-600 bg-green-100 border-green-200" },
    { label: "Registered Traders", value: "128", icon: <UserCheck size={24} />, color: "text-blue-600 bg-blue-100 border-blue-200" },
    { label: "Today's Price Updates", value: "38", icon: <TrendingUp size={24} />, color: "text-amber-600 bg-amber-100 border-amber-200" },
    { label: "Market Volume", value: "1.2k Tonnes", icon: <LineChart size={24} />, color: "text-purple-600 bg-purple-100 border-purple-200" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{mandiName} Dashboard</h1>
        <p className="text-gray-500 mt-1">Operational metrics for the current mandi.</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/prices" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium">
              <TrendingUp size={20} /> Update Prices
            </a>
            <a href="/admin/traders" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium">
              <UserCheck size={20} /> Add Trader
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

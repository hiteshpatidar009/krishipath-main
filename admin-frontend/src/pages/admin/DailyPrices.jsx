import React, { useState, useEffect } from "react";
import { Search, Save, Calendar, DownloadCloud } from "lucide-react";
import { getMandiOfficialPrices, upsertMandiOfficialPrice } from "../../services/mandiAdminAPI";

export default function DailyPrices() {
  const mandiId = "MANDI_1"; // Mock context
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock crops for UI demonstration
  const mockCrops = [
    { id: "CROP_1", name: "Wheat (Lokwan)", unit: "QUINTAL" },
    { id: "CROP_2", name: "Soyabean (Yellow)", unit: "QUINTAL" },
    { id: "CROP_3", name: "Chana (Desi)", unit: "QUINTAL" },
    { id: "CROP_4", name: "Maize (Hybrid)", unit: "QUINTAL" },
  ];

  useEffect(() => {
    // In reality, we'd fetch prices for the selected date from the backend
    // and merge them with the enabled crops for this mandi.
    setPrices(mockCrops.map(c => ({
      ...c,
      priceMin: "",
      priceMax: "",
      priceModal: ""
    })));
  }, [date]);

  const handlePriceChange = (cropId, field, value) => {
    setPrices(prev => prev.map(p => 
      p.id === cropId ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real scenario, we'd send these to the backend via bulk or individual upserts
      console.log("Saving prices for", date, prices);
      setTimeout(() => setSaving(false), 800); // Mock delay
    } catch (error) {
      console.error("Save failed", error);
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Prices</h1>
          <p className="text-gray-500 mt-1">Record official modal prices for crops in your mandi.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl">
            <Calendar size={18} className="text-gray-400" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors font-medium text-sm">
            <DownloadCloud size={18} />
            Copy from yesterday
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Crop</th>
                <th className="px-6 py-4 font-semibold">Unit</th>
                <th className="px-6 py-4 font-semibold w-48">Min Price (₹)</th>
                <th className="px-6 py-4 font-semibold w-48">Max Price (₹)</th>
                <th className="px-6 py-4 font-semibold w-48">Modal Price (₹) <span className="text-red-500">*</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prices.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.unit}</td>
                  <td className="px-6 py-3">
                    <input 
                      type="number"
                      placeholder="e.g. 2100"
                      value={item.priceMin}
                      onChange={(e) => handlePriceChange(item.id, 'priceMin', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 text-sm"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number"
                      placeholder="e.g. 2300"
                      value={item.priceMax}
                      onChange={(e) => handlePriceChange(item.id, 'priceMax', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 text-sm"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number"
                      placeholder="Required"
                      value={item.priceModal}
                      onChange={(e) => handlePriceChange(item.id, 'priceModal', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm font-semibold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-6 bg-gray-50/30 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl shadow-sm shadow-green-200 transition-all font-medium disabled:opacity-70"
          >
            {saving ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Prices for Today"}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, MapPin, MoreVertical, X } from "lucide-react";
import { getAllMandis, fetchStates, fetchDistricts, createMandi } from "../../services/mandiAdminAPI";

export default function MandisList() {
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    stateId: "",
    districtId: "",
    defaultLanguageCode: "hi",
    openingTime: "09:00",
    closingTime: "17:00",
    address: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (showCreateModal && states.length === 0) {
      loadStates();
    }
  }, [showCreateModal]);

  const loadStates = async () => {
    try {
      const res = await fetchStates();
      setStates(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load states", err);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({ ...prev, stateId, districtId: "" }));
    if (stateId) {
      try {
        const res = await fetchDistricts(stateId);
        setDistricts(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load districts", err);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await createMandi(formData);
      setShowCreateModal(false);
      setFormData({ name: "", stateId: "", districtId: "", defaultLanguageCode: "hi", openingTime: "09:00", closingTime: "17:00", address: "" });
      fetchMandis();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create mandi");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMandis();
  }, []);

  const fetchMandis = async () => {
    try {
      setLoading(true);
      const response = await getAllMandis();
      setMandis(response.data?.data?.mandis || []);
    } catch (error) {
      console.error("Failed to fetch mandis", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE": return "bg-gray-100 text-gray-800 border-gray-200";
      case "SEASONAL": return "bg-amber-100 text-amber-800 border-amber-200";
      case "MAINTENANCE": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-green-600" />
            Mandis Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage agricultural markets and their configurations across the platform.</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-green-200 transition-all font-medium text-sm"
        >
          <Plus size={18} />
          Create New Mandi
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search mandis by name or code..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer">
            <option value="">All States</option>
            <option value="MP">Madhya Pradesh</option>
            <option value="MH">Maharashtra</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Mandi Info</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Operating Hours</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
                    Loading directory...
                  </td>
                </tr>
              ) : mandis.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No mandis found matching your criteria.
                  </td>
                </tr>
              ) : (
                mandis.map((mandi) => (
                  <tr key={mandi.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{mandi.name}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">{mandi.code || 'NO_CODE'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm">{mandi.districtName}, {mandi.stateName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {mandi.openingTime || '09:00'} - {mandi.closingTime || '17:00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(mandi.status)}`}>
                        {mandi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-gray-100 p-4 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
          <div>Showing 1 to {mandis.length} of {mandis.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Create Mandi Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Mandi</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}
              
              <form id="createMandiForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mandi Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                      placeholder="e.g. Indore Central Mandi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={formData.stateId}
                      onChange={handleStateChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm bg-white"
                    >
                      <option value="">Select State...</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={formData.districtId}
                      onChange={(e) => setFormData({...formData, districtId: e.target.value})}
                      disabled={!formData.stateId}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{formData.stateId ? "Select District..." : "Select State First"}</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                    <input 
                      type="time" 
                      value={formData.openingTime}
                      onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                    <input 
                      type="time" 
                      value={formData.closingTime}
                      onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea 
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm resize-none"
                      placeholder="Full street address..."
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                form="createMandiForm"
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm shadow-green-200 flex items-center gap-2 disabled:opacity-70"
              >
                {submitting && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {submitting ? "Creating..." : "Create Mandi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

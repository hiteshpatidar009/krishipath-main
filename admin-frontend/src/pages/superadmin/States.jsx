import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import { fetchStates, createState, updateState, deleteState } from '../../services/mandiAdminAPI';

export default function States() {
  const [states, setStates] = useState([]);
  const [formData, setFormData] = useState({ name: '', status: 'ACTIVE' });
  const [selectedState, setSelectedState] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStates(); }, []);

  const loadStates = async () => {
    try {
      const res = await fetchStates();
      setStates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load states:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return alert('State name is required!');
    setLoading(true);
    try {
      await createState(formData);
      setShowAddModal(false);
      setFormData({ name: '', status: 'ACTIVE' });
      setSuccessMessage('State added successfully!');
      setShowSuccessModal(true);
      loadStates();
    } catch (err) {
      alert('Failed to add state');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (state) => {
    setSelectedState(state);
    setFormData({ name: state.name, status: state.status });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedState) return;
    setLoading(true);
    try {
      await updateState(selectedState.id, formData);
      setShowEditModal(false);
      setSelectedState(null);
      setSuccessMessage('State updated successfully!');
      setShowSuccessModal(true);
      loadStates();
    } catch (err) {
      alert('Failed to update state');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (state) => {
    setSelectedState(state);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedState) return;
    try {
      await deleteState(selectedState.id);
      setShowDeleteModal(false);
      setSuccessMessage('State deleted successfully!');
      setShowSuccessModal(true);
      loadStates();
    } catch (err) {
      alert('Failed to delete state');
    }
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => setShowSuccessModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6 text-center animate-fade-in">
            <div className="flex justify-center mb-3">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{successMessage}</h2>
            <p className="text-sm text-gray-500">Action completed successfully.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage States</h1>
        <button
          onClick={() => {
            setFormData({ name: '', status: 'ACTIVE' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={20} /> Add State
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.length > 0 ? (
              states.map((st) => (
                <tr key={st.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{st.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${st.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(st)} className="p-2 text-slate-400 hover:text-blue-600 transition">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(st)} className="p-2 text-slate-400 hover:text-red-600 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-500">No states found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Add State</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAdd} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Edit State</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{loading ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[350px] rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h2>
            <p className="text-slate-600 mb-6">Are you sure you want to delete "{selectedState?.name}"? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

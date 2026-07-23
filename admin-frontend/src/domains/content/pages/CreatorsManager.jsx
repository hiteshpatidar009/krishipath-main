import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, User, X } from 'lucide-react';
import Card from '../../../shared/components/ui/Card';

export default function CreatorsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialty: '', followersK: 0, avatarUrl: '', status: 'ACTIVE' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:59231/api/v1/content/admin/creators');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({ name: '', specialty: '', followersK: 0, avatarUrl: '', status: 'ACTIVE' });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        followersK: Number(formData.followersK)
      };

      if (editingId) {
        await axios.put(`http://localhost:59231/api/v1/content/admin/creators/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:59231/api/v1/content/admin/creators', payload);
      }
      handleCloseModal();
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error saving creator');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this creator?')) return;
    try {
      await axios.delete(`http://localhost:59231/api/v1/content/admin/creators/${id}`);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting creator');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">KrishiGuru Creators</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={18} />
          <span>Add Creator</span>
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 font-medium text-slate-500">Creator</th>
                <th className="p-4 font-medium text-slate-500">Specialty</th>
                <th className="p-4 font-medium text-slate-500">Followers (K)</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
                <th className="p-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 flex items-center gap-3">
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                    )}
                    <span className="font-medium text-slate-800">{s.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{s.specialty}</td>
                  <td className="p-4 text-slate-600">{s.followersK}K</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleOpenModal(s)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No creators found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Creator' : 'Add Creator'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Farming"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.avatarUrl || ''}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Followers (in thousands)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.followersK}
                    onChange={(e) => setFormData({ ...formData, followersK: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {editingId ? 'Save Changes' : 'Create Creator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

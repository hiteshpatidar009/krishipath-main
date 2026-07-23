import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Video, X } from 'lucide-react';
import Card from '../../../shared/components/ui/Card';

export default function ShortsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', videoUrl: '', thumbnailUrl: '', views: 0, status: 'ACTIVE' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:59231/api/v1/content/admin/shorts');
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
      setFormData({ title: '', videoUrl: '', thumbnailUrl: '', views: 0, status: 'ACTIVE' });
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
        views: Number(formData.views)
      };

      if (editingId) {
        await axios.put(`http://localhost:59231/api/v1/content/admin/shorts/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:59231/api/v1/content/admin/shorts', payload);
      }
      handleCloseModal();
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error saving short');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short?')) return;
    try {
      await axios.delete(`http://localhost:59231/api/v1/content/admin/shorts/${id}`);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting short');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Shorts Management</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={18} />
          <span>Add Short</span>
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 font-medium text-slate-500">Thumbnail</th>
                <th className="p-4 font-medium text-slate-500">Title</th>
                <th className="p-4 font-medium text-slate-500">Views</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
                <th className="p-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    {s.thumbnailUrl ? (
                      <img src={s.thumbnailUrl} alt={s.title} className="w-16 h-24 rounded object-cover" />
                    ) : (
                      <div className="w-16 h-24 rounded bg-slate-200 flex items-center justify-center text-slate-500">
                        <Video size={24} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{s.title}</td>
                  <td className="p-4 text-slate-600">{s.views}</td>
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
                  <td colSpan="5" className="p-8 text-center text-slate-500">No shorts found.</td>
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
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Short' : 'Add Short'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Video URL (YouTube/MP4 link)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Views</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
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
                {editingId ? 'Save Changes' : 'Create Short'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

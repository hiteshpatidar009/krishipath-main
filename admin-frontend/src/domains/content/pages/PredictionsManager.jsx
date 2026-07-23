import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Card from '../../../shared/components/ui/Card';

export default function PredictionsManager() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ cropId: '', predictedPrice: '', direction: 'UP', period: '', confidence: 80, notes: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const [predRes, prodRes] = await Promise.all([
        axios.get('http://localhost:59231/api/v1/content/admin/predictions'),
        axios.get('http://localhost:59231/api/v1/mandi/admin/products/global')
      ]);
      setItems(predRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ ...item, notes: item.notes || '' });
      setEditingId(item.id);
    } else {
      setFormData({ cropId: products.length > 0 ? products[0].id : '', predictedPrice: '', direction: 'UP', period: '', confidence: 80, notes: '' });
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
      // Very basic validation - cropId must be a valid UUID in a real DB but for now just send it.
      // Usually you'd have a dropdown of crops.
      const payload = {
        ...formData,
        predictedPrice: Number(formData.predictedPrice),
        confidence: Number(formData.confidence)
      };
      
      if (editingId) {
        await axios.put(`http://localhost:59231/api/v1/content/admin/predictions/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:59231/api/v1/content/admin/predictions', payload);
      }
      handleCloseModal();
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error saving prediction: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) return;
    try {
      await axios.delete(`http://localhost:59231/api/v1/content/admin/predictions/${id}`);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting prediction');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Price Predictions</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={18} />
          <span>Add Prediction</span>
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 font-medium text-slate-500">Crop ID</th>
                <th className="p-4 font-medium text-slate-500">Predicted Price</th>
                <th className="p-4 font-medium text-slate-500">Direction</th>
                <th className="p-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{s.cropId}</td>
                  <td className="p-4 font-medium text-slate-800">₹{s.predictedPrice}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.direction === 'UP' ? 'text-green-600 bg-green-50' : s.direction === 'DOWN' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'}`}>
                      {s.direction}
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
                  <td colSpan="4" className="p-8 text-center text-slate-500">No predictions found.</td>
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
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Prediction' : 'Add Prediction'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Crop</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.cropId}
                  onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                >
                  <option value="">Select a Crop</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.translations?.en?.name || p.name})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Predicted Price (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.predictedPrice}
                    onChange={(e) => setFormData({ ...formData, predictedPrice: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Direction</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  >
                    <option value="UP">Up ⬆️</option>
                    <option value="STABLE">Stable ➡️</option>
                    <option value="DOWN">Down ⬇️</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    placeholder="e.g. Next 7 Days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confidence (%)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes / References</label>
                <textarea
                  placeholder="e.g. Due to unseasonal rains..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  rows="2"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {editingId ? 'Save Changes' : 'Create Prediction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

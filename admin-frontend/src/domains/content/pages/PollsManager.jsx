import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, PlusCircle } from 'lucide-react';
import Card from '../../../shared/components/ui/Card';

export default function PollsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [targetDistricts, setTargetDistricts] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:59231/api/v1/content/admin/polls');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setQuestion('');
    setTargetDistricts('');
    setOptions(['', '']);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSave = async () => {
    try {
      const validOptions = options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options.");
        return;
      }
      if (!question.trim()) {
        alert("Please provide a question.");
        return;
      }

      const districtArray = targetDistricts
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      await axios.post('http://localhost:59231/api/v1/content/admin/polls', {
        question,
        targetDistricts: districtArray.length > 0 ? districtArray : null,
        options: validOptions
      });
      handleCloseModal();
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error creating poll');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    try {
      await axios.delete(`http://localhost:59231/api/v1/content/admin/polls/${id}`);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting poll');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Community Polls</h1>
        <button onClick={handleOpenModal} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={18} />
          <span>Create Poll</span>
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 font-medium text-slate-500">Question</th>
                <th className="p-4 font-medium text-slate-500">Target Districts</th>
                <th className="p-4 font-medium text-slate-500">Total Votes</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
                <th className="p-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{s.question}</td>
                  <td className="p-4 text-slate-600">{s.targetDistricts ? s.targetDistricts.join(", ") : 'Global'}</td>
                  <td className="p-4 text-slate-600">{s.totalVotes}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {s.isActive ? 'ACTIVE' : 'CLOSED'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No polls found.</td>
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
              <h2 className="text-lg font-bold text-slate-800">Create Poll</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  placeholder="e.g. Which crop are you planting next?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Districts (Comma-separated, optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ujjain, Indore (leave empty for global poll)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={targetDistricts}
                  onChange={(e) => setTargetDistricts(e.target.value)}
                />
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <button onClick={() => handleRemoveOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={handleAddOption} className="mt-3 flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-700">
                  <PlusCircle size={16} />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

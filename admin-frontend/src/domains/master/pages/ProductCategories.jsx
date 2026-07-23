import React, { useState } from 'react';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import DynamicForm from '../../../shared/components/ui/DynamicForm';
import { Layers, Plus, Tag } from 'lucide-react';
import * as z from 'zod';

export default function ProductCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data for Categories
  const [categories, setCategories] = useState([
    { id: 'CAT-001', name: 'Grains', code: 'GRN', status: 'Active', cropCount: 12 },
    { id: 'CAT-002', name: 'Vegetables', code: 'VEG', status: 'Active', cropCount: 45 },
    { id: 'CAT-003', name: 'Fruits', code: 'FRT', status: 'Active', cropCount: 30 },
    { id: 'CAT-004', name: 'Spices', code: 'SPC', status: 'Active', cropCount: 18 },
    { id: 'CAT-005', name: 'Pulses', code: 'PLS', status: 'Active', cropCount: 15 },
    { id: 'CAT-006', name: 'Flowers', code: 'FLW', status: 'Inactive', cropCount: 8 },
    { id: 'CAT-007', name: 'Medicinal Plants', code: 'MED', status: 'Active', cropCount: 22 },
  ]);

  const columns = [
    { 
      header: 'Category Name', 
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
            <Layers size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{row.name}</span>
            <span className="text-xs text-slate-500 font-mono">{row.id}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Code', 
      accessorKey: 'code',
      cell: (row) => (
        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">
          {row.code}
        </span>
      )
    },
    { 
      header: 'Total Crops', 
      accessorKey: 'cropCount',
      cell: (row) => (
        <span className="text-slate-600 font-medium">{row.cropCount}</span>
      )
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
          row.status === 'Active' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {row.status.toUpperCase()}
        </span>
      )
    }
  ];

  // Schema for Add Category
  const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    code: z.string().length(3, "Code must be exactly 3 characters").toUpperCase(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).default('Active')
  });

  const formFields = [
    { name: 'name', label: 'Category Name', type: 'text', placeholder: 'e.g. Oilseeds' },
    { name: 'code', label: 'Category Code', type: 'text', placeholder: 'e.g. OIL' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ]
    }
  ];

  const handleAddCategory = async (data) => {
    // Mock save
    const newCat = {
      id: `CAT-00${categories.length + 1}`,
      name: data.name,
      code: data.code,
      status: data.status,
      cropCount: 0
    };
    setCategories([newCat, ...categories]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Product Categories
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage high-level agricultural classifications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <EnterpriseTable 
        title={`All Categories (${categories.length})`}
        columns={columns}
        data={categories}
      />

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Tag size={18} className="text-indigo-600" />
                Add New Category
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <div className="p-6">
              <DynamicForm 
                schema={categorySchema}
                fields={formFields}
                onSubmit={handleAddCategory}
                defaultValues={{ status: 'Active' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import * as z from 'zod';
import EnterpriseTable from '../shared/components/ui/EnterpriseTable';
import DynamicForm from '../shared/components/ui/DynamicForm';

// Mock Schema for the form
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  phone: z.string().optional(),
});

// Mock Fields
const formFields = [
  { name: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
  { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210' },
  { 
    name: 'role', 
    label: 'Assign Role', 
    type: 'select', 
    required: true,
    options: [
      { label: 'Super Admin', value: 'SUPER_ADMIN' },
      { label: 'Mandi Admin', value: 'MANDI_ADMIN' },
    ]
  },
];

// Mock Data for the table
const tableData = [
  { id: '1', name: 'Ramesh Singh', role: 'Mandi Admin', location: 'Indore, MP', status: 'Active' },
  { id: '2', name: 'Suresh Patel', role: 'Content Mod', location: 'Bhopal, MP', status: 'Inactive' },
  { id: '3', name: 'Priya Sharma', role: 'Super Admin', location: 'Global', status: 'Active' },
];

const tableColumns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Role', accessorKey: 'role', 
    cell: (row) => <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">{row.role}</span>
  },
  { header: 'Location', accessorKey: 'location' },
  { header: 'Status', accessorKey: 'status',
    cell: (row) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
        row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
      }`}>
        {row.status === 'Active' ? '● Active' : '○ Inactive'}
      </span>
    )
  },
];

export default function Sandbox() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data) => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert(JSON.stringify(data, null, 2));
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Component Sandbox</h1>
        <p className="text-slate-500 text-sm">Testing ground for Phase 1 Enterprise Architecture components.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">1. Enterprise Table Foundation</h2>
        <EnterpriseTable 
          title="Users Directory (Mock)"
          columns={tableColumns}
          data={tableData}
        />
      </div>

      <div className="space-y-4 pt-8">
        <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">2. Dynamic Form Engine (React Hook Form + Zod)</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <DynamicForm 
            schema={formSchema}
            fields={formFields}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            defaultValues={{ name: '', email: '', role: '', phone: '' }}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronDown, Search, Filter, Download, MoreHorizontal } from 'lucide-react';

/**
 * EnterpriseTable (Foundation)
 * 
 * Future updates will integrate TanStack Table for virtualization and advanced sorting.
 * For Phase 1, this establishes the visual language and structure.
 */
export default function EnterpriseTable({ columns = [], data = [], title = "Data Table" }) {
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleAll = (e) => {
    if (e.target.checked) setSelectedRows(data.map(d => d.id));
    else setSelectedRows([]);
  };

  const toggleRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <h2 className="font-semibold text-slate-800 text-lg">{title}</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-full sm:w-64 transition-shadow"
            />
          </div>
          
          <button className="p-1.5 text-slate-500 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors" title="Filters">
            <Filter size={18} />
          </button>
          
          <button className="p-1.5 text-slate-500 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors" title="Export CSV">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (Appears when items are selected) */}
      {selectedRows.length > 0 && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-green-800">
            {selectedRows.length} item{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded shadow-sm hover:bg-green-50">
              Bulk Edit
            </button>
            <button className="text-xs font-semibold px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded shadow-sm hover:bg-red-50">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-green-600 focus:ring-green-500 border-slate-300"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800 group transition-colors">
                    {col.header}
                    <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
              ))}
              <th className="p-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center text-sm text-slate-500">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  className={`group hover:bg-slate-50/80 transition-colors ${selectedRows.includes(row.id) ? 'bg-green-50/30' : ''}`}
                >
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-green-600 focus:ring-green-500 border-slate-300 transition-all opacity-0 group-hover:opacity-100 checked:opacity-100"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-3 text-sm text-slate-700 whitespace-nowrap">
                      {/* If column defines a cell renderer, use it, else generic render */}
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
        <div>Showing 1 to {data.length} of {data.length} entries</div>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 disabled:opacity-50">Prev</button>
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

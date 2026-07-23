import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Check, Edit2, AlertCircle, Loader2 } from 'lucide-react';
import { useMissingTranslations, useApproveTranslation } from '../api/localizationApi';
import * as z from 'zod';

export default function MissingTranslationsTable({ language, entityType }) {
  const { data: missingData, isLoading, isError } = useMissingTranslations(language, entityType);
  const approveMutation = useApproveTranslation();
  
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleApprove = async (row) => {
    try {
      await approveMutation.mutateAsync({
        entityType: row.original.entityType,
        entityId: row.original.entityId,
        fieldName: row.original.fieldName,
        languageCode: language,
        translatedValue: row.original.suggestedTranslation || '',
      });
    } catch (e) {
      console.error('Failed to approve translation', e);
      alert('Failed to approve translation');
    }
  };

  const handleManualSave = async (row) => {
    try {
      await approveMutation.mutateAsync({
        entityType: row.original.entityType,
        entityId: row.original.entityId,
        fieldName: row.original.fieldName,
        languageCode: language,
        translatedValue: editValue,
      });
      setEditingId(null);
    } catch (e) {
      console.error('Failed to save manual translation', e);
      alert('Failed to save translation');
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'English Source',
        accessorKey: 'englishValue',
        cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
      },
      {
        header: 'Field',
        accessorKey: 'fieldName',
        cell: (info) => (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
            {info.getValue()}
          </span>
        ),
      },
      {
        header: `Suggested (${language.toUpperCase()})`,
        accessorKey: 'suggestedTranslation',
        cell: ({ row }) => {
          const isEditing = editingId === row.original.entityId;
          if (isEditing) {
            return (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded text-sm w-full outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  autoFocus
                />
                <button
                  onClick={() => handleManualSave(row)}
                  disabled={approveMutation.isPending}
                  className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                >
                  &times;
                </button>
              </div>
            );
          }
          
          return (
            <div className="flex items-center gap-2">
              <span className="text-slate-700">
                {row.original.suggestedTranslation || <span className="text-slate-400 italic">No suggestion</span>}
              </span>
              <button
                onClick={() => {
                  setEditingId(row.original.entityId);
                  setEditValue(row.original.suggestedTranslation || '');
                }}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Edit Translation"
              >
                <Edit2 size={14} />
              </button>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => handleApprove(row)}
            disabled={approveMutation.isPending || editingId === row.original.entityId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Approve
          </button>
        ),
      },
    ],
    [language, editingId, editValue, approveMutation.isPending]
  );

  const table = useReactTable({
    data: missingData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-xl border border-slate-200">
        <Loader2 size={24} className="animate-spin text-green-500" />
        <p>Analyzing missing translations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
        <AlertCircle size={20} />
        <div>
          <p className="font-semibold">Failed to load missing translations</p>
          <p className="text-sm">Please check your network or backend connectivity.</p>
        </div>
      </div>
    );
  }

  if (missingData?.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          There are no missing translations for {entityType} in {language.toUpperCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-semibold whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 transition"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 transition"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
      </div>
    </div>
  );
}

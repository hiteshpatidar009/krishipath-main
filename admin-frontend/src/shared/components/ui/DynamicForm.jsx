import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

/**
 * DynamicForm (Foundation)
 * 
 * Utilizes React Hook Form and Zod for enterprise-scale validation.
 */
export default function DynamicForm({ schema, defaultValues, onSubmit, fields, isSubmitting = false }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.name} className={`flex flex-col space-y-1.5 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
            <label className="text-sm font-semibold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                {...register(field.name)}
                placeholder={field.placeholder}
                rows={4}
                className={`p-2.5 bg-white border rounded-lg outline-none transition-shadow text-sm text-slate-800
                  ${errors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500'}
                `}
              />
            ) : field.type === 'select' ? (
              <select
                {...register(field.name)}
                className={`p-2.5 bg-white border rounded-lg outline-none transition-shadow text-sm text-slate-800
                  ${errors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500'}
                `}
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                {...register(field.name)}
                placeholder={field.placeholder}
                className={`p-2.5 bg-white border rounded-lg outline-none transition-shadow text-sm text-slate-800
                  ${errors[field.name] ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500'}
                `}
              />
            )}
            
            {errors[field.name] && (
              <span className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                {errors[field.name].message}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button" 
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

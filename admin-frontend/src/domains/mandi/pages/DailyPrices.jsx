import React, { useState, useEffect } from 'react';
import { useDailyPrices, useUpdatePrice } from '../api/mandiApi';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import { Calendar, Save, Calculator } from 'lucide-react';
import useUIStore from '../../../core/store/useUIStore';

export default function DailyPrices() {
  const { activeWorkspace } = useUIStore();
  
  // For UI demonstration, if they are SuperAdmin and no workspace is active, use a mock ID
  const mandiId = activeWorkspace === 'GLOBAL' ? 'mandi_01' : activeWorkspace;
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: cropsData, isLoading, isError, error } = useDailyPrices(mandiId, selectedDate);
  const { mutate: savePrice, isPending } = useUpdatePrice();

  // Local state to manage the spreadsheet edits before saving
  const [localPrices, setLocalPrices] = useState({});

  useEffect(() => {
    if (cropsData) {
      const initial = {};
      cropsData.forEach(c => {
        initial[c.cropId] = {
          minPrice: c.minPrice || '',
          maxPrice: c.maxPrice || '',
          modalPrice: c.modalPrice || ''
        };
      });
      setLocalPrices(initial);
    }
  }, [cropsData]);

  const handlePriceChange = (cropId, field, value) => {
    // Only allow numbers
    if (value !== '' && !/^\d*$/.test(value)) return;
    
    setLocalPrices(prev => ({
      ...prev,
      [cropId]: {
        ...prev[cropId],
        [field]: value
      }
    }));
  };

  const handleBlurSave = (cropId) => {
    const data = localPrices[cropId];
    if (!data.minPrice && !data.maxPrice && !data.modalPrice) return;
    
    // Auto-save draft logic
    savePrice({
      mandiId,
      date: selectedDate,
      cropId,
      ...data
    });
  };

  const InputCell = ({ row, field }) => {
    const val = localPrices[row.cropId]?.[field] ?? '';
    return (
      <div className="relative group/input">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
        <input 
          type="text"
          value={val}
          onChange={(e) => handlePriceChange(row.cropId, field, e.target.value)}
          onBlur={() => handleBlurSave(row.cropId)}
          className="w-28 pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow hover:border-slate-300"
          placeholder="0"
        />
      </div>
    );
  };

  const columns = [
    { 
      header: 'Crop Name', 
      accessorKey: 'name',
      cell: (row) => <span className="font-semibold text-slate-800">{row.name}</span>
    },
    { 
      header: 'Min Price (/Qtl)', 
      accessorKey: 'minPrice',
      cell: (row) => <InputCell row={row} field="minPrice" />
    },
    { 
      header: 'Max Price (/Qtl)', 
      accessorKey: 'maxPrice',
      cell: (row) => <InputCell row={row} field="maxPrice" />
    },
    { 
      header: 'Modal Price (/Qtl)', 
      accessorKey: 'modalPrice',
      cell: (row) => <InputCell row={row} field="modalPrice" />
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        Error loading crops: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Daily Prices Entry
          </h1>
          <p className="text-slate-500 text-sm mt-1">Spreadsheet view for rapid price updating.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Trading Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-slate-700"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase opacity-0">Action</label>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors h-[38px]">
              <Calculator size={16} /> Compute Modals
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
        <span className="text-sm text-blue-800 font-medium">Prices are auto-saved as you type.</span>
        {isPending && <span className="text-xs text-blue-600 flex items-center gap-2"><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Saving...</span>}
      </div>

      <EnterpriseTable 
        title={`Active Crops (${cropsData?.length || 0})`}
        columns={columns}
        data={cropsData || []}
      />
    </div>
  );
}

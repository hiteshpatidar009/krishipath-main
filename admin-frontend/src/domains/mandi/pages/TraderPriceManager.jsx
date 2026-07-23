import React, { useState, useEffect } from 'react';
import { useMandis, useMandiCrops, useTraderPrices, useUpdateTraderPrices } from '../api/mandiApi';
import { Store, Leaf, Calendar, Save, Calculator, AlertCircle, RefreshCw } from 'lucide-react';

export default function TraderPriceManager() {
  const [selectedMandi, setSelectedMandi] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [priceDate, setPriceDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State
  const [officialPrice, setOfficialPrice] = useState({ priceModal: '', priceMin: '', priceMax: '', arrivalQuantity: '', arrivalUnit: 'QUINTAL' });
  const [traderPrices, setTraderPrices] = useState({}); // { traderId: pricePerQuintal }
  const [traderGrades, setTraderGrades] = useState({});

  const { data: mandis, isLoading: loadingMandis } = useMandis();
  const { data: crops, isLoading: loadingCrops } = useMandiCrops(selectedMandi);
  const { data: pricesData, isLoading: loadingPrices, isFetching: fetchingPrices } = useTraderPrices(selectedMandi, selectedCrop, priceDate);
  const updatePrices = useUpdateTraderPrices();

  // Sync server data to form state when it changes
  useEffect(() => {
    if (pricesData) {
      setOfficialPrice({
        priceModal: pricesData.officialPrice?.priceModal || '',
        priceMin: pricesData.officialPrice?.priceMin || '',
        priceMax: pricesData.officialPrice?.priceMax || '',
        arrivalQuantity: pricesData.officialPrice?.arrivalQuantity || '',
        arrivalUnit: pricesData.officialPrice?.arrivalUnit || 'QUINTAL'
      });
      
      const tpMap = {};
      const gradeMap = {};
      pricesData.traderPrices?.forEach(tp => {
        if (tp.pricePerQuintal) {
          tpMap[tp.traderId] = tp.pricePerQuintal;
        }
        gradeMap[tp.traderId] = tp.grade || '';
      });
      setTraderPrices(tpMap);
      setTraderGrades(gradeMap);
    } else {
      setOfficialPrice({ priceModal: '', priceMin: '', priceMax: '', arrivalQuantity: '', arrivalUnit: 'QUINTAL' });
      setTraderPrices({});
      setTraderGrades({});
    }
  }, [pricesData, selectedMandi, selectedCrop, priceDate]);

  const handleTraderPriceChange = (traderId, val) => {
    setTraderPrices(prev => ({
      ...prev,
      [traderId]: val
    }));
  };

  const handleCalculateAverage = () => {
    const validPrices = Object.values(traderPrices)
      .map(Number)
      .filter(n => !isNaN(n) && n > 0);
    
    if (validPrices.length > 0) {
      const avg = validPrices.reduce((sum, val) => sum + val, 0) / validPrices.length;
      setOfficialPrice(prev => ({
        ...prev,
        priceModal: Math.round(avg).toString()
      }));
    }
  };

  const handleSave = async () => {
    if (!officialPrice.priceModal) {
      alert("Please enter the Official Average Price (Modal) before saving.");
      return;
    }

    const payload = {
      priceDate,
      officialPrice: {
        priceModal: officialPrice.priceModal,
        priceMin: officialPrice.priceMin || undefined,
        priceMax: officialPrice.priceMax || undefined,
        arrivalQuantity: officialPrice.arrivalQuantity || undefined,
        arrivalUnit: officialPrice.arrivalQuantity ? officialPrice.arrivalUnit : undefined,
        unit: "QUINTAL"
      },
      traderPrices: Object.entries(traderPrices)
        .filter(([_, val]) => val && val.trim() !== '')
        .map(([traderId, pricePerQuintal]) => ({
          traderId,
          pricePerQuintal,
          grade: traderGrades[traderId] || undefined
        }))
    };

    try {
      await updatePrices.mutateAsync({
        mandiId: selectedMandi,
        cropId: selectedCrop,
        payload
      });
      alert("Prices updated successfully!");
    } catch (e) {
      alert("Failed to update prices.");
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Today's Mandi Prices
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage official average prices and individual trader rates.</p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Store size={14} className="text-blue-500" /> Select Mandi
          </label>
          <select 
            value={selectedMandi}
            onChange={(e) => { setSelectedMandi(e.target.value); setSelectedCrop(''); }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">-- Choose Mandi --</option>
            {mandis?.map(m => (
              <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Leaf size={14} className="text-green-500" /> Select Crop
          </label>
          <select 
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            disabled={!selectedMandi || loadingCrops}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
          >
            <option value="">-- Choose Crop --</option>
            {crops?.map(c => (
              <option key={c.cropId} value={c.cropId}>{c.cropName || 'Unknown Crop'}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-500" /> Date
          </label>
          <input 
            type="date" 
            value={priceDate}
            onChange={(e) => setPriceDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {selectedMandi && selectedCrop && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Official Average Price Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center justify-between">
                <span>Official Average Price</span>
                {fetchingPrices && <RefreshCw size={14} className="animate-spin text-emerald-600" />}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Modal / Avg Price (₹/Qtl)*</label>
                  <input 
                    type="number" 
                    value={officialPrice.priceModal}
                    onChange={(e) => setOfficialPrice({...officialPrice, priceModal: e.target.value})}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-emerald-900 bg-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Min Price</label>
                    <input 
                      type="number" 
                      value={officialPrice.priceMin}
                      onChange={(e) => setOfficialPrice({...officialPrice, priceMin: e.target.value})}
                      placeholder="e.g. 4000"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Max Price</label>
                    <input 
                      type="number" 
                      value={officialPrice.priceMax}
                      onChange={(e) => setOfficialPrice({...officialPrice, priceMax: e.target.value})}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Arrival Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={officialPrice.arrivalQuantity}
                      onChange={(e) => setOfficialPrice({...officialPrice, arrivalQuantity: e.target.value})}
                      placeholder="e.g. 1250"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Arrival Unit</label>
                    <select
                      value={officialPrice.arrivalUnit}
                      onChange={(e) => setOfficialPrice({...officialPrice, arrivalUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="QUINTAL">Quintal</option>
                      <option value="TONNE">Tonne</option>
                      <option value="BAGS">Bags</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleCalculateAverage}
                  className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Calculator size={16} /> Auto-Calc from Traders
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={updatePrices.isPending}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-bold shadow-md shadow-green-600/20 transition-colors flex items-center justify-center gap-2"
            >
              {updatePrices.isPending ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {updatePrices.isPending ? 'Saving...' : 'Save All Prices'}
            </button>
          </div>

          {/* Trader Prices Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Trader Specific Prices
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                {pricesData?.traderPrices?.length || 0} Traders Assigned
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1 p-0">
              {loadingPrices ? (
                <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>
              ) : !pricesData?.traderPrices?.length ? (
                <div className="p-8 text-center flex flex-col items-center text-slate-500">
                  <AlertCircle className="mb-2 text-slate-400" size={32} />
                  <p className="font-medium">No traders assigned to this Mandi.</p>
                  <p className="text-sm">Approve and assign traders in Trader Registry first.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Trader Shop Name</th>
                      <th className="px-4 py-3 w-44">Grade</th>
                      <th className="px-4 py-3 w-48 text-right">Price (₹ / Quintal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pricesData.traderPrices.map((t) => (
                      <tr key={t.traderId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-800 font-medium">
                          {t.shopName}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={traderGrades[t.traderId] || ''}
                            onChange={(e) => setTraderGrades(prev => ({ ...prev, [t.traderId]: e.target.value }))}
                            placeholder="e.g. FAQ"
                            className="w-36 px-3 py-1.5 border border-slate-200 rounded-md text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input 
                            type="number"
                            value={traderPrices[t.traderId] || ''}
                            onChange={(e) => handleTraderPriceChange(t.traderId, e.target.value)}
                            placeholder="Enter price..."
                            className="w-32 px-3 py-1.5 border border-slate-200 rounded-md text-right text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

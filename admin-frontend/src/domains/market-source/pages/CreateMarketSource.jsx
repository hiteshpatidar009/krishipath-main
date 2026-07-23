import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketSourceApi } from '../api/market-source.api';
import { useMandis, useGlobalCrops } from '../../mandi/api/mandiApi';
import { useQueries } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateMarketSource() {
  const navigate = useNavigate();
  const { data: mandis = [], isLoading: isLoadingMandis } = useMandis();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    mobileNumber: '',
    whatsappNumber: '',
    whatsappGroupId: '',
    alternativeNumber: '',
    email: '',
    mandiIds: [],
    productIds: [],
    stateId: '',
    districtId: '',
    address: '',
    sourceType: 'WHATSAPP',
    notes: ''
  });

  // Fetch all global products instead of restricting by mandi
  const { data: globalProductsData, isLoading: isLoadingProducts } = useGlobalCrops();
  
  const products = React.useMemo(() => {
    // globalProductsData might be an array or an object with a data property depending on the API wrapper
    const allProducts = Array.isArray(globalProductsData) ? globalProductsData : (globalProductsData?.data || []);
    // Map it to match the expected format { productId, cropName }
    return allProducts.map(p => ({
      productId: p.id || p.cropId || p.productId,
      cropName: p.name || p.cropName
    }));
  }, [globalProductsData]);


  // Cleanup invalid productIds when products list changes
  React.useEffect(() => {
    if (isLoadingProducts) return;
    
    setFormData(prev => {
      const validProductIds = prev.productIds.filter(id => 
        products.some(p => p.productId === id)
      );
      
      if (validProductIds.length !== prev.productIds.length) {
        return { ...prev, productIds: validProductIds };
      }
      return prev;
    });
  }, [products, isLoadingProducts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMandiToggle = (mandiId) => {
    setFormData(prev => {
      const isSelected = prev.mandiIds.includes(mandiId);
      return {
        ...prev,
        mandiIds: isSelected 
          ? prev.mandiIds.filter(id => id !== mandiId)
          : [...prev.mandiIds, mandiId]
      };
    });
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => {
      const isSelected = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: isSelected 
          ? prev.productIds.filter(id => id !== productId)
          : [...prev.productIds, productId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await MarketSourceApi.create(formData);
      navigate(`/app/market-sources/${response.data.data.id}`);
    } catch (error) {
      console.error('Error creating market source:', error);
      alert('Failed to create market source. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Market Source</h1>
          <p className="text-slate-500 mt-1">Add a new intelligence source for market data.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
                <input 
                  required
                  type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="e.g. Sharma Traders"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name *</label>
                <input 
                  required
                  type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="e.g. Rajesh Sharma"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                <input 
                  required
                  type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="Same as mobile if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Group ID</label>
                <input 
                  type="text" name="whatsappGroupId" value={formData.whatsappGroupId} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="e.g. 244937991938246@g.us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alternative Number</label>
                <input 
                  type="tel" name="alternativeNumber" value={formData.alternativeNumber} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" name="address" value={formData.address} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
                <select 
                  name="sourceType" value={formData.sourceType} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="MANUAL">Manual Entry</option>
                  <option value="CSV">CSV Upload</option>
                  <option value="GOVERNMENT">Government Portal</option>
                  <option value="API">External API</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Assigned Mandis</h3>
            {isLoadingMandis ? (
              <div className="text-sm text-slate-500">Loading mandis...</div>
            ) : mandis.length === 0 ? (
              <div className="text-sm text-slate-500">No mandis available.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {mandis.map(mandi => (
                  <label 
                    key={mandi.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.mandiIds.includes(mandi.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200 bg-white'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      checked={formData.mandiIds.includes(mandi.id)}
                      onChange={() => handleMandiToggle(mandi.id)}
                    />
                    <span className="text-sm font-medium text-slate-700 select-none">
                      {mandi.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Assigned Products</h3>
            {isLoadingProducts ? (
              <div className="text-sm text-slate-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-sm text-slate-500">No products available in the selected mandis.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map(product => (
                  <label 
                    key={product.productId}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.productIds.includes(product.productId)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200 bg-white'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      checked={formData.productIds.includes(product.productId)}
                      onChange={() => handleProductToggle(product.productId)}
                    />
                    <span className="text-sm font-medium text-slate-700 select-none">
                      {product.cropName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Additional Notes</h3>
            <textarea 
              name="notes" value={formData.notes} onChange={handleChange} rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              placeholder="Any specific instructions or contextual info..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : 'Save Market Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketSourceApi } from '../api/market-source.api';
import { 
  MapPin, Phone, User, Calendar, ShieldCheck, 
  MessageSquare, Database, Tag, BarChart3, Clock, 
  ChevronRight, Filter, CheckCircle2, Plus, Save, X
} from 'lucide-react';

export default function MarketSourceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSourceDetails();
  }, [id]);

  const fetchSourceDetails = async () => {
    try {
      setIsLoading(true);
      const response = await MarketSourceApi.getById(id);
      if (response.data?.data) {
        setSource(response.data.data);
      } else {
        setSource(null);
      }
    } catch (error) {
      console.error('Failed to fetch market source:', error);
      setSource(null);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['Overview', 'Messages', 'Manual Entry', 'History'];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Dashboard...</div>;
  }

  if (!source) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* Top Navbar Area (Breadcrumbs) */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center text-sm text-slate-500 font-medium">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/app/market-sources')}>Market Sources</span>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
          <span className="text-slate-800">{source.businessName}</span>
        </div>
        <div className="relative cursor-pointer">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">0</span>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-sm">
          
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              {source.businessName?.split(' ').map(n => n[0]).join('') || 'VT'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{source.businessName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {source.status || 'ACTIVE'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {source.mandis?.map(m => m.name).join(', ') || 'No Mandi Assigned'}</div>
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Owner: {source.ownerName || 'N/A'}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {source.mobileNumber || 'N/A'}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Created: {new Date(source.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            {/* Automation Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-sm font-semibold text-slate-700">Automation</span>
              <button 
                onClick={async () => {
                  try {
                    const newVal = !source.isAutomationEnabled;
                    await MarketSourceApi.updateParserProfile(source.id, newVal);
                    setSource({ ...source, isAutomationEnabled: newVal });
                  } catch (err) {
                    console.error("Failed to toggle automation", err);
                  }
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${source.isAutomationEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${source.isAutomationEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            <button 
              onClick={() => navigate(`/app/market-sources/edit/${source.id}`)}
              className="flex-1 xl:flex-none px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
            >
              Edit Profile
            </button>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={MessageSquare} color="bg-green-100 text-green-600" value={source.totalMessages || 0} label="Total Messages" />
          <StatCard icon={Tag} color="bg-purple-100 text-purple-600" value={source.products?.length || 0} label="Assigned Products" />
          <StatCard icon={MapPin} color="bg-orange-100 text-orange-500" value={source.mandis?.length || 0} label="Assigned Mandis" />
        </div>

        {/* Tabs Row */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-emerald-600 text-emerald-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="mt-6">
          {activeTab === 'Overview' && <OverviewTab source={source} />}
          {activeTab === 'Messages' && <MessagesTab source={source} />}
          {activeTab === 'Manual Entry' && <ManualEntryTab source={source} />}
          {activeTab === 'History' && <HistoryTab source={source} />}
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HELPER COMPONENTS
// -------------------------------------------------------------

function StatCard({ icon: Icon, color, value, label }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// OVERVIEW TAB
// -------------------------------------------------------------
function OverviewTab({ source }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Business Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">Business Information</h3>
        <div className="space-y-4">
          <InfoRow label="Business Name" value={source.businessName} />
          <InfoRow label="Owner Name" value={source.ownerName || 'N/A'} />
          <InfoRow label="Mobile Number" value={source.mobileNumber || 'N/A'} />
          <InfoRow label="WhatsApp Number" value={source.whatsappNumber || source.mobileNumber || 'N/A'} />
        </div>
      </div>

      {/* Source Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">Source Information</h3>
        <div className="space-y-4">
          <InfoRow label="Assigned Mandis" value={source.mandis?.map(m=>m.name).join(', ') || 'None'} />
          <InfoRow label="Source Type" value={source.sourceType || 'WhatsApp'} />
          <InfoRow label="Parser" value={source.parser || 'Default'} />
          <InfoRow label="Status" value={<span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">{source.status || 'ACTIVE'}</span>} />
        </div>
      </div>

      {/* Assigned Products */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex justify-between">
          <span>Assigned Products</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{source.products?.length || 0}</span>
        </h3>
        
        <div className="space-y-3 h-48 overflow-y-auto pr-2">
          {source.products && source.products.length > 0 ? (
            source.products.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">{p.name.substring(0, 2).toUpperCase()}</div>
                  <span className="font-semibold text-slate-700">{p.name}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm text-center pt-8">No products assigned.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function LegendRow({ color, label, percent }) {
  return (
    <div className="flex justify-between items-center text-xs font-semibold">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-sm ${color}`}></div>
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="text-slate-500">{percent}</span>
    </div>
  );
}

// -------------------------------------------------------------
// MESSAGES TAB (Split View)
// -------------------------------------------------------------
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

function MessagesTab({ source }) {
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [prices, setPrices] = useState({});

  const { data: messagesResponse, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['marketSourceMessages', source.id],
    queryFn: () => MarketSourceApi.getMessages(source.id),
    enabled: !!source.id,
  });

  const messages = messagesResponse?.data?.data || [];
  
  // Set first message active by default
  useEffect(() => {
    if (messages.length > 0 && !activeMessageId) {
      setActiveMessageId(messages[0]._id || messages[0].messageId);
    }
  }, [messages, activeMessageId]);

  const currentMsg = messages.find(m => (m._id === activeMessageId) || (m.messageId === activeMessageId));

  // Initialize prices when message changes
  useEffect(() => {
    if (currentMsg && currentMsg.extractedData?.prices) {
      const initialPrices = {};
      currentMsg.extractedData.prices.forEach(p => {
        const variantName = p.variantName || 'Base';
        const key = `${p.productId}-${variantName}`;
        initialPrices[key] = {
          productId: p.productId,
          variantName: variantName,
          minPrice: p.minPrice,
          maxPrice: p.maxPrice,
          modalPrice: p.modalPrice || p.minPrice,
          unit: p.unit || 'Qtl'
        };
      });
      setPrices(initialPrices);
    } else {
      setPrices({});
    }
  }, [currentMsg]);

  const handlePriceChange = (productId, variantName, field, value) => {
    const key = `${productId}-${variantName}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        productId,
        variantName
      }
    }));
  };

  const handleAddVariant = (productId) => {
    const newVariantName = prompt('Enter variant name (e.g. Super, Average):');
    if (newVariantName && newVariantName.trim()) {
      handlePriceChange(productId, newVariantName.trim(), 'minPrice', '');
    }
  };

  const handleRemoveVariant = (productId, variantName) => {
    const key = `${productId}-${variantName}`;
    setPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[key];
      return newPrices;
    });
  };

  const displayProducts = React.useMemo(() => {
    const pMap = new Map();
    if (source.products) {
      source.products.forEach(p => pMap.set(p.id, { id: p.id, name: p.name }));
    }
    if (currentMsg?.extractedData?.prices) {
      currentMsg.extractedData.prices.forEach(p => {
        if (!pMap.has(p.productId)) {
          pMap.set(p.productId, { id: p.productId, name: p.cropName || 'Unknown Crop' });
        }
      });
    }
    return Array.from(pMap.values());
  }, [source.products, currentMsg]);

  const handleSubmit = async () => {
    try {
      const priceData = Object.entries(prices).map(([key, data]) => ({
        productId: data.productId,
        variantName: data.variantName,
        minPrice: parseInt(data.minPrice) || 0,
        maxPrice: parseInt(data.maxPrice) || 0,
        unit: 'Qtl',
      })).filter(p => p.minPrice > 0 || p.maxPrice > 0);

      if (priceData.length === 0) {
        toast.error('Please enter at least one price');
        return;
      }

      await MarketSourceApi.submitPrices(source.id, { prices: priceData, messageId: currentMsg._id || currentMsg.messageId });
      toast.success('Prices verified and submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit prices: ' + error.message);
    }
  };

  if (isLoadingMessages) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Messages...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto min-h-[600px]">
      
      {/* Left Pane - Message List */}
      <div className="w-full lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Messages ({messages.length})</h3>
          <button className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-200"><Filter className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 bg-slate-50">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No messages found.</div>
          ) : messages.map((msg) => {
            const msgId = msg._id || msg.messageId;
            const dateStr = new Date(msg.createdAt || msg.timestamp).toLocaleString();
            const text = msg.text || msg.rawMessage?.conversation || msg.rawMessage?.text || JSON.stringify(msg.rawMessage);
            const isParsed = msg.isParsed || msg.reviewStatus === 'COMPLETED' || msg.aiStatus === 'completed';
            
            return (
            <div 
              key={msgId} 
              onClick={() => setActiveMessageId(msgId)}
              className={`p-4 cursor-pointer transition-all ${activeMessageId === msgId ? 'bg-white border-l-4 border-emerald-500 shadow-sm' : 'hover:bg-white border-l-4 border-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-900 text-sm">{msg.senderName || source.ownerName || 'Unknown Sender'}</div>
                <div className="text-[10px] font-semibold text-slate-400">{new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{text}</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isParsed ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-600">
                    {isParsed ? 'PARSED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Right Pane - Message Detail */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        {currentMsg ? (
          <>
        {/* Detail Header */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">WhatsApp Message</h3>
            <p className="text-xs text-slate-500 font-medium">Received {new Date(currentMsg.createdAt || currentMsg.timestamp).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
              Parser: {currentMsg.parserVersion || source.parser || 'V2'}
            </span>
            <button 
              onClick={async () => {
                try {
                  await MarketSourceApi.parseMessage(source.id, currentMsg._id || currentMsg.messageId);
                  toast.success("Message Parsed successfully!");
                  window.location.reload();
                } catch (e) {
                  toast.error("Error parsing: " + e.message);
                }
              }}
              className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Parse with AI
            </button>
          </div>
        </div>

        {/* 2 Columns Content */}
        <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-8 h-full bg-slate-50">
          
          {/* Column 1: Chat Bubble */}
          <div className="flex flex-col h-full xl:col-span-5">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              Raw Message
            </h4>
            <div className="flex-1 overflow-y-auto pr-2 pb-8">
              <div className="bg-[#e1f5c4] rounded-2xl rounded-tl-sm p-4 text-sm text-slate-800 shadow-sm relative whitespace-pre-wrap leading-relaxed inline-block max-w-[95%]">
                {currentMsg.text || currentMsg.rawMessage?.conversation || currentMsg.rawMessage?.text || JSON.stringify(currentMsg.rawMessage)}
                <div className="text-[10px] text-emerald-700/60 text-right mt-2 font-semibold">
                  {new Date(currentMsg.createdAt || currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Unified Editable Prices */}
          <div className="flex flex-col h-full xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-800">Review & Submit Prices</h4>
              {currentMsg.extractedData?.prices?.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">AI Pre-filled</span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayProducts.length > 0 ? (
                displayProducts.map((product) => {
                  const existingKeys = Object.keys(prices).filter(k => k.startsWith(`${product.id}-`));
                  if (!existingKeys.includes(`${product.id}-Base`)) {
                    existingKeys.unshift(`${product.id}-Base`);
                  }
                  
                  const variantKeys = existingKeys.filter(k => k !== `${product.id}-Base`);

                  return (
                    <div key={product.id} className="flex flex-col gap-5 p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Header and Base Price */}
                      <div className="flex flex-col gap-4">
                        <div className="font-bold text-slate-800 text-lg">
                          {product.name}
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-wide">Min Price</label>
                            <input 
                              type="number" 
                              value={prices[`${product.id}-Base`]?.minPrice || ''}
                              onChange={(e) => handlePriceChange(product.id, 'Base', 'minPrice', e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm" 
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-wide">Max Price</label>
                            <input 
                              type="number" 
                              value={prices[`${product.id}-Base`]?.maxPrice || ''}
                              onChange={(e) => handlePriceChange(product.id, 'Base', 'maxPrice', e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm" 
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Variants Section */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-sm font-bold text-slate-700">Variants</span>
                          <button 
                            onClick={() => handleAddVariant(product.id)}
                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 uppercase tracking-wide"
                          >
                            <Plus size={12} /> Add Variant
                          </button>
                        </div>
                        
                        {variantKeys.length === 0 ? (
                          <div className="text-xs text-slate-400 italic py-2">No custom variants added.</div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-[100px_1fr_1fr_30px] gap-2 px-2 mb-1">
                              <div></div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Min ₹</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Max ₹</div>
                              <div></div>
                            </div>
                            
                            {variantKeys.map(key => {
                              const variantName = key.substring(product.id.length + 1);
                              return (
                                <div key={key} className="grid grid-cols-[100px_1fr_1fr_30px] gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="truncate" title={variantName}>{variantName}</span>
                                  </div>
                                  <div>
                                    <input 
                                      type="number" 
                                      value={prices[key]?.minPrice || ''}
                                      onChange={(e) => handlePriceChange(product.id, variantName, 'minPrice', e.target.value)}
                                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white" 
                                      placeholder="Min"
                                    />
                                  </div>
                                  <div>
                                    <input 
                                      type="number" 
                                      value={prices[key]?.maxPrice || ''}
                                      onChange={(e) => handlePriceChange(product.id, variantName, 'maxPrice', e.target.value)}
                                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white" 
                                      placeholder="Max"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveVariant(product.id, variantName)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Remove variant"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 p-8 text-sm font-medium border border-dashed border-slate-200 rounded-xl">
                  No crops assigned and message not parsed.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleSubmit}
                disabled={Object.keys(prices).length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Verify & Submit Prices
              </button>
            </div>
          </div>
          
        </div>
        </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl m-4">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <span className="font-medium">Select a message to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MANUAL ENTRY TAB
// -------------------------------------------------------------
function ManualEntryTab({ source }) {
  const [prices, setPrices] = useState({});

  // handlePriceChange now expects productId, variantName, field, value
  const handlePriceChange = (productId, variantName, field, value) => {
    const key = `${productId}-${variantName}`;
    setPrices(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        productId,
        variantName
      }
    }));
  };

  const handleAddVariant = (productId) => {
    const newVariantName = prompt('Enter variant name (e.g. Super, Average):');
    if (newVariantName && newVariantName.trim()) {
      handlePriceChange(productId, newVariantName.trim(), 'minPrice', '');
    }
  };

  const handleRemoveVariant = (productId, variantName) => {
    const key = `${productId}-${variantName}`;
    setPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[key];
      return newPrices;
    });
  };

  const handleSubmit = async () => {
    try {
      const priceData = Object.entries(prices).map(([key, data]) => {
        return {
          productId: data.productId,
          variantName: data.variantName,
          minPrice: parseInt(data.minPrice) || 0,
          maxPrice: parseInt(data.maxPrice) || 0,
          modalPrice: parseInt(data.modalPrice) || 0,
          unit: data.unit || 'Qtl',
        };
      }).filter(p => p.minPrice > 0 || p.maxPrice > 0 || p.modalPrice > 0);

      if (priceData.length === 0) {
        toast.error('Please enter at least one price');
        return;
      }

      await MarketSourceApi.submitPrices(source.id, { prices: priceData, isManualEntry: true });
      toast.success('Manual prices submitted successfully!');
      setPrices({}); // Reset
    } catch (error) {
      toast.error('Failed to submit prices: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Direct Manual Entry</h3>
        <p className="text-sm text-slate-500 mt-1">Submit prices directly for this trader's assigned crops without needing a WhatsApp message.</p>
      </div>

      <div className="space-y-4">
        {source.products && source.products.length > 0 ? (
          source.products.map(product => {
            // Find all variant rows for this product in state
            // Default to showing at least 'Base'
            const existingKeys = Object.keys(prices).filter(k => k.startsWith(`${product.id}-`));
            if (!existingKeys.includes(`${product.id}-Base`)) {
              existingKeys.unshift(`${product.id}-Base`);
            }
            
            const variantKeys = existingKeys.filter(k => k !== `${product.id}-Base`);

            return (
              <div key={product.id} className="flex flex-col gap-5 p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Header and Base Price */}
                <div className="flex flex-col gap-4">
                  <div className="font-bold text-slate-800 text-lg">
                    {product.name}
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-wide">Min Price</label>
                      <input 
                        type="number" 
                        value={prices[`${product.id}-Base`]?.minPrice || ''}
                        onChange={(e) => handlePriceChange(product.id, 'Base', 'minPrice', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-wide">Max Price</label>
                      <input 
                        type="number" 
                        value={prices[`${product.id}-Base`]?.maxPrice || ''}
                        onChange={(e) => handlePriceChange(product.id, 'Base', 'maxPrice', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-wide">Modal Price</label>
                      <input 
                        type="number" 
                        value={prices[`${product.id}-Base`]?.modalPrice || ''}
                        onChange={(e) => handlePriceChange(product.id, 'Base', 'modalPrice', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-700">Variants</span>
                    <button 
                      onClick={() => handleAddVariant(product.id)}
                      className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>
                  
                  {variantKeys.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2">No custom variants added.</div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[140px_1fr_1fr_40px] gap-3 px-4 mb-1">
                        <div></div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Min ₹</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Max ₹</div>
                        <div></div>
                      </div>
                      
                      {variantKeys.map(key => {
                        const variantName = key.substring(product.id.length + 1);
                        return (
                          <div key={key} className="grid grid-cols-[140px_1fr_1fr_40px] gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="font-semibold text-slate-700 text-sm flex items-center gap-2 pl-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              {variantName}
                            </div>
                            <div>
                              <input 
                                type="number" 
                                value={prices[key]?.minPrice || ''}
                                onChange={(e) => handlePriceChange(product.id, variantName, 'minPrice', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white" 
                                placeholder="Min"
                              />
                            </div>
                            <div>
                              <input 
                                type="number" 
                                value={prices[key]?.maxPrice || ''}
                                onChange={(e) => handlePriceChange(product.id, variantName, 'maxPrice', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white" 
                                placeholder="Max"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveVariant(product.id, variantName)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove variant"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 text-slate-500 border border-dashed border-slate-300 rounded-xl">
            No crops are assigned to this trader. Go to "Edit Profile" to add crops.
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(prices).length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          Submit Prices Directly
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HISTORY TAB COMPONENT
// -------------------------------------------------------------
function HistoryTab({ source }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [source.id]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await MarketSourceApi.getPriceHistory(source.id);
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading History...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 shadow-sm">
        No price history found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((dayGroup, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              {new Date(dayGroup.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Variant</th>
                  <th className="px-6 py-3 font-semibold">Min Price</th>
                  <th className="px-6 py-3 font-semibold">Max Price</th>
                  <th className="px-6 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dayGroup.prices.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{p.productName}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.variantName ? (
                        <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">{p.variantName}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">₹{p.minPrice}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">₹{p.maxPrice}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

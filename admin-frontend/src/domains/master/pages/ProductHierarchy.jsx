import React, { useState } from 'react';
import { Network, ChevronRight, ChevronDown, Package, Layers, Leaf, Hash, Scale, Box } from 'lucide-react';

const HierarchyNode = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first 2 levels

  const hasChildren = item.children && item.children.length > 0;
  
  // Icon based on level
  const getIcon = () => {
    switch(item.type) {
      case 'category': return <Layers size={14} className="text-indigo-500" />;
      case 'subcategory': return <Layers size={14} className="text-blue-500" />;
      case 'crop': return <Leaf size={14} className="text-emerald-500" />;
      case 'variety': return <Hash size={14} className="text-amber-500" />;
      case 'grade': return <Scale size={14} className="text-purple-500" />;
      case 'packaging': return <Box size={14} className="text-orange-500" />;
      case 'unit': return <Package size={14} className="text-slate-500" />;
      default: return <div className="w-3.5 h-3.5" />;
    }
  };

  const getTypeStyle = () => {
    switch(item.type) {
      case 'category': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'subcategory': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'crop': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'variety': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'grade': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'packaging': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'unit': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="ml-4 mt-2">
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/50' : ''}`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-4 h-4 flex items-center justify-center text-slate-400">
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-slate-800">{item.name}</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getTypeStyle()}`}>
            {item.type}
          </span>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l-2 border-slate-100 ml-2 pl-2">
          {item.children.map((child, idx) => (
            <HierarchyNode key={idx} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductHierarchy() {
  // Mock Data demonstrating the full chain
  const hierarchyData = [
    {
      id: 'c1',
      name: 'Vegetables',
      type: 'category',
      children: [
        {
          id: 'sc1',
          name: 'Bulb & Stem Vegetables',
          type: 'subcategory',
          children: [
            {
              id: 'cr1',
              name: 'Onion',
              type: 'crop',
              children: [
                {
                  id: 'v1',
                  name: 'NHRDF Red',
                  type: 'variety',
                  children: [
                    {
                      id: 'g1',
                      name: 'Super (A Grade)',
                      type: 'grade',
                      children: [
                        {
                          id: 'p1',
                          name: 'Jute Bag - 50kg',
                          type: 'packaging',
                          children: [
                            { id: 'u1', name: 'Quintal', type: 'unit' },
                            { id: 'u2', name: 'Ton', type: 'unit' }
                          ]
                        }
                      ]
                    },
                    {
                      id: 'g2',
                      name: 'Medium (B Grade)',
                      type: 'grade',
                      children: [
                        {
                          id: 'p2',
                          name: 'Mesh Bag - 25kg',
                          type: 'packaging',
                          children: [
                            { id: 'u3', name: 'Quintal', type: 'unit' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'c2',
      name: 'Grains',
      type: 'category',
      children: [
        {
          id: 'sc2',
          name: 'Cereals',
          type: 'subcategory',
          children: [
            {
              id: 'cr2',
              name: 'Wheat',
              type: 'crop',
              children: [
                {
                  id: 'v2',
                  name: 'Sharbati',
                  type: 'variety',
                  children: [
                    {
                      id: 'g3',
                      name: 'Premium',
                      type: 'grade',
                      children: [
                        {
                          id: 'p3',
                          name: 'PP Bag - 100kg',
                          type: 'packaging',
                          children: [
                            { id: 'u4', name: 'Quintal', type: 'unit' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Network className="text-indigo-600" />
            Product Hierarchy Map
          </h1>
          <p className="text-slate-500 text-sm mt-1">Interactive visualization of the complete agricultural product taxonomy.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-4 items-center text-sm font-medium text-slate-600">
          <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mr-2">Legend:</span>
          <span className="flex items-center gap-1.5"><Layers size={14} className="text-indigo-500" /> Category</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Layers size={14} className="text-blue-500" /> Sub Category</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Leaf size={14} className="text-emerald-500" /> Crop</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Hash size={14} className="text-amber-500" /> Variety</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Scale size={14} className="text-purple-500" /> Grade</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Box size={14} className="text-orange-500" /> Packaging</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="flex items-center gap-1.5"><Package size={14} className="text-slate-500" /> Unit</span>
        </div>

        <div className="font-mono text-sm bg-white p-4 rounded-lg border border-slate-200">
          {hierarchyData.map(rootItem => (
            <HierarchyNode key={rootItem.id} item={rootItem} />
          ))}
        </div>
      </div>
    </div>
  );
}

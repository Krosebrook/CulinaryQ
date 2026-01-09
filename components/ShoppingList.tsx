
import React, { useState, useEffect } from 'react';
import { ShoppingItem, GroundingSource } from '../types';
import { findNearbyStores } from '../services/geminiService';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggle: (name: string) => void;
  onClear: () => void;
  onRemove: (name: string) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggle, onClear, onRemove }) => {
  const [nearbyStores, setNearbyStores] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      // Use mock coordinates if browser doesn't provide them
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const result = await findNearbyStores("What are the best grocery stores nearby for fresh produce?", latitude, longitude);
        setNearbyStores(result);
        setIsLoadingStores(false);
      }, async () => {
        const result = await findNearbyStores("What are the best grocery stores in San Francisco for fresh produce?", 37.7749, -122.4194);
        setNearbyStores(result);
        setIsLoadingStores(false);
      });
    } catch (e) {
      setIsLoadingStores(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Shopping List</h2>
          <button onClick={onClear} className="text-sm text-red-500 font-bold hover:underline">Clear All</button>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-4xl mb-4">🛒</p>
            <p>Your list is empty. Scan your fridge to find what's missing!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.name} className="flex items-center gap-4 group">
                <button 
                  onClick={() => onToggle(item.name)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}
                >
                  {item.checked && <span className="text-white text-xs">✓</span>}
                </button>
                <span className={`flex-1 text-lg ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.name}
                </span>
                <button onClick={() => onRemove(item.name)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-indigo-900">Find Ingredients Nearby</h3>
            <p className="text-indigo-700 text-sm">Discover local markets and specialty stores.</p>
          </div>
          <button 
            onClick={fetchStores}
            disabled={isLoadingStores}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoadingStores ? 'Searching...' : 'Explore Markets'}
          </button>
        </div>

        {nearbyStores && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-indigo-800 whitespace-pre-wrap leading-relaxed">{nearbyStores.text}</p>
            <div className="flex flex-wrap gap-2">
              {nearbyStores.sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-lg text-indigo-600 text-sm font-semibold border border-indigo-200 hover:shadow-md transition-shadow flex items-center gap-2"
                >
                  📍 {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PantryItem } from '../types';

interface PantryInventoryProps {
  pantry: PantryItem[];
  onAdd: (item: Omit<PantryItem, 'id'>) => void;
  onRemove: (id: string) => void;
}

const COMMON_INGREDIENTS = [
  'All-purpose Flour', 'Almond Milk', 'Apples', 'Avocado', 'Bacon', 'Baking Powder', 'Baking Soda',
  'Basmati Rice', 'Beef Broth', 'Beef Chuck', 'Bell Peppers', 'Black Beans', 'Black Pepper',
  'Blueberries', 'Breadcrumbs', 'Brown Rice', 'Brown Sugar', 'Butter', 'Canola Oil', 'Carrots',
  'Cashews', 'Cheddar Cheese', 'Chicken Breast', 'Chicken Broth', 'Chicken Thighs', 'Chickpeas',
  'Cilantro', 'Cinnamon', 'Coconut Milk', 'Corn', 'Couscous', 'Cucumber', 'Dijon Mustard',
  'Eggs', 'Extra Virgin Olive Oil', 'Feta Cheese', 'Garlic', 'Garlic Powder', 'Ginger',
  'Greek Yogurt', 'Ground Beef', 'Ground Turkey', 'Honey', 'Ketchup', 'Kidney Beans', 'Lemon',
  'Limes', 'Maple Syrup', 'Mayonnaise', 'Milk', 'Mushrooms', 'Oats', 'Olive Oil', 'Onion',
  'Oregano', 'Paprika', 'Parmesan Cheese', 'Parsley', 'Pasta', 'Peanut Butter', 'Potatoes',
  'Quinoa', 'Red Onion', 'Red Pepper Flakes', 'Rosemary', 'Salt', 'Scallions', 'Sesame Oil',
  'Shallots', 'Soy Sauce', 'Spinach', 'Strawberries', 'Sugar', 'Sweet Potatoes', 'Thyme',
  'Tomato Paste', 'Tomatoes', 'Vanilla Extract', 'Vegetable Broth', 'Vegetable Oil', 'Walnuts',
  'White Rice', 'White Vinegar', 'Whole Wheat Bread', 'Worcestershire Sauce', 'Zucchini'
];

type SortKey = 'name' | 'quantity' | 'expirationDate';
type SortDirection = 'asc' | 'desc';

const PantryInventory: React.FC<PantryInventoryProps> = ({ pantry, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [threshold, setThreshold] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (name.trim().length > 0 && showSuggestions) {
      const filtered = COMMON_INGREDIENTS.filter(item =>
        item.toLowerCase().includes(name.toLowerCase()) &&
        item.toLowerCase() !== name.toLowerCase()
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [name, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ 
      name, 
      quantity: qty, 
      expirationDate: expiry, 
      lowStockThreshold: threshold ? parseFloat(threshold) : undefined 
    });
    setName('');
    setQty('');
    setExpiry('');
    setThreshold('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedPantry = useMemo(() => {
    const sorted = [...pantry].sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';

      if (sortBy === 'quantity') {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        if (numA !== numB) return numA - numB;
      }

      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [pantry, sortBy, sortDirection]);

  const isLowStock = (item: PantryItem) => {
    if (item.lowStockThreshold === undefined) return false;
    const currentQty = parseFloat(item.quantity);
    return !isNaN(currentQty) && currentQty <= item.lowStockThreshold;
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortBy !== field) return <span className="text-slate-300 ml-1 opacity-50 group-hover:opacity-100 transition-opacity">↕</span>;
    return <span className="text-emerald-500 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Pantry Inventory</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12 items-end relative">
          <div className="md:col-span-1 relative">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Flour"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionRef}
                className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
              >
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-slate-700 text-sm font-medium transition-colors border-b border-slate-50 last:border-none flex items-center gap-2"
                  >
                    <span className="text-emerald-500">✨</span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Qty / Unit</label>
            <input
              type="text"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="e.g. 500g"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Min Alert Level</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98] text-sm"
          >
            Add Item
          </button>
        </form>

        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-500">
              {pantry.length} items in inventory
            </div>
            {pantry.some(isLowStock) && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold animate-pulse">
                <span>⚠️</span> {pantry.filter(isLowStock).length} items low on stock
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sort by: 
            <button onClick={() => toggleSort('name')} className={`hover:text-emerald-600 ${sortBy === 'name' ? 'text-emerald-600' : ''}`}>Name</button>
            <span>•</span>
            <button onClick={() => toggleSort('quantity')} className={`hover:text-emerald-600 ${sortBy === 'quantity' ? 'text-emerald-600' : ''}`}>Quantity</button>
            <span>•</span>
            <button onClick={() => toggleSort('expirationDate')} className={`hover:text-emerald-600 ${sortBy === 'expirationDate' ? 'text-emerald-600' : ''}`}>Expiry</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-inner bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center">Ingredient <SortIcon field="name" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => toggleSort('quantity')}
                >
                  <div className="flex items-center">Current Quantity <SortIcon field="quantity" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Alert</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => toggleSort('expirationDate')}
                >
                  <div className="flex items-center">Expiry Date <SortIcon field="expirationDate" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPantry.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🧺</div>
                    <p className="italic font-medium">Your pantry is currently empty.</p>
                  </td>
                </tr>
              ) : (
                sortedPantry.map((item) => (
                  <tr key={item.id} className={`group transition-colors ${isLowStock(item) ? 'bg-amber-50/20' : 'hover:bg-emerald-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isLowStock(item) ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-semibold ${isLowStock(item) ? 'text-amber-900' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        {isLowStock(item) && (
                          <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter shadow-sm animate-pulse">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isLowStock(item) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.quantity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400">
                        {item.lowStockThreshold !== undefined ? `Alert at ${item.lowStockThreshold}` : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        item.expirationDate && new Date(item.expirationDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'
                      }`}>
                        {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-slate-300 hover:text-red-500 font-bold text-sm transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6">
          <div className="text-5xl">💡</div>
          <div>
            <h4 className="text-xl font-bold mb-1 text-emerald-100">Smart Monitoring</h4>
            <p className="text-emerald-200/80 text-sm leading-relaxed">
              Set "Min Alert Levels" to have the Genie automatically flag ingredients that need restocking. Perfect for staples like eggs, flour, or milk.
            </p>
          </div>
        </div>
        <div className="bg-amber-500 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6">
          <div className="text-5xl">⚠️</div>
          <div>
            <h4 className="text-xl font-bold mb-1">Waste Prevention</h4>
            <p className="text-amber-100 text-sm leading-relaxed">
              Red dates indicate expired items. Check these first to keep your kitchen healthy and organized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantryInventory;

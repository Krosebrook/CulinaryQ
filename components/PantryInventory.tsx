
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

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Spices', 'Bakery', 'Other'
];

type SortKey = 'name' | 'quantity' | 'expirationDate' | 'category';
type SortDirection = 'asc' | 'desc';

interface SortRule {
  key: SortKey;
  direction: SortDirection;
}

const PantryInventory: React.FC<PantryInventoryProps> = ({ pantry, onAdd, onRemove }) => {
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pantry');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [threshold, setThreshold] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Multi-Column Sort State
  // Default sort: Expiry Ascending, then Name Ascending
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'expirationDate', direction: 'asc' },
    { key: 'name', direction: 'asc' }
  ]);
  
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
      category,
      quantity: qty, 
      expirationDate: expiry, 
      lowStockThreshold: threshold ? parseFloat(threshold) : undefined 
    });
    setName('');
    setQty('');
    setExpiry('');
    setThreshold('');
    setCategory('Pantry');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /**
   * Toggles multi-column sorting. 
   * Last clicked column becomes the primary sort (index 0).
   */
  const toggleSort = (key: SortKey) => {
    setSortRules(prev => {
      const existingIndex = prev.findIndex(r => r.key === key);
      const newRules = [...prev];

      if (existingIndex === 0) {
        // If already primary, toggle direction
        newRules[0] = { 
          ...newRules[0], 
          direction: newRules[0].direction === 'asc' ? 'desc' : 'asc' 
        };
      } else if (existingIndex > 0) {
        // If in list but not primary, move to primary and default to 'asc'
        const [removed] = newRules.splice(existingIndex, 1);
        newRules.unshift({ ...removed, direction: 'asc' });
      } else {
        // If not in list, add to primary
        newRules.unshift({ key, direction: 'asc' });
      }

      // Limit to 3 levels of sorting for performance and clarity
      return newRules.slice(0, 3);
    });
  };

  const filteredAndSortedPantry = useMemo(() => {
    let result = pantry.filter(item => {
      // Name Search
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category Filter
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      
      // Date Range Filter
      let matchesDateRange = true;
      if (item.expirationDate) {
        const itemDate = new Date(item.expirationDate);
        if (dateFrom) {
          matchesDateRange = matchesDateRange && itemDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDateRange = matchesDateRange && itemDate <= new Date(dateTo);
        }
      } else if (dateFrom || dateTo) {
        matchesDateRange = false;
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    });

    result.sort((a, b) => {
      for (const rule of sortRules) {
        let valA: any = (a as any)[rule.key] || '';
        let valB: any = (b as any)[rule.key] || '';

        // Specific handling for numeric quantity sorting
        if (rule.key === 'quantity') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        // Specific handling for dates
        if (rule.key === 'expirationDate') {
          valA = valA ? new Date(valA).getTime() : Infinity; // Empty dates go to the bottom
          valB = valB ? new Date(valB).getTime() : Infinity;
        }

        if (valA < valB) return rule.direction === 'asc' ? -1 : 1;
        if (valA > valB) return rule.direction === 'asc' ? 1 : -1;
        // If equal, continue to next sort rule
      }
      return 0;
    });

    return result;
  }, [pantry, searchQuery, filterCategory, dateFrom, dateTo, sortRules]);

  const isLowStock = (item: PantryItem) => {
    if (item.lowStockThreshold === undefined) return false;
    const currentQty = parseFloat(item.quantity);
    return !isNaN(currentQty) && currentQty <= item.lowStockThreshold;
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    const ruleIndex = sortRules.findIndex(r => r.key === field);
    const rule = sortRules[ruleIndex];
    
    if (ruleIndex === -1) {
      return (
        <span className="text-slate-300 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
          ↕
        </span>
      );
    }

    return (
      <div className="inline-flex items-center ml-2">
        <span className="text-emerald-500 font-bold">
          {rule.direction === 'asc' ? '↑' : '↓'}
        </span>
        <span className={`ml-1 text-[8px] flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500 text-white font-black leading-none`}>
          {ruleIndex + 1}
        </span>
      </div>
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setDateFrom('');
    setDateTo('');
    setSortRules([
      { key: 'expirationDate', direction: 'asc' },
      { key: 'name', direction: 'asc' }
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Add New Item Form */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <span className="bg-emerald-100 p-2 rounded-xl text-2xl">➕</span> Add to Inventory
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end relative">
          <div className="md:col-span-2 relative">
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
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm text-sm bg-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
      </div>

      {/* Advanced Filter & Search Area */}
      <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold">Pantry Inventory</h3>
            <p className="text-slate-400 text-sm mt-1">Manage and track your supplies</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={resetFilters}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
             >
               Reset All
             </button>
             <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
             <div className="text-sm font-medium text-slate-400">
              Showing {filteredAndSortedPantry.length} of {pantry.length} items
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Search Ingredients</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find item..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Expiration Date Range</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white"
              />
            </div>
          </div>
        </div>

        {/* Sorting Feedback */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Sort Priority:</span>
          {sortRules.map((rule, idx) => (
            <div key={rule.key} className="flex items-center bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold">
              <span className="text-emerald-400 mr-2">{idx + 1}.</span>
              <span className="capitalize">{rule.key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="ml-2 text-slate-400">{rule.direction === 'asc' ? '↑' : '↓'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
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
                  onClick={() => toggleSort('category')}
                >
                  <div className="flex items-center">Category <SortIcon field="category" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => toggleSort('quantity')}
                >
                  <div className="flex items-center">Quantity <SortIcon field="quantity" /></div>
                </th>
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
              {filteredAndSortedPantry.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🧺</div>
                    <p className="italic font-medium">No items match your current filters.</p>
                    {(searchQuery || filterCategory !== 'All' || dateFrom || dateTo) && (
                      <button onClick={resetFilters} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSortedPantry.map((item) => (
                  <tr key={item.id} className={`group transition-colors ${isLowStock(item) ? 'bg-amber-50/20' : 'hover:bg-emerald-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isLowStock(item) ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className={`font-semibold block ${isLowStock(item) ? 'text-amber-900' : 'text-slate-800'}`}>
                            {item.name}
                          </span>
                          {isLowStock(item) && (
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight flex items-center gap-1">
                              ⚠️ Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest">
                        {item.category || 'Pantry'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isLowStock(item) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.quantity || 'N/A'}
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
      
      <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6">
        <div className="text-5xl">⚡</div>
        <div>
          <h4 className="text-xl font-bold mb-1 text-emerald-100">Multi-Column Precision</h4>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
            Click table headers sequentially to stack sorting priorities. 
            For example, click <strong>Expiry Date</strong> then <strong>Name</strong> to see items expiring soonest, ordered alphabetically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantryInventory;

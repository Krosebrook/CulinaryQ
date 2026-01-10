
import React, { useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
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

const STAPLE_DEFAULTS: Record<string, { qty: string, threshold: number, expiryDays: number, category: string }> = {
  'All-purpose Flour': { qty: '1kg', threshold: 0.5, expiryDays: 365, category: 'Bakery' },
  'Sugar': { qty: '1kg', threshold: 0.5, expiryDays: 730, category: 'Bakery' },
  'Brown Sugar': { qty: '500g', threshold: 0.2, expiryDays: 540, category: 'Bakery' },
  'Milk': { qty: '1L', threshold: 1, expiryDays: 7, category: 'Dairy' },
  'Eggs': { qty: '12', threshold: 4, expiryDays: 21, category: 'Dairy' },
  'Butter': { qty: '250g', threshold: 1, expiryDays: 60, category: 'Dairy' },
  'Basmati Rice': { qty: '1kg', threshold: 0.5, expiryDays: 365, category: 'Pantry' },
  'Pasta': { qty: '500g', threshold: 1, expiryDays: 730, category: 'Pantry' },
  'Olive Oil': { qty: '500ml', threshold: 0.2, expiryDays: 540, category: 'Pantry' },
  'Salt': { qty: '500g', threshold: 0.2, expiryDays: 1000, category: 'Spices' },
  'Pepper': { qty: '100g', threshold: 0.2, expiryDays: 730, category: 'Spices' },
};

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Spices', 'Bakery', 'Other'
];

type SortKey = 'name' | 'quantity' | 'expirationDate' | 'category';
type SortDirection = 'asc' | 'desc';

interface SortRule {
  key: SortKey;
  direction: SortDirection;
}

/**
 * Calculates Levenshtein distance between two strings.
 * Used for fuzzy matching to tolerate typos.
 * Time Complexity: O(N*M)
 */
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Fuzzy match helper.
 * Returns true if the query matches the text with allowed typos.
 */
const isFuzzyMatch = (text: string, query: string): boolean => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  
  if (t.includes(q)) return true;
  if (q.length < 2) return false;
  
  const tWords = t.split(/[\s-_]+/);
  const qWords = q.split(/[\s-_]+/).filter(w => w.length > 0);
  
  return qWords.every(qWord => {
    return tWords.some(tWord => {
      if (tWord.startsWith(qWord)) return true;
      const distance = getLevenshteinDistance(tWord, qWord);
      const allowedEdits = tWord.length > 6 ? 3 : tWord.length > 3 ? 2 : 1;
      return distance <= allowedEdits && distance < tWord.length / 2;
    });
  });
};

/**
 * Helper to calculate days remaining until expiration.
 * Normalizes dates to midnight to ensure accurate day counts.
 */
const getDaysRemaining = (dateStr: string) => {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const expiry = new Date(y, m - 1, d);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Highlights parts of a string that match the query (case-insensitive substring).
 */
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <span>{text}</span>;
  
  // Create a regex to find the query string (case insensitive)
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-bold box-decoration-clone">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const PantryInventory: React.FC<PantryInventoryProps> = ({ pantry, onAdd, onRemove }) => {
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pantry');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [threshold, setThreshold] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isFiltering = searchQuery !== deferredSearchQuery;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Multi-Column Sort State
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { key: 'expirationDate', direction: 'asc' },
    { key: 'name', direction: 'asc' }
  ]);
  
  const [dismissedAlerts, setDismissedAlerts] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Identify issues for alerts
  const expiringCount = pantry.filter(item => {
    const days = getDaysRemaining(item.expirationDate);
    return days >= 0 && days <= 3;
  }).length;

  const expiredCount = pantry.filter(item => {
     const days = getDaysRemaining(item.expirationDate);
     return days < 0;
  }).length;

  const totalAlerts = expiringCount + expiredCount;

  useEffect(() => {
    if (totalAlerts > 0) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [totalAlerts]);

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
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
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
    const staple = STAPLE_DEFAULTS[suggestion];
    if (staple) {
      if (!qty) setQty(staple.qty);
      if (!threshold) setThreshold(staple.threshold.toString());
      if (!expiry) {
        const date = new Date();
        date.setDate(date.getDate() + staple.expiryDays);
        setExpiry(date.toISOString().split('T')[0]);
      }
      setCategory(staple.category);
    }
  };

  const toggleSort = (key: SortKey) => {
    setSortRules(prev => {
      const existingIndex = prev.findIndex(r => r.key === key);
      const newRules = [...prev];

      if (existingIndex === 0) {
        newRules[0] = { 
          ...newRules[0], 
          direction: newRules[0].direction === 'asc' ? 'desc' : 'asc' 
        };
      } else if (existingIndex > 0) {
        const [removed] = newRules.splice(existingIndex, 1);
        newRules.unshift({ ...removed, direction: 'asc' });
      } else {
        newRules.unshift({ key, direction: 'asc' });
      }
      return newRules.slice(0, 3);
    });
  };

  const toggleCategoryFilter = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const applyQuickFilter = (type: 'expiring' | 'expired' | 'fresh') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (type === 'expiring') {
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      setDateFrom(todayStr);
      setDateTo(threeDaysLater.toISOString().split('T')[0]);
    } else if (type === 'expired') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setDateFrom('');
      setDateTo(yesterday.toISOString().split('T')[0]);
    } else if (type === 'fresh') {
       const nextWeek = new Date(today);
       nextWeek.setDate(today.getDate() + 7);
       setDateFrom(nextWeek.toISOString().split('T')[0]);
       setDateTo('');
    }
  };

  // Filter Logic
  const filteredAndSortedPantry = useMemo(() => {
    let result = pantry.filter(item => {
      // 1. Fuzzy Search Logic
      let matchesSearch = true;
      if (deferredSearchQuery) {
        const query = deferredSearchQuery.toLowerCase();
        const nameMatch = isFuzzyMatch(item.name, deferredSearchQuery);
        const catMatch = (item.category || '').toLowerCase().includes(query);
        matchesSearch = nameMatch || catMatch;
      }

      // 2. Multi-Category Filter Logic
      const matchesCategory = selectedCategories.length === 0 || 
        (item.category && selectedCategories.includes(item.category)) ||
        (!item.category && selectedCategories.includes('Other'));
      
      // 3. Date Range Logic (Timezone safe)
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        if (!item.expirationDate) {
           matchesDateRange = false;
        } else {
           // Normalize timestamps to midnight/end of day to avoid timezone off-by-one errors
           const itemTime = new Date(item.expirationDate + 'T00:00:00').getTime();
           const fromTime = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : -Infinity;
           const toTime = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;
           matchesDateRange = itemTime >= fromTime && itemTime <= toTime;
        }
      }
      
      return matchesSearch && matchesCategory && matchesDateRange;
    });

    // Sorting
    result.sort((a, b) => {
      for (const rule of sortRules) {
        let valA: any = (a as any)[rule.key] || '';
        let valB: any = (b as any)[rule.key] || '';
        if (rule.key === 'quantity') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }
        if (rule.key === 'expirationDate') {
          valA = valA ? new Date(valA).getTime() : Infinity;
          valB = valB ? new Date(valB).getTime() : Infinity;
        }
        if (valA < valB) return rule.direction === 'asc' ? -1 : 1;
        if (valA > valB) return rule.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return result;
  }, [pantry, deferredSearchQuery, selectedCategories, dateFrom, dateTo, sortRules]);

  const isLowStock = (item: PantryItem) => {
    if (item.lowStockThreshold === undefined) return false;
    const currentQty = parseFloat(item.quantity);
    return !isNaN(currentQty) && currentQty <= item.lowStockThreshold;
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    const ruleIndex = sortRules.findIndex(r => r.key === field);
    const rule = sortRules[ruleIndex];
    if (ruleIndex === -1) return <span className="text-slate-300 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">↕</span>;
    return (
      <div className="inline-flex items-center ml-2">
        <span className="text-emerald-500 font-bold">{rule.direction === 'asc' ? '↑' : '↓'}</span>
        <span className={`ml-1 text-[8px] flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500 text-white font-black leading-none`}>{ruleIndex + 1}</span>
      </div>
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDateFrom('');
    setDateTo('');
    setSortRules([{ key: 'expirationDate', direction: 'asc' }, { key: 'name', direction: 'asc' }]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Expiration Alert Banner */}
      {totalAlerts > 0 && !dismissedAlerts && (
        <div className={`border p-4 rounded-2xl flex items-start justify-between shadow-sm animate-pulse ${expiredCount > 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg text-xl ${expiredCount > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
               {expiredCount > 0 ? '🛑' : '⏰'}
             </div>
             <div>
               <h4 className={`font-bold ${expiredCount > 0 ? 'text-red-800' : 'text-orange-800'}`}>Inventory Alert</h4>
               <p className={`${expiredCount > 0 ? 'text-red-700' : 'text-orange-700'} text-sm`}>
                 {expiredCount > 0 
                   ? `You have ${expiredCount} expired items and ${expiringCount} expiring soon.` 
                   : `You have ${expiringCount} items expiring within 3 days.`}
               </p>
             </div>
           </div>
           <button onClick={() => setDismissedAlerts(true)} className={`font-bold px-2 ${expiredCount > 0 ? 'text-red-400 hover:text-red-600' : 'text-orange-400 hover:text-orange-600'}`}>✕</button>
        </div>
      )}

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
                    <span className="flex-1">{item}</span>
                    {STAPLE_DEFAULTS[item] && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Auto-Fill</span>}
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
             <button onClick={resetFilters} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Reset All</button>
             <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
             <div className="text-sm font-medium text-slate-400">Showing {filteredAndSortedPantry.length} of {pantry.length} items</div>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button onClick={() => applyQuickFilter('expired')} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 text-xs font-bold hover:bg-red-500/40 transition-colors whitespace-nowrap">
              ⚠️ Expired
            </button>
            <button onClick={() => applyQuickFilter('expiring')} className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/40 transition-colors whitespace-nowrap">
              ⏰ Expiring Soon (3 Days)
            </button>
            <button onClick={() => applyQuickFilter('fresh')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/40 transition-colors whitespace-nowrap">
              🥗 Fresh (Next 7+ Days)
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Search Ingredients</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                {isFiltering ? (
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '🔍'
                )}
              </span>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Name (Fuzzy search enabled)" 
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white placeholder-slate-400" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Categories</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:border-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-white flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedCategories.length === 0 ? 'All Categories' : `${selectedCategories.length} Selected`}
                </span>
                <span className="text-slate-400 text-xs">▼</span>
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                  {CATEGORIES.map(c => (
                    <label key={c} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-slate-300 hover:text-white transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(c)}
                        onChange={() => toggleCategoryFilter(c)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800 accent-emerald-500"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Expiration Date Range</label>
            <div className="flex items-center gap-3">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white" />
              <span className="text-slate-500">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all text-white" />
            </div>
          </div>
        </div>
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

      {/* Active Filters Display */}
      {(searchQuery || selectedCategories.length > 0 || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 mb-2 animate-in fade-in">
          {searchQuery && (
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              🔍 "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-emerald-900 font-black">×</button>
            </span>
          )}
          {selectedCategories.map(cat => (
             <span key={cat} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              📂 {cat}
              <button onClick={() => toggleCategoryFilter(cat)} className="hover:text-blue-900 font-black">×</button>
            </span>
          ))}
          {(dateFrom || dateTo) && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              📅 {dateFrom || '...'} ➜ {dateTo || '...'}
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="hover:text-purple-900 font-black">×</button>
            </span>
          )}
          <button onClick={resetFilters} className="text-slate-500 text-xs font-bold hover:underline ml-2">Clear All</button>
        </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center">Ingredient <SortIcon field="name" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => toggleSort('category')}>
                  <div className="flex items-center">Category <SortIcon field="category" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => toggleSort('quantity')}>
                  <div className="flex items-center">Quantity <SortIcon field="quantity" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => toggleSort('expirationDate')}>
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
                    {(searchQuery || selectedCategories.length > 0 || dateFrom || dateTo) && (
                      <button onClick={resetFilters} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Clear all filters</button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSortedPantry.map((item) => {
                  const daysRemaining = getDaysRemaining(item.expirationDate);
                  const isExpired = daysRemaining < 0;
                  const isExpiring = daysRemaining >= 0 && daysRemaining <= 3;
                  const lowStock = isLowStock(item);
                  
                  return (
                    <tr key={item.id} className={`group transition-colors border-b border-slate-50 last:border-none
                        ${isExpired ? 'bg-red-50/60 hover:bg-red-100/60' : 
                          isExpiring ? 'bg-orange-50/50 hover:bg-orange-100/50' :
                          lowStock ? 'bg-amber-50/30 hover:bg-amber-100/30' : 
                          'hover:bg-slate-50'
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold 
                            ${isExpired ? 'bg-red-100 text-red-600' : 
                              isExpiring ? 'bg-orange-100 text-orange-600' :
                              lowStock ? 'bg-amber-100 text-amber-600' : 
                              'bg-emerald-100 text-emerald-600'}`}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`font-semibold block 
                                ${isExpired ? 'text-red-900' :
                                  isExpiring ? 'text-orange-900' :
                                  lowStock ? 'text-amber-900' : 
                                  'text-slate-800'}`}>
                                <HighlightMatch text={item.name} query={deferredSearchQuery} />
                            </span>
                            {lowStock && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight flex items-center gap-1">⚠️ Low Stock</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest">{item.category || 'Pantry'}</span></td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lowStock ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{item.quantity || 'N/A'}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${isExpired ? 'text-red-600 font-black' : isExpiring ? 'text-orange-600 font-bold' : 'text-slate-500'}`}>
                          {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '—'}
                          {isExpired && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1 rounded uppercase tracking-tighter">Expired</span>}
                          {isExpiring && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1 rounded uppercase tracking-tighter">Soon</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 font-bold text-sm transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Toast Notification for Alerts */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white border-l-4 border-orange-500 shadow-2xl rounded-r-xl p-4 flex items-start gap-4 max-w-sm">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-bold text-slate-800">Inventory Alert</h4>
              <p className="text-sm text-slate-600 mt-1">
                Attention needed for <span className="font-bold text-orange-600">{totalAlerts} items</span> in your pantry.
              </p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-slate-600 px-1">✕</button>
          </div>
        </div>
      )}

      <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6">
        <div className="text-5xl">⚡</div>
        <div>
          <h4 className="text-xl font-bold mb-1 text-emerald-100">Smart Kitchen Automation</h4>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
             Select staples like "Flour" or "Milk" to auto-fill details. Expiration dates are now tracked, with visual alerts 3 days before spoilage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantryInventory;

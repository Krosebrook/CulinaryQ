
import React, { useState, useRef, useEffect } from 'react';
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

const PantryInventory: React.FC<PantryInventoryProps> = ({ pantry, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    onAdd({ name, quantity: qty, expirationDate: expiry });
    setName('');
    setQty('');
    setExpiry('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Pantry Inventory</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end relative">
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
              placeholder="e.g. Olive Oil, Flour"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
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
              placeholder="e.g. 500ml"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
          >
            Add to Pantry
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ingredient</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stored Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pantry.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🧺</div>
                    <p className="italic font-medium">Your pantry is currently empty.</p>
                    <p className="text-xs mt-1">Add items above to track your staples.</p>
                  </td>
                </tr>
              ) : (
                pantry.map((item) => (
                  <tr key={item.id} className="group hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.quantity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-slate-300 hover:text-red-500 font-bold text-sm transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="text-lg">✕</span> Remove
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
        <div className="text-5xl">💡</div>
        <div>
          <h4 className="text-xl font-bold mb-1 text-emerald-100">Pro Tip</h4>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
            The Recipe Intelligence engine scans both your fridge and this pantry inventory to ensure you have everything needed for your skill level.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantryInventory;

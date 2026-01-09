
import React from 'react';
import { AppState } from '../types';

interface SidebarProps {
  currentTab: AppState;
  setTab: (tab: AppState) => void;
  dietaryFilters: string[];
  toggleDietary: (filter: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, dietaryFilters, toggleDietary }) => {
  const navItems: { label: string; icon: string; value: AppState }[] = [
    { label: 'Fridge Hub', icon: '❄️', value: 'HOME' },
    { label: 'Pantry', icon: '🧺', value: 'PANTRY' },
    { label: 'Recipes', icon: '🍳', value: 'RECIPE_LIST' },
    { label: 'Shopping', icon: '🛒', value: 'SHOPPING_LIST' },
    { label: 'Magic Studio', icon: '🪄', value: 'IMAGE_EDITOR' },
    { label: 'Profile', icon: '👤', value: 'PROFILE' },
    { label: 'Technical Docs', icon: '📚', value: 'DOCS' },
  ];

  const diets = ['Vegetarian', 'Keto', 'Vegan', 'Gluten-Free', 'Paleo'];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
          <span>🧞</span> CulinaryGenie
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">AI Kitchen Suite v2.0</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            aria-current={currentTab === item.value ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentTab === item.value 
                ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl" role="img" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-6 py-6 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Dietary</h3>
        <div className="space-y-3">
          {diets.map((diet) => (
            <label key={diet} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={dietaryFilters.includes(diet)}
                onChange={() => toggleDietary(diet)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className={`text-sm ${dietaryFilters.includes(diet) ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                {diet}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

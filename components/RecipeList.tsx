
import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelect }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Extract unique dietary tags from the recipes provided
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach((recipe) => {
      if (recipe.dietaryTags) {
        recipe.dietaryTags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [recipes]);

  // Filter recipes based on the selected tag
  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'All') return recipes;
    return recipes.filter((recipe) => recipe.dietaryTags?.includes(activeFilter));
  }, [recipes, activeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filter Bar */}
      {uniqueTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 py-2">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              activeFilter === 'All'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            All Recipes
          </button>
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                activeFilter === tag
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid Layout */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => {
            const missingCount = recipe.ingredients.filter(i => i.isMissing).length;
            return (
            <div
              key={recipe.id}
              onClick={() => onSelect(recipe)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group hover:shadow-2xl transition-all hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                <img
                  src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/600/400`}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
                    recipe.difficulty === 'Medium' ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {recipe.difficulty}
                  </span>
                  {recipe.dietaryTags?.slice(0, 1).map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                {missingCount > 0 && (
                  <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                    Requires Shopping
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {recipe.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between text-slate-600 text-xs font-bold border-t border-slate-50 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span> {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span> {recipe.calories} kcal
                  </div>
                  <div className={`flex items-center gap-2 ${missingCount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    <span className="text-lg">{missingCount > 0 ? '🛒' : '🍱'}</span> {missingCount > 0 ? `${missingCount} missing` : 'Ready to Cook'}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-800 font-bold text-lg">No recipes found for "{activeFilter}"</p>
          <p className="text-slate-400 mt-1">Try selecting a different filter or adding more ingredients.</p>
          <button 
            onClick={() => setActiveFilter('All')}
            className="mt-6 text-emerald-600 font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeList;

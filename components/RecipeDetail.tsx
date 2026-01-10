
import React from 'react';
import { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onStartCooking: () => void;
  onAddToShoppingList: (items: string[]) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ 
  recipe, 
  onBack, 
  onStartCooking, 
  onAddToShoppingList,
  isFavorite,
  onToggleFavorite
}) => {
  const missingIngredients = recipe.ingredients.filter(i => i.isMissing).map(i => i.name);

  return (
    <div className="bg-white min-h-full animate-in fade-in slide-in-from-bottom-4 rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      {/* Hero Section */}
      <div className="relative h-96 w-full group">
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/1200/600`} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end">
          <div className="p-8 md:p-12 text-white w-full relative">
            <button 
              onClick={onBack}
              className="absolute -top-64 left-0 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2"
            >
              ← Back
            </button>
            
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.dietaryTags.map(tag => (
                    <span key={tag} className="bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-none">{recipe.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold opacity-90">
                  <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <span className="text-xl">⏱️</span> {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <span className="text-xl">🔥</span> {recipe.calories} kcal
                  </span>
                  <span className={`px-4 py-1.5 rounded-lg uppercase tracking-widest text-xs shadow-lg ${
                    recipe.difficulty === 'Easy' ? 'bg-emerald-500 text-white' : 
                    recipe.difficulty === 'Medium' ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onToggleFavorite(recipe)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all hover:scale-110 active:scale-95 ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/40'
                }`}
                title={isFavorite ? "Remove from Cookbook" : "Save to Cookbook"}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Col: Description & Ingredients */}
        <div className="md:col-span-1 space-y-8">
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About this dish</h3>
             <p className="text-slate-600 leading-relaxed text-lg">{recipe.description}</p>
          </section>
          
          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>🥕</span> Ingredients
            </h3>
            <ul className="space-y-4 mb-8">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm group">
                   <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${ing.isMissing ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                     {ing.isMissing ? '✕' : '✓'}
                   </div>
                   <span className={`border-b border-transparent group-hover:border-slate-200 pb-1 transition-colors ${ing.isMissing ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>
                     {ing.amount} {ing.name}
                     {ing.isMissing && <span className="text-red-500 text-xs ml-2 font-bold uppercase tracking-wide">(Missing)</span>}
                   </span>
                </li>
              ))}
            </ul>
            {missingIngredients.length > 0 ? (
              <button 
                onClick={() => onAddToShoppingList(missingIngredients)}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>🛒</span> Add {missingIngredients.length} Missing Items
              </button>
            ) : (
              <div className="text-center py-4 bg-emerald-100/50 rounded-2xl text-emerald-700 font-bold text-sm">
                🎉 You have everything!
              </div>
            )}
          </section>
        </div>

        {/* Right Col: Steps Preview */}
        <div className="md:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
             <div>
               <h3 className="text-3xl font-bold text-slate-800">Instructions</h3>
               <p className="text-slate-500 mt-1">{recipe.steps.length} steps to perfection</p>
             </div>
             <button
               onClick={onStartCooking}
               className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3 hover:-translate-y-1"
             >
               <span className="text-xl">👨‍🍳</span> 
               <span>Start Cooking Mode</span>
             </button>
           </div>
           
           <div className="space-y-8">
             {recipe.steps.map((step, idx) => (
               <div key={idx} className="flex gap-6 group">
                 <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300">
                   {idx + 1}
                 </div>
                 <div className="pt-2">
                   <p className="text-slate-600 leading-relaxed text-lg group-hover:text-slate-900 transition-colors">
                     {step}
                   </p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;

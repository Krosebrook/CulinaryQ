
import React from 'react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          onClick={() => onSelect(recipe)}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
            <img
              src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/600/400`}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                recipe.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{recipe.title}</h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
            <div className="flex items-center justify-between text-slate-600 text-xs font-medium border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5">
                <span>⏱️</span> {recipe.prepTime}
              </div>
              <div className="flex items-center gap-1.5">
                <span>🔥</span> {recipe.calories} kcal
              </div>
              <div className="flex items-center gap-1.5">
                <span>🥕</span> {recipe.ingredients.length} items
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;

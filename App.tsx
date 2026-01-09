
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FridgeScanner from './components/FridgeScanner';
import RecipeList from './components/RecipeList';
import StepByStep from './components/StepByStep';
import ShoppingList from './components/ShoppingList';
import MagicEditor from './components/MagicEditor';
import LiveAssistant from './components/LiveAssistant';
import PantryInventory from './components/PantryInventory';
import ProfileSettings from './components/ProfileSettings';
import TechDocs from './components/TechDocs';
import { AppState, Recipe, ShoppingItem, UserProfile, PantryItem } from './types';
import { suggestRecipes } from './services/geminiService';

/**
 * @component App
 * @description Main application controller for CulinaryGenie.
 * Manages global application state including user preferences, 
 * inventories, and multimodal AI interactions.
 */
const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppState>('HOME');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    dislikes: [],
    preferredCuisines: [],
    skillLevel: 'Intermediate'
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Toggles active dietary restrictions.
   */
  const toggleDietary = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  /**
   * Orchestrates the vision-to-recipe pipeline.
   * Triggered upon successful fridge scan.
   */
  const handleScanComplete = async (ingredients: string[]) => {
    setScannedIngredients(ingredients);
    setIsLoading(true);
    setCurrentTab('RECIPE_LIST');
    try {
      const suggested = await suggestRecipes(ingredients, pantry, profile, dietaryFilters);
      setRecipes(suggested);
    } catch (e) {
      console.error("Recipe suggestion failure:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addToShoppingList = (items: string[]) => {
    setShoppingList(prev => {
      const newItems = items
        .filter(name => !prev.some(item => item.name === name))
        .map(name => ({ name, checked: false }));
      return [...prev, ...newItems];
    });
  };

  const toggleShoppingItem = (name: string) => {
    setShoppingList(prev => prev.map(item => item.name === name ? { ...item, checked: !item.checked } : item));
  };

  const removeShoppingItem = (name: string) => {
    setShoppingList(prev => prev.filter(item => item.name !== name));
  };

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    setPantry(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removePantryItem = (id: string) => {
    setPantry(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        dietaryFilters={dietaryFilters} 
        toggleDietary={toggleDietary} 
      />
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto" role="main">
        {currentTab === 'HOME' && (
          <div className="max-w-2xl mx-auto py-12">
            <FridgeScanner onScanComplete={handleScanComplete} />
            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-3xl mb-2">🥕</div>
                <h4 className="font-bold text-slate-800">Fresh Insights</h4>
                <p className="text-xs text-slate-500 mt-1">Our AI detects shelf life and freshness levels using computer vision.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-bold text-slate-800">Inventory Sync</h4>
                <p className="text-xs text-slate-500 mt-1">Fridge scans merge with your manual pantry list for unified intelligence.</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'PANTRY' && (
          <PantryInventory pantry={pantry} onAdd={addPantryItem} onRemove={removePantryItem} />
        )}

        {currentTab === 'PROFILE' && (
          <ProfileSettings profile={profile} onUpdate={setProfile} />
        )}

        {currentTab === 'RECIPE_LIST' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Tailored Recipes</h2>
                <p className="text-slate-500">Based on Fridge, Pantry, and your {profile.skillLevel} level expertise.</p>
              </div>
              {isLoading && <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" aria-label="Loading suggestions"></div>}
            </div>
            
            {recipes.length > 0 ? (
              <RecipeList recipes={recipes} onSelect={(r) => setSelectedRecipe(r)} />
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400">No recipes found. Scan your fridge or check your pantry!</p>
                <button 
                  onClick={() => setCurrentTab('HOME')}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Start Scan
                </button>
              </div>
            )}
          </div>
        )}

        {currentTab === 'SHOPPING_LIST' && (
          <ShoppingList 
            items={shoppingList} 
            onToggle={toggleShoppingItem} 
            onClear={() => setShoppingList([])}
            onRemove={removeShoppingItem}
          />
        )}

        {currentTab === 'IMAGE_EDITOR' && (
          <MagicEditor />
        )}

        {currentTab === 'DOCS' && (
          <TechDocs />
        )}

        {selectedRecipe && (
          <StepByStep 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
            onAddToShoppingList={(items) => {
              addToShoppingList(items);
            }}
          />
        )}
      </main>

      <LiveAssistant />
    </div>
  );
};

export default App;

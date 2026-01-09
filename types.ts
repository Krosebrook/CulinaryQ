
export interface Ingredient {
  name: string;
  amount?: string;
  isMissing?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  calories: number;
  ingredients: Ingredient[];
  steps: string[];
  dietaryTags: string[];
  imageUrl: string;
}

export interface ShoppingItem {
  name: string;
  checked: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  category?: string;
  quantity: string;
  expirationDate: string;
  lowStockThreshold?: number;
}

export interface UserProfile {
  dislikes: string[];
  preferredCuisines: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert';
}

/**
 * Valid states for the main application navigation.
 */
export type AppState = 'HOME' | 'SCANNING' | 'RECIPE_LIST' | 'COOKING_MODE' | 'SHOPPING_LIST' | 'IMAGE_EDITOR' | 'PANTRY' | 'PROFILE' | 'DOCS';

export interface GroundingSource {
  title: string;
  uri: string;
}

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export async function searchRecipes(
  query: string = "diabetes friendly",
  options: {
    maxCarbs?: number;
    minProtein?: number;
    minFiber?: number;
    number?: number;
    offset?: number;
  } = {}
): Promise<SpoonacularSearchResponse> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY!,
    query,
    addRecipeNutrition: "true",
    number: String(options.number || 10),
    offset: String(options.offset || 0),
  });

  if (options.maxCarbs) {
    params.append("maxCarbs", String(options.maxCarbs));
  }
  if (options.minProtein) {
    params.append("minProtein", String(options.minProtein));
  }
  if (options.minFiber) {
    params.append("minFiber", String(options.minFiber));
  }

  const response = await fetch(
    `${BASE_URL}/recipes/complexSearch?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getRecipeDetails(id: number): Promise<SpoonacularRecipe> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY!,
    includeNutrition: "true",
  });

  const response = await fetch(
    `${BASE_URL}/recipes/${id}/information?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.statusText}`);
  }

  return response.json();
}

export function extractNutritionInfo(recipe: SpoonacularRecipe) {
  const nutrients = recipe.nutrition?.nutrients || [];
  
  const findNutrient = (name: string) => 
    nutrients.find(n => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;

  return {
    carbs: Math.round(findNutrient("Carbohydrates")),
    protein: Math.round(findNutrient("Protein")),
    fiber: Math.round(findNutrient("Fiber")),
    saturatedFat: Math.round(findNutrient("Saturated Fat")),
  };
}

export function isT2DOptimized(nutrition: ReturnType<typeof extractNutritionInfo>): boolean {
  return (
    nutrition.carbs < 46 &&
    nutrition.fiber >= 2 &&
    nutrition.protein >= 14 &&
    nutrition.saturatedFat < 11
  );
}

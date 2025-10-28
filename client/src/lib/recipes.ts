import { supabase } from '../lib/supabase';

export async function searchRecipes({
  q, includeCuisines, maxDifficulty, limit = 20, offset = 0
}: {
  q?: string;
  includeCuisines?: string[];        // e.g. ['mediterranean']
  maxDifficulty?: 'easy'|'medium'|'difficult';
  limit?: number; offset?: number;
}) {
  const { data, error } = await supabase.rpc('search_recipes_v2', {
    q: q ?? null,
    tag_name: null,
    include_ingredient: null,
    any_allergens: null,
    exclude_allergens: null,
    require_dietary: null,
    include_cuisines: includeCuisines ?? null,
    required_difficulty: null,
    max_difficulty: maxDifficulty ?? null,
    page_limit: limit,
    page_offset: offset
  });
  if (error) throw error;
  return data;
}

/**
 * Scrape a recipe from a URL and save it to the database
 */
export async function scrapeRecipeFromUrl(url: string, userId?: string) {
  const response = await fetch('/api/recipes/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scrape recipe');
  }

  return response.json();
}

import * as cheerio from 'cheerio';

interface ScrapedRecipe {
  title: string;
  image?: string;
  time?: number;
  servings?: number;
  ingredients: string[];
  instructions: string[];
  carbs?: number;
  protein?: number;
  fiber?: number;
  satFat?: number;
  calories?: number;
  sourceUrl: string;
}

interface SchemaRecipe {
  '@type': string | string[];
  name?: string;
  image?: string | string[] | { url: string }[];
  totalTime?: string;
  cookTime?: string;
  prepTime?: string;
  recipeYield?: string | number | string[];
  recipeIngredient?: string[];
  recipeInstructions?: string | any[];
  nutrition?: {
    calories?: string;
    carbohydrateContent?: string;
    proteinContent?: string;
    fiberContent?: string;
    saturatedFatContent?: string;
  };
}

/**
 * Extract time in minutes from ISO 8601 duration format (e.g., "PT30M", "PT1H30M")
 */
function parseISODuration(duration: string | undefined): number | undefined {
  if (!duration) return undefined;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  return hours * 60 + minutes;
}

/**
 * Extract number from nutrition string (e.g., "30g" -> 30, "150 calories" -> 150)
 */
function parseNutritionValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : undefined;
}

/**
 * Extract servings from various formats
 */
function parseServings(yieldValue: string | number | string[] | undefined): number | undefined {
  if (!yieldValue) return undefined;

  if (typeof yieldValue === 'number') return yieldValue;

  const yieldStr = Array.isArray(yieldValue) ? yieldValue[0] : yieldValue;
  const match = yieldStr.match(/\d+/);
  return match ? parseInt(match[0]) : undefined;
}

/**
 * Extract image URL from various formats
 */
function extractImageUrl(image: string | string[] | { url: string }[] | undefined): string | undefined {
  if (!image) return undefined;

  if (typeof image === 'string') return image;
  if (Array.isArray(image)) {
    const first = image[0];
    return typeof first === 'string' ? first : first?.url;
  }

  return undefined;
}

/**
 * Parse recipe instructions from various formats
 */
function parseInstructions(instructions: string | any[] | undefined): string[] {
  if (!instructions) return [];

  if (typeof instructions === 'string') {
    return [instructions];
  }

  if (Array.isArray(instructions)) {
    return instructions.map(item => {
      if (typeof item === 'string') return item;
      if (item['@type'] === 'HowToStep' || item['@type'] === 'HowToSection') {
        return item.text || item.name || '';
      }
      return '';
    }).filter(Boolean);
  }

  return [];
}

/**
 * Scrape recipe data from a URL
 */
export async function scrapeRecipe(url: string): Promise<ScrapedRecipe> {
  try {
    // Fetch the HTML
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for schema.org Recipe structured data (JSON-LD)
    let recipeData: SchemaRecipe | null = null;

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $(element).html();
        if (!jsonContent) return;

        const data = JSON.parse(jsonContent);

        // Handle both single objects and arrays
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // Check if this is a Recipe or if it contains a Recipe
          if (item['@type'] === 'Recipe' ||
              (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            recipeData = item;
            return false; // break the loop
          }

          // Some sites nest Recipe in @graph
          if (item['@graph']) {
            const recipe = item['@graph'].find((g: any) =>
              g['@type'] === 'Recipe' ||
              (Array.isArray(g['@type']) && g['@type'].includes('Recipe'))
            );
            if (recipe) {
              recipeData = recipe;
              return false;
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    if (!recipeData) {
      throw new Error('No recipe data found. This URL may not contain a valid recipe or uses a format we don\'t support yet.');
    }

    // Type assertion since we've checked for null
    const recipe: SchemaRecipe = recipeData;

    // Extract data with fallbacks
    const title = recipe.name || $('h1').first().text().trim() || 'Untitled Recipe';
    const image = extractImageUrl(recipe.image);

    // Calculate total time
    const totalTime = parseISODuration(recipe.totalTime) ||
                     (parseISODuration(recipe.prepTime) || 0) +
                     (parseISODuration(recipe.cookTime) || 0) ||
                     30; // Default to 30 minutes

    const servings = parseServings(recipe.recipeYield) || 4;

    const ingredients = recipe.recipeIngredient || [];
    const instructions = parseInstructions(recipe.recipeInstructions);

    // Extract nutrition if available
    const nutrition = recipe.nutrition || {};
    const carbs = parseNutritionValue(nutrition.carbohydrateContent);
    const protein = parseNutritionValue(nutrition.proteinContent);
    const fiber = parseNutritionValue(nutrition.fiberContent);
    const satFat = parseNutritionValue(nutrition.saturatedFatContent);
    const calories = parseNutritionValue(nutrition.calories);

    return {
      title,
      image,
      time: totalTime,
      servings,
      ingredients,
      instructions,
      carbs,
      protein,
      fiber,
      satFat,
      calories,
      sourceUrl: url,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape recipe: ${error.message}`);
    }
    throw new Error('Failed to scrape recipe: Unknown error');
  }
}

/**
 * Check if the scraped recipe meets T2D optimization criteria
 */
export function isScrapedRecipeT2DOptimized(recipe: ScrapedRecipe): boolean {
  // Only evaluate if we have nutrition data
  if (!recipe.carbs || !recipe.protein || !recipe.fiber) {
    return false;
  }

  return (
    recipe.carbs < 46 &&
    recipe.fiber >= 2 &&
    recipe.protein >= 14 &&
    (!recipe.satFat || recipe.satFat < 11)
  );
}

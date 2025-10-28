# Recipe Scraping - Usage Guide

## Overview

Your GlyPal app now supports scraping recipes from any URL that uses schema.org structured data (most modern recipe websites). The scraped recipes are automatically saved to your PostgreSQL database and can be modified later.

## What Was Added

### Backend Files
- **`server/recipe-scraper.ts`** - Core scraping utility that extracts recipe data from URLs
- **`server/routes.ts`** - New endpoint: `POST /api/recipes/scrape`

### Frontend Files
- **`client/src/lib/recipes.ts`** - New function: `scrapeRecipeFromUrl()`

### Dependencies
- **cheerio** - HTML parsing library

## How It Works

1. **User provides a recipe URL** (e.g., from AllRecipes, Food Network, etc.)
2. **Backend scrapes the page** looking for schema.org Recipe structured data (JSON-LD)
3. **Extracts recipe information**:
   - Title, image, cooking time, servings
   - Ingredients and instructions
   - Nutrition info (carbs, protein, fiber, saturated fat)
4. **Evaluates T2D optimization** based on your criteria:
   - Carbs < 46g
   - Fiber ≥ 2g
   - Protein ≥ 14g
   - Saturated Fat < 11g
5. **Saves to database** using your existing recipe schema
6. **Returns the saved recipe** ready for display or modification

## Usage Examples

### Frontend - React Component

```typescript
import { scrapeRecipeFromUrl } from '@/lib/recipes';
import { useState } from 'react';

function RecipeImporter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await scrapeRecipeFromUrl(url, currentUserId);

      console.log('Recipe saved!', result.recipe);
      // Navigate to recipe detail page or show success message

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="url"
        placeholder="Paste recipe URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleScrape} disabled={loading}>
        {loading ? 'Scraping...' : 'Import Recipe'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Backend - Direct API Call

```bash
curl -X POST http://localhost:5000/api/recipes/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.allrecipes.com/recipe/12345/some-recipe",
    "userId": "user-uuid-here"
  }'
```

### Response Format

```json
{
  "recipe": {
    "id": "recipe-uuid",
    "title": "Healthy Chicken Salad",
    "image": "https://example.com/image.jpg",
    "time": 30,
    "servings": 4,
    "carbs": "25.5",
    "protein": "35.2",
    "fiber": "8.0",
    "satFat": "4.5",
    "isT2DOptimized": true,
    "ingredients": [
      "2 cups cooked chicken breast, diced",
      "1/4 cup Greek yogurt",
      "..."
    ],
    "instructions": [
      "Combine chicken and yogurt in a bowl",
      "Mix thoroughly",
      "..."
    ]
  },
  "scrapedData": {
    "title": "Healthy Chicken Salad",
    "sourceUrl": "https://example.com/recipe",
    "calories": 320,
    "..."
  }
}
```

## Supported Websites

The scraper works with **any website that uses schema.org Recipe structured data**, including:
- AllRecipes
- Food Network
- BBC Good Food
- Serious Eats
- Bon Appétit
- NYT Cooking
- Many food blogs

## Modifying Scraped Recipes

Once scraped, recipes can be modified using your existing update endpoint:

```typescript
// Update recipe after scraping
await fetch(`/api/recipes/${recipeId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carbs: '30.0',  // Adjust nutrition
    servings: 6,     // Change servings
    difficulty: 'Medium',  // Update difficulty
    // ... any other fields
  })
});
```

## Error Handling

The scraper will throw errors if:
- The URL is invalid or unreachable
- The page doesn't contain recipe structured data
- Required fields are missing

Always wrap scraping calls in try-catch blocks and provide user feedback.

## Testing

Try scraping from these example URLs:
- https://www.allrecipes.com/recipe/229156/keto-pizza/
- https://www.foodnetwork.com/recipes/
- Your favorite recipe blog

## Integration with Spoonacular

You already have Spoonacular API integration. Now you can:
1. **Spoonacular** - For searching and discovering recipes
2. **URL Scraper** - For importing recipes from any website
3. **Both** - Save to your database and allow user modifications

Both approaches save recipes to the same database table with the same schema.

## Next Steps

Consider adding:
- **UI component** for recipe URL input in your app
- **Recipe preview** before saving
- **Batch import** for multiple URLs
- **Browser extension** to scrape from current tab
- **Nutrition calculation** for recipes without nutrition data

## Need Help?

If scraping fails for a specific website, it might:
- Not use schema.org structured data
- Use a non-standard format
- Require authentication

You can extend `server/recipe-scraper.ts` to handle additional formats.

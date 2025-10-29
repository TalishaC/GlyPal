import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import {
  insertBGReadingSchema,
  insertPrescriptionSchema,
  insertPrescriptionLogSchema,
  insertRecipeSchema,
  insertMealPlanSchema,
  insertShoppingListSchema,
} from "@shared/schema";
import { searchRecipes, getRecipeDetails, extractNutritionInfo, isT2DOptimized } from "./spoonacular";
import { mifflinStJeor, tdee, adjustByGoal, convertToMetric, type ActivityLevel } from "./nutrition-calc";
import { scrapeRecipe, isScrapedRecipeT2DOptimized } from "./recipe-scraper";
import { z } from "zod";

// Utility for error responses
function handleError(res: Response, error: unknown, defaultMessage: string) {
  console.error(error);
  const message = error instanceof Error ? error.message : defaultMessage;
  res.status(500).json({ error: message });
}

export function registerRoutes(app: Express) {
  // ==================== BG READINGS ROUTES ====================
  
  // Get BG readings for a user
  app.get("/api/bg-readings", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const readings = await storage.getBGReadings(userId, limit);
      res.json(readings);
    } catch (error) {
      handleError(res, error, "Failed to fetch BG readings");
    }
  });

  // Create a new BG reading
  app.post("/api/bg-readings", async (req: Request, res: Response) => {
    try {
      const validated = insertBGReadingSchema.parse(req.body);
      const reading = await storage.createBGReading(validated);
      res.status(201).json(reading);
    } catch (error) {
      handleError(res, error, "Failed to create BG reading");
    }
  });

  // Get BG stats for a user
  app.get("/api/bg-readings/stats", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const stats = await storage.getBGStats(userId, days);
      res.json(stats);
    } catch (error) {
      handleError(res, error, "Failed to fetch BG stats");
    }
  });
  // ==================== ANALYTICS ROUTES ====================

  // Get comprehensive BG trends and analytics
  app.get("/api/analytics/bg-trends", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const days = parseInt(req.query.days as string) || 30;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const trends = await storage.getBGTrends(userId, days);
      res.json(trends);
    } catch (error) {
      handleError(res, error, "Failed to fetch BG trends");
    }
  });

  // Get enhanced dashboard data with analytics
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const days = parseInt(req.query.days as string) || 7;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Fetch all dashboard data in parallel
      const [bgStats, adherence, recentReadings, todayMeals, trends] = await Promise.all([
        storage.getBGStats(userId, days),
        storage.getPrescriptionAdherence(userId, days),
        storage.getBGReadings(userId, 10),
        storage.getMealPlans(
          userId,
          new Date(new Date().setHours(0, 0, 0, 0)),
          new Date(new Date().setHours(23, 59, 59, 999))
        ),
        storage.getBGTrends(userId, days),
      ]);

      res.json({
        bgStats,
        adherence,
        recentReadings,
        todayMeals,
        trends,
      });
    } catch (error) {
      handleError(res, error, "Failed to fetch dashboard data");
    }
  });

  // Get settings
  app.get("/api/me/settings", async (req: Request, res: Response) => {
    try {
      const userId = req.header("x-user-id") || req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const settings = await storage.getSettings(userId);
      res.json(settings || {});
    } catch (error) {
      handleError(res, error, "Failed to fetch settings");
    }
  });

  // Update settings
  app.patch("/api/me/settings", async (req: Request, res: Response) => {
    try {
      const userId = req.header("x-user-id") || req.body.userId;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const settings = await storage.updateSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      handleError(res, error, "Failed to update settings");
    }
  });
  
  // ==================== PRESCRIPTIONS ROUTES ====================
  
  // Get prescriptions for a user
  app.get("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const prescriptions = await storage.getPrescriptions(userId);
      res.json(prescriptions);
    } catch (error) {
      handleError(res, error, "Failed to fetch prescriptions");
    }
  });

  // Create a new prescription
  app.post("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const validated = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(validated);
      res.status(201).json(prescription);
    } catch (error) {
      handleError(res, error, "Failed to create prescription");
    }
  });

  // Update a prescription
  app.patch("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prescription = await storage.updatePrescription(id, req.body);
      
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      
      res.json(prescription);
    } catch (error) {
      handleError(res, error, "Failed to update prescription");
    }
  });

  // Delete a prescription
  app.delete("/api/prescriptions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deletePrescription(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Failed to delete prescription");
    }
  });

  // Mark prescription as taken
  app.post("/api/prescriptions/:id/taken", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const log = await storage.markPrescriptionTaken(id);
      res.status(201).json(log);
    } catch (error) {
      handleError(res, error, "Failed to mark prescription as taken");
    }
  });

  // Get prescription adherence
  app.get("/api/prescriptions/adherence", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const adherence = await storage.getPrescriptionAdherence(userId, days);
      res.json(adherence);
    } catch (error) {
      handleError(res, error, "Failed to fetch prescription adherence");
    }
  });

  // ==================== RECIPES ROUTES ====================
  
  // Get all recipes
  app.get("/api/recipes", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const recipes = await storage.getRecipes(userId);
      res.json(recipes);
    } catch (error) {
      handleError(res, error, "Failed to fetch recipes");
    }
  });

  // Hybrid search: Database + Spoonacular with auto-caching
  // MUST come before /:id route to avoid matching "search" as an ID
  app.get("/api/recipes/search", async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || "";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get all recipes from database (filtered by title if query provided)
      const dbRecipes = await storage.getRecipes();
      const filteredDbRecipes = query
        ? dbRecipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
        : dbRecipes;
      
      // Calculate how many more we need from Spoonacular
      const remainingCount = Math.max(0, limit - filteredDbRecipes.length);
      
      // Format database recipes to match response format
      const formattedDbRecipes = filteredDbRecipes.slice(0, limit).map(r => ({
        id: r.id,
        spoonacularId: r.spoonacularId,
        title: r.title,
        image: r.image,
        readyInMinutes: r.time,
        servings: r.servings,
        carbs: parseFloat(String(r.carbs)),
        protein: parseFloat(String(r.protein)),
        fiber: parseFloat(String(r.fiber)),
        saturatedFat: r.satFat ? parseFloat(String(r.satFat)) : 0,
        isT2DOptimized: r.isT2DOptimized,
        source: 'database' as const,
      }));
      
      // If we have enough from database, return early
      if (remainingCount <= 0) {
        return res.json(formattedDbRecipes);
      }
      
      // Fetch additional recipes from Spoonacular
      const spoonResults = await searchRecipes(query || "healthy", {
        number: remainingCount,
      });
      
      // Process and cache Spoonacular recipes
      const spoonRecipes = await Promise.all(
        spoonResults.results.map(async (recipe) => {
          const nutrition = extractNutritionInfo(recipe);
          
          // Check if already cached
          const existingRecipe = await storage.getRecipeBySpoonacularId(recipe.id);
          
          if (!existingRecipe) {
            // Auto-cache this recipe asynchronously (don't block response)
            storage.createRecipe({
              spoonacularId: recipe.id,
              title: recipe.title,
              image: recipe.image || "https://via.placeholder.com/400x300?text=Recipe",
              time: recipe.readyInMinutes || 30,
              servings: recipe.servings || 2,
              carbs: String(nutrition.carbs),
              protein: String(nutrition.protein),
              fiber: String(nutrition.fiber),
              satFat: String(nutrition.saturatedFat),
              difficulty: "Easy",
              isT2DOptimized: isT2DOptimized(nutrition),
              ingredients: [],
              instructions: [],
            }).catch(err => console.error("Failed to cache recipe:", err));
          }
          
          return {
            id: existingRecipe?.id || String(recipe.id),
            spoonacularId: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 2,
            carbs: nutrition.carbs,
            protein: nutrition.protein,
            fiber: nutrition.fiber,
            saturatedFat: nutrition.saturatedFat,
            isT2DOptimized: isT2DOptimized(nutrition),
            source: 'spoonacular' as const,
          };
        })
      );
      
      // Merge and sort (T2D optimized first, then database recipes)
      const allRecipes = [...formattedDbRecipes, ...spoonRecipes]
        .sort((a, b) => {
          if (a.isT2DOptimized && !b.isT2DOptimized) return -1;
          if (!a.isT2DOptimized && b.isT2DOptimized) return 1;
          if (a.source === 'database' && b.source === 'spoonacular') return -1;
          if (a.source === 'spoonacular' && b.source === 'database') return 1;
          return 0;
        });
      
      res.json(allRecipes);
    } catch (error) {
      handleError(res, error, "Failed to search recipes");
    }
  });

  // Get a single recipe
  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let recipe = await storage.getRecipe(id);

      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      // If it's a Spoonacular recipe without ingredients/instructions, fetch full details
      const needsFullDetails = recipe.spoonacularId &&
        (!recipe.ingredients || (Array.isArray(recipe.ingredients) && recipe.ingredients.length === 0));

      if (needsFullDetails && recipe.spoonacularId) {
        console.log(`Fetching full details for Spoonacular recipe ${recipe.spoonacularId}`);
        try {
          const { extractIngredients, extractInstructions } = await import("./spoonacular");
          const fullRecipe = await getRecipeDetails(recipe.spoonacularId!);

          // Update the recipe with full details
          const updatedRecipe = await storage.updateRecipe(id, {
            ingredients: extractIngredients(fullRecipe),
            instructions: extractInstructions(fullRecipe),
          });

          recipe = updatedRecipe || recipe;
        } catch (error) {
          console.error("Failed to fetch full Spoonacular details:", error);
          // Continue with existing recipe data
        }
      }

      res.json(recipe);
    } catch (error) {
      handleError(res, error, "Failed to fetch recipe");
    }
  });

  // Create a new recipe
  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      console.log('[POST /api/recipes] Received body:', JSON.stringify(req.body, null, 2));
      const validated = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validated);
      res.status(201).json(recipe);
    } catch (error) {
      console.error('[POST /api/recipes] Validation error:', error);
      handleError(res, error, "Failed to create recipe");
    }
  });

  // Scrape recipe from URL
  app.post("/api/recipes/scrape", async (req: Request, res: Response) => {
    try {
      const { url, userId } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Scrape the recipe
      const scrapedRecipe = await scrapeRecipe(url);

      // Create recipe in database
      const recipeData = {
        userId: userId || null,
        title: scrapedRecipe.title,
        image: scrapedRecipe.image || "https://via.placeholder.com/400x300?text=Recipe",
        time: scrapedRecipe.time || 30,
        servings: scrapedRecipe.servings || 4,
        carbs: String(scrapedRecipe.carbs || 0),
        protein: String(scrapedRecipe.protein || 0),
        fiber: String(scrapedRecipe.fiber || 0),
        satFat: String(scrapedRecipe.satFat || 0),
        difficulty: "Easy",
        isT2DOptimized: isScrapedRecipeT2DOptimized(scrapedRecipe),
        ingredients: scrapedRecipe.ingredients,
        instructions: scrapedRecipe.instructions,
      };

      const recipe = await storage.createRecipe(recipeData);

      res.status(201).json({
        recipe,
        scrapedData: scrapedRecipe,
      });
    } catch (error) {
      handleError(res, error, "Failed to scrape recipe");
    }
  });

  // Update a recipe
  app.patch("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const recipe = await storage.updateRecipe(id, req.body);
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      handleError(res, error, "Failed to update recipe");
    }
  });

  // Delete a recipe
  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteRecipe(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Failed to delete recipe");
    }
  });

  // Search recipes from Spoonacular API
  app.get("/api/recipes/search/spoonacular", async (req: Request, res: Response) => {
    try {
      const query = (req.query.query as string) || "healthy";
      const number = req.query.number ? parseInt(req.query.number as string) : 20;

      // Fetch recipes without strict filters to get more results
      const results = await searchRecipes(query, {
        number,
      });

      // Format and evaluate recipes on our end
      const formattedRecipes = results.results
        .map((recipe) => {
          const nutrition = extractNutritionInfo(recipe);
          return {
            id: String(recipe.id),
            spoonacularId: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 2,
            carbs: nutrition.carbs,
            protein: nutrition.protein,
            fiber: nutrition.fiber,
            saturatedFat: nutrition.saturatedFat,
            isT2DOptimized: isT2DOptimized(nutrition),
          };
        })
        // Sort T2D optimized recipes first
        .sort((a, b) => {
          if (a.isT2DOptimized && !b.isT2DOptimized) return -1;
          if (!a.isT2DOptimized && b.isT2DOptimized) return 1;
          return 0;
        });

      res.json(formattedRecipes);
    } catch (error) {
      handleError(res, error, "Failed to search recipes from Spoonacular");
    }
  });

  // Get recipe details from Spoonacular
  app.get("/api/recipes/spoonacular/:id", async (req: Request, res: Response) => {
    try {
      const spoonacularId = parseInt(req.params.id);
      const recipe = await getRecipeDetails(spoonacularId);
      const nutrition = extractNutritionInfo(recipe);

      const formattedRecipe = {
        id: String(recipe.id),
        spoonacularId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        carbs: nutrition.carbs,
        protein: nutrition.protein,
        fiber: nutrition.fiber,
        saturatedFat: nutrition.saturatedFat,
        isT2DOptimized: isT2DOptimized(nutrition),
      };

      res.json(formattedRecipe);
    } catch (error) {
      handleError(res, error, "Failed to fetch recipe from Spoonacular");
    }
  });

  // ==================== MEAL PLANS ROUTES ====================
  
  // Get meal plans for a date range
  app.get("/api/meal-plans", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const mealPlans = await storage.getMealPlans(userId, startDate, endDate);
      res.json(mealPlans);
    } catch (error) {
      handleError(res, error, "Failed to fetch meal plans");
    }
  });

  // Create a new meal plan
  app.post("/api/meal-plans", async (req: Request, res: Response) => {
    try {
      const validated = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(validated);
      res.status(201).json(mealPlan);
    } catch (error) {
      handleError(res, error, "Failed to create meal plan");
    }
  });

  // Delete a meal plan
  app.delete("/api/meal-plans/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteMealPlan(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Failed to delete meal plan");
    }
  });

  // ==================== SHOPPING LIST ROUTES ====================
  
  // Get shopping list for a week
  app.get("/api/shopping-list", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const weekStart = new Date(req.query.weekStart as string);
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const items = await storage.getShoppingList(userId, weekStart);
      res.json(items);
    } catch (error) {
      handleError(res, error, "Failed to fetch shopping list");
    }
  });

  // Create a shopping list item
  app.post("/api/shopping-list", async (req: Request, res: Response) => {
    try {
      const validated = insertShoppingListSchema.parse(req.body);
      const item = await storage.createShoppingItem(validated);
      res.status(201).json(item);
    } catch (error) {
      handleError(res, error, "Failed to create shopping item");
    }
  });

  // Update a shopping list item (toggle checked)
  app.patch("/api/shopping-list/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isChecked } = req.body;
      const item = await storage.updateShoppingItem(id, isChecked);
      
      if (!item) {
        return res.status(404).json({ error: "Shopping item not found" });
      }
      
      res.json(item);
    } catch (error) {
      handleError(res, error, "Failed to update shopping item");
    }
  });

  // Delete a shopping list item
  app.delete("/api/shopping-list/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteShoppingItem(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Failed to delete shopping item");
    }
  });

  // Generate shopping list from meal plan
  app.post("/api/shopping-list/generate", async (req: Request, res: Response) => {
    try {
      const { userId, weekStart } = req.body;
      
      if (!userId || !weekStart) {
        return res.status(400).json({ error: "userId and weekStart are required" });
      }

      await storage.generateShoppingList(userId, new Date(weekStart));
      res.status(201).json({ message: "Shopping list generated successfully" });
    } catch (error) {
      handleError(res, error, "Failed to generate shopping list");
    }
  });

  // ==================== USER ROUTES ====================
  
  // Get user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error, "Failed to fetch user");
    }
  });

  // Update user profile
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Don't allow password updates through this endpoint
      const { password, ...safeData } = updateData;
      
      const user = await storage.updateUser(id, safeData);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error, "Failed to update user");
    }
  });

  // Signup
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Check if username already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Create user (in production, hash the password!)
      const user = await storage.createUser({
        username,
        password, // TODO: Hash password in production
        onboardingCompleted: false, // Ensure user goes through onboarding
      });

      // Don't send password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleError(res, error, "Failed to create user");
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // TODO: Compare hashed passwords in production
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Don't send password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error, "Failed to login");
    }
  });

  // ==================== ONBOARDING ENDPOINT ====================

  // Zod schema for onboarding payload (matching ChatGPT spec)
  const OnboardingSchema = z.object({
    locale: z.string().default("en-US"),
    birth_year: z.number().int().gte(1900).lte(2100),
    units: z.enum(["imperial", "metric"]).default("imperial"),
    sex_at_birth: z.enum(["Female", "Male", "Prefer not to say"]).default("Prefer not to say"),
    height: z.object({
      ft: z.number().optional(),
      in: z.number().optional(),
      cm: z.number().optional(),
    }),
    weight_lb: z.number().optional(),
    weight_kg: z.number().optional(),
    activity_level: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]),
    goal: z.enum(["maintain", "lose", "gain"]).default("maintain"),
    goal_intensity_pct: z.number().optional(),
    dietary_pattern: z.string().default("No preference"),
    allergies: z.array(z.string()).default([]),
    intolerances: z.array(z.string()).default([]),
    cross_contam: z.object({
      may_contain: z.boolean().default(false),
      shared_equipment: z.boolean().default(false),
      shared_facility: z.boolean().default(false),
    }).default({ may_contain: false, shared_equipment: false, shared_facility: false }),
    cuisines: z.array(z.string()).default([]),
    time_per_meal: z.string().default("≤30 min"),
    cooking_skill: z.string().default("Beginner"),
    budget_tier: z.enum(["Budget", "Moderate", "Foodie"]).default("Moderate"),
    carb_exchange_g: z.number().default(15),
    bg_thresholds: z.object({
      low: z.number().default(70),
      high: z.number().default(180),
      urgent: z.number().default(250),
    }).default({ low: 70, high: 180, urgent: 250 }),
  });

  // POST /api/me/onboarding
  app.post("/api/me/onboarding", async (req: Request, res: Response) => {
    try {
      // Get user ID from request header or body
      const userId = req.header("x-user-id") || req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const input = OnboardingSchema.parse(req.body);

      // Calculate age
      const nowYear = new Date().getUTCFullYear();
      const age = nowYear - input.birth_year;

      // Convert units to metric
      const { kg, cm } = convertToMetric({
        units: input.units,
        heightFt: input.height.ft,
        heightIn: input.height.in,
        heightCm: input.height.cm,
        weightLb: input.weight_lb,
        weightKg: input.weight_kg,
      });

      // Calculate BMR and TDEE
      const bmr = mifflinStJeor({
        sexAtBirth: input.sex_at_birth,
        kg,
        cm,
        age,
      });

      const tdeeKcal = tdee(bmr, input.activity_level);

      // Determine goal intensity percentage
      const pct = input.goal === "maintain"
        ? 0
        : (input.goal_intensity_pct ?? (input.goal === "lose" ? 0.15 : 0.10));

      // Calculate calorie target
      let calorieTargetKcal = adjustByGoal(tdeeKcal, input.goal, pct);
      calorieTargetKcal = Math.max(1200, calorieTargetKcal); // Floor at 1200

      // Default macro split and guardrails
      const macroSplit = { carb_pct: 0.35, protein_pct: 0.30, fat_pct: 0.35 };
      const guardrails = {
        carb_max_g: 46,
        fiber_min_g: 2,
        protein_min_g: 14,
        satfat_max_g: 11,
      };

      const isSenior = age >= 65;

      // Update users table
      await storage.updateUser(userId, {
        locale: input.locale,
        birthYear: input.birth_year,
        units: input.units,
        budgetTier: input.budget_tier,
        isSeniorDefault: isSenior,
        onboardingCompleted: true,
      });

      // Upsert settings
      await storage.upsertSettings(userId, {
        carbExchangeG: input.carb_exchange_g,
        bgLow: input.bg_thresholds.low,
        bgHigh: input.bg_thresholds.high,
        bgUrgent: input.bg_thresholds.urgent,
        macroSplitJson: macroSplit,
        calorieTargetKcal,
        guardrailsJson: guardrails,
        goalIntensityPct: input.goal === "maintain" ? null : pct,
      });

      // Upsert user preferences
      await storage.upsertUserPreferences(userId, {
        sexAtBirth: input.sex_at_birth,
        heightFt: input.height.ft,
        heightIn: input.height.in,
        heightCm: cm,
        weightLb: input.weight_lb,
        weightKg: kg,
        activityLevel: input.activity_level,
        goal: input.goal,
        dietaryPattern: input.dietary_pattern,
        timePerMeal: input.time_per_meal,
        cookingSkill: input.cooking_skill,
      });

      // Replace multi-value rows (allergies, intolerances, cuisines)
      await storage.replaceUserAllergies(userId, input.allergies);
      await storage.replaceUserIntolerances(userId, input.intolerances);
      await storage.replaceUserCuisines(userId, input.cuisines);

      // Upsert cross-contamination preferences
      await storage.upsertUserCrossContam(userId, {
        mayContain: input.cross_contam.may_contain,
        sharedEquipment: input.cross_contam.shared_equipment,
        sharedFacility: input.cross_contam.shared_facility,
      });

      return res.status(200).json({
        user: {
          id: userId,
          locale: input.locale,
          is_senior_default: isSenior,
        },
        settings: {
          calorie_target_kcal: calorieTargetKcal,
          macro_split_json: macroSplit,
        },
        guardrails,
      });
    } catch (error: any) {
      console.error("Onboarding error:", error);
      return res.status(400).json({
        error: {
          code: "ONBOARDING_ERROR",
          message: String(error.message || error),
        },
      });
    }
  });

  // GET /api/me - Fetch complete user profile
  app.get("/api/me", async (req: Request, res: Response) => {
    try {
      const userId = req.header("x-user-id") || req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile.user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = profile.user;

      res.json({
        user: userWithoutPassword,
        settings: profile.settings,
        preferences: profile.preferences,
        allergies: profile.allergies,
        intolerances: profile.intolerances,
        cuisines: profile.cuisines,
        cross_contam: profile.crossContam,
      });
    } catch (error) {
      handleError(res, error, "Failed to fetch user profile");
    }
  });
}

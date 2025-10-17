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

  // Get a single recipe
  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      handleError(res, error, "Failed to fetch recipe");
    }
  });

  // Create a new recipe
  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      const validated = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validated);
      res.status(201).json(recipe);
    } catch (error) {
      handleError(res, error, "Failed to create recipe");
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
}

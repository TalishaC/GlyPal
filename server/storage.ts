import { db } from "./db";
import { 
  type User, type InsertUser,
  type Settings, type InsertSettings,
  type UserPreferences, type InsertUserPreferences,
  type UserAllergy, type InsertUserAllergy,
  type UserIntolerance, type InsertUserIntolerance,
  type UserCuisine, type InsertUserCuisine,
  type UserCrossContam, type InsertUserCrossContam,
  type BGReading, type InsertBGReading,
  type Prescription, type InsertPrescription,
  type PrescriptionLog, type InsertPrescriptionLog,
  type Recipe, type InsertRecipe,
  type MealPlan, type InsertMealPlan,
  type ShoppingList, type InsertShoppingList,
  users, settings, userPreferences, userAllergies, userIntolerances,
  userCuisines, userCrossContam, bgReadings, prescriptions, prescriptionLogs,
  recipes, mealPlans, shoppingLists
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Settings methods
  upsertSettings(userId: string, data: Partial<Omit<InsertSettings, "userId">>): Promise<Settings>;
  
  // User preferences methods
  upsertUserPreferences(userId: string, data: Partial<Omit<InsertUserPreferences, "userId">>): Promise<UserPreferences>;
  
  // Allergy/Intolerance/Cuisine methods
  replaceUserAllergies(userId: string, allergens: string[]): Promise<void>;
  replaceUserIntolerances(userId: string, intolerances: string[]): Promise<void>;
  replaceUserCuisines(userId: string, cuisines: string[]): Promise<void>;
  
  // Cross-contamination methods
  upsertUserCrossContam(userId: string, data: Omit<InsertUserCrossContam, "userId">): Promise<UserCrossContam>;
  
  // Get complete user profile
  getUserProfile(userId: string): Promise<{
    user: User | undefined;
    settings: Settings | undefined;
    preferences: UserPreferences | undefined;
    allergies: UserAllergy[];
    intolerances: UserIntolerance[];
    cuisines: UserCuisine[];
    crossContam: UserCrossContam | undefined;
  }>;
  
  // BG Reading methods
  getBGReadings(userId: string, limit?: number): Promise<BGReading[]>;
  createBGReading(reading: InsertBGReading): Promise<BGReading>;
  getBGStats(userId: string, days: number): Promise<{
    average: number;
    timeInRange: number;
    totalReadings: number;
  }>;
  
  // Prescription methods
  getPrescriptions(userId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, data: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: string): Promise<void>;
  markPrescriptionTaken(prescriptionId: string): Promise<PrescriptionLog>;
  getPrescriptionAdherence(userId: string, days: number): Promise<{
    taken: number;
    total: number;
    percentage: number;
  }>;
  
  // Recipe methods
  getRecipes(userId?: string): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, data: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<void>;
  
  // Meal Plan methods
  getMealPlans(userId: string, startDate: Date, endDate: Date): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  deleteMealPlan(id: string): Promise<void>;
  
  // Shopping List methods
  getShoppingList(userId: string, weekStart: Date): Promise<ShoppingList[]>;
  createShoppingItem(item: InsertShoppingList): Promise<ShoppingList>;
  updateShoppingItem(id: string, isChecked: boolean): Promise<ShoppingList | undefined>;
  deleteShoppingItem(id: string): Promise<void>;
  generateShoppingList(userId: string, weekStart: Date): Promise<void>;
}

export class DbStorage implements IStorage {
  // ==================== USER METHODS ====================
  
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  // ==================== SETTINGS METHODS ====================
  
  async upsertSettings(userId: string, data: Partial<Omit<InsertSettings, "userId">>): Promise<Settings> {
    const existing = await db.select().from(settings).where(eq(settings.userId, userId));
    
    if (existing.length > 0) {
      const result = await db.update(settings).set(data).where(eq(settings.userId, userId)).returning();
      return result[0];
    } else {
      const result = await db.insert(settings).values({ userId, ...data }).returning();
      return result[0];
    }
  }

  // ==================== USER PREFERENCES METHODS ====================
  
  async upsertUserPreferences(userId: string, data: Partial<Omit<InsertUserPreferences, "userId">>): Promise<UserPreferences> {
    const existing = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    
    if (existing.length > 0) {
      const result = await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId)).returning();
      return result[0];
    } else {
      const result = await db.insert(userPreferences).values({ userId, ...data }).returning();
      return result[0];
    }
  }

  // ==================== ALLERGY/INTOLERANCE/CUISINE METHODS ====================
  
  async replaceUserAllergies(userId: string, allergens: string[]): Promise<void> {
    await db.delete(userAllergies).where(eq(userAllergies.userId, userId));
    if (allergens.length > 0) {
      await db.insert(userAllergies).values(allergens.map(allergen => ({ userId, allergen })));
    }
  }

  async replaceUserIntolerances(userId: string, intolerances: string[]): Promise<void> {
    await db.delete(userIntolerances).where(eq(userIntolerances.userId, userId));
    if (intolerances.length > 0) {
      await db.insert(userIntolerances).values(intolerances.map(intolerance => ({ userId, intolerance })));
    }
  }

  async replaceUserCuisines(userId: string, cuisines: string[]): Promise<void> {
    await db.delete(userCuisines).where(eq(userCuisines.userId, userId));
    if (cuisines.length > 0) {
      await db.insert(userCuisines).values(cuisines.map(cuisine => ({ userId, cuisine })));
    }
  }

  // ==================== CROSS-CONTAMINATION METHODS ====================
  
  async upsertUserCrossContam(userId: string, data: Omit<InsertUserCrossContam, "userId">): Promise<UserCrossContam> {
    const existing = await db.select().from(userCrossContam).where(eq(userCrossContam.userId, userId));
    
    if (existing.length > 0) {
      const result = await db.update(userCrossContam).set(data).where(eq(userCrossContam.userId, userId)).returning();
      return result[0];
    } else {
      const result = await db.insert(userCrossContam).values({ userId, ...data }).returning();
      return result[0];
    }
  }

  // ==================== GET COMPLETE USER PROFILE ====================
  
  async getUserProfile(userId: string) {
    const [user, userSettings, preferences, allergies, intolerances, cuisines, crossContam] = await Promise.all([
      this.getUser(userId),
      db.select().from(settings).where(eq(settings.userId, userId)).then(r => r[0]),
      db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).then(r => r[0]),
      db.select().from(userAllergies).where(eq(userAllergies.userId, userId)),
      db.select().from(userIntolerances).where(eq(userIntolerances.userId, userId)),
      db.select().from(userCuisines).where(eq(userCuisines.userId, userId)),
      db.select().from(userCrossContam).where(eq(userCrossContam.userId, userId)).then(r => r[0]),
    ]);

    return {
      user,
      settings: userSettings,
      preferences,
      allergies,
      intolerances,
      cuisines,
      crossContam,
    };
  }

  // ==================== BG READING METHODS ====================
  
  async getBGReadings(userId: string, limit: number = 10): Promise<BGReading[]> {
    return await db
      .select()
      .from(bgReadings)
      .where(eq(bgReadings.userId, userId))
      .orderBy(desc(bgReadings.timestamp))
      .limit(limit);
  }

  async createBGReading(reading: InsertBGReading): Promise<BGReading> {
    const result = await db.insert(bgReadings).values(reading).returning();
    return result[0];
  }

  async getBGStats(userId: string, days: number): Promise<{
    average: number;
    timeInRange: number;
    totalReadings: number;
  }> {
    const userSettings = await db.select().from(settings).where(eq(settings.userId, userId)).then(r => r[0]);
    if (!userSettings) {
      return { average: 0, timeInRange: 0, totalReadings: 0 };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readings = await db
      .select()
      .from(bgReadings)
      .where(
        and(
          eq(bgReadings.userId, userId),
          gte(bgReadings.timestamp, startDate)
        )
      );

    if (readings.length === 0) {
      return { average: 0, timeInRange: 0, totalReadings: 0 };
    }

    const total = readings.reduce((sum, r) => sum + r.value, 0);
    const average = Math.round(total / readings.length);

    const bgLow = userSettings.bgLow ?? 70;
    const bgHigh = userSettings.bgHigh ?? 180;
    
    const inRangeCount = readings.filter(r => r.value >= bgLow && r.value <= bgHigh).length;
    const timeInRange = Math.round((inRangeCount / readings.length) * 100);

    return {
      average,
      timeInRange,
      totalReadings: readings.length,
    };
  }

  // ==================== PRESCRIPTION METHODS ====================
  
  async getPrescriptions(userId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.userId, userId));
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptions).values(prescription).returning();
    return result[0];
  }

  async updatePrescription(id: string, data: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const result = await db.update(prescriptions).set(data).where(eq(prescriptions.id, id)).returning();
    return result[0];
  }

  async deletePrescription(id: string): Promise<void> {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
  }

  async markPrescriptionTaken(prescriptionId: string): Promise<PrescriptionLog> {
    const result = await db.insert(prescriptionLogs).values({ prescriptionId }).returning();
    return result[0];
  }

  async getPrescriptionAdherence(userId: string, days: number): Promise<{
    taken: number;
    total: number;
    percentage: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId));

    if (userPrescriptions.length === 0) {
      return { taken: 0, total: 0, percentage: 100 };
    }

    const prescriptionIds = userPrescriptions.map(p => p.id);
    
    const logs = await db
      .select()
      .from(prescriptionLogs)
      .where(
        and(
          sql`${prescriptionLogs.prescriptionId} = ANY(${sql`ARRAY[${sql.join(prescriptionIds.map(id => sql`${id}`), sql`, `)}]`})`,
          gte(prescriptionLogs.takenAt, startDate)
        )
      );

    const total = userPrescriptions.length * days;
    const taken = logs.length;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, total, percentage };
  }

  // ==================== RECIPE METHODS ====================
  
  async getRecipes(userId?: string): Promise<Recipe[]> {
    if (userId) {
      return await db
        .select()
        .from(recipes)
        .where(eq(recipes.userId, userId));
    }
    return await db.select().from(recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(recipes).where(eq(recipes.id, id));
    return result[0];
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const result = await db.insert(recipes).values(recipe).returning();
    return result[0];
  }

  async updateRecipe(id: string, data: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const result = await db.update(recipes).set(data).where(eq(recipes.id, id)).returning();
    return result[0];
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  // ==================== MEAL PLAN METHODS ====================
  
  async getMealPlans(userId: string, startDate: Date, endDate: Date): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.userId, userId),
          gte(mealPlans.date, startDate),
          lte(mealPlans.date, endDate)
        )
      )
      .orderBy(mealPlans.date);
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const result = await db.insert(mealPlans).values(mealPlan).returning();
    return result[0];
  }

  async deleteMealPlan(id: string): Promise<void> {
    await db.delete(mealPlans).where(eq(mealPlans.id, id));
  }

  // ==================== SHOPPING LIST METHODS ====================
  
  async getShoppingList(userId: string, weekStart: Date): Promise<ShoppingList[]> {
    return await db
      .select()
      .from(shoppingLists)
      .where(
        and(
          eq(shoppingLists.userId, userId),
          eq(shoppingLists.weekStart, weekStart)
        )
      );
  }

  async createShoppingItem(item: InsertShoppingList): Promise<ShoppingList> {
    const result = await db.insert(shoppingLists).values(item).returning();
    return result[0];
  }

  async updateShoppingItem(id: string, isChecked: boolean): Promise<ShoppingList | undefined> {
    const result = await db.update(shoppingLists).set({ isChecked }).where(eq(shoppingLists.id, id)).returning();
    return result[0];
  }

  async deleteShoppingItem(id: string): Promise<void> {
    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
  }

  async generateShoppingList(userId: string, weekStart: Date): Promise<void> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const plans = await this.getMealPlans(userId, weekStart, weekEnd);
    
    await db.delete(shoppingLists).where(
      and(
        eq(shoppingLists.userId, userId),
        eq(shoppingLists.weekStart, weekStart)
      )
    );

    const items: InsertShoppingList[] = [];
    for (const plan of plans) {
      if (plan.recipeId) {
        const recipe = await this.getRecipe(plan.recipeId);
        if (recipe && recipe.ingredients) {
          const ingredients = recipe.ingredients as any[];
          for (const ing of ingredients) {
            items.push({
              userId,
              name: ing.name || ing,
              quantity: ing.amount || "1",
              category: ing.category || "Other",
              isChecked: false,
              weekStart,
            });
          }
        }
      }
    }

    if (items.length > 0) {
      await db.insert(shoppingLists).values(items);
    }
  }
}

export const storage = new DbStorage();

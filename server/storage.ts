import { db } from "./db";
import { 
  type User, type InsertUser,
  type BGReading, type InsertBGReading,
  type Prescription, type InsertPrescription,
  type PrescriptionLog, type InsertPrescriptionLog,
  type Recipe, type InsertRecipe,
  type MealPlan, type InsertMealPlan,
  type ShoppingList, type InsertShoppingList,
  users, bgReadings, prescriptions, prescriptionLogs,
  recipes, mealPlans, shoppingLists
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  // User methods
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

  // BG Reading methods
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
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

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

    const total = readings.reduce((sum: number, r: BGReading) => sum + r.value, 0);
    const average = Math.round(total / readings.length);
    
    const inRange = readings.filter(
      (r: BGReading) => r.value >= (user.bgLowThreshold || 70) && r.value <= (user.bgHighThreshold || 180)
    ).length;
    const timeInRange = Math.round((inRange / readings.length) * 100);

    return {
      average,
      timeInRange,
      totalReadings: readings.length,
    };
  }

  // Prescription methods
  async getPrescriptions(userId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(and(
        eq(prescriptions.userId, userId),
        eq(prescriptions.isActive, true)
      ));
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptions).values(prescription).returning();
    return result[0];
  }

  async updatePrescription(id: string, data: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const result = await db.update(prescriptions)
      .set(data)
      .where(eq(prescriptions.id, id))
      .returning();
    return result[0];
  }

  async deletePrescription(id: string): Promise<void> {
    await db.update(prescriptions)
      .set({ isActive: false })
      .where(eq(prescriptions.id, id));
  }

  async markPrescriptionTaken(prescriptionId: string): Promise<PrescriptionLog> {
    const result = await db.insert(prescriptionLogs)
      .values({ prescriptionId })
      .returning();
    return result[0];
  }

  async getPrescriptionAdherence(userId: string, days: number): Promise<{
    taken: number;
    total: number;
    percentage: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userPrescriptions = await this.getPrescriptions(userId);
    const total = userPrescriptions.length * days;

    const takenLogs = await db
      .select()
      .from(prescriptionLogs)
      .innerJoin(prescriptions, eq(prescriptionLogs.prescriptionId, prescriptions.id))
      .where(
        and(
          eq(prescriptions.userId, userId),
          gte(prescriptionLogs.takenAt, startDate)
        )
      );

    const taken = takenLogs.length;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, total, percentage };
  }

  // Recipe methods
  async getRecipes(userId?: string): Promise<Recipe[]> {
    if (userId) {
      return await db
        .select()
        .from(recipes)
        .where(
          sql`${recipes.userId} IS NULL OR ${recipes.userId} = ${userId}`
        );
    }
    return await db.select().from(recipes).where(sql`${recipes.userId} IS NULL`);
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
    const result = await db.update(recipes)
      .set(data)
      .where(eq(recipes.id, id))
      .returning();
    return result[0];
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  // Meal Plan methods
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

  // Shopping List methods
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
    const result = await db.update(shoppingLists)
      .set({ isChecked })
      .where(eq(shoppingLists.id, id))
      .returning();
    return result[0];
  }

  async deleteShoppingItem(id: string): Promise<void> {
    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
  }

  async generateShoppingList(userId: string, weekStart: Date): Promise<void> {
    // Delete existing shopping list for this week
    await db.delete(shoppingLists)
      .where(
        and(
          eq(shoppingLists.userId, userId),
          eq(shoppingLists.weekStart, weekStart)
        )
      );

    // Get meal plans for the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const plans = await db
      .select()
      .from(mealPlans)
      .innerJoin(recipes, eq(mealPlans.recipeId, recipes.id))
      .where(
        and(
          eq(mealPlans.userId, userId),
          gte(mealPlans.date, weekStart),
          lte(mealPlans.date, weekEnd)
        )
      );

    // Aggregate ingredients from recipes
    const ingredientMap = new Map<string, { quantity: string; category: string }>();

    for (const plan of plans) {
      const recipe = plan.recipes;
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        for (const ing of recipe.ingredients as any[]) {
          const key = ing.name.toLowerCase();
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, {
              quantity: ing.quantity,
              category: ing.category || "Other",
            });
          }
        }
      }
    }

    // Insert shopping items
    const items = Array.from(ingredientMap.entries()).map(([name, data]) => ({
      userId,
      name,
      quantity: data.quantity,
      category: data.category,
      isChecked: false,
      weekStart,
    }));

    if (items.length > 0) {
      await db.insert(shoppingLists).values(items);
    }
  }
}

export const storage = new DbStorage();

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  weightKg: decimal("weight_kg", { precision: 5, scale: 1 }),
  heightCm: decimal("height_cm", { precision: 5, scale: 1 }),
  activityLevel: text("activity_level"),
  goal: text("goal"),
  allergens: text("allergens").array(),
  carbsPercent: integer("carbs_percent").default(35),
  proteinPercent: integer("protein_percent").default(30),
  fatPercent: integer("fat_percent").default(35),
  bgLowThreshold: integer("bg_low_threshold").default(70),
  bgHighThreshold: integer("bg_high_threshold").default(180),
  bgUrgentThreshold: integer("bg_urgent_threshold").default(250),
  language: text("language").default("en"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

export const bgReadings = pgTable("bg_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  value: integer("value").notNull(),
  mealContext: text("meal_context"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  drug: text("drug").notNull(),
  dose: text("dose").notNull(),
  scheduleTime: text("schedule_time").notNull(),
  isActive: boolean("is_active").default(true),
});

export const prescriptionLogs = pgTable("prescription_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prescriptionId: varchar("prescription_id").notNull().references(() => prescriptions.id, { onDelete: "cascade" }),
  takenAt: timestamp("taken_at").notNull().defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  image: text("image").notNull(),
  time: integer("time").notNull(),
  servings: integer("servings").notNull(),
  carbs: decimal("carbs", { precision: 5, scale: 1 }).notNull(),
  protein: decimal("protein", { precision: 5, scale: 1 }).notNull(),
  fiber: decimal("fiber", { precision: 5, scale: 1 }).notNull(),
  satFat: decimal("sat_fat", { precision: 5, scale: 1 }),
  difficulty: text("difficulty").default("Easy"),
  isT2DOptimized: boolean("is_t2d_optimized").default(false),
  ingredients: jsonb("ingredients"),
  instructions: jsonb("instructions"),
});

export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  mealType: text("meal_type").notNull(),
  recipeId: varchar("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  category: text("category").notNull(),
  isChecked: boolean("is_checked").default(false),
  weekStart: timestamp("week_start").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertBGReadingSchema = createInsertSchema(bgReadings).omit({
  id: true,
  timestamp: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
});

export const insertPrescriptionLogSchema = createInsertSchema(prescriptionLogs).omit({
  id: true,
  takenAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BGReading = typeof bgReadings.$inferSelect;
export type InsertBGReading = z.infer<typeof insertBGReadingSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type PrescriptionLog = typeof prescriptionLogs.$inferSelect;
export type InsertPrescriptionLog = z.infer<typeof insertPrescriptionLogSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS TABLE ====================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  locale: text("locale").default("en-US"),
  birthYear: integer("birth_year"),
  units: text("units").default("imperial"), // imperial | metric
  budgetTier: text("budget_tier").default("Moderate"), // Budget | Moderate | Foodie
  isSeniorDefault: boolean("is_senior_default").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

// ==================== SETTINGS TABLE ====================
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  carbExchangeG: integer("carb_exchange_g").default(15),
  bgLow: integer("bg_low").default(70),
  bgHigh: integer("bg_high").default(180),
  bgUrgent: integer("bg_urgent").default(250),
  macroSplitJson: jsonb("macro_split_json").default({ carb_pct: 0.35, protein_pct: 0.30, fat_pct: 0.35 }),
  calorieTargetKcal: integer("calorie_target_kcal"),
  guardrailsJson: jsonb("guardrails_json").default({ carb_max_g: 46, fiber_min_g: 2, protein_min_g: 14, satfat_max_g: 11 }),
  goalIntensityPct: real("goal_intensity_pct"), // 0.10|0.15|0.20 for lose/gain
});

// ==================== USER PREFERENCES TABLE ====================
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  sexAtBirth: text("sex_at_birth"), // Female | Male | Prefer not to say
  heightFt: integer("height_ft"),
  heightIn: integer("height_in"),
  heightCm: real("height_cm"),
  weightLb: real("weight_lb"),
  weightKg: real("weight_kg"),
  activityLevel: text("activity_level"), // sedentary | lightly_active | moderately_active | very_active | extra_active
  goal: text("goal").default("maintain"), // maintain | lose | gain
  dietaryPattern: text("dietary_pattern").default("No preference"),
  timePerMeal: text("time_per_meal").default("≤30 min"),
  cookingSkill: text("cooking_skill").default("Beginner"),
});

// ==================== USER ALLERGIES TABLE ====================
export const userAllergies = pgTable("user_allergies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  allergen: text("allergen").notNull(),
});

// ==================== USER INTOLERANCES TABLE ====================
export const userIntolerances = pgTable("user_intolerances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  intolerance: text("intolerance").notNull(),
});

// ==================== USER CUISINES TABLE ====================
export const userCuisines = pgTable("user_cuisines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cuisine: text("cuisine").notNull(),
});

// ==================== USER CROSS CONTAMINATION TABLE ====================
export const userCrossContam = pgTable("user_cross_contam", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  mayContain: boolean("may_contain").default(false),
  sharedEquipment: boolean("shared_equipment").default(false),
  sharedFacility: boolean("shared_facility").default(false),
});

// ==================== BG READINGS TABLE ====================
export const bgReadings = pgTable("bg_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  value: integer("value").notNull(),
  mealContext: text("meal_context"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ==================== PRESCRIPTIONS TABLE ====================
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

// ==================== RECIPES TABLE ====================
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  spoonacularId: integer("spoonacular_id").unique(), // Track external source
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

// ==================== MEAL PLANS TABLE ====================
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  mealType: text("meal_type").notNull(),
  recipeId: varchar("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
});

// ==================== SHOPPING LISTS TABLE ====================
export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  category: text("category").notNull(),
  isChecked: boolean("is_checked").default(false),
  weekStart: timestamp("week_start").notNull(),
});

// ==================== INSERT SCHEMAS ====================
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export const insertUserAllergySchema = createInsertSchema(userAllergies).omit({
  id: true,
});

export const insertUserIntoleranceSchema = createInsertSchema(userIntolerances).omit({
  id: true,
});

export const insertUserCuisineSchema = createInsertSchema(userCuisines).omit({
  id: true,
});

export const insertUserCrossContamSchema = createInsertSchema(userCrossContam).omit({
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

// ==================== TYPES ====================
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type UserAllergy = typeof userAllergies.$inferSelect;
export type InsertUserAllergy = z.infer<typeof insertUserAllergySchema>;

export type UserIntolerance = typeof userIntolerances.$inferSelect;
export type InsertUserIntolerance = z.infer<typeof insertUserIntoleranceSchema>;

export type UserCuisine = typeof userCuisines.$inferSelect;
export type InsertUserCuisine = z.infer<typeof insertUserCuisineSchema>;

export type UserCrossContam = typeof userCrossContam.$inferSelect;
export type InsertUserCrossContam = z.infer<typeof insertUserCrossContamSchema>;

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

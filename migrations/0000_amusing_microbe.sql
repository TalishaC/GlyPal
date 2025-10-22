CREATE TABLE "bg_readings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"value" integer NOT NULL,
	"meal_context" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"meal_type" text NOT NULL,
	"recipe_id" varchar
);
--> statement-breakpoint
CREATE TABLE "prescription_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_id" varchar NOT NULL,
	"taken_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"drug" text NOT NULL,
	"dose" text NOT NULL,
	"schedule_time" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"spoonacular_id" integer,
	"title" text NOT NULL,
	"image" text NOT NULL,
	"time" integer NOT NULL,
	"servings" integer NOT NULL,
	"carbs" numeric(5, 1) NOT NULL,
	"protein" numeric(5, 1) NOT NULL,
	"fiber" numeric(5, 1) NOT NULL,
	"sat_fat" numeric(5, 1),
	"difficulty" text DEFAULT 'Easy',
	"is_t2d_optimized" boolean DEFAULT false,
	"ingredients" jsonb,
	"instructions" jsonb,
	CONSTRAINT "recipes_spoonacular_id_unique" UNIQUE("spoonacular_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"carb_exchange_g" integer DEFAULT 15,
	"bg_low" integer DEFAULT 70,
	"bg_high" integer DEFAULT 180,
	"bg_urgent" integer DEFAULT 250,
	"macro_split_json" jsonb DEFAULT '{"carb_pct":0.35,"protein_pct":0.3,"fat_pct":0.35}'::jsonb,
	"calorie_target_kcal" integer,
	"guardrails_json" jsonb DEFAULT '{"carb_max_g":46,"fiber_min_g":2,"protein_min_g":14,"satfat_max_g":11}'::jsonb,
	"goal_intensity_pct" real,
	CONSTRAINT "settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "shopping_lists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"quantity" text NOT NULL,
	"category" text NOT NULL,
	"is_checked" boolean DEFAULT false,
	"week_start" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_allergies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"allergen" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_cross_contam" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"may_contain" boolean DEFAULT false,
	"shared_equipment" boolean DEFAULT false,
	"shared_facility" boolean DEFAULT false,
	CONSTRAINT "user_cross_contam_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_cuisines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"cuisine" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_intolerances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"intolerance" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"sex_at_birth" text,
	"height_ft" integer,
	"height_in" integer,
	"height_cm" real,
	"weight_lb" real,
	"weight_kg" real,
	"activity_level" text,
	"goal" text DEFAULT 'maintain',
	"dietary_pattern" text DEFAULT 'No preference',
	"time_per_meal" text DEFAULT '≤30 min',
	"cooking_skill" text DEFAULT 'Beginner',
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"locale" text DEFAULT 'en-US',
	"birth_year" integer,
	"units" text DEFAULT 'imperial',
	"budget_tier" text DEFAULT 'Moderate',
	"is_senior_default" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "bg_readings" ADD CONSTRAINT "bg_readings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_logs" ADD CONSTRAINT "prescription_logs_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cross_contam" ADD CONSTRAINT "user_cross_contam_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cuisines" ADD CONSTRAINT "user_cuisines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_intolerances" ADD CONSTRAINT "user_intolerances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bg_readings_user_timestamp_idx" ON "bg_readings" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX "bg_readings_timestamp_idx" ON "bg_readings" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "meal_plans_user_date_idx" ON "meal_plans" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "meal_plans_recipe_id_idx" ON "meal_plans" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "prescription_logs_prescription_id_idx" ON "prescription_logs" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "prescription_logs_taken_at_idx" ON "prescription_logs" USING btree ("taken_at");--> statement-breakpoint
CREATE INDEX "prescriptions_user_id_idx" ON "prescriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prescriptions_user_active_idx" ON "prescriptions" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "recipes_user_id_idx" ON "recipes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipes_spoonacular_id_idx" ON "recipes" USING btree ("spoonacular_id");--> statement-breakpoint
CREATE INDEX "recipes_t2d_optimized_idx" ON "recipes" USING btree ("is_t2d_optimized");--> statement-breakpoint
CREATE INDEX "settings_user_id_idx" ON "settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shopping_lists_user_week_idx" ON "shopping_lists" USING btree ("user_id","week_start");--> statement-breakpoint
CREATE INDEX "shopping_lists_category_idx" ON "shopping_lists" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_allergies_user_id_idx" ON "user_allergies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_cross_contam_user_id_idx" ON "user_cross_contam" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_cuisines_user_id_idx" ON "user_cuisines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_intolerances_user_id_idx" ON "user_intolerances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");
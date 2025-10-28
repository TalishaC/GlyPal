# GlyPal - Diabetes & Pre-Diabetes Meal Planner

## Overview

GlyPal is a wellness application designed for adults with type 2 diabetes and pre-diabetes, with special consideration for seniors. The platform provides weekly meal planning, manual blood glucose (BG) logging, prescription reminders, recipe management, and shopping list generation. The application emphasizes trust through clarity, senior-first accessibility, and healthcare-optimized design principles adapted from Material Design 3.

**Key Features:**
- Weekly meal planning with T2D-optimized recipes
- Manual blood glucose tracking and visualization
- Prescription medication reminders (non-medical, educational only)
- Recipe discovery from multiple sources (CMS, Spoonacular, user uploads)
- Shopping list generation with Chicory integration
- Bilingual support (English/Spanish via i18n)
- Three-tier monetization: Basic (free), Premium ($10/mo), Pro ($20/mo)

## Recent Changes

**October 28, 2025 - Recipes Page Complete Rebuild with Full CRUD:**
- 🎨 **Completely rebuilt Recipes page** with full CRUD functionality:
  - ✅ Click-to-view recipe details dialog with nutrition breakdown, ingredients, and instructions
  - ✅ Multi-criteria filtering: max carbs, min protein, max time, T2D optimized only (with accurate badge count)
  - ✅ Add Recipe dialog with comprehensive form (title, time, servings, nutrition, ingredients, instructions)
  - ✅ T2D optimization toggle for marking diabetes-friendly recipes
  - ✅ Form state reset after successful submission
  - ✅ 5-second success toast for better UX and E2E test reliability
- 🔧 **Fixed PostgreSQL decimal field handling**: All nutrition values (carbs, protein, fiber, satFat) must be sent as strings to match PostgreSQL decimal type precision requirements
- 🐛 **Fixed TypeScript error in storage.ts**: Moved getBGTrends and related methods inside DbStorage class to resolve scoping issues
- ✅ **End-to-end tested**: Recipe creation, viewing, filtering, and search all working correctly with Replit PostgreSQL
- 📊 **Architectural clarification**: All recipes stored in Replit PostgreSQL (Supabase only used for external API integration, not primary storage)

**October 22, 2025 - Production Deployment Fix & Security Improvements:**
- 🔧 Fixed critical Wouter routing bug in production builds by replacing `<Switch>/<Route>` components with `useLocation` hook-based manual routing
- 🔒 Removed hardcoded Supabase credentials from codebase; now exclusively uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables
- 🗄️ **Switched from Supabase PostgreSQL to Replit's built-in PostgreSQL** for primary database (resolves connection timeout errors)
- ✅ Published site (glypal.replit.app) now renders correctly with Welcome, Signup, and Login pages functional
- 📝 Implemented useEffect-based navigation redirects to comply with React Hooks rules
- 🧪 End-to-end tested signup and login flows - both working successfully with Replit PostgreSQL

**October 17, 2025 - Comprehensive Onboarding & Nutrition Calculation System:**
- ✅ Refactored database schema into separate normalized tables (settings, user_preferences, user_allergies, user_intolerances, user_cuisines, user_cross_contam)
- ✅ Implemented BMR/TDEE calculation engine using Mifflin-St Jeor formula with activity level multipliers (1.2-1.9)
- ✅ Enhanced onboarding wizard to 7 comprehensive steps collecting: birth year, units (imperial/metric), locale, sex at birth, height/weight, activity level, weight goal, goal intensity, dietary pattern, allergies, intolerances, cross-contamination preferences, favorite cuisines, time per meal, cooking skill, budget tier, carb exchange, and BG thresholds
- ✅ Created POST /api/me/onboarding endpoint that calculates personalized calorie targets, macro splits, and guardrails based on user profile
- ✅ Implemented GET /api/me endpoint to fetch complete user profile with all settings and preferences
- ✅ Updated Dashboard to use calculated calorie targets and user-specific BG thresholds instead of hardcoded values
- ✅ Added senior defaults logic (age ≥65 automatically sets is_senior_default flag for future UI enhancements)
- ✅ End-to-end tested complete signup → onboarding → dashboard flow with calculated nutrition targets

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, utilizing Vite as the build tool and development server.

**UI Component System:** Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design system implements a healthcare-optimized variant of Material Design 3, prioritizing clarity, accessibility, and trust. Custom color tokens support both light and dark modes with semantic colors for BG status indicators (in-range, high, low, urgent).

**Routing:** Wouter for lightweight client-side routing with dedicated pages for Dashboard, Meal Planner, Recipes, BG Logging, Prescriptions, and Shopping. Uses `useLocation` hook-based manual routing (instead of `<Switch>/<Route>` components) for production build compatibility.

**State Management:** TanStack React Query (v5) for server state management with custom query client configuration. Local UI state handled through React hooks and Context API for theme and language preferences.

**Internationalization:** Custom i18n implementation via LanguageContext supporting English and Spanish with ICU message catalogs for content parity.

**Design Tokens:** CSS custom properties define a comprehensive design system including color palettes for light/dark modes, semantic health indicators, elevation states (hover-elevate, active-elevate-2), and typography using Inter font family.

### Backend Architecture

**Server Framework:** Express.js with TypeScript running on Node.js, configured for both development (with Vite middleware) and production builds via esbuild.

**API Structure:** RESTful API design with all routes prefixed with `/api`. Key endpoints include:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/me/onboarding` - Comprehensive onboarding with BMR/TDEE calculation and personalized nutrition targets
- `GET /api/me` - Fetch complete user profile with settings, preferences, allergies, intolerances, cuisines, and cross-contamination preferences
- `GET/POST /api/bg-readings` - Blood glucose reading CRUD operations
- `GET /api/bg-readings/stats` - BG statistics (average, time-in-range, total readings)
- `GET/POST/PATCH/DELETE /api/prescriptions` - Prescription management
- `POST /api/prescriptions/:id/log` - Mark prescription as taken
- `GET /api/recipes` - Recipe discovery with Spoonacular integration
- `GET /api/recipes/search` - Search recipes with T2D optimization filtering
- `GET/POST/DELETE /api/meal-plans` - Weekly meal planning
- `GET/POST/PATCH/DELETE /api/shopping-lists` - Shopping list management

**Storage Layer:** Database storage (DbStorage) implemented using Replit's built-in PostgreSQL via Drizzle ORM. Handles all CRUD operations for users, BG readings, prescriptions, recipes, meal plans, and shopping lists. Supabase is used exclusively for recipe data via its client API (not for primary database storage).

**Development Features:** Custom logging middleware for API requests, runtime error overlay in development, and Replit-specific plugins for enhanced developer experience.

### Data Storage Solutions

**ORM:** Drizzle ORM configured for Replit PostgreSQL with schema definitions and migrations support. Connection configured via `postgres` driver using DATABASE_URL environment variable automatically provided by Replit.

**Database Schema:** Comprehensive multi-table schema with:
- **users:** Core user table with username, password, locale, birth year, units (imperial/metric), budget tier, senior default flag, and onboarding completion status
- **settings:** Per-user settings including BG thresholds (low/high/urgent), calorie target (calculated via Mifflin-St Jeor), macro split JSON, guardrails JSON, and goal intensity percentage
- **user_preferences:** Extended user profile with sex at birth, height/weight, activity level, goal, dietary pattern, time per meal, cooking skill
- **user_allergies:** Multi-row table for user allergens (hard exclusions)
- **user_intolerances:** Multi-row table for food intolerances
- **user_cuisines:** Multi-row table for preferred cuisines
- **user_cross_contam:** Cross-contamination tolerance flags (may_contain, shared_equipment, shared_facility)
- **bg_readings:** Blood glucose readings with timestamp and meal context
- **prescriptions:** Prescription medications with drug name, dose, frequency, and schedule
- **prescription_logs:** Adherence tracking for prescription taking
- **recipes:** Recipe database with Spoonacular integration support
- **meal_plans:** Weekly meal planning with recipe assignments
- **shopping_lists:** Auto-generated shopping lists from meal plans

**Session Management:** connect-pg-simple configured for PostgreSQL-backed session storage (to be implemented with active database).

### Authentication and Authorization

**Planned Implementation:** Authentication schema exists (users table with username/password) but authentication middleware and session handling are not yet fully implemented. The architecture supports session-based authentication with PostgreSQL session store.

### External Dependencies

**Nutrition APIs:**
- **Nutritionix:** Primary nutrition data provider for recipe analysis and ingredient nutrition computation (planned). Always takes precedence when conflicts occur with source data.
- **Spoonacular:** Active integration for recipe search and discovery. API key configured via SPOONACULAR_API_KEY secret. Provides diabetes-friendly recipes with full nutrition analysis. T2D optimization filtering applied (carbs <46g, fiber ≥2g, protein ≥14g, sat fat <11g per serving).

**Shopping Integration:**
- **Chicory:** Primary shopping cart integration for ingredient purchasing with budget-aware item selection (Budget: $2.50/meal, Moderate: $5/meal, Foodie: $10/meal).

**Third-party Recipe Sources:**
- URL scraping capability for user-provided recipe links (Premium+)
- User recipe uploads (Premium+)
- CMS-managed recipe database

**UI Component Libraries:**
- Radix UI primitives (@radix-ui/react-*) for accessible, unstyled components
- Embla Carousel for recipe browsing
- Lucide React for iconography
- React Hook Form with Zod resolvers for form validation

**Utilities:**
- date-fns for date manipulation
- class-variance-authority for component variant styling
- tailwind-merge and clsx for className composition

**Development Tools:**
- Vite plugins for Replit integration (cartographer, dev banner, runtime error modal)
- Drizzle Kit for database migrations
- TSX for TypeScript execution in development

### Design Constraints and Guardrails

**Nutrition Rules:** Per-user nutrition targets computed from user profile (gender, weight, height, age, activity level, goal) using Mifflin-St Jeor formula. Default recipe screeners enforce: Carbs <46g, Fiber >2g, Protein >14g, Sat fat <11g per serving. Violations trigger soft warnings with suggested swaps.

**Macro Targets:** Configurable macro distribution with default fallback of 35% carbs / 30% protein / 35% fat, stored per user.

**Allergen Management:** Hard exclusions for declared allergens with cross-contamination awareness (may_contain, shared_equipment, shared_facility flags). Strict mode available to hide cross-contamination risks.

**BG Thresholds:** User-specific thresholds with defaults: Low <70 mg/dL, High >180 mg/dL, Urgent >250 mg/dL. BG data used solely for visualization, reports, and educational nudges—never for prescriptive medical guidance.

**Prescription Reminders:** Reminder-only system via in-app notifications (PWA push when supported). Tracks drug, dose, schedule, and adherence metrics. Explicitly non-medical and non-prescriptive.
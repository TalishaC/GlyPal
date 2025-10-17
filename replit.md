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

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, utilizing Vite as the build tool and development server.

**UI Component System:** Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design system implements a healthcare-optimized variant of Material Design 3, prioritizing clarity, accessibility, and trust. Custom color tokens support both light and dark modes with semantic colors for BG status indicators (in-range, high, low, urgent).

**Routing:** Wouter for lightweight client-side routing with dedicated pages for Dashboard, Meal Planner, Recipes, BG Logging, Prescriptions, and Shopping.

**State Management:** TanStack React Query (v5) for server state management with custom query client configuration. Local UI state handled through React hooks and Context API for theme and language preferences.

**Internationalization:** Custom i18n implementation via LanguageContext supporting English and Spanish with ICU message catalogs for content parity.

**Design Tokens:** CSS custom properties define a comprehensive design system including color palettes for light/dark modes, semantic health indicators, elevation states (hover-elevate, active-elevate-2), and typography using Inter font family.

### Backend Architecture

**Server Framework:** Express.js with TypeScript running on Node.js, configured for both development (with Vite middleware) and production builds via esbuild.

**API Structure:** RESTful API design with all routes prefixed with `/api`. Currently implements a minimal storage interface pattern that can be extended for CRUD operations.

**Storage Layer:** Abstract storage interface (IStorage) currently implemented as in-memory storage (MemStorage) for user management. Designed to be swapped with persistent database implementations (PostgreSQL via Drizzle ORM is configured but not yet implemented).

**Development Features:** Custom logging middleware for API requests, runtime error overlay in development, and Replit-specific plugins for enhanced developer experience.

### Data Storage Solutions

**ORM:** Drizzle ORM configured for PostgreSQL with schema definitions and migrations support. Connection configured via Neon serverless driver.

**Database Schema:** Currently defines a users table with UUID primary keys, username, and password fields. Schema is extensible for additional entities (recipes, BG readings, prescriptions, meal plans, shopping lists).

**Session Management:** connect-pg-simple configured for PostgreSQL-backed session storage (to be implemented with active database).

### Authentication and Authorization

**Planned Implementation:** Authentication schema exists (users table with username/password) but authentication middleware and session handling are not yet fully implemented. The architecture supports session-based authentication with PostgreSQL session store.

### External Dependencies

**Nutrition APIs:**
- **Nutritionix:** Primary nutrition data provider for recipe analysis and ingredient nutrition computation. Always takes precedence when conflicts occur with source data.
- **Spoonacular:** Recipe import source with attribution requirements for imported content.

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
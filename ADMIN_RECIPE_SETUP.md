# Admin Recipe Management - Setup Guide

## ✨ What Was Built

You now have a complete dual-interface system for recipe management:

### 🔹 User Interface
- **Location:** Recipes page (`/recipes`)
- **Feature:** "Add Recipe" button opens a dialog to import recipes from URLs
- **Privacy:** All user-imported recipes are **private** (only visible to that user)
- **Access:** Available to all logged-in users

### 🔸 Admin Interface
- **Location:** Admin Recipes page (`/admin/recipes`)
- **Features:**
  - Import recipes from URLs as **public** recipes (visible to all users)
  - View all recipes (public and private) in separate tabs
  - See recipe statistics (public vs private count, T2D optimization rates)
  - Edit and delete any recipe
  - Identify private recipe owners
- **Access:** Only visible to users with `isAdmin: true`

## 🗂️ Files Created/Modified

### Backend
- ✅ `server/recipe-scraper.ts` - Recipe scraping utility
- ✅ `server/routes.ts` - Added `POST /api/recipes/scrape` endpoint
- ✅ `shared/schema.ts` - Added `isAdmin` field to users table

### Frontend
- ✅ `client/src/components/AddRecipeDialog.tsx` - User recipe import dialog
- ✅ `client/src/pages/AdminRecipes.tsx` - Admin recipe management page
- ✅ `client/src/pages/Recipes.tsx` - Updated with dialog integration
- ✅ `client/src/App.tsx` - Added `/admin/recipes` route
- ✅ `client/src/components/app-sidebar.tsx` - Added admin section (visible only to admins)
- ✅ `client/src/lib/recipes.ts` - Added `scrapeRecipeFromUrl()` function

## 🚀 Deployment Steps

### 1. Push Changes to GitHub
```bash
cd ~/Documents/GlyPal
git add .
git commit -m "Add user and admin recipe scraping interfaces

- Add user recipe import dialog (private recipes)
- Create admin recipe management page (public recipes)
- Add isAdmin field to user schema
- Install cheerio for HTML parsing
- Add admin navigation section"
git push origin main
```

### 2. Deploy to Replit
Your changes will automatically sync to Replit. Then:

1. **Run Database Migration:**
   ```bash
   npm run db:push
   ```
   This adds the `isAdmin` column to your users table.

2. **Make Yourself Admin:**

   Option A - Using Replit Database Shell:
   ```sql
   UPDATE users SET is_admin = true WHERE username = 'your-username';
   ```

   Option B - Update in code temporarily:
   After login, add this to your backend:
   ```typescript
   // In server/routes.ts, after login success:
   await storage.updateUser(user.id, { isAdmin: true });
   ```

3. **Restart the App:**
   In Replit, stop and restart your app to pick up changes.

### 3. Test the Features

**As a Regular User:**
1. Go to `/recipes`
2. Click "Add Recipe"
3. Paste a recipe URL (e.g., from AllRecipes)
4. Click "Import Recipe"
5. Recipe is saved privately to your account

**As an Admin:**
1. After making yourself admin, you'll see "Admin" section in sidebar
2. Click "Manage Recipes"
3. Import public recipes available to all users
4. View/edit/delete both public and private recipes
5. See statistics about recipe library

## 🔐 Recipe Privacy Model

| Recipe Type | userId Value | Visible To | Created By |
|-------------|--------------|------------|------------|
| Public | `null` | All users | Admin via `/admin/recipes` |
| Private | User's ID | That user only | User via `/recipes` |

## 📊 Database Schema Changes

```typescript
// users table - NEW FIELD
isAdmin: boolean("is_admin").default(false)

// recipes table - EXISTING FIELD (determines privacy)
userId: varchar("user_id").references(() => users.id)
// If userId is null = public recipe
// If userId is set = private recipe for that user
```

## 🧪 Testing Recipe Scraping

Try these recipe URLs:
- https://www.allrecipes.com/recipe/229156/keto-pizza/
- https://www.foodnetwork.com/recipes/
- https://www.bbcgoodfood.com/recipes/

The scraper works with any site that uses schema.org Recipe structured data.

## 🎯 Key Features

### User Recipe Import
- ✅ Private to user (userId is set)
- ✅ Can be edited/deleted by that user
- ✅ Automatically evaluates T2D optimization
- ✅ Extracts: title, image, time, servings, ingredients, instructions, nutrition

### Admin Recipe Management
- ✅ Public recipes (userId is null)
- ✅ View all recipes in system
- ✅ Edit/delete any recipe
- ✅ See ownership information
- ✅ Statistics dashboard
- ✅ Tabs for public vs private recipes

### Recipe Scraper Features
- ✅ Supports 100+ recipe websites
- ✅ Extracts nutrition data when available
- ✅ Automatic T2D optimization scoring
- ✅ Fallback defaults for missing data
- ✅ Error handling with user-friendly messages

## 🔧 Troubleshooting

### "Admin Access Required" Error
- Make sure you've run the database migration: `npm run db:push`
- Verify your user has `isAdmin: true` in the database
- Try logging out and back in

### Recipe Scraping Fails
- Check if the URL is a valid recipe page
- Ensure the site uses schema.org structured data
- Some sites may block automated scraping
- Check browser console for detailed error messages

### Recipes Not Appearing
- Check if you're looking in the right tab (public vs private)
- Refresh the page or refetch queries
- Verify the recipe was saved (check `/api/recipes`)

## 📝 Future Enhancements

Consider adding:
- Bulk recipe import
- Recipe categories/tags
- Recipe search by ingredients
- Nutrition calculator for recipes without nutrition data
- Recipe image upload for manual entries
- Recipe sharing between users
- Recipe approval workflow
- User recipe submission for admin review

## 🎨 UI Components Used

- Dialog (modal for importing)
- Card (statistics and layout)
- Tabs (public/private recipe views)
- Badge (T2D optimization indicator)
- Alert (success/error messages)
- Button, Input, Label (forms)
- Table (recipe listing)

All components follow your existing design system with Radix UI and Tailwind CSS.

## 🔗 API Endpoints

```typescript
// Scrape and save recipe
POST /api/recipes/scrape
Body: { url: string, userId?: string }
Response: { recipe: Recipe, scrapedData: ScrapedRecipe }

// Get all recipes (admin)
GET /api/recipes
Response: Recipe[]

// Get recipes with search (users)
GET /api/recipes/search?q=query&limit=20
Response: Recipe[]

// Update recipe
PATCH /api/recipes/:id
Body: Partial<Recipe>
Response: Recipe

// Delete recipe
DELETE /api/recipes/:id
Response: 204 No Content
```

## ✅ Checklist Before Going Live

- [ ] Push all changes to GitHub
- [ ] Pull changes in Replit
- [ ] Run database migration (`npm run db:push`)
- [ ] Make your user account an admin
- [ ] Test user recipe import
- [ ] Test admin recipe management
- [ ] Import a few public recipes
- [ ] Verify sidebar shows admin section for admins only
- [ ] Test on mobile (responsive design)

---

**Need Help?** Check the main `RECIPE_SCRAPING_GUIDE.md` for detailed API usage and examples.

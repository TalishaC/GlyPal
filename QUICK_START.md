# Recipe Management - Quick Start

## 🎯 What You Got

Two ways to add recipes to GlyPal:

### 👤 For Users: Private Recipe Import
1. Go to Recipes page (`/recipes`)
2. Click **"Add Recipe"** button
3. Paste any recipe URL
4. Recipe saves **privately** to your account
5. Edit/modify as needed

### 👑 For Admins: Public Recipe Management
1. See **"Admin"** section in sidebar (admins only)
2. Click **"Manage Recipes"**
3. Import recipes as **public** (all users can see)
4. View/edit/delete any recipe
5. See stats and ownership info

## 🚀 Quick Deploy to Replit

```bash
# 1. Commit and push changes
cd ~/Documents/GlyPal
git add .
git commit -m "Add recipe scraping with user/admin interfaces"
git push origin main

# 2. In Replit shell, run migration
npm run db:push

# 3. Make yourself admin (replace 'your-username')
# Option: Use Replit Database shell
UPDATE users SET is_admin = true WHERE username = 'your-username';

# 4. Restart app and test!
```

## 🧪 Test with These URLs

- https://www.allrecipes.com/recipe/229156/keto-pizza/
- https://www.foodnetwork.com/recipes/
- Any recipe blog with structured data

## 📚 Full Documentation

- `RECIPE_SCRAPING_GUIDE.md` - Technical details and API usage
- `ADMIN_RECIPE_SETUP.md` - Complete setup instructions

## ⚡ Key Differences

| Feature | User Import | Admin Import |
|---------|-------------|--------------|
| Location | /recipes | /admin/recipes |
| Privacy | Private | Public |
| Visible To | That user only | All users |
| Access | All users | Admins only |
| Button | "Add Recipe" | "Add Public Recipe" |

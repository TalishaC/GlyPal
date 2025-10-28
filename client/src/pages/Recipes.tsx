import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, X, Clock, Users, ChefHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Recipe {
  id: string;
  spoonacularId?: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  carbs: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  isT2DOptimized: boolean;
  source: 'database' | 'spoonacular';
  instructions?: string;
  ingredients?: string[] | any[];
  userId?: string;
}

export default function Recipes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewRecipeT2DOptimized, setIsNewRecipeT2DOptimized] = useState(false);
  
  // Filter states
  const [maxCarbs, setMaxCarbs] = useState<string>("");
  const [minProtein, setMinProtein] = useState<string>("");
  const [maxTime, setMaxTime] = useState<string>("");
  const [t2dOptimizedOnly, setT2dOptimizedOnly] = useState(false);

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes/search', searchQuery, maxCarbs, minProtein, maxTime, t2dOptimizedOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      params.set('limit', '50');
      
      const res = await fetch(`/api/recipes/search?${params}`);
      if (!res.ok) throw new Error("Failed to search recipes");
      const allRecipes: Recipe[] = await res.json();
      
      // Apply client-side filters
      return allRecipes.filter(recipe => {
        if (maxCarbs && recipe.carbs > parseInt(maxCarbs)) return false;
        if (minProtein && recipe.protein < parseInt(minProtein)) return false;
        if (maxTime && recipe.readyInMinutes > parseInt(maxTime)) return false;
        if (t2dOptimizedOnly && !recipe.isT2DOptimized) return false;
        return true;
      });
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;
    setSearchQuery(query.trim());
  };

  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const recipeData = {
      userId: user?.id,
      title: formData.get("title") as string,
      image: (formData.get("image") as string) || "https://via.placeholder.com/400x300?text=Recipe",
      readyInMinutes: parseInt(formData.get("readyInMinutes") as string) || 30,
      servings: parseInt(formData.get("servings") as string) || 4,
      carbs: parseInt(formData.get("carbs") as string) || 0,
      protein: parseInt(formData.get("protein") as string) || 0,
      fiber: parseInt(formData.get("fiber") as string) || 0,
      saturatedFat: parseInt(formData.get("saturatedFat") as string) || 0,
      instructions: formData.get("instructions") as string,
      ingredients: (formData.get("ingredients") as string)?.split('\n').filter(i => i.trim()),
      isT2DOptimized: isNewRecipeT2DOptimized,
    };

    try {
      await apiRequest('POST', '/api/recipes', recipeData);
      
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/search'] });
      setIsAddDialogOpen(false);
      setIsNewRecipeT2DOptimized(false);
      toast({
        title: "Recipe added!",
        description: "Your recipe has been saved successfully.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setMaxCarbs("");
    setMinProtein("");
    setMaxTime("");
    setT2dOptimizedOnly(false);
  };

  const activeFilterCount = [
    maxCarbs && true, 
    minProtein && true, 
    maxTime && true, 
    t2dOptimizedOnly
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-muted-foreground">Discover diabetes-friendly recipes tailored to your preferences</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-recipe">
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="query"
            placeholder="Search recipes..."
            className="pl-10"
            defaultValue={searchQuery}
            data-testid="input-search-recipes"
          />
        </div>
        <Button type="submit" variant="outline" data-testid="button-search">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          data-testid="button-filter"
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </form>

      {isFilterOpen && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4 border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="maxCarbs">Max Carbs (g)</Label>
              <Input
                id="maxCarbs"
                type="number"
                placeholder="e.g., 45"
                value={maxCarbs}
                onChange={(e) => setMaxCarbs(e.target.value)}
                data-testid="input-filter-maxcarbs"
              />
            </div>
            <div>
              <Label htmlFor="minProtein">Min Protein (g)</Label>
              <Input
                id="minProtein"
                type="number"
                placeholder="e.g., 15"
                value={minProtein}
                onChange={(e) => setMinProtein(e.target.value)}
                data-testid="input-filter-minprotein"
              />
            </div>
            <div>
              <Label htmlFor="maxTime">Max Time (min)</Label>
              <Input
                id="maxTime"
                type="number"
                placeholder="e.g., 30"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                data-testid="input-filter-maxtime"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant={t2dOptimizedOnly ? "default" : "outline"}
                className="w-full"
                onClick={() => setT2dOptimizedOnly(!t2dOptimizedOnly)}
                data-testid="button-filter-t2d"
              >
                T2D Optimized Only
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image}
              time={recipe.readyInMinutes}
              servings={recipe.servings}
              carbs={recipe.carbs}
              protein={recipe.protein}
              fiber={recipe.fiber}
              difficulty="Easy"
              isT2DOptimized={recipe.isT2DOptimized}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {/* Recipe Details Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-recipe-details">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.title}</DialogTitle>
                <DialogDescription>
                  {selectedRecipe.isT2DOptimized && (
                    <Badge variant="default" className="mt-2">T2D Optimized</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title} 
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRecipe.readyInMinutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRecipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{selectedRecipe.source}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Nutrition (per serving)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Carbs: <span className="font-medium">{selectedRecipe.carbs}g</span></div>
                  <div>Protein: <span className="font-medium">{selectedRecipe.protein}g</span></div>
                  <div>Fiber: <span className="font-medium">{selectedRecipe.fiber}g</span></div>
                  <div>Sat. Fat: <span className="font-medium">{selectedRecipe.saturatedFat}g</span></div>
                </div>
              </div>

              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedRecipe.ingredients.map((ing: any, idx: number) => (
                      <li key={idx}>{typeof ing === 'string' ? ing : ing.name || ing.original || JSON.stringify(ing)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecipe.instructions && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Instructions</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedRecipe.instructions}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Recipe Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) setIsNewRecipeT2DOptimized(false);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-add-recipe">
          <form onSubmit={handleAddRecipe}>
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
              <DialogDescription>
                Create a custom recipe with nutrition information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Recipe Name *</Label>
                <Input id="title" name="title" required data-testid="input-recipe-title" />
              </div>
              
              <div>
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input id="image" name="image" type="url" placeholder="https://example.com/image.jpg" data-testid="input-recipe-image" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="readyInMinutes">Ready in (minutes)</Label>
                  <Input id="readyInMinutes" name="readyInMinutes" type="number" defaultValue="30" data-testid="input-recipe-time" />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input id="servings" name="servings" type="number" defaultValue="4" data-testid="input-recipe-servings" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g per serving)</Label>
                  <Input id="carbs" name="carbs" type="number" step="0.1" defaultValue="0" data-testid="input-recipe-carbs" />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g per serving)</Label>
                  <Input id="protein" name="protein" type="number" step="0.1" defaultValue="0" data-testid="input-recipe-protein" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiber">Fiber (g per serving)</Label>
                  <Input id="fiber" name="fiber" type="number" step="0.1" defaultValue="0" data-testid="input-recipe-fiber" />
                </div>
                <div>
                  <Label htmlFor="saturatedFat">Saturated Fat (g per serving)</Label>
                  <Input id="saturatedFat" name="saturatedFat" type="number" step="0.1" defaultValue="0" data-testid="input-recipe-satfat" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="t2dOptimized" className="text-base font-medium">Mark as T2D Optimized</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recipe meets diabetes-friendly nutrition guidelines
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isNewRecipeT2DOptimized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsNewRecipeT2DOptimized(!isNewRecipeT2DOptimized)}
                  data-testid="button-t2d-toggle"
                >
                  {isNewRecipeT2DOptimized ? "Yes" : "No"}
                </Button>
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea 
                  id="ingredients" 
                  name="ingredients" 
                  placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup milk"
                  rows={5}
                  data-testid="textarea-recipe-ingredients"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea 
                  id="instructions" 
                  name="instructions" 
                  placeholder="Step-by-step instructions..."
                  rows={6}
                  data-testid="textarea-recipe-instructions"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel-recipe">
                Cancel
              </Button>
              <Button type="submit" data-testid="button-submit-recipe">
                Add Recipe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

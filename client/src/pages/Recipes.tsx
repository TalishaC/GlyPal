import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface SpoonacularRecipe {
  id: string;
  spoonacularId: number;
  title: string;
  image?: string;
  readyInMinutes: number;
  servings: number;
  carbs: number;
  protein: number;
  fiber: number;
  saturatedFat: number;
  isT2DOptimized: boolean;
}

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("healthy");

  const { data: recipes = [], isLoading } = useQuery<SpoonacularRecipe[]>({
    queryKey: ["/api/recipes/search/spoonacular", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ query: searchQuery });
      const res = await fetch(`/api/recipes/search/spoonacular?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json();
    },
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-muted-foreground">Discover diabetes-friendly recipes from Spoonacular</p>
        </div>
        <Button data-testid="button-add-recipe">
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
        <Button type="button" variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image || "https://via.placeholder.com/400x300?text=Recipe"}
              time={recipe.readyInMinutes}
              servings={recipe.servings}
              carbs={recipe.carbs}
              protein={recipe.protein}
              fiber={recipe.fiber}
              difficulty="Easy"
              isT2DOptimized={recipe.isT2DOptimized}
              onClick={() => console.log(`View recipe ${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

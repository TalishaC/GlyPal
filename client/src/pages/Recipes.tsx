import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { searchRecipes } from "@/lib/recipes";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  prep_time_minutes?: number;
  servings?: number;
  carbs_g?: number;
  protein_g?: number;
  fiber_g?: number;
  difficulty?: 'easy' | 'medium' | 'difficult';
}

const difficultyMap = {
  'easy': 'Easy' as const,
  'medium': 'Medium' as const,
  'difficult': 'Hard' as const,
};

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [maxDifficulty, setMaxDifficulty] = useState<'easy' | 'medium' | 'difficult' | undefined>();

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes', searchQuery, selectedCuisines, maxDifficulty],
    queryFn: () => searchRecipes({
      q: searchQuery || undefined,
      includeCuisines: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      maxDifficulty,
    }),
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
          <p className="text-muted-foreground">Discover diabetes-friendly recipes tailored to your preferences</p>
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
              image={recipe.image_url || "https://via.placeholder.com/400x300?text=Recipe"}
              time={recipe.prep_time_minutes || 30}
              servings={recipe.servings || 4}
              carbs={recipe.carbs_g || 0}
              protein={recipe.protein_g || 0}
              fiber={recipe.fiber_g || 0}
              difficulty={recipe.difficulty ? difficultyMap[recipe.difficulty] : 'Easy'}
              isT2DOptimized={(recipe.carbs_g || 0) < 46 && (recipe.fiber_g || 0) >= 2 && (recipe.protein_g || 0) >= 14}
              onClick={() => console.log(`View recipe ${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

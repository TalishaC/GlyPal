import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import chickenSaladImg from "@assets/generated_images/Grilled_chicken_salad_recipe_e2729edb.png";
import salmonImg from "@assets/generated_images/Salmon_with_roasted_vegetables_4bb228a8.png";
import buddhaImg from "@assets/generated_images/Vegetarian_Buddha_bowl_recipe_615f3db8.png";

export default function Recipes() {
  // Todo: remove mock data
  const mockRecipes = [
    {
      id: "1",
      title: "Grilled Chicken Salad with Quinoa and Avocado",
      image: chickenSaladImg,
      time: 25,
      servings: 4,
      carbs: 38,
      protein: 32,
      fiber: 6,
      difficulty: "Easy" as const,
      isT2DOptimized: true,
    },
    {
      id: "2",
      title: "Baked Salmon with Roasted Vegetables",
      image: salmonImg,
      time: 35,
      servings: 2,
      carbs: 28,
      protein: 35,
      fiber: 5,
      difficulty: "Medium" as const,
      isT2DOptimized: true,
    },
    {
      id: "3",
      title: "Vegetarian Buddha Bowl",
      image: buddhaImg,
      time: 20,
      servings: 2,
      carbs: 42,
      protein: 18,
      fiber: 8,
      difficulty: "Easy" as const,
      isT2DOptimized: true,
    },
    {
      id: "4",
      title: "Mediterranean Chickpea Bowl",
      image: buddhaImg,
      time: 30,
      servings: 3,
      carbs: 45,
      protein: 14,
      fiber: 9,
      difficulty: "Easy" as const,
      isT2DOptimized: true,
    },
    {
      id: "5",
      title: "Herb-Crusted Chicken Breast",
      image: chickenSaladImg,
      time: 40,
      servings: 4,
      carbs: 12,
      protein: 38,
      fiber: 3,
      difficulty: "Medium" as const,
      isT2DOptimized: true,
    },
    {
      id: "6",
      title: "Grilled Fish Tacos",
      image: salmonImg,
      time: 25,
      servings: 4,
      carbs: 35,
      protein: 28,
      fiber: 6,
      difficulty: "Easy" as const,
      isT2DOptimized: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-muted-foreground">Discover diabetes-friendly recipes</p>
        </div>
        <Button data-testid="button-add-recipe">
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
            data-testid="input-search-recipes"
          />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            {...recipe}
            onClick={() => console.log(`View recipe ${recipe.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

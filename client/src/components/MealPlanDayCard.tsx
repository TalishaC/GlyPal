import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  recipe?: {
    name: string;
    image: string;
    carbs: number;
    servings: number;
  };
}

interface MealPlanDayCardProps {
  day: string;
  date: string;
  meals: Meal[];
  onAddMeal?: (mealType: string) => void;
}

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealPlanDayCard({ day, date, meals, onAddMeal }: MealPlanDayCardProps) {
  return (
    <Card className="border-l-4 border-l-primary" data-testid={`card-mealplan-${day.toLowerCase()}`}>
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg" data-testid={`text-day-${day.toLowerCase()}`}>{day}</h3>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        
        <div className="space-y-3">
          {meals.map((meal) => (
            <div 
              key={meal.type}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground w-20 flex-shrink-0">
                  {mealTypeLabels[meal.type]}
                </div>
                {meal.recipe ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img 
                      src={meal.recipe.image} 
                      alt={meal.recipe.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{meal.recipe.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {meal.recipe.carbs}g carbs • {meal.recipe.servings} servings
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddMeal?.(meal.type)}
                    data-testid={`button-add-${meal.type}`}
                    className="flex-1 justify-start text-muted-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add meal
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

import { MealPlanDayCard } from "@/components/MealPlanDayCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import chickenSaladImg from "@assets/generated_images/Grilled_chicken_salad_recipe_e2729edb.png";
import salmonImg from "@assets/generated_images/Salmon_with_roasted_vegetables_4bb228a8.png";
import buddhaImg from "@assets/generated_images/Vegetarian_Buddha_bowl_recipe_615f3db8.png";

export default function MealPlanner() {
  // Todo: remove mock data
  const mockWeekPlan = [
    {
      day: "Monday",
      date: "Oct 20",
      meals: [
        { type: "breakfast" as const, recipe: { name: "Grilled Chicken Salad", image: chickenSaladImg, carbs: 38, servings: 1 } },
        { type: "lunch" as const, recipe: { name: "Salmon with Vegetables", image: salmonImg, carbs: 28, servings: 1 } },
        { type: "dinner" as const, recipe: { name: "Buddha Bowl", image: buddhaImg, carbs: 42, servings: 1 } },
        { type: "snack" as const },
      ],
    },
    {
      day: "Tuesday",
      date: "Oct 21",
      meals: [
        { type: "breakfast" as const, recipe: { name: "Buddha Bowl", image: buddhaImg, carbs: 42, servings: 1 } },
        { type: "lunch" as const },
        { type: "dinner" as const, recipe: { name: "Grilled Chicken Salad", image: chickenSaladImg, carbs: 38, servings: 1 } },
        { type: "snack" as const },
      ],
    },
    {
      day: "Wednesday",
      date: "Oct 22",
      meals: [
        { type: "breakfast" as const },
        { type: "lunch" as const },
        { type: "dinner" as const },
        { type: "snack" as const },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
          <p className="text-muted-foreground">Plan your weekly diabetes-friendly meals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" data-testid="button-previous-week">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="gap-2" data-testid="button-current-week">
            <Calendar className="h-4 w-4" />
            This Week
          </Button>
          <Button variant="outline" size="icon" data-testid="button-next-week">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockWeekPlan.map((dayPlan) => (
          <MealPlanDayCard
            key={dayPlan.day}
            day={dayPlan.day}
            date={dayPlan.date}
            meals={dayPlan.meals}
            onAddMeal={(type) => console.log(`Add ${type} for ${dayPlan.day}`)}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button data-testid="button-generate-plan">
          Generate Full Week Plan
        </Button>
      </div>
    </div>
  );
}

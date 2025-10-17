import { MealPlanDayCard } from "../MealPlanDayCard";
import chickenSaladImg from "@assets/generated_images/Grilled_chicken_salad_recipe_e2729edb.png";
import salmonImg from "@assets/generated_images/Salmon_with_roasted_vegetables_4bb228a8.png";

export default function MealPlanDayCardExample() {
  const meals = [
    {
      type: "breakfast" as const,
      recipe: {
        name: "Grilled Chicken Salad",
        image: chickenSaladImg,
        carbs: 38,
        servings: 1,
      },
    },
    {
      type: "lunch" as const,
      recipe: {
        name: "Salmon with Roasted Vegetables",
        image: salmonImg,
        carbs: 28,
        servings: 1,
      },
    },
    { type: "dinner" as const },
    { type: "snack" as const },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <MealPlanDayCard
        day="Monday"
        date="October 20, 2025"
        meals={meals}
        onAddMeal={(type) => console.log(`Add meal for ${type}`)}
      />
    </div>
  );
}

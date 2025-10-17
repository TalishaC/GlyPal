import { RecipeCard } from "../RecipeCard";
import chickenSaladImg from "@assets/generated_images/Grilled_chicken_salad_recipe_e2729edb.png";

export default function RecipeCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <RecipeCard
        id="1"
        title="Grilled Chicken Salad with Quinoa"
        image={chickenSaladImg}
        time={25}
        servings={4}
        carbs={38}
        protein={32}
        fiber={6}
        difficulty="Easy"
        isT2DOptimized={true}
        onClick={() => console.log("Recipe clicked")}
      />
    </div>
  );
}

import { db } from "./db";
import { users, bgReadings, prescriptions, recipes } from "@shared/schema";

// Image paths
const chickenSaladImg = "/attached_assets/generated_images/Grilled_chicken_salad_recipe_e2729edb.png";
const salmonImg = "/attached_assets/generated_images/Salmon_with_roasted_vegetables_4bb228a8.png";
const buddhaImg = "/attached_assets/generated_images/Vegetarian_Buddha_bowl_recipe_615f3db8.png";

async function seed() {
  console.log("Seeding database...");

  // Create test user
  const [user] = await db.insert(users).values({
    id: "test-user-1",
    username: "testuser",
    password: "password123",
    locale: "en-US",
    onboardingCompleted: true,
    isAdmin: true, // Make the test user an admin
  }).onConflictDoNothing().returning();

  console.log("Created test user:", user);

  // Create BG readings
  const now = new Date();
  const bgReadingsData = [
    {
      userId: "test-user-1",
      value: 98,
      mealContext: "Before breakfast",
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      userId: "test-user-1",
      value: 145,
      mealContext: "After lunch",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: "test-user-1",
      value: 112,
      mealContext: "Before dinner",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
    },
  ];

  await db.insert(bgReadings).values(bgReadingsData).onConflictDoNothing();
  console.log("Created BG readings");

  // Create prescriptions
  const prescriptionsData = [
    {
      userId: "test-user-1",
      drug: "Metformin",
      dose: "500mg",
      scheduleTime: "8:00 AM",
      isActive: true,
    },
    {
      userId: "test-user-1",
      drug: "Glipizide",
      dose: "5mg",
      scheduleTime: "6:00 PM",
      isActive: true,
    },
  ];

  await db.insert(prescriptions).values(prescriptionsData).onConflictDoNothing();
  console.log("Created prescriptions");

  // Create recipes
  const recipesData = [
    {
      title: "Grilled Chicken Salad with Quinoa and Avocado",
      image: chickenSaladImg,
      time: 25,
      servings: 4,
      carbs: "38",
      protein: "32",
      fiber: "6",
      satFat: "5",
      difficulty: "Easy",
      isT2DOptimized: true,
      ingredients: [
        { name: "Chicken breast", quantity: "2 lbs", category: "Proteins" },
        { name: "Quinoa", quantity: "1 cup", category: "Grains" },
        { name: "Avocado", quantity: "2", category: "Produce" },
        { name: "Cherry tomatoes", quantity: "1 pint", category: "Produce" },
      ],
      instructions: [
        "Cook quinoa according to package directions",
        "Grill chicken breast until cooked through",
        "Slice chicken and prepare vegetables",
        "Combine all ingredients in a bowl",
      ],
    },
    {
      title: "Baked Salmon with Roasted Vegetables",
      image: salmonImg,
      time: 35,
      servings: 2,
      carbs: "28",
      protein: "35",
      fiber: "5",
      satFat: "4",
      difficulty: "Medium",
      isT2DOptimized: true,
      ingredients: [
        { name: "Salmon fillet", quantity: "1 lb", category: "Proteins" },
        { name: "Broccoli", quantity: "1 head", category: "Produce" },
        { name: "Bell peppers", quantity: "3", category: "Produce" },
      ],
      instructions: [
        "Preheat oven to 400°F",
        "Season salmon and vegetables",
        "Roast for 25-30 minutes",
      ],
    },
    {
      title: "Vegetarian Buddha Bowl",
      image: buddhaImg,
      time: 20,
      servings: 2,
      carbs: "42",
      protein: "18",
      fiber: "8",
      satFat: "3",
      difficulty: "Easy",
      isT2DOptimized: true,
      ingredients: [
        { name: "Brown rice", quantity: "2 cups", category: "Grains" },
        { name: "Chickpeas", quantity: "1 can", category: "Legumes" },
        { name: "Avocado", quantity: "1", category: "Produce" },
      ],
      instructions: [
        "Cook brown rice",
        "Prepare chickpeas and vegetables",
        "Assemble bowl with toppings",
      ],
    },
  ];

  await db.insert(recipes).values(recipesData).onConflictDoNothing();
  console.log("Created recipes");

  console.log("Seeding complete!");
}

seed().catch(console.error);

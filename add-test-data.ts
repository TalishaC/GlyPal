import { storage } from "./server/storage";

async function addTestData() {
  const userId = "957180cf-8227-49aa-a137-4510d69df844";

  console.log("Adding test BG readings...");

  // Add readings for the last 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Morning reading
    await storage.createBGReading({
      userId,
      value: Math.floor(Math.random() * 40) + 90, // 90-130
      mealContext: "Before breakfast",
    });

    // Lunch reading
    await storage.createBGReading({
      userId,
      value: Math.floor(Math.random() * 60) + 120, // 120-180
      mealContext: "After lunch",
    });

    // Dinner reading
    await storage.createBGReading({
      userId,
      value: Math.floor(Math.random() * 50) + 110, // 110-160
      mealContext: "After dinner",
    });
  }

  console.log("✅ Added 42 test BG readings!");

  // Now test analytics
  console.log("\nFetching trends...");
  const trends = await storage.getBGTrends(userId, 14);
  console.log(JSON.stringify(trends, null, 2));
}

addTestData().then(() => process.exit(0));
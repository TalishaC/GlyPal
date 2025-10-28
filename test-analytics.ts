import { storage } from "./server/storage";
import { db } from "./server/db";
import { users } from "./shared/schema";

async function test() {
  console.log("Testing analytics...\n");

  // First, check what users exist
  console.log("Checking users in database:");
  const allUsers = await db.select().from(users);
  console.log("Users found:", allUsers.length);

  if (allUsers.length === 0) {
    console.log("No users found! Run: npm run db:seed");
    return;
  }

  // Use the first user
  const user = allUsers[0];
  console.log("\nUsing user:", {
    id: user.id,
    username: user.username,
  });

  // Test the analytics
  console.log("\nFetching BG trends...");
  const trends = await storage.getBGTrends(user.id, 30);

  console.log("\n=== BG TRENDS RESULT ===");
  console.log(JSON.stringify(trends, null, 2));
}

test()
  .then(() => {
    console.log("\n✅ Test complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Test failed:", err);
    process.exit(1);
  });

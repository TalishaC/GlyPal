import { db } from "./server/db.js";
   import { users } from "./shared/schema.js";
   import { eq } from "drizzle-orm";

   async function makeAdmin() {
     console.log("Starting update...");
     const result = await db.update(users)
       .set({ isAdmin: true, onboardingCompleted: true })
       .where(eq(users.username, "testuser"))
       .returning();
     console.log("Updated user:", result);
     process.exit(0);
   }

   makeAdmin().catch(console.error);

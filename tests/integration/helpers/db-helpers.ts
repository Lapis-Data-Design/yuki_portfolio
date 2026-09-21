import { like } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function cleanupTestUsers(): Promise<void> {
    await db.delete(users).where(like(users.email, "%@example.test"));
}
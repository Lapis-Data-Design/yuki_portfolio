import { config } from "dotenv";
config({ path: ".env.test"});

import { 
    ALL_TEST_EMAILS
 } from "./global-setup";

export default async function globalTeardown() {
    const { inArray } = await import("drizzle-orm");
    const { db } = await import("@/db/client");
    const { users, sessions } = await import("@/db/schema");

    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, ALL_TEST_EMAILS));

    if (existing.length > 0) {
        const ids = existing.map((u) => u.id);
        await db.delete(sessions).where(inArray(sessions.userId, ids));
        await db.delete(users).where(inArray(users.email, ALL_TEST_EMAILS));
    }
}
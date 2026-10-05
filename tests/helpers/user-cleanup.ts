import { inArray, like, SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { users, sessions } from "@/db/schema";

async function deleteUsersAndSessions(where: SQL): Promise<void> {
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(where);
    
    if (existing.length === 0) return;

    const userIds = existing.map((u) => u.id);
    await db.delete(sessions).where(inArray(sessions.userId, userIds));
    await db.delete(users).where(inArray(users.id, userIds));
}

// For fixtures with a fixed, known list of emails (e2e accounts).
export async function cleanupUsersByEmail(emails: string[]): Promise<void> {
    if (emails.length === 0) return;
    await deleteUsersAndSessions(inArray(users.email, emails));
}

export async function cleanupUsersByEmailPattern(pattern: string): Promise<void> {
    await deleteUsersAndSessions(like(users.email, pattern));
}
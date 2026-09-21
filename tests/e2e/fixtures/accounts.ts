import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { users, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/password";

export const E2E_OWNER_EMAIL = "e2e-owner@example.test";
export const E2E_OWNER_TEMP_PASSWORD = "e2e-temp-password-1";

export const E2E_ADMIN_EMAIL = "e2e-admin@example.test";
export const E2E_ADMIN_PASSWORD = "e2e-temp-password-2";

export const E2E_ROLE_TEST_OWNER_EMAIL = "e2e-role-owner@example.test";
export const E2E_ROLE_TEST_OWNER_PASSWORD = "e2e-role-owner-password-3";

export const E2E_ADMIN_JOURNEY_EMAIL = "e2e-admin-journey@example.test";
export const E2E_ADMIN_JOURNEY_TEMP_PASSWORD = "e2e-admin-journey-temp-4";

export const ALL_TEST_EMAILS = [
    E2E_OWNER_EMAIL,
    E2E_ADMIN_EMAIL,
    E2E_ROLE_TEST_OWNER_EMAIL,
    E2E_ADMIN_JOURNEY_EMAIL
]

export async function cleanupTestAccounts(): Promise<void> {
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

export async function seedTestAccounts(): Promise<void> {
    await cleanupTestAccounts();

    const ownerHash = await hashPassword(E2E_OWNER_TEMP_PASSWORD);
    await db.insert(users).values({
        email: E2E_OWNER_EMAIL,
        passwordHash: ownerHash,
        role: "owner",
        mustChangePassword: true,
    });

    const adminHash = await hashPassword(E2E_ADMIN_PASSWORD);
    await db.insert(users).values({
        email: E2E_ADMIN_EMAIL,
        passwordHash: adminHash,
        role: "admin",
        mustChangePassword: false,
    });

    const roleTestOwnerHash = await hashPassword(E2E_ROLE_TEST_OWNER_PASSWORD);
    await db.insert(users).values({
        email: E2E_ROLE_TEST_OWNER_EMAIL,
        passwordHash: roleTestOwnerHash,
        role: "owner",
        mustChangePassword: false,
    });

    const adminJourneyHash = await hashPassword(E2E_ADMIN_JOURNEY_TEMP_PASSWORD);
    await db.insert(users).values({
        email: E2E_ADMIN_JOURNEY_EMAIL,
        passwordHash: adminJourneyHash,
        role: "admin",
        mustChangePassword: true,
    })
}
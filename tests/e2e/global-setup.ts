import { config } from 'dotenv';
config({ path: ".env.test" });

export const E2E_OWNER_EMAIL = "e2e-owner@example.test";
export const E2E_OWNER_TEMP_PASSWORD = "e2e-temp-password-1";

export const E2E_ADMIN_EMAIL = "e2e-admin@example.test";
export const E2E_ADMIN_TEMP_PASSWORD = "e2e-temp-password-2";

export const E2E_ROLE_TEST_OWNER_EMAIL = "e2e-role-owner@example.test";
export const E2E_ROLE_TEST_OWNER_PASSWORD = "e2e-role-owner-password-1";

export const ALL_TEST_EMAILS = [
    E2E_OWNER_EMAIL,
    E2E_ADMIN_EMAIL,
    E2E_ROLE_TEST_OWNER_EMAIL
]

export default async function globalSetup() {
    const { inArray } = await import("drizzle-orm");
    const { db } = await import("@/db/client");
    const { users, sessions } = await import("@/db/schema");
    const { hashPassword } = await import("@/lib/password");

    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, ALL_TEST_EMAILS));
        
    if (existing.length > 0) {
        const ids = existing.map((u) => u.id);
        await db.delete(sessions).where(inArray(sessions.userId, ids));
        await db.delete(users).where(inArray(users.email, ALL_TEST_EMAILS));
    }

    const ownerHash = await hashPassword(E2E_OWNER_TEMP_PASSWORD);
    await db.insert(users).values({
        email: E2E_OWNER_EMAIL,
        passwordHash: ownerHash,
        role: "owner",
        mustChangePassword: true,
    });

    const adminHash = await hashPassword(E2E_ADMIN_TEMP_PASSWORD);
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
}
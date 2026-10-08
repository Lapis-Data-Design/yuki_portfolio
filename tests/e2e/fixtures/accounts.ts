import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { cleanupUsersByEmail } from "@/tests/helpers/user-cleanup";

export const E2E_OWNER_EMAIL = "e2e-owner@example.test";
export const E2E_OWNER_TEMP_PASSWORD = "e2e-temp-password-1";

export const E2E_ADMIN_EMAIL = "e2e-admin@example.test";
export const E2E_ADMIN_TEMP_PASSWORD = "e2e-temp-password-2";

export const E2E_ROLE_TEST_OWNER_EMAIL = "e2e-role-owner@example.test";
export const E2E_ROLE_TEST_OWNER_PASSWORD = "e2e-role-owner-password-3";

export const E2E_ADMIN_JOURNEY_EMAIL = "e2e-admin-journey@example.test";
export const E2E_ADMIN_JOURNEY_TEMP_PASSWORD = "e2e-admin-journey-temp-4";

export const E2E_EXPIRED_SESSION_EMAIL = "e2e-exipred-session@example.test";
export const E2E_EXPIRED_SESSION_PASSWORD = "e2e-expired-session-password-5";

export const ALL_TEST_EMAILS = [
    E2E_OWNER_EMAIL,
    E2E_ADMIN_EMAIL,
    E2E_ROLE_TEST_OWNER_EMAIL,
    E2E_ADMIN_JOURNEY_EMAIL,
    E2E_EXPIRED_SESSION_EMAIL,
]

export async function cleanupTestAccounts(): Promise<void> {
   await cleanupUsersByEmail(ALL_TEST_EMAILS);
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

    const adminJourneyHash = await hashPassword(E2E_ADMIN_JOURNEY_TEMP_PASSWORD);
    await db.insert(users).values({
        email: E2E_ADMIN_JOURNEY_EMAIL,
        passwordHash: adminJourneyHash,
        role: "admin",
        mustChangePassword: true,
    });

    const expiredSessionHash = await hashPassword(E2E_EXPIRED_SESSION_PASSWORD);
    await db.insert(users).values({
        email: E2E_EXPIRED_SESSION_EMAIL,
        passwordHash: expiredSessionHash,
        role: "owner",
        mustChangePassword: false,
    });
}
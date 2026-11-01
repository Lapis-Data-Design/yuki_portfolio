import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { cleanupUsersByEmail } from "@/tests/helpers/user-cleanup";
import { clearAllLoginThrottle } from "@/tests/helpers/login-throttle";

type TestAccount = {
    email: string;
    password: string;
    role: (typeof users.$inferInsert)["role"];
    mustChangePassword: boolean;
};

export const TEST_ACCOUNTS = {
    owner:          { email: "e2e-owner@example.test",              password: "e2e-temp-password-1",                role: "owner",  mustChangePassword: true },
    admin:          { email: "e2e-admin@example.test",              password: "e2e-temp-password-2",                role: "admin",  mustChangePassword: false },
    roleTestOwner:  { email: "e2e-role-owner@example.test",         password: "e2e-role-owner-password-3",          role: "owner",  mustChangePassword: false },
    adminJourney:   { email: "e2e-admin-journey@example.test",      password: "e2e-admin-journey-temp-password-4",  role: "admin",  mustChangePassword: true },
    expiredSession: { email: "e2e-expired-session@example.test",    password: "e2e-expired-session-password-5",     role: "owner",  mustChangePassword: false },
    ownerLockout:   { email: "e2e-owner-lockout@example.test",      password: "e2e-owner-lockout-password-6",       role: "owner",  mustChangePassword: false },
    adminLockout:   { email: "e2e-admin-lockout@example.test",      password: "e2e-admin-lockout-password-7",       role: "admin",  mustChangePassword: false },
} satisfies Record<string, TestAccount>;

export async function cleanupTestAccounts(): Promise<void> {
   await cleanupUsersByEmail(Object.values(TEST_ACCOUNTS).map((account) => account.email));
   await clearAllLoginThrottle();
}

export async function seedTestAccounts(): Promise<void> {
    await cleanupTestAccounts();

    const rows: (typeof users.$inferInsert)[] = [];
    for (const { password, ...account } of Object.values(TEST_ACCOUNTS)) {
        rows.push({ ...account, passwordHash: await hashPassword(password) });
    }

    await db.insert(users).values(rows);
}
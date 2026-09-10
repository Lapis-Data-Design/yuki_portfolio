import { describe, it, expect, afterEach } from "../test-utils";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import {
    hashPassword,
    verifyPassword,
    authenticateUser,
    updateUserEmail,
    updateUserPassword,
} from "@/lib/auth";
import { cleanupTestUsers } from "./db-helpers";

const TEST_EMAIL = "test-user-@example.test";
const TEST_EMAIL_2 = "test-user-2@example.test";
const TEST_PASSWORD = "test-password-do-not-use-elsewhere";

afterEach(async () => {
    await cleanupTestUsers();
});

describe("authehticateUser", () => {
    it("returns the user on correct email and password", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        await db.insert(users).values({
            email: TEST_EMAIL,
            passwordHash,
            role: "owner",
            mustChangePassword: false,
        });

        const result = await authenticateUser(TEST_EMAIL, TEST_PASSWORD);
        expect(result).not.toBeNull();
    });
    
    it("returns null on an incorrect password", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        await db.insert(users).values({
            email: TEST_EMAIL,
            passwordHash,
            role: "owner",
            mustChangePassword: false,
        });

        const result = await authenticateUser(TEST_EMAIL, "wrong-password");
        expect(result).toBeNull();
    });

    it("returns null for an email that doesn't exist", async () => {
        const result = await authenticateUser(
            "no-such-user@example.test",
            TEST_PASSWORD
        );
        expect(result).toBeNull();
    });
});

describe("updateUserEmail", () => {
    it("updates the email when the new address is unused", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        const [user] = await db
            .insert(users)
            .values({
                email: TEST_EMAIL,
                passwordHash,
                role: "owner",
                mustChangePassword: false,
            })
            .returning();

            const result = await updateUserEmail(user.id, TEST_EMAIL_2);
            expect(result.success).toBe(true);

            const [updated] = await db
                .select()
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);
            expect(updated.email).toBe(TEST_EMAIL_2);
    });

    it("fails when the new email is already in use by someone", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        const [userA] = await db
            .insert(users)
            .values({
                email: TEST_EMAIL,
                passwordHash,
                role: "owner",
                mustChangePassword: false,
            })
            .returning();
        
        await db.insert(users).values({
            email: TEST_EMAIL_2,
            passwordHash,
            role: "admin",
            mustChangePassword: false,
        });

        const result = await updateUserEmail(userA.id, TEST_EMAIL_2);
        expect(result.success).toBe(false);
    });
});

describe("updateUserPassword", () => {
    it("succeeds with the correct current password and a valid new one", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        const [user] = await db
            .insert(users)
            .values({
                email: TEST_EMAIL,
                passwordHash,
                role: "owner",
                mustChangePassword: true,
            })
            .returning();
        
        const result = await updateUserPassword(
            user.id,
            TEST_PASSWORD,
            "a-new-valid-password"
        );
        expect(result.success).toBe(true);

        const [updated] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        expect(updated.mustChangePassword).toBe(false);
        expect( 
            await verifyPassword("a-new-valid-password", updated.passwordHash)
        ).toBe(true);
    });

    it("fails when the current password is wrong", async () => {

    });

    it("fails when the new password is under 8 characters", async () => {
        const passwordHash = await hashPassword(TEST_PASSWORD);
        const [user] = await db
            .insert(users)
            .values({
                email: TEST_EMAIL,
                passwordHash,
                role: "owner",
                mustChangePassword: true,
            })
            .returning();

        const result = await updateUserPassword(user.id, TEST_PASSWORD, "short");
        expect(result.success).toBe(false);
    });
});
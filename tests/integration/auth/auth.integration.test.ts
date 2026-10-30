import { vi } from "vitest";
import { describe, it, expect, beforeEach } from "@/tests/test-utils";
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
import { cleanupUsersByEmailPattern } from "@/tests/helpers/user-cleanup";

vi.mock("@/lib/password", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/password")>();
    return { ...actual, verifyPassword: vi.fn(actual.verifyPassword) };
});

const TEST_EMAIL = "test-user@example.test";
const TEST_EMAIL_2 = "test-user-2@example.test";
const TEST_PASSWORD = "test-password-do-not-use-elsewhere";

type UserRow = typeof users.$inferSelect;

let testPasswordHash: Promise<string> | undefined;

async function insertUser(
    email: string, 
    {
        role = "owner",
        mustChangePassword = false,
    }: { role?: UserRow["role"]; mustChangePassword?: boolean } = {}
): Promise<UserRow> {
    testPasswordHash ??= hashPassword(TEST_PASSWORD);
    const [ user ] = await db
        .insert(users)
        .values({ email, passwordHash: await testPasswordHash, role, mustChangePassword })
        .returning();
    return user;
}

async function findUser(id: number): Promise<UserRow> {
    const [ user ] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
}

beforeEach(async () => {
    await cleanupUsersByEmailPattern("%@example.test");
});

describe("authenticateUser", () => {
    it("returns the user on correct email and password", async () => {
        await insertUser(TEST_EMAIL);

        const result = await authenticateUser(TEST_EMAIL, TEST_PASSWORD);
        expect(result).not.toBeNull();
    });

    it("matches an email typed with different case and surrounding spaces", async () => {
        await insertUser(TEST_EMAIL);

        const result = await authenticateUser( ` ${TEST_EMAIL.toUpperCase()} `, TEST_PASSWORD);
        expect(result?.email).toBe(TEST_EMAIL);
    });
    
    it("returns null on an incorrect password", async () => {
        await insertUser(TEST_EMAIL);

        const result = await authenticateUser(TEST_EMAIL, "wrong-password");
        expect(result).toBeNull();
    });

    it("returns null for an email that doesn't exist", async () => {
        const result = await authenticateUser( "no-such-user@example.test", TEST_PASSWORD );
        expect(result).toBeNull();
    });

    it("runs a bcrypt compare at full cost for an email that doesn't exist", async () => {
        const spy = vi.mocked(verifyPassword);
        spy.mockClear();

        const result = await authenticateUser("no-such-user@example.test", TEST_PASSWORD);

        expect(result).toBeNull();
        expect(spy).toHaveBeenCalledTimes(1);

        const [password, dummyHash] = spy.mock.calls[0];
        const realHash = await hashPassword(TEST_PASSWORD);
        expect(password).toBe(TEST_PASSWORD);
        expect(dummyHash.slice(0, 7)).toBe(realHash.slice(0, 7));
    });
});

describe("updateUserEmail", () => {
    it("updates the email when the new address is unused", async () => {
        const user = await insertUser(TEST_EMAIL);

        const result = await updateUserEmail(user.id, TEST_EMAIL_2);
        expect(result.success).toBe(true);

        const updated = await findUser(user.id);
        expect(updated.email).toBe(TEST_EMAIL_2);
    });

    it("fails when the new email is already in use by someone", async () => {
        const userA = await insertUser(TEST_EMAIL);
        
        await insertUser(TEST_EMAIL_2, { role: "admin" });

        const result = await updateUserEmail(userA.id, TEST_EMAIL_2);
        expect(result.success).toBe(false);
    });

    it("stores the new email trimmed and lowercased", async () => {
        const user = await insertUser(TEST_EMAIL);
        
        const result = await updateUserEmail(user.id, `  ${TEST_EMAIL_2.toUpperCase()}  `);
        expect(result.success).toBe(true);

        const updated = await findUser(user.id);
        expect(updated.email).toBe(TEST_EMAIL_2);
    });

    it("fails when the new email matches one in use except for case", async () => {
        const userA = await insertUser(TEST_EMAIL);
        await insertUser(TEST_EMAIL_2);

        const result = await updateUserEmail(userA.id, TEST_EMAIL_2.toUpperCase());
        expect(result.success).toBe(false);
    });

    it("fails when the new email is empty after trimming", async () => {
        const user = await insertUser(TEST_EMAIL);

        const result = await updateUserEmail(user.id, "    ");
        expect(result.success).toBe(false);
    });
});

describe("updateUserPassword", () => {
    it("succeeds with the correct current password and a valid new one", async () => {
        const user = await insertUser(TEST_EMAIL, {mustChangePassword: true });
        
        const result = await updateUserPassword(
            user.id,
            TEST_PASSWORD,
            "a-new-valid-password"
        );
        expect(result.success).toBe(true);

        const updated = await findUser(user.id);
        expect(updated.mustChangePassword).toBe(false);
        expect( 
            await verifyPassword("a-new-valid-password", updated.passwordHash)
        ).toBe(true);
    });

    it("fails when the current password is wrong", async () => {
        const user = await insertUser(TEST_EMAIL, { mustChangePassword: true });

        const result = await updateUserPassword(
            user.id,
            "wrong-current-password",
            "a-new-valid-password"
        );
        expect(result.success).toBe(false);
    });

    it("fails when the new password is under 8 characters", async () => {
        const user = await insertUser(TEST_EMAIL, { mustChangePassword: true });

        const result = await updateUserPassword(user.id, TEST_PASSWORD, "short");
        expect(result.success).toBe(false);
    });
});
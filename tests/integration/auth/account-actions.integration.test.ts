import { assert, vi, describe, it, expect, beforeEach  } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import * as auth from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { cleanupUsersByEmailPattern } from "@/tests/helpers/user-cleanup";
import { 
    PASSWORD_MISMATCH_MESSAGE,
    EMAIL_MISMATCH_MESSAGE,
    SAME_PASSWORD_MESSAGE,
    SAME_EMAIL_MESSAGE,
    CURRENT_PASSWORD_REQUIRED_MESSAGE,
    NEW_EMAIL_REQUIRED_MESSAGE,
    NEW_PASSWORD_REQUIRED_MESSAGE,
    PASSWORD_TOO_SHORT_MESSAGE,
    CURRENT_PASSWORD_INCORRECT_MESSAGE,
    EMAIL_IN_USE_MESSAGE,
    accountLockedLoggedOutMessage,
} from "@/lib/account-rules";
import { ACCOUNT_FAILURE_LIMIT, LOGIN_LOCK_MINUTES, accountThrottleKey, lockoutMessage } from "@/lib/login-throttle-policy";
import { clearAllLoginThrottle, rewindLoginThrottle } from "@/tests/helpers/login-throttle";
import { updateEmailAction, updatePasswordAction } from "@/lib/actions/account";
import { revalidatePath } from "next/cache";

type UserRow = typeof users.$inferSelect;

const session = vi.hoisted(() => ({ user: null as UserRow | null }));

vi.mock("@/lib/auth", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/auth")>();
    return {
        ...actual,
        requireUser: vi.fn(async () => {
            if (!session.user) throw new Error("test has no signed-in user");
            return session.user;
        }),
        verifyPassword: vi.fn(actual.verifyPassword),
        clearSession: vi.fn(async () => {}),
    };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const EMAIL = "account-actions@example.test";
const PASSWORD = "account-actions-password";
const NEW_PASSWORD = "account-actions-new-password";
const NEW_EMAIL = "account-actions-new@example.test";
const initial = { success: false, error: null };

let passwordHash: Promise<string> | undefined;

async function insertUser(email: string): Promise<UserRow> {
    passwordHash ??= hashPassword(PASSWORD);
    const [row] = await db
        .insert(users)
        .values({ email, passwordHash: await passwordHash, role: "owner", mustChangePassword: false, })
        .returning();
    return row;
}

async function findUser(id: UserRow["id"]): Promise<UserRow> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
}

function signedInUser(): UserRow {
    assert(session.user, "beforeEach should have signed a user in");
    return session.user;
}

function form(fields: Record<string, string>): FormData {
    const data = new FormData();
    for (const [name, value] of Object.entries(fields)) data.set(name, value);
    return data;
}

beforeEach(async () => {
    await cleanupUsersByEmailPattern("%@example.test");
    await clearAllLoginThrottle();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(auth.verifyPassword).mockClear();
    vi.mocked(auth.clearSession).mockClear();
    session.user = await insertUser(EMAIL);
});

describe("updateEmailAction", () => {
    const valid = { currentPassword: PASSWORD, newEmail: NEW_EMAIL, confirmNewEmail: NEW_EMAIL };

    async function expectRefused(fields: Record<string, string>, error: string) {
        expect(await updateEmailAction(initial, form(fields))).toEqual({ success: false, error });
        expect((await findUser(signedInUser().id)).email).toBe(EMAIL);
    }

    it("requires the current password", async () => {
        await expectRefused({ ...valid, currentPassword: "" }, CURRENT_PASSWORD_REQUIRED_MESSAGE);
    });

    it("requires a new email", async () => {
        await expectRefused({ ...valid, newEmail: " ", confirmNewEmail: "  "}, NEW_EMAIL_REQUIRED_MESSAGE);
    });

    it("refuses new emails that don't match", async () => {
        await expectRefused({ ...valid, confirmNewEmail: "other@example.test" }, EMAIL_MISMATCH_MESSAGE);
    });

    it("refuses the current email in any case", async () => {
        const upper = EMAIL.toUpperCase();
        await expectRefused({ ...valid, newEmail: upper, confirmNewEmail: upper }, SAME_EMAIL_MESSAGE);
    });

    it("refuses a wrong current password", async () => {
        await expectRefused({ ...valid, currentPassword: "wrong-password" }, CURRENT_PASSWORD_INCORRECT_MESSAGE);
    });

    it("refuses an email another account uses", async () => {
        await insertUser(NEW_EMAIL);
        await expectRefused(valid, EMAIL_IN_USE_MESSAGE);
    });

    it("stores a matching new email normalized", async () => {
        const result = await updateEmailAction(
            initial,
            form({ ...valid, newEmail: " Account-Actions-New@Example.test", confirmNewEmail: NEW_EMAIL }),
        );
        expect(result).toEqual({ success: true, error: null });
        expect((await findUser(signedInUser().id)).email).toBe(NEW_EMAIL);
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard/owner");
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });
});

describe("updatePasswordAction", () => {
    const valid = { currentPassword: PASSWORD, newPassword: NEW_PASSWORD, confirmNewPassword: NEW_PASSWORD };

    async function expectRefused(fields: Record<string, string>, error: string) {
        expect(await updatePasswordAction(initial, form(fields))).toEqual({ success: false, error });
        expect(await verifyPassword(PASSWORD, (await findUser(signedInUser().id)).passwordHash)).toBe(true);
    }

    it("requires the current password", async () => {
        await expectRefused({ ...valid, currentPassword: "" }, CURRENT_PASSWORD_REQUIRED_MESSAGE );
    });

    it("requires a new password", async () => {
        await expectRefused({ ...valid, newPassword: "", confirmNewPassword: "" }, NEW_PASSWORD_REQUIRED_MESSAGE);
    });

    it("refuses new passwords that don't match", async () => {
        await expectRefused({ ...valid, confirmNewPassword: `${NEW_PASSWORD}-typo` }, PASSWORD_MISMATCH_MESSAGE);
    });

    it("refuses a wrong current password", async () => {
        await expectRefused({ ...valid, currentPassword: "wrong-password" }, CURRENT_PASSWORD_INCORRECT_MESSAGE);
    });

    it("refuses passwords that don't meet character length minimum", async () => {
        await expectRefused({ ...valid, newPassword: "new", confirmNewPassword: "new" }, PASSWORD_TOO_SHORT_MESSAGE);
    })

    it("refuses the current password as the new one", async () => {
        await expectRefused(
            { currentPassword: PASSWORD, newPassword: PASSWORD, confirmNewPassword: PASSWORD },
            SAME_PASSWORD_MESSAGE,
        );
    });

    it("says nothing about sameness when the current password is wrong", async () => {
        await expectRefused(
            { currentPassword: "wrong-password", newPassword: "wrong-password", confirmNewPassword: "wrong-password" },
            CURRENT_PASSWORD_INCORRECT_MESSAGE,
        );
    });

    it("saves a matching new password", async () => {
        expect(await updatePasswordAction(initial, form(valid))).toEqual({ success: true, error: null });
        expect(await verifyPassword(NEW_PASSWORD, (await findUser(signedInUser().id)).passwordHash)).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard/owner");
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });
});

describe("current-password attempts", () => {
    const validPassword = { currentPassword: PASSWORD, newPassword: NEW_PASSWORD, confirmNewPassword: NEW_PASSWORD };
    const wrongPassword = { ...validPassword, currentPassword: "wrong-password" };
    const validEmail = { currentPassword: PASSWORD, newEmail: NEW_EMAIL, confirmNewEmail: NEW_EMAIL };
    const wrongEmail = { ...validEmail, currentPassword: "wrong-password" };

    async function failPasswordAttempts(count: number) {
        for (let i = 0; i < count; i++) {
            expect(await updatePasswordAction(initial, form(wrongPassword))).toEqual({
                success: false,
                error: CURRENT_PASSWORD_INCORRECT_MESSAGE,
            });
        }
    }

    async function lock() {
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
        expect(await updatePasswordAction(initial, form(wrongPassword))).toEqual({
            success: false,
            error: accountLockedLoggedOutMessage(LOGIN_LOCK_MINUTES),
        });
    }

    async function passwordUnchanged() {
        expect(await verifyPassword(PASSWORD, (await findUser(signedInUser().id)).passwordHash)).toBe(true);
    }

    it("refuses normally below the limit and keeps the session", async () => {
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
        expect(auth.clearSession).not.toHaveBeenCalled();
    });

    it("locks and ends the session on the limit", async () => {
        await lock();
        expect(auth.clearSession).toHaveBeenCalled();
        await passwordUnchanged();
    });

    it("refuses the correct password while locked, without bcrypt or another logout", async () => {
        await lock();
        vi.mocked(auth.verifyPassword).mockClear();
        vi.mocked(auth.clearSession).mockClear();

        const locked = { success: false, error: lockoutMessage(LOGIN_LOCK_MINUTES) };
        expect(await updatePasswordAction(initial, form(validPassword))).toEqual(locked);
        expect(await updateEmailAction(initial, form(validEmail))).toBe(locked);

        expect(auth.verifyPassword).not.toHaveBeenCalled();
        expect(auth.clearSession).not.toHaveBeenCalled();
        await passwordUnchanged();
        expect((await findUser(signedInUser().id)).email).toBe(EMAIL);
    });

    it("counts wrong passwords from both actions together", async () => {
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
        expect(await updateEmailAction(initial, form(wrongEmail))).toEqual({
            success: false,
            error: accountLockedLoggedOutMessage(LOGIN_LOCK_MINUTES),
        });
    });

    it("doesn't count submissions refused by the form rules", async () => {
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
        await updatePasswordAction(initial, form({ ...wrongPassword, confirmNewPassword: "typo-password" }));
        expect(await updatePasswordAction(initial, form(validPassword))).toEqual({ success: true, error: null });
    });

    it("resets the count once the current password verifies, even if the save is refused as the same", async () => {
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
        expect(
            await updatePasswordAction(
                initial,
                form({ currentPassword: PASSWORD, newPassword: PASSWORD, confirmNewPassword: PASSWORD }),
            ),
        )   .toEqual({ success: false, error: SAME_PASSWORD_MESSAGE });
        await failPasswordAttempts(ACCOUNT_FAILURE_LIMIT - 1);
    });

    it("saves again onse the lock runs out", async () => {
        await lock();
        await rewindLoginThrottle(accountThrottleKey(signedInUser().id));
        expect(await updatePasswordAction(initial, form(validPassword))).toEqual({ success: true, error: null });
    });
});
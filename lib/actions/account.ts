"use server";

import { revalidatePath } from "next/cache";
import {
    clearSession,
    requireUser,
    verifyPassword,
    updateUserEmail,
    updateUserPassword,
} from "@/lib/auth";
import {
    ACCOUNT_UPDATE_FAILED_MESSAGE,
    CURRENT_PASSWORD_INCORRECT_MESSAGE,
    EMAIL_IN_USE_MESSAGE,
    emailChangeProblem,
    passwordChangeProblem,
    passwordsMatch,
    PASSWORD_TOO_SHORT_MESSAGE,
    SAME_PASSWORD_MESSAGE,
    accountLockedLoggedOutMessage,
} from "@/lib/account-rules";
import { clearThrottle, lockedMinutes, recordFailure } from "../login-throttle";
import { ACCOUNT_FAILURE_LIMIT, accountThrottleKey, lockoutMessage } from "../login-throttle-policy";

export type AccountActionState = {
    success: boolean;
    error: string | null;
}

type SignedInUser = Awaited<ReturnType<typeof requireUser>>

function field(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
}

function refused(error: string): AccountActionState {
    return { success: false, error };
}

function refreshDashboards(): AccountActionState {
    revalidatePath("/dashboard/owner");
    revalidatePath("/dashboard/admin");
    return { success: true, error: null };
}

async function currentPasswordProblem(user: SignedInUser, currentPassword: string): Promise<string | null> {
    const key = accountThrottleKey(user.id);

    const locked = await lockedMinutes([key]);
    if (locked !== null) return lockoutMessage(locked);

    if (await verifyPassword(currentPassword, user.passwordHash)) {
        await clearThrottle(key);
        return null;
    }

    const lockedNow = await recordFailure(key, ACCOUNT_FAILURE_LIMIT);
    if (lockedNow === null) return CURRENT_PASSWORD_INCORRECT_MESSAGE;

    await clearSession();
    return accountLockedLoggedOutMessage(lockedNow);
}

export async function updateEmailAction(
    _prevState: AccountActionState,
    formData: FormData,
): Promise<AccountActionState> {
    const user = await requireUser();
    const currentPassword = field(formData, "currentPassword");
    const newEmail = field(formData, "newEmail");

    const problem = emailChangeProblem({
        currentPassword,
        newEmail,
        confirmNewEmail: field(formData, "confirmNewEmail"),
        currentEmail: user.email,
    });

    if (problem) return refused(problem);
    
    const passwordProblem = await currentPasswordProblem(user, currentPassword);
    if (passwordProblem) return refused(passwordProblem);

    const result = await updateUserEmail(user.id, newEmail);
    if (!result.success) return refused(result.reason === "email-taken" ? EMAIL_IN_USE_MESSAGE : ACCOUNT_UPDATE_FAILED_MESSAGE);

    return refreshDashboards();
}

export async function updatePasswordAction(
    _prevState: AccountActionState,
    formData: FormData,
): Promise<AccountActionState> {
    const user = await requireUser();
    const currentPassword = field(formData, "currentPassword");
    const newPassword = field(formData, "newPassword");

    const problem = passwordChangeProblem({
        currentPassword,
        newPassword,
        confirmNewPassword: field(formData, "confirmNewPassword"),
    });
    
    if (problem) return refused(problem);

    const passwordProblem = await currentPasswordProblem(user, currentPassword);
    if (passwordProblem) return refused(passwordProblem);

    if (passwordsMatch(newPassword, currentPassword)) {
        return refused(SAME_PASSWORD_MESSAGE);
    }

    const result = await updateUserPassword(user.id, newPassword);
    if(!result.success) return refused(
        result.reason === "password-too-short" ? PASSWORD_TOO_SHORT_MESSAGE : ACCOUNT_UPDATE_FAILED_MESSAGE
    );

    return refreshDashboards();
}

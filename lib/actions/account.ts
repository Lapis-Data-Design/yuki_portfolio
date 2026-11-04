"use server";

import { revalidatePath } from "next/cache";
import { normalizeEmail } from "@/lib/email";
import {
    requireUser,
    verifyPassword,
    updateUserEmail,
    updateUserPassword,
} from "@/lib/auth";
import {
    emailChangeProblem,
    passwordChangeProblem,
    passwordsMatch,
    SAME_PASSWORD_MESSAGE
} from "@/lib/account-rules";

export type AccountActionState = {
    success: boolean;
    error: string | null;
}

const CURRENT_PASSWORD_INCORRECT = "Current password is incorrect.";

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

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        return refused(CURRENT_PASSWORD_INCORRECT);
    }

    const result = await updateUserEmail(user.id, newEmail);
    if (!result.success) return refused(result.error);

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

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        return refused(CURRENT_PASSWORD_INCORRECT);
    }

    if (passwordsMatch(newPassword, currentPassword)) {
        return refused(SAME_PASSWORD_MESSAGE);
    }

    const result = await updateUserPassword(user.id, currentPassword, newPassword);
    if(!result.success) return refused(result.error);

    return refreshDashboards();
}

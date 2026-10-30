"use server";

import { revalidatePath } from "next/cache";
import {
    requireUser,
    verifyPassword,
    updateUserEmail,
    updateUserPassword,
} from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";

type AccountFormState = {
    success: boolean;
    error: string | null;
}

export async function updateAccountAction(
    _prevstate: AccountFormState,
    formData: FormData
): Promise<AccountFormState> {
    const user = await requireUser();

    const currentPassword = formData.get("currentPassword");
    const newEmail = formData.get("newEmail");
    const newPassword = formData.get("newPassword");

    if (typeof currentPassword !== "string" || !currentPassword) {
        return { success: false, error: "Current password is required to make changes." };
    }

    const passwordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
        return { success: false, error: "Current password is incorrect" };
    }

    let emailChanged = false;
    let passwordChanged  = false;

    if (typeof newEmail === "string" && newEmail.trim() && normalizeEmail(newEmail) !== user.email) {
        const result = await updateUserEmail(user.id, newEmail);
        if (!result.success) {
            return { success: false, error: result.error }
        }
        emailChanged = true;
    }

    if (typeof newPassword === "string" && newPassword) {
        const result = await updateUserPassword(user.id, currentPassword, newPassword);
        if (!result.success) {
            return { success: false, error: result.error };
        }

        passwordChanged = true;
    }

    if (!emailChanged && !passwordChanged) {
        return { success: false, error: "Enter a new email or new password to update." };
    }

    revalidatePath("/dashboard/owner");
    revalidatePath("/dashboard/admin");

    return { success: true, error: null };
}
import { normalizeEmail } from "./email";

export const PASSWORD_MISMATCH_MESSAGE = "New passwords don't match.";
export const EMAIL_MISMATCH_MESSAGE = "New emails don't match.";
export const SAME_PASSWORD_MESSAGE = "Choose a password different from your current one.";
export const SAME_EMAIL_MESSAGE = "That's already your email address.";

export function showMismatch(entry: string, confirmation: string): boolean {
    if (confirmation === "" || entry === confirmation) return false;
    return !entry.startsWith(confirmation);
}

export function emailsMatch(newEmail: string, confirmNewEmail: string): boolean {
    return normalizeEmail(newEmail) === normalizeEmail(confirmNewEmail);
}

export function showEmailMismatch(newEmail: string, confirmNewEmail: string): boolean {
    return showMismatch(normalizeEmail(newEmail), normalizeEmail(confirmNewEmail));
}

export function isCurrentEmail(newEmail: string, currentEmail: string): boolean {
    const normalized = normalizeEmail(newEmail);
    return normalized !== "" && normalized === normalizeEmail(currentEmail);
}

export function canSavePassword(values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}): boolean {
    return (
        values.currentPassword !== "" &&
        values.newPassword !== "" &&
        values.newPassword === values.confirmNewPassword
    );
}

export function canSaveEmail(values: {
    currentPassword: string;
    currentEmail: string;
    newEmail: string;
    confirmNewEmail: string;
}): boolean {
    const newEmail = normalizeEmail(values.newEmail);

    return (
        values.currentPassword !== "" &&
        newEmail !== "" &&
        emailsMatch(values.newEmail, values.confirmNewEmail) &&
        !isCurrentEmail(values.newEmail, values.currentEmail)
    );
}
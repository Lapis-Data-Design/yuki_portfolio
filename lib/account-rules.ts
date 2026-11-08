import { normalizeEmail } from "./email";
import { MIN_PASSWORD_LENGTH } from "./password-policy";

export const CURRENT_PASSWORD_REQUIRED_MESSAGE = "Current password is required to make changes.";
export const NEW_EMAIL_REQUIRED_MESSAGE = "Enter a new email address.";
export const NEW_PASSWORD_REQUIRED_MESSAGE = "Enter a new password.";
export const PASSWORD_MISMATCH_MESSAGE = "New passwords don't match.";
export const EMAIL_MISMATCH_MESSAGE = "New emails don't match.";
export const SAME_PASSWORD_MESSAGE = "Choose a password different from your current one.";
export const SAME_EMAIL_MESSAGE = "That's already your email address.";
export const PASSWORD_TOO_SHORT_MESSAGE = `New password must be at leadt ${MIN_PASSWORD_LENGTH} characters.`;
export const PASSWORD_LENGTH_HINT = `At least ${MIN_PASSWORD_LENGTH} charactres.`;
export const ACCOUNT_UPDATE_FAILED_MESSAGE = "Couldn't save the change. Try again.";
export const CURRENT_PASSWORD_INCORRECT_MESSAGE = "Current password is incorrect.";
export const EMAIL_IN_USE_MESSAGE = "That email is already in use.";

export type EmailChange = {
    currentPassword: string;
    currentEmail: string;
    newEmail: string;
    confirmNewEmail: string;
};

export type PasswordChange = {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
};

export function emailsMatch(newEmail: string, confirmNewEmail: string): boolean {
    return normalizeEmail(newEmail) === normalizeEmail(confirmNewEmail);
}

export function passwordsMatch(newPassword: string, confirmNewPassword: string): boolean {
    return newPassword === confirmNewPassword;
}

export function isCurrentEmail(newEmail: string, currentEmail: string): boolean {
    const normalized = normalizeEmail(newEmail);
    return normalized !== "" && normalized === normalizeEmail(currentEmail);
}

export function emailChangeProblem(change: EmailChange): string | null {
    if (change.currentPassword === "") return CURRENT_PASSWORD_REQUIRED_MESSAGE;
    if (normalizeEmail(change.newEmail) === "") return NEW_EMAIL_REQUIRED_MESSAGE;
    if (!emailsMatch(change.newEmail, change.confirmNewEmail)) return EMAIL_MISMATCH_MESSAGE;
    if (isCurrentEmail(change.newEmail, change.currentEmail)) return SAME_EMAIL_MESSAGE;
    return null;
}

export function passwordChangeProblem(change: PasswordChange): string | null {
    if (change.currentPassword === "") return CURRENT_PASSWORD_REQUIRED_MESSAGE;
    if (change.newPassword === "") return NEW_PASSWORD_REQUIRED_MESSAGE;
    if (change.newPassword.length < MIN_PASSWORD_LENGTH) return PASSWORD_TOO_SHORT_MESSAGE;
    if (!passwordsMatch(change.newPassword, change.confirmNewPassword)) return PASSWORD_MISMATCH_MESSAGE;
    return null;
}

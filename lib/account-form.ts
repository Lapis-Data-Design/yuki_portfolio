import { normalizeEmail } from "./email";
import { 
    emailChangeProblem,
    passwordChangeProblem,
    type EmailChange,
    type PasswordChange,
} from "./account-rules";

export function showMismatch(entry: string, confirmation: string): boolean {
    if (confirmation === "" || entry === confirmation) return false;
    return !entry.startsWith(confirmation);
}

export function showEmailMismatch(newEmail: string, confirmNewEmail: string): boolean {
    return showMismatch(normalizeEmail(newEmail), normalizeEmail(confirmNewEmail));
}

export function canSavePassword(change: PasswordChange): boolean {
    return passwordChangeProblem(change) === null;
}

export function canSaveEmail(change: EmailChange): boolean {
    return emailChangeProblem(change) === null;
}
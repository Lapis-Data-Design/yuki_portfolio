"use client";

import { useActionState, useRef, useState, type KeyboardEvent } from "react";
import { 
    updateEmailAction,
    updatePasswordAction,
    type AccountActionState,
} from "@/lib/actions/account";
import {
    EMAIL_MISMATCH_MESSAGE,
    isCurrentEmail,
    PASSWORD_LENGTH_HINT,
    PASSWORD_MISMATCH_MESSAGE,
    SAME_EMAIL_MESSAGE,
} from "@/lib/account-rules";
import { canSaveEmail, canSavePassword, showEmailMismatch, showMismatch } from "@/lib/account-form";
import { Field, FormResult, SubmitButton } from "./form-fields";

const TABS = [
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const initialState: AccountActionState = { success: false, error: null };
const CURRENT_PASSWORD_HINT = "Required to confirm the change.";

export function AccountSettingsForm({ currentEmail }: { currentEmail: string }) {
    const [ tab, setTab ] = useState<Tab>("email");
    const tabRefs = useRef<Record<Tab, HTMLButtonElement | null >>({ email: null, password: null });

    function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const index = TABS.findIndex((t) => t.key === tab);
        const next = 
            event.key === "ArrowRight" ? TABS[(index + 1) % TABS.length]
            : event.key === "ArrowLeft" ? TABS[(index - 1 + TABS.length) % TABS.length]
            : event.key === "Home" ? TABS[0]
            : event.key === "End" ? TABS[TABS.length - 1]
            : null;
        if (!next) return;
        event.preventDefault();
        setTab(next.key);
        tabRefs.current[next.key]?.focus();
    }

    return (
       <div className="max-w-sm">
            <div
                role="tablist"
                aria-label="Account settings"
                onKeyDown={onTabKeyDown}
                className="flex gap-6 border-b border-text-primary/30"
            >
                {TABS.map((t) => {
                    const selected = t.key === tab;
                    return (
                        <button
                            key={t.key}
                            ref={(element) => {
                                tabRefs.current[t.key] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`account-tab-${t.key}`}
                            aria-selected={selected}
                            aria-controls={`account-panel-${t.key}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setTab(t.key)}
                            className={`-mb-px border-b-2 pb-2 font-sans text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary ${
                                selected
                                    ? "border-accent-primary text-text-primary"
                                    : "border-transparent text-text-primary/70 hover:text-accent-secondary"
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>
            
            <div
                role="tabpanel"
                id="account-panel-email"
                aria-labelledby="account-tab-email"
                hidden={tab !== "email"}
                className="pt-6"
            >
                <EmailForm currentEmail={currentEmail} />
            </div>
            <div
                role="tabpanel"
                id="account-panel-password"
                aria-labelledby="account-tab-password"
                hidden={tab !== "password"}
                className="pt-6"
            >
                <PasswordForm />
            </div>
       </div>
    );
}

function EmailForm({ currentEmail }: { currentEmail: string}) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmNewEmail, setConfirmNewEmail] = useState("");

    const [state, formAction, pending] = useActionState(
        async (previous: AccountActionState, formData: FormData) => {
            const result = await updateEmailAction(previous, formData);
            if ( result.success) {
                setCurrentPassword("");
                setNewEmail("");
                setConfirmNewEmail("");
            }
            return result;
        },
        initialState
    );

    const sameEmail = isCurrentEmail(newEmail, currentEmail);
    const mismatch = showEmailMismatch(newEmail, confirmNewEmail);
    const ready = canSaveEmail({ currentPassword, currentEmail, newEmail, confirmNewEmail});

    return (
        <form action={formAction} className="space-y-5">
            <p className="font-serif text-sm text-text-primary">Current email: {currentEmail}</p>
            <Field
                id="emailCurrentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                label="Current password"
                hint={CURRENT_PASSWORD_HINT}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Field
                id="newEmail"
                name="newEmail"
                type="email"
                required
                autoComplete="email"
                label="New email"
                error={sameEmail ? SAME_EMAIL_MESSAGE : null}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
            />
            <Field
                id="confirmNewEmail"
                name="confirmNewEmail"
                type="email"
                required
                autoComplete="off"
                label="Confirm new email"
                hint="Type the new email again."
                error={mismatch ? EMAIL_MISMATCH_MESSAGE : null}
                value={confirmNewEmail}
                onChange={(e) => setConfirmNewEmail(e.target.value)}
            />
            <FormResult state={state} />
            <SubmitButton ready={ready} pending={pending} label="Save email" />
        </form>
    );
}

function PasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [state, formAction, pending] = useActionState(
        async (previous: AccountActionState, formData: FormData) => {
            const result = await updatePasswordAction(previous, formData);
            if (result.success) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            }
            return result;
        },
        initialState,
    );

    const mismatch = showMismatch(newPassword, confirmNewPassword);
    const ready = canSavePassword({ currentPassword, newPassword, confirmNewPassword });

    return(
        <form action={formAction} className="space-y-5">
            <Field 
                id="passwordCurrentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                label="Current password"
                hint={CURRENT_PASSWORD_HINT}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Field 
                id="newPassword"
                name="newPassword"
                type="password"
                required
                autoComplete="new-password"
                label="New password"
                hint={PASSWORD_LENGTH_HINT}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <Field 
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                autoComplete="new-password"
                label="Confirm new password"
                hint="Type the new password again."
                error={mismatch ? PASSWORD_MISMATCH_MESSAGE : null}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <FormResult state={state} />
            <SubmitButton ready={ready} pending={pending} label="Save password." />
        </form>
    );
}
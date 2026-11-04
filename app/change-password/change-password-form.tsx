"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePasswordAction, type AccountActionState } from "@/lib/actions/account";
import { PASSWORD_MISMATCH_MESSAGE } from "@/lib/account-rules";
import { canSavePassword, showMismatch } from "@/lib/account-form";
import { Field, FormResult, SubmitButton } from "@/app/_components/form-fields";

const initialState: AccountActionState = { success: false, error: null };

export function ChangePasswordForm({ dashboardPath}: { dashboardPath: string }) {
    const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState(""); 

    useEffect(() => {
        if (state.success) {
            router.push(dashboardPath);
        }
    }, [state.success, dashboardPath, router]);

    const mismatch = showMismatch(newPassword, confirmNewPassword);
    const ready = canSavePassword({ currentPassword, newPassword, confirmNewPassword });

    return(
        <form action={formAction} className="space-y-5">
            <Field 
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                label="Current (temporary) password"
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
            
            <div className="flex items-center gap-4">
                <SubmitButton ready={ready} pending={pending} label="Save password." />
                <Link
                    href={dashboardPath}
                    className="font-serif text-sm text-text-primary hover:text-accent-secondary transition-colors"
                >
                    Skip for now
                </Link>
            </div>
        </form>
    );
}
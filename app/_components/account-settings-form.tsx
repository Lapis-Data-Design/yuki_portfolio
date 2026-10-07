"use client";

import { useActionState } from "react";
import { updateAccountAction } from "@/lib/actions/account";

const initialState = { success: false, error: null as string | null};

export function AccountSettingsForm({ currentEmail }: { currentEmail: string }) {
    const [ state, formAction, pending ] = useActionState(updateAccountAction, initialState);

    return (
        <form>
            <div>
                <label htmlFor="newEmail" className="block font-serif text-sm text-text-primary mb-1">
                    Email
                </label>
                <input 
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    defaultValue={currentEmail}
                     className="w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary"
                />
            </div>
            <div>
                <label htmlFor="newPassword" className="block font-serif text-sm text-text-primary mb-1">

                </label>
                <input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                    className="w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary"
                />
            </div>
            <div>
                <label htmlFor="currentPassword" className="block font-serif text-sm text-text-primary mb-1">

                </label>
                <input 
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary"
                />
                <p className="font-serif text-xs text-accent-soft mt-1">
                    Require to confirm any change
                </p>
            </div>

            {state.error && (
                <p className="font-serif text-sm text-accent-primary" role="alert">
                    {state.error}
                </p>
            )}
            {state.success && (
                <p className="font-serif text-sm text-[#5C6440]" role="status">
                    Saved.
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="bg-accent-primary text-background font-sans font-medium py-2 px-4 disabled:opacity-60 transition-colors hover:bg-accent-soft"
            >
                {pending ? "Saving..." : "Save changes"}
            </button>
        </form>
    );
}
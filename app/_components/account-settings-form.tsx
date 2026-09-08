"use client";

import { useActionState } from "react";
import { updateAccountAction } from "@/lib/actions/account";

const initialState = { success: false, error: null as string | null};

export function AccountSettingsForm({ currentEmail }: { currentEmail: string }) {
    const [ state, formAction, pending ] = useActionState(updateAccountAction, initialState);

    return (
        <form>
            <div>
                <label htmlFor="newEmail" className="block font-serif text-sm text-[#2B2119] mb-1">
                    Email
                </label>
                <input 
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    defaultValue={currentEmail}
                     className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>
            <div>
                <label htmlFor="newPassword" className="block font-serif text-sm text-[#2B2119] mb-1">

                </label>
                <input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>
            <div>
                <label htmlFor="currentPassword" className="block font-serif text-sm text-[#2B2119] mb-1">

                </label>
                <input 
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
                <p className="font-serif text-xs text-[#8C5A4E] mt-1">
                    Require to confirm any change
                </p>
            </div>

            {state.error && (
                <p className="font-serif text-sm text-[#A6472B]" role="alert">
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
                className="bg-[#A6472B] text-[#E8DEC6] font-sans font-medium py-2 px-4 disabled:opacity-60 transition-colors hover:bg-[#8C5A4E]"
            >
                {pending ? "Saving..." : "Save changes"}
            </button>
        </form>
    );
}
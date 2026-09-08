"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateAccountAction } from "@/lib/actions/account";

const initialState = { error: null as string | null, success: false };

export function ChangePasswordForm({ dashboardPath}: { dashboardPath: string }) {
    const [state, formAction, pending] = useActionState(updateAccountAction, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(dashboardPath);
        }
    }, [state.success, dashboardPath, router]);

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <label htmlFor="currentPassword" className="block font-serif text-sm text-[#2B2119] mb-1">
                    Current (temporary) password
                </label>
                <input 
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>

            <div>
                <label htmlFor="newPassword" className="block font-serif text-sm text-[#2B2119] mb-1">
                    New Password
                </label>
                <input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>  

            {state.error && (
                <p className="font-serif text-sm text-[#A6472B]" role="alert">
                    {state.error}
                </p>
            )} 

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={pending}
                    className="bg-[#A6472B] text-[#E8DEC6] font-sans font-medium py-2 px-4 disabled:opacity-60 transition-colors hover:bg-[#8C5A4E]"
                >
                    {pending ? "Saving" : "Set password"}
                </button>

                <Link
                    href={dashboardPath}
                    className="font-serif text-sm text-[#8C5A4E] hover:text-[#A6472B] transition-colors"
                >
                    Skip for now
                </Link>
            </div> 
        </form>
    );
}
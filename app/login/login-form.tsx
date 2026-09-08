"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

const initialState: { error: string | null } = { error: null };

export function LoginForm() {
    const [state, formAction, pending] = useActionState(loginAction, initialState);

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <label
                    htmlFor="email"
                    className="block font-serif text-sm text-[#2B2119] mb-1"
                >
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block font-serif text-sm text-[#2B2119] mb-1"
                >
                    Password
                </label>
                <input 
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-[#2B2119]/30 px-3 py-2 font-serif text-[#2B2119] focus:outline-none focus:border-[#A6472B]"
                />
            </div>

            {state.error && (
                <p className="font-serif text-sm text-[#A6472B]" role="alert">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="w-full bg-[#A6472B] text-[#E8DEC6] font-sans font-medium py-2 px-4 disabled:opacity-60 transition-colors hover:bg-[#8C5A4E]"
            >
                {pending ? "Logging in..." : "Log in"}
            </button>
        </form>
    );
}
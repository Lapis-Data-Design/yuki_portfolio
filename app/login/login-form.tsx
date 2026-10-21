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
                    className="block font-serif text-sm text-text-primary mb-1"
                >
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block font-serif text-sm text-text-primary mb-1"
                >
                    Password
                </label>
                <input 
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-text-primary/30 px-3 py-2 font-serif text-text-primary focus:outline-none focus:border-accent-primary"
                />
            </div>

            {state.error && (
                <p 
                    className="font-serif text-sm text-text-primary border-l-2 border-accent-primary pl-3" 
                    role="alert">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="w-full bg-accent-primary text-background font-sans font-medium py-2 px-4 disabled:opacity-60 transition-colors hover:bg-accent-soft"
            >
                {pending ? "Logging in..." : "Log in"}
            </button>
        </form>
    );
}
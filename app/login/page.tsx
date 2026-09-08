import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
    title: "Log in",
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#E8DEC6] flex items-center px-8 md:px-16">
            <div className="w-full max-w-sm">
                <p className="font-mono text-xs tracking-wide text-[#8C5A4E] mb-2">
                    No. 000
                </p>
                <h1 className="font-sans text-3xl font-semibold text-[#2B2119] mb-8">
                    Log in
                </h1>
                <LoginForm />
            </div>
        </main>
    );
}
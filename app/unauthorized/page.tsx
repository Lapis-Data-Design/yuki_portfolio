import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { dashboardPathFor } from "@/lib/auth";
import { IrisDivider } from "../_components/iris-divider";

export const metadata: Metadata = {
    title: "Not authorized",
    robots: { index: false, follow: false },
};

export default async function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-background flex items-center px-8 md:px-16">
            <div className="w-full max-w-sm">
                <p>
                    No. 403
                </p>
                <h1 className="font-sans text-3xl font-semibold text-text-primary mb-2">
                    Not authorized
                </h1>
                
                <Suspense fallback={<AccessPlaceholder />}>
                    <AccessDetails />
                </Suspense>
            </div>
        </main>
    );
}

function AccessPlaceholder() {
    return (
        <>
            <div aria-hidden className="min-h-12" />
            <IrisDivider className="my-10" />
        </>
    );
}

async function AccessDetails() {
    const session = await getSession();

    const action = session
        ? { href: dashboardPathFor(session.user.role), text: "Back to your dashboard" }
        : { href: "/login", text: "Log In" };

    const message = session
        ? "You're logged in, but this page isn't part of what your account can open."
        : "This page needs an account with the right access. Log in to continue.";

    return (
        <>
            <p className="font-serif text-base text-text-primary">
                {message}
            </p>

            <IrisDivider className="my-10"/>

            <Link
                href={action.href}
                className="inline-block border border-accent-primary px-5 py-2.5 font-sans text-sm font-medium text-text-primary transition-colors hover:border-accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
                { action.text }
            </Link>
        </>
    );
}
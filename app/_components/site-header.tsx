import Link from "next/link";
import { PUBLIC_NAV, SITE } from "@/lib/site";

export function SiteHeader() {
    return (
        <header  className="flex items-center justify-between gap-6">
            <Link
                href="/"
                aria-label={`${SITE.name}, home`}
                className="flex size-[34px] shrink-0 items-center justify-center rounded-full border-2 border-text-primary font-sans text-xs font-semibold"
            >
                {SITE.initials}
            </Link>

            <nav aria-label="Main">
                <ul className="flex flex-wrap justify-end gap-x-7 gap-y-2 font-sans text-sm">
                    {PUBLIC_NAV.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="transition-colors hover:text-accent-secondary">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

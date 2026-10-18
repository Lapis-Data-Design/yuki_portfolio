import type { Metadata } from "next";
import { IrisDivider } from "@/app/_components/iris-divider";
import { SITE, SOCIAL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
    title: "Contact",
    description: `Get in touch with ${SITE.name}.`,
};

export default function ContactPage() {
    return (
        <div className="mt-16 max-w-md sm:mt-24">
            <h1 className="font-sans text-4xl font-semibold sm:text-5xl">Contact</h1>

            <p className="mt-4 text-lg">{SITE.availability}</p>

            <a
                href={`mailto:${SITE.email}`}
                className="mt-8 inline-block font-sans text-xl underline decoration-text-primary/40 underline-offset-4 transition-colors hover:text-accent-secondary"
            >
                {SITE.email}
            </a>

            <IrisDivider className="my-10" />

            <ul aria-label="Elsewhere" className="flex flex-wrap gap-x-7 gap-y-2 font-sans text-sm">
                {SOCIAL_LINKS.map((link) => (
                    <li key={link.href}>
                        <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferer"
                            className="transition-colors hover:text-accent-secondary"
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

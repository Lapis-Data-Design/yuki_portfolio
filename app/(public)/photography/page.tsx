import type { Metadata } from "next";
import Link from "next/link";
import { Frame } from "@/app/_components/frame";
import { getFramesByDiscipline } from "@/lib/frames";
import { 
    frameAlt,
    frameCountLabel,
    frameHref,
    frameLabel,
    frameLinkName,
    frameSrc,
    placeholderTone 
} from "@/lib/frame-display";

export const metadata: Metadata = {
    title: "Photography",
};

export default async function PhotographyPage() {
    const photos = await getFramesByDiscipline("photo");

    return (
        <>
            <header className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <h1 className="font-sans text-[clamp(2.25rem,6vw,3.25rem)] font-bold leading-none tracking-[-0.01em]">
                    Photography
                </h1>
                <p className="font-mono text-[13px] text-text-primary">
                    {frameCountLabel(photos.length)}
                </p>
            </header>

            {photos.length === 0 ? (
                <p className="mt-10 max-w-[60ch]">No photographs yet.</p>
            ) : (
                <ol aria-label="Photographs" className="mt-10 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                    {photos.map((photo) => (
                        <li key={photo.id}>
                            <Link
                                href={frameHref(photo)}
                                aria-label={frameLinkName(photo)}
                                className="block rounded-[2px] focus-visible:outline-2 focus-visible:outline-offest-2 focus-visible:outline-accent-primary"
                            >
                                <Frame 
                                    label={frameLabel(photo)}
                                    tone={placeholderTone(photo.id)}
                                    src={frameSrc(photo)}
                                    alt={frameAlt(photo)}
                                    sizes="(min-width: 768px) 220px, (min-width: 640px) 33vw, 50vw"
                                    className="aspect-[3/2]"
                                />
                            </Link> 
                        </li>
                    ))}
                </ol>
            )}
        </>
    );
}
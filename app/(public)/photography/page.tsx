import type { Metadata } from "next";
import Link from "next/link";
import { Frame } from "@/app/_components/frame";
import { getFramesByDiscipline } from "@/lib/frames";
import { 
    frameAlt,
    frameHref,
    frameLabel,
    frameLinkName,
    frameSrc,
    placeholderTone 
} from "@/lib/frame-display";
import { DisciplineHeading } from "@/app/_components/discipline-heading";

export const metadata: Metadata = {
    title: "Photography",
};

export default async function PhotographyPage() {
    const photos = await getFramesByDiscipline("photo");

    return (
        <>
            <DisciplineHeading title="Photography" count={photos.length} />

            {photos.length === 0 ? (
                <p className="mt-10 max-w-[60ch]">No photographs yet.</p>
            ) : (
                <ol aria-label="Photographs" className="mt-10 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                    {photos.map((photo) => (
                        <li key={photo.id}>
                            <Link
                                href={frameHref(photo)}
                                aria-label={frameLinkName(photo)}
                                className="block rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
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
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Frame } from "@/app/_components/frame";
import { getFramesByDiscipline } from "@/lib/frames";
import {
    findFrameInSequence,
    frameAlt,
    frameHref,
    frameLabel,
    frameLinkName,
    framePositionLabel,
    frameSrc,
    placeholderTone,
} from "@/lib/frame-display";
import { PhotoKeys } from "./photo-keys";

const CONTACT_SHEET = "/photography";

const BUILD_PLACEHOLDER = "__placeholder__";

export async function generateStaticParams() {
    const photos = await getFramesByDiscipline("photo");
    if (photos.length === 0) return [{frameNumber: BUILD_PLACEHOLDER }];
    return photos.map((photo) => ({ frameNumber: photo.frameNumber }));
}

async function findPhoto(frameNumber: string) {
    return findFrameInSequence(await getFramesByDiscipline("photo"), frameNumber);
}

export async function generateMetadata({ params }: PageProps<"/photography/[frameNumber]">): Promise<Metadata> {
    const found = await findPhoto((await params).frameNumber);
    return found ? { title: frameLinkName(found.frame) } : {};
}

export default async function PhotoPage({ params }: PageProps<"/photography/[frameNumber]">) {
    const found = await findPhoto((await params).frameNumber);
    if (!found) notFound();

    const { frame, index, total, previous, next } = found;

    return (
        <div className="mt-10 grid gap-6 md:grid-cols-[10rem_1fr] md:gap-10">
            <div>
                <Link
                    href={CONTACT_SHEET}
                    className="font-sans text-sm text-text-primary transition-colors hover:text-accent-secondary"
                >
                    photography
                </Link>
                <h1 className="sr-only">{frameLinkName(frame)}</h1>
                <p className="mt-4 font-mono text-[13px] text-text-primary">
                    {framePositionLabel(index, total)}
                </p>
                {frame.caption ? <p className="mt-4 max-w-[60ch]">{frame.caption}</p> : null}
            </div>

            <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-1 sm:gap-3">
                <StepLink frame={previous} direction="previous" />
                <Frame
                    label={frameLabel(frame)}
                    tone={placeholderTone(frame.id)}
                    src={frameSrc(frame)}
                    alt={frameAlt(frame)}
                    sizes="(min-width: 768px) 680px, 85vw"
                    priority
                    className="aspect-[3/2]"
                />
                <StepLink frame={next} direction="next" />
            </div>
            <PhotoKeys 
                previousHref={previous ? frameHref(previous) : null}
                nextHref={next ? frameHref(next) : null}
                backHref={CONTACT_SHEET}
            />
        </div>
    );
}

function StepLink({
    frame,
    direction,
}: {
    frame: Parameters<typeof frameHref>[0] | null;
    direction: "previous" | "next";
}) {
    if (!frame) return <span aria-hidden />;

    return (
        <Link
            href={frameHref(frame)}
            aria-label={direction === "previous" ? "Previous photograph" : "Next photograph"}
            className="flex h-12 items-center justify-center rounded-[2px] text-text-primary transition-colors hover:text-accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
            <svg viewBox="0 0 16 32" className="h-8 w-4" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                {direction === "previous" ? <path d="M12 2 2 16l10 14" /> : <path d="M4 2l10 14L4 30" />}
            </svg>
        </Link>
    );
}


import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { FrameKeys } from "./frame-keys";
import { 
    disciplineIndex,
    frameHref,
    frameLinkName,
    framePositionLabel,
    frameStepName,
    type FrameInSequence,
    type PublicFrame,
} from "@/lib/frame-display";

const GRID = "mt-10 grid md:grid-cols-[10rem_1fr] md:grid-rows-[auto_1fr] md:gap-x-10";
const DETAILS = "md:col-start-1";
const STAGE = "mt-6 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-1 sm:gap-3 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0";

type FrameDetailShellProps = {
    discipline: PublicFrame["discipline"];
    mediaClassName: string;
    children: ReactNode;
};

export function FrameDetailShell({ discipline, mediaClassName, children }: FrameDetailShellProps) {
    const index = disciplineIndex(discipline);

    return (
        <div className={GRID}>
            <Link
                href={index.href}
                className="justify-self-start font-sans text-sm text-text-primary transition-colors hover:text-accent-secondary md:col-start-1"
            >
                {index.label}
            </Link>
            <Suspense fallback={<FrameDetailFallback mediaClassName={mediaClassName}/>}>{children}</Suspense>
        </div>
    );
}

function FrameDetailFallback({ mediaClassName }: { mediaClassName: string}) {
    return (
        <>
            <div className={DETAILS} aria-hidden>
                <p className="mt-4 font-mono text-[13px]">&nbsp;</p>
            </div>
            <div className={STAGE} aria-hidden>
                <span />
                <div className={mediaClassName} />
                <span />
            </div>
        </>
    );
}

type FrameDetailsProps = {
    found: FrameInSequence<PublicFrame>;
    children: ReactNode;
}

export function FrameDetail({ found, children }: FrameDetailsProps) {
    const { frame, index, total, previous, next } = found;

    return (
        <>
            <div className={DETAILS}>
                <h1 className="sr-only">{frameLinkName(frame)}</h1>
                <p className="mt-4 font-mono text-[13px] text-text-primary">{framePositionLabel(index, total)}</p>

                {frame.caption ? <p className="mt-4 max-w-[60ch]">{frame.caption}</p> : null}
            </div>

            <div className={STAGE}>
                <StepLink frame={previous} direction="previous" />
                {children}
                <StepLink frame={next} direction="next" />
            </div>

            <FrameKeys 
                previousHref={previous ? frameHref(previous) : null}
                nextHref={next ? frameHref(next) : null}
                backHref={disciplineIndex(frame.discipline).href}
            />
        </>
    );
}

function StepLink({ frame, direction }: { frame: PublicFrame | null; direction: "previous" | "next" }) {
    if (!frame) return <span aria-hidden />;

    return (
        <Link
            href={frameHref(frame)}
            aria-label={frameStepName(frame.discipline, direction)}
            className="flex h-12 items-center justify-center rounded-[2px] text-text-primary transition-colors hover:text-accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
            <svg viewBox="0 0 16 32" className="h-8 w-4" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                {direction === "previous" ? <path d="M12 2 2 16l10 14" /> : <path d="M4 2l10 14L4 30" />}
            </svg>
        </Link>
    );
}
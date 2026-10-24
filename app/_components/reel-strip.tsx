import Link from "next/link";
import { Frame } from "./frame";
import {
    frameAlt,
    frameHref,
    frameLabel,
    frameLinkName,
    frameSrc,
    placeholderTone,
    type PublicFrame,
} from "@/lib/frame-display";

type ReelStripProps = {
    frames: readonly PublicFrame[];
    label: string;
    className?: string;
};

export function ReelStrip({ frames, label, className= "" }: ReelStripProps) {
    return (
        <ol
            aria-label={label}
            tabIndex={0}
            className={`mr-[calc(50%-50vw)] flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-3 pr-4 sm:pr-10 rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary ${className}`}
        >
            {frames.map((frame) => (
                <li key={frame.id} className="w-[85vw] shrink-0 snap-start sm:w-[560px]">
                    <Link
                        href={frameHref(frame)}
                        aria-label={frameLinkName(frame)}
                        className="block rounded-[2px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary"
                    >
                        <Frame 
                            label={frameLabel(frame)}
                            tone={placeholderTone(frame.id)}
                            src={frameSrc(frame)}
                            alt={frameAlt(frame)}
                            sizes="(min-width: 640px) 560px, 85vw"
                            className="aspect-video"
                        />
                    </Link>
                </li>
            ))}
        </ol>
    );
}
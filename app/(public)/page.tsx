import { Fragment } from "react/jsx-runtime";
import { Frame, type FrameTone } from "../_components/frame";
import { IrisDivider } from "../_components/iris-divider";
import { SITE } from "@/lib/site";

type SelectedFrame = {
    label: string;
    discipline: "photography" | "video" | "stop motion";
    tone: FrameTone;
    src?: string;
    alt?: string;
};

const HERO_FRAME: SelectedFrame = { label: "No. 001", discipline: "photography", tone: "accent-secondary" };

const SELECTED_FRAMES: SelectedFrame[] = [
    { label: "No. 002", discipline: "photography", tone: "accent-primary" },
    { label: "No. 003", discipline: "video", tone: "accent-tertiary" },
    { label: "No. 004", discipline: "stop motion", tone: "accent-soft" },
    { label: "No. 005", discipline: "video", tone: "accent-secondary" },
];

export default function HomePage() {
    const nameLines = SITE.name.split(" ");

    return (
        <>
            {/* Title card: name and role in the fixed left column, hero frame on the wide side */}
            <section
                aria-labelledby="home-title"
                className="mt-10 grid gap-10 md:grid-cols-[1fr_1.3fr] md:items-end"
            >
                <div>
                    <h1
                        id="home-title"
                        className="font-sans text-[clamp(3.25rem,9vw,4.75rem)] font-bold leading-[0.92] tracking-[-0.01em]"
                    >
                        {nameLines.map((line, i) => (
                            <Fragment key={line}>
                                {i > 0 && <br />}
                                {line}
                            </Fragment>
                        ))}
                    </h1>
                    <p className="mt-5 max-w-[34ch] text-[17px] text-accent-soft">{SITE.role}</p>
                </div> 

                <Frame 
                    label={HERO_FRAME.label}
                    tone={HERO_FRAME.tone}
                    src={HERO_FRAME.src}
                    alt={HERO_FRAME.alt}
                    priority
                    sizes="(min-width: 768px) 520px, 100vw"
                    className="h-[260px] md:h-[340px]"
                />  
            </section>

            <IrisDivider className="mt-16" />

            {/* Selected frames, drawn from all three disciplines */}
            <section aria-label="Selected frames" className="mt-16 grid grid-cols-2 gap-3.5 md:grid-cols-4">
                {SELECTED_FRAMES.map((frame) => (
                    <Frame 
                        key={frame.label}
                        label={frame.label}
                        tone={frame.tone}
                        src={frame.src}
                        alt={frame.alt}
                        sizes="(min-width: 768px) 220px, 50vw"
                        className="h-[130px]"
                    />
                ))}
            </section>
        </>
    );
}

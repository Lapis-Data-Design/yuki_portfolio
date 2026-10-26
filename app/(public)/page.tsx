import { Fragment } from "react";
import Link from "next/link";
import { Frame } from "../_components/frame";
import { IrisDivider } from "../_components/iris-divider";
import { SITE } from "@/lib/site";
import { getHomeFrames } from "@/lib/frames";
import { 
    frameAlt,
    frameHref,
    frameLabel,
    frameLinkName,
    frameSrc,
    placeholderTone
 } from "@/lib/frame-display";

 const FRAME_LINK = "block focus-visible:outline-2 focus-visible:outline-2 focus-visible:outline-accent-primary";

export default async function HomePage() {
    const nameLines = SITE.name.split(" ");
    const { hero, selected } = await getHomeFrames();

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
                    <p className="mt-5 max-w-[34ch] text-[17px] text-text-primary">{SITE.role}</p>
                </div> 

                {hero && (
                    <Link
                        href={frameHref(hero)}
                        aria-label={frameLinkName(hero)}
                        className={FRAME_LINK}
                    >
                        <Frame
                            label={frameLabel(hero)}
                            tone={placeholderTone(hero.id)}
                            src={frameSrc(hero)}
                            alt={frameAlt(hero)}
                            priority
                            sizes="(min-width: 768px) 520px, 100vw"
                            className="h-[260px] md:h-[340px]"
                        />
                    </Link>
                )}
            </section>

            <IrisDivider className="mt-16" />

            {/* Selected frames, drawn from all three disciplines */}
            {selected.length > 0 && (

                <section aria-label="Selected frames" className="mt-16 grid grid-cols-2 gap-3.5 md:grid-cols-4">
                    {selected.map((frame) => (
                        <Link
                            key={frame.id}
                            href={frameHref(frame)}
                            aria-label={frameLinkName(frame)}
                            className={FRAME_LINK}
                        >
                            <Frame 
                                key={frame.id}
                                label={frameLabel(frame)}
                                tone={placeholderTone(frame.id)}
                                src={frameSrc(frame)}
                                alt={frameAlt(frame)}
                                sizes="(min-width: 768px) 220px, 50vw"
                                className="h-[130px]"
                            />
                        </Link>
                    ))}
                </section>
            )}
        </>
    );
}

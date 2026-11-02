import Link from "next/link";
import { Frame } from "@/app/_components/frame";
import { getFramesByDiscipline, getHomeFrames } from "@/lib/frames";
import { getActivePaletteName } from "@/lib/theme";
import {
    disciplineIndex,
    frameAlt,
    frameCountLabel,
    frameHref,
    frameLabel,
    frameLinkName,
    frameSrc,
    placeholderTone,
    type PublicFrame,
} from "@/lib/frame-display";

const DISCIPLINES = [
    { discipline: "photo", label: "Photography" },
    { discipline: "video", label: "Video"},
    { discipline: "stop_motion", label: "Stop motion"},
] as const satisfies readonly { discipline: PublicFrame["discipline"]; label: string }[];

const SWATCHES = [
    {name: "background", className: "bg-background" },
    {name: "text-primary", className: "bg-text-primary" },
    {name: "accent-primary", className: "bg-accent-primary" },
    {name: "accent-secondary", className: "bg-accent-secondary" },
    {name: "accent-tertiary", className: "bg-accent-tertiary" },
    {name: "accent-soft", className: "bg-accent-soft" },
] as const;

const SECTION = "mt-12 grid gap-4 md:grid-cols-[10rem_1fr] md:gap-10";
const SECTION_HEADING = "font-sans text-lg font-semibold text-text-primary";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

export default async function OwnerOverviewPage() {
    const [{ hero, selected }, paletteName, work] = await Promise.all([
        getHomeFrames(),
        getActivePaletteName(),
        Promise.all(
            DISCIPLINES.map(async (d) => ({
                ...d,
                count: (await getFramesByDiscipline(d.discipline)).length,
            })),
        ),
    ]);

    return (
        <div>
            <p className="mb-2 font-mono text-xs tracking-wide text-text-primary">Roll 01A</p>
            <h1 className="font-sans text-2xl font-semibold text-text-primary mb-4">Overview</h1>
            <p className="mt-3 max-w-md font-serif text-text-primary">
               What visitors see on the site right now.
            </p>

            <section aria-labelledby="overview-home" className={SECTION}>
                <h2 id="overview-home" className={SECTION_HEADING}>On the home page</h2>
                <div>
                    {hero && (
                        <Link
                            href={frameHref(hero)}
                            aria-label={frameLinkName(hero)}
                            className={`block max-w-md ${FOCUS}`}
                        >
                            <Frame
                                label={frameLabel(hero)}
                                tone={placeholderTone(hero.id)}
                                src={frameSrc(hero)}
                                alt={frameAlt(hero)}
                                sizes="(min-width: 768px) 448px, 100vw"
                                className="aspect-[3/2]"
                            />
                        </Link>
                    )}

                    {selected.length > 0 && (
                        <div className="mt-3 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
                            {selected.map((frame) => (
                                <Link
                                    key={frame.id}
                                    href={frameHref(frame)}
                                    aria-label={frameLinkName(frame)}
                                    className={`block ${FOCUS}`}
                                >
                                    <Frame 
                                        label={frameLabel(frame)}
                                        tone={placeholderTone(frame.id)}
                                        src={frameSrc(frame)}
                                        alt={frameAlt(frame)}
                                        sizes="(min-width: 768px) 160px, 50vw"
                                        className="aspect-[3/2]"
                                    />
                                </Link>
                            ))}
                        </div>
                    )}

                    {!hero && selected.length === 0 && (
                        <p className="font-serif text-text-primary">Nothing is featured on Home yet.</p>
                    )}
                </div>
            </section>

            <section aria-labelledby="overview-work" className={SECTION}>
                <h2 id="overview-work" className={SECTION_HEADING}>Work</h2>
                <ul className="space-y-2">
                    {work.map((d) => (
                        <li key={d.discipline} className="flex items-baseline gap-4">
                            <Link
                                href={disciplineIndex(d.discipline).href}
                                className={`font-sans text-text-primary underline underline-offset-4 hover:text-accent-secondary ${FOCUS}`}
                            >
                                {d.label}
                            </Link>
                            <span className="font-mono text-xs text-text-primary">{frameCountLabel(d.count)}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="overview-palette" className={SECTION}>
                <h2 id="overview-palette" className={SECTION_HEADING}>Palette</h2>
                <div>
                    <p className="font-sans text-text-primary">{paletteName ?? "Built-in default"}</p>
                    <ul className="mt-3 flex gap-2">
                        {SWATCHES.map((swatch) => (
                            <li key={swatch.name} className={`h-10 w-10 border border-text-primary/30 ${swatch.className}`}>
                                <span className="sr-only">{swatch.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}


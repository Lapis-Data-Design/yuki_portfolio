import { discipline } from "@/db/schema";
import { loadScriptEnv, runScript } from "./_lib/script-env";

const PLACEHOLDER_TITLE = "Placeholder";

type Discipline = "photo" | "video" | "stop_motion";

type SeedFrame = {
    discipline: Discipline;
    number: number;
    featuredOnHome?: boolean;
};

const PHOTO_COUNT = 24;
const VIDEO_COUNT = 6;
const STOP_MOTION_COUNT = 4;

const HERO: SeedFrame = { discipline: "photo", number: 1};
const FEATURED: SeedFrame[] = [
    { discipline: "photo", number: 7 },
    { discipline: "video", number: 3 },
    { discipline: "stop_motion", number: 2 },
    { discipline: "video", number: 5 },
];

const pad = (n: number) => String(n).padStart(3, "0");
const isFeatured = (d: Discipline, n: number) =>
    FEATURED.some((f) => f.discipline === d && f.number === n);

function framesFor(discipline: Discipline, count: number)  {
    return Array.from({ length: count}, (_, i) => {
        const number = i + 1;
        return {
            discipline,
            frameNumber: pad(number),
            title: PLACEHOLDER_TITLE,
            displayOrder: number,
            featuredOnHome: isFeatured(discipline, number),
            isHero: false,
        };
    });
}

const FRAMES = [
    ...framesFor("photo", PHOTO_COUNT),
    ...framesFor("video", VIDEO_COUNT),
    ...framesFor("stop_motion", STOP_MOTION_COUNT),
];

async function seedFrames() {
    loadScriptEnv({ allowTestBranch: true });

    const { db } = await import("@/db/client");
    const { frames } = await import ("@/db/schema");
    const { and, eq, sql } = await import("drizzle-orm");

    const [inserted, hero] = await db.batch([
        db
            .insert(frames)
            .values(FRAMES)
            .onConflictDoNothing({ target: [frames.discipline, frames.frameNumber] })
            .returning({ id: frames.id}),
        db
            .update(frames)
            .set({ isHero: true })
            .where(
                and(
                    eq(frames.discipline, HERO.discipline),
                    eq(frames.frameNumber, pad(HERO.number)),
                    sql`not exists (select 1 from ${frames} where ${frames.isHero} = true)`,                    
                ),
            )
            .returning({ id: frames.id }),
    ]);

    console.log(`Inserted ${inserted.length} of ${FRAMES.length} placeholder frames (the rest already exist, left unchanged)`);
    console.log(
        hero.length > 0
            ? `Hero frame: ${HERO.discipline} No. ${pad(HERO.number)}`
            : "A hero frame was already sest; left unchanged",
    );
    console.log("Seeding doesn't clear the Next cache: restart dev with .next/cache removed to see the new frames.");
}

runScript(seedFrames);
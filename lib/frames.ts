import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { frames } from "@/db/schema";
import { findFrameInSequence, FrameInSequence, FRAMES_CACHE_TAG, type PublicFrame } from "./frame-display";

const publicColumns = {
    id: frames.id,
    discipline: frames.discipline,
    frameNumber: frames.frameNumber,
    rollTag: frames.rollTag,
    title: frames.title,
    caption: frames.caption,
    imageUrl: frames.imageUrl,
};

const HOME_SELECTED_LIMIT = 4;

export async function getFramesByDiscipline(discipline: PublicFrame["discipline"]): Promise<PublicFrame[]> {
    "use cache";
    cacheTag(FRAMES_CACHE_TAG);

    try {
        const rows = await db
            .select(publicColumns)
            .from(frames)
            .where(eq(frames.discipline, discipline))
            .orderBy(asc(frames.displayOrder), asc(frames.id));

            cacheLife("max");
            return rows;
    } catch (error) {
        console.error(`getFramesByDiscipline("${discipline}") failed; rendering no frames`, error);
        cacheLife("minutes");
        return [];
    }
}

export async function findFrameByNumber(
    discipline: PublicFrame["discipline"],
    frameNumber: string,
): Promise<FrameInSequence<PublicFrame> | null> {
    return findFrameInSequence(await getFramesByDiscipline(discipline), frameNumber);
}

export async function getHomeFrames(): Promise<{ hero: PublicFrame | null; selected: PublicFrame[]}> {
    "use cache";
    cacheTag(FRAMES_CACHE_TAG);

    try {
        const [heroRows, selected] = await Promise.all([
            db.select(publicColumns).from(frames).where(eq(frames.isHero, true)).limit(1),
            db
                .select(publicColumns)
                .from(frames)
                .where(and(eq(frames.featuredOnHome, true), eq(frames.isHero, false)))
                .orderBy(asc(frames.displayOrder), asc(frames.id))
                .limit(HOME_SELECTED_LIMIT),
        ]);
        cacheLife("max");
        return { hero: heroRows[0] ?? null, selected };
    } catch (error) {
        console.error("getHomeFrames failed; rendering no frames", error);
        cacheLife("minutes");
        return { hero: null, selected: []};
    }
}
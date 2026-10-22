import type { FrameTone } from "@/app/_components/frame";
import type { discipline } from "@/db/schema";

export const FRAMES_CACHE_TAG = "frames";

export type PublicFrame = {
    id: number;
    discipline: (typeof discipline)[number];
    frameNumber: string;
    rollTag: string | null;
    title: string | null;
    caption: string | null;
    imageUrl: string | null;
};

type Discipline = PublicFrame["discipline"];

const PLACEHOLDER_TONES: readonly FrameTone[] = [
    "accent-primary",
    "accent-secondary",
    "accent-tertiary",
    "accent-soft",
];

const DISCIPLINE_ROUTES: Record<PublicFrame["discipline"], {path: string, noun: string, indexLabel: string}> = {
    photo: { path: "/photography", noun: "Photograph", indexLabel: "photography" },
    video: { path: "/video", noun: "Video", indexLabel: "video" },
    stop_motion: { path: "/stop-motion", noun: "Stop motion", indexLabel: "stop motion" },
};

export function frameLabel(frame: Pick<PublicFrame, "frameNumber">): string {
    return `No. ${frame.frameNumber}`;
}

export function placeholderTone(id: number): FrameTone {
    const n = PLACEHOLDER_TONES.length;
    return PLACEHOLDER_TONES[((id % n) + n) % n];
}

export function frameAlt(frame: Pick<PublicFrame, "title" | "caption">): string {
    return frame.title ?? frame.caption ?? "";
}

export function frameSrc(frame: Pick<PublicFrame, "imageUrl">): string | undefined {
    return frame.imageUrl ?? undefined;
}

export function frameCountLabel(count: number): string {
    return count === 1 ? "1 frame" : `${count} frames`;
}

export function frameHref(frame: Pick<PublicFrame, "discipline" | "frameNumber">): string {
    return `${DISCIPLINE_ROUTES[frame.discipline].path}/${encodeURIComponent(frame.frameNumber)}`;
}

export function frameLinkName(frame: Pick<PublicFrame, "discipline" | "frameNumber">): string {
    return `${DISCIPLINE_ROUTES[frame.discipline].noun} ${frameLabel(frame)}`;
}

export function disciplineIndex(discipline: Discipline ): {href: string, label: string} {
    const route = DISCIPLINE_ROUTES[discipline];
    return { href: route.path, label: route.indexLabel };
}

export function frameStepName(discipline: Discipline, direction: "previous" | "next"): string {
    const noun = DISCIPLINE_ROUTES[discipline].noun.toLowerCase();
    return `${direction === "previous" ? "Previous" : "Next"} ${noun}`;
}

export function framePositionLabel(index: number, total: number): string {
    return `${index + 1} / ${total}`;
}

export type FrameInSequence<T> = {
    frame: T;
    index: number;
    total: number;
    previous: T | null;
    next: T | null;
};

export function findFrameInSequence<T extends Pick<PublicFrame, "frameNumber">>(
    frames: readonly T[],
    frameNumber: string,
): FrameInSequence<T> | null {
    const index = frames.findIndex((frame) => frame.frameNumber === frameNumber);
    if (index === -1) return null;

    return {
        frame: frames[index],
        index,
        total: frames.length,
        previous: frames[index - 1] ?? null,
        next: frames[index + 1] ?? null,
    };
}

export const FRAME_PARAM_PLACEHOLDER = "__placeholder__";

export function frameNumberParams(frames: readonly Pick<PublicFrame, "frameNumber">[]): { frameNumber: string}[] {
    if (frames.length === 0 ) return [{ frameNumber: FRAME_PARAM_PLACEHOLDER }];
    return frames.map((frame) => ({ frameNumber: frame.frameNumber }));
}
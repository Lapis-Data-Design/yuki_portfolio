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

const PLACEHOLDER_TONES: readonly FrameTone[] = [
    "accent-primary",
    "accent-secondary",
    "accent-tertiary",
    "accent-soft",
];

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
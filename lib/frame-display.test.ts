import { assert, describe, expect, it } from "vitest";
import { 
    disciplineIndex,
    FRAME_PARAM_PLACEHOLDER,
    findFrameInSequence,
    frameAlt,
    frameCountLabel,
    frameHref,
    frameLabel,
    frameLinkName,
    frameNumberParams,
    framePositionLabel,
    frameStepName,
    placeholderTone
} from "./frame-display";

describe("frameLabel", () => {
    it("prefixes the stored digits", () => {
        expect(frameLabel({ frameNumber: "001" })).toBe("No. 001");
    });
});

describe("placeholderTone", () => {
    it("cycles through the four accent tones by id", () => {
        expect([0, 1, 2, 3, 4].map(placeholderTone)).toEqual([
            "accent-primary",
            "accent-secondary",
            "accent-tertiary",
            "accent-soft",
            "accent-primary",
        ]);
    });

    it("gives the same frame the same tone every time", () => {
        expect(placeholderTone(17)).toBe(placeholderTone(17));
    });

    it("handles negative ids without returning undefined", () => {
        expect(placeholderTone(-1)).toBe("accent-soft");
    });
});

describe("frameAlt", () => {
    it("prefers the title, then the caption, then empty", () => {
        expect(frameAlt({ title: "Pier", caption: "Night" })).toBe("Pier");
        expect(frameAlt({title: null, caption: "Night"})).toBe("Night");
        expect(frameAlt({title: null, caption: null})).toBe("");
    });
});

describe("frameCountLabel", () => {
    it("uses the singular for one frame", () => {
        expect(frameCountLabel(0)).toBe("0 frames");
        expect(frameCountLabel(1)).toBe("1 frame");
        expect(frameCountLabel(24)).toBe("24 frames");
    });
});

describe.each([
    { discipline: "photo", path: "/photography", noun: "Photograph" },
    { discipline: "video", path: "/video", noun: "Video" },
    { discipline: "stop_motion", path: "/stop-motion", noun: "Stop motion" },
] as const)("$discipline frames", ({ discipline, path, noun}) => {
    it("link to their own page by frame number", () => {
        expect(frameHref({ discipline, frameNumber: "007"})).toBe(`${path}/007`);
    });

    it("are named after the frame, not the alt text", () => {
        expect(frameLinkName({ discipline, frameNumber: "007"})).toBe(`${noun} No. 007`);
    });
});

describe("frameHref", () => {
    it("encodes characters that aren't safe in a path segment", () => {
        expect(frameHref({ discipline: "photo", frameNumber: "14A/B"})).toBe("/photography/14A%2FB");
    });
});

describe("framePositionLabel", () => {
    it("shows the 1-based position out of the total", () => {
        expect(framePositionLabel(0, 24)).toBe("1 / 24");
        expect(framePositionLabel(13, 24)).toBe("14 / 24");
        expect(framePositionLabel(23, 24)).toBe("24 / 24");
    });
});

describe("findFrameInSequence", () => {
    const sequence = [
        { id: 10, frameNumber: "001" },
        { id: 11, frameNumber: "002" },
        { id: 12, frameNumber: "003" },
    ];

    it("finds a middle frame with both neighbors", () => {
        expect(findFrameInSequence(sequence, "002")).toEqual({
            frame: sequence[1],
            index: 1,
            total: 3,
            previous: sequence[0],
            next: sequence[2],
        });
    });

    it("has no previous on the first frame", () => {
        const found = findFrameInSequence(sequence, "001");
        assert(found, "expects frame 001 in the sequence");
        expect(found?.previous).toBeNull();
        expect(found.next).toBe(sequence[1]);
    });

    it("has no next on the last frame", () => {
        const found = findFrameInSequence(sequence, "003");
        assert(found, "expected frame 003 in the sequence");
        expect(found.previous).toBe(sequence[1]);
        expect(found.next).toBeNull();
    });

    it("returns null for an unknown frame number", () => {
        expect(findFrameInSequence(sequence, "999")).toBeNull();
    });

    it("returns null when the list is empty", () => {
        expect(findFrameInSequence([], "001")).toBeNull();
    });
});

describe("frameNumberParams", () => {
    it("lists every frame number in list order", () => {
        expect(frameNumberParams([{ frameNumber: "002" }, { frameNumber: "001" }])).toEqual([
            { frameNumber: "002" },
            { frameNumber: "001" },
        ]);
    });

    it("returns one placeholder param when there are no frames", () => {
        expect(frameNumberParams([])).toEqual([{ frameNumber: FRAME_PARAM_PLACEHOLDER }]);
    });

    it("uses a placeholder that can't be a real number", () => {
        expect(FRAME_PARAM_PLACEHOLDER).not.toMatch(/^\d+$/);
    });
});
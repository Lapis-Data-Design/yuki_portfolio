import { describe, expect, it } from "vitest";
import { frameAlt, frameCountLabel, frameLabel, placeholderTone } from "./frame-display";

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
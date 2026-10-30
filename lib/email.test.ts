import { describe, it, expect } from "vitest";
import { normalizeEmail } from "./email";

describe("normalizeEmail", () => {
    it("trims and lowercases", () => {
        expect(normalizeEmail(" Test@Example.TEST")).toBe("test@example.test");
    });

    it("leaves an already normalized email unchanged", () => {
        expect(normalizeEmail("test@example.test")).toBe("test@example.test");
    });
    
    it("trims tabs and newlines too", () => {
        expect(normalizeEmail("\ttest@example.test\n")).toBe("test@example.test");
    });
    
    it("returns an empty string for whitespace only", () => {
        expect(normalizeEmail("   ")).toBe("");
    });
})
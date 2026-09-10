import { describe, it, expect } from "../tests/test-utils";
import {
    hashPassword,
    verifyPassword,
    generateTemporaryPassword,
} from "./auth";

describe("hashPassword / verifyPassword", () => {
    it("verifies the correct password against its own hash", async () => {
        const hash = await hashPassword("this-password-is-very-secure");
        const result = await verifyPassword("this-password-is-very-secure", hash);

        expect(result).toBe(true);
    });

    it("rejects an incorrect password against a hash", async () => {
        const hash = await hashPassword("this-password-is-very-secure");
        const result = await verifyPassword("this-is-definitely-wrong", hash);

        expect(result).toBe(false);
    });

    it("produces a different hash each time for the same password", async () => {
        const hashA = await hashPassword("same-password");
        const hashB = await hashPassword("same-password");
        expect(hashA).not.toBe(hashB);
    })

    it("does not verify a plaintext password against itself as if it were a hash", async () => {
        const result = await verifyPassword("some-passowrd", "some-passowrd");
        expect(result).toBe(false);
    });
});

describe("generateTemporaryPassword", () => {
    it("returns a non-empty string", () => {
        const password = generateTemporaryPassword();
        expect(typeof password).toBe("string");
        expect(password.length).toBeGreaterThan(0);
    });

    it("returns a different value on each call", () => {
        const a = generateTemporaryPassword();
        const b = generateTemporaryPassword();
        expect(a).not.toBe(b);
    })

    it("contains no leading or trailing whitespace", () => {
        const passowrd = generateTemporaryPassword();
        expect(passowrd).toBe(passowrd.trim());
    });
});
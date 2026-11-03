import { describe, expect, it } from "vitest";
import { canSavePassword, canSaveEmail, emailsMatch, showEmailMismatch, isCurrentEmail, showMismatch } from "./account-form";

describe("showMismatch", () => {
    it("stays quiet while the confirmation is empty, matching, or still a correct start", () => {
        expect(showMismatch("night-city", "")).toBe(false);
        expect(showMismatch("night-city", "night-city")).toBe(false);
        expect(showMismatch("night-city", "night-")).toBe(false);
    });

    it("shows once the confirmation can't match", () => {
        expect(showMismatch("night-city", "night-x")).toBe(true);
        expect(showMismatch("night-city", "night-city!")).toBe(true);
        expect(showMismatch("", "night")).toBe(true);
    });
});

describe("emailsMatch", () => {
    it("ignores case and surrounding spaces", () => {
        expect(emailsMatch("Owner@Example.test", " owner@example.test ")).toBe(true);
    });

    it("rejects different or half-typed addresses", () => {
        expect(emailsMatch("owner@example.test", "ownee@exmaple.test")).toBe(false);
        expect(emailsMatch("owner@example.test", "owner@")).toBe(false);
    });
});

describe("showEmailMismatch", () => {
    it("stays quiet while the confirmation is a correct start, in any case", () => {
        expect(showEmailMismatch("owner@example.test", "owner@")).toBe(false);
        expect(showEmailMismatch("owner@example.test", "OWNER@")).toBe(false);
    });

    it("shows once the confirmation can't match", () => {
        expect(showEmailMismatch("owner@exmaple.test", "ownee")).toBe(true);
    });
});

describe("isCurrentEmail", () => {
    it("matches the current address in any case or spacing", () => {
        expect(isCurrentEmail(" Owner@example.test", "owner@example.test")).toBe(true);
    });

    it("is false for a different, partial or blank address", () => {
        expect(isCurrentEmail("new@example.test", "owner@example.test")).toBe(false);
        expect(isCurrentEmail("owner@", "owner@example.test")).toBe(false);
        expect(isCurrentEmail(" ", "owner@example.test")).toBe(false);
    });
});

describe("canSavePassword", () => {
    const base = { currentPassword: "current", newPassword: "new", confirmNewPassword: "new", };
    
    it("allows matching new passwords with the current password", () => {
        expect(canSavePassword(base)).toBe(true);
    });

    it("waits for the current password, a new password and a match", () => {
        expect(canSavePassword({ ...base, currentPassword: "" })).toBe(false);
        expect(canSavePassword({ ...base, newPassword: "", confirmNewPassword: "" })).toBe(false);
        expect(canSavePassword({ ...base, confirmNewPassword: "nex" })).toBe(false);
    });
});

describe("canSaveEmail", () => {
    const base = {
        currentPassword: "current",
        currentEmail: "owner@example.test",
        newEmail: "new@example.test",
        confirmNewEmail: "NEW@example.test", 
    };

    it("allows a matching new address with the current password", () => {
        expect(canSaveEmail(base)).toBe(true);
    });

    it("waits for the current password, a new address and a match", () => {
        expect(canSaveEmail({ ...base, currentPassword: "" })).toBe(false);
        expect(canSaveEmail({ ...base, newEmail: " ", confirmNewEmail: " " })).toBe(false);
        expect(canSaveEmail({ ...base, confirmNewEmail: "nex@example.test" })).toBe(false);
    });

    it("waits when the new address is the current one", () => {
        expect(canSaveEmail({ ...base, newEmail: "owner@example.test", confirmNewEmail: "Owner@example.test" })).toBe(false);
    });
});

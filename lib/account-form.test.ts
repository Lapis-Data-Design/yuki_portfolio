import { describe, expect, it } from "vitest";
import { canSavePassword, canSaveEmail, showEmailMismatch, showMismatch } from "./account-form";

describe("showMismatch", () => {
    it("stays quiet while the confirmation is empty, matching, or still a correct start", () => {
        expect(showMismatch("night-city", "")).toBe(false);
        expect(showMismatch("night-city", "night-city")).toBe(false);
        expect(showMismatch("night-city", "night-")).toBe(false);
    });

    it("shows once the confirmation can't match", () => {
        expect(showMismatch("night-city", "night-x")).toBe(true);
        expect(showMismatch("night-city", "night-city!")).toBe(true);
        expect(showMismatch("night-city", "Night-")).toBe(true);
        expect(showMismatch("", "night")).toBe(true);
    });
});

describe("showEmailMismatch", () => {
    it("stays quiet while the confirmation is a correct start, in any case", () => {
        expect(showEmailMismatch("owner@example.test", "owner@")).toBe(false);
        expect(showEmailMismatch("owner@example.test", "OWNER@")).toBe(false);
    });

    it("shows once the confirmation can't match", () => {
        expect(showEmailMismatch("owner@example.test", "ownee")).toBe(true);
    });
});

describe("canSavePassword", () => {
    const validBase = { 
        currentPassword: "current", 
        newPassword: "new_password", 
        confirmNewPassword: "new_password", 
    };
    
    it("allows matching new passwords with the current password", () => {
        expect(canSavePassword(validBase)).toBe(true);
    });

    it("waits for the current password, a new password and a match", () => {
        expect(canSavePassword({ ...validBase, currentPassword: "" })).toBe(false);
        expect(canSavePassword({ ...validBase, newPassword: "", confirmNewPassword: "" })).toBe(false);
        expect(canSavePassword({ ...validBase, confirmNewPassword: "nex_password" })).toBe(false);
        expect(canSavePassword({ ...validBase, newPassword: "new", confirmNewPassword: "new"})).toBe(false);
    });
});

describe("canSaveEmail", () => {
    const validBase = {
        currentPassword: "current",
        currentEmail: "owner@example.test",
        newEmail: "new@example.test",
        confirmNewEmail: "NEW@example.test", 
    };

    it("allows a matching new address with the current password", () => {
        expect(canSaveEmail(validBase)).toBe(true);
    });

    it("is ready only when there's no problem", () => {
        expect(canSaveEmail({ ...validBase, confirmNewEmail: "Owner@" })).toBe(false);
    });
});

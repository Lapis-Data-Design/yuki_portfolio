import { describe, expect, it } from "vitest";
import {
    CURRENT_PASSWORD_REQUIRED_MESSAGE,
    EMAIL_MISMATCH_MESSAGE,
    PASSWORD_MISMATCH_MESSAGE,
    NEW_EMAIL_REQUIRED_MESSAGE,
    NEW_PASSWORD_REQUIRED_MESSAGE,
    SAME_EMAIL_MESSAGE,
    PASSWORD_TOO_SHORT_MESSAGE,
    accountLockedMessage,
    accountLockedLoggedOutMessage,
    emailChangeProblem,
    passwordChangeProblem,
    isCurrentEmail,
    emailsMatch,
    passwordsMatch
 } from "./account-rules";

describe("emailsMatch", () => {
    it("ignores case and surrounding spaces", () => {
        expect(emailsMatch("Owner@Example.test", " owner@example.test ")).toBe(true);
    });

    it("rejects different or half-typed addresses", () => {
        expect(emailsMatch("owner@example.test", "ownee@example.test")).toBe(false);
        expect(emailsMatch("owner@example.test", "owner@")).toBe(false);
    });
});

describe("passwordsMatch", () => {
    it("compares exactly", () => {
        expect(passwordsMatch("night-city", "night-city")).toBe(true);
        expect(passwordsMatch("night-city", "Night-city")).toBe(false);
        expect(passwordsMatch("night-city", "night-city ")).toBe(false);
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

describe("emailChangeProblem", () => {
    const valid = {
        currentPassword: "current",
        currentEmail: "owner@example.test",
        newEmail: "new@example.test",
        confirmNewEmail: "NEW@example.test", 
    };

    it("is null for a valid change", () => {
        expect(emailChangeProblem(valid)).toBeNull();
    });

    it("names the first problem, in order", () => {
        expect(emailChangeProblem({ ...valid, currentPassword: "" })).toBe(CURRENT_PASSWORD_REQUIRED_MESSAGE);
        expect(emailChangeProblem({ ...valid, newEmail: " ", confirmNewEmail: " " })).toBe(NEW_EMAIL_REQUIRED_MESSAGE);
        expect(emailChangeProblem({ ...valid, confirmNewEmail: "new@" })).toBe(EMAIL_MISMATCH_MESSAGE);
        expect(
            emailChangeProblem({ ...valid, newEmail: "owner@example.test", confirmNewEmail: "owner@example.test" })
        ).toBe(SAME_EMAIL_MESSAGE);
    });
});

describe("passwordChangeProblem", () => {
    const valid = { 
        currentPassword: "current", 
        newPassword: "new_password", 
        confirmNewPassword: "new_password", 
    };

    it("is null for a valid change", () => {
        expect(passwordChangeProblem(valid)).toBeNull();
    });

    it("names the first problem, in order", () => {
        expect(passwordChangeProblem({ ...valid, currentPassword: ""})).toBe(CURRENT_PASSWORD_REQUIRED_MESSAGE);
        expect(passwordChangeProblem({ ...valid, newPassword: "", confirmNewPassword: "" })).toBe(NEW_PASSWORD_REQUIRED_MESSAGE);
        expect(passwordChangeProblem({ ...valid, confirmNewPassword: "new_passwor" })).toBe(PASSWORD_MISMATCH_MESSAGE);
        expect(passwordChangeProblem({ ...valid, newPassword: "new", confirmNewPassword: "new" })).toBe(PASSWORD_TOO_SHORT_MESSAGE);
        expect(passwordChangeProblem({ ...valid, newPassword: "new", confirmNewPassword: "nex" })).toBe(PASSWORD_TOO_SHORT_MESSAGE);
    });

    it("leaves the same-as-current check to the action", () => {
        expect(
            passwordChangeProblem({ currentPassword: "same-password", newPassword: "same-password", confirmNewPassword: "same-password"})
        ).toBeNull();
    });
});

describe("account lockout messages", () => {
    it("says the session ended when the lock starts", () => {
        expect(accountLockedLoggedOutMessage(15)).toBe(
            "Too many attempts. Try again in 15 minutes. You've been logged out."
        );
    });
});
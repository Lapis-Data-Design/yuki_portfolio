import { test, expect, type Page } from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { rewindLoginThrottleForEmail } from "@/tests/helpers/login-throttle";
import { 
    ACCOUNT_FAILURE_LIMIT,
    LOGIN_LOCK_MINUTES,
    lockoutMessage 
} from "@/lib/login-throttle-policy";
import {
    CURRENT_PASSWORD_INCORRECT_MESSAGE,
    accountLockedLoggedOutMessage
} from "@/lib/account-rules";

const ACCOUNT = TEST_ACCOUNTS.accountLockout;
const ACCOUNT_PAGE = "/dashboard/owner/account";
const NEW_PASSWORD = "e2e-account-lockout-new-password";

async function openPasswordTab( page: Page ) {
    await page.goto(ACCOUNT_PAGE, { waitUntil: "networkidle" });
    await page.getByRole("tab", {name: "Password" }).click();
    return page.getByRole("tabpanel");
}

async function submitPassword(page: Page, currentPassword: string) {
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Current password", { exact: true }).fill(currentPassword);
    await panel.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
    await panel.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
    await Promise.all([
        page.waitForResponse(
            (r) => r.request().method() === "POST" && new URL(r.url()).pathname === ACCOUNT_PAGE,
        ),
        panel.getByRole("button", { name: "Save password" }).click(),
    ]);
}

test("account: wrong current passwords lock the check and log out, then it recovers", async ({ page }) => {
    await test.step("wrong current password below the limit are ordinary errors", async () => {
        await login(page, ACCOUNT.email, ACCOUNT.password);
        await expect(page).toHaveURL("/dashboard/owner");
        const panel = await openPasswordTab(page);
        for (let i = 0; i < ACCOUNT_FAILURE_LIMIT - 1; i++) {
            await submitPassword(page, "wrong-password");
            await expect(panel.getByRole("alert")).toHaveText(CURRENT_PASSWORD_INCORRECT_MESSAGE);
        }
    });

    await test.step("the limit locks the check and ends the session", async () => {
        await submitPassword(page, "wrong-password");
        await expect(page.getByRole("tabpanel").getByRole("alert")).toHaveText(
            accountLockedLoggedOutMessage(LOGIN_LOCK_MINUTES),
        );
        await page.goto(ACCOUNT_PAGE);
        await expect(page).toHaveURL(/\/login/);
    });

    await test.step("after logging back in, the correct password is refused while locked", async () => {
        await login(page, ACCOUNT.email, ACCOUNT.password);
        await expect(page).toHaveURL("/dashboard/owner");
        const panel = await openPasswordTab(page);
        await submitPassword(page, ACCOUNT.password);
        await expect(panel.getByRole("alert")).toHaveText(lockoutMessage(LOGIN_LOCK_MINUTES));
    });
    
    await test.step("once the lock runs out, the change saves and the new password logs in", async () => {
        await rewindLoginThrottleForEmail(ACCOUNT.email);
        const panel = await openPasswordTab(page);
        await submitPassword(page, ACCOUNT.password);
        await expect(panel.getByText("Saved.")).toBeVisible();
        await logout(page);
        await login(page, ACCOUNT.email, NEW_PASSWORD);
        await expect(page).toHaveURL("/dashboard/owner");
    });
});
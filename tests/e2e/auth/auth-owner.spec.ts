import { test, expect } from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import { TEST_ACCOUNTS } from "../fixtures/accounts";

const OWNER_TEST_ACCOUNT = TEST_ACCOUNTS.owner;
const NEW_PASSWORD = "e2e-new-password-2";

test("owner: auth flow from temp password to logout", async ({ page }) => {
    await test.step("logs in with temp password and is redirected to change-password", async () => {
        await login(page, OWNER_TEST_ACCOUNT.email, OWNER_TEST_ACCOUNT.password);
        await expect(page).toHaveURL(/\/change-password/);
    });

    await test.step("skip lands on the owner dashboard", async () => {
        await page.getByRole("link", { name: "Skip for now" }).click();
        await expect(page).toHaveURL("/dashboard/owner");
    });

    await test.step(" log out, log back in with temp password -> still change-password (skip didn't clear change password flag)", async () => {
        await logout(page);
        await login(page, OWNER_TEST_ACCOUNT.email, OWNER_TEST_ACCOUNT.password);
        await expect(page).toHaveURL(/\/change-password/);
    });
    
    await test.step("complete change password form -> redirected to owner dashboard", async () => {
        await page
            .getByLabel("Current (temporary) password")
            .fill(OWNER_TEST_ACCOUNT.password);
        await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole("button", { name: "Set password" }).click();
        await expect(page).toHaveURL("/dashboard/owner");
    });
    
    await test.step("still logged in: direct nav to change-password self-redirects away", async () => {
        await page.goto("/change-password");
        await expect(page).toHaveURL("/dashboard/owner");    
    });

    await test.step("log out, log back in with NEW password -> nav straight to dashboard, no detour", async () => {
        await logout(page);
        await login(page, OWNER_TEST_ACCOUNT.email, NEW_PASSWORD);
        await expect(page).toHaveURL("/dashboard/owner");
    });

    await test.step("log out -> nav redirects to login (session actually cleared)", async () => {
        await logout(page);
        await page.goto("/dashboard/owner");
        await expect(page).toHaveURL("/login");
    });
});
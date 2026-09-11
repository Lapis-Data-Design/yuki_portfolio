import { test, expect, type Page } from "@playwright/test";
import { E2E_OWNER_EMAIL, E2E_OWNER_TEMP_PASSWORD } from "../fixtures/accounts";

const NEW_PASSWORD = "e2e-new-password-2";

async function login(page: Page, password: string) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_OWNER_EMAIL);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
}

async function logout(page: Page) {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");
}

test("owner: auth flow from temp password to logout", async ({ page }) => {
    await test.step("logs in with temp password and is redirected to change-password", async () => {
        await login(page, E2E_OWNER_TEMP_PASSWORD);
        await expect(page).toHaveURL(/\/change-password/);
    });

    await test.step("skip lands on the owner dashboard", async () => {
        await page.getByRole("link", { name: "Skip for now" }).click();
        await expect(page).toHaveURL("/dashboard/owner");
    });

    await test.step(" log out, log back in with temp password -> still change-password (skip didn't clear change password flag)", async () => {
        await logout(page);
        await login(page, E2E_OWNER_TEMP_PASSWORD);
        await expect(page).toHaveURL(/\/change-password/);
    });
    
    await test.step("complete change password form -> redirected to owner dashboard", async () => {
        await page
            .getByLabel("Current (temporary) password")
            .fill(E2E_OWNER_TEMP_PASSWORD);
        await page.getByLabel("New password").fill(NEW_PASSWORD);
        await page.getByRole("button", { name: "Set password" }).click();
        await expect(page).toHaveURL("/dashboard/owner");
    });
    
    await test.step("still logged in: direct nav to change-password self-redirects away", async () => {
        await page.goto("/change-password");
        await expect(page).toHaveURL("/dashboard/owner");    
    });

    await test.step("log out, log back in with NEW password -> nav straight to dashboard, no detour", async () => {
        await logout(page);
        await login(page, NEW_PASSWORD);
        await expect(page).toHaveURL("/dashboard/owner");
    });

    await test.step("log out -> nav redirects to login (session actually cleared)", async () => {
        await logout(page);
        await page.goto("/dashboard/owner");
        await expect(page).toHaveURL("/login");
    });
})
import { test, expect} from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import { 
    E2E_ADMIN_JOURNEY_EMAIL,
    E2E_ADMIN_JOURNEY_TEMP_PASSWORD
} from "../fixtures/accounts";

const NEW_PASSWORD = "e2e-admin-new-password";

test("admin: full auth journey from temp password to logout", async ({ page }) => {
    await test.step("logs in with temp password and is redirected to change-password", async () => {
        await login(page, E2E_ADMIN_JOURNEY_EMAIL, E2E_ADMIN_JOURNEY_TEMP_PASSWORD);
        await expect(page).toHaveURL(/\/change-password/);
    });

    await test.step("skip lands on the admin dashboard", async () => {
        await page.getByRole("link", { name: "Skip for now"}).click();
        await expect(page).toHaveURL("/dashboard/admin");
    });

    await test.step("log out, log back in with temp password -> still change-password (skip didn't clear the flag)", async () => {
        await logout(page);
        await login(page, E2E_ADMIN_JOURNEY_EMAIL, E2E_ADMIN_JOURNEY_TEMP_PASSWORD);
        await expect(page).toHaveURL(/\/change-password/);
    });

    await test.step("complete the form -> redirected to admin dashboard", async () => {
        await page
            .getByLabel("Current (temporary) password")
            .fill(E2E_ADMIN_JOURNEY_TEMP_PASSWORD);
        await page.getByLabel("New Password").fill(NEW_PASSWORD);
        await page.getByRole("button", { name: "Set password"}).click();
        await expect(page).toHaveURL("/dashboard/admin");
    });

    await test.step("still logged in: direct nav to change-password self-redirects away", async () => {
        await page.goto("/change-password");
        await expect(page).toHaveURL("/dashboard/admin");
    });

    await test.step("log out, log back in with the NEW password -> straight to dashboard, no detour", async () => {
        await logout(page);
        await login(page, E2E_ADMIN_JOURNEY_EMAIL, NEW_PASSWORD);
        await expect(page).toHaveURL("/dashboard/admin");

    });

    await test.step("log out -> direct nav to dashboard redirects to login (session actually cleared", async () => {
        await logout(page);
        await page.goto("/dashboard/admin");
        await expect(page).toHaveURL("/login");
    });
})

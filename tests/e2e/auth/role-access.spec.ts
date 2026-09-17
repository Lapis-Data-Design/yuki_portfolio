import { test, expect, type Page } from "@playwright/test";
import { 
    E2E_ROLE_TEST_OWNER_EMAIL,
    E2E_ROLE_TEST_OWNER_PASSWORD,
    E2E_ADMIN_EMAIL,
    E2E_ADMIN_PASSWORD
} from "../fixtures/accounts";
import { login } from "../fixtures/auth-actions";

test.fixme("owner is blocked from the admin dashbaord", async ({ page }) => {
    await login(page, E2E_ROLE_TEST_OWNER_EMAIL, E2E_ROLE_TEST_OWNER_PASSWORD);
    await expect(page).toHaveURL("/dashboard/owner");

    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL("/unauthorized");
});

test.fixme("admin can access the owner dashboard", async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD);
    await expect(page).toHaveURL("/dashboard/owner");

    await page.goto("/dashboard/owner");
    await expect(page).toHaveURL("/dashboard/owner");
    await expect(page.getByText(E2E_ADMIN_EMAIL)).toBeVisible(); 
})
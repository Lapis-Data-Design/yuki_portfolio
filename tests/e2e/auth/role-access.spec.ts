import { test, expect } from "@playwright/test";
import { 
    E2E_ROLE_TEST_OWNER_EMAIL,
    E2E_ROLE_TEST_OWNER_PASSWORD,
    E2E_ADMIN_EMAIL,
    E2E_ADMIN_TEMP_PASSWORD
} from "../fixtures/accounts";
import { login } from "../fixtures/auth-actions";

test("owner is blocked from the admin dashboard", async ({ page }) => {
    await login(page, E2E_ROLE_TEST_OWNER_EMAIL, E2E_ROLE_TEST_OWNER_PASSWORD);
    await expect(page).toHaveURL("/dashboard/owner");

    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL("/unauthorized");
});

test("admin can access the owner dashboard", async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_TEMP_PASSWORD);
    await expect(page).toHaveURL("/dashboard/admin");

    await page.goto("/dashboard/owner");
    await expect(page).toHaveURL("/dashboard/owner");
    await expect(page.getByText(E2E_ADMIN_EMAIL)).toBeVisible(); 
})
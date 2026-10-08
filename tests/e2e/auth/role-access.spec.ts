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
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();

    // The way out leads back to the owner's own dashboard, not a dead end.
    await page.getByRole("link", { name: "Back to your dashboard" }).click();
    await expect(page).toHaveURL("/dashboard/owner");
});

test("admin can access the owner dashboard", async ({ page }) => {
    await login(page, E2E_ADMIN_EMAIL, E2E_ADMIN_TEMP_PASSWORD);
    await expect(page).toHaveURL("/dashboard/admin");

    await page.goto("/dashboard/owner");
    await expect(page).toHaveURL("/dashboard/owner");
    await expect(page.getByText(E2E_ADMIN_EMAIL)).toBeVisible(); 
});

test("logged-out visitor on /unauthorized is pointed to login", async ({ page }) => {
    await page.goto("/unauthorized");
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();

    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
});
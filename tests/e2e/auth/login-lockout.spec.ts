import { test, expect } from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import {
    E2E_OWNER_LOCKOUT_EMAIL,
    E2E_OWNER_LOCKOUT_PASSWORD,
    E2E_ADMIN_LOCKOUT_EMAIL,
    E2E_ADMIN_LOCKOUT_PASSWORD,
} from "../fixtures/accounts";
import { rewindLoginThrottleForEmail } from "@/tests/helpers/login-throttle";
import {
    EMAIL_FAILURE_LIMIT,
    INVALID_CREDENTIALS_MESSAGE,
} from "@/lib/login-throttle-policy";

const WRONG_PASSWORD = "definitely-not-the-password";
const LOCKOUT_MESSAGE = /^Too many attempts\. Try again in \d+ minutes?\.$/;

const ACCOUNTS = [
    {
        role: "owner",
        email: E2E_OWNER_LOCKOUT_EMAIL,
        password: E2E_OWNER_LOCKOUT_PASSWORD,
        dashboard: "/dashboard/owner",
    },
    {
        role: "admin",
        email: E2E_ADMIN_LOCKOUT_EMAIL,
        password: E2E_ADMIN_LOCKOUT_PASSWORD,
        dashboard: "/dashboard/admin",
    },
] as const;

for (const account of ACCOUNTS) {
    test(`${account.role}: locked out after ${EMAIL_FAILURE_LIMIT} failures, the recovers`, async ({ page }) => {
        await test.step(`${EMAIL_FAILURE_LIMIT - 1} wrong passwords show the normal error`, async () => {
            for (let attempt = 1; attempt < EMAIL_FAILURE_LIMIT - 1; attempt++) {
                await login(page, account.email, WRONG_PASSWORD);
                await expect(page.getByText(INVALID_CREDENTIALS_MESSAGE)).toBeVisible();
            }
        });

        await test.step(`wrong password number ${EMAIL_FAILURE_LIMIT} locks the account`, async () => {
            await login(page, account.email, WRONG_PASSWORD);
            await expect(page.getByText(LOCKOUT_MESSAGE)).toBeVisible();
            await expect(page).toHaveURL("/login");
        });

        await test.step("the correct password is refused while locked", async () => {
            await login(page, account.email, account.password);
            await expect(page.getByText(LOCKOUT_MESSAGE)).toBeVisible();
            await expect(page).toHaveURL("/login");
        });

        await test.step("once the lock runs out, the correct password logs in", async () => {
            await rewindLoginThrottleForEmail(account.email);
            await login(page, account.email, account.password);
            await expect(page).toHaveURL(account.dashboard);
        });

        await test.step("the successful login resets the count: one wrong password is a normal error", async () => {
            await logout(page);
            await login(page, account.email, WRONG_PASSWORD);
            await expect(page.getByText(INVALID_CREDENTIALS_MESSAGE)).toBeVisible();
        });
    })
}
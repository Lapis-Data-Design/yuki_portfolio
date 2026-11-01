import { test, expect } from "@playwright/test";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { 
    SESSION_COOKIE_NAME,
    createExpiredSession,
    sessionExists
 } from "@/tests/helpers/sessions";

 const EXPIRED_SESSION_TEST_ACCOUNT = TEST_ACCOUNTS.expiredSession;

 test("expired session cookie redirects to login instead of crashing", async ({ page, context, baseURL }) => {
    const token = await createExpiredSession(EXPIRED_SESSION_TEST_ACCOUNT.email);

    await context.addCookies([
        {
            name: SESSION_COOKIE_NAME,
            value: token,
            url: baseURL,
            expires: Math.floor(Date.now() / 1000) + 60 * 60,
            httpOnly: true,
            sameSite: "Lax",
        },
    ]);

    await page.goto("/dashboard/owner");
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();

    expect(await sessionExists(token)).toBe(false);
 })
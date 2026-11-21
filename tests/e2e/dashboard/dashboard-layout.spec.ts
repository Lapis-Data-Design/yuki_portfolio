import { test, expect, type Locator, type Page } from "@playwright/test";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { login } from "../fixtures/auth-actions";

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

const DASHBOARDS = [
  {  name: "owner", account: TEST_ACCOUNTS.dashboardLayoutOwner, url: /\/dashboard\/owner$/ },
  {  name: "admin", account: TEST_ACCOUNTS.dashboardLayoutAdmin, url: /\/dashboard\/admin$/ },
] as const;

async function box(locator: Locator) {
    const b = await locator.boundingBox();
    if (!b) throw new Error("element has no bounding box (is it hidden?)");
    return b;
}

async function navAndMain(page: Page) {
    return {
        nav: await box(page.getByRole("navigation")),
        main: await box(page.getByRole("main")),
    };
}

for (const dashboard of DASHBOARDS) {
    test.describe(`${dashboard.name} dashboard layout`, () => {
        test.beforeEach(async ({ page }) => {
            await login(page, dashboard.account.email, dashboard.account.password);
            await expect(page).toHaveURL(dashboard.url);
        });

        test.describe("on a phone", () => {
            test.use({ viewport: PHONE });

            test("puts the nav above the content, which uses the full width", async ({ page }) => {
                const { nav, main } = await navAndMain(page);

                expect(nav.y + nav.height).toBeLessThanOrEqual(main.y);
                expect(main.width).toBeGreaterThan(PHONE.width * 0.9);
            });

            test("the page doesn't scroll sideways", async ({ page }) => {
                const pageOverflow = await page.evaluate(
                    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
                );
                expect(pageOverflow).toBeLessThanOrEqual(0);
            });
        });

        test.describe("on a desktop", () => {
            test.use({ viewport: DESKTOP });

            test("keeps the nav in a left sidebar beside the content", async ({ page }) => {
                const { nav, main } = await navAndMain(page);

                expect(nav.x + nav.width).toBeLessThanOrEqual(main.x);
            });
        });
    });
}
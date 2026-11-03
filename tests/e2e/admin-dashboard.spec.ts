import { expect, test } from "@playwright/test";

test.describe("SCENTS & MISTS Admin Dashboard Protection", () => {
  test("redirects unauthenticated visitors from /admin to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("protects /admin/enquiries and /admin/analytics from unauthenticated access", async ({
    page,
  }) => {
    await page.goto("/admin/enquiries");
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto("/admin/analytics");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});


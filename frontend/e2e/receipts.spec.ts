import { test, expect } from "@playwright/test";

test.describe("Receipts flow", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("receipts redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/receipts");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("dashboard redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });
});

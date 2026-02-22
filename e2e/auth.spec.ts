import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
  });

  test("login page has password field and submit button", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const pwInput = page.locator('input[type="password"]');
    await expect(pwInput).toBeVisible({ timeout: 10_000 });
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test("register page shows restricted access message", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/acceso restringido/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("auth pages have decorative gradient background", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const authPage = page.locator(".auth-page");
    await expect(authPage).toBeVisible({ timeout: 10_000 });
    const orbs = page.locator(".auth-orb");
    await expect(orbs).toHaveCount(3);
  });

  test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows NOMOS brand and login button", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /nomos/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("shows restricted access notice", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/acceso restringido/i),
    ).toBeVisible();
  });

  test("login link navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

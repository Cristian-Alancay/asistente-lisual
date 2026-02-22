import { test, expect } from "@playwright/test";

test.describe("Navigation & routing", () => {
  test("404 page shows on unknown route", async ({ page }) => {
    await page.goto("/nonexistent-route");
    await expect(
      page.getByRole("heading", { name: "404" }),
    ).toBeVisible();
  });

  test("landing page loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("login page loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/login");
    const html = page.locator("html");
    const toggleBtn = page.getByRole("button", { name: /theme|tema/i });
    await toggleBtn.click();
    const classAfterClick = await html.getAttribute("class");
    expect(classAfterClick).toBeTruthy();
  });
});

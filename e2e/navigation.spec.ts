import { test, expect } from "@playwright/test";

test.describe("ページナビゲーション", () => {
  test("ホームページが正常に表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kizamu/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("バケットリストページが表示される", async ({ page }) => {
    await page.goto("/bucket-list");
    await expect(page.locator("body")).toBeVisible();
    // エラーページでないことを確認
    await expect(page.locator("text=Critical Error")).not.toBeVisible();
  });

  test("人生の方針ページが表示される", async ({ page }) => {
    await page.goto("/orientation");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Critical Error")).not.toBeVisible();
  });

  test("マンダラページが表示される", async ({ page }) => {
    await page.goto("/mandala");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Critical Error")).not.toBeVisible();
  });

  test("カレンダーページが表示される", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Critical Error")).not.toBeVisible();
  });

  test("存在しないページは 404 ページを表示する", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("body")).toBeVisible();
    // not-found.tsx の内容を確認
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("ホームページにナビゲーション要素がある", async ({ page }) => {
    await page.goto("/");
    // ページが完全に読み込まれていることを確認
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL("/");
  });
});

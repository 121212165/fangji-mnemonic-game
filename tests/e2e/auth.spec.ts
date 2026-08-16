import { test, expect } from "@playwright/test";
import { makeTestUser, registerUser, loginUser } from "./helpers";

test.describe("认证流程", () => {
  test("注册新用户 → 自动登录 → 首页可见已登录导航", async ({ page }) => {
    const user = await registerUser(page);

    // 首页应显示已登录的导航（包含「分类」「搜索」等入口）
    await expect(page.getByRole("link", { name: /分类/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /搜索/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /设置/ })).toBeVisible();
  });

  test("退出登录后显示登录/注册按钮", async ({ page }) => {
    await registerUser(page);

    // 点击设置页找到退出按钮
    await page.goto("/settings");
    await page.getByRole("button", { name: /退出登录/ }).click();

    // 回到未登录状态
    await expect(page.getByRole("link", { name: "登录" })).toBeVisible();
    await expect(page.getByRole("link", { name: "注册" })).toBeVisible();
  });

  test("已注册用户可重新登录", async ({ page }) => {
    const user = makeTestUser();

    // 第一次注册
    await registerUser(page, user);

    // 退出
    await page.goto("/settings");
    await page.getByRole("button", { name: /退出登录/ }).click();

    // 重新登录
    await loginUser(page, user);
    await expect(page.getByRole("link", { name: /分类/ })).toBeVisible();
  });

  test("弱密码注册被拒", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByLabel("昵称").fill("弱密码用户");
    await page.getByLabel("邮箱").fill(`weak-${Date.now()}@test.com`);
    await page.getByLabel("密码").fill("123456");
    await page.locator("input[type='checkbox']").check();
    await page.getByRole("button", { name: "注册并登录" }).click();

    // 应显示错误提示（密码需至少 8 位 + 字母 + 数字）
    await expect(page.locator(".text-destructive")).toBeVisible({ timeout: 5_000 });
    // 仍在注册页
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("错误密码登录失败", async ({ page }) => {
    const user = makeTestUser();
    await registerUser(page, user);

    await page.goto("/settings");
    await page.getByRole("button", { name: /退出登录/ }).click();

    // 用错误密码登录
    await page.goto("/auth/login");
    await page.getByLabel("邮箱").fill(user.email);
    await page.getByLabel("密码").fill("WrongPass999");
    await page.getByRole("button", { name: "登录" }).click();

    await expect(page.locator(".text-destructive")).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

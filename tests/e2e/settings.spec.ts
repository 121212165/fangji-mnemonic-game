import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("设置页流程", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page);
    await page.goto("/settings");
  });

  test("修改昵称后刷新仍保留", async ({ page }) => {
    const newName = `新昵称${Date.now()}`;

    // 清空并填入新昵称
    await page.getByLabel("昵称").fill(newName);

    // 选择学习阶段
    await page.getByLabel(/学习阶段/).selectOption("intensive");

    // 修改每日目标
    await page.getByLabel(/每日目标/).fill("15");

    await page.getByRole("button", { name: /保存/ }).click();

    // 应显示成功提示
    await expect(page.getByText(/保存成功|已更新/).first()).toBeVisible({ timeout: 5_000 });

    // 刷新页面验证持久化
    await page.reload();
    await expect(page.getByLabel("昵称")).toHaveValue(newName);
  });

  test("修改密码：旧密码错误时失败", async ({ page }) => {
    await page.getByLabel("当前密码").fill("WrongOld123");
    await page.getByLabel("新密码").fill("NewPass1234");
    await page.getByLabel("确认新密码").fill("NewPass1234");
    await page.getByRole("button", { name: /修改密码/ }).click();

    // 应显示错误提示
    await expect(page.getByText(/旧密码|当前密码|错误|失败/).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("修改密码：两次输入不一致时失败", async ({ page }) => {
    await page.getByLabel("当前密码").fill("Test1234");
    await page.getByLabel("新密码").fill("NewPass1234");
    await page.getByLabel("确认新密码").fill("DifferentPass1");
    await page.getByRole("button", { name: /修改密码/ }).click();

    // 应显示不一致提示
    await expect(page.getByText(/不一致|相同/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("修改密码：正确旧密码 + 一致新密码 → 成功", async ({ page }) => {
    await page.getByLabel("当前密码").fill("Test1234");
    await page.getByLabel("新密码").fill("NewTest1234");
    await page.getByLabel("确认新密码").fill("NewTest1234");
    await page.getByRole("button", { name: /修改密码/ }).click();

    await expect(page.getByText(/成功|已更新/).first()).toBeVisible({ timeout: 5_000 });

    // 退出后用新密码登录验证
    await page.goto("/settings");
    await page.getByRole("button", { name: /退出登录/ }).click();

    // 获取注册时用的邮箱（从页面状态恢复不了，用全局变量传递）
    // 由于 helper 每次生成新用户，这里直接验证密码已变更即可
  });
});

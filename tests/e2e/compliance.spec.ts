import { test, expect } from "@playwright/test";

test.describe("合规页面可访问性", () => {
  test("用户协议页可访问", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByText(/用户协议|服务条款/).first()).toBeVisible();
    // 关键章节存在
    await expect(page.getByText(/免责声明|知识产权|服务变更/).first()).toBeVisible();
  });

  test("隐私政策页可访问", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText(/隐私政策/).first()).toBeVisible();
    // 关键章节存在
    await expect(page.getByText(/信息收集|数据使用|用户权利|存储/).first()).toBeVisible();
  });

  test("反馈页可访问且能提交", async ({ page }) => {
    await page.goto("/feedback");
    await expect(page.getByText(/反馈|建议/).first()).toBeVisible();

    // 填写反馈内容
    const textarea = page.locator("textarea").first();
    await textarea.fill("E2E 测试反馈内容，这是一条自动化测试提交的反馈。");

    // 可选填写邮箱
    const emailInput = page.getByPlaceholder(/邮箱/);
    if (await emailInput.isVisible()) {
      await emailInput.fill("e2e@test.com");
    }

    // 提交
    await page.getByRole("button", { name: /提交|发送/ }).click();

    // 应显示成功提示或跳转
    await expect(page.getByText(/感谢|成功|已提交/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("footer 显示协议链接与备案信息占位", async ({ page }) => {
    await page.goto("/");
    // footer 中的协议链接
    await expect(page.getByRole("link", { name: "用户协议" })).toBeVisible();
    await expect(page.getByRole("link", { name: "隐私政策" })).toBeVisible();
    await expect(page.getByRole("link", { name: "反馈建议" })).toBeVisible();
    // 免责声明
    await expect(page.getByText(/仅供学习交流/)).toBeVisible();
  });

  test("404 页面显示自定义提示", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText(/404|找不到|不存在/).first()).toBeVisible({ timeout: 5_000 });
  });
});

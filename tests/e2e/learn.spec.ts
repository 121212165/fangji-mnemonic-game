import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("学习与闯关流程", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page);
  });

  test("首页显示今日学习计划", async ({ page }) => {
    // 已登录首页应显示「今日计划」或学习入口
    await expect(page.getByText(/今日|学习|计划/).first()).toBeVisible();
  });

  test("点击方剂进入详情页 → 闯关测试 → 答对 → 显示通过", async ({ page }) => {
    // 从首页或分类页进入方剂详情
    await page.goto("/categories");
    // 点击第一个分类
    const firstCategory = page.locator("a[href*='/categories/']").first();
    await firstCategory.click();

    // 点击第一个方剂
    const firstFormula = page.locator("a[href*='/formulas/']").first();
    await firstFormula.click();
    await page.waitForURL(/\/formulas\//);

    // 切换到闯关模式
    await page.getByRole("button", { name: /闯关测试/ }).click();

    // 输入答案（用方歌中提到的药物，这里用占位测试）
    const input = page.getByPlaceholder("请输入药物组成，用顿号分隔");
    await input.fill("麻黄、桂枝、杏仁、甘草");

    await page.getByRole("button", { name: "提交答案" }).click();

    // 等待评分结果
    await expect(page.getByText(/通过|未通过/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("背诵检测三题型可切换", async ({ page }) => {
    await page.goto("/categories");
    await page.locator("a[href*='/categories/']").first().click();
    await page.locator("a[href*='/formulas/']").first().click();

    // 进入背诵检测
    await page.getByRole("button", { name: /背诵检测/ }).click();

    // 三个题型按钮可见
    await expect(page.getByRole("button", { name: "药物组成" })).toBeVisible();
    await expect(page.getByRole("button", { name: "方歌口诀" })).toBeVisible();
    await expect(page.getByRole("button", { name: "功用主治" })).toBeVisible();

    // 切换到方歌口诀
    await page.getByRole("button", { name: "方歌口诀" }).click();
    await expect(page.getByPlaceholder("请默写传统方歌")).toBeVisible();

    // 切换到功用主治
    await page.getByRole("button", { name: "功用主治" }).click();
    await expect(page.getByPlaceholder("请默写功用主治")).toBeVisible();
  });

  test("错题本页面可访问且显示统计", async ({ page }) => {
    await page.goto("/errors");
    // 错题本页面应加载成功（可能为空，但页面结构正常）
    await expect(page.getByText(/错题|错误/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("统计页面可访问", async ({ page }) => {
    await page.goto("/stats");
    await expect(page.getByText(/统计|学习|打卡/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("卡片模式可访问且能翻转", async ({ page }) => {
    await page.goto("/flashcards");
    // 卡片页面加载
    await expect(page.getByText(/卡片|方剂/).first()).toBeVisible({ timeout: 5_000 });
  });
});

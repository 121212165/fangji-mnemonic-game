import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 测试配置
 *
 * 运行方式：
 * - npx playwright test              # 运行所有 E2E 测试
 * - npx playwright test --headed     # 有头模式（可视化调试）
 * - npx playwright test --ui         # UI 模式（时间旅行调试）
 * - npx playwright test auth.spec.ts # 运行指定文件
 * - npx playwright show-report       # 查看测试报告
 *
 * 前置条件：
 * - 本地 dev server 运行在 http://localhost:3000
 * - 或设置 BASE_URL 环境变量指向测试环境
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // 串行执行，避免测试间数据竞争
  forbidOnly: !!process.env.CI, // CI 中禁止 .only
  retries: process.env.CI ? 1 : 0, // CI 失败重试 1 次
  workers: 1, // 单 worker，共享同一浏览器上下文
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  timeout: 30_000, // 单测超时 30 秒
  expect: { timeout: 5_000 },

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry", // 首次重试时记录 trace
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    // CSRF：Playwright 发起的请求 Origin 为 baseURL，能通过 middleware 校验
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // 移动端测试（可选，按需启用）
    // {
    //   name: "mobile-chrome",
    //   use: { ...devices["Pixel 7"] },
    // },
  ],

  // 自动启动 dev server（仅在未设置 BASE_URL 时）
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI, // 本地复用已运行的 server
        timeout: 60_000,
        env: {
          // E2E 测试用独立测试库，避免污染开发数据
          DATABASE_URL: process.env.E2E_DATABASE_URL ?? "",
          NEXTAUTH_SECRET: "e2e-test-secret-please-change",
          NEXTAUTH_URL: "http://localhost:3000",
          NEXT_PUBLIC_APP_URL: "http://localhost:3000",
          CRON_SECRET: "e2e-cron-secret",
        },
      },
});

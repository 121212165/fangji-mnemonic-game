/**
 * E2E 测试辅助函数
 *
 * 提供注册/登录的公共流程，避免每个 spec 重复代码。
 * 使用时间戳生成唯一邮箱，确保测试间数据隔离。
 */

/** 生成唯一测试用户 */
export function makeTestUser() {
  const ts = Date.now();
  return {
    name: `测试用户${ts}`,
    email: `e2e-${ts}@test.com`,
    password: "Test1234",
  };
}

/** 通过 UI 注册新用户 */
export async function registerUser(page: import("@playwright/test").Page, user = makeTestUser()) {
  await page.goto("/auth/register");
  await page.getByLabel("昵称").fill(user.name);
  await page.getByLabel("邮箱").fill(user.email);
  await page.getByLabel("密码").fill(user.password);
  // 勾选协议复选框（label 包裹的 input）
  await page.locator("input[type='checkbox']").check();
  await page.getByRole("button", { name: "注册并登录" }).click();
  // 注册成功后跳转到首页
  await page.waitForURL("/", { timeout: 10_000 });
  return user;
}

/** 通过 UI 登录已有用户 */
export async function loginUser(
  page: import("@playwright/test").Page,
  user: { email: string; password: string }
) {
  await page.goto("/auth/login");
  await page.getByLabel("邮箱").fill(user.email);
  await page.getByLabel("密码").fill(user.password);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL("/", { timeout: 10_000 });
}

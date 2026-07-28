// AI 每日推荐 API 单元测试
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// mock DeepSeek
vi.mock("@/lib/deepseek", () => ({
  callDeepSeekJson: vi.fn(),
  isDeepSeekConfigured: vi.fn(() => false),
}));

import { POST } from "@/app/api/ai/daily-recommend/route";
import { getServerSession } from "next-auth";
import * as dbModule from "@/lib/db";
import { isDeepSeekConfigured, callDeepSeekJson } from "@/lib/deepseek";

const tables = (dbModule as unknown as { __tables: Record<string, Map<string, any>> }).__tables;

function resetDb() {
  if (!tables) return;
  for (const m of Object.values(tables)) m.clear();
}

function mockSession(userId: string | null) {
  vi.mocked(getServerSession).mockResolvedValue(
    userId
      ? ({
          user: { id: userId, email: "test@example.com" },
          expires: "2099-01-01",
        } as any)
      : (null as any)
  );
}

function setupUser(id: string) {
  tables.user.set(id, {
    id,
    email: `${id}@example.com`,
    name: id,
    passwordHash: "x",
    studyStage: "newbie",
    dailyGoal: 10,
  });
}

function setupFormula(id: string, name: string, level = "一类方") {
  tables.formula.set(id, {
    id,
    name,
    source: "",
    alias: "[]",
    categoryId: 1,
    mnemonic: "",
    mnemonicExplanation: "",
    traditionalMnemonic: "",
    traditionalMnemonicExplanation: "",
    ingredients: "[]",
    functions: "",
    indications: "",
    trigger: "",
    level,
    sortOrder: 0,
  });
}

function makeReq(body: any, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/ai/daily-recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetDb();
  vi.clearAllMocks();
  vi.mocked(isDeepSeekConfigured).mockReturnValue(false);
  mockSession("user-1");
  setupUser("user-1");
  // 准备 15 个一类方
  for (let i = 1; i <= 15; i++) {
    setupFormula(`f${i}`, `方剂${i}`, "一类方");
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/ai/daily-recommend", () => {
  it("未登录返回 401", async () => {
    mockSession(null);
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it("为其他用户生成时无 CRON_SECRET 返回 403", async () => {
    const res = await POST(makeReq({ userId: "other-user" }));
    expect(res.status).toBe(403);
  });

  it("带 CRON_SECRET 时可为其他用户生成", async () => {
    setupUser("other-user");
    const res = await POST(
      makeReq(
        { userId: "other-user" },
        { Authorization: `Bearer ${process.env.CRON_SECRET}` }
      )
    );
    expect(res.status).toBe(200);
  });

  it("DEEPSEEK_API_KEY 未配置时降级到 fallback plan", async () => {
    vi.mocked(isDeepSeekConfigured).mockReturnValue(false);
    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.degraded).toBe(true);
    expect(data.plan).toBeDefined();
    expect(data.reason).toContain("DEEPSEEK_API_KEY");
  });

  it("DeepSeek 调用成功时返回 AI 推荐的 plan", async () => {
    vi.mocked(isDeepSeekConfigured).mockReturnValue(true);
    vi.mocked(callDeepSeekJson).mockResolvedValue({
      recommendations: [
        { formulaId: "f1", reason: "新方剂入门", type: "new" },
        { formulaId: "f2", reason: "高频考点", type: "new" },
        { formulaId: "f3", reason: "易混对比", type: "new" },
        { formulaId: "f4", reason: "类别补全", type: "new" },
      ],
    });

    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.aiGenerated).toBe(true);
    expect(data.plan.recommendedFormulas).toContain("f1");
    expect(data.plan.newCount).toBeGreaterThan(0);
  });

  it("AI 返回不足 10 条时用 fallback 补齐", async () => {
    vi.mocked(isDeepSeekConfigured).mockReturnValue(true);
    vi.mocked(callDeepSeekJson).mockResolvedValue({
      recommendations: [
        { formulaId: "f1", reason: "AI 推荐 1", type: "new" },
      ],
    });

    const res = await POST(makeReq({}));
    const data = await res.json();
    const items = JSON.parse(data.plan.recommendedFormulas);
    expect(items.length).toBe(10);
    // 第一条是 AI 推荐的
    expect(items[0].reason).toBe("AI 推荐 1");
  });

  it("AI 返回非法 formulaId 时被过滤", async () => {
    vi.mocked(isDeepSeekConfigured).mockReturnValue(true);
    vi.mocked(callDeepSeekJson).mockResolvedValue({
      recommendations: [
        { formulaId: "invalid-id", reason: "不存在的", type: "new" },
        { formulaId: "f1", reason: "有效的", type: "new" },
      ],
    });

    const res = await POST(makeReq({}));
    const data = await res.json();
    const items = JSON.parse(data.plan.recommendedFormulas);
    expect(items.find((i: any) => i.formulaId === "invalid-id")).toBeUndefined();
    expect(items.find((i: any) => i.formulaId === "f1")).toBeDefined();
  });

  it("AI 调用抛错时降级到 fallback", async () => {
    vi.mocked(isDeepSeekConfigured).mockReturnValue(true);
    vi.mocked(callDeepSeekJson).mockRejectedValue(new Error("network error"));

    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.degraded).toBe(true);
    expect(data.plan).toBeDefined();
  });

  it("今日 plan 已存在时直接返回 cached", async () => {
    // 预先插入一条今日 plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    tables.dailyPlan.set("plan-1", {
      id: 1,
      userId: "user-1",
      planDate: today,
      recommendedFormulas: JSON.stringify([
        { formulaId: "f1", formulaName: "方剂1", reason: "test", type: "new" },
      ]),
      newCount: 1,
      reviewCount: 0,
      completedCount: 0,
      isCompleted: false,
    });

    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cached).toBe(true);
  });
});

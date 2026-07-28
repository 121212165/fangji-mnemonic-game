// /api/today-plan/* 路由单元测试
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GET as getTodayPlan } from "@/app/api/today-plan/route";
import { POST as completePlan } from "@/app/api/today-plan/complete/route";
import { GET as getNext } from "@/app/api/today-plan/next/route";
import { getServerSession } from "next-auth";
import * as dbModule from "@/lib/db";

// __tables 是 setup.ts mock 暴露的内部状态
// 用 Map<any, any> 是因为 dailyPlan 主键在 Prisma 是 Int，
// 测试里用 number 作 key 与 id 字段保持一致，便于 update 通过 where.id 命中记录
const tables = (dbModule as any).__tables as Record<string, Map<any, any>>;

function resetDb() {
  if (!tables) return;
  for (const m of Object.values(tables)) m.clear();
}

function mockSession(user: { id: string } | null) {
  vi.mocked(getServerSession).mockResolvedValue(
    user ? ({ user } as any) : (null as any)
  );
}

/** 当天 0 点 */
function today(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function seedFormula(id: string, name: string, level = "一类方", sortOrder = 0) {
  const f = {
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
    sortOrder,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tables.formula.set(f.id, f);
  return f;
}

/** 直接在 mock db 里塞今日 plan 记录 */
function seedDailyPlan(
  userId: string,
  items: any[],
  overrides: Partial<Record<string, any>> = {}
) {
  const t = today();
  const plan = {
    id: 1,
    userId,
    planDate: t,
    recommendedFormulas: JSON.stringify(items),
    newCount: items.filter((i) => i.type === "new").length,
    reviewCount: items.filter((i) => i.type === "review").length,
    completedCount: 0,
    isCompleted: false,
    createdAt: new Date(),
    ...overrides,
  };
  // 用数字 id 同时作为 key 与字段，匹配 Prisma Int 主键
  tables.dailyPlan.set(plan.id, plan);
  return plan;
}

function makeCompleteRequest(body: any): Request {
  return new Request("http://localhost/api/today-plan/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetDb();
  mockSession(null);
});

describe("GET /api/today-plan 鉴权", () => {
  it("未登录返回 401", async () => {
    mockSession(null);
    const res = await getTodayPlan();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("session 缺少 id 时返回 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any);
    const res = await getTodayPlan();
    expect(res.status).toBe(401);
  });
});

describe("GET /api/today-plan 已登录", () => {
  beforeEach(() => mockSession({ id: "u1" }));

  it("今日 plan 已存在时直接返回（不再生成）", async () => {
    seedDailyPlan("u1", [
      { formulaId: "f1", formulaName: "麻黄汤", reason: "新方剂", type: "new" },
      { formulaId: "f2", formulaName: "桂枝汤", reason: "FSRS 到期复习", type: "review" },
    ]);

    const res = await getTodayPlan();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBeTruthy();
    expect(body.plan.recommendedFormulas).toHaveLength(2);
    expect(body.plan.recommendedFormulas[0].formulaId).toBe("f1");
    expect(body.plan.recommendedFormulas[1].formulaId).toBe("f2");
    expect(body.plan.newCount).toBe(1);
    expect(body.plan.reviewCount).toBe(1);
    // 不会重复创建 plan
    expect([...tables.dailyPlan.values()]).toHaveLength(1);
  });

  it("今日 plan 不存在时自动生成（无 mastery 时取 10 个新方剂）", async () => {
    // 准备 10 个一类方
    for (let i = 1; i <= 10; i++) {
      seedFormula(`f${i}`, `方剂${i}`, "一类方", i);
    }

    const res = await getTodayPlan();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBeTruthy();
    expect(body.plan.recommendedFormulas).toHaveLength(10);
    expect(body.plan.newCount).toBe(10);
    expect(body.plan.reviewCount).toBe(0);
    expect(body.plan.completedCount).toBe(0);
    expect(body.plan.isCompleted).toBe(false);
    // 全部都是 new 类型
    expect(body.plan.recommendedFormulas.every((i: any) => i.type === "new")).toBe(true);
    // 已写入数据库
    expect([...tables.dailyPlan.values()]).toHaveLength(1);
    const stored = [...tables.dailyPlan.values()][0];
    expect(stored.userId).toBe("u1");
    expect(stored.newCount).toBe(10);
  });

  it("今日 plan 不存在且有到期 mastery 时混合复习+新方", async () => {
    // 1 首到期复习
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() - 1);
    tables.userMastery.set("m1", {
      id: 1,
      userId: "u1",
      formulaId: "due1",
      stability: 1,
      difficulty: 5,
      retrievability: 0.5,
      lastReview: new Date(),
      dueDate,
      reviewCount: 1,
      lapseCount: 0,
      lastRating: "good",
      formula: { id: "due1", name: "到期方", level: "一类方" },
    });
    // 9 首新方候选
    for (let i = 1; i <= 9; i++) {
      seedFormula(`new${i}`, `新方${i}`, "一类方", i);
    }

    const res = await getTodayPlan();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBeTruthy();
    expect(body.plan.recommendedFormulas).toHaveLength(10);
    expect(body.plan.reviewCount).toBe(1);
    expect(body.plan.newCount).toBe(9);
    const review = body.plan.recommendedFormulas.find((i: any) => i.type === "review");
    expect(review?.formulaName).toBe("到期方");
  });
});

describe("POST /api/today-plan/complete 鉴权与参数", () => {
  beforeEach(() => mockSession({ id: "u1" }));

  it("未登录返回 401", async () => {
    mockSession(null);
    const res = await completePlan(
      makeCompleteRequest({ formulaId: "f1" })
    );
    expect(res.status).toBe(401);
  });

  it("缺少 formulaId 返回 400", async () => {
    const res = await completePlan(makeCompleteRequest({}));
    expect(res.status).toBe(400);
  });

  it("今日 plan 不存在返回 404", async () => {
    const res = await completePlan(makeCompleteRequest({ formulaId: "f1" }));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/today-plan/complete 标记完成", () => {
  beforeEach(() => {
    mockSession({ id: "u1" });
    seedDailyPlan("u1", [
      { formulaId: "f1", formulaName: "麻黄汤", reason: "新方剂", type: "new" },
      { formulaId: "f2", formulaName: "桂枝汤", reason: "新方剂", type: "new" },
    ]);
  });

  it("标记单个方剂完成后 completedCount=1、isCompleted=false", async () => {
    const res = await completePlan(makeCompleteRequest({ formulaId: "f1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completedCount).toBe(1);
    expect(body.isCompleted).toBe(false);
    expect(body.plan).toBeTruthy();

    // 数据库写回：items[0] 应有 completed:true，items[1] 不应有
    const stored = [...tables.dailyPlan.values()][0];
    const items = JSON.parse(stored.recommendedFormulas);
    expect(items[0].completed).toBe(true);
    expect(items[1].completed).toBeUndefined();
    expect(stored.completedCount).toBe(1);
    expect(stored.isCompleted).toBe(false);
  });

  it("全部完成时 isCompleted=true", async () => {
    await completePlan(makeCompleteRequest({ formulaId: "f1" }));
    const res = await completePlan(makeCompleteRequest({ formulaId: "f2" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completedCount).toBe(2);
    expect(body.isCompleted).toBe(true);

    const stored = [...tables.dailyPlan.values()][0];
    expect(stored.completedCount).toBe(2);
    expect(stored.isCompleted).toBe(true);
    const items = JSON.parse(stored.recommendedFormulas);
    expect(items.every((i: any) => i.completed === true)).toBe(true);
  });

  it("重复标记同一个方剂：completedCount 不重复增长", async () => {
    await completePlan(makeCompleteRequest({ formulaId: "f1" }));
    const res = await completePlan(makeCompleteRequest({ formulaId: "f1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completedCount).toBe(1);
    expect(body.isCompleted).toBe(false);
  });

  it("标记不存在的 formulaId：状态不变", async () => {
    const res = await completePlan(makeCompleteRequest({ formulaId: "ghost" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completedCount).toBe(0);
    expect(body.isCompleted).toBe(false);
  });
});

describe("GET /api/today-plan/next", () => {
  beforeEach(() => mockSession({ id: "u1" }));

  it("未登录返回 401", async () => {
    mockSession(null);
    const res = await getNext();
    expect(res.status).toBe(401);
  });

  it("今日 plan 不存在返回 404", async () => {
    const res = await getNext();
    expect(res.status).toBe(404);
  });

  it("返回第一个未完成的方剂", async () => {
    seedDailyPlan("u1", [
      { formulaId: "f1", formulaName: "麻黄汤", reason: "新方剂", type: "new", completed: true },
      { formulaId: "f2", formulaName: "桂枝汤", reason: "FSRS 到期复习", type: "review" },
      { formulaId: "f3", formulaName: "银翘散", reason: "新方剂", type: "new" },
    ]);
    const res = await getNext();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBeFalsy();
    expect(body.formulaId).toBe("f2");
    expect(body.formulaName).toBe("桂枝汤");
    expect(body.type).toBe("review");
    expect(body.reason).toBe("FSRS 到期复习");
  });

  it("没有 completed 字段时返回第一个", async () => {
    seedDailyPlan("u1", [
      { formulaId: "f1", formulaName: "麻黄汤", reason: "新方剂", type: "new" },
      { formulaId: "f2", formulaName: "桂枝汤", reason: "新方剂", type: "new" },
    ]);
    const res = await getNext();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.formulaId).toBe("f1");
  });

  it("全部完成时返回 done:true", async () => {
    seedDailyPlan("u1", [
      { formulaId: "f1", formulaName: "麻黄汤", reason: "新方剂", type: "new", completed: true },
      { formulaId: "f2", formulaName: "桂枝汤", reason: "新方剂", type: "new", completed: true },
    ]);
    const res = await getNext();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBe(true);
    expect(body.formulaId).toBeUndefined();
  });

  it("空计划（无推荐方剂）也返回 done:true", async () => {
    seedDailyPlan("u1", []);
    const res = await getNext();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBe(true);
  });
});

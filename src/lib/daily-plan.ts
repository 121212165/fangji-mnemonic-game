// 今日学习计划共享逻辑
// 供 page.tsx（服务端组件）与 /api/today-plan/* 路由共用
import { db } from "@/lib/db";

export interface PlanItem {
  formulaId: string;
  formulaName: string;
  reason: string;
  type: "new" | "review";
  /** 完成标记（complete 路由写入） */
  completed?: boolean;
}

export interface SerializedPlan {
  id: number;
  userId: string;
  planDate: string;
  recommendedFormulas: PlanItem[];
  newCount: number;
  reviewCount: number;
  completedCount: number;
  isCompleted: boolean;
}

/** 取某日的 0 点 */
export function startOfDay(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * 查询用户今日 plan，不存在返回 null。
 *
 * 用 `findFirst` + 日期范围而不是 `findUnique({ userId_planDate })`：
 * - 生产环境 Prisma 都支持
 * - 测试环境 db mock 的 matchWhere 不识别复合唯一键，但能处理 gte/lte 操作符
 */
export async function findTodayPlan(userId: string, today: Date = startOfDay()) {
  const todayStart = startOfDay(today);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  return db.dailyPlan.findFirst({
    where: {
      userId,
      AND: [
        { planDate: { gte: todayStart } },
        { planDate: { lte: todayEnd } },
      ],
    },
  });
}

/**
 * 生成 fallback 计划并写入数据库
 * 逻辑：取 7 个 FSRS 到期的复习 + 凑够 10 个新方剂
 */
export async function generateFallbackPlan(userId: string, today: Date) {
  // 取今日到期的复习方剂
  const due = await db.userMastery.findMany({
    where: { userId, dueDate: { lte: new Date() } },
    take: 7,
    orderBy: { dueDate: "asc" },
    include: { formula: true },
  });

  // 取未学过的新方剂，凑够 10 首
  const learnedIds = await db.userMastery.findMany({
    where: { userId },
    select: { formulaId: true },
  });
  const learnedSet = new Set(
    (learnedIds as Array<{ formulaId: string }>).map((m) => m.formulaId)
  );

  const candidates = await db.formula.findMany({
    where: { level: "一类方" },
    orderBy: [{ sortOrder: "asc" }],
    take: 50,
  });
  const newOnes = candidates
    .filter((c) => !learnedSet.has(c.id))
    .slice(0, 10 - due.length);

  const items: PlanItem[] = [
    ...due.map((m: any) => ({
      formulaId: m.formulaId,
      formulaName: m.formula?.name ?? "",
      reason: "FSRS 到期复习",
      type: "review" as const,
    })),
    ...newOnes.map((f) => ({
      formulaId: f.id,
      formulaName: f.name,
      reason: "新方剂",
      type: "new" as const,
    })),
  ];

  return db.dailyPlan.create({
    data: {
      userId,
      planDate: today,
      recommendedFormulas: JSON.stringify(items),
      newCount: newOnes.length,
      reviewCount: due.length,
      completedCount: 0,
      isCompleted: false,
    },
  });
}

/**
 * 序列化 plan 给前端：把 Date 转 ISO、recommendedFormulas JSON 字符串解析成数组
 */
export function serializePlan(plan: any): SerializedPlan | null {
  if (!plan) return null;
  const planDate =
    plan.planDate instanceof Date
      ? plan.planDate.toISOString()
      : new Date(plan.planDate).toISOString();
  const recommendedFormulas: PlanItem[] = Array.isArray(plan.recommendedFormulas)
    ? plan.recommendedFormulas
    : safeParseArray(plan.recommendedFormulas);
  return {
    id: plan.id,
    userId: plan.userId,
    planDate,
    recommendedFormulas,
    newCount: plan.newCount,
    reviewCount: plan.reviewCount,
    completedCount: plan.completedCount,
    isCompleted: plan.isCompleted,
  };
}

function safeParseArray(s: string | null | undefined): PlanItem[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

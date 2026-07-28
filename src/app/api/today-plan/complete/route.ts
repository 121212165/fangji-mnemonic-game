// /api/today-plan/complete POST
// 标记今日计划中的某个方剂为已完成
// 请求体：{ formulaId: string }
// 返回：{ completedCount, isCompleted, plan }
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  findTodayPlan,
  serializePlan,
  startOfDay,
  type PlanItem,
} from "@/lib/daily-plan";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
    }
    const { formulaId } = body ?? {};
    if (!formulaId || typeof formulaId !== "string") {
      return NextResponse.json({ error: "缺少 formulaId" }, { status: 400 });
    }

    const plan = await findTodayPlan(userId, startOfDay());
    if (!plan) {
      return NextResponse.json({ error: "今日计划不存在" }, { status: 404 });
    }

    const items: PlanItem[] = safeParseItems(plan.recommendedFormulas);

    // 找到第一个匹配且未完成的 item 标记完成
    let marked = false;
    for (const item of items) {
      if (item.formulaId === formulaId && !item.completed) {
        item.completed = true;
        marked = true;
        break;
      }
    }

    // 已经完成过 / formulaId 不在计划里：直接返回当前状态
    if (!marked) {
      return NextResponse.json({
        completedCount: plan.completedCount,
        isCompleted: plan.isCompleted,
        plan: serializePlan(plan),
      });
    }

    const newCompletedCount = (plan.completedCount ?? 0) + 1;
    const newIsCompleted = newCompletedCount >= items.length;

    const updated = await db.dailyPlan.update({
      where: { id: plan.id },
      data: {
        recommendedFormulas: JSON.stringify(items),
        completedCount: newCompletedCount,
        isCompleted: newIsCompleted,
      },
    });

    return NextResponse.json({
      completedCount: newCompletedCount,
      isCompleted: newIsCompleted,
      plan: serializePlan(updated),
    });
  } catch (e) {
    console.error("[today-plan/complete] error", e);
    return NextResponse.json({ error: "标记失败" }, { status: 500 });
  }
}

function safeParseItems(s: string | null | undefined): PlanItem[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// /api/today-plan/next GET
// 返回今日计划中下一个未完成的方剂，供「一键开始」按钮跳转使用
// 返回：{ formulaId, formulaName, type, reason } 或 { done: true }
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findTodayPlan, startOfDay, type PlanItem } from "@/lib/daily-plan";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const plan = await findTodayPlan(userId, startOfDay());
    if (!plan) {
      return NextResponse.json({ error: "今日计划不存在" }, { status: 404 });
    }

    const items: PlanItem[] = safeParseItems(plan.recommendedFormulas);
    const next = items.find((i) => !i.completed);
    if (!next) {
      return NextResponse.json({ done: true });
    }

    return NextResponse.json({
      formulaId: next.formulaId,
      formulaName: next.formulaName,
      type: next.type,
      reason: next.reason,
    });
  } catch (e) {
    console.error("[today-plan/next] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
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

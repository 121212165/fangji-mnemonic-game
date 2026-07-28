// /api/today-plan GET
// 返回当前用户今日的学习计划；若不存在则按 fallback 规则生成
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  findTodayPlan,
  generateFallbackPlan,
  serializePlan,
  startOfDay,
} from "@/lib/daily-plan";

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

    const today = startOfDay();
    let plan = await findTodayPlan(userId, today);
    if (!plan) {
      plan = await generateFallbackPlan(userId, today);
    }

    return NextResponse.json({ plan: serializePlan(plan) });
  } catch (e) {
    console.error("[today-plan] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

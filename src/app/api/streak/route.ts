// /api/streak GET
// 返回当前用户 streak 信息
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const streak = await db.userStreak.findFirst({ where: { userId } });
    if (!streak) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckIn: null,
      });
    }

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalCheckIns: streak.totalCheckIns,
      lastCheckIn: streak.lastCheckIn,
    });
  } catch (e) {
    console.error("[streak] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

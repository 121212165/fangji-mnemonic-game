// /api/stats/monthly GET
// 最近 30 天答题趋势：每天的正确/错误数
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

    const todayStart = startOfDay(new Date());
    const rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - 29); // 含今日共 30 天

    const logs = await db.answerLog.findMany({
      where: { userId, createdAt: { gte: rangeStart } },
      orderBy: { createdAt: "asc" },
    });

    const buckets: { date: string; correct: number; wrong: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      buckets.push({ date: ymd(d), correct: 0, wrong: 0 });
    }

    for (const log of logs) {
      const dateStr = ymd(new Date(log.createdAt));
      const bucket = buckets.find((b) => b.date === dateStr);
      if (!bucket) continue;
      if (log.isCorrect) bucket.correct += 1;
      else bucket.wrong += 1;
    }

    return NextResponse.json({ days: buckets });
  } catch (e) {
    console.error("[stats/monthly] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

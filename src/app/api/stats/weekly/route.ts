// /api/stats/weekly GET
// 最近 7 天的答题统计：每天的正确数、错误数、总用时、复习方剂数
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
    rangeStart.setDate(rangeStart.getDate() - 6); // 含今日共 7 天

    const logs = await db.answerLog.findMany({
      where: {
        userId,
        createdAt: { gte: rangeStart },
      },
      orderBy: { createdAt: "asc" },
    });

    // 初始化 7 天桶
    const buckets: {
      date: string;
      correctCount: number;
      wrongCount: number;
      totalTimeSeconds: number;
      formulaIds: Set<string>;
    }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      buckets.push({
        date: ymd(d),
        correctCount: 0,
        wrongCount: 0,
        totalTimeSeconds: 0,
        formulaIds: new Set<string>(),
      });
    }

    for (const log of logs) {
      const dateStr = ymd(new Date(log.createdAt));
      const bucket = buckets.find((b) => b.date === dateStr);
      if (!bucket) continue;
      if (log.isCorrect) bucket.correctCount += 1;
      else bucket.wrongCount += 1;
      bucket.totalTimeSeconds += Number(log.timeSpentSeconds) || 0;
      if (log.formulaId) bucket.formulaIds.add(log.formulaId);
    }

    const days = buckets.map((b) => ({
      date: b.date,
      correctCount: b.correctCount,
      wrongCount: b.wrongCount,
      totalTimeSeconds: b.totalTimeSeconds,
      reviewCount: b.formulaIds.size,
    }));

    const totals = days.reduce(
      (acc, d) => {
        acc.correctCount += d.correctCount;
        acc.wrongCount += d.wrongCount;
        acc.totalTimeSeconds += d.totalTimeSeconds;
        acc.reviewCount += d.reviewCount;
        return acc;
      },
      { correctCount: 0, wrongCount: 0, totalTimeSeconds: 0, reviewCount: 0 }
    );

    return NextResponse.json({ days, totals });
  } catch (e) {
    console.error("[stats/weekly] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** YYYY-MM-DD（本地时区） */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

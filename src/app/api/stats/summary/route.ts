// /api/stats/summary GET
// 总览统计：总答题数、正确率、学习总时长、连续打卡、各分类掌握度
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

    const [totalLogs, correctLogs, sessionAgg, streak, categories, masteries, totalFormulas]
      = await Promise.all([
        db.answerLog.count({ where: { userId } }),
        db.answerLog.count({ where: { userId, isCorrect: true } }),
        db.studySession.aggregate({
          where: { userId },
          _sum: { durationSeconds: true },
          _count: true,
        }),
        db.userStreak.findUnique({ where: { userId } }),
        db.formulaCategory.findMany({
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { formulas: true } } },
        }),
        db.userMastery.findMany({
          where: { userId },
          select: { formulaId: true, stability: true, reviewCount: true, formula: { select: { categoryId: true } } },
        }),
        db.formula.count(),
      ]);

    // 按分类统计掌握度
    const categoryMastery = categories.map((cat) => {
      const catMasteries = masteries.filter((m) => m.formula.categoryId === cat.id);
      const mastered = catMasteries.filter((m) => m.stability >= 10 && m.reviewCount >= 3).length;
      const learned = catMasteries.filter((m) => m.reviewCount > 0).length;
      return {
        id: cat.id,
        name: cat.name,
        total: cat._count.formulas,
        learned,
        mastered,
      };
    });

    const masteredCount = masteries.filter((m) => m.stability >= 10 && m.reviewCount >= 3).length;

    return NextResponse.json({
      totalAnswers: totalLogs,
      correctAnswers: correctLogs,
      accuracy: totalLogs > 0 ? Math.round((correctLogs / totalLogs) * 100) : 0,
      totalStudySeconds: sessionAgg._sum.durationSeconds ?? 0,
      totalSessions: sessionAgg._count,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      totalCheckIns: streak?.totalCheckIns ?? 0,
      masteredCount,
      totalFormulas,
      categoryMastery,
    });
  } catch (e) {
    console.error("[stats/summary] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

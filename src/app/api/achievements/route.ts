// /api/achievements GET
// 返回当前用户成就列表（已解锁 + 未解锁）+ 自动解锁新成就
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateAchievements, getNewlyUnlocked, type AchievementContext } from "@/lib/achievements";

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

    // 并行获取评估所需数据
    const [totalAnswers, streak, masteries, totalFormulas, categories, existing]
      = await Promise.all([
        db.answerLog.count({ where: { userId } }),
        db.userStreak.findUnique({ where: { userId } }),
        db.userMastery.findMany({
          where: { userId },
          select: { stability: true, reviewCount: true, formula: { select: { categoryId: true } } },
        }),
        db.formula.count(),
        db.formulaCategory.findMany({
          include: { _count: { select: { formulas: true } } },
        }),
        db.userAchievement.findMany({
          where: { userId },
          select: { code: true, unlockedAt: true },
        }),
      ]);

    // 计算分类掌握度
    const categoryMastery = categories.map((cat) => {
      const catMasteries = masteries.filter((m) => m.formula.categoryId === cat.id);
      const mastered = catMasteries.filter((m) => m.stability >= 10 && m.reviewCount >= 3).length;
      return {
        id: cat.id,
        name: cat.name,
        total: cat._count.formulas,
        mastered,
      };
    });

    const masteredCount = masteries.filter((m) => m.stability >= 10 && m.reviewCount >= 3).length;

    const ctx: AchievementContext = {
      totalAnswers,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      masteredCount,
      totalFormulas,
      totalCheckIns: streak?.totalCheckIns ?? 0,
      categoryMastery,
    };

    // 自动解锁新成就
    const existingCodes = existing.map((e) => e.code);
    const newCodes = getNewlyUnlocked(ctx, existingCodes);
    if (newCodes.length > 0) {
      await db.userAchievement.createMany({
        data: newCodes.map((code) => ({ userId, code })),
        skipDuplicates: true,
      });
    }

    // 重新查询合并后的记录
    const allRecords = newCodes.length > 0
      ? await db.userAchievement.findMany({
          where: { userId },
          select: { code: true, unlockedAt: true },
        })
      : existing;

    const achievements = evaluateAchievements(
      ctx,
      allRecords.map((r) => ({ code: r.code, unlockedAt: r.unlockedAt }))
    );

    return NextResponse.json({
      achievements,
      newlyUnlocked: newCodes,
      summary: {
        unlocked: achievements.filter((a) => a.unlocked).length,
        total: achievements.length,
      },
    });
  } catch (e) {
    console.error("[achievements] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
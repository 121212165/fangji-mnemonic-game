// /api/mastery GET
// 返回当前用户所有 UserMastery 记录（含 formula 关联）
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

    const masteries = await db.userMastery.findMany({
      where: { userId },
      include: { formula: true },
      orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    });

    const result = masteries.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      formulaId: m.formulaId,
      stability: m.stability,
      difficulty: m.difficulty,
      retrievability: m.retrievability,
      lastReview: m.lastReview,
      dueDate: m.dueDate,
      reviewCount: m.reviewCount,
      lapseCount: m.lapseCount,
      lastRating: m.lastRating,
      formula: m.formula
        ? {
            id: m.formula.id,
            name: m.formula.name,
            source: m.formula.source,
            level: m.formula.level,
            categoryId: m.formula.categoryId,
          }
        : null,
    }));

    return NextResponse.json({ masteries: result });
  } catch (e) {
    console.error("[mastery] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

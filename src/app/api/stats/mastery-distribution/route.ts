// /api/stats/mastery-distribution GET
// 按 FSRS stability 分桶：未学/入门/熟悉/掌握
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

    const [masteries, totalFormulas] = await Promise.all([
      db.userMastery.findMany({
        where: { userId },
        select: { stability: true, reviewCount: true },
      }),
      db.formula.count(),
    ]);

    const learned = masteries.filter((m) => m.reviewCount > 0);
    const beginner = learned.filter((m) => m.stability > 0 && m.stability < 3);
    const familiar = learned.filter((m) => m.stability >= 3 && m.stability < 10);
    const mastered = learned.filter((m) => m.stability >= 10 && m.reviewCount >= 3);

    return NextResponse.json({
      total: totalFormulas,
      unlearned: totalFormulas - learned.length,
      beginner: beginner.length,
      familiar: familiar.length,
      mastered: mastered.length,
    });
  } catch (e) {
    console.error("[stats/mastery-distribution] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

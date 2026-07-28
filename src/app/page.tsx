import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TodayHome } from "@/components/today-home";
import { GuestHome } from "@/components/guest-home";
import { generateFallbackPlan, serializePlan, startOfDay } from "@/lib/daily-plan";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // 未登录：展示欢迎页 + 登录入口 + 分类预览
    const categories = await db.formulaCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { formulas: true } } },
    });
    return <GuestHome categories={categories} />;
  }

  // 已登录：今日学习主页
  const userId = (session.user as { id?: string }).id!;
  const today = startOfDay();

  // 并行查询：今日计划 + 掌握度统计 + 连续打卡
  const [todayPlan, masteryCount, streak, totalFormulas] = await Promise.all([
    db.dailyPlan.findUnique({
      where: { userId_planDate: { userId, planDate: today } },
    }),
    db.userMastery.count({
      where: { userId, reviewCount: { gt: 0 } },
    }),
    db.userStreak.findUnique({ where: { userId } }),
    db.formula.count(),
  ]);

  // 如果今日计划不存在，临时生成（FSRS 推荐 + 随机新方）
  let plan = todayPlan;
  if (!plan) {
    plan = await generateFallbackPlan(userId, today);
  }

  return (
    <TodayHome
      plan={serializePlan(plan)}
      stats={{
        masteredCount: masteryCount,
        totalFormulas,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
      }}
    />
  );
}

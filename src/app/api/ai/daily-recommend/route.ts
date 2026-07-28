// AI 每日推荐 API
// 调用 DeepSeek 生成个性化学习计划；DEEPSEEK_API_KEY 未配置时降级到纯 FSRS 推荐
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { callDeepSeekJson, isDeepSeekConfigured } from "@/lib/deepseek";
import { generateFallbackPlan, startOfDay } from "@/lib/daily-plan";

interface AiRecommendation {
  formulaId: string;
  reason: string;
  type: "new" | "review";
}

interface AiRecommendResponse {
  recommendations: AiRecommendation[];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id!;

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || userId;

    // 只允许为自己生成，或 CRON_SECRET 鉴权
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization") ?? "";
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    if (targetUserId !== userId && !isCron) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const today = startOfDay(new Date());

    // 已存在今日 plan 直接返回
    const existing = await db.dailyPlan.findFirst({
      where: {
        userId: targetUserId,
        planDate: { gte: today, lte: new Date(today.getTime() + 86400_000) },
      },
    });
    if (existing) {
      return NextResponse.json({ plan: existing, cached: true });
    }

    // 取用户上下文
    const [user, mastery, recentLogs, allFormulas] = await Promise.all([
      db.user.findUnique({ where: { id: targetUserId } }),
      db.userMastery.findMany({
        where: { userId: targetUserId },
        include: { formula: true },
      }),
      db.answerLog.findMany({
        where: {
          userId: targetUserId,
          createdAt: { gte: new Date(Date.now() - 7 * 86400_000) },
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
      db.formula.findMany({ select: { id: true, name: true, level: true } }),
    ]);

    // 如果 DeepSeek 未配置，降级到 fallback
    if (!isDeepSeekConfigured()) {
      const plan = await generateFallbackPlan(targetUserId, today);
      return NextResponse.json({ plan, degraded: true, reason: "DEEPSEEK_API_KEY not configured" });
    }

    // 构造提示词
    const learnedIds = new Set(mastery.map((m) => m.formulaId));
    const wrongRecent = recentLogs
      .filter((l) => !l.isCorrect)
      .map((l) => l.formulaId)
      .slice(0, 10);
    const unlearnedFormulas = allFormulas.filter((f) => !learnedIds.has(f.id));
    const dueForReview = mastery.filter((m) => m.dueDate <= new Date()).slice(0, 10);

    const systemPrompt = `你是中医考研学习规划师。根据用户的学习数据，推荐今日 10 首方剂的学习计划。
输出严格 JSON 格式：{"recommendations": [{"formulaId": "string", "reason": "string", "type": "new"|"review"}]}
- formulaId 必须从给定的候选列表中选取
- type="review" 用于 FSRS 已到期的方剂或近期错题方剂
- type="new" 用于未学过的方剂
- 推荐总数 10 首，复习:新学约 6:4
- reason 用一句话说明推荐理由（10-20 字）`;

    const userPrompt = `用户学习阶段：${user?.studyStage ?? "newbie"}
每日目标：${user?.dailyGoal ?? 10} 首

【FSRS 到期待复习方剂】（优先 type=review）
${dueForReview.map((m) => `- ${m.formulaId} (${m.formula.name})`).join("\n") || "（无）"}

【近 7 天错题方剂】（优先 type=review）
${wrongRecent.map((id) => `- ${id}`).join("\n") || "（无）"}

【未学方剂候选】（取 type=new）
${unlearnedFormulas.slice(0, 30).map((f) => `- ${f.id} (${f.name}, ${f.level})`).join("\n") || "（无）"}

请输出 JSON。`;

    const aiResult = await callDeepSeekJson<AiRecommendResponse>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 1500 }
    );

    let items: AiRecommendation[] = [];
    if (aiResult?.recommendations?.length) {
      // 校验 formulaId 存在
      const validIds = new Set(allFormulas.map((f) => f.id));
      items = aiResult.recommendations.filter((r) => validIds.has(r.formulaId)).slice(0, 10);
    }

    // 如果 AI 返回不足 10 条，用 fallback 补齐
    if (items.length < 10) {
      const fallback = await generateFallbackPlan(targetUserId, today);
      const fallbackItems: AiRecommendation[] = JSON.parse(fallback.recommendedFormulas);
      const existingIds = new Set(items.map((i) => i.formulaId));
      for (const f of fallbackItems) {
        if (items.length >= 10) break;
        if (!existingIds.has(f.formulaId)) {
          items.push({ formulaId: f.formulaId, reason: f.reason, type: f.type });
        }
      }
    }

    // 取方剂名
    const nameMap = new Map(allFormulas.map((f) => [f.id, f.name]));
    const enrichedItems = items.map((i) => ({
      formulaId: i.formulaId,
      formulaName: nameMap.get(i.formulaId) ?? "",
      reason: i.reason,
      type: i.type,
    }));

    const newCount = enrichedItems.filter((i) => i.type === "new").length;
    const reviewCount = enrichedItems.filter((i) => i.type === "review").length;

    const plan = await db.dailyPlan.create({
      data: {
        userId: targetUserId,
        planDate: today,
        recommendedFormulas: JSON.stringify(enrichedItems),
        newCount,
        reviewCount,
        completedCount: 0,
        isCompleted: false,
      },
    });

    return NextResponse.json({ plan, aiGenerated: true });
  } catch (e) {
    console.error("[daily-recommend] error", e);
    // 任何错误都降级到 fallback
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const userId = (session.user as { id?: string }).id!;
        const plan = await generateFallbackPlan(userId, startOfDay(new Date()));
        return NextResponse.json({ plan, degraded: true, reason: "AI 调用失败" });
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ error: "推荐生成失败" }, { status: 500 });
  }
}

// Vercel Cron 入口：每日凌晨预生成所有活跃用户的当日学习计划
// 配置在 vercel.json: { "crons": [{ "path": "/api/cron/daily-plan", "schedule": "0 19 * * *" }] }
// UTC 19:00 = UTC+8 03:00
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFallbackPlan, startOfDay } from "@/lib/daily-plan";
import { isDeepSeekConfigured } from "@/lib/deepseek";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Cron 最多 60 秒

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  // CRON_SECRET 鉴权
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  if (authHeader !== `Bearer ${cronSecret}` && secretParam !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);

  // 取最近 7 天有活动的用户
  const activeUsers = await db.user.findMany({
    where: { updatedAt: { gte: sevenDaysAgo } },
    select: { id: true },
  });

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];
  const useAi = isDeepSeekConfigured();

  for (const u of activeUsers) {
    try {
      // 检查是否已有今日 plan
      const existing = await db.dailyPlan.findFirst({
        where: {
          userId: u.id,
          planDate: { gte: today, lte: new Date(today.getTime() + 86400_000) },
        },
      });
      if (existing) {
        skipped++;
        continue;
      }

      // 生成 plan（DeepSeek 配置时优先用 AI，但为避免单个用户调用失败阻塞，失败时降级）
      if (useAi) {
        try {
          const res = await fetch(`${url.origin}/api/ai/daily-recommend`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cronSecret}`,
            },
            body: JSON.stringify({ userId: u.id }),
          });
          if (res.ok) {
            processed++;
            continue;
          }
        } catch {
          // 降级到 fallback
        }
      }

      await generateFallbackPlan(u.id, today);
      processed++;
    } catch (e) {
      failed++;
      errors.push(`${u.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    processed,
    skipped,
    failed,
    total: activeUsers.length,
    useAi,
    errors: errors.slice(0, 5),
  });
}

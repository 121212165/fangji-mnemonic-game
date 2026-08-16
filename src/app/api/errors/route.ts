// /api/errors GET
// 返回当前用户的错题列表（按 formulaId 去重，取最近一次错误 + 错误次数）
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

    // 查询所有错误答题记录，按 formulaId 分组
    const errorLogs = await db.answerLog.findMany({
      where: { userId, isCorrect: false },
      orderBy: { createdAt: "desc" },
      include: { formula: { select: { id: true, name: true, level: true, categoryId: true } } },
    });

    // 按 formulaId 去重，统计错误次数，取最近一次
    const errorMap = new Map<string, {
      formulaId: string;
      formulaName: string;
      level: string;
      errorCount: number;
      lastErrorAt: string;
      lastUserAnswer: string;
    }>();

    for (const log of errorLogs) {
      const existing = errorMap.get(log.formulaId);
      if (existing) {
        existing.errorCount++;
      } else {
        errorMap.set(log.formulaId, {
          formulaId: log.formulaId,
          formulaName: log.formula?.name ?? "未知方剂",
          level: log.formula?.level ?? "",
          errorCount: 1,
          lastErrorAt: log.createdAt.toISOString(),
          lastUserAnswer: log.userAnswer,
        });
      }
    }

    const errors = Array.from(errorMap.values()).sort((a, b) =>
      new Date(b.lastErrorAt).getTime() - new Date(a.lastErrorAt).getTime()
    );

    return NextResponse.json({
      errors,
      total: errors.length,
    });
  } catch (e) {
    console.error("[errors] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

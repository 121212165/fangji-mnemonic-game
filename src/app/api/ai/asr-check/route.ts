// ASR 背诵检测 API
// 浏览器端 Web Speech API 转写后，提交到这个端点做评分
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { diffIngredients, isPass } from "@/lib/match";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id!;

    const body = await req.json();
    const { formulaId, transcript } = body as { formulaId: string; transcript: string };

    if (!formulaId || typeof transcript !== "string") {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const formula = await db.formula.findUnique({ where: { id: formulaId } });
    if (!formula) {
      return NextResponse.json({ error: "方剂不存在" }, { status: 404 });
    }

    // 反序列化正确答案
    let correctIngredients: string[] = [];
    try {
      const parsed = JSON.parse(formula.ingredients);
      if (Array.isArray(parsed)) correctIngredients = parsed;
    } catch {
      // ignore
    }

    // 切分用户转写文本
    const userArr = transcript
      .split(/[、,，\s\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const diff = diffIngredients(userArr, correctIngredients);
    const isCorrect = isPass(diff.score);

    // 记录答题（mode=asr）
    await db.answerLog.create({
      data: {
        userId,
        formulaId,
        mode: "asr",
        questionType: "ingredients",
        userAnswer: transcript,
        correctAnswer: formula.ingredients,
        isCorrect,
        matchScore: diff.score,
        timeSpentSeconds: 0,
      },
    });

    return NextResponse.json({
      score: diff.score,
      isCorrect,
      diff: {
        correct: diff.correct,
        missed: diff.missed,
        wrong: diff.wrong,
        orderCorrect: diff.orderCorrect,
      },
    });
  } catch (e) {
    console.error("[asr-check] error", e);
    return NextResponse.json({ error: "评分失败" }, { status: 500 });
  }
}

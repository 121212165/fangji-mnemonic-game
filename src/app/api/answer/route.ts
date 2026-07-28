// /api/answer POST
// 用户答题接口：评分 + FSRS 更新 + streak 更新
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { diffIngredients, textSimilarity, isPass } from "@/lib/match";
import { review, initialMastery, type MasteryState } from "@/lib/fsrs";

const VALID_MODES = ["learn", "quiz", "recite", "asr"] as const;
const VALID_QTYPES = ["ingredients", "mnemonic", "functions", "indications"] as const;
const VALID_RATINGS = ["again", "hard", "good", "easy"] as const;

type Rating = (typeof VALID_RATINGS)[number];

interface DiffPayload {
  correct: string[];
  missed: string[];
  wrong: string[];
}

export async function POST(req: Request) {
  try {
    // 1. 鉴权
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 2. 解析请求体
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
    }
    const { formulaId, mode, questionType, userAnswer, rating, timeSpentSeconds } = body ?? {};

    if (!formulaId || typeof formulaId !== "string") {
      return NextResponse.json({ error: "缺少 formulaId" }, { status: 400 });
    }
    if (!mode || !(VALID_MODES as readonly string[]).includes(mode)) {
      return NextResponse.json({ error: "非法 mode" }, { status: 400 });
    }
    if (!questionType || !(VALID_QTYPES as readonly string[]).includes(questionType)) {
      return NextResponse.json({ error: "非法 questionType" }, { status: 400 });
    }
    if (typeof userAnswer !== "string") {
      return NextResponse.json({ error: "缺少 userAnswer" }, { status: 400 });
    }
    if (rating && !(VALID_RATINGS as readonly string[]).includes(rating)) {
      return NextResponse.json({ error: "非法 rating" }, { status: 400 });
    }

    // 3. 查询方剂
    const formula = await db.formula.findUnique({ where: { id: formulaId } });
    if (!formula) {
      return NextResponse.json({ error: "方剂不存在" }, { status: 404 });
    }

    // 4. 评分
    const correctIngredients = safeParseArr(formula.ingredients);
    let score: number;
    let diff: DiffPayload;
    let correctAnswer: string;

    if (questionType === "ingredients") {
      const userArr = splitIngredients(userAnswer);
      const result = diffIngredients(userArr, correctIngredients);
      score = result.score;
      diff = {
        correct: result.correct,
        missed: result.missed,
        wrong: result.wrong,
      };
      correctAnswer = JSON.stringify(correctIngredients);
    } else {
      let reference = "";
      if (questionType === "mnemonic") {
        reference = formula.traditionalMnemonic || formula.mnemonic || "";
      } else if (questionType === "functions") {
        reference = formula.functions || "";
      } else {
        reference = formula.indications || "";
      }
      score = textSimilarity(userAnswer, reference);
      diff = { correct: [], missed: [], wrong: [] };
      correctAnswer = reference;
    }

    const isCorrect = isPass(score);

    // 5. 推断评级
    let finalRating: Rating = rating as Rating;
    if (!finalRating) {
      if (score >= 0.9) finalRating = "easy";
      else if (score >= 0.7) finalRating = "good";
      else if (score >= 0.6) finalRating = "hard";
      else finalRating = "again";
    }

    // 6. 获取 mastery（避免 compound-unique 在 mock 中的限制，统一用 findFirst）
    const existing = await db.userMastery.findFirst({
      where: { userId, formulaId },
    });
    const prev: MasteryState = existing
      ? {
          stability: existing.stability,
          difficulty: existing.difficulty,
          retrievability: existing.retrievability,
          lastReview: existing.lastReview,
          dueDate: existing.dueDate,
          reviewCount: existing.reviewCount,
          lapseCount: existing.lapseCount,
          lastRating: (existing.lastRating as MasteryState["lastRating"]) ?? null,
        }
      : initialMastery();

    const wasFirstReview = prev.reviewCount === 0;
    // 数据库里 lastRating 是字符串（"again"/"hard"/"good"/"easy"），但 MasteryState 类型是 ts-fsrs 的数字枚举。
    // 这里统一转成字符串来比较，避免类型冲突。
    const prevRatingStr: string | null =
      existing?.lastRating != null ? String(existing.lastRating) : null;
    const ratingChanged = prevRatingStr !== null && prevRatingStr !== finalRating;

    const now = new Date();
    const result = review(prev, finalRating, now);
    const newState = result.state;

    // 7. upsert mastery
    if (existing) {
      await db.userMastery.update({
        where: { id: existing.id },
        data: {
          stability: newState.stability,
          difficulty: newState.difficulty,
          retrievability: newState.retrievability,
          lastReview: newState.lastReview,
          dueDate: newState.dueDate,
          reviewCount: newState.reviewCount,
          lapseCount: newState.lapseCount,
          lastRating: finalRating,
        },
      });
    } else {
      await db.userMastery.create({
        data: {
          userId,
          formulaId,
          stability: newState.stability,
          difficulty: newState.difficulty,
          retrievability: newState.retrievability,
          lastReview: newState.lastReview,
          dueDate: newState.dueDate,
          reviewCount: newState.reviewCount,
          lapseCount: newState.lapseCount,
          lastRating: finalRating,
        },
      });
    }

    // 8. answer log
    await db.answerLog.create({
      data: {
        userId,
        formulaId,
        mode,
        questionType,
        userAnswer,
        correctAnswer,
        isCorrect,
        matchScore: score,
        timeSpentSeconds: typeof timeSpentSeconds === "number" ? Math.max(0, Math.floor(timeSpentSeconds)) : 0,
        rating: finalRating,
      },
    });

    // 9. streak
    if (wasFirstReview || ratingChanged) {
      await bumpStreak(userId, now);
    }

    // 10. 返回
    return NextResponse.json({
      isCorrect,
      score,
      diff,
      nextReview: newState.dueDate,
      rating: finalRating,
    });
  } catch (e) {
    console.error("[answer] error", e);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}

/** 更新用户 streak：若今日未打卡则 currentStreak+1, lastCheckIn=now */
async function bumpStreak(userId: string, now: Date): Promise<void> {
  const existing = await db.userStreak.findFirst({ where: { userId } });

  const todayStart = startOfDay(now);
  const yestStart = new Date(todayStart);
  yestStart.setDate(yestStart.getDate() - 1);

  if (!existing) {
    await db.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCheckIn: now,
        totalCheckIns: 1,
        checkInHistory: JSON.stringify([todayStart.toISOString()]),
      },
    });
    return;
  }

  const lastCheckIn = existing.lastCheckIn ? new Date(existing.lastCheckIn) : null;
  const lastStart = lastCheckIn ? startOfDay(lastCheckIn) : null;

  // 今日已打卡
  if (lastStart && lastStart.getTime() === todayStart.getTime()) {
    return;
  }

  // 判断连续：上次打卡是昨天 → +1；否则重置为 1
  let newCurrent: number;
  if (lastStart && lastStart.getTime() === yestStart.getTime()) {
    newCurrent = (existing.currentStreak ?? 0) + 1;
  } else {
    newCurrent = 1;
  }

  const newLongest = Math.max(existing.longestStreak ?? 0, newCurrent);
  const newTotal = (existing.totalCheckIns ?? 0) + 1;

  const history = safeParseArr(existing.checkInHistory);
  history.push(todayStart.toISOString());

  await db.userStreak.update({
    where: { id: existing.id },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastCheckIn: now,
      totalCheckIns: newTotal,
      checkInHistory: JSON.stringify(history),
    },
  });
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function splitIngredients(s: string): string[] {
  return s
    .split(/[、,，;；\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function safeParseArr(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// /api/answer POST 路由单元测试
import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/app/api/answer/route";
import { getServerSession } from "next-auth";
import * as dbModule from "@/lib/db";

// ts-expect-error: __tables 是 setup.ts mock 暴露的内部状态
const tables = (dbModule as any).__tables as Record<string, Map<string, any>>;

function resetDb() {
  if (!tables) return;
  for (const m of Object.values(tables)) m.clear();
}

function mockSession(user: { id: string } | null) {
  vi.mocked(getServerSession).mockResolvedValue(
    user ? ({ user } as any) : (null as any)
  );
}

function makeRequest(body: any): Request {
  return new Request("http://localhost/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function postAnswer(body: any) {
  const res = await POST(makeRequest(body));
  return { status: res.status, body: await res.json() };
}

/** 在 mock db 里塞一个方剂 */
function seedFormula(overrides: Partial<Record<string, any>> = {}) {
  const f = {
    id: "f1",
    name: "麻黄汤",
    source: "《伤寒论》",
    alias: "[]",
    categoryId: 1,
    mnemonic: "",
    mnemonicExplanation: "",
    traditionalMnemonic: "麻黄汤中用桂枝，杏仁甘草四般施",
    traditionalMnemonicExplanation: "",
    ingredients: JSON.stringify(["麻黄", "桂枝", "杏仁", "甘草"]),
    functions: "发汗解表，宣肺平喘",
    indications: "外感风寒表实证",
    trigger: "",
    level: "一类方",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  tables.formula.set(f.id, f);
  return f;
}

beforeEach(() => {
  resetDb();
  // 默认未登录
  mockSession(null);
});

describe("POST /api/answer 鉴权", () => {
  it("未登录返回 401", async () => {
    mockSession(null);
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    expect(status).toBe(401);
    expect(body.error).toBeTruthy();
  });

  it("session 缺少 id 时返回 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any);
    const { status } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄",
    });
    expect(status).toBe(401);
  });
});

describe("POST /api/answer 参数校验", () => {
  beforeEach(() => mockSession({ id: "u1" }));

  it("缺少 formulaId 返回 400", async () => {
    const { status } = await postAnswer({
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄",
    });
    expect(status).toBe(400);
  });

  it("非法 mode 返回 400", async () => {
    const { status } = await postAnswer({
      formulaId: "f1",
      mode: "invalid",
      questionType: "ingredients",
      userAnswer: "麻黄",
    });
    expect(status).toBe(400);
  });

  it("非法 questionType 返回 400", async () => {
    const { status } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "nope",
      userAnswer: "麻黄",
    });
    expect(status).toBe(400);
  });

  it("方剂不存在返回 404", async () => {
    const { status } = await postAnswer({
      formulaId: "non-existent",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄",
    });
    expect(status).toBe(404);
  });
});

describe("POST /api/answer 评分（ingredients 题型）", () => {
  beforeEach(() => {
    mockSession({ id: "u1" });
    seedFormula();
  });

  it("答案完全正确：score=1.0、isCorrect=true、rating=easy", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    expect(status).toBe(200);
    expect(body.isCorrect).toBe(true);
    expect(body.score).toBe(1);
    expect(body.diff.correct).toHaveLength(4);
    expect(body.diff.missed).toHaveLength(0);
    expect(body.diff.wrong).toHaveLength(0);
    expect(body.rating).toBe("easy");
  });

  it("答案漏一个药：score<1.0、仍可能 pass、diff.missed 有值", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "quiz",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁", // 漏了甘草
    });
    expect(status).toBe(200);
    expect(body.score).toBeLessThan(1);
    // 3 对 + 1 漏 + 0 错 = 4 总，3/4 = 0.75 >= 0.6，应 pass
    expect(body.isCorrect).toBe(true);
    expect(body.diff.correct).toHaveLength(3);
    expect(body.diff.missed).toContain("甘草");
    expect(body.diff.wrong).toHaveLength(0);
    // score=0.75 → rating="good"
    expect(body.rating).toBe("good");
  });

  it("答案完全错：isCorrect=false、rating=again", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "quiz",
      questionType: "ingredients",
      userAnswer: "大黄、芒硝",
    });
    expect(status).toBe(200);
    expect(body.isCorrect).toBe(false);
    expect(body.score).toBe(0);
    expect(body.diff.correct).toHaveLength(0);
    expect(body.diff.wrong).toHaveLength(2);
    expect(body.diff.missed).toHaveLength(4);
    expect(body.rating).toBe("again");
  });

  it("多答一个错药：score 下降、diff.wrong 含多答的药", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草、大黄",
    });
    expect(status).toBe(200);
    // 4 对 + 0 漏 + 1 错 = 5 总，4/5 = 0.8
    expect(body.score).toBeCloseTo(0.8, 5);
    expect(body.isCorrect).toBe(true);
    expect(body.diff.wrong).toContain("大黄");
  });

  it("用户显式传 rating 时，最终 rating 采用用户值", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
      rating: "hard",
    });
    expect(status).toBe(200);
    expect(body.rating).toBe("hard");
  });

  it("返回 nextReview 在未来", async () => {
    const before = Date.now();
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    expect(status).toBe(200);
    const due = new Date(body.nextReview).getTime();
    expect(due).toBeGreaterThanOrEqual(before);
  });
});

describe("POST /api/answer 评分（mnemonic / functions / indications 题型）", () => {
  beforeEach(() => {
    mockSession({ id: "u1" });
    seedFormula();
  });

  it("mnemonic 题型：完全相同文本 → score=1.0、isCorrect=true", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "recite",
      questionType: "mnemonic",
      userAnswer: "麻黄汤中用桂枝，杏仁甘草四般施",
    });
    expect(status).toBe(200);
    expect(body.score).toBe(1);
    expect(body.isCorrect).toBe(true);
    expect(body.rating).toBe("easy");
  });

  it("mnemonic 题型：少量错字模糊匹配通过", async () => {
    // 漏 1 字 + 改 1 字 → 编辑距离较小
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "recite",
      questionType: "mnemonic",
      userAnswer: "麻黄汤中用桂枝，杏仁甘草四般师", // "施" → "师"
    });
    expect(status).toBe(200);
    expect(body.score).toBeGreaterThan(0.6);
    expect(body.isCorrect).toBe(true);
  });

  it("mnemonic 题型：完全不同文本 → isCorrect=false", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "recite",
      questionType: "mnemonic",
      userAnswer: "一二三四五六七",
    });
    expect(status).toBe(200);
    expect(body.isCorrect).toBe(false);
    expect(body.rating).toBe("again");
  });

  it("functions 题型：模糊匹配", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "quiz",
      questionType: "functions",
      userAnswer: "发汗解表，宣肺平喘",
    });
    expect(status).toBe(200);
    expect(body.score).toBe(1);
    expect(body.isCorrect).toBe(true);
  });

  it("indications 题型：模糊匹配", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "quiz",
      questionType: "indications",
      userAnswer: "外感风寒表实证",
    });
    expect(status).toBe(200);
    expect(body.score).toBe(1);
    expect(body.isCorrect).toBe(true);
  });
});

describe("POST /api/answer 评级自动推断", () => {
  beforeEach(() => {
    mockSession({ id: "u1" });
    seedFormula();
  });

  it("score>=0.9 → easy", async () => {
    const { body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草", // score=1.0
    });
    expect(body.score).toBeGreaterThanOrEqual(0.9);
    expect(body.rating).toBe("easy");
  });

  it("0.7<=score<0.9 → good", async () => {
    // 3 对 + 1 漏 = 4 总，0.75
    const { body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁",
    });
    expect(body.score).toBeGreaterThanOrEqual(0.7);
    expect(body.score).toBeLessThan(0.9);
    expect(body.rating).toBe("good");
  });

  it("0.6<=score<0.7 → hard", async () => {
    // 4 味方剂：用户给 4 味其中 3 味对、1 味错 → 3 对 + 1 漏 + 1 错 = 5 总 → 3/5=0.6
    const { body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、大黄",
    });
    expect(body.score).toBeCloseTo(0.6, 5);
    expect(body.rating).toBe("hard");
  });

  it("score<0.6 → again", async () => {
    const { body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "大黄、芒硝",
    });
    expect(body.score).toBeLessThan(0.6);
    expect(body.rating).toBe("again");
  });
});

describe("POST /api/answer 副作用（mastery / answerLog / streak）", () => {
  beforeEach(() => {
    mockSession({ id: "u1" });
    seedFormula();
  });

  it("首次答题后会创建 userMastery 与 answerLog", async () => {
    const { status, body } = await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    expect(status).toBe(200);
    expect(body.isCorrect).toBe(true);

    const mastery = [...tables.userMastery.values()];
    expect(mastery).toHaveLength(1);
    expect(mastery[0].userId).toBe("u1");
    expect(mastery[0].formulaId).toBe("f1");
    expect(mastery[0].reviewCount).toBe(1);
    expect(mastery[0].lastRating).toBe("easy");
    expect(mastery[0].stability).toBeGreaterThan(0);

    const logs = [...tables.answerLog.values()];
    expect(logs).toHaveLength(1);
    expect(logs[0].userId).toBe("u1");
    expect(logs[0].formulaId).toBe("f1");
    expect(logs[0].isCorrect).toBe(true);
    expect(logs[0].matchScore).toBe(1);
    expect(logs[0].correctAnswer).toBeTruthy();
  });

  it("首次答题会创建 streak（currentStreak=1）", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    const streaks = [...tables.userStreak.values()];
    expect(streaks).toHaveLength(1);
    expect(streaks[0].userId).toBe("u1");
    expect(streaks[0].currentStreak).toBe(1);
    expect(streaks[0].longestStreak).toBe(1);
    expect(streaks[0].totalCheckIns).toBe(1);
    expect(streaks[0].lastCheckIn).toBeTruthy();
  });

  it("同日再次答题：streak 不再增长", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    // 改评级触发 streak 更新分支
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁", // 0.75 → good（与首次 easy 不同）
      rating: "good",
    });
    const streaks = [...tables.userStreak.values()];
    expect(streaks).toHaveLength(1);
    expect(streaks[0].currentStreak).toBe(1); // 同日不增长
    expect(streaks[0].totalCheckIns).toBe(1);
  });

  it("重复答题：mastery.reviewCount 累加", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    await postAnswer({
      formulaId: "f1",
      mode: "quiz",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    const mastery = [...tables.userMastery.values()];
    expect(mastery).toHaveLength(1);
    expect(mastery[0].reviewCount).toBe(2);
    const logs = [...tables.answerLog.values()];
    expect(logs).toHaveLength(2);
  });

  it("answerLog.correctAnswer 是 ingredients 题型时的 JSON 快照", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
    });
    const log = [...tables.answerLog.values()][0];
    const parsed = JSON.parse(log.correctAnswer);
    expect(parsed).toEqual(["麻黄", "桂枝", "杏仁", "甘草"]);
  });

  it("answerLog.correctAnswer 是 mnemonic 题型时的方歌原文", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "recite",
      questionType: "mnemonic",
      userAnswer: "麻黄汤中用桂枝，杏仁甘草四般施",
    });
    const log = [...tables.answerLog.values()][0];
    expect(log.correctAnswer).toBe("麻黄汤中用桂枝，杏仁甘草四般施");
  });

  it("timeSpentSeconds 被持久化", async () => {
    await postAnswer({
      formulaId: "f1",
      mode: "learn",
      questionType: "ingredients",
      userAnswer: "麻黄、桂枝、杏仁、甘草",
      timeSpentSeconds: 42,
    });
    const log = [...tables.answerLog.values()][0];
    expect(log.timeSpentSeconds).toBe(42);
  });
});

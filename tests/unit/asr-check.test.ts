// ASR 背诵检测 API 单元测试
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/asr-check/route";
import { getServerSession } from "next-auth";
import * as dbModule from "@/lib/db";

const tables = (dbModule as unknown as { __tables: Record<string, Map<string, any>> }).__tables;

function resetDb() {
  if (!tables) return;
  for (const m of Object.values(tables)) m.clear();
}

function setupFormula(id: string, ingredients: string[]) {
  tables.formula.set(id, {
    id,
    name: id,
    source: "",
    alias: "[]",
    categoryId: 1,
    mnemonic: "",
    mnemonicExplanation: "",
    traditionalMnemonic: "",
    traditionalMnemonicExplanation: "",
    ingredients: JSON.stringify(ingredients),
    functions: "",
    indications: "",
    trigger: "",
    level: "一类方",
    sortOrder: 0,
  });
}

function mockSession(userId: string | null) {
  vi.mocked(getServerSession).mockResolvedValue(
    userId
      ? ({
          user: { id: userId, email: "test@example.com" },
          expires: "2099-01-01",
        } as any)
      : (null as any)
  );
}

function makeReq(body: any): Request {
  return new Request("http://localhost/api/ai/asr-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetDb();
  vi.clearAllMocks();
  mockSession("user-1");
});

describe("POST /api/ai/asr-check", () => {
  it("未登录返回 401", async () => {
    mockSession(null);
    const res = await POST(makeReq({ formulaId: "f1", transcript: "麻黄" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("未登录");
  });

  it("参数错误返回 400", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("方剂不存在返回 404", async () => {
    const res = await POST(makeReq({ formulaId: "no-exist", transcript: "麻黄" }));
    expect(res.status).toBe(404);
  });

  it("完全正确的 transcript 应得满分", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    const res = await POST(
      makeReq({ formulaId: "mht", transcript: "麻黄、桂枝、杏仁、甘草" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.score).toBe(1);
    expect(data.isCorrect).toBe(true);
    expect(data.diff.correct).toEqual(
      expect.arrayContaining(["麻黄", "桂枝", "杏仁", "甘草"])
    );
    expect(data.diff.missed).toEqual([]);
    expect(data.diff.wrong).toEqual([]);
  });

  it("漏一个药时 score<1 但仍可能通过", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    const res = await POST(
      makeReq({ formulaId: "mht", transcript: "麻黄、桂枝、杏仁" })
    );
    const data = await res.json();
    expect(data.score).toBeLessThan(1);
    expect(data.score).toBeGreaterThan(0.5);
    expect(data.diff.missed).toEqual(["甘草"]);
  });

  it("完全错的 transcript 不通过", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    const res = await POST(
      makeReq({ formulaId: "mht", transcript: "金银花、连翘、薄荷" })
    );
    const data = await res.json();
    expect(data.isCorrect).toBe(false);
    expect(data.diff.wrong.length).toBe(3);
    expect(data.diff.missed.length).toBe(4);
  });

  it("多答一个药时 score<1", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    const res = await POST(
      makeReq({
        formulaId: "mht",
        transcript: "麻黄、桂枝、杏仁、甘草、薄荷",
      })
    );
    const data = await res.json();
    expect(data.score).toBeLessThan(1);
    expect(data.diff.wrong).toEqual(["薄荷"]);
  });

  it("空格/逗号/顿号/换行都能切分", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    const res = await POST(
      makeReq({
        formulaId: "mht",
        transcript: "麻黄 桂枝,\n杏仁，甘草",
      })
    );
    const data = await res.json();
    expect(data.score).toBe(1);
  });

  it("答题记录写入 answerLog", async () => {
    setupFormula("mht", ["麻黄", "桂枝", "杏仁", "甘草"]);
    await POST(makeReq({ formulaId: "mht", transcript: "麻黄、桂枝、杏仁、甘草" }));
    const logs = [...tables.answerLog.values()];
    expect(logs.length).toBe(1);
    expect(logs[0].mode).toBe("asr");
    expect(logs[0].questionType).toBe("ingredients");
    expect(logs[0].isCorrect).toBe(true);
    expect(logs[0].matchScore).toBe(1);
  });

  it("方剂 ingredients 字段为空数组时仍正常", async () => {
    setupFormula("empty", []);
    const res = await POST(
      makeReq({ formulaId: "empty", transcript: "麻黄" })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.score).toBe(0);
    expect(data.isCorrect).toBe(false);
  });
});

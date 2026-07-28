// DeepSeek 客户端单元测试
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callDeepSeek, callDeepSeekJson, isDeepSeekConfigured } from "@/lib/deepseek";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("isDeepSeekConfigured", () => {
  it("DEEPSEEK_API_KEY 未设置时返回 false", () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    expect(isDeepSeekConfigured()).toBe(false);
  });

  it("DEEPSEEK_API_KEY 设置时返回 true", () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    expect(isDeepSeekConfigured()).toBe(true);
  });
});

describe("callDeepSeek", () => {
  it("DEEPSEEK_API_KEY 为空时抛出特定错误", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    await expect(
      callDeepSeek([{ role: "user", content: "hi" }])
    ).rejects.toThrow("DEEPSEEK_API_KEY not configured");
  });

  it("正常调用时使用正确的 URL 和 body", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    vi.stubEnv("DEEPSEEK_BASE_URL", "https://api.deepseek.com");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "hello" } }],
          usage: { total_tokens: 42 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await callDeepSeek([{ role: "user", content: "hi" }], {
      temperature: 0.5,
      maxTokens: 100,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.deepseek.com/v1/chat/completions");
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-test",
      },
    });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe("deepseek-chat");
    expect(body.temperature).toBe(0.5);
    expect(body.max_tokens).toBe(100);
    expect(body.stream).toBe(false);
    expect(body.messages).toEqual([{ role: "user", content: "hi" }]);
    expect(result.content).toBe("hello");
    expect(result.tokensUsed).toBe(42);
  });

  it("jsonMode=true 时 body 含 response_format", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"a":1}' } }],
          usage: { total_tokens: 5 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await callDeepSeek([{ role: "user", content: "x" }], { jsonMode: true });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("自定义 model 时 body.model 正确", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "x" } }],
          usage: { total_tokens: 0 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await callDeepSeek([{ role: "user", content: "x" }], { model: "deepseek-reasoner" });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.model).toBe("deepseek-reasoner");
  });

  it("HTTP 429 抛错", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    global.fetch = vi.fn().mockResolvedValue(
      new Response("rate limited", { status: 429, statusText: "Too Many Requests" })
    ) as unknown as typeof fetch;

    await expect(callDeepSeek([{ role: "user", content: "x" }])).rejects.toThrow(
      /DeepSeek API error: 429/
    );
  });

  it("HTTP 500 抛错", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    global.fetch = vi.fn().mockResolvedValue(
      new Response("server error", { status: 500, statusText: "Internal Server Error" })
    ) as unknown as typeof fetch;

    await expect(callDeepSeek([{ role: "user", content: "x" }])).rejects.toThrow(
      /DeepSeek API error: 500/
    );
  });

  it("响应缺少 choices 时 content 为空字符串", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    ) as unknown as typeof fetch;

    const result = await callDeepSeek([{ role: "user", content: "x" }]);
    expect(result.content).toBe("");
    expect(result.tokensUsed).toBe(0);
  });
});

describe("callDeepSeekJson", () => {
  it("成功返回解析后的 JSON", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"key":"value","num":42}' } }],
          usage: { total_tokens: 10 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    ) as unknown as typeof fetch;

    const result = await callDeepSeekJson<{ key: string; num: number }>([
      { role: "user", content: "x" },
    ]);
    expect(result).toEqual({ key: "value", num: 42 });
  });

  it("DEEPSEEK_API_KEY 未配置时返回 null（不抛错）", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    const result = await callDeepSeekJson([{ role: "user", content: "x" }]);
    expect(result).toBeNull();
  });

  it("返回非 JSON 内容时返回 null", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "not json" } }],
          usage: { total_tokens: 0 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    ) as unknown as typeof fetch;

    const result = await callDeepSeekJson([{ role: "user", content: "x" }]);
    expect(result).toBeNull();
  });
});

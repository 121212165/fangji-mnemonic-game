// DeepSeek API 客户端封装
// 文档：https://api-docs.deepseek.com/

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  model?: string;
}

export interface DeepSeekResult {
  content: string;
  tokensUsed: number;
}

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

/**
 * 调用 DeepSeek Chat Completions API
 * 必须在 server 端调用（Route Handler / Server Action / getServerSession 内）
 */
export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<DeepSeekResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const url = `${baseUrl}/v1/chat/completions`;

  const body: Record<string, unknown> = {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    stream: false,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `DeepSeek API error: ${res.status} ${res.statusText}. ${errText.slice(0, 200)}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  const tokensUsed = data?.usage?.total_tokens ?? 0;

  return { content, tokensUsed };
}

/**
 * 调用 DeepSeek 并解析 JSON 输出
 * 失败时返回 null（不抛错）
 */
export async function callDeepSeekJson<T = unknown>(
  messages: DeepSeekMessage[],
  options: Omit<DeepSeekOptions, "jsonMode"> = {}
): Promise<T | null> {
  try {
    const { content } = await callDeepSeek(messages, {
      ...options,
      jsonMode: true,
    });
    return JSON.parse(content) as T;
  } catch (e) {
    console.warn("[deepseek-json] failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** 检查 DeepSeek 是否可用 */
export function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

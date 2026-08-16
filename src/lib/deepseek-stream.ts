// DeepSeek 流式调用封装
// 返回 ReadableStream，每收到一段 delta 就向外推送文本
import type { DeepSeekMessage } from "./deepseek";

export interface StreamOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  signal?: AbortSignal;
}

/**
 * 调用 DeepSeek 流式接口
 * 返回 { stream, totalTokens }
 * - stream: ReadableStream<Uint8Array>，输出纯文本 delta（不带 SSE 前缀）
 * - totalTokens: Promise<number>，流结束后 resolve
 */
export async function callDeepSeekStream(
  messages: DeepSeekMessage[],
  options: StreamOptions = {}
): Promise<{ stream: ReadableStream<Uint8Array>; totalTokens: Promise<number> }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const url = `${baseUrl}/v1/chat/completions`;

  const body = {
    model: options.model || "deepseek-chat",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2000,
    stream: true,
    stream_options: { include_usage: true },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`DeepSeek stream error: ${res.status} ${res.statusText}. ${errText.slice(0, 200)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let tokensResolve: (n: number) => void;
  const totalTokens = new Promise<number>((resolve) => {
    tokensResolve = resolve;
  });

  let buffer = "";
  let total = 0;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          tokensResolve(total);
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        // SSE 按 \n\n 分块
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              tokensResolve(total);
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
              if (json?.usage?.total_tokens) {
                total = json.usage.total_tokens;
              }
            } catch {
              // 忽略解析错误的 chunk
            }
          }
        }
      } catch (e) {
        controller.error(e);
        tokensResolve(total);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
      tokensResolve(total);
    },
  });

  return { stream, totalTokens };
}

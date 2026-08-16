"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  conversationId: number | null;
  initialMessages: Message[];
  formulaId: string | null;
}

export function AiChat({ conversationId, initialMessages, formulaId }: AiChatProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    track("ai_chat", { has_formula: !!formulaId, is_new_conversation: !activeConvId });

    // 占位的 assistant 消息，流式更新
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: activeConvId,
          formulaId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "请求失败");
      }

      // 新对话拿到 conversation id
      const newConvId = Number(res.headers.get("X-Conversation-Id"));
      if (newConvId && !activeConvId) {
        setActiveConvId(newConvId);
        // 替换 URL 不刷新页面
        window.history.replaceState(null, "", `/ai/${newConvId}`);
      }

      // 流式读取
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("无法读取响应流");

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // 更新最后一条 assistant 消息
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }

      if (!acc) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: "（AI 未返回内容，请重试）",
          };
          return next;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络错误";
      // 移除占位的空 assistant 消息，加错误提示
      setMessages((prev) => {
        const next = prev.slice(0, -1);
        next.push({ role: "assistant", content: `⚠️ ${msg}` });
        return next;
      });
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/ai"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          对话列表
        </Link>
        {formulaId && (
          <Link
            href={`/formulas/${encodeURIComponent(formulaId)}`}
            className="text-xs text-accent hover:underline"
          >
            查看关联方剂
          </Link>
        )}
      </div>

      {/* 消息区 */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                问任何方剂学相关问题，例如：
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {[
                  "麻黄汤的组成和主治？",
                  "桂枝汤与麻黄汤如何鉴别？",
                  "解释「君臣佐使」配伍",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs px-2 py-1 rounded-md border border-input hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content || "…"}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <form onSubmit={send} className="flex gap-2 pt-2 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          disabled={loading}
          maxLength={2000}
        />
        <Button type="submit" disabled={loading || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

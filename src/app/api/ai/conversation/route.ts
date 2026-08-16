// /api/ai/conversation
// GET: 返回当前用户最近 20 条对话
// POST: 流式创建对话，SSE 输出
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { callDeepSeekStream } from "@/lib/deepseek-stream";
import { isDeepSeekConfigured } from "@/lib/deepseek";
import { logger } from "@/lib/logger";

const DAILY_LIMIT = 50;

const SYSTEM_PROMPT = `你是一位中医方剂学习助手，专注于帮助用户学习方剂学知识。

你的能力：
- 解释方剂的组成、功效、主治
- 讲解配伍意义与加减变化
- 鉴别相似方剂的异同
- 帮助记忆方歌、口诀

你的限制：
- 不提供医疗诊断或治疗建议
- 不替代专业医师的判断
- 涉及具体病症时，提醒用户咨询执业中医师

回答风格：
- 简洁清晰，重点突出
- 适当使用方剂学专业术语，但需解释
- 鼓励用户思考与提问`;

const createSchema = z.object({
  formulaId: z.string().optional(),
  message: z.string().min(1, "请输入消息").max(2000, "消息过长"),
  conversationId: z.number().int().optional(),
});

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

    const conversations = await db.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        formulaId: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ conversations });
  } catch (e) {
    logger.error("ai-conversation-list 查询失败", { err: e });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    if (!isDeepSeekConfigured()) {
      return NextResponse.json(
        { error: "AI 服务暂未配置，请稍后再试" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    // 日对话上限检查
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await db.aiConversation.count({
      where: { userId, createdAt: { gte: todayStart } },
    });
    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `今日对话已达上限（${DAILY_LIMIT} 次），请明天再来` },
        { status: 429 }
      );
    }

    const { message, formulaId, conversationId } = parsed.data;

    // 查询或创建对话
    let conversation = conversationId
      ? await db.aiConversation.findUnique({ where: { id: conversationId } })
      : null;

    if (conversation && conversation.userId !== userId) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    if (!conversation) {
      // 生成标题：取消息前 20 字
      const title = message.slice(0, 20) + (message.length > 20 ? "..." : "");
      conversation = await db.aiConversation.create({
        data: {
          userId,
          formulaId: formulaId ?? null,
          title,
          messages: JSON.stringify([]),
        },
      });
    }

    // 加载历史消息
    const history: { role: "user" | "assistant"; content: string }[] =
      JSON.parse(conversation.messages || "[]");

    // 构造关联方剂上下文
    let formulaContext = "";
    if (conversation.formulaId) {
      const formula = await db.formula.findUnique({
        where: { id: conversation.formulaId },
        select: { name: true, ingredients: true, functions: true, indications: true, mnemonic: true },
      });
      if (formula) {
        formulaContext = `\n\n【当前关联方剂】${formula.name}
组成：${formula.ingredients}
功用：${formula.functions}
主治：${formula.indications}
方歌：${formula.mnemonic}`;
      }
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT + formulaContext },
      ...history.slice(-10), // 最近 10 轮上下文
      { role: "user" as const, content: message },
    ];

    // 流式调用
    const { stream, totalTokens } = await callDeepSeekStream(messages, {
      maxTokens: 2000,
    });

    // 用 TransformStream 收集完整回复
    let fullResponse = "";
    const collectedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullResponse += new TextDecoder().decode(value);
            controller.enqueue(value);
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    // 流结束后异步保存
    (async () => {
      try {
        const tokens = await totalTokens;
        const updatedHistory = [
          ...history,
          { role: "user" as const, content: message },
          { role: "assistant" as const, content: fullResponse },
        ];
        await db.aiConversation.update({
          where: { id: conversation!.id },
          data: {
            messages: JSON.stringify(updatedHistory),
            messageCount: updatedHistory.length,
            totalTokens: { increment: tokens },
            updatedAt: new Date(),
          },
        });
      } catch (e) {
        logger.error("ai-conversation-save 保存失败", { err: e });
      }
    })();

    return new Response(collectedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": String(conversation.id),
      },
    });
  } catch (e) {
    logger.error("ai-conversation-create 创建失败", { err: e });
    return NextResponse.json({ error: "AI 服务异常，请稍后再试" }, { status: 500 });
  }
}

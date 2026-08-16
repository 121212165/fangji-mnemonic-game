// /api/ai/conversation/[id]
// GET: 单条对话详情
// DELETE: 删除对话
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;
    const convId = parseInt(id, 10);
    if (Number.isNaN(convId)) {
      return NextResponse.json({ error: "无效的对话 ID" }, { status: 400 });
    }

    const conversation = await db.aiConversation.findUnique({
      where: { id: convId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }
    if (conversation.userId !== userId) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    const messages = JSON.parse(conversation.messages || "[]");
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        formulaId: conversation.formulaId,
        messageCount: conversation.messageCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages,
      },
    });
  } catch (e) {
    console.error("[ai-conversation-get] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;
    const convId = parseInt(id, 10);
    if (Number.isNaN(convId)) {
      return NextResponse.json({ error: "无效的对话 ID" }, { status: 400 });
    }

    const conversation = await db.aiConversation.findUnique({
      where: { id: convId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }
    if (conversation.userId !== userId) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    await db.aiConversation.delete({ where: { id: convId } });
    return NextResponse.json({ message: "已删除" });
  } catch (e) {
    console.error("[ai-conversation-delete] error", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

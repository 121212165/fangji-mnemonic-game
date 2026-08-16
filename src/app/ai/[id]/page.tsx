// AI 对话详情页（server component）
// 支持 /ai/new（新对话）和 /ai/[id]（已有对话）
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { AiChat } from "@/components/ai-chat";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AiChatPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }
  const userId = (session.user as { id?: string }).id!;
  const { id } = await params;

  // 新对话
  if (id === "new") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
          <AiChat conversationId={null} initialMessages={[]} formulaId={null} />
        </main>
      </div>
    );
  }

  const convId = parseInt(id, 10);
  if (Number.isNaN(convId)) {
    redirect("/ai");
  }

  const conversation = await db.aiConversation.findUnique({
    where: { id: convId },
  });

  if (!conversation || conversation.userId !== userId) {
    redirect("/ai");
  }

  const messages = JSON.parse(conversation.messages || "[]");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        <AiChat
          conversationId={conversation.id}
          initialMessages={messages}
          formulaId={conversation.formulaId}
        />
      </main>
    </div>
  );
}

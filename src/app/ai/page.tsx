// AI 对话列表页（server component）
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { DeleteConversationButton } from "@/components/delete-conversation-button";

export const dynamic = "force-dynamic";

export default async function AiListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }
  const userId = (session.user as { id?: string }).id!;

  const conversations = await db.aiConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      formula: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 助手</h1>
            <p className="text-sm text-muted-foreground mt-1">
              中医方剂学习伙伴，帮你理解与记忆
            </p>
          </div>
          <Button asChild variant="accent" size="sm">
            <Link href="/ai/new">
              <Plus className="h-4 w-4" />
              新对话
            </Link>
          </Button>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                还没有对话，开始你的第一次提问吧
              </p>
              <Button asChild variant="accent" size="sm">
                <Link href="/ai/new">开始对话</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card key={conv.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/ai/${conv.id}`} className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {conv.title || "未命名对话"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {conv.messageCount} 条消息
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conv.updatedAt.toLocaleDateString("zh-CN")}{" "}
                          {conv.updatedAt.toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {conv.formula && (
                        <Badge variant="secondary">{conv.formula.name}</Badge>
                      )}
                      <DeleteConversationButton id={conv.id} />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

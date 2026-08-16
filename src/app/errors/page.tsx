import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ErrorsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }
  const userId = (session.user as { id?: string }).id!;

  const errorLogs = await db.answerLog.findMany({
    where: { userId, isCorrect: false },
    orderBy: { createdAt: "desc" },
    include: {
      formula: { select: { id: true, name: true, level: true } },
    },
  });

  // 按 formulaId 去重
  const errorMap = new Map<string, {
    formulaId: string;
    formulaName: string;
    level: string;
    errorCount: number;
    lastErrorAt: Date;
  }>();

  for (const log of errorLogs) {
    const existing = errorMap.get(log.formulaId);
    if (existing) {
      existing.errorCount++;
    } else {
      errorMap.set(log.formulaId, {
        formulaId: log.formulaId,
        formulaName: log.formula?.name ?? "未知",
        level: log.formula?.level ?? "",
        errorCount: 1,
        lastErrorAt: log.createdAt,
      });
    }
  }

  const errors = Array.from(errorMap.values()).sort((a, b) =>
    b.lastErrorAt.getTime() - a.lastErrorAt.getTime()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">错题本</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {errors.length} 首方剂需要复习
          </p>
        </div>

        {errors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                暂无错题，继续加油！
              </p>
              <Button asChild variant="accent" size="sm">
                <Link href="/">回到学习</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {errors.map((err, idx) => (
              <Link
                key={err.formulaId}
                href={`/formulas/${encodeURIComponent(err.formulaId)}?mode=quiz`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {err.formulaName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          错 {err.errorCount} 次
                        </Badge>
                        {err.level && (
                          <Badge
                            variant={
                              err.level === "一类方" ? "accent" : "secondary"
                            }
                          >
                            {err.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground">
                      最近错误：{err.lastErrorAt.toLocaleDateString("zh-CN")}{" "}
                      {err.lastErrorAt.toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

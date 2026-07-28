// 搜索结果页（server component）
// 接收 searchParams.q（Next.js 15 中为 Promise）
// 查 name / mnemonic / traditionalMnemonic contains q，渲染结果列表
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const formulas = query
    ? await db.formula.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { mnemonic: { contains: query } },
            { traditionalMnemonic: { contains: query } },
          ],
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 50,
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">搜索结果</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {query
              ? `关键词：「${query}」 · 共 ${formulas.length} 条`
              : "请在首页搜索框输入方剂名 / 口诀关键词"}
          </p>
        </div>

        <div className="space-y-2">
          {formulas.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {query ? "未找到相关方剂" : "暂无搜索内容"}
            </p>
          ) : (
            formulas.map((f, idx) => (
              <Link key={f.id} href={`/formulas/${f.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {f.name}
                      </CardTitle>
                      <Badge
                        variant={f.level === "一类方" ? "accent" : "secondary"}
                      >
                        {f.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  {f.traditionalMnemonic && (
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {f.traditionalMnemonic}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="pt-4">
          <Link
            href="/?view=search"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}

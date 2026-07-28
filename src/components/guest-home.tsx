import Link from "next/link";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormulaCategory } from "@/lib/types";

interface Props {
  categories: (FormulaCategory & { _count?: { formulas: number } })[];
}

export function GuestHome({ categories }: Props) {
  const totalCount = categories.reduce((sum, c) => sum + (c._count?.formulas ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        {/* Hero */}
        <section className="text-center py-8">
          <h1 className="text-3xl font-bold tracking-tight">方剂口诀闯关</h1>
          <p className="mt-2 text-muted-foreground">中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/auth/register">立即开始</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">已有账号</Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3 my-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-xs text-muted-foreground mt-1">分类</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-xs text-muted-foreground mt-1">方剂</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">FSRS</div>
              <div className="text-xs text-muted-foreground mt-1">智能算法</div>
            </CardContent>
          </Card>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-3">方剂分类</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c, idx) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      <span className="text-muted-foreground mr-2">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {c.name}
                    </CardTitle>
                    <Badge variant="secondary">{c._count?.formulas ?? 0} 首</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto max-w-2xl px-4 text-center text-xs text-muted-foreground">
          方剂口诀闯关 · 传承中医智慧 · 考研方剂完整版 · By Meoo 秒悟 ×
        </div>
      </footer>
    </div>
  );
}

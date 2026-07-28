// 分类浏览页（server component）
// 接收 params.id，查询该分类下所有方剂，渲染列表 Card 跳转 /formulas/[id]
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  const [category, formulas] = await Promise.all([
    db.formulaCategory.findUnique({ where: { id: categoryId } }),
    db.formula.findMany({
      where: { categoryId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {category?.name ?? "分类"}
          </h1>
          {category?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {category.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            共 {formulas.length} 首方剂
          </p>
        </div>

        <div className="space-y-2">
          {formulas.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无方剂</p>
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
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="pt-4">
          <Link
            href="/?view=categories"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 返回分类列表
          </Link>
        </div>
      </main>
    </div>
  );
}

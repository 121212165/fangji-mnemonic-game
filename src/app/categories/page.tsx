import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await db.formulaCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { formulas: true } } },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">方剂分类</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {categories.length} 个分类
          </p>
        </div>

        <div className="space-y-2">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <Badge variant="secondary">
                      {cat._count.formulas} 首
                    </Badge>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

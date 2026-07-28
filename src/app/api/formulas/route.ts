import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/formulas - 列表查询（支持 category / level / search）
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const level = url.searchParams.get("level");
    const search = url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mnemonic: { contains: search } },
        { traditionalMnemonic: { contains: search } },
      ];
    }

    const formulas = await db.formula.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: limit,
      include: { category: true },
    });

    // 反序列化字段
    const result = formulas.map((f) => ({
      ...f,
      alias: safeParseArr(f.alias),
      ingredients: safeParseArr(f.ingredients),
      categoryName: f.category.name,
    }));

    return NextResponse.json({ formulas: result });
  } catch (e) {
    console.error("[formulas] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

function safeParseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

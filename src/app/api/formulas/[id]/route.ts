import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/formulas/[id] - 详情
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formula = await db.formula.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!formula) {
      return NextResponse.json({ error: "方剂不存在" }, { status: 404 });
    }
    return NextResponse.json({
      ...formula,
      alias: safeParseArr(formula.alias),
      ingredients: safeParseArr(formula.ingredients),
      categoryName: formula.category.name,
    });
  } catch (e) {
    console.error("[formula-detail] error", e);
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

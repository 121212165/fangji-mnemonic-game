// /api/flashcards GET
// 返回方剂卡片列表（按分类或按 FSRS dueDate）
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const mode = searchParams.get("mode"); // "due" | "all"

    let formulas;

    if (mode === "due") {
      // 查询今日到期的方剂
      const now = new Date();
      const dueMasteries = await db.userMastery.findMany({
        where: { userId, dueDate: { lte: now } },
        include: {
          formula: {
            select: {
              id: true,
              name: true,
              categoryId: true,
              ingredients: true,
              functions: true,
              indications: true,
              mnemonic: true,
              traditionalMnemonic: true,
              level: true,
            },
          },
        },
        take: 20,
        orderBy: { dueDate: "asc" },
      });
      formulas = dueMasteries.map((m) => ({
        ...m.formula,
        dueDate: m.dueDate,
        stability: m.stability,
      }));
    } else if (categoryId) {
      // 按分类查询
      formulas = await db.formula.findMany({
        where: { categoryId: parseInt(categoryId, 10) },
        select: {
          id: true,
          name: true,
          categoryId: true,
          ingredients: true,
          functions: true,
          indications: true,
          mnemonic: true,
          traditionalMnemonic: true,
          level: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 20,
      });
    } else {
      // 默认：随机 20 首
      formulas = await db.formula.findMany({
        select: {
          id: true,
          name: true,
          categoryId: true,
          ingredients: true,
          functions: true,
          indications: true,
          mnemonic: true,
          traditionalMnemonic: true,
          level: true,
        },
        take: 20,
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json({ formulas });
  } catch (e) {
    console.error("[flashcards] error", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

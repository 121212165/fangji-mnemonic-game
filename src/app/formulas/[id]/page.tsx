// 方剂详情页（server component）
// 接收 params.id（Next.js 15 中 params 为 Promise），查询方剂并反序列化字段后交给客户端组件
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FormulaDetail } from "@/components/formula-detail";
import type { Formula } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormulaDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  // Next.js 15 动态路由参数不会自动 decode，需手动处理 URL 编码
  const id = decodeURIComponent(rawId);

  const formula = await db.formula.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!formula) {
    notFound();
  }

  // 反序列化 ingredients/alias（DB 存的是 JSON 字符串）
  const serialized: Formula = {
    id: formula.id,
    name: formula.name,
    source: formula.source,
    alias: safeParseArr(formula.alias),
    categoryId: formula.categoryId,
    categoryName: formula.category?.name,
    mnemonic: formula.mnemonic,
    mnemonicExplanation: formula.mnemonicExplanation,
    traditionalMnemonic: formula.traditionalMnemonic,
    traditionalMnemonicExplanation: formula.traditionalMnemonicExplanation,
    ingredients: safeParseArr(formula.ingredients),
    functions: formula.functions,
    indications: formula.indications,
    trigger: formula.trigger,
    level: formula.level === "一类方" ? "一类方" : "二类方",
    sortOrder: formula.sortOrder,
  };

  return <FormulaDetail formula={serialized} />;
}

function safeParseArr(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

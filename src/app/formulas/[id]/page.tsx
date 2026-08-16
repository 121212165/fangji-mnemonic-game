// 方剂详情页（server component）
// ISR：1 小时重新生成一次
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { FormulaDetail } from "@/components/formula-detail";
import type { Formula } from "@/lib/types";

export const revalidate = 3600; // 1 小时 ISR

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const formula = await db.formula.findUnique({
    where: { id },
    select: { name: true, source: true },
  });
  if (!formula) {
    return { title: "方剂未找到" };
  }
  return {
    title: `${formula.name} - 方剂口诀闯关`,
    description: `${formula.name}${formula.source ? `（${formula.source}）` : ""}的组成、功用、主治与方歌`,
  };
}

export default async function FormulaDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const formula = await db.formula.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!formula) {
    notFound();
  }

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
    level: formula.level as Formula["level"],
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

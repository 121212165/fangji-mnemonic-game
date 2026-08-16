import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Flashcard } from "@/components/flashcard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string; mode?: string }>;
}

export default async function FlashcardsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { categoryId, mode } = await searchParams;
  const userId = (session.user as { id?: string }).id!;

  let formulas: Array<{
    id: string;
    name: string;
    categoryId: number;
    ingredients: string;
    functions: string;
    indications: string;
    mnemonic: string;
    traditionalMnemonic: string;
    level: string;
  }> = [];

  if (mode === "due") {
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
    formulas = dueMasteries.map((m) => m.formula);
  } else if (categoryId) {
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
      orderBy: { sortOrder: "asc" },
      take: 20,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        <Flashcard formulas={formulas} />
      </main>
    </div>
  );
}

// 把 data/formulas_parsed.json 导入数据库
// 用法: bun run db:seed
import { db } from "../src/lib/db";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface ParsedFormula {
  id: string;
  chapter: number;
  chapter_name: string;
  name: string;
  mnemonic: string;
  trigger: string;
  mnemonic_explanation?: string;
  traditional_mnemonic?: string;
  traditional_mnemonic_explanation?: string;
  ingredients?: string[];
  functions?: string;
  indications?: string;
  level?: string;
}

// 20 个分类（与原站一致）
const CATEGORIES = [
  "解表剂", "泻下剂", "和解剂", "清热剂", "祛暑剂",
  "温里剂", "表里双解剂", "补益剂", "固涩剂", "安神剂",
  "开窍剂", "理气剂", "理血剂", "治风剂", "治燥剂",
  "祛湿剂", "祛痰剂", "消食剂", "驱虫剂", "涌吐剂",
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "解表剂": "用于治疗外感表证的方剂",
  "泻下剂": "用于治疗里实积滞证的方剂",
  "和解剂": "用于治疗少阳病或肝脾不和等证的方剂",
  "清热剂": "用于治疗里热证的方剂",
  "祛暑剂": "用于治疗暑病的方剂",
  "温里剂": "用于治疗里寒证的方剂",
  "表里双解剂": "用于治疗表里同病的方剂",
  "补益剂": "用于治疗气血阴阳虚损证的方剂",
  "固涩剂": "用于治疗气血精液滑脱散失证的方剂",
  "安神剂": "用于治疗神志不安证的方剂",
  "开窍剂": "用于治疗窍闭神昏证的方剂",
  "理气剂": "用于治疗气滞或气逆证的方剂",
  "理血剂": "用于治疗血瘀或出血证的方剂",
  "治风剂": "用于治疗风病的方剂",
  "治燥剂": "用于治疗燥证的方剂",
  "祛湿剂": "用于治疗湿证的方剂",
  "祛痰剂": "用于治疗痰证的方剂",
  "消食剂": "用于治疗食积证的方剂",
  "驱虫剂": "用于治疗虫积证的方剂",
  "涌吐剂": "用于治疗痰涎宿食壅塞上脘证的方剂",
};

// slug 化函数（中文名 → 拼音 slug 备用，这里直接用原 id 加章节前缀）
function makeId(chapter: number, name: string): string {
  return `c${String(chapter).padStart(2, "0")}_${name}`;
}

async function main() {
  console.log("🌱 开始种子数据导入...");

  // 1. 创建分类
  console.log("  → 创建 20 个分类...");
  for (let i = 0; i < CATEGORIES.length; i++) {
    await db.formulaCategory.upsert({
      where: { name: CATEGORIES[i] },
      update: {
        description: CATEGORY_DESCRIPTIONS[CATEGORIES[i]],
        sortOrder: i + 1,
      },
      create: {
        name: CATEGORIES[i],
        description: CATEGORY_DESCRIPTIONS[CATEGORIES[i]],
        sortOrder: i + 1,
      },
    });
  }

  // 2. 读方剂数据
  const dataPath = resolve(process.cwd(), "data/formulas_parsed.json");
  const formulas: ParsedFormula[] = JSON.parse(readFileSync(dataPath, "utf-8"));
  console.log(`  → 读取到 ${formulas.length} 首方剂`);

  // 3. 合并已有 sample 数据
  const samplePath = resolve(process.cwd(), "data/formulas_sample.json");
  let sampleMap: Record<string, ParsedFormula> = {};
  try {
    const sampleData: ParsedFormula[] = JSON.parse(readFileSync(samplePath, "utf-8"));
    for (const s of sampleData) {
      sampleMap[s.name] = s;
    }
    console.log(`  → 合并 ${sampleData.length} 首已富化样本`);
  } catch {
    console.log("  → 无 sample 数据，跳过合并");
  }

  // 4. 导入方剂（按 name 去重，同一方剂只入库一次）
  console.log("  → 导入方剂（去重处理）...");
  let imported = 0;
  let skipped = 0;
  const seenNames = new Set<string>();

  for (const f of formulas) {
    if (seenNames.has(f.name)) {
      skipped++;
      continue;
    }
    seenNames.add(f.name);

    const id = makeId(f.chapter, f.name);
    const enriched = sampleMap[f.name];

    const data = {
      id,
      name: f.name,
      source: "", // 后续 AI 富化补全
      alias: JSON.stringify([]),
      categoryId: f.chapter,
      mnemonic: f.mnemonic,
      mnemonicExplanation: enriched?.mnemonic_explanation ?? f.mnemonic_explanation ?? "",
      traditionalMnemonic: enriched?.traditional_mnemonic ?? f.traditional_mnemonic ?? "",
      traditionalMnemonicExplanation: enriched?.traditional_mnemonic_explanation ?? f.traditional_mnemonic_explanation ?? "",
      ingredients: JSON.stringify(enriched?.ingredients ?? []),
      functions: enriched?.functions ?? f.functions ?? "",
      indications: enriched?.indications ?? f.indications ?? "",
      trigger: f.trigger,
      level: enriched?.level ?? f.level ?? "二类方",
      sortOrder: imported,
    };

    await db.formula.upsert({
      where: { id },
      update: data,
      create: data,
    });
    imported++;
  }

  console.log(`  ✅ 导入完成: ${imported} 首方剂（跳过 ${skipped} 首重复）`);

  // 5. 更新分类的方剂计数（这里不存到表，前端按需 count）
  const counts = await db.formula.groupBy({
    by: ["categoryId"],
    _count: { id: true },
  });
  console.log("  → 各分类方剂数:");
  for (const c of counts) {
    const cat = CATEGORIES[c.categoryId - 1];
    console.log(`     第${String(c.categoryId).padStart(2, "0")}章 ${cat}: ${c._count.id} 首`);
  }
}

main()
  .then(() => {
    console.log("🎉 种子完成");
    process.exit(0);
  })
  .catch((e) => {
    console.error("💥 种子失败:", e);
    process.exit(1);
  });

// 答案匹配工具：模糊评分中药组成等
// 用于闯关、背诵检测的评分

/** 字符串包含匹配（不区分大小写、空格） */
export function normalize(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase().trim();
}

/** Jaccard 相似度（用于药材列表对比） */
export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map(normalize));
  const setB = new Set(b.map(normalize));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 1;
  return intersection.size / union.size;
}

/** 药材列表对比，返回详细差异 */
export interface IngredientDiff {
  score: number; // 0-1
  correct: string[]; // 用户答对的
  missed: string[]; // 用户漏掉的
  wrong: string[]; // 用户多答的
  orderCorrect: boolean;
}

export function diffIngredients(userAnswer: string[], correctAnswer: string[]): IngredientDiff {
  const normUser = userAnswer.map(normalize);
  const normCorrect = correctAnswer.map(normalize);

  const userSet = new Set(normUser);
  const correctSet = new Set(normCorrect);

  const correct = [...new Set(normUser.filter((x) => correctSet.has(x)))];
  const missed = [...new Set(normCorrect.filter((x) => !userSet.has(x)))];
  const wrong = [...new Set(normUser.filter((x) => !correctSet.has(x)))];

  // 评分：对的/(对+漏+错)
  const total = correct.length + missed.length + wrong.length;
  const score = total === 0 ? 0 : correct.length / total;

  // 顺序检查：只在用户答对至少 50% 时检查
  let orderCorrect = true;
  if (correct.length >= Math.ceil(normCorrect.length / 2)) {
    // 取用户答案中"对的部分"的顺序
    const userCorrectOrder = normUser.filter((x) => correctSet.has(x));
    const correctOrderInUser = normCorrect.filter((x) => userSet.has(x));
    orderCorrect = JSON.stringify(userCorrectOrder) === JSON.stringify(correctOrderInUser);
  }

  return { score, correct, missed, wrong, orderCorrect };
}

/** 文本模糊匹配（用于方歌、功用主治等） */
export function textSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;

  // 编辑距离
  const lenA = na.length;
  const lenB = nb.length;
  const dp: number[][] = Array.from({ length: lenA + 1 }, () =>
    Array(lenB + 1).fill(0)
  );
  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = na[i - 1] === nb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  const distance = dp[lenA][lenB];
  return 1 - distance / Math.max(lenA, lenB);
}

/** 60% 匹配度阈值（与原站一致） */
export const PASS_THRESHOLD = 0.6;

/** 判断是否通过 */
export function isPass(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

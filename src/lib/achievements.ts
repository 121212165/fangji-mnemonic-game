// 成就系统：定义成就规则 + 判定逻辑
// code 命名规范：动词_数量（snake_case）

export interface AchievementDef {
  code: string;
  title: string;
  description: string;
  icon: string; // lucide 图标名
  /** 评估是否解锁，返回 boolean */
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalAnswers: number;
  currentStreak: number;
  longestStreak: number;
  masteredCount: number;
  totalFormulas: number;
  totalCheckIns: number;
  categoryMastery: { id: number; name: string; total: number; mastered: number }[];
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: "first_answer",
    title: "初出茅庐",
    description: "完成第一次答题",
    icon: "Sparkles",
    check: (c) => c.totalAnswers >= 1,
  },
  {
    code: "answer_100",
    title: "勤学不辍",
    description: "累计答题 100 次",
    icon: "BookOpen",
    check: (c) => c.totalAnswers >= 100,
  },
  {
    code: "answer_500",
    title: "题海战术",
    description: "累计答题 500 次",
    icon: "Library",
    check: (c) => c.totalAnswers >= 500,
  },
  {
    code: "streak_3",
    title: "三日不辍",
    description: "连续学习 3 天",
    icon: "Flame",
    check: (c) => c.longestStreak >= 3,
  },
  {
    code: "streak_7",
    title: "一周不辍",
    description: "连续学习 7 天",
    icon: "Flame",
    check: (c) => c.longestStreak >= 7,
  },
  {
    code: "streak_30",
    title: "月度坚持",
    description: "连续学习 30 天",
    icon: "Trophy",
    check: (c) => c.longestStreak >= 30,
  },
  {
    code: "mastered_10",
    title: "小有所成",
    description: "掌握 10 首方剂",
    icon: "Medal",
    check: (c) => c.masteredCount >= 10,
  },
  {
    code: "mastered_50",
    title: "学有所成",
    description: "掌握 50 首方剂",
    icon: "Award",
    check: (c) => c.masteredCount >= 50,
  },
  {
    code: "mastered_100",
    title: "方剂达人",
    description: "掌握 100 首方剂",
    icon: "Crown",
    check: (c) => c.masteredCount >= 100,
  },
  {
    code: "mastered_all",
    title: "方剂大师",
    description: "掌握全部方剂",
    icon: "Star",
    check: (c) => c.totalFormulas > 0 && c.masteredCount >= c.totalFormulas,
  },
  {
    code: "category_master",
    title: "分类通关",
    description: "在任一分类中掌握全部方剂",
    icon: "Target",
    check: (c) =>
      c.categoryMastery.some((cat) => cat.total > 0 && cat.mastered >= cat.total),
  },
  {
    code: "checkin_100",
    title: "百日打卡",
    description: "累计打卡 100 天",
    icon: "CalendarCheck",
    check: (c) => c.totalCheckIns >= 100,
  },
];

export interface AchievementResult {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

/** 根据上下文计算成就状态，合并已解锁记录 */
export function evaluateAchievements(
  ctx: AchievementContext,
  unlockedRecords: { code: string; unlockedAt: Date }[]
): AchievementResult[] {
  const unlockedMap = new Map(unlockedRecords.map((r) => [r.code, r.unlockedAt]));
  return ACHIEVEMENTS.map((def) => {
    const unlockedAt = unlockedMap.get(def.code);
    const unlocked = !!unlockedAt || def.check(ctx);
    return {
      code: def.code,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked,
      unlockedAt: unlockedAt ?? (unlocked ? new Date() : undefined),
    };
  });
}

/** 返回新解锁的成就 code 列表（需入库的） */
export function getNewlyUnlocked(
  ctx: AchievementContext,
  existingCodes: string[]
): string[] {
  const existing = new Set(existingCodes);
  return ACHIEVEMENTS.filter((def) => !existing.has(def.code) && def.check(ctx))
    .map((def) => def.code);
}

// 方剂类型定义（前端共享）

export interface Formula {
  id: string;
  name: string;
  source: string;
  alias: string[];
  categoryId: number;
  categoryName?: string;
  mnemonic: string;
  mnemonicExplanation: string;
  traditionalMnemonic: string;
  traditionalMnemonicExplanation: string;
  ingredients: string[];
  functions: string;
  indications: string;
  trigger: string;
  level: "一类方" | "二类方";
  sortOrder: number;
}

export interface FormulaCategory {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
  formulaCount?: number;
}

export interface UserMastery {
  id: number;
  userId: string;
  formulaId: string;
  stability: number;
  difficulty: number;
  retrievability: number;
  lastReview: Date | null;
  dueDate: Date;
  reviewCount: number;
  lapseCount: number;
  lastRating: "again" | "hard" | "good" | "easy" | null;
}

export interface AnswerLog {
  id: number;
  userId: string;
  formulaId: string;
  mode: "learn" | "quiz" | "recite" | "asr";
  questionType: "ingredients" | "mnemonic" | "functions" | "indications";
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  matchScore: number;
  timeSpentSeconds: number;
  rating: "again" | "hard" | "good" | "easy" | null;
  createdAt: Date;
}

export interface DailyPlanItem {
  formulaId: string;
  formulaName: string;
  reason: string;
  type: "new" | "review";
}

export interface DailyPlan {
  id: number;
  userId: string;
  planDate: Date;
  recommendedFormulas: DailyPlanItem[];
  newCount: number;
  reviewCount: number;
  completedCount: number;
  isCompleted: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
  totalCheckIns: number;
}

export type StudyStage = "newbie" | "intensive" | "sprint" | "final";

export interface User {
  id: string;
  email: string;
  name: string | null;
  studyStage: StudyStage;
  dailyGoal: number;
}

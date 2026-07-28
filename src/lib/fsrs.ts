// FSRS 间隔重复算法封装
// 基于 ts-fsrs 库（v4.7+），提供方剂记忆调度
import { fsrs as createFsrs, createEmptyCard, Rating, type Card, type Grade } from "ts-fsrs";

// 默认参数（FSRS-4.5 推荐参数）
const f = createFsrs({
  enable_fuzz: true,
  enable_short_term: true,
  request_retention: 0.9,
  maximum_interval: 365,
});

export type FsrsRating = "again" | "hard" | "good" | "easy";

export interface MasteryState {
  stability: number;
  difficulty: number;
  retrievability: number;
  lastReview: Date | null;
  dueDate: Date;
  reviewCount: number;
  lapseCount: number;
  lastRating: FsrsRating | null;
}

export interface ReviewResult {
  state: MasteryState;
  /** 当前可提取性（0-1） */
  retrievability: number;
  /** 新的 due_date */
  due: Date;
}

/** 新方剂的初始状态 */
export function initialMastery(): MasteryState {
  return {
    stability: 0,
    difficulty: 0,
    retrievability: 1,
    lastReview: null,
    dueDate: new Date(),
    reviewCount: 0,
    lapseCount: 0,
    lastRating: null,
  };
}

/** 评级映射：原站四级 → FSRS Rating */
export function mapRating(rating: FsrsRating): Rating {
  switch (rating) {
    case "again": return Rating.Again;
    case "hard": return Rating.Hard;
    case "good": return Rating.Good;
    case "easy": return Rating.Easy;
  }
}

/**
 * 应用一次复习，返回新状态
 * @param prev 之前状态
 * @param rating 用户评级
 * @param now 当前时间
 */
export function review(
  prev: MasteryState,
  rating: FsrsRating,
  now: Date = new Date()
): ReviewResult {
  const r = mapRating(rating);

  // 构造 ts-fsrs 卡片
  let card: Card;
  if (prev.stability === 0 || prev.reviewCount === 0) {
    // 首次学习：用空卡
    card = createEmptyCard(now);
  } else {
    const elapsedDays = prev.lastReview
      ? Math.max(0, Math.floor((now.getTime() - prev.lastReview.getTime()) / 86400_000))
      : 0;
    const scheduledDays = Math.max(1, Math.floor(
      (prev.dueDate.getTime() - (prev.lastReview?.getTime() ?? now.getTime())) / 86400_000
    ));
    card = {
      due: prev.dueDate,
      stability: prev.stability,
      difficulty: prev.difficulty,
      elapsed_days: elapsedDays,
      scheduled_days: scheduledDays,
      reps: prev.reviewCount,
      lapses: prev.lapseCount,
      state: 2, // State.Review
      last_review: prev.lastReview ?? undefined,
    };
  }

  const preview = f.repeat(card, now);
  const result = preview[r as Grade];
  const updatedCard: Card = result.card;

  const newState: MasteryState = {
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    retrievability: prev.stability === 0 ? 1 : retrievability(prev, now),
    lastReview: now,
    dueDate: updatedCard.due instanceof Date ? updatedCard.due : new Date(updatedCard.due),
    reviewCount: updatedCard.reps,
    lapseCount: updatedCard.lapses,
    lastRating: rating,
  };

  return {
    state: newState,
    retrievability: newState.retrievability,
    due: newState.dueDate,
  };
}

/** 计算当前可提取性 R = (1 + t/(9·S))^(-1) */
export function retrievability(state: MasteryState, now: Date = new Date()): number {
  if (state.stability === 0) return 1; // 新卡片默认 100%
  if (!state.lastReview) return 1;
  const t = Math.max(0, (now.getTime() - state.lastReview.getTime()) / 86400_000);
  return Math.pow(1 + t / (9 * state.stability), -1);
}

/** 是否到期需要复习 */
export function isDue(state: MasteryState, now: Date = new Date()): boolean {
  return state.dueDate.getTime() <= now.getTime();
}

/** 计算下次到期天数 */
export function daysUntilDue(state: MasteryState, now: Date = new Date()): number {
  return Math.ceil((state.dueDate.getTime() - now.getTime()) / 86400_000);
}

export { Rating };

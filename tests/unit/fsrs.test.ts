// FSRS 算法单元测试（不 mock ts-fsrs，直接测真实实现）
import { describe, it, expect } from "vitest";
import {
  initialMastery,
  review,
  retrievability,
  isDue,
  daysUntilDue,
  mapRating,
  type FsrsRating,
} from "@/lib/fsrs";
import { Rating } from "ts-fsrs";

describe("initialMastery", () => {
  it("返回 stability=0 的初始状态", () => {
    const s = initialMastery();
    expect(s.stability).toBe(0);
    expect(s.difficulty).toBe(0);
    expect(s.retrievability).toBe(1);
    expect(s.lastReview).toBeNull();
    expect(s.reviewCount).toBe(0);
    expect(s.lapseCount).toBe(0);
    expect(s.lastRating).toBeNull();
  });

  it("初始状态 dueDate 应是当前时间附近", () => {
    const before = Date.now() - 1000;
    const s = initialMastery();
    const after = Date.now() + 1000;
    expect(s.dueDate.getTime()).toBeGreaterThanOrEqual(before);
    expect(s.dueDate.getTime()).toBeLessThanOrEqual(after);
  });
});

describe("mapRating", () => {
  it("again → Rating.Again (1)", () => {
    expect(mapRating("again")).toBe(Rating.Again);
  });
  it("hard → Rating.Hard (2)", () => {
    expect(mapRating("hard")).toBe(Rating.Hard);
  });
  it("good → Rating.Good (3)", () => {
    expect(mapRating("good")).toBe(Rating.Good);
  });
  it("easy → Rating.Easy (4)", () => {
    expect(mapRating("easy")).toBe(Rating.Easy);
  });
});

describe("review - 首次学习", () => {
  it("good 评级后 stability > 0", () => {
    const initial = initialMastery();
    const result = review(initial, "good");
    expect(result.state.stability).toBeGreaterThan(0);
  });

  it("easy 评级后 stability > good 评级", () => {
    const initial = initialMastery();
    const good = review(initial, "good");
    const easy = review(initial, "easy");
    expect(easy.state.stability).toBeGreaterThan(good.state.stability);
  });

  it("reviewCount 从 0 变 1", () => {
    const initial = initialMastery();
    const result = review(initial, "good");
    expect(result.state.reviewCount).toBe(1);
  });

  it("dueDate 在未来", () => {
    const initial = initialMastery();
    const now = new Date();
    const result = review(initial, "good", now);
    expect(result.due.getTime()).toBeGreaterThan(now.getTime());
  });

  it("lastReview 等于 now", () => {
    const initial = initialMastery();
    const now = new Date("2026-06-17T10:00:00Z");
    const result = review(initial, "good", now);
    expect(result.state.lastReview).toEqual(now);
  });

  it("lastRating 记录正确评级", () => {
    const initial = initialMastery();
    const result = review(initial, "easy");
    expect(result.state.lastRating).toBe("easy");
  });
});

describe("review - 多次复习", () => {
  it("again 评级后 lapseCount +1", () => {
    let state = initialMastery();
    state = review(state, "good").state; // 首次学习
    const result = review(state, "again"); // 复习失败
    expect(result.state.lapseCount).toBe(1);
  });

  it("good 评级后 lapseCount 不变", () => {
    let state = initialMastery();
    state = review(state, "good").state;
    const result = review(state, "good");
    expect(result.state.lapseCount).toBe(0);
  });

  it("reviewCount 累加", () => {
    let state = initialMastery();
    state = review(state, "good").state;
    expect(state.reviewCount).toBe(1);
    state = review(state, "good").state;
    expect(state.reviewCount).toBe(2);
    state = review(state, "hard").state;
    expect(state.reviewCount).toBe(3);
  });

  it("good 评级连续复习后 stability 递增（长期记忆增强）", () => {
    let state = initialMastery();
    state = review(state, "good").state;
    const s1 = state.stability;
    // 模拟到期再复习
    state.dueDate = new Date(Date.now() - 86400_000); // 已逾期 1 天
    state = review(state, "good").state;
    const s2 = state.stability;
    expect(s2).toBeGreaterThanOrEqual(s1);
  });
});

describe("retrievability", () => {
  it("新卡片返回 1", () => {
    const state = initialMastery();
    expect(retrievability(state)).toBe(1);
  });

  it("刚复习后（t=0）返回 1", () => {
    const now = new Date();
    const state = review(initialMastery(), "good", now).state;
    expect(retrievability(state, now)).toBeCloseTo(1, 5);
  });

  it("时间越久 retrievability 越低", () => {
    const now = new Date("2026-06-17T10:00:00Z");
    const state = review(initialMastery(), "good", now).state;
    const later = new Date("2026-06-20T10:00:00Z"); // 3 天后
    const r1 = retrievability(state, new Date("2026-06-18T10:00:00Z")); // 1 天后
    const r2 = retrievability(state, later); // 3 天后
    expect(r1).toBeGreaterThan(r2);
    expect(r2).toBeGreaterThan(0);
    expect(r2).toBeLessThan(1);
  });
});

describe("isDue", () => {
  it("初始状态 dueDate 是 now 附近，应判断为到期", () => {
    const state = initialMastery();
    expect(isDue(state)).toBe(true);
  });

  it("刚 good 评级后 dueDate 在未来，不应到期", () => {
    const now = new Date();
    const state = review(initialMastery(), "good", now).state;
    expect(isDue(state, now)).toBe(false);
  });
});

describe("daysUntilDue", () => {
  it("初始状态返回 0 附近", () => {
    const state = initialMastery();
    const d = daysUntilDue(state);
    expect(d).toBeLessThanOrEqual(0);
  });

  it("good 评级后返回正数", () => {
    const now = new Date();
    const state = review(initialMastery(), "good", now).state;
    const d = daysUntilDue(state, now);
    expect(d).toBeGreaterThan(0);
  });
});

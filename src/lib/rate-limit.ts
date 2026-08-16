// 简易内存限流（滑动窗口）
// 注意：Vercel Serverless 每个实例独立计数，是多实例下的近似限流
// 高并发场景建议升级到 Upstash Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 定期清理过期条目，防止内存泄漏
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 分钟
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

// 预定义限流策略
export const RATE_LIMITS = {
  register: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 次/小时
  login: { limit: 10, windowMs: 60 * 1000 }, // 10 次/分钟
  answer: { limit: 60, windowMs: 60 * 1000 }, // 60 次/分钟
  aiRecommend: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 次/小时
  aiConversation: { limit: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 次/天
  forgotPassword: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 次/小时
  feedback: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 次/小时
} as const;

// 路径到限流策略的映射
export function getRateLimitConfig(pathname: string): {
  limit: number;
  windowMs: number;
} | null {
  if (pathname === "/api/register") return RATE_LIMITS.register;
  if (pathname === "/api/auth/callback/credentials")
    return RATE_LIMITS.login;
  if (pathname === "/api/answer") return RATE_LIMITS.answer;
  if (pathname === "/api/ai/daily-recommend") return RATE_LIMITS.aiRecommend;
  if (pathname.startsWith("/api/ai/conversation"))
    return RATE_LIMITS.aiConversation;
  if (pathname === "/api/forgot-password") return RATE_LIMITS.forgotPassword;
  if (pathname === "/api/feedback") return RATE_LIMITS.feedback;
  return null;
}

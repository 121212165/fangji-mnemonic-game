// 轻量结构化日志
// 生产环境可升级到 pino 或集成 Sentry
// 当前提供结构化输出，便于 Vercel 日志检索

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, ctx?: LogContext): string {
  const timestamp = new Date().toISOString();
  const base = { timestamp, level, message };
  const merged = ctx ? { ...base, ...ctx } : base;
  return JSON.stringify(merged);
}

export const logger = {
  info(message: string, ctx?: LogContext) {
    console.log(formatLog("info", message, ctx));
  },
  warn(message: string, ctx?: LogContext) {
    console.warn(formatLog("warn", message, ctx));
  },
  error(message: string, ctx?: LogContext) {
    console.error(formatLog("error", message, ctx));
  },
  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog("debug", message, ctx));
    }
  },
};

// 生成唯一请求 ID（用于关联同一请求的多条日志）
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

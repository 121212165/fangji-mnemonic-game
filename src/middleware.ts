import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitConfig } from "@/lib/rate-limit";

// 不需要 CSRF 校验的路径
const CSRF_EXEMPT_PATHS = [
  "/api/auth", // NextAuth 自带 CSRF
  "/api/health", // 健康检查
];

// 允许的 Origin（生产环境从环境变量读取）
function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origins = [appUrl].filter(Boolean) as string[];
  // 开发环境额外允许 localhost
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
  }
  return origins;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // 1. CSRF 校验：对所有 /api/* POST/PUT/PATCH/DELETE 请求（排除豁免路径）
  if (
    method !== "GET" &&
    method !== "HEAD" &&
    pathname.startsWith("/api/") &&
    !CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const allowedOrigins = getAllowedOrigins();

    if (allowedOrigins.length > 0) {
      const isValidOrigin =
        (origin && allowedOrigins.includes(origin)) ||
        (referer && allowedOrigins.some((o) => referer.startsWith(o)));

      if (!isValidOrigin) {
        return NextResponse.json(
          { error: "跨站请求被拒绝" },
          { status: 403 }
        );
      }
    }
  }

  // 2. 限流：对所有 /api/* 请求应用限流
  if (pathname.startsWith("/api/")) {
    const config = getRateLimitConfig(pathname);
    if (config) {
      // 用 IP + 路径作为限流 key
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";
      const key = `${ip}:${pathname}`;
      const result = rateLimit(key, config.limit, config.windowMs);

      if (!result.success) {
        return NextResponse.json(
          { error: "请求过于频繁，请稍后再试" },
          {
            status: 429,
            headers: {
              "Retry-After": String(
                Math.ceil((result.resetAt - Date.now()) / 1000)
              ),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(result.resetAt),
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set(
        "X-RateLimit-Remaining",
        String(result.remaining)
      );
      response.headers.set(
        "X-RateLimit-Reset",
        String(result.resetAt)
      );
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

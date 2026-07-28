import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 允许 Postgres 等 Node 模块在 server 端使用
  serverExternalPackages: ["@prisma/client", "ts-fsrs"],
  // 测试时关闭 ESLint 阻塞
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

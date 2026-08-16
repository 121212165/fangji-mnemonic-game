import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getUmamiScriptSrc } from "@/lib/analytics";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "方剂口诀闯关 · AI 增强版",
    template: "%s · 方剂口诀闯关",
  },
  description: "中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈，支持 FSRS 间隔重复、语音背诵、AI 对话",
  keywords: ["方剂学", "中医考研", "方歌", "口诀", "FSRS", "间隔重复", "AI 学习"],
  authors: [{ name: "方剂口诀闯关" }],
  creator: "方剂口诀闯关",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: appUrl,
    title: "方剂口诀闯关 · AI 增强版",
    description: "中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈",
    siteName: "方剂口诀闯关",
  },
  twitter: {
    card: "summary_large_image",
    title: "方剂口诀闯关 · AI 增强版",
    description: "中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const umamiSrc = getUmamiScriptSrc();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        {/* Umami 隐私友好埋点（未配置 NEXT_PUBLIC_UMAMI_WEBSITE_ID 时不加载） */}
        {umamiSrc && (
          <Script
            src={umamiSrc}
            strategy="afterInteractive"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, Search, AlertCircle, BarChart3, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-base font-bold">方剂口诀闯关</span>
        </Link>
        <nav className="flex items-center gap-0.5">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/categories" aria-label="分类">
                  <BookOpen className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">分类</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/search" aria-label="搜索">
                  <Search className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">搜索</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/errors" aria-label="错题本">
                  <AlertCircle className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">错题</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/ai" aria-label="AI 助手">
                  <Bot className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">AI</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/stats" aria-label="统计">
                  <BarChart3 className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">统计</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link href="/settings" aria-label="设置">
                  <Settings className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">我的</span>
                </Link>
              </Button>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/auth/register">注册</Link>
              </Button>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

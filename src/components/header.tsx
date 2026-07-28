"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, Calendar, Search, Trophy, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-base font-bold">方剂口诀闯关</span>
        </Link>
        <nav className="flex items-center gap-1">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/?view=categories">
                  <Calendar className="mr-1 h-4 w-4" /> 分类
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/?view=search">
                  <Search className="mr-1 h-4 w-4" /> 搜索
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/?view=profile">
                  <Trophy className="mr-1 h-4 w-4" /> 我的
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/auth/register">注册</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

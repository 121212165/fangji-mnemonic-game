"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Zap } from "lucide-react";

interface PlanItem {
  formulaId: string;
  formulaName: string;
  reason: string;
  type: "new" | "review";
  completed?: boolean;
}

interface SerializedPlan {
  id: number;
  planDate: string;
  recommendedFormulas: PlanItem[];
  newCount: number;
  reviewCount: number;
  completedCount: number;
  isCompleted: boolean;
}

interface Props {
  plan: SerializedPlan | null;
  stats: {
    masteredCount: number;
    totalFormulas: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export function TodayHome({ plan, stats }: Props) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const progress = useMemo(() => {
    if (!plan || plan.recommendedFormulas.length === 0) return 0;
    return Math.round((plan.completedCount / plan.recommendedFormulas.length) * 100);
  }, [plan]);

  const masteryPercent = stats.totalFormulas > 0
    ? Math.round((stats.masteredCount / stats.totalFormulas) * 100)
    : 0;

  /** 「一键开始」按钮：调 /api/today-plan/next 拿下一个方剂，然后跳转学习页 */
  async function handleStart() {
    if (!plan || plan.isCompleted || starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/today-plan/next");
      if (!res.ok) return;
      const data = await res.json();
      if (data.done) {
        // 今日计划已全部完成，刷新以同步进度
        router.refresh();
        return;
      }
      if (data.formulaId) {
        router.push(`/formulas/${encodeURIComponent(data.formulaId)}?mode=learn`);
      }
    } catch {
      // 静默失败：网络异常时不阻塞 UI
    } finally {
      setStarting(false);
    }
  }

  /** 「查看错题本」按钮：占位跳转 */
  function handleErrors() {
    router.push("/?view=errors");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* 进度条置顶 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">今日学习</CardTitle>
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-accent" />
                <span className="font-medium">{stats.currentStreak}</span>
                <span className="text-muted-foreground">天连击</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                已完成 <span className="font-medium text-foreground">{plan?.completedCount ?? 0}</span>
                {" "}/ {plan?.recommendedFormulas.length ?? 0} 首
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* 整体统计 */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{stats.masteredCount}</div>
              <div className="text-xs text-muted-foreground mt-1">已学方剂</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{masteryPercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">掌握度</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-xl font-bold">{stats.longestStreak}</div>
              <div className="text-xs text-muted-foreground mt-1">最长连击</div>
            </CardContent>
          </Card>
        </div>

        {/* 今日推荐 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今日推荐</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan?.recommendedFormulas.map((item, idx) => (
              <div
                key={item.formulaId}
                className={`flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors ${item.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground w-6 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {item.formulaName}
                      {item.completed && <span className="ml-2 text-emerald-600">✓</span>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{item.reason}</div>
                  </div>
                </div>
                <Badge variant={item.type === "new" ? "accent" : "secondary"}>
                  {item.type === "new" ? "新学" : "复习"}
                </Badge>
              </div>
            ))}
            {(!plan || plan.recommendedFormulas.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                暂无推荐，请先学习几首方剂
              </div>
            )}
          </CardContent>
        </Card>

        {/* 一键开始 */}
        <Button
          size="lg"
          variant="accent"
          className="w-full"
          disabled={!plan || plan.isCompleted || starting}
          onClick={handleStart}
        >
          {plan?.isCompleted
            ? "今日已完成 ✓"
            : starting
            ? "加载中..."
            : "一键开始今日学习"}
        </Button>

        {/* 错题入口（占位，后续连接错题本） */}
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={handleErrors}
        >
          查看错题本
        </Button>
      </main>
    </div>
  );
}

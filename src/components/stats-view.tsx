"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles, BookOpen, Library, Flame, Trophy, Medal,
  Award, Crown, Star, Target, CalendarCheck,
} from "lucide-react";

interface Summary {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  totalStudySeconds: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  masteredCount: number;
  totalFormulas: number;
  categoryMastery: { id: number; name: string; total: number; learned: number; mastered: number }[];
}

interface WeeklyData {
  days: { date: string; correctCount: number; wrongCount: number; totalTimeSeconds: number; reviewCount: number }[];
  totals: { correctCount: number; wrongCount: number; totalTimeSeconds: number; reviewCount: number };
}

interface Distribution {
  total: number;
  unlearned: number;
  beginner: number;
  familiar: number;
  mastered: number;
}

interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, BookOpen, Library, Flame, Trophy, Medal,
  Award, Crown, Star, Target, CalendarCheck,
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}分钟`;
  const h = Math.floor(m / 60);
  const restM = m % 60;
  return `${h}小时${restM > 0 ? `${restM}分` : ""}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function StatsView() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [s, w, d, a] = await Promise.all([
          fetch("/api/stats/summary").then((r) => r.json()),
          fetch("/api/stats/weekly").then((r) => r.json()),
          fetch("/api/stats/mastery-distribution").then((r) => r.json()),
          fetch("/api/achievements").then((r) => r.json()),
        ]);
        setSummary(s);
        setWeekly(w);
        setDistribution(d);
        setAchievements(a.achievements ?? []);
        if (a.newlyUnlocked?.length > 0) {
          toast(`解锁 ${a.newlyUnlocked.length} 个新成就！`, "success");
        }
      } catch {
        toast("统计数据加载失败", "error");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxDaily = weekly
    ? Math.max(1, ...weekly.days.map((d) => d.correctCount + d.wrongCount))
    : 1;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">学习统计</h1>
        <p className="text-sm text-muted-foreground mt-1">你的学习数据与成就</p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">总答题</div>
            <div className="text-2xl font-bold mt-1">{summary?.totalAnswers ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">正确率</div>
            <div className="text-2xl font-bold mt-1">{summary?.accuracy ?? 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">学习时长</div>
            <div className="text-2xl font-bold mt-1">
              {formatDuration(summary?.totalStudySeconds ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">连续打卡</div>
            <div className="text-2xl font-bold mt-1">
              {summary?.currentStreak ?? 0} <span className="text-sm font-normal">天</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7 日柱状图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近 7 天</CardTitle>
          <CardDescription>
            正确 {weekly?.totals.correctCount ?? 0} · 错误 {weekly?.totals.wrongCount ?? 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1 h-32">
            {weekly?.days.map((d) => {
              const total = d.correctCount + d.wrongCount;
              const height = (total / maxDaily) * 100;
              const correctRatio = total > 0 ? (d.correctCount / total) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-muted-foreground">
                    {total > 0 ? total : ""}
                  </div>
                  <div
                    className="w-full rounded-t overflow-hidden flex flex-col justify-end"
                    style={{ height: `${Math.max(height, 2)}%`, minHeight: "4px" }}
                  >
                    {total > 0 && (
                      <>
                        <div
                          className="bg-destructive/70"
                          style={{ height: `${100 - correctRatio}%` }}
                        />
                        <div
                          className="bg-accent"
                          style={{ height: `${correctRatio}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(d.date)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-accent rounded-sm" /> 正确
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-destructive/70 rounded-sm" /> 错误
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 掌握度分布 */}
      {distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">掌握度分布</CardTitle>
            <CardDescription>共 {distribution.total} 首方剂</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DistBar label="未学" count={distribution.unlearned} total={distribution.total} color="bg-muted" />
            <DistBar label="入门" count={distribution.beginner} total={distribution.total} color="bg-blue-400" />
            <DistBar label="熟悉" count={distribution.familiar} total={distribution.total} color="bg-amber-400" />
            <DistBar label="掌握" count={distribution.mastered} total={distribution.total} color="bg-emerald-500" />
          </CardContent>
        </Card>
      )}

      {/* 分类掌握度 */}
      {summary && summary.categoryMastery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">分类掌握</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.categoryMastery.map((cat) => {
              const ratio = cat.total > 0 ? (cat.mastered / cat.total) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">
                      {cat.mastered}/{cat.total}
                    </span>
                  </div>
                  <Progress value={ratio} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 成就徽章 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">成就</CardTitle>
          <CardDescription>
            已解锁 {unlockedCount}/{achievements.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {achievements.map((a) => {
              const Icon = ICON_MAP[a.icon] ?? Sparkles;
              return (
                <div
                  key={a.code}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-center ${
                    a.unlocked
                      ? "border-accent bg-accent/5"
                      : "border-input opacity-40 grayscale"
                  }`}
                  title={a.description}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-xs font-medium leading-tight">{a.title}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DistBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const ratio = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

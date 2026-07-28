"use client";

// 闯关答题子组件
// 显示方歌提示，输入药物组成，提交后用 diffIngredients 评分
// 显示结果：通过/未通过、得分、漏药、多答药
// 评级按钮组（答完后）：重来/困难/良好/简单 4 个按钮，点击再调一次 /api/answer 带 rating
// 「下一题」按钮：调 /api/today-plan/next 跳转下一个方剂
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Formula } from "@/lib/types";
import { diffIngredients, isPass } from "@/lib/match";

interface Props {
  formula: Formula;
}

type Rating = "again" | "hard" | "good" | "easy";

interface QuizResult {
  score: number;
  passed: boolean;
  correct: string[];
  missed: string[];
  wrong: string[];
}

/** 按 [、,，\s]+ 切分用户输入 */
function splitIngredients(s: string): string[] {
  return s
    .split(/[、,，\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function QuizMode({ formula }: Props) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  async function handleSubmit() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const userArr = splitIngredients(answer);
      const diff = diffIngredients(userArr, formula.ingredients);
      const passed = isPass(diff.score);
      const res: QuizResult = {
        score: diff.score,
        passed,
        correct: diff.correct,
        missed: diff.missed,
        wrong: diff.wrong,
      };
      setResult(res);

      // 调 /api/answer 记录（mode=quiz, questionType=ingredients）
      try {
        await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formulaId: formula.id,
            mode: "quiz",
            questionType: "ingredients",
            userAnswer: answer,
          }),
        });
      } catch {
        // 静默失败：网络异常不阻塞 UI
      }

      // 调 /api/today-plan/complete 标记本方剂为已完成
      try {
        await fetch("/api/today-plan/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formulaId: formula.id }),
        });
      } catch {
        // 静默失败
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRating(r: Rating) {
    if (ratingSubmitting) return;
    setRatingSubmitting(true);
    setSelectedRating(r);
    try {
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaId: formula.id,
          mode: "quiz",
          questionType: "ingredients",
          userAnswer: answer,
          rating: r,
        }),
      });
    } catch {
      // 静默失败
    } finally {
      setRatingSubmitting(false);
    }
  }

  async function handleNext() {
    try {
      const res = await fetch("/api/today-plan/next");
      if (!res.ok) return;
      const data = await res.json();
      if (data.done) {
        router.push("/");
        return;
      }
      if (data.formulaId) {
        router.push(`/formulas/${encodeURIComponent(data.formulaId)}?mode=quiz`);
      }
    } catch {
      // 静默失败
    }
  }

  function handleRetry() {
    setAnswer("");
    setResult(null);
    setSelectedRating(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">闯关测试 · 写出药物组成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formula.traditionalMnemonic && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">方歌提示</p>
            <p className="text-sm leading-relaxed">{formula.traditionalMnemonic}</p>
          </div>
        )}

        <div className="space-y-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="请输入药物组成，用顿号分隔"
            disabled={!!result || submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !result) {
                handleSubmit();
              }
            }}
            aria-label="药物组成输入"
          />
          {!result && (
            <Button
              variant="accent"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? "提交中..." : "提交答案"}
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                result.passed
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.passed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div className="text-sm font-medium">
                {result.passed ? "通过！" : "未通过"}
                <span className="ml-2">
                  得分：{Math.round(result.score * 100)} 分
                </span>
              </div>
            </div>

            {result.missed.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">漏掉的药</p>
                <div className="flex flex-wrap gap-2">
                  {result.missed.map((s, i) => (
                    <Badge key={i} variant="destructive">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.wrong.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">多答的药</p>
                <div className="flex flex-wrap gap-2">
                  {result.wrong.map((s, i) => (
                    <Badge key={i} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground">请评估本次答题感受</p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant={selectedRating === "again" ? "default" : "outline"}
                  onClick={() => handleRating("again")}
                  disabled={ratingSubmitting}
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> 重来
                </Button>
                <Button
                  size="sm"
                  variant={selectedRating === "hard" ? "default" : "outline"}
                  onClick={() => handleRating("hard")}
                  disabled={ratingSubmitting}
                >
                  困难
                </Button>
                <Button
                  size="sm"
                  variant={selectedRating === "good" ? "accent" : "outline"}
                  onClick={() => handleRating("good")}
                  disabled={ratingSubmitting}
                >
                  良好
                </Button>
                <Button
                  size="sm"
                  variant={selectedRating === "easy" ? "accent" : "outline"}
                  onClick={() => handleRating("easy")}
                  disabled={ratingSubmitting}
                >
                  简单
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                <RotateCcw className="mr-1 h-4 w-4" /> 再来一次
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                className="ml-auto"
              >
                下一题 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

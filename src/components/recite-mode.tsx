"use client";

// 背诵检测子组件
// 顶部 3 个题型按钮：药物组成 / 方歌口诀 / 功用主治
// 输入答案 → 提交评分：
//   - ingredients：用 diffIngredients
//   - mnemonic：用 textSimilarity 比对 traditionalMnemonic
//   - functions：用 textSimilarity 比对 functions
// 显示得分 + 是否通过，调 /api/answer 记录（mode=recite, questionType 对应）
// 「下一题」按钮：调 /api/today-plan/next 跳转下一个方剂
// 顶部连对计数：本次会话连续答对数（useState 累计）
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Flame, XCircle } from "lucide-react";
import type { Formula } from "@/lib/types";
import { diffIngredients, textSimilarity, isPass } from "@/lib/match";

interface Props {
  formula: Formula;
}

type QType = "ingredients" | "mnemonic" | "functions";

interface QTypeConfig {
  value: QType;
  label: string;
  placeholder: string;
}

const Q_TYPES: QTypeConfig[] = [
  {
    value: "ingredients",
    label: "药物组成",
    placeholder: "请输入药物组成，用顿号分隔",
  },
  {
    value: "mnemonic",
    label: "方歌口诀",
    placeholder: "请默写传统方歌",
  },
  {
    value: "functions",
    label: "功用主治",
    placeholder: "请默写功用主治",
  },
];

interface ReciteResult {
  score: number;
  passed: boolean;
  missed?: string[];
  wrong?: string[];
}

/** 按 [、,，\s]+ 切分用户输入 */
function splitIngredients(s: string): string[] {
  return s
    .split(/[、,，\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function ReciteMode({ formula }: Props) {
  const router = useRouter();
  const [qType, setQType] = useState<QType>("ingredients");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReciteResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 本次会话连续答对数
  const [streak, setStreak] = useState(0);

  function switchQType(t: QType) {
    setQType(t);
    setAnswer("");
    setResult(null);
  }

  async function handleSubmit() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      let score = 0;
      let missed: string[] | undefined;
      let wrong: string[] | undefined;

      if (qType === "ingredients") {
        const userArr = splitIngredients(answer);
        const diff = diffIngredients(userArr, formula.ingredients);
        score = diff.score;
        missed = diff.missed;
        wrong = diff.wrong;
      } else {
        const reference =
          qType === "mnemonic" ? formula.traditionalMnemonic : formula.functions;
        score = textSimilarity(answer, reference || "");
      }

      const passed = isPass(score);
      setResult({ score, passed, missed, wrong });

      // 连对计数：通过则 +1，否则归零
      if (passed) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      // 调 /api/answer 记录
      try {
        await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formulaId: formula.id,
            mode: "recite",
            questionType: qType,
            userAnswer: answer,
          }),
        });
      } catch {
        // 静默失败
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
        router.push(`/formulas/${encodeURIComponent(data.formulaId)}?mode=recite`);
      }
    } catch {
      // 静默失败
    }
  }

  function handleRetry() {
    setAnswer("");
    setResult(null);
  }

  const qConfig = Q_TYPES.find((q) => q.value === qType)!;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">背诵检测</CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-accent" />
            <span className="font-medium">{streak}</span>
            <span className="text-muted-foreground">连对</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 题型选择 */}
        <div className="grid grid-cols-3 gap-2">
          {Q_TYPES.map((q) => (
            <Button
              key={q.value}
              size="sm"
              variant={qType === q.value ? "accent" : "outline"}
              onClick={() => switchQType(q.value)}
              disabled={submitting}
            >
              {q.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={qConfig.placeholder}
            disabled={!!result || submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !result) {
                handleSubmit();
              }
            }}
            aria-label="答案输入"
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

            {qType === "ingredients" &&
              result.missed &&
              result.missed.length > 0 && (
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

            {qType === "ingredients" &&
              result.wrong &&
              result.wrong.length > 0 && (
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

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                再来一次
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

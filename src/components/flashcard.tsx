"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface FormulaData {
  id: string;
  name: string;
  categoryId: number;
  ingredients: string;
  functions: string;
  indications: string;
  mnemonic: string;
  traditionalMnemonic: string;
  level: string;
}

interface Props {
  formulas: FormulaData[];
}

function safeParseArr(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function Flashcard({ formulas }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);

  if (formulas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-muted-foreground">暂无卡片</p>
        <Button variant="accent" size="sm" onClick={() => router.push("/categories")}>
          浏览分类
        </Button>
      </div>
    );
  }

  const formula = formulas[current];
  const ingredients = safeParseArr(formula.ingredients);
  const progress = ((current + 1) / formulas.length) * 100;

  function goNext() {
    if (current < formulas.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
      setRated(false);
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
      setRated(false);
    }
  }

  async function handleRate(rating: "again" | "hard" | "good" | "easy") {
    if (rated) return;
    setRated(true);
    try {
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaId: formula.id,
          mode: "learn",
          questionType: "ingredients",
          userAnswer: ingredients.join("、"),
          rating,
        }),
      });
    } catch {
      toast("评级提交失败", "error");
    }
  }

  return (
    <div className="space-y-4">
      {/* 进度 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {current + 1} / {formulas.length}
        </span>
        <div className="flex-1 mx-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 翻转卡 */}
      <div
        className={`flip-card ${flipped ? "flipped" : ""}`}
        style={{ height: "400px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-card-inner">
          {/* 正面 */}
          <div className="flip-card-front">
            <div className="h-full flex flex-col items-center justify-center gap-4 p-6 border rounded-lg bg-white">
              <Badge variant={formula.level === "一类方" ? "accent" : "secondary"}>
                {formula.level}
              </Badge>
              <h2 className="text-3xl font-bold text-center">{formula.name}</h2>
              <p className="text-xs text-muted-foreground">点击查看背面</p>
            </div>
          </div>
          {/* 背面 */}
          <div className="flip-card-back">
            <div className="h-full flex flex-col gap-3 p-6 border rounded-lg bg-white overflow-y-auto">
              <div>
                <p className="text-xs text-muted-foreground mb-1">药物组成</p>
                <p className="text-sm">{ingredients.join("、") || "无"}</p>
              </div>
              {formula.functions && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">功用</p>
                  <p className="text-sm">{formula.functions}</p>
                </div>
              )}
              {formula.traditionalMnemonic && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">方歌</p>
                  <p className="text-sm leading-relaxed">{formula.traditionalMnemonic}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 评级按钮 */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleRate("again"); }}
            disabled={rated}
          >
            不会
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleRate("hard"); }}
            disabled={rated}
          >
            模糊
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleRate("good"); }}
            disabled={rated}
          >
            掌握
          </Button>
          <Button
            size="sm"
            variant="accent"
            onClick={(e) => { e.stopPropagation(); handleRate("easy"); }}
            disabled={rated}
          >
            熟练
          </Button>
        </div>
      )}

      {/* 导航 */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={current === 0}
        >
          <ChevronLeft className="h-4 w-4" /> 上一张
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setFlipped(false); setRated(false); }}
        >
          <RotateCcw className="h-4 w-4" /> 重置
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goNext}
          disabled={current === formulas.length - 1}
        >
          下一张 <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

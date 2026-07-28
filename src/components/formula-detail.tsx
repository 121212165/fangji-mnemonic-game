"use client";

// 方剂详情客户端组件：极简黑白 + 琥珀强调色风格
// 顶部方剂名 + 难度 Badge + 分类
// 三 Tab：传统方歌（遮罩可点击）/ 口诀（拆字解释，琥珀高亮）/ 药物组成（Badge 横排 + 功用主治）
// 底部三按钮切换 mode：learn / quiz / recite
import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Brain, Swords } from "lucide-react";
import type { Formula } from "@/lib/types";
import { QuizMode } from "@/components/quiz-mode";
import { ReciteMode } from "@/components/recite-mode";

interface Props {
  formula: Formula;
}

type Mode = null | "learn" | "quiz" | "recite";

/** 将传统方歌按句切分，供逐句遮罩 */
function splitMnemonicLines(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[。，,．.！!？?;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function FormulaDetail({ formula }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  // 已揭示的方歌句子索引集合
  const [revealedLines, setRevealedLines] = useState<Set<number>>(new Set());

  function toggleLine(idx: number) {
    setRevealedLines((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  const mnemonicLines = splitMnemonicLines(formula.traditionalMnemonic);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {mode !== null && (
          <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回详情
          </Button>
        )}

        {/* 顶部信息：方剂名 + 难度 Badge + 分类 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{formula.name}</h1>
            <Badge variant={formula.level === "一类方" ? "accent" : "secondary"}>
              {formula.level}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {formula.categoryName && <span>{formula.categoryName}</span>}
            {formula.source && <span className="ml-2">· {formula.source}</span>}
          </div>
        </div>

        <Separator />

        {/* 默认详情：三 Tab */}
        {mode === null && (
          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="traditional">传统方歌</TabsTrigger>
              <TabsTrigger value="mnemonic">口诀</TabsTrigger>
              <TabsTrigger value="ingredients">药物组成</TabsTrigger>
            </TabsList>

            {/* 传统方歌：逐句遮罩 */}
            <TabsContent value="traditional" className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  {mnemonicLines.length === 0 ? (
                    <p className="text-muted-foreground">暂无方歌</p>
                  ) : (
                    <div className="space-y-2 text-lg leading-relaxed">
                      {mnemonicLines.map((line, idx) => (
                        <p key={idx}>
                          <span
                            className={`mask-text${revealedLines.has(idx) ? " revealed" : ""}`}
                            onClick={() => toggleLine(idx)}
                          >
                            {line}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    点击方歌文字可遮罩 / 揭示
                  </p>
                </CardContent>
              </Card>
              {formula.traditionalMnemonicExplanation && (
                <Card>
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium mb-2">方歌解释</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {formula.traditionalMnemonicExplanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 口诀：大字加粗 + 琥珀色拆字解释 */}
            <TabsContent value="mnemonic" className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  {formula.mnemonic ? (
                    <p className="text-2xl font-bold tracking-wider">
                      {formula.mnemonic}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">暂无口诀</p>
                  )}
                </CardContent>
              </Card>
              {formula.mnemonicExplanation && (
                <Card>
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium mb-2">拆字解释</p>
                    <p className="leading-relaxed">
                      <span className="text-accent font-medium">
                        {formula.mnemonicExplanation}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 药物组成：Badge 横排 + 功用主治 */}
            <TabsContent value="ingredients" className="space-y-3">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">药物组成</p>
                    <div className="flex flex-wrap gap-2">
                      {formula.ingredients.length === 0 ? (
                        <span className="text-sm text-muted-foreground">暂无</span>
                      ) : (
                        formula.ingredients.map((ing, idx) => (
                          <Badge key={idx} variant="outline">
                            {ing}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">功用</p>
                    <p className="text-sm text-muted-foreground">
                      {formula.functions || "暂无"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">主治</p>
                    <p className="text-sm text-muted-foreground">
                      {formula.indications || "暂无"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* 学习模式：遮罩卡交互说明 */}
        {mode === "learn" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" /> 学习模式
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>在学习模式下，请回到「传统方歌」逐句点击遮罩，自测记忆：</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>琥珀色遮罩为未揭示的句子，点击即可显示原文</li>
                <li>再次点击可重新遮罩，反复切换以加深记忆</li>
                <li>结合「口诀」与「药物组成」综合复习</li>
                <li>准备好后，切换到闯关或背诵模式自测</li>
              </ul>
              <Button variant="accent" size="sm" onClick={() => setMode(null)}>
                返回详情
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 闯关模式 */}
        {mode === "quiz" && <QuizMode formula={formula} />}

        {/* 背诵检测模式 */}
        {mode === "recite" && <ReciteMode formula={formula} />}

        {/* 底部三按钮 */}
        {mode === null && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" size="lg" onClick={() => setMode("learn")}>
              <BookOpen className="mr-2 h-4 w-4" /> 开始学习
            </Button>
            <Button variant="accent" size="lg" onClick={() => setMode("quiz")}>
              <Swords className="mr-2 h-4 w-4" /> 闯关测试
            </Button>
            <Button variant="default" size="lg" onClick={() => setMode("recite")}>
              <Brain className="mr-2 h-4 w-4" /> 背诵检测
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

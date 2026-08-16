"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function FeedbackForm() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "提交失败", "error");
      } else {
        setSubmitted(true);
        toast("感谢你的反馈！", "success");
      }
    } catch {
      toast("网络错误，请重试", "error");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-sm">感谢你的反馈，我们会认真阅读每一条建议</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setContent("");
              setName("");
              setEmail("");
            }}
          >
            再提交一条
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">反馈建议</h1>
        <p className="text-sm text-muted-foreground mt-1">
          遇到 bug、有功能建议或内容纠错，欢迎告诉我们
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">提交反馈</CardTitle>
          <CardDescription>无需登录，匿名也可提交</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">反馈内容 *</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述你的反馈..."
                required
                maxLength={1000}
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}/1000
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">称呼（选填）</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱（选填）</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="便于我们回复你"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
              {loading ? "提交中..." : "提交反馈"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

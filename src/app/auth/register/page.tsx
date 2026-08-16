"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeToTerms) {
      setError("请阅读并同意用户协议与隐私政策");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, agreeToTerms }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "注册失败");
        setLoading(false);
        return;
      }
      // 注册成功，自动登录
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (signRes?.error) {
        setError("注册成功但自动登录失败，请手动登录");
      } else {
        track("register");
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      setError("网络错误");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
                required
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位，含字母和数字"
                required
                minLength={8}
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-accent"
                required
              />
              <span>
                我已阅读并同意
                <Link href="/terms" className="text-accent hover:underline mx-1" target="_blank">
                  用户协议
                </Link>
                和
                <Link href="/privacy" className="text-accent hover:underline mx-1" target="_blank">
                  隐私政策
                </Link>
              </span>
            </label>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "注册并登录"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              已有账号？{" "}
              <Link href="/auth/login" className="text-accent hover:underline">
                去登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

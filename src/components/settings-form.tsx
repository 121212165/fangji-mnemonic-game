"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  dailyGoal: number;
  studyStage: string;
  createdAt: Date;
}

const STAGE_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: "newbie", label: "新手入门", desc: "刚接触方剂学" },
  { value: "intensive", label: "强化学习", desc: "系统记忆阶段" },
  { value: "sprint", label: "冲刺阶段", desc: "考前集中复习" },
  { value: "final", label: "终末阶段", desc: "查漏补缺" },
];

export function SettingsForm({ user }: { user: UserData }) {
  const { toast } = useToast();

  // 资料表单
  const [name, setName] = useState(user.name ?? "");
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal);
  const [studyStage, setStudyStage] = useState(user.studyStage);
  const [savingProfile, setSavingProfile] = useState(false);

  // 密码表单
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (dailyGoal < 5 || dailyGoal > 50) {
      toast("每日目标需在 5-50 之间", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dailyGoal, studyStage }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "保存失败", "error");
      } else {
        toast("设置已保存", "success");
      }
    } catch {
      toast("网络错误，请重试", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("两次输入的新密码不一致", "error");
      return;
    }
    if (newPassword === oldPassword) {
      toast("新密码不能与旧密码相同", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "修改失败", "error");
      } else {
        toast("密码修改成功", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast("网络错误，请重试", "error");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">我的设置</h1>
        <p className="text-sm text-muted-foreground mt-1">
          账号信息与学习偏好
        </p>
      </div>

      {/* 账号信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">账号信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">邮箱</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">注册时间</span>
            <span className="font-medium">
              {user.createdAt.toLocaleDateString("zh-CN")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 学习偏好 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习偏好</CardTitle>
          <CardDescription>修改昵称、每日目标与学习阶段</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
                maxLength={30}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">每日目标（5-50 首）</Label>
              <Input
                id="dailyGoal"
                type="number"
                min={5}
                max={50}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>学习阶段</Label>
              <div className="grid grid-cols-2 gap-2">
                {STAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStudyStage(opt.value)}
                    className={`text-left rounded-md border p-3 transition-colors ${
                      studyStage === opt.value
                        ? "border-accent bg-accent/10"
                        : "border-input hover:bg-muted"
                    }`}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={savingProfile} className="w-full">
              {savingProfile ? "保存中..." : "保存设置"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">修改密码</CardTitle>
          <CardDescription>
            新密码至少 8 位，需同时包含字母和数字
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">当前密码</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" disabled={savingPassword} className="w-full">
              {savingPassword ? "修改中..." : "修改密码"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 忘记密码 / 退出 */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:underline text-center"
          >
            忘记密码？通过邮箱重置
          </Link>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// /api/settings PATCH
// 修改用户昵称、每日目标、学习阶段
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const settingsSchema = z.object({
  name: z.string().min(1, "请输入昵称").max(30).optional(),
  dailyGoal: z.number().int().min(5, "每日目标至少 5").max(50, "每日目标最多 50").optional(),
  studyStage: z.enum(["newbie", "intensive", "sprint", "final"]).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.dailyGoal !== undefined) data.dailyGoal = parsed.data.dailyGoal;
    if (parsed.data.studyStage !== undefined) data.studyStage = parsed.data.studyStage;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "无更新内容" }, { status: 400 });
    }

    await db.user.update({ where: { id: userId }, data });

    return NextResponse.json({ message: "设置已保存" });
  } catch (e) {
    console.error("[settings] error", e);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

// /api/change-password POST
// 修改密码：校验旧密码 + 新密码 + 更新
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions, verifyPassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "请输入旧密码"),
  newPassword: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[a-zA-Z]/, "密码需含字母")
    .regex(/[0-9]/, "密码需包含数字"),
});

export async function POST(req: Request) {
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
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const ok = await verifyPassword(parsed.data.oldPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "旧密码错误" }, { status: 400 });
    }

    if (parsed.data.oldPassword === parsed.data.newPassword) {
      return NextResponse.json({ error: "新密码不能与旧密码相同" }, { status: 400 });
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ message: "密码修改成功" });
  } catch (e) {
    console.error("[change-password] error", e);
    return NextResponse.json({ error: "修改失败" }, { status: 500 });
  }
}

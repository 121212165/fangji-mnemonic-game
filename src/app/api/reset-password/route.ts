// /api/reset-password POST
// 重置密码：校验 token + 更新密码 + 失效 token
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "缺少 token"),
  newPassword: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[a-zA-Z]/, "密码需含字母")
    .regex(/[0-9]/, "密码需包含数字"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    const tokenRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "token 无效" }, { status: 400 });
    }

    if (tokenRecord.usedAt) {
      return NextResponse.json({ error: "token 已使用" }, { status: 400 });
    }

    if (tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "token 已过期" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: tokenRecord.email },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const newHash = await hashPassword(newPassword);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
      db.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "密码重置成功" });
  } catch (e) {
    console.error("[reset-password] error", e);
    return NextResponse.json({ error: "重置失败" }, { status: 500 });
  }
}

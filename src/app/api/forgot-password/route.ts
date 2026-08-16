// /api/forgot-password POST
// 忘记密码：生成 reset token + 发邮件
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { sendEmail, passwordResetEmailHTML } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    // 检查用户是否存在（不暴露是否存在的信息）
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // 生成 token
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 分钟

      await db.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      // 发送邮件
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      await sendEmail(email, "重置密码 - 方剂口诀闯关", passwordResetEmailHTML(resetUrl));
    }

    // 无论用户是否存在，都返回相同信息（防止枚举）
    return NextResponse.json({
      message: "如果该邮箱已注册，你将收到重置密码邮件",
    });
  } catch (e) {
    console.error("[forgot-password] error", e);
    return NextResponse.json({ error: "请求失败" }, { status: 500 });
  }
}

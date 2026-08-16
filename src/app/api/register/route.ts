import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[a-zA-Z]/, "密码需包含字母")
    .regex(/[0-9]/, "密码需包含数字"),
  name: z.string().min(1, "请输入昵称").max(30),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "请阅读并同意用户协议与隐私政策" }),
  }),
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
    }
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;
    const lowerEmail = email.toLowerCase();

    // 检查邮箱是否已注册
    const existing = await db.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    // 创建用户 + 同步初始化 Streak 记录
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: lowerEmail,
        name,
        passwordHash,
        streak: { create: {} },
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user, message: "注册成功" });
  } catch (e) {
    console.error("[register] error", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}

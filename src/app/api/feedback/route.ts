// /api/feedback POST
// 提交反馈（无需登录）
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const feedbackSchema = z.object({
  content: z.string().min(1, "请输入反馈内容").max(1000, "反馈内容过长"),
  name: z.string().max(30).optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    await db.feedback.create({
      data: {
        content: parsed.data.content,
        name: parsed.data.name || null,
        email: parsed.data.email || null,
      },
    });

    return NextResponse.json({ message: "反馈已提交" });
  } catch (e) {
    console.error("[feedback] error", e);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}

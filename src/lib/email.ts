// 邮件发送工具
// 如果配置了 RESEND_API_KEY，使用 Resend 发送
// 否则在开发模式下 console.log 邮件内容
import { logger } from "@/lib/logger";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // 开发模式：打印邮件内容
    logger.info("email (dev mode)", { to, subject, html: html.slice(0, 200) });
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "方剂口诀闯关 <noreply@fangji.app>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      logger.error("email send failed", { status: res.status, to });
      return false;
    }

    return true;
  } catch (e) {
    logger.error("email send error", { error: e instanceof Error ? e.message : "unknown" });
    return false;
  }
}

export function passwordResetEmailHTML(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">方剂口诀闯关 - 重置密码</h2>
      <p>你正在重置密码，请点击下方链接设置新密码：</p>
      <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
        重置密码
      </a>
      <p style="color: #999; font-size: 12px;">
        此链接 30 分钟后失效。如非本人操作，请忽略此邮件。
      </p>
    </div>
  `;
}

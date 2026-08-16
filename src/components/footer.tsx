// 全站页脚：备案信息 + 协议链接 + 反馈入口
import Link from "next/link";

export function Footer() {
  const icpNumber = process.env.NEXT_PUBLIC_ICP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-2xl px-4 py-6 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">
            用户协议
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            隐私政策
          </Link>
          <Link href="/feedback" className="hover:text-foreground">
            反馈建议
          </Link>
          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="hover:text-foreground"
            >
              联系我们
            </a>
          )}
        </div>
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>方剂口诀闯关 · 仅供学习交流，不提供医疗诊断建议</p>
          {icpNumber && (
            <p>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {icpNumber}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

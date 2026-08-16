// 隐私政策页
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "隐私政策",
  description: "方剂口诀闯关隐私政策",
};

export default function PrivacyPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        <article className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          <h1 className="text-2xl font-bold">隐私政策</h1>
          <p className="text-xs text-muted-foreground">最后更新：2026 年</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">一、我们收集什么信息</h2>
            <p>当您注册账号时，我们收集以下信息：</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>邮箱地址：用于登录与密码重置</li>
              <li>昵称：用于界面显示</li>
              <li>密码（加密存储）：用于身份验证</li>
            </ul>
            <p>在使用过程中，我们还会收集学习行为数据：</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>答题记录、学习时长、掌握度</li>
              <li>AI 对话内容（用于展示历史）</li>
              <li>连续打卡记录</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">二、我们如何使用信息</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>提供个性化学习计划与复习推荐</li>
              <li>展示学习统计与成就</li>
              <li>发送密码重置邮件</li>
              <li>改进产品体验（匿名分析）</li>
            </ul>
            <p>我们不会将您的信息出售或共享给第三方。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">三、数据存储与保护</h2>
            <p>
              您的数据存储于 Supabase Postgres 数据库（境外服务器）。我们采取以下措施保护数据安全：
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>密码使用 bcrypt 加密存储，不以明文保存</li>
              <li>所有 API 请求经过 CSRF 校验与限流</li>
              <li>数据库连接使用 SSL 加密</li>
              <li>定期数据库自动备份</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">四、Cookie 使用</h2>
            <p>
              本服务使用必要的 Cookie 维持登录会话（httpOnly，30 天有效期）。不使用第三方跟踪 Cookie。分析统计使用无 Cookie 方案。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">五、您的权利</h2>
            <p>根据相关法律法规（包括 GDPR 与《个人信息保护法》），您享有以下权利：</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>访问权：查看您的个人数据</li>
              <li>更正权：修改昵称、邮箱等</li>
              <li>删除权：要求删除账号及所有数据</li>
              <li>撤回同意权：停止使用服务</li>
            </ul>
            <p>
              如需行使上述权利，请联系：<a href={`mailto:${supportEmail}`} className="text-accent hover:underline">{supportEmail}</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">六、未成年人保护</h2>
            <p>
              本服务面向学习中医的成年人。未成年人应在监护人指导下使用，监护人对未成年人的使用行为承担责任。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">七、政策变更</h2>
            <p>
              本政策可能不时更新，更新后将在本页面公布。重大变更将通过邮件通知您。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// 用户协议页
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "用户协议",
  description: "方剂口诀闯关用户协议",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        <article className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          <h1 className="text-2xl font-bold">用户协议</h1>
          <p className="text-xs text-muted-foreground">最后更新：2026 年</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">一、服务性质</h2>
            <p>
              方剂口诀闯关（以下简称「本服务」）是一款免费的中医方剂学学习辅助工具，面向中医爱好者与考研学生，提供方剂背诵、复习与 AI 问答功能。本服务完全免费，不收取任何费用。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">二、用户行为规范</h2>
            <p>用户在使用本服务时应遵守以下规范：</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>不得用于任何违法违规用途</li>
              <li>不得发布或传播侵权、有害信息</li>
              <li>不得尝试破坏系统安全或爬取数据</li>
              <li>不得冒用他人身份注册账号</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">三、知识产权</h2>
            <p>
              本服务中的方剂学内容属于公共领域知识。本服务的软件代码、界面设计、方歌改编等内容版权归本服务所有。用户不得复制、转载或商用本服务的原创内容，除非获得书面授权。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">四、免责声明</h2>
            <p>
              本服务提供的所有内容仅供学习参考，不构成医疗诊断或治疗建议。用户不应根据本服务内容自行用药或治疗。如有健康问题，请咨询执业中医师或其他专业医疗机构。本服务不对用户因依赖本服务内容而产生的任何后果承担责任。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">五、AI 功能说明</h2>
            <p>
              本服务的 AI 对话功能由第三方大语言模型提供，可能存在错误或不当回复。用户应自行判断 AI 回复的准确性，不应将 AI 回复作为专业医学意见。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">六、服务变更与终止</h2>
            <p>
              本服务保留随时修改、暂停或终止服务的权利，届时将尽可能提前通知用户。用户可随时注销账号并要求删除个人数据。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">七、协议变更</h2>
            <p>
              本协议可能不时更新，更新后将在本页面公布。继续使用本服务即视为同意更新后的协议。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// 反馈页（无需登录可提交）
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata = {
  title: "反馈建议",
  description: "提交你的反馈与建议",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        <FeedbackForm />
      </main>
      <Footer />
    </div>
  );
}

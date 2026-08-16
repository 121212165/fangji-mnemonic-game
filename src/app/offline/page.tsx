// 离线 fallback 页（SW 缓存）
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h1 className="text-xl font-bold">当前处于离线状态</h1>
          <p className="text-sm text-muted-foreground mt-2">
            无法连接网络，请检查网络后重试
          </p>
        </div>
        <Link
          href="/"
          className="inline-block text-sm text-accent hover:underline"
        >
          重试
        </Link>
      </div>
    </div>
  );
}

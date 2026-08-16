import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-[var(--color-accent)]">404</h1>
        <p className="text-lg font-medium">页面未找到</p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          你访问的页面不存在或已被移除
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}

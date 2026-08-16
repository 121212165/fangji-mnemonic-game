// Umami 埋点封装（隐私友好，无 cookie）
// 未配置时所有调用静默无操作

declare global {
  interface Window {
    umami?: {
      track: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

/**
 * 触发埋点事件
 * @param event 事件名（如 register、answer_submit）
 * @param props 匿名属性（不含 PII）
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (typeof window.umami !== "undefined") {
    window.umami.track(event, props);
  }
}

/** Umami script URL，未配置则返回 null */
export function getUmamiScriptSrc(): string | null {
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
  if (!id || !src) return null;
  return `${src}?website=${id}`;
}

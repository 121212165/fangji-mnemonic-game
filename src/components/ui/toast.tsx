"use client";

import { createContext, useContext, useState, useCallback } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";

type ToastVariant = "default" | "error" | "success";

interface ToastItem {
  id: string;
  title: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (title: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // 如果没有 Provider，返回空函数避免崩溃
    return { toast: () => {} };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((title: string, variant: ToastVariant = "default") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, variant }]);
    // 3 秒后自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            className={`flex items-start gap-3 rounded-md border p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-2 ${
              t.variant === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : t.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-[var(--color-border)] bg-white text-[var(--color-foreground)]"
            }`}
          >
            <div className="flex-1 text-sm">{t.title}</div>
            <Toast.Close className="rounded-sm opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed top-4 right-4 z-[100] flex w-80 flex-col gap-2 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

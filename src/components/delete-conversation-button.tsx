"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DeleteConversationButton({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确认删除这个对话？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ai/conversation/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "删除失败", "error");
      } else {
        toast("已删除", "success");
        router.refresh();
      }
    } catch {
      toast("网络错误", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      onClick={onDelete}
      disabled={deleting}
      aria-label="删除对话"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

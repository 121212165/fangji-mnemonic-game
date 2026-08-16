"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // SW 注册失败静默处理
      });
  }, []);

  return null;
}

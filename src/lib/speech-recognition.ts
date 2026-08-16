"use client";

// 浏览器端语音识别封装
// 使用 webkitSpeechRecognition / SpeechRecognition（中文 lang="zh-CN"）
// 兼容性检测 + 事件订阅 + 自动重试

// 类型定义（浏览器原生 API 未在 TS 标准库中完整声明）
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * 创建一个语音识别会话
 * 调用 start() 开始监听，stop() 主动停止
 * onResult 在每次识别到内容时触发（interimResults = true）
 */
export function createSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    return {
      supported: false,
      listening: false,
      start: () => {
        options.onError?.("not-supported");
      },
      stop: () => {},
    };
  }

  // 拷贝到 const 让 TS 在闭包内也能收窄为非空
  const SpeechRecognitionCtor: SpeechRecognitionCtor = Ctor;

  let recognition: SpeechRecognitionLike | null = null;
  let listening = false;

  function start() {
    if (listening) return;
    recognition = new SpeechRecognitionCtor();
    recognition.lang = options.lang ?? "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
    };

    recognition.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          final += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      if (final) {
        options.onResult?.(final, true);
      } else if (interim) {
        options.onResult?.(interim, false);
      }
    };

    recognition.onerror = (e) => {
      options.onError?.(e.error);
      listening = false;
    };

    recognition.onend = () => {
      listening = false;
      options.onEnd?.();
    };

    try {
      recognition.start();
    } catch {
      options.onError?.("start-failed");
    }
  }

  function stop() {
    if (!recognition || !listening) return;
    try {
      recognition.stop();
    } catch {
      // 忽略
    }
    listening = false;
  }

  return {
    supported: true,
    get listening() {
      return listening;
    },
    start,
    stop,
  };
}

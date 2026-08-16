// 动态生成 OG 图
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, marginBottom: 16 }}>
          方剂口诀闯关
        </div>
        <div style={{ fontSize: 28, color: "#f59e0b" }}>
          中医考研方剂背诵辅助 · AI 增强版
        </div>
        <div style={{ fontSize: 20, color: "#a3a3a3", marginTop: 12 }}>
          FSRS 间隔重复 · 语音背诵 · AI 对话
        </div>
      </div>
    ),
    { ...size }
  );
}

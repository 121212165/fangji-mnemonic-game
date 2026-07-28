// FormulaDetail 组件单元测试
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormulaDetail } from "@/components/formula-detail";
import type { Formula } from "@/lib/types";

// 构造测试用 Formula 对象
function makeFormula(overrides: Partial<Formula> = {}): Formula {
  return {
    id: "f1",
    name: "麻黄汤",
    source: "《伤寒论》",
    alias: [],
    categoryId: 1,
    categoryName: "解表剂",
    mnemonic: "麻桂杏草",
    mnemonicExplanation: "麻黄 桂枝 杏仁 甘草",
    traditionalMnemonic: "麻黄汤中用桂枝，杏仁甘草四般施",
    traditionalMnemonicExplanation: "麻黄为君，桂枝为臣",
    ingredients: ["麻黄", "桂枝", "杏仁", "甘草"],
    functions: "发汗解表，宣肺平喘",
    indications: "外感风寒表实证",
    trigger: "",
    level: "一类方",
    sortOrder: 0,
    ...overrides,
  };
}

describe("FormulaDetail 渲染与基础信息", () => {
  it("显示方剂名与难度 Badge（一类方=accent）", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    expect(screen.getByText("麻黄汤")).toBeTruthy();
    expect(screen.getByText("一类方")).toBeTruthy();
  });

  it("二类方显示对应 Badge", () => {
    render(<FormulaDetail formula={makeFormula({ level: "二类方" })} />);
    expect(screen.getByText("二类方")).toBeTruthy();
  });

  it("显示分类名与出处", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    expect(screen.getByText(/解表剂/)).toBeTruthy();
    expect(screen.getByText(/伤寒论/)).toBeTruthy();
  });
});

describe("FormulaDetail Tab 切换", () => {
  it("默认显示「传统方歌」Tab 且为 active", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    const tab = screen.getByRole("tab", { name: "传统方歌" });
    expect(tab).toHaveAttribute("data-state", "active");
    // 方歌文字应存在于 DOM（即便有遮罩样式）
    expect(screen.getByText("麻黄汤中用桂枝")).toBeTruthy();
    expect(screen.getByText("杏仁甘草四般施")).toBeTruthy();
  });

  it("点击切换到「口诀」Tab 显示 mnemonic", async () => {
    const user = userEvent.setup();
    render(<FormulaDetail formula={makeFormula()} />);
    // Radix TabsTrigger 通过 onMouseDown 切换，userEvent.click 模拟完整指针序列
    await user.click(screen.getByRole("tab", { name: "口诀" }));
    expect(screen.getByRole("tab", { name: "口诀" })).toHaveAttribute(
      "data-state",
      "active"
    );
    expect(screen.getByText("麻桂杏草")).toBeTruthy();
  });

  it("点击切换到「药物组成」Tab 显示 ingredients + functions", async () => {
    const user = userEvent.setup();
    render(<FormulaDetail formula={makeFormula()} />);
    await user.click(screen.getByRole("tab", { name: "药物组成" }));
    expect(screen.getByRole("tab", { name: "药物组成" })).toHaveAttribute(
      "data-state",
      "active"
    );
    // 4 味药均渲染为 Badge
    expect(screen.getByText("麻黄")).toBeTruthy();
    expect(screen.getByText("桂枝")).toBeTruthy();
    expect(screen.getByText("杏仁")).toBeTruthy();
    expect(screen.getByText("甘草")).toBeTruthy();
    // 功用也展示
    expect(screen.getByText("发汗解表，宣肺平喘")).toBeTruthy();
  });
});

describe("FormulaDetail 遮罩交互", () => {
  it("点击方歌文字应切换 .revealed 类", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    const maskEl = screen.getByText("麻黄汤中用桂枝");
    // 初始：有 mask-text，无 revealed
    expect(maskEl.className).toContain("mask-text");
    expect(maskEl.className).not.toContain("revealed");
    // 点击：揭示
    fireEvent.click(maskEl);
    expect(maskEl.className).toContain("revealed");
    // 再次点击：恢复遮罩
    fireEvent.click(maskEl);
    expect(maskEl.className).not.toContain("revealed");
  });

  it("不同句子独立揭示", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    const first = screen.getByText("麻黄汤中用桂枝");
    const second = screen.getByText("杏仁甘草四般施");
    fireEvent.click(first);
    expect(first.className).toContain("revealed");
    expect(second.className).not.toContain("revealed");
    fireEvent.click(second);
    expect(second.className).toContain("revealed");
    // 第一个仍保持揭示
    expect(first.className).toContain("revealed");
  });
});

describe("FormulaDetail 闯关模式", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("输入正确答案提交后显示通过", async () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /闯关测试/ }));

    const input = screen.getByPlaceholderText("请输入药物组成，用顿号分隔");
    fireEvent.change(input, {
      target: { value: "麻黄、桂枝、杏仁、甘草" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    await waitFor(() => {
      expect(screen.getByText("通过！", { exact: false })).toBeTruthy();
    });
    // 应调用 /api/answer 记录答题
    expect(fetchMock).toHaveBeenCalled();
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("/api/answer");
    const body = JSON.parse(callArgs[1].body);
    expect(body.mode).toBe("quiz");
    expect(body.questionType).toBe("ingredients");
  });

  it("输入错误答案提交后显示不通过 + 漏药提示", async () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /闯关测试/ }));

    const input = screen.getByPlaceholderText("请输入药物组成，用顿号分隔");
    fireEvent.change(input, { target: { value: "麻黄" } });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    await waitFor(() => {
      expect(screen.getByText("未通过", { exact: false })).toBeTruthy();
    });
    // 漏药提示存在
    expect(screen.getByText("漏掉的药")).toBeTruthy();
    // 漏掉的药中应包含桂枝、杏仁、甘草
    expect(screen.getByText("桂枝")).toBeTruthy();
    expect(screen.getByText("杏仁")).toBeTruthy();
    expect(screen.getByText("甘草")).toBeTruthy();
  });

  it("答完后显示 4 个评级按钮", async () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /闯关测试/ }));
    const input = screen.getByPlaceholderText("请输入药物组成，用顿号分隔");
    fireEvent.change(input, {
      target: { value: "麻黄、桂枝、杏仁、甘草" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    await waitFor(() => {
      expect(screen.getByText("通过！", { exact: false })).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /重来/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "困难" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "良好" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "简单" })).toBeTruthy();
  });

  it("点击「良好」评级按钮后调用 fetch 并带 rating=good", async () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /闯关测试/ }));
    const input = screen.getByPlaceholderText("请输入药物组成，用顿号分隔");
    fireEvent.change(input, {
      target: { value: "麻黄、桂枝、杏仁、甘草" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    await waitFor(() => {
      expect(screen.getByText("通过！", { exact: false })).toBeTruthy();
    });

    // 清空 mock 调用记录，再点击「良好」
    fetchMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "良好" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("/api/answer");
    const body = JSON.parse(callArgs[1].body);
    expect(body.rating).toBe("good");
    expect(body.mode).toBe("quiz");
  });

  it("「下一题」按钮调用 /api/today-plan/next", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ done: true }),
    });
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /闯关测试/ }));
    const input = screen.getByPlaceholderText("请输入药物组成，用顿号分隔");
    fireEvent.change(input, {
      target: { value: "麻黄、桂枝、杏仁、甘草" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    await waitFor(() => {
      expect(screen.getByText("通过！", { exact: false })).toBeTruthy();
    });

    fetchMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /下一题/ }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/today-plan/next");
  });
});

describe("FormulaDetail 学习与背诵模式入口", () => {
  it("点击「开始学习」进入学习模式说明", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /开始学习/ }));
    expect(screen.getByText("学习模式")).toBeTruthy();
  });

  it("点击「背诵检测」进入背诵模式", () => {
    render(<FormulaDetail formula={makeFormula()} />);
    fireEvent.click(screen.getByRole("button", { name: /背诵检测/ }));
    expect(screen.getByText("背诵检测")).toBeTruthy();
    // 题型按钮
    expect(screen.getByRole("button", { name: "药物组成" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "方歌口诀" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "功用主治" })).toBeTruthy();
  });
});

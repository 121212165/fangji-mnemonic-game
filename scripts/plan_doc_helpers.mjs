// /home/z/my-project/scripts/plan_doc_helpers.mjs
// 辅助函数：段落、标题、列表、表格构造器
import {
  Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType,
  PageBreak,
} from 'docx';

// 调色板：DM-1 Deep Cyan（AI/tech 主题）
export const P = {
  bg: '0B1C2C',
  primary: '0B1C2C',
  body: '000000',
  secondary: '506070',
  accent: '1B6B7A',
  surface: 'EDF3F5',
  titleColor: 'FFFFFF',
  subtitleColor: 'B0B8C0',
  metaColor: '90989F',
  footerColor: '687078',
};

const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
export const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
export const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// H1 章节标题
export function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200, line: 360 },
    children: [new TextRun({
      text, bold: true, size: 36, color: P.primary,
      font: { ascii: 'Calibri', eastAsia: 'SimHei' },
    })],
  });
}

// H2 节标题
export function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160, line: 340 },
    children: [new TextRun({
      text, bold: true, size: 28, color: P.primary,
      font: { ascii: 'Calibri', eastAsia: 'SimHei' },
    })],
  });
}

// H3 小节标题
export function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 320 },
    children: [new TextRun({
      text, bold: true, size: 24, color: P.primary,
      font: { ascii: 'Calibri', eastAsia: 'SimHei' },
    })],
  });
}

// 正文段落（首行缩进 2 字）
export function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    children: [new TextRun({
      text, size: 22, color: P.body,
      font: { ascii: 'Times New Roman', eastAsia: 'SimSun' },
    })],
  });
}

// 支持加粗片段的正文
export function pRich(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: !!r.bold,
      size: 22,
      color: P.body,
      font: { ascii: 'Times New Roman', eastAsia: 'SimSun' },
    })),
  });
}

// 项目符号列表项
export function li(text, level = 0) {
  return new Paragraph({
    indent: { left: 480 + level * 360, hanging: 280 },
    spacing: { line: 300, after: 60 },
    children: [
      new TextRun({ text: '• ', size: 22, color: P.accent, bold: true,
        font: { ascii: 'Times New Roman', eastAsia: 'SimSun' } }),
      new TextRun({ text, size: 22, color: P.body,
        font: { ascii: 'Times New Roman', eastAsia: 'SimSun' } }),
    ],
  });
}

// 带前缀标签的列表项（如「✓」「⚠」「❌」）
export function liTag(tag, text, level = 0) {
  return new Paragraph({
    indent: { left: 480 + level * 360, hanging: 280 },
    spacing: { line: 300, after: 60 },
    children: [
      new TextRun({ text: `${tag} `, size: 22, color: P.accent, bold: true,
        font: { ascii: 'Times New Roman', eastAsia: 'SimSun' } }),
      new TextRun({ text, size: 22, color: P.body,
        font: { ascii: 'Times New Roman', eastAsia: 'SimSun' } }),
    ],
  });
}

// 单元格构造
function cell(text, opts = {}) {
  const isHeader = opts.header;
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.CLEAR, fill: isHeader ? P.accent : (opts.alt ? P.surface : 'FFFFFF') },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: (Array.isArray(text) ? text : [text]).map(t =>
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { line: 280, after: 0 },
        children: [new TextRun({
          text: String(t ?? ''),
          bold: !!isHeader,
          size: 20,
          color: isHeader ? 'FFFFFF' : P.body,
          font: { ascii: 'Calibri', eastAsia: 'SimSun' },
        })],
      })
    ),
  });
}

// 通用表格构造（首行为表头）
export function table(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => cell(h, { header: true, width: widths?.[i], center: true })),
  });
  const dataRows = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => cell(c, { alt: idx % 2 === 1, width: widths?.[i] })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...dataRows],
  });
}

// 表格标题（置于表格上方，加粗，keepNext）
export function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 80, line: 300 },
    keepNext: true,
    children: [new TextRun({
      text, bold: true, size: 22, color: P.primary,
      font: { ascii: 'Calibri', eastAsia: 'SimHei' },
    })],
  });
}

// 分页
export function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// 空段落（用于节奏控制，最多 1-2 个）
export function spacer() {
  return new Paragraph({ spacing: { line: 240 }, children: [] });
}

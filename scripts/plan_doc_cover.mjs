// /home/z/my-project/scripts/plan_doc_cover.mjs
// 封面（R1 风格简化版）+ 目录
import {
  Paragraph, TextRun, AlignmentType, BorderStyle, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType,
  TableOfContents, HeadingLevel, SectionType,
} from 'docx';
import { P, allNoBorders, noBorders } from './plan_doc_helpers.mjs';

export function buildCover() {
  const padL = 1200, padR = 800;
  const titleLines = ['方剂口诀闯关', 'AI 增强方案'];
  const titlePt = 38;
  const titleSize = titlePt * 2;

  const children = [];

  // 顶部留白
  children.push(new Paragraph({ spacing: { before: 2200 } }));

  // 英文标签
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    spacing: { after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
    children: [new TextRun({
      text: 'F O R M U L A   C H A L L E N G E   ·   A I   P L A N',
      size: 18, color: P.accent, characterSpacing: 40,
      font: { ascii: 'Calibri', eastAsia: 'SimHei' },
    })],
  }));

  // 主标题（两行）
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 320, line: Math.ceil(titlePt * 23), lineRule: 'atLeast' },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor,
        font: { eastAsia: 'SimHei', ascii: 'Arial' },
      })],
    }));
  }

  // 副标题
  children.push(new Paragraph({
    indent: { left: padL },
    spacing: { after: 1200 },
    children: [new TextRun({
      text: '从功能堆砌到路径驱动的产品升级',
      size: 26, color: P.subtitleColor,
      font: { eastAsia: 'Microsoft YaHei', ascii: 'Arial' },
    })],
  }));

  // 元信息
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const metaLines = [
    '项目类型：中医方剂学习应用 · 考研自学辅助',
    '文档版本：v1.0',
    '编制日期：2026 年 6 月',
    '编制人：Meoo · 秒悟',
  ];
  for (const line of metaLines) {
    children.push(new Paragraph({
      indent: { left: padL + 200 },
      spacing: { after: 100 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 22, color: P.metaColor,
        font: { eastAsia: 'Microsoft YaHei', ascii: 'Arial' },
      })],
    }));
  }

  // 底部留白
  children.push(new Paragraph({ spacing: { before: 2400 } }));

  // 页脚
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: '内部规划文档', size: 16, color: P.footerColor, font: { ascii: 'Arial' } }),
      new TextRun({ text: '                                        ' }),
      new TextRun({ text: 'Confidential', size: 16, color: P.footerColor, font: { ascii: 'Arial' } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: 'exact' },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg },
        borders: noBorders,
        children,
      })],
    })],
  })];
}

// 目录页
export function buildTOC() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 360, line: 360 },
      children: [new TextRun({
        text: '目  录', bold: true, size: 36, color: P.primary,
        font: { ascii: 'Calibri', eastAsia: 'SimHei' },
      })],
    }),
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({
      spacing: { before: 200 },
      alignment: AlignmentType.LEFT,
      children: [new TextRun({
        text: '提示：右键点击上方目录区域，选择「更新域」可刷新页码与条目。',
        italics: true, size: 18, color: '808080',
        font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' },
      })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

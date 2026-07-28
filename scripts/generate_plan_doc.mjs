// /home/z/my-project/scripts/generate_plan_doc.mjs
// 主入口：生成《方剂口诀闯关 · AI 增强方案》docx
import {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageNumber, NumberFormat,
  SectionType, PageOrientation,
} from 'docx';
import fs from 'fs/promises';
import path from 'path';

import { P } from './plan_doc_helpers.mjs';
import { buildCover, buildTOC } from './plan_doc_cover.mjs';
import {
  chapterExecutiveSummary, chapter1Background, chapter2Users,
  chapter3Architecture, chapter4AI,
} from './plan_doc_chapters_1_4.mjs';
import {
  chapter5DataModel, chapter6FSRS, chapter7TechStack, chapter8API,
} from './plan_doc_chapters_5_8.mjs';
import {
  chapter9MVP, chapter10Data, chapter11Risks, chapter12Roadmap,
} from './plan_doc_chapters_9_12.mjs';

// 通用样式（默认正文）
const defaultStyles = {
  default: {
    document: {
      run: {
        font: { ascii: 'Times New Roman', eastAsia: 'SimSun' },
        size: 22,
        color: P.body,
      },
      paragraph: {
        spacing: { line: 312 },
      },
    },
  },
};

// 页眉
function makeHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { line: 240 },
      children: [new TextRun({
        text: '方剂口诀闯关 · AI 增强方案',
        size: 18, color: '808080',
        font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' },
      })],
    })],
  });
}

// 页脚（仅页码）
function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240 },
      children: [new TextRun({
        children: [PageNumber.CURRENT],
        size: 18, color: '808080',
        font: { ascii: 'Calibri' },
      })],
    })],
  });
}

async function main() {
  console.log('📦 开始生成《方剂口诀闯关 · AI 增强方案》docx...');

  // 组装正文
  const bodyChildren = [
    ...chapterExecutiveSummary(),
    ...chapter1Background(),
    ...chapter2Users(),
    ...chapter3Architecture(),
    ...chapter4AI(),
    ...chapter5DataModel(),
    ...chapter6FSRS(),
    ...chapter7TechStack(),
    ...chapter8API(),
    ...chapter9MVP(),
    ...chapter10Data(),
    ...chapter11Risks(),
    ...chapter12Roadmap(),
  ];

  console.log(`   章节段落总数：${bodyChildren.length}`);

  const doc = new Document({
    styles: defaultStyles,
    sections: [
      // 第 1 节：封面（无页码、无页眉页脚、margin 0）
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCover(),
      },
      // 第 2 节：目录（罗马数字页码）
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        headers: { default: makeHeader() },
        footers: { default: makeFooter() },
        children: buildTOC(),
      },
      // 第 3 节：正文（阿拉伯数字页码，从 1 开始）
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: makeHeader() },
        footers: { default: makeFooter() },
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = '/home/z/my-project/download/方剂口诀闯关-AI增强方案.docx';
  
  // 确保 download 目录存在
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buffer);
  
  const sizeKB = (buffer.length / 1024).toFixed(1);
  console.log(`✅ 文档生成完成`);
  console.log(`📁 路径：${outPath}`);
  console.log(`📏 大小：${sizeKB} KB`);
}

main().catch(e => {
  console.error('💥 致命错误：', e);
  process.exit(1);
});

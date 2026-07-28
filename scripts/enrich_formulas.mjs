/**
 * enrich_formulas.js
 * 用 z-ai-web-dev-sdk 调 LLM，为每首方剂生成完整字段。
 * 
 * 输入：data/formulas_parsed.json
 * 输出：data/formulas_enriched.json （或 sample 5 条到 data/formulas_sample.json）
 * 
 * 用法：
 *   node scripts/enrich_formulas.js sample   # 仅处理前 5 首作为样本
 *   node scripts/enrich_formulas.js all      # 处理全部 190 首
 *   node scripts/enrich_formulas.js 13       # 处理前 13 首（按数量）
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = '/home/z/my-project/data';
const INPUT_FILE = path.join(DATA_DIR, 'formulas_parsed.json');

const SYSTEM_PROMPT = `你是一位资深中医方剂学教授，精通考研方剂学全部 217 首方剂。你的任务是根据用户提供的方剂元数据，输出该方剂的完整结构化信息。

要求：
1. 传统方歌（traditional_mnemonic）：必须是教材通用版方歌，7 字句为主，4-8 句。如果是常用方剂，请用教材标准版本，不要自创。
2. 传统方歌解释（traditional_mnemonic_explanation）：逐句解释方歌，说明每句对应哪些药物、主治什么证候。要详细，至少 100 字。
3. 压缩口诀解释（mnemonic_explanation）：把"压缩字块"逐字拆解，说明每个字/词对应哪味药。格式如："妈(麻黄) + 跪(桂枝) + 着(杏仁) + 炒(甘草)"。如果压缩字块里有"+"号分隔，按段拆解。
4. 药物组成（ingredients）：JSON 数组，每味药一个元素，用通用名（如"麻黄"，不用"麻黄根"）。
5. 功用（functions）：8-20 字概括，如"发汗解表，宣肺平喘"。
6. 主治（indications）：50-150 字，含主症 + 舌脉。
7. 难度（level）：根据中医考研方剂学大纲，"一类方"为高频必考方（如麻黄汤、桂枝汤、白虎汤、四君子汤等），"二类方"为辅助记忆方。请基于考研实际出题频率判断。

输出格式：严格的 JSON，不要包 markdown 代码块，不要任何额外说明文字。JSON 字段顺序如下：
{"traditional_mnemonic": "...", "traditional_mnemonic_explanation": "...", "mnemonic_explanation": "...", "ingredients": ["..."], "functions": "...", "indications": "...", "level": "一类方"|"二类方"}`;

function buildUserPrompt(formula) {
  return `请为以下方剂生成完整结构化信息：

方名：${formula.name}
所属章节：第${formula.chapter}章 ${formula.chapter_name}
压缩字块：${formula.mnemonic}
触发关键词：${formula.trigger}

请输出 JSON。`;
}

function extractJson(text) {
  // 去掉可能的 markdown 代码块
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  // 找第一个 { 和最后一个 }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first === -1 || last === -1) {
    throw new Error('未找到 JSON 对象');
  }
  return JSON.parse(t.slice(first, last + 1));
}

async function enrichOne(zai, formula, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(formula) },
        ],
        thinking: { type: 'disabled' },
      });
      const raw = completion.choices[0]?.message?.content || '';
      const data = extractJson(raw);
      return { ...formula, ...data };
    } catch (e) {
      lastErr = e;
      // 429 退避
      if (e.message?.includes('429') && attempt < retries) {
        const wait = 3000 * attempt;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

async function main() {
  const mode = process.argv[2] || 'sample';
  const formulas = JSON.parse(await fs.readFile(INPUT_FILE, 'utf-8'));
  
  let targets;
  if (mode === 'sample') {
    // 挑 5 首覆盖不同章节的样本
    const picks = ['麻黄汤', '白虎汤', '四君子汤', '逍遥散', '二陈汤'];
    targets = formulas.filter(f => picks.includes(f.name));
    if (targets.length < 5) {
      targets = formulas.slice(0, 5);
    }
  } else if (mode === 'all') {
    targets = formulas;
  } else {
    const n = parseInt(mode, 10);
    targets = formulas.slice(0, isNaN(n) ? 5 : n);
  }
  
  console.log(`📦 准备富化 ${targets.length} 首方剂...`);
  console.log(`   目标：${targets.map(t => t.name).join('、')}`);
  console.log('');
  
  const zai = await ZAI.create();
  const results = [];
  const errors = [];
  
  // 串行 + 间隔 1.5s（避免 429）
  for (let i = 0; i < targets.length; i++) {
    const f = targets[i];
    console.log(`▶️  [${i + 1}/${targets.length}] ${f.name}`);
    try {
      const r = await enrichOne(zai, f);
      results.push(r);
      console.log(`   ✓ ${r.name} / ${r.level} / ${r.ingredients?.length || '?'}味药`);
    } catch (e) {
      errors.push({ name: f.name, error: e.message || String(e) });
      console.log(`   ✗ ${f.name}：${e.message || e}`);
    }
    // 间隔 1.5s
    if (i < targets.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  
  // 输出
  const outFile = mode === 'sample' ? 
    path.join(DATA_DIR, 'formulas_sample.json') :
    path.join(DATA_DIR, 'formulas_enriched.json');
  
  await fs.writeFile(outFile, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log('');
  console.log(`✅ 完成：成功 ${results.length}，失败 ${errors.length}`);
  console.log(`📁 输出：${outFile}`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('❌ 失败列表：');
    errors.forEach(e => console.log(`   - ${e.name}: ${e.error}`));
  }
}

main().catch(e => {
  console.error('💥 致命错误：', e);
  process.exit(1);
});

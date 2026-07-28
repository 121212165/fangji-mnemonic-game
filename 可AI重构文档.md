# 方剂口诀闯关-AI增强方案 可AI重构文档

> **元信息**
> - 一句话定位：中医考研方剂背诵辅助 Web 应用 —— 压缩口诀 + 传统方歌遮罩学习 + 闯关判分 + FSRS 间隔重复 + DeepSeek AI 每日推荐。
> - 生成日期：2026-07-28
> - 复现深度：精确级（单凭本文档，AI 可完全复现该项目的代码、数据与数据库）
> - 与 worklog.md 的关系声明：**本文档 = 现状快照**（以源码实际内容为准）；worklog.md = 开发过程记录（任务 A–E 的实现日志，其中部分"已知限制"已在后续任务修复，如 fsrs.ts 的 ts-fsrs API 适配问题已在任务 E 修复）。两者冲突时以本文档为准。
> - 密钥零收录声明：本文档不收录任何真实密钥。`.env` 中仅有本地 sqlite 路径 `DATABASE_URL`，经根 AGENTS.md 确认非真实凭据，故照录；其余环境变量一律使用 `<占位>`。

---

## 目录（全文导航）

- 元信息（定位 / 快照关系声明 / 密钥零收录声明）
- 1. 项目概述
  - 1.1 定位
  - 1.2 编号功能清单（F01–F23）
  - 1.3 核心闭环（已通过浏览器端到端验证）
  - 1.4 典型用户旅程
  - 1.5 术语表（领域与技术）
  - 1.6 功能 → 实现 → 契约 → 测试 追溯矩阵
- 2. 技术栈与环境
  - 2.1 运行时与包管理器
  - 2.2 精确版本表（与 package.json 逐字一致）
  - 2.3 npm scripts（逐字）
  - 2.4 环境变量表（仅键名 + 用途 + 占位值）
  - 2.5 其余配置文件（逐字要点）
  - 2.6 package.json 全文（69 行，逐字）
  - 2.7 版本兼容性与升级禁区
- 3. 目录结构（带中文注释目录树）
  - 3.1 关键文件行数速查表
- 4. 数据模型
  - 4.1 prisma/schema.prisma 全文（183 行，逐字内嵌）
  - 4.2 模型要点与设计约定
  - 4.3 data/formulas_parsed.json 格式规范（含 3 条完整样例）
  - 4.4 data/formulas_sample.json 格式规范（AI 富化后形态）
  - 4.5 data/raw_mnemonics.md 格式规范
  - 4.6 方剂.txt（仅描述，不内嵌）
  - 4.7 db/custom.db 再生链路
  - 4.8 数据字典（9 表逐字段，含业务语义与读写方）
  - 4.9 raw_mnemonics.md 逐章分布总表
  - 4.10 seed.ts 合并规则
- 5. API 契约
  - 5.1 端点总表（14 个 route.ts）
  - 5.2 鉴权模型
  - 5.3 各端点请求/响应 shape
  - 5.4 错误码汇总
  - 5.5 端点请求/响应完整示例（逐端点）
  - 5.6 端点 ↔ 单测文件映射
  - 5.7 NextAuth 内置端点与会话细节
  - 5.8 /api/answer 字段字典（逐字段类型 + 校验 + 错误消息逐字表）
- 6. 核心业务逻辑与算法
  - 6.1 ts-fsrs 调度参数与调用方式
  - 6.2 闯关判分逻辑（src/lib/match.ts）
  - 6.3 连续打卡 streak
  - 6.4 AI 每日推荐 prompt（原文逐字收录）
  - 6.5 数据清洗规则（raw_mnemonics.md → formulas_parsed.json）
  - 6.6 Fallback 计划生成
  - 6.7 边界条件汇总
  - 6.8 src/lib 函数级规格
  - 6.9 评分推演示例（确定性算例）
  - 6.10 FSRS 调度不变量
  - 6.11 /api/answer 十步全流程展开（源码级）
- 7. 核心文件逐一说明【文档主体】
  - 7.1 src/lib（8 文件）
  - 7.2 src/app/api（14 路由实现要点）
  - 7.3 页面层（8 文件）
  - 7.4 组件层（7 业务组件 + 9 ui 基件）
  - 7.5 scripts/（9 文件，逐个成节）
  - 7.6 测试（setup.ts + 7 个单测文件）
  - 7.7 附：src/lib/types.ts 全文（93 行，逐字）
  - 7.8 附：常量、正则与魔法值总索引
- 8. UI 与交互
  - 8.1 页面路由总表
  - 8.2 视觉体系
  - 8.3 页面状态机
  - 8.4 组件树
  - 8.5 状态管理策略
  - 8.6 关键交互细节清单
  - 8.7 交互文案与可见元素规格
  - 8.8 关键数据流时序
  - 8.9 页面/组件 ↔ API 依赖矩阵
- 9. 从零复现步骤
  - 9.1 前置条件
  - 9.2 编号步骤
  - 9.3 验收标准总表
  - 9.4 常见故障排查
  - 9.5 复现自检清单
  - 9.6 部署与定时任务（可选）
  - 9.7 复现辅助脚本（一键串联）
  - 9.8 验收冒烟请求序列（确定性期望值）
- 10. 不可文本化资产与已知问题
  - 10.1 不可文本化资产处置
  - 10.2 复现缺口清单
  - 10.3 已知问题与坑
  - 10.4 TODO
  - 10.5 分阶段复现工序建议
  - 10.6 本文档使用导读（重构执行体必读）
  - 10.7 常见重构误区与文档自查记录

逐字收录区总索引（可直接复制的材料）：§4.1 schema.prisma ｜ §2.6 package.json ｜ §7.7 types.ts ｜ §6.4 AI prompt ｜ §6.1 FSRS 常量 ｜ §6.5 + §7.8 全部正则 ｜ §4.3/§4.4/§4.5 数据样例 ｜ §2.3 npm scripts。

---

## 1. 项目概述

### 1.1 定位

「方剂口诀闯关 · AI 增强版」是一个面向中医考研学生的方剂背诵辅助应用。核心记忆资产是一套"极限压缩口诀"（如麻黄汤 = "妈跪着炒"），配合传统教材方歌、触发关键词（如"身疼无汗"→麻黄汤），通过**遮罩自测、闯关判分、背诵检测**三种交互模式训练记忆，底层用 **ts-fsrs（FSRS-4.5 间隔重复算法）**调度复习，并用 **DeepSeek LLM** 生成个性化每日学习计划。

- 项目名（package.json）：`formula-challenge`，版本 0.1.0
- 页面标题：`方剂口诀闯关 · AI 增强版`；描述：`中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈`
- 数据规模：20 个方剂分类（章）、190 首方剂（其中 5 首已 AI 富化为完整字段样本）
- 视觉风格：极简黑白 + 琥珀强调色（`#f59e0b`），shadcn/ui 风格组件，移动端优先（max-w-2xl 居中）

### 1.2 编号功能清单

| 编号 | 功能 | 状态 | 关键实现位置 |
|------|------|------|-------------|
| F01 | 邮箱密码注册（zod 校验 + bcrypt 哈希 + 自动初始化 streak） | ✅ 完成 | `/api/register` + `auth/register/page.tsx` |
| F02 | 登录/会话（NextAuth Credentials + JWT 策略） | ✅ 完成 | `src/lib/auth.ts` + `/api/auth/[...nextauth]` |
| F03 | 访客首页（Hero + 统计卡 + 20 分类卡片预览） | ✅ 完成 | `guest-home.tsx` |
| F04 | 今日学习主页（进度条/连击/三统计卡/推荐列表/一键开始） | ✅ 完成 | `today-home.tsx` + `page.tsx` |
| F05 | 每日学习计划：FSRS fallback 生成（7 复习 + 补足 10 新方） | ✅ 完成 | `src/lib/daily-plan.ts` |
| F06 | 每日学习计划：DeepSeek AI 个性化推荐（三层降级） | ✅ 完成 | `/api/ai/daily-recommend` |
| F07 | 方剂详情页三 Tab（传统方歌遮罩 / 口诀拆字 / 药物组成） | ✅ 完成 | `formula-detail.tsx` |
| F08 | 学习模式（遮罩卡使用引导） | ⚠️ 简化版（仅文字说明） | `formula-detail.tsx` mode="learn" |
| F09 | 闯关测试（输入药物组成→diffIngredients 判分→漏答/多答反馈→四级评级） | ✅ 完成 | `quiz-mode.tsx` |
| F10 | 背诵检测（药物组成/方歌口诀/功用主治三题型 + 会话连对计数） | ✅ 完成 | `recite-mode.tsx` |
| F11 | FSRS 间隔重复调度（掌握度 UserMastery 全生命周期） | ✅ 完成 | `src/lib/fsrs.ts` + `/api/answer` |
| F12 | 答题记录与评级（again/hard/good/easy，未评级时按得分自动推断） | ✅ 完成 | `/api/answer` |
| F13 | 连续打卡 streak（首学或评级变化触发，同日幂等，昨日连续+1 否则重置） | ✅ 完成 | `/api/answer` bumpStreak + `/api/streak` |
| F14 | 周统计（近 7 天每日正确/错误/用时/复习方剂数 + 汇总） | ✅ 完成 | `/api/stats/weekly` |
| F15 | ASR 背诵评分 API（接收语音转写文本，规则判分，不调 LLM） | ✅ 完成（无前端入口） | `/api/ai/asr-check` |
| F16 | Vercel Cron 每日预生成计划（CRON_SECRET 鉴权，活跃用户遍历） | ✅ 完成 | `/api/cron/daily-plan` |
| F17 | 分类浏览页 / 搜索结果页 | ✅ 完成 | `categories/[id]` + `search` |
| F18 | 今日计划交互 API（today-plan 查询 / complete 标记 / next 取下一题） | ✅ 完成 | `/api/today-plan/*` |
| F19 | 数据管线：raw_mnemonics.md → formulas_parsed.json → AI 富化 → seed 入库 | ✅ 完成 | `scripts/` |
| F20 | 方案 docx 文档生成脚本（docx 库，12 章方案书） | ✅ 完成（与运行时无关） | `scripts/plan_doc_*.mjs` |
| F21 | 错题本 | ❌ 占位（按钮跳 `/?view=errors`，无视图） | `today-home.tsx` |
| F22 | Header 导航视图切换（`/?view=categories|search|profile`） | ❌ 占位（链接存在，主页不响应 view 参数） | `header.tsx` |
| F23 | AI 对话（AiConversation 表）/ 学习会话（StudySession 表） | ❌ 仅建表，无 API 使用 | `schema.prisma` |

### 1.3 核心闭环（已通过浏览器端到端验证）

注册 → 自动登录 → 今日主页（20 分类种子数据）→「一键开始」→ `/formulas/c01_麻黄汤?mode=learn` → 三 Tab 详情 → 闯关测试输入"麻黄、桂枝、杏仁、甘草" → "通过！得分：100 分" → 评级按钮 POST /api/answer 200 → 「下一题」→ 跳转下一首方剂。

---

### 1.4 典型用户旅程（串联功能清单，供理解产品形态）

1. **新用户**：访问首页 → guest-home 介绍页 → 注册（F01）→ 登录（F02）→ 首页自动生成今日计划（F05 fallback：无学习记录时 10 项全新学，一类方优先）。
2. **日常学习**：首页“开始学习”→ next 端点取计划内下一首 → 详情页选模式：learn 逐句揭示（F08）/ quiz 药物闯关（F09）/ recite 遮罩背诵（F10）→ 本地即时反馈 → 静默上报 answer+complete → 四级自评（F12）→ FSRS 重排下次复习（F11）。
3. **复习驱动**：次日登录 → 计划自动含到期复习项（dueDate ≤ now 前 10）→ 答错（again）的方剂短周期重现，lapseCount 递增。
4. **坚持激励**：每日首次有效答题自动打卡（F13）→ 首页/统计页展示连续天数与周报（F14 stats/weekly）。
5. **AI 增强（可选配键）**：配置 DEEPSEEK_API_KEY 后，daily-recommend 由 AI 按薄弱点生成个性化计划（F06）；部署 cron 后凌晨 3 点批量预生成（F16）；支持语音背诵评分（F15 asr-check，前端麦克风接入尚未完成，见 §10.4）。
6. **全程降级保障**：不配任何 AI 密钥亦可完整使用 1–4（fallback 计划 + 本地算法评分），这是架构级承诺（三层降级，§5.3.11）。

### 1.5 术语表（领域与技术，全文统一用词）

| 术语 | 含义 | 首次定义位置 |
| --- | --- | --- |
| 方剂 | 中医组方（如麻黄汤），本应用的基本学习单元，共 190 首 | §1.1 |
| 章 / 分类 | 《方剂学》20 章（解表剂…涌吐剂），对应 FormulaCategory | §4.9 |
| 压缩口诀 | 极限压缩谐音字块（如“妈跪着炒”），字段 mnemonic | §1.1 |
| 传统方歌 | 教材七言方歌，字段 traditionalMnemonic，recite 参考答案优先级最高 | §4.8.2 |
| 触发词 | 主治关键词（如“身疼无汗”），字段 trigger | §1.1 |
| 一类方/二类方 | 考纲重要度分级，字段 level；fallback 新学一类方优先 | §6.6 |
| 富化（enrich） | 用 LLM 为骨架数据补全 ingredients/functions 等字段的管线步骤 | §7.5.2 |
| 骨架数据 | parse 阶段产物，AI 富化字段为空的 190 条记录 | §4.3 |
| 遮罩自测 | mask-text 样式遮盖方歌，点击/悬停揭示的自测交互 | §8.2 |
| 闯关（quiz） | 输入药物组成 → diffIngredients 判分的测试模式，mode=quiz | §6.2 |
| 背诵检测（recite） | 默写方歌/功用/主治 → textSimilarity 判分，mode=recite | §6.2 |
| ASR | 语音转写文本的规则判分路径，mode=asr，不调 LLM、不动 FSRS | §8.8 时序 D |
| FSRS | Free Spaced Repetition Scheduler（ts-fsrs，FSRS-4.5）间隔重复算法 | §6.1 |
| stability / difficulty / retrievability | FSRS 三核心参数：记忆稳定性 S / 难度 D / 可提取性 R | §4.8.4 |
| dueDate | 下次到期复习时刻，fallback 计划取 `dueDate <= now` | §4.8.4 |
| 评级（rating） | again/hard/good/easy 四级，缺省由 score 阈值推断 | §6.11 ⑤ |
| lapse | 遗忘次数，rating=again 时 +1 | §4.8.4 |
| streak | 连续打卡天数；首学或评级变化触发，同日幂等 | §6.3 |
| checkInHistory | 打卡日 0 点 ISO 串数组（JSON 字符串存储，无裁剪） | §6.8.3 |
| fallback 计划 | 不调 AI 的规则计划：到期复习≤10 + 一类方新学补齐 | §6.6 |
| 三层降级 | AI 推荐的容错链：LLM → 解析失败修复 → fallback 规则计划 | §6.4 |
| PASS_THRESHOLD | 及格线 0.6（match.ts 导出常量，isPass 依据） | §6.2 |
| diff 三色反馈 | correct/missed/wrong 三数组对应 绿/黄/红 渲染 | §8.6 |
| seed | scripts/seed.ts 将 parsed+sample 写入 sqlite 的幂等入库步骤 | §4.10 |
| JWT 策略 | NextAuth session.strategy="jwt"，无数据库会话表 | §5.7 |

### 1.6 功能 → 实现 → 契约 → 测试 追溯矩阵

与 §1.2 功能清单同序，给出每项功能在本文档内的规格章节与测试锚点（“—”表示无专属单测，以 §9.8 冒烟/§9.3 验收为准）：

| 编号 | 规格章节 | 测试锚点 |
| --- | --- | --- |
| F01 注册 | §5.3/§5.5.1 | —（§9.8 S1） |
| F02 登录会话 | §5.7 + §8.8 时序 C | —（setup.ts mock 铺底） |
| F03 访客首页 | §8.1/§8.4 | — |
| F04 今日主页 | §8.3/§8.8 时序 B | today-plan.test.ts（部分） |
| F05 fallback 计划 | §6.6 | today-plan.test.ts（18） |
| F06 AI 推荐 | §6.4 | daily-recommend.test.ts（9） |
| F07 详情三 Tab | §8.3 | formula-detail.test.tsx（15） |
| F08 学习模式（简化） | §8.3 | 同上 |
| F09 闯关判分 | §6.2/§6.8.1/§6.9 | answer.test.ts（28，部分） |
| F10 背诵检测 | §8.3/§6.11 ④ | formula-detail.test.tsx |
| F11 FSRS 调度 | §6.1/§6.10 | fsrs.test.ts（23） |
| F12 答题评级 | §6.11 ⑤ | answer.test.ts |
| F13 streak | §6.3/§6.8.3 | answer.test.ts |
| F14 周统计 | §5.3 | — |
| F15 ASR 评分 | §5.5 + §8.8 时序 D | asr-check.test.ts（10） |
| F16 Cron 预生成 | §5.3/§9.6 | — |
| F17 分类/搜索页 | §7.3/§8.1 | — |
| F18 今日计划 API | §5.3 | today-plan.test.ts |
| F19 数据管线 | §6.5/§7.5/§4.9 | 逐章数量校验（§4.9） |
| F20 docx 生成 | §7.5 | —（非运行时） |
| F21–F23 占位 | §10.3/§10.4 | —（不得补完，保持占位现状） |

---

## 2. 技术栈与环境

### 2.1 运行时与包管理器

**使用 Bun 作为包管理器与脚本运行器**（证据：项目根有 183KB 的 `bun.lock`；package.json 有 Bun 专属字段 `trustedDependencies`；worklog 全程使用 `bun run test` / `bun run lint`）。`package-lock.json`（8.3KB）为残留文件，不作为依赖来源。种子脚本经 `tsx` 执行（`db:seed` 命令）。Node.js ≥ 20 亦可运行（Next.js 15 要求）。

### 2.2 精确版本表（与 package.json 逐字一致）

**dependencies：**

| 包名 | 版本 |
|------|------|
| @auth/prisma-adapter | ^2.7.0 |
| @prisma/client | ^6.2.0 |
| @radix-ui/react-avatar | ^1.1.2 |
| @radix-ui/react-dialog | ^1.1.4 |
| @radix-ui/react-dropdown-menu | ^2.1.4 |
| @radix-ui/react-label | ^2.1.1 |
| @radix-ui/react-progress | ^1.1.1 |
| @radix-ui/react-separator | ^1.1.1 |
| @radix-ui/react-slot | ^1.1.1 |
| @radix-ui/react-tabs | ^1.1.2 |
| @radix-ui/react-toast | ^1.2.4 |
| @types/bcryptjs | ^3.0.0 |
| bcryptjs | ^3.0.3 |
| class-variance-authority | ^0.7.1 |
| clsx | ^2.1.1 |
| lucide-react | ^0.469.0 |
| next | 15.5.0（精确锁定） |
| next-auth | 4.24.11（精确锁定） |
| next-themes | ^0.4.4 |
| react | 19.0.0（精确锁定） |
| react-dom | 19.0.0（精确锁定） |
| tailwind-merge | ^2.6.0 |
| ts-fsrs | ^4.5.2（实际安装 4.7.x，代码按 4.7 API 编写） |
| zod | ^3.24.1 |

**devDependencies：**

| 包名 | 版本 |
|------|------|
| @tailwindcss/postcss | ^4.0.0 |
| @testing-library/jest-dom | ^6.6.3 |
| @testing-library/react | ^16.1.0 |
| @testing-library/user-event | ^14.5.2 |
| @types/node | ^22.10.5 |
| @types/react | 19.0.2 |
| @types/react-dom | 19.0.2 |
| @vitejs/plugin-react | ^4.3.4 |
| autoprefixer | ^10.4.20 |
| dotenv | ^17.4.2 |
| eslint | ^9.18.0 |
| eslint-config-next | 15.5.0 |
| jsdom | ^25.0.1 |
| postcss | ^8.5.1 |
| prisma | ^6.2.0 |
| tailwindcss | ^4.0.0（Tailwind v4，无 tailwind.config，用 CSS `@theme`） |
| tsx | ^4.19.2 |
| typescript | ^5.7.3 |
| vitest | ^2.1.8 |

其他 package.json 字段：`"type": "module"`、`"private": true`、`"trustedDependencies": ["unrs-resolver"]`。

**注意**：`scripts/enrich_formulas.mjs` 依赖 `z-ai-web-dev-sdk`，该包**不在** package.json 中（原开发环境全局可用），复现 AI 富化步骤时需自行安装或改写为 DeepSeek/OpenAI 兼容客户端。

### 2.3 npm scripts（逐字）

```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:push": "prisma db push",
  "db:seed": "tsx scripts/seed.ts",
  "db:studio": "prisma studio"
}
```

常用命令（Bun）：`bun install` / `bun run dev` / `bun run build` / `bun run test`（115 个测试）/ `bun run lint` / `bun run typecheck` / `bunx prisma db push` / `bun run db:seed`。

### 2.4 环境变量表（仅键名 + 用途 + 占位值）

| 键名 | 用途 | 必需 | 占位/示例值 |
|------|------|------|------------|
| DATABASE_URL | Prisma sqlite 数据库路径 | ✅ | `file:./db/custom.db`（仓库 .env 原值为 `file:/home/z/my-project/db/custom.db`，是原 Linux 开发容器的本地路径占位，非凭据，复现时改为相对路径） |
| NEXTAUTH_SECRET | NextAuth JWT 签名密钥 | ✅（生产） | `<随机 32+ 字符串占位>` |
| NEXTAUTH_URL | NextAuth 回调基址（NextAuth 约定变量） | 生产必需 | `http://localhost:3000` |
| DEEPSEEK_API_KEY | DeepSeek API 密钥；未配置时 AI 推荐自动降级为 FSRS fallback | ❌ 可选 | `<占位>` |
| DEEPSEEK_BASE_URL | DeepSeek API 基址覆盖 | ❌ 可选 | 默认 `https://api.deepseek.com` |
| CRON_SECRET | Cron 端点与跨用户推荐的 Bearer 鉴权密钥 | Cron 功能必需 | `<占位>` |

仓库 `.env` 全文（仅 1 行，照录）：

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

`vitest.config.ts` 顶部调用 `dotenv config()`，使 `.env` 中的变量（如 CRON_SECRET）在测试环境可读。

### 2.5 其余配置文件（逐字要点）

- **next.config.ts**：`reactStrictMode: true`；`serverExternalPackages: ["@prisma/client", "ts-fsrs"]`；`eslint.ignoreDuringBuilds: false`。
- **tsconfig.json**：target ES2022，strict，`moduleResolution: "bundler"`，路径别名 `"@/*": ["./src/*"]`，include 含 `.next/types/**/*.ts`。
- **postcss.config.mjs**：仅 `"@tailwindcss/postcss": {}` 插件（Tailwind v4）。
- **.eslintrc.json**：extends `next/core-web-vitals`；关闭 `@next/next/no-img-element` 与 `react/no-unescaped-entities`。
- **.gitignore**：node_modules / .next / .env.local / .env.production / *.log / dist / coverage / .vscode / .idea / .DS_Store（注意：`.env` 本身**未**被忽略，因其只含本地路径）。
- **vitest.config.ts**：jsdom 环境，globals: true，setupFiles `./tests/setup.ts`，include `tests/unit/**/*.test.{ts,tsx}`、`tests/integration/**/*.test.{ts,tsx}`、`src/**/*.{test,spec}.{ts,tsx}`，coverage v8（include src/lib、src/components），alias `@ → ./src`。

---

### 2.6 package.json 全文（69 行，逐字）

以下为仓库根 `package.json` 完整原文，复现时应逐字使用（版本锁定以此为准，配合 bun.lock/重新解析均可）：

```json
{
  "name": "formula-challenge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^2.7.0",
    "@prisma/client": "^6.2.0",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@types/bcryptjs": "^3.0.0",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0",
    "next": "15.5.0",
    "next-auth": "4.24.11",
    "next-themes": "^0.4.4",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "tailwind-merge": "^2.6.0",
    "ts-fsrs": "^4.5.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.5",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "dotenv": "^17.4.2",
    "eslint": "^9.18.0",
    "eslint-config-next": "15.5.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.5.1",
    "prisma": "^6.2.0",
    "tailwindcss": "^4.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  },
  "trustedDependencies": [
    "unrs-resolver"
  ]
}
```

逐字要点：
- `"type": "module"` —— scripts/*.mjs 与 seed.ts（经 tsx）均按 ESM 运行。
- **没有** `db:generate` 脚本；prisma client 生成依赖 `bunx prisma generate`（或 postinstall 自动触发）。
- `db:seed` 用 **tsx** 而非 bun 直跑（seed.ts 依赖 tsx 的 TS/ESM 加载器）。
- `trustedDependencies: ["unrs-resolver"]` 为 Bun 专有字段——允许该包运行 postinstall，佐证包管理器为 Bun。
- `z-ai-web-dev-sdk` **不在依赖表中**，但 `scripts/enrich_formulas.mjs` 顶部 import 了它（原开发容器全局可用），复现时需单独 `bun add z-ai-web-dev-sdk` 或改写为 DeepSeek 直连（见 §10.2 G5）。

### 2.7 版本兼容性与升级禁区（复现时勿擅自升级）

| 组件 | 锁定理由 | 升级风险 |
| --- | --- | --- |
| next 15.5.0（精确版本） | 动态路由 `params` 为 Promise（需 await）是 15 的破坏性变更，代码已按此写 | 降到 14 会编译错；升 16+ 未验证 |
| react 19.0.0（精确） | 与 @types/react 19.0.2、testing-library 16 对齐 | 降 18 会与 Next15 peer 冲突 |
| next-auth 4.24.11（精确） | v5（Auth.js）API 全面重写（authOptions/getServerSession 均废弃） | **绝不可**升 v5，否则 §5/§7.1.4 全部失效 |
| ts-fsrs ^4.5.2 | v4 的 `fsrs()/repeat()/Rating/State` API | v5 有签名变更，升级需同步改 lib/fsrs.ts 与 23 条单测 |
| prisma/@prisma/client ^6.2.0 | sqlite + db push 工作流 | 大版本升级需重验 seed/查询行为 |
| tailwindcss ^4.0.0 | v4 无 tailwind.config，用 CSS `@theme`（globals.css） | 降 v3 需重建配置体系，遮罩/翻卡样式需重写 |
| zod ^3.24.1 | register 的 schema 语法 | v4 错误对象结构变化，首条消息提取逻辑需改 |
| bcryptjs ^3.0.3 | 纯 JS 无原生依赖（Windows/容器友好） | 换 bcrypt(原生) 需重编译，hash 互读兼容但测试 mock 假设 bcryptjs 模块名 |
| vitest ^2.1.8 + jsdom ^25 | setup.ts 的 vi.mock 路径与 API | 升 vitest 3 需回归 115 用例 |

运行时基线：Bun ≥ 1.1（安装/脚本入口）、Node ≥ 20（next dev 实际运行时、scripts/*.mjs）、Python ≥ 3.8（仅 parse_mnemonics.py，无第三方包，纯标准库 re/json/pathlib）。

## 3. 目录结构

带中文注释目录树（排除 node_modules / .next / db 二进制内容 / tool-results / tsconfig.tsbuildinfo）：

```text
方剂口诀闯关-AI增强方案/
├── .env                        # 仅 DATABASE_URL（本地 sqlite 路径占位）
├── .eslintrc.json              # ESLint：next/core-web-vitals + 2 条关闭规则
├── .gitignore
├── bun.lock                    # Bun 锁文件（依赖来源真相）
├── package.json                # 见第 2 章逐字版本表
├── package-lock.json           # 残留文件，不使用
├── next.config.ts              # serverExternalPackages: prisma + ts-fsrs
├── next-env.d.ts               # Next.js 自动生成
├── postcss.config.mjs          # Tailwind v4 PostCSS 插件
├── tsconfig.json               # 路径别名 @/* → src/*
├── vitest.config.ts            # jsdom + dotenv + tests/setup.ts
├── worklog.md                  # 开发过程日志（任务 A–E）
├── site_content.json           # 原站（被复刻站点）抓取内容存档，106KB，非管线必需
├── 方剂.txt                    # 《方剂学》教材全文语料，1MB/8585 行，不内嵌（见 4.6/10.1）
├── prisma/
│   └── schema.prisma           # 9 张表，183 行，第 4 章逐字内嵌
├── db/
│   └── custom.db               # sqlite 二进制 156KB，可由 schema+seed 完全再生（见 4.7）
├── data/
│   ├── raw_mnemonics.md        # 压缩口诀原始表（20 章 Markdown 表格，292 行）
│   ├── formulas_parsed.json    # 解析产物：190 条方剂记录（70KB），格式见 4.3
│   └── formulas_sample.json    # AI 富化样本 5 首（麻黄汤/逍遥散/白虎汤/四君子汤/二陈汤）
├── download/                   # 产物存档（docx 方案书 + 首页截图），非源码
│   ├── README.md
│   ├── home-final.png
│   └── 方剂口诀闯关-AI增强方案.docx
├── scripts/                    # 9 个数据/文档管线脚本（第 7.5 节逐个精讲）
│   ├── parse_mnemonics.py      # raw_mnemonics.md → formulas_parsed.json
│   ├── enrich_formulas.mjs     # LLM 富化 parsed → sample/enriched（prompt 原文收录）
│   ├── seed.ts                 # parsed+sample → sqlite（20 分类 + 190 方剂）
│   ├── generate_plan_doc.mjs   # docx 方案书主入口
│   ├── plan_doc_helpers.mjs    # docx 段落/表格构造器 + 调色板
│   ├── plan_doc_cover.mjs      # docx 封面 + 目录
│   ├── plan_doc_chapters_1_4.mjs   # docx 第 1–4 章内容
│   ├── plan_doc_chapters_5_8.mjs   # docx 第 5–8 章内容
│   └── plan_doc_chapters_9_12.mjs  # docx 第 9–12 章内容
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 @theme 调色板 + mask-text 遮罩样式
│   │   ├── layout.tsx          # RootLayout：zh-CN + SessionProvider
│   │   ├── page.tsx            # 首页：未登录 GuestHome / 已登录 TodayHome
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # 登录表单（client）
│   │   │   └── register/page.tsx   # 注册表单（client，注册后自动登录）
│   │   ├── categories/[id]/page.tsx  # 分类浏览页（server）
│   │   ├── formulas/[id]/page.tsx    # 方剂详情页（server，decodeURIComponent）
│   │   ├── search/page.tsx           # 搜索结果页（server，?q=）
│   │   └── api/
│   │       ├── answer/route.ts             # POST 答题评分+FSRS+streak（核心）
│   │       ├── register/route.ts           # POST 注册
│   │       ├── auth/[...nextauth]/route.ts # NextAuth handler
│   │       ├── formulas/route.ts           # GET 方剂列表（筛选/搜索）
│   │       ├── formulas/[id]/route.ts      # GET 方剂详情
│   │       ├── mastery/route.ts            # GET 掌握度列表
│   │       ├── streak/route.ts             # GET 打卡信息
│   │       ├── stats/weekly/route.ts       # GET 周统计
│   │       ├── today-plan/route.ts         # GET 今日计划（无则生成）
│   │       ├── today-plan/complete/route.ts# POST 标记完成
│   │       ├── today-plan/next/route.ts    # GET 下一个未完成
│   │       ├── ai/asr-check/route.ts       # POST ASR 评分
│   │       ├── ai/daily-recommend/route.ts # POST AI 每日推荐
│   │       └── cron/daily-plan/route.ts    # GET/POST Cron 预生成
│   ├── components/
│   │   ├── providers.tsx       # SessionProvider 包装
│   │   ├── header.tsx          # 顶部导航（登录态切换）
│   │   ├── guest-home.tsx      # 访客首页
│   │   ├── today-home.tsx      # 今日学习主页
│   │   ├── formula-detail.tsx  # 方剂详情（三 Tab + 模式状态机）
│   │   ├── quiz-mode.tsx       # 闯关测试子组件
│   │   ├── recite-mode.tsx     # 背诵检测子组件
│   │   └── ui/                 # shadcn/ui 风格基础组件（9 个）
│   │       ├── badge.tsx button.tsx card.tsx dialog.tsx input.tsx
│   │       └── label.tsx progress.tsx separator.tsx tabs.tsx
│   └── lib/
│       ├── auth.ts             # NextAuth 配置 + bcrypt 包装
│       ├── daily-plan.ts       # 今日计划共享逻辑（fallback 生成/序列化）
│       ├── db.ts               # PrismaClient 全局单例
│       ├── deepseek.ts         # DeepSeek API 客户端
│       ├── fsrs.ts             # FSRS 封装（参数常量见第 6 章）
│       ├── match.ts            # 判分算法（Jaccard/diff/编辑距离）
│       ├── types.ts            # 前端共享类型
│       └── utils.ts            # cn() 工具
└── tests/
    ├── setup.ts                # 全局 mock（next/navigation、next-auth、内存版 db）
    └── unit/                   # 7 个测试文件，共 115 个测试
        ├── answer.test.ts (28)     fsrs.test.ts (23)     today-plan.test.ts (18)
        ├── formula-detail.test.tsx (15)  deepseek.test.ts (12)
        └── asr-check.test.ts (10)  daily-recommend.test.ts (9)
```

文件统计：src 下 41 个源码文件（app 22 + components 16 + lib 8，globals.css 计入 app），scripts 9 个，prisma 1 个，tests 8 个。

### 3.1 关键文件行数速查表

复现完成后可逐项对照：**逐字收录文件必须行数完全一致**；规格化描述文件的行数为原项目实测值，复现实现允许 ±20% 偏差（逻辑等价即可）。

| 文件 | 原行数 | 收录方式 | 所在章节 |
| --- | --- | --- | --- |
| prisma/schema.prisma | 183 | 逐字 | §4.1 |
| package.json | 69 | 逐字 | §2.6 |
| src/lib/types.ts | 93 | 逐字 | §7.7 |
| src/lib/auth.ts | 59 | 规格 | §7.1 |
| src/lib/daily-plan.ts | 147 | 规格 + 关键逻辑 §6.6 | §7.1 |
| src/lib/db.ts | 14 | 规格（全局单例样板） | §7.1 |
| src/lib/deepseek.ts | 100 | 规格 + 协议细节 | §7.1 |
| src/lib/fsrs.ts | 137 | 规格 + 常量逐字 §6.1 | §7.1 |
| src/lib/match.ts | 91 | 规格 + 算法逐条 §6.2/§6.8.1 | §7.1 |
| src/lib/utils.ts | 7 | 规格（cn 工具） | §7.1 |
| src/app/api/answer/route.ts | 279 | 规格 + 十步展开 §6.11 | §7.2 |
| data/raw_mnemonics.md | 292 | 格式规范 + 样例 | §4.5 |
| data/formulas_parsed.json | 2852 | 格式规范 + 3 条完整样例 | §4.3 |
| 方剂.txt | 8585 | 仅描述，不内嵌 | §4.6/§10.1 |

---

## 4. 数据模型

### 4.1 prisma/schema.prisma 全文（183 行，逐字内嵌）

```prisma
// Prisma Schema for 方剂口诀闯关 AI 增强版
// 9 张表设计 - 详见方案文档第 5 章

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ==================== 内容表 ====================

model FormulaCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String   @default("")
  sortOrder   Int      @default(0)
  formulas    Formula[]

  @@map("formula_categories")
}

model Formula {
  id                              String   @id
  name                            String
  source                          String   @default("")
  alias                           String   @default("[]")
  categoryId                      Int
  mnemonic                        String   @default("")
  mnemonicExplanation             String   @default("")
  traditionalMnemonic             String   @default("")
  traditionalMnemonicExplanation  String   @default("")
  ingredients                     String   @default("[]")
  functions                       String   @default("")
  indications                     String   @default("")
  trigger                         String   @default("")
  level                           String   @default("二类方")
  sortOrder                       Int      @default(0)
  createdAt                       DateTime @default(now())
  updatedAt                       DateTime @updatedAt
  category                        FormulaCategory @relation(fields: [categoryId], references: [id])
  userMastery                     UserMastery[]
  answerLogs                      AnswerLog[]

  @@unique([name, source])
  @@index([categoryId])
  @@index([level])
  @@map("formulas")
}

// ==================== 用户表 ====================

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  passwordHash    String
  studyStage      String   @default("newbie") // newbie | intensive | sprint | final
  dailyGoal       Int      @default(10)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  mastery         UserMastery[]
  answerLogs      AnswerLog[]
  dailyPlans      DailyPlan[]
  studySessions   StudySession[]
  conversations   AiConversation[]
  streak          UserStreak?

  @@map("users")
}

// ==================== 用户行为表 ====================

model UserMastery {
  id              Int      @id @default(autoincrement())
  userId          String
  formulaId       String
  // FSRS 参数
  stability       Float    @default(0)
  difficulty      Float    @default(0)
  retrievability  Float    @default(1)
  lastReview      DateTime?
  dueDate         DateTime @default(now())
  reviewCount     Int      @default(0)
  lapseCount      Int      @default(0)
  lastRating      String?  // again | hard | good | easy
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  formula         Formula  @relation(fields: [formulaId], references: [id], onDelete: Cascade)

  @@unique([userId, formulaId])
  @@index([userId, dueDate])
  @@map("user_mastery")
}

model AnswerLog {
  id                Int      @id @default(autoincrement())
  userId            String
  formulaId         String
  mode              String   // learn | quiz | recite | asr
  questionType      String   // ingredients | mnemonic | functions | indications
  userAnswer        String   @default("")
  correctAnswer     String   @default("")
  isCorrect         Boolean  @default(false)
  matchScore        Float    @default(0)
  timeSpentSeconds  Int      @default(0)
  rating            String?  // again | hard | good | easy
  aiFeedbackSnapshot String? // JSON 字符串
  createdAt         DateTime @default(now())
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  formula           Formula  @relation(fields: [formulaId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([formulaId])
  @@map("user_answer_logs")
}

model StudySession {
  id              Int      @id @default(autoincrement())
  userId          String
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  durationSeconds Int      @default(0)
  formulasStudied String   @default("[]") // JSON 数组
  mode            String   @default("learn")
  correctCount    Int      @default(0)
  wrongCount      Int      @default(0)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
  @@map("user_study_sessions")
}

model UserStreak {
  id              Int      @id @default(autoincrement())
  userId          String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastCheckIn     DateTime?
  totalCheckIns   Int      @default(0)
  checkInHistory  String   @default("[]") // JSON 数组
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}

// ==================== AI 与计划表 ====================

model DailyPlan {
  id                  Int      @id @default(autoincrement())
  userId              String
  planDate            DateTime
  recommendedFormulas String   @default("[]") // JSON 数组：[{formulaId, reason, type}]
  newCount            Int      @default(0)
  reviewCount         Int      @default(0)
  completedCount      Int      @default(0)
  isCompleted         Boolean  @default(false)
  createdAt           DateTime @default(now())
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, planDate])
  @@index([userId, planDate])
  @@map("user_daily_plans")
}

model AiConversation {
  id            Int      @id @default(autoincrement())
  userId        String
  formulaId     String?
  messages      String   @default("[]") // JSON 数组
  messageCount  Int      @default(0)
  totalTokens   Int      @default(0)
  model         String   @default("deepseek-chat")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("ai_conversations")
}
```

### 4.2 模型要点与设计约定

- **sqlite 无原生数组/JSON 类型** → 所有数组字段以 JSON 字符串存储：`Formula.alias`、`Formula.ingredients`、`UserStreak.checkInHistory`、`DailyPlan.recommendedFormulas`、`StudySession.formulasStudied`、`AiConversation.messages`。读取侧统一用 `safeParseArr`（JSON.parse 失败返回 `[]`）反序列化。
- **Formula.id 为业务主键字符串**：格式 `c{章号两位}_{方名}`，如 `c01_麻黄汤`（由 seed.ts 的 `makeId` 生成）。
- **枚举以字符串约定**（sqlite 不支持 enum）：`studyStage ∈ {newbie, intensive, sprint, final}`；`mode ∈ {learn, quiz, recite, asr}`；`questionType ∈ {ingredients, mnemonic, functions, indications}`；`rating ∈ {again, hard, good, easy}`；`level ∈ {一类方, 二类方}`。
- **复合唯一键**：`UserMastery @@unique([userId, formulaId])`、`DailyPlan @@unique([userId, planDate])`、`Formula @@unique([name, source])`。业务代码为兼容测试 mock，多用 `findFirst` + 显式 create/update 而非复合键 upsert（详见 6.7）。
- **级联删除**：所有用户行为表对 User/Formula 均为 `onDelete: Cascade`。
- `StudySession` 与 `AiConversation` 当前无任何 API 读写（预留表）。

### 4.3 data/formulas_parsed.json 格式规范

**定位**：`parse_mnemonics.py` 从 `raw_mnemonics.md` 解析出的 190 条方剂骨架数据（仅口诀+触发词，AI 富化字段为空），是 `enrich_formulas.mjs` 的输入、`seed.ts` 的主数据源。

**顶层结构**：JSON 数组，共 **190 个对象**（2852 行，约 70KB）。每个对象 13 个字段，全部必填（缺省用空字符串/空数组）：

| 字段 | 类型 | 说明 | 骨架阶段取值 |
| --- | --- | --- | --- |
| `id` | string | 方名（注意：seed 时会重新生成 `c{章}_{名}` 格式 id，此处 id=name） | 方名 |
| `chapter` | number | 章号 1–20 | 解析自 `## 第N章` |
| `chapter_name` | string | 章名（如 "解表剂"） | 同上 |
| `name` | string | 方名 | 表格第1列 |
| `mnemonic` | string | 压缩字块口诀 | 表格第2列 |
| `mnemonic_explanation` | string | 口诀逐字拆解（AI 富化） | `""` |
| `traditional_mnemonic` | string | 传统方歌（AI 富化） | `""` |
| `traditional_mnemonic_explanation` | string | 方歌逐句讲解（AI 富化） | `""` |
| `ingredients` | string[] | 组成药物数组（AI 富化） | `[]` |
| `functions` | string | 功用（AI 富化） | `""` |
| `indications` | string | 主治（AI 富化） | `""` |
| `trigger` | string | 触发关键词 | 表格第3列 |
| `level` | string | "一类方"/"二类方"（AI 富化或人工标注） | `""` |

**3 条完整样例（逐字，取自文件头部）**：

```json
[
  {
    "id": "麻黄汤",
    "chapter": 1,
    "chapter_name": "解表剂",
    "name": "麻黄汤",
    "mnemonic": "妈跪着炒",
    "mnemonic_explanation": "",
    "traditional_mnemonic": "",
    "traditional_mnemonic_explanation": "",
    "ingredients": [],
    "functions": "",
    "indications": "",
    "trigger": "身疼无汗",
    "level": ""
  },
  {
    "id": "桂枝汤",
    "chapter": 1,
    "chapter_name": "解表剂",
    "name": "桂枝汤",
    "mnemonic": "贵族炒姜枣",
    "mnemonic_explanation": "",
    "traditional_mnemonic": "",
    "traditional_mnemonic_explanation": "",
    "ingredients": [],
    "functions": "",
    "indications": "",
    "trigger": "喝粥出汗",
    "level": ""
  },
  {
    "id": "九味羌活汤",
    "chapter": 1,
    "chapter_name": "解表剂",
    "name": "九味羌活汤",
    "mnemonic": "羌房老头穿白纸+生黄芩草",
    "mnemonic_explanation": "",
    "traditional_mnemonic": "",
    "traditional_mnemonic_explanation": "",
    "ingredients": [],
    "functions": "",
    "indications": "",
    "trigger": "一身尽痛",
    "level": ""
  }
]
```

### 4.4 data/formulas_sample.json 格式规范（AI 富化后形态）

**定位**：`enrich_formulas.mjs --sample` 产出的 5 首样例（麻黄汤/逍遥散/白虎汤/四君子汤/二陈汤，108 行），展示富化后的完整字段形态；`seed.ts` 会用它按 `name` 合并覆盖 parsed 中的同名条目。

**1 条完整样例（逐字）**：

```json
{
  "id": "麻黄汤",
  "chapter": 1,
  "chapter_name": "解表剂",
  "name": "麻黄汤",
  "mnemonic": "妈跪着炒",
  "mnemonic_explanation": "妈(麻黄) + 跪(桂枝) + 着(杏仁) + 炒(甘草)",
  "traditional_mnemonic": "麻黄汤中用桂枝，杏仁甘草四般齐，发汗解表疗伤寒，脉紧头痛身痛时。",
  "traditional_mnemonic_explanation": "首句'麻黄汤中用桂枝'点出方中两味主要药物麻黄和桂枝；第二句'杏仁甘草四般齐'说明方中还有杏仁和甘草，共四味药物；第三句'发汗解表疗伤寒'概括了本方的主要功效；第四句'脉紧头痛身痛时'描述了本方的主治证候，即脉象浮紧，头痛，身体疼痛。此方歌全面概括了麻黄汤的药物组成、功效和主治，便于记忆。",
  "ingredients": ["麻黄", "桂枝", "杏仁", "甘草"],
  "functions": "发汗解表，宣肺平喘",
  "indications": "主治外感风寒表实证。症见恶寒发热，头痛身疼，无汗而喘，舌苔薄白，脉浮紧。",
  "trigger": "身疼无汗",
  "level": "一类方"
}
```

富化字段约定：`mnemonic_explanation` 格式为 `字(药名) + 字(药名) + …`；`traditional_mnemonic` 为经典方歌原文；`ingredients` 与口诀字块一一对应；`level` 二值枚举 `一类方`/`二类方`。

### 4.5 data/raw_mnemonics.md 格式规范

**定位**：人工整理的口诀源文件（292 行，20 章，190 条），是整条数据管线的最上游文本资产。

**格式规则**（parse_mnemonics.py 依赖）：
1. 章标题行：`## 第{中文数字}章 {章名}`，如 `## 第一章 解表剂`。中文数字支持一~二十。
2. 每章一个 3 列 Markdown 表格：`| 方名 | 压缩字块 | 触发 |`。
3. 表头行与分隔行（含 `---` 或 `:` 的行、首列为 "方名" 的行）被解析器跳过。
4. 压缩字块中 `+` 用于分组（主药块+辅药块），解析时原样保留。

**样例（逐字，第一章开头）**：

```markdown
## 第一章 解表剂

| 方名 | 压缩字块 | 触发 |
| :--- | :--- | :--- |
| 麻黄汤 | 妈跪着炒 | 身疼无汗 |
| 桂枝汤 | 贵族炒姜枣 | 喝粥出汗 |
| 九味羌活汤 | 羌房老头穿白纸+生黄芩草 | 一身尽痛 |
| 小青龙汤 | 妈跪将要生虾喂白草 | 后背冰凉 |
```

**样例（第二十章结尾）**：

```markdown
## 第二十章 涌吐剂

| 方名 | 压缩字块 | 触发 |
| :--- | :--- | :--- |
| 瓜蒂散 | 瓜蒂+赤豆+豉 | 胸痞欲吐 |
| 救急稀涎散 | 皂矾末 | 痰堵牙紧 |
| 盐汤探吐方 | 盐汤灌 | 食毒干呕 |
```

### 4.6 方剂.txt（仅描述，不内嵌）

- **性质**：约 1MB 的方剂学教材语料纯文本（教材章节原文：组成、用法、功用、主治、方解等），编码 UTF-8。
- **在管线中的角色**：**不被任何脚本直接读取**。它是人工整理 `raw_mnemonics.md` 与 AI 富化时的参考语料/事实依据，属"人读资产"而非"机读资产"。
- **复现处理**：无法从本文档再生。复现时可省略（不影响任何脚本运行），或用任意方剂学教材文本替代；富化数据的正确性由 `enrich_formulas.mjs` 的 AI prompt + 人工校对保证。

### 4.7 db/custom.db 再生链路

`custom.db`（156KB sqlite 二进制）**不需要也不应该**直接复制，完整再生链路：

```
raw_mnemonics.md ──python scripts/parse_mnemonics.py──▶ data/formulas_parsed.json (190条骨架)
                                                              │
            DEEPSEEK_API_KEY + z-ai-web-dev-sdk（可选）        ▼
                 ──node scripts/enrich_formulas.mjs──▶ data/formulas_enriched.json（全量富化，仓库未含）
                 ──node scripts/enrich_formulas.mjs --sample──▶ data/formulas_sample.json (5条，仓库已含)
                                                              │
prisma/schema.prisma ──bunx prisma db push──▶ db/custom.db（建表）
                                                              │
                 ──bun run db:seed (tsx scripts/seed.ts)──▶ 写入 20 分类 + 190 方剂
```

要点：
- `.env` 中 `DATABASE_URL=file:/home/z/my-project/db/custom.db` 为原容器绝对路径，**复现时改为相对路径** `file:./db/custom.db`（相对 prisma 目录则为 `file:../db/custom.db`，见 §9）。
- seed 幂等：按 `Formula.id` upsert，可反复执行。
- 无 migration 目录，用 `prisma db push` 直接同步 schema（开发模式）。

### 4.8 数据字典（9 表逐字段，含业务语义与读写方）

本节是 §4.1 schema 的语义展开，供重构时校验字段理解。类型列为 Prisma 类型；“读写方”列出真实读写该字段的代码位置。

#### 4.8.1 formula_categories（FormulaCategory，20 行数据）

| 字段 | 类型 | 默认 | 语义 | 读写方 |
| --- | --- | --- | --- | --- |
| id | Int PK autoincrement | - | 章号 1-20（seed 按 chapter 号 create，与自增巧合） | seed.ts 写；formulas 路由/首页读 |
| name | String @unique | - | 章名，如“解表剂” | seed.ts upsert by name |
| description | String | "" | 章描述（当前 seed 留空） | - |
| sortOrder | Int | 0 | 排序（= 章号） | 首页分类列表 orderBy |

#### 4.8.2 formulas（Formula，190 行数据）

| 字段 | 类型 | 默认 | 语义 | 读写方 |
| --- | --- | --- | --- | --- |
| id | String PK | - | 业务主键 `c{章号两位}_{方名}`，如 `c01_麻黄汤` | seed.ts makeId |
| name | String | - | 方名 | 全站展示/搜索 |
| source | String | "" | 出处（当前留空，与 name 组合唯一） | @@unique([name,source]) |
| alias | String | "[]" | 别名 JSON 数组字符串 | API 返回前 safeParseArr |
| categoryId | Int FK | - | 所属章 | formulas?categoryId= 过滤 |
| mnemonic | String | "" | 压缩字块口诀（如“妈跪着炒”） | 学习/背诵模式主展示 |
| mnemonicExplanation | String | "" | 逐字拆解 `字(药名) + …` | 学习模式揭示 |
| traditionalMnemonic | String | "" | 教材方歌原文 | recite 参考答案优先级最高 |
| traditionalMnemonicExplanation | String | "" | 方歌逐句解释（≥100字） | 详情页折叠展示 |
| ingredients | String | "[]" | 药物 JSON 数组字符串 | answer/asr-check 评分基准 |
| functions | String | "" | 功用（8-20字） | questionType=functions 参考 |
| indications | String | "" | 主治（50-150字） | questionType=indications 参考 |
| trigger | String | "" | 触发关键词（如“身疼无汗”） | 列表/详情提示 |
| level | String | "二类方" | 一类方/二类方 | fallback 计划新学优先一类方 |
| sortOrder | Int | 0 | 章内序（seed 按解析顺序递增） | 列表 orderBy |
| createdAt/updatedAt | DateTime | now()/@updatedAt | 审计 | - |

#### 4.8.3 users（User）

| 字段 | 类型 | 默认 | 语义 | 读写方 |
| --- | --- | --- | --- | --- |
| id | String PK cuid() | - | 用户 id，注入 JWT/session | NextAuth 回调 |
| email | String @unique | - | 登录名（存前转小写） | register/authorize |
| name | String? | - | 昵称 | 顶部栏展示 |
| passwordHash | String | - | bcrypt hash（测试 mock 为 `hashed-原文`） | register 写 / authorize compare |
| studyStage | String | "newbie" | newbie/intensive/sprint/final（当前无 UI 修改入口） | daily-recommend prompt 上下文 |
| dailyGoal | Int | 10 | 每日目标首数（当前固定 10） | prompt 上下文 |
| createdAt/updatedAt | DateTime | - | updatedAt 兼作“活跃度”——cron 筛 `updatedAt >= 7 天前` | cron/daily-plan |

#### 4.8.4 user_mastery（UserMastery，FSRS 状态）

| 字段 | 类型 | 默认 | 语义 | 读写方 |
| --- | --- | --- | --- | --- |
| stability | Float | 0 | FSRS 记忆稳定性 S | fsrs.ts review() 全量覆写 |
| difficulty | Float | 0 | FSRS 难度 D | 同上 |
| retrievability | Float | 1 | 可提取性 R（写入时算好） | mastery 页展示 |
| lastReview | DateTime? | null | 上次复习时刻 | review() 写 now |
| dueDate | DateTime | now() | 下次到期；fallback 计划取 `dueDate <= now` 前 10 | today-plan/daily-recommend |
| reviewCount | Int | 0 | 累计复习次数；`===0` 时首答触发 streak | answer ⑨ |
| lapseCount | Int | 0 | 遗忘次数（rating=again 时 +1） | review() |
| lastRating | String? | null | 上次评级；变化时触发 streak | answer ⑨ |

唯一键 `[userId, formulaId]`；业务代码用 `findFirst({where:{userId,formulaId}})` + 分支 update/create（非 upsert，兼容 mock）。

#### 4.8.5 user_answer_logs（AnswerLog，只增不改）

| 字段 | 类型 | 默认 | 语义 |
| --- | --- | --- | --- |
| mode | String | - | learn/quiz/recite/asr（asr 仅由 asr-check 写） |
| questionType | String | - | ingredients/mnemonic/functions/indications |
| userAnswer | String | "" | 用户原始答案（asr 为 transcript 原文） |
| correctAnswer | String | "" | ingredients 题存 JSON.stringify(药物数组)，否则存参考文本 |
| isCorrect | Boolean | false | `score >= 0.6` |
| matchScore | Float | 0 | 评分 0~1（两位小数语义） |
| timeSpentSeconds | Int | 0 | `Math.max(0, Math.floor(n))`，非数字→0；stats/weekly 累加 |
| rating | String? | null | 最终评级（显式或推断） |
| aiFeedbackSnapshot | String? | null | 预留，当前无代码写入 |

#### 4.8.6 user_streaks（UserStreak，1:1 用户）

| 字段 | 语义 | 更新规则（api/answer/route.ts 内联 bumpStreak，§6.3） |
| --- | --- | --- |
| currentStreak | 当前连续天数 | 同日重复打卡不变；昨日打过 +1；断档 → 1 |
| longestStreak | 历史最长 | `Math.max(longest, current)` |
| lastCheckIn | 最后打卡时刻 | 每次有效打卡写 now |
| totalCheckIns | 累计打卡日数 | 仅新日首次 +1 |
| checkInHistory | JSON ISO 日期数组（`todayStart.toISOString()`） | append，无长度上限 |

#### 4.8.7 user_daily_plans（DailyPlan）

| 字段 | 语义 |
| --- | --- |
| planDate | 当日 0 点（本地时区 startOfDay）；查询用 gte/lte 日区间而非复合键 |
| recommendedFormulas | JSON 数组 `[{formulaId, formulaName, type: "new"|"review", reason, completed}]`（serialize 后对外字段名为 items） |
| newCount/reviewCount | 按 type 统计，落库时计算 |
| completedCount | complete 端点递增；`isCompleted = completedCount >= items.length` |

#### 4.8.8 user_study_sessions / 4.8.9 ai_conversations（预留表）

两表已建 schema（字段见 §4.1）但**当前无任何 API/页面读写**；复现时只需建表，无需业务逻辑。AiConversation.model 默认 `"deepseek-chat"` 为未来对话功能预留。

#### 4.8.10 序列化总览（DB 字符串 ↔ API 数组）

| 表.字段 | DB 形态 | API 形态 | 转换点 |
| --- | --- | --- | --- |
| Formula.alias / ingredients | `'["麻黄",…]'` | `string[]` | formulas 两路由 safeParseArr |
| DailyPlan.recommendedFormulas | JSON 字符串 | `items: DailyPlanItem[]` | daily-plan.ts serializePlan（daily-recommend 例外：返回原始行） |
| UserStreak.checkInHistory | JSON 字符串 | （不对外） | answer 路由内部 |
| AnswerLog.correctAnswer | ingredients 题为 JSON 字符串 | （不对外） | answer/asr-check 写入 |

### 4.9 raw_mnemonics.md 逐章分布总表（与 TARGET_COUNTS 一致，解析后逐章校验）

| 章 | 章名 | 方数 | 章 | 章名 | 方数 |
| --- | --- | --- | --- | --- | --- |
| 1 | 解表剂 | 13 | 11 | 开窍剂 | 4 |
| 2 | 泻下剂 | 11 | 12 | 理气剂 | 8 |
| 3 | 和解剂 | 9 | 13 | 理血剂 | 14 |
| 4 | 清热剂 | 20 | 14 | 治风剂 | 9 |
| 5 | 祛暑剂 | 8 | 15 | 治燥剂 | 6 |
| 6 | 温里剂 | 13 | 16 | 祛湿剂 | 14 |
| 7 | 表里双解剂 | 4 | 17 | 祛痰剂 | 12 |
| 8 | 补益剂 | 24 | 18 | 消食剂 | 3 |
| 9 | 固涩剂 | 9 | 19 | 驱虫剂 | 3 |
| 10 | 安神剂 | 3 | 20 | 涌吐剂 | 3 |

合计 190 首（章名与方数均逐字抓自 parse_mnemonics.py 的 CHAPTER_NAMES / TARGET_COUNTS 常量，§7.5.1）。重建语料时此表是验收基准：任一章方数不符，解析脚本会打印 `⚠️ 缺 N`/`溢出 N` 告警（但不中断输出）。

#### 4.10 seed.ts 合并规则（parsed + sample/enriched → DB）

1. 读 `formulas_parsed.json`（190 条骨架）；若存在 `formulas_enriched.json` 则优先用它作主源，否则用 parsed。
2. 若存在 `formulas_sample.json`，按 `name` 建索引，同名条目的富化字段覆盖主源（sample 优先级最高，保证 5 首演示数据完整）。
3. 逐章 upsert FormulaCategory（by name，id=章号）；逐条 upsert Formula（by makeId 生成的 id），数组字段 JSON.stringify 落库，level 空值落默认“二类方”。
4. 全程无删除操作 → 可重复执行；方剂改名会产生新 id 新行（已知行为，见 §10.3）。

<!-- SECTION 4 END -->

## 5. API 契约

### 5.1 端点总表（14 个 route.ts，与 src/app/api 一一对应）

| # | 方法 | 路径 | 鉴权 | 职责 | 文件行数 |
| --- | --- | --- | --- | --- | --- |
| 1 | GET/POST | `/api/auth/[...nextauth]` | - | NextAuth 处理器（登录/会话/登出） | 7 |
| 2 | POST | `/api/register` | 无 | 注册（zod 校验 + bcrypt + 初始化 streak） | 50 |
| 3 | GET | `/api/formulas` | 无 | 方剂列表（categoryId/level/search/limit 过滤） | 54 |
| 4 | GET | `/api/formulas/[id]` | 无 | 方剂详情（含分类名，数组字段反序列化） | 38 |
| 5 | POST | `/api/answer` | 会话 | 答题评分 + FSRS 更新 + streak 打卡（核心端点） | 279 |
| 6 | GET | `/api/mastery` | 会话 | 当前用户全部 FSRS 掌握度记录 | 54 |
| 7 | GET | `/api/streak` | 会话 | 连续打卡信息 | 40 |
| 8 | GET | `/api/stats/weekly` | 会话 | 近 7 天答题统计（按天分桶） | 100 |
| 9 | GET | `/api/today-plan` | 会话 | 今日计划（无则 fallback 生成） | 36 |
| 10 | POST | `/api/today-plan/complete` | 会话 | 标记计划内某方剂完成 | 96 |
| 11 | GET | `/api/today-plan/next` | 会话 | 计划中下一个未完成方剂 | 52 |
| 12 | POST | `/api/ai/daily-recommend` | 会话或 CRON | DeepSeek 生成今日计划（三层降级） | 176 |
| 13 | POST | `/api/ai/asr-check` | 会话 | 语音转写文本评分（mode=asr） | 77 |
| 14 | GET/POST | `/api/cron/daily-plan` | CRON_SECRET | 批量预生成活跃用户当日计划 | 99 |

### 5.2 鉴权模型

- **会话鉴权**：`getServerSession(authOptions)` → `session.user` 不存在或 `(session.user as {id?:string}).id` 为空 → `401 {"error":"未登录"}`。用户 id 经 NextAuth jwt/session 回调注入（见 7.1.4）。
- **CRON 鉴权**（`/api/cron/daily-plan`）：`process.env.CRON_SECRET` 未配置 → `500 {"error":"CRON_SECRET not configured"}`；请求头 `Authorization: Bearer <CRON_SECRET>` 或查询参数 `?secret=<CRON_SECRET>` 二选一，否则 `401 {"error":"Unauthorized"}`。
- **代理鉴权**（`/api/ai/daily-recommend`）：body 里的 `userId` 若不等于会话用户，则必须携带 `Authorization: Bearer <CRON_SECRET>`（供 cron 内部调用），否则 `403 {"error":"无权限"}`。

### 5.3 各端点请求/响应 shape

#### 5.3.1 POST /api/register

请求：`{ email: string(邮箱格式), password: string(≥6位), name: string(1-30字) }`（zod schema，错误信息取第一条 issue）。

响应 200：`{ "user": { "id", "email", "name" }, "message": "注册成功" }`（email 统一转小写；同时 `streak: { create: {} }` 嵌套创建空 UserStreak）。

错误：400 zod 首条错误消息（如 `请输入有效邮箱`/`密码至少 6 位`/`请输入昵称`）；409 `该邮箱已注册`；500 `注册失败`。

#### 5.3.2 GET /api/formulas

查询参数：`categoryId`(int)、`level`(一类方/二类方)、`search`(对 name/mnemonic/traditionalMnemonic 三字段 OR contains)、`limit`(默认 100，上限 500)。排序 `[{sortOrder:asc},{name:asc}]`。

响应 200：`{ "formulas": [ { …Formula 全字段, "alias": string[], "ingredients": string[], "category": {…}, "categoryName": string } ] }`（alias/ingredients 由 JSON 字符串反序列化，解析失败返回 `[]`）。错误：500 `查询失败`。

#### 5.3.3 GET /api/formulas/[id]

路径参数 `id`（Next.js 15：`params` 为 Promise 需 `await`；前端跳转时需 `encodeURIComponent`，如 `c01_麻黄汤`）。

响应 200：Formula 全字段 + `alias`/`ingredients` 数组化 + `categoryName`（**顶层对象，无包裹键**）。错误：404 `方剂不存在`；500 `查询失败`。

#### 5.3.4 POST /api/answer（核心）

请求体：

```json
{
  "formulaId": "c01_麻黄汤",
  "mode": "learn | quiz | recite | asr",
  "questionType": "ingredients | mnemonic | functions | indications",
  "userAnswer": "麻黄、桂枝、杏仁、甘草",
  "rating": "again | hard | good | easy（可选，缺省由 score 推断）",
  "timeSpentSeconds": 12
}
```

校验常量（逐字）：`VALID_MODES = ["learn","quiz","recite","asr"]`、`VALID_QTYPES = ["ingredients","mnemonic","functions","indications"]`、`VALID_RATINGS = ["again","hard","good","easy"]`。

处理流程（10 步）：①鉴权 ②req.json 解析（失败 400 `请求体格式错误`）③逐字段校验（400：`缺少 formulaId`/`非法 mode`/`非法 questionType`/`缺少 userAnswer`/`非法 rating`）④查方剂（404 `方剂不存在`）⑤评分——`questionType=="ingredients"` 时用户答案按 `/[、,，;；\s]+/` 切分后 `diffIngredients`，`correctAnswer=JSON.stringify(正确药物数组)`；否则取参考文本（mnemonic→`traditionalMnemonic || mnemonic || ""`，functions→`functions`，indications→`indications`）做 `textSimilarity`，diff 为三空数组 ⑥评级推断：显式 rating 优先，否则 `score>=0.9→easy / >=0.7→good / >=0.6→hard / else→again` ⑦mastery upsert（`findFirst({userId,formulaId})` 后分支 update(by id)/create，写入 `review()` 输出的 8 个 FSRS 字段 + lastRating）⑧写 AnswerLog（timeSpentSeconds 取 `Math.max(0, Math.floor(n))`，非数字则 0）⑨streak：仅当 `wasFirstReview(prev.reviewCount===0)` 或 `ratingChanged(prevRatingStr!==null && !==finalRating)` 时调 `bumpStreak` ⑩返回。

响应 200：

```json
{
  "isCorrect": true,
  "score": 0.75,
  "diff": { "correct": ["麻黄"], "missed": ["桂枝"], "wrong": ["黄芪"] },
  "nextReview": "2026-08-02T03:00:00.000Z",
  "rating": "good"
}
```

错误：401/400/404 如上；500 `提交失败`。

#### 5.3.5 GET /api/mastery

响应 200：`{ "masteries": [ { id, userId, formulaId, stability, difficulty, retrievability, lastReview, dueDate, reviewCount, lapseCount, lastRating, formula: { id, name, source, level, categoryId } | null } ] }`，排序 `[{dueDate:asc},{id:asc}]`。错误：401；500 `查询失败`。

#### 5.3.6 GET /api/streak

响应 200：`{ currentStreak, longestStreak, totalCheckIns, lastCheckIn }`；无记录时返回全 0 + `lastCheckIn: null`（**不报 404**）。错误：401；500 `查询失败`。

#### 5.3.7 GET /api/stats/weekly

统计窗口：`startOfDay(今天) - 6 天` 起共 7 个本地日期桶（`ymd()` 输出 `YYYY-MM-DD` 本地时区）。每条 AnswerLog 按 isCorrect 计入 correct/wrongCount，累计 timeSpentSeconds，formulaId 去重计 reviewCount。

响应 200：`{ "days": [ { date, correctCount, wrongCount, totalTimeSeconds, reviewCount } ×7 ], "totals": { correctCount, wrongCount, totalTimeSeconds, reviewCount } }`（totals.reviewCount 为各天去重数之和，跨天不去重）。错误：401；500 `查询失败`。

#### 5.3.8 GET /api/today-plan

无参数。`findTodayPlan` 未命中则 `generateFallbackPlan` 即时生成。响应 200：`{ "plan": SerializedPlan }`，其中：

```json
{
  "plan": {
    "id": "…", "userId": "…", "planDate": "2026-07-28T…",
    "items": [ { "formulaId": "c01_麻黄汤", "formulaName": "麻黄汤", "type": "review|new", "reason": "FSRS 到期复习", "completed": false } ],
    "newCount": 3, "reviewCount": 7, "completedCount": 0, "isCompleted": false
  }
}
```

错误：401；500 `查询失败`。

#### 5.3.9 POST /api/today-plan/complete

请求：`{ "formulaId": string }`（缺失 400 `缺少 formulaId`；body 非 JSON 400 `请求体格式错误`）。

逻辑：取今日 plan（无 404 `今日计划不存在`）→ 在 items 中找**第一个** `formulaId` 匹配且 `!completed` 的项标记完成；未命中（重复提交/不在计划内）则**幂等返回当前状态不落库**；命中则 `completedCount+1`，`isCompleted = completedCount >= items.length`，更新 recommendedFormulas JSON。

响应 200：`{ completedCount, isCompleted, plan: SerializedPlan }`。错误：401/400/404；500 `标记失败`。

#### 5.3.10 GET /api/today-plan/next

响应 200：下一个未完成项 `{ formulaId, formulaName, type, reason }`；全部完成时 `{ "done": true }`。错误：401；404 `今日计划不存在`；500 `查询失败`。

#### 5.3.11 POST /api/ai/daily-recommend

请求：`{ "userId"?: string }`（body 可为空；userId≠会话用户需 CRON Bearer，见 5.2）。

三层降级逻辑：①今日已有 plan → `{ plan, cached: true }`；②`!isDeepSeekConfigured()` → fallback 计划 + `{ plan, degraded: true, reason: "DEEPSEEK_API_KEY not configured" }`；③AI 调用（prompt 原文见 §6.4）→ 校验 formulaId 合法性并截取 10 条，不足 10 条用 fallback 项补齐（去重）→ 统计 new/review 数落库 → `{ plan, aiGenerated: true }`；④任何异常 → catch 内再生成 fallback → `{ plan, degraded: true, reason: "AI 调用失败" }`，连 fallback 都失败才 500 `推荐生成失败`。

注意：此端点返回的 `plan` 是**原始 DailyPlan 行**（recommendedFormulas 为 JSON 字符串，未 serialize）。

#### 5.3.12 POST /api/ai/asr-check

请求：`{ "formulaId": string, "transcript": string }`（浏览器 Web Speech API 转写文本）。transcript 按 `/[、,，\s\n]+/` 切分后 `diffIngredients` 评分，写 AnswerLog（mode="asr", questionType="ingredients", timeSpentSeconds=0，**不更新 FSRS/streak**）。

响应 200：`{ score, isCorrect, diff: { correct, missed, wrong, orderCorrect } }`（此端点额外返回 orderCorrect 布尔）。错误：401；400 `参数错误`；404 `方剂不存在`；500 `评分失败`。

#### 5.3.13 GET|POST /api/cron/daily-plan

`export const dynamic = "force-dynamic"; export const maxDuration = 60;`。活跃用户=`updatedAt >= 7 天前`。每用户：已有今日 plan→skipped++；配置了 DeepSeek 则 `fetch(url.origin + "/api/ai/daily-recommend")`（携带 CRON Bearer，POST {userId}），失败降级 `generateFallbackPlan`；异常记入 errors。

响应 200：`{ processed, skipped, failed, total, useAi, errors: string[≤5] }`。错误：500 `CRON_SECRET not configured`；401 `Unauthorized`。

#### 5.3.14 /api/auth/[...nextauth]

标准 NextAuth 处理器：`const handler = NextAuth(authOptions); export { handler as GET, handler as POST };`。提供 `/api/auth/signin`、`/api/auth/callback/credentials`、`/api/auth/session`、`/api/auth/signout` 等。

### 5.4 错误码汇总

| 状态码 | 含义 | 消息示例 |
| --- | --- | --- |
| 400 | 参数缺失/非法/JSON 解析失败 | `缺少 formulaId`、`非法 mode`、`请求体格式错误`、`参数错误`、zod 首条消息 |
| 401 | 未登录 / CRON 密钥错误 | `未登录`、`Unauthorized` |
| 403 | 越权代理生成计划 | `无权限` |
| 404 | 资源不存在 | `方剂不存在`、`今日计划不存在` |
| 409 | 冲突 | `该邮箱已注册` |
| 500 | 服务器错误/配置缺失 | `提交失败`、`查询失败`、`注册失败`、`标记失败`、`评分失败`、`推荐生成失败`、`CRON_SECRET not configured` |

所有错误响应统一 shape：`{ "error": string }`；所有 500 均伴随 `console.error("[标签] error", e)` 日志。

### 5.5 端点请求/响应完整示例（逐端点，可直接用作契约测试基准）

以下示例与 §5.3 的 shape 严格一致，日期为示意值；会话端点需先登录获得 NextAuth cookie（示例用 `-b cookie.txt` 略过细节）。

#### 5.5.1 POST /api/register

```bash
curl -X POST http://localhost:3000/api/register -H 'Content-Type: application/json' \
  -d '{"email":"Test@Example.com","password":"secret123","name":"小明"}'
```

响应 200：

```json
{ "user": { "id": "cm5xyzabc0001", "email": "test@example.com", "name": "小明" }, "message": "注册成功" }
```

失败示例：重复邮箱 → `409 {"error":"该邮箱已注册"}`；密码 5 位 → `400 {"error":"密码至少 6 位"}`。

#### 5.5.2 登录（NextAuth credentials）

```bash
# ① 取 csrf token
curl -c cookie.txt http://localhost:3000/api/auth/csrf   # → {"csrfToken":"<token>"}
# ② 凭证登录（表单编码）
curl -b cookie.txt -c cookie.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -d 'csrfToken=<token>&email=test@example.com&password=secret123'
# ③ 验证会话
curl -b cookie.txt http://localhost:3000/api/auth/session
# → {"user":{"id":"cm5xyzabc0001","email":"test@example.com","name":"小明"},"expires":"…"}
```

#### 5.5.3 GET /api/formulas

```bash
curl 'http://localhost:3000/api/formulas?categoryId=1&level=一类方&search=麻&limit=2'
```

响应 200（节选）：

```json
{
  "formulas": [
    {
      "id": "c01_麻黄汤", "name": "麻黄汤", "source": "", "alias": [],
      "categoryId": 1, "mnemonic": "妈跪着炒",
      "mnemonicExplanation": "妈(麻黄) + 跪(桂枝) + 着(杏仁) + 炒(甘草)",
      "traditionalMnemonic": "麻黄汤中用桂枝，杏仁甘草四般齐，发汗解表疗伤寒，脉紧头痛身痛时。",
      "traditionalMnemonicExplanation": "…",
      "ingredients": ["麻黄", "桂枝", "杏仁", "甘草"],
      "functions": "发汗解表，宣肺平喘", "indications": "…", "trigger": "身疼无汗",
      "level": "一类方", "sortOrder": 1,
      "createdAt": "2026-07-01T00:00:00.000Z", "updatedAt": "2026-07-01T00:00:00.000Z",
      "category": { "id": 1, "name": "解表剂", "description": "", "sortOrder": 1 },
      "categoryName": "解表剂"
    }
  ]
}
```

#### 5.5.4 GET /api/formulas/[id]

```bash
curl "http://localhost:3000/api/formulas/$(python -c 'from urllib.parse import quote; print(quote(\"c01_麻黄汤\"))')"
```

响应 200：与 5.5.3 单条同构但**无 category 嵌套对象、无包裹键**（顶层对象 + categoryName）。未知 id → `404 {"error":"方剂不存在"}`。

#### 5.5.5 POST /api/answer —— 4 个典型场景

**场景 A：quiz + ingredients 题，部分正确**

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/answer -H 'Content-Type: application/json' \
  -d '{"formulaId":"c01_麻黄汤","mode":"quiz","questionType":"ingredients","userAnswer":"麻黄、桂枝、黄芪","timeSpentSeconds":15}'
```

响应 200：

```json
{
  "isCorrect": false,
  "score": 0.4,
  "diff": { "correct": ["麻黄", "桂枝"], "missed": ["杏仁", "甘草"], "wrong": ["黄芪"] },
  "nextReview": "2026-07-28T09:12:00.000Z",
  "rating": "again"
}
```

（score = correct/(correct+missed+wrong) = 2/(2+2+1) = 0.4；0.4 < 0.6 → isCorrect=false → 推断 rating=again，FSRS 短间隔重排。）

**场景 B：recite + mnemonic 题，相似度达标**

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/answer -H 'Content-Type: application/json' \
  -d '{"formulaId":"c01_麻黄汤","mode":"recite","questionType":"mnemonic","userAnswer":"麻黄汤中用桂枝 杏仁甘草四般齐 发汗解表疗伤寒","timeSpentSeconds":40}'
```

参考文本为 traditionalMnemonic 全文（normalize 后 28 字符含标点，用户答前三句 21 字无标点），编辑距离法得分约 1 - 10/31 ≈ 0.68（标点与尾句差异共计）。

响应 200：`{"isCorrect": true, "score": 0.68, "diff": {"correct":[],"missed":[],"wrong":[]}, "nextReview": "…", "rating": "hard"}`（文本题 diff 恒为三空数组；0.6 ≤ score < 0.7 → 推断 rating=hard；具体小数依标点存留而异，断言时建议只断区间与评级）。

**场景 C：显式评级（评级按钮二次提交）**

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/answer -H 'Content-Type: application/json' \
  -d '{"formulaId":"c01_麻黄汤","mode":"learn","questionType":"ingredients","userAnswer":"麻黄、桂枝、杏仁、甘草","rating":"easy"}'
```

显式 `rating` 直接覆盖推断；若与上次评级不同还会触发 streak 打卡（ratingChanged 分支）。

**场景 D：非法参数**：`mode:"exam"` → `400 {"error":"非法 mode"}`；未登录 → `401 {"error":"未登录"}`；body 非 JSON → `400 {"error":"请求体格式错误"}`。

#### 5.5.6 GET /api/mastery

```json
{
  "masteries": [
    {
      "id": 1, "userId": "cm5xyzabc0001", "formulaId": "c01_麻黄汤",
      "stability": 3.17, "difficulty": 5.28, "retrievability": 0.9,
      "lastReview": "2026-07-27T08:00:00.000Z", "dueDate": "2026-07-30T08:00:00.000Z",
      "reviewCount": 2, "lapseCount": 0, "lastRating": "good",
      "formula": { "id": "c01_麻黄汤", "name": "麻黄汤", "source": "", "level": "一类方", "categoryId": 1 }
    }
  ]
}
```

#### 5.5.7 GET /api/streak

```json
{ "currentStreak": 5, "longestStreak": 12, "totalCheckIns": 37, "lastCheckIn": "2026-07-28T01:23:45.000Z" }
```

新用户无记录：`{ "currentStreak": 0, "longestStreak": 0, "totalCheckIns": 0, "lastCheckIn": null }`（200，不报 404）。

#### 5.5.8 GET /api/stats/weekly

```json
{
  "days": [
    { "date": "2026-07-22", "correctCount": 0, "wrongCount": 0, "totalTimeSeconds": 0, "reviewCount": 0 },
    { "date": "2026-07-23", "correctCount": 4, "wrongCount": 1, "totalTimeSeconds": 320, "reviewCount": 5 },
    { "date": "2026-07-24", "correctCount": 0, "wrongCount": 0, "totalTimeSeconds": 0, "reviewCount": 0 },
    { "date": "2026-07-25", "correctCount": 7, "wrongCount": 2, "totalTimeSeconds": 540, "reviewCount": 8 },
    { "date": "2026-07-26", "correctCount": 0, "wrongCount": 0, "totalTimeSeconds": 0, "reviewCount": 0 },
    { "date": "2026-07-27", "correctCount": 3, "wrongCount": 0, "totalTimeSeconds": 150, "reviewCount": 3 },
    { "date": "2026-07-28", "correctCount": 2, "wrongCount": 1, "totalTimeSeconds": 95, "reviewCount": 3 }
  ],
  "totals": { "correctCount": 16, "wrongCount": 4, "totalTimeSeconds": 1105, "reviewCount": 19 }
}
```

（days 固定 7 元素、无数据日补零；totals.reviewCount = 各天去重数相加，跨天不去重。）

#### 5.5.9 GET /api/today-plan

```json
{
  "plan": {
    "id": 42, "userId": "cm5xyzabc0001", "planDate": "2026-07-28T00:00:00.000Z",
    "items": [
      { "formulaId": "c01_麻黄汤", "formulaName": "麻黄汤", "type": "review", "reason": "FSRS 到期复习", "completed": true },
      { "formulaId": "c01_桂枝汤", "formulaName": "桂枝汤", "type": "new", "reason": "一类方优先新学", "completed": false }
    ],
    "newCount": 1, "reviewCount": 1, "completedCount": 1, "isCompleted": false
  }
}
```

#### 5.5.10 POST /api/today-plan/complete

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/today-plan/complete \
  -H 'Content-Type: application/json' -d '{"formulaId":"c01_桂枝汤"}'
```

响应 200：`{ "completedCount": 2, "isCompleted": true, "plan": { …SerializedPlan… } }`。重复提交同一 formulaId：幂等返回当前状态（计数不变，不落库）。

#### 5.5.11 GET /api/today-plan/next

未完成项存在：`{ "formulaId": "c01_桂枝汤", "formulaName": "桂枝汤", "type": "new", "reason": "一类方优先新学" }`；全部完成：`{ "done": true }`。

#### 5.5.12 POST /api/ai/daily-recommend

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/ai/daily-recommend -H 'Content-Type: application/json' -d '{}'
```

三种响应形态（注意 plan 为**原始 DailyPlan 行**，recommendedFormulas 是 JSON 字符串）：

```json
{ "plan": { "id": 42, "recommendedFormulas": "[{\"formulaId\":\"c01_麻黄汤\",…}]", … }, "cached": true }
{ "plan": { … }, "aiGenerated": true }
{ "plan": { … }, "degraded": true, "reason": "DEEPSEEK_API_KEY not configured" }
```

cron 代理调用（跨用户）：`-H "Authorization: Bearer $CRON_SECRET" -d '{"userId":"<目标用户>"}'`，否则 `403 {"error":"无权限"}`。

#### 5.5.13 POST /api/ai/asr-check

```bash
curl -b cookie.txt -X POST http://localhost:3000/api/ai/asr-check -H 'Content-Type: application/json' \
  -d '{"formulaId":"c01_麻黄汤","transcript":"麻黄 桂枝 杏仁 甘草"}'
```

响应 200：

```json
{ "score": 1, "isCorrect": true, "diff": { "correct": ["麻黄","桂枝","杏仁","甘草"], "missed": [], "wrong": [], "orderCorrect": true } }
```

#### 5.5.14 GET /api/cron/daily-plan

```bash
curl "http://localhost:3000/api/cron/daily-plan?secret=$CRON_SECRET"
# 或：curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-plan
```

响应 200：`{ "processed": 3, "skipped": 5, "failed": 0, "total": 8, "useAi": false, "errors": [] }`。

### 5.6 端点 ↔ 单测文件映射（契约验证入口）

| 端点 | 测试文件 | 用例数 | 重点断言 |
| --- | --- | --- | --- |
| POST /api/answer | tests/unit/answer.test.ts | 28 | 评分/评级推断/mastery upsert/streak 触发/全部 400 分支 |
| POST /api/ai/asr-check | tests/unit/asr-check.test.ts | 10 | 切分正则/orderCorrect/不碰 FSRS |
| POST /api/ai/daily-recommend | tests/unit/daily-recommend.test.ts | 9 | 三层降级/cached/越权 403 |
| lib/deepseek.ts | tests/unit/deepseek.test.ts | 12 | isConfigured/请求体/非2xx抛错/extractJson |
| components/formula-detail | tests/unit/formula-detail.test.tsx | 15 | 模式切换/遮罩/提交上报 |
| lib/fsrs.ts | tests/unit/fsrs.test.ts | 23 | toCard 映射/四评级间隔单调/lapse 递增 |
| today-plan 三端点 + daily-plan.ts | tests/unit/today-plan.test.ts | 18 | fallback 生成/complete 幂等/next 顺序 |

合计 115 用例（`bun run test` 全绿为契约基线）。register/formulas/mastery/streak/stats/cron 无专属单测，以 §5.3/§5.5 为准。

### 5.7 NextAuth 内置端点与会话细节

`/api/auth/[...nextauth]` 由 NextAuth 4.24.11 自动提供以下子端点（复现时无需手写，但前端依赖其行为）：

| 子端点 | 方法 | 用途 |
| --- | --- | --- |
| /api/auth/csrf | GET | 取 csrfToken（凭证登录必需） |
| /api/auth/callback/credentials | POST | 凭证登录回调（表单编码） |
| /api/auth/session | GET | 当前会话；未登录返 `{}` |
| /api/auth/signout | POST | 登出（清 cookie） |
| /api/auth/providers | GET | provider 列表（仅 credentials） |

会话细节：① `strategy: "jwt"` —— 无数据库 Session 表依赖（schema 中也没建）；cookie 名默认 `next-auth.session-token`（https 下带 `__Secure-` 前缀）。② 登录失败时 authorize 返 null，NextAuth 统一返 401 + `error=CredentialsSignin`，前端据此展示“邮箱或密码错误”类文案。③ `pages.signIn = "/auth/login"` —— 未登录访问受保护页时重定向自建登录页而非 NextAuth 默认页。④ 本项目**未使用** @auth/prisma-adapter（依赖表里有但 authOptions 未配 adapter，JWT 模式下不需要）——重构时保持不配，避免引入 Account/Session 表需求。

### 5.8 /api/answer 字段字典（逐字段类型 + 校验 + 错误消息逐字表）

核心端点的源码级契约字典（校验顺序即源码顺序，重构时必须保持一致，单测断言依赖该顺序与消息原文）。

**请求体字段表**：

| 字段 | 类型 | 必填 | 校验规则（按序执行） | 失败响应 |
| --- | --- | --- | --- | --- |
| formulaId | string | 是 | 存在且 typeof === "string" | 400 `缺少 formulaId` |
| mode | string | 是 | ∈ VALID_MODES = ["learn","quiz","recite","asr"] | 400 `非法 mode` |
| questionType | string | 是 | ∈ VALID_QTYPES = ["ingredients","mnemonic","functions","indications"] | 400 `非法 questionType` |
| userAnswer | string | 是 | typeof === "string"（允许空串） | 400 `缺少 userAnswer` |
| rating | string | 否 | 若传则 ∈ VALID_RATINGS = ["again","hard","good","easy"]；不传由 score 推断（§6.11 ⑤） | 400 `非法 rating` |
| timeSpentSeconds | number | 否 | 非 number 时落库为 0；否则 `Math.max(0, Math.floor(v))` | 不报错 |

**响应体字段表（200）**：

| 字段 | 类型 | 取值来源 |
| --- | --- | --- |
| isCorrect | boolean | `isPass(score)` 即 score >= 0.6 |
| score | number | ingredients → diffIngredients().score；其余 → textSimilarity() |
| diff | {correct,missed,wrong: string[]} | 仅 ingredients 型有内容，其余三型均为空数组 |
| nextReview | string(ISO) | FSRS review() 后的 newState.dueDate |
| rating | string | 显式传入值或推断值 finalRating |

**错误消息逐字表（消息字符串是契约的一部分）**：

| HTTP | body.error（逐字） | 触发条件 |
| --- | --- | --- |
| 401 | `未登录` | 无 session 或 session.user.id 缺失（两处判断同一响应） |
| 400 | `请求体格式错误` | req.json() 抛异常 |
| 400 | `缺少 formulaId` / `非法 mode` / `非法 questionType` / `缺少 userAnswer` / `非法 rating` | 见请求体字段表 |
| 404 | `方剂不存在` | findUnique(formulaId) 为 null |
| 500 | （见 §5.4 通用错误约定） | 未捕获异常兜底 |

<!-- SECTION 5 END -->

## 6. 核心业务逻辑与算法

### 6.1 ts-fsrs 调度参数与调用方式（src/lib/fsrs.ts）

**参数常量（逐字收录）**：

```ts
import { fsrs as createFsrs, createEmptyCard, Rating, type Card, type Grade } from "ts-fsrs";

// 默认参数（FSRS-4.5 推荐参数）
const f = createFsrs({
  enable_fuzz: true,
  enable_short_term: true,
  request_retention: 0.9,
  maximum_interval: 365,
});
```

**核心类型**：`FsrsRating = "again"|"hard"|"good"|"easy"`；`MasteryState = { stability, difficulty, retrievability, lastReview: Date|null, dueDate: Date, reviewCount, lapseCount, lastRating: FsrsRating|null }`；`ReviewResult = { state: MasteryState, retrievability: number, due: Date }`。

**initialMastery()**（新方初始态）：`{ stability: 0, difficulty: 0, retrievability: 1, lastReview: null, dueDate: new Date(), reviewCount: 0, lapseCount: 0, lastRating: null }`。

**mapRating()**：字符串四级 → `Rating.Again/Hard/Good/Easy` 枚举。

**review(prev, rating, now) 调用方式（关键，worklog 任务 E 修复后的正确 API）**：
1. 首次学习判定：`prev.stability === 0 || prev.reviewCount === 0` → `card = createEmptyCard(now)`。
2. 复习判定：手工构造 `Card` 对象：
   - `elapsed_days = max(0, floor((now - lastReview)/86400_000))`
   - `scheduled_days = max(1, floor((dueDate - (lastReview ?? now))/86400_000))`
   - `reps = reviewCount`，`lapses = lapseCount`，`state: 2 // State.Review`，`last_review = prev.lastReview ?? undefined`
3. 调度：`const preview = f.repeat(card, now); const result = preview[r as Grade];`（v4.7 的 repeat 返回 IPreview，按 Grade 索引取 RecordLogItem）。
4. 新状态从 `result.card` 读：`stability/difficulty/due/reps/lapses`；`retrievability` 取“本次复习前”的可提取性（首学固定 1）；`due` 兼容非 Date 返回值：`updatedCard.due instanceof Date ? updatedCard.due : new Date(updatedCard.due)`。

**可提取性公式（retrievability，逐字）**：

```ts
/** 计算当前可提取性 R = (1 + t/(9·S))^(-1) */
export function retrievability(state: MasteryState, now: Date = new Date()): number {
  if (state.stability === 0) return 1; // 新卡片默认 100%
  if (!state.lastReview) return 1;
  const t = Math.max(0, (now.getTime() - state.lastReview.getTime()) / 86400_000);
  return Math.pow(1 + t / (9 * state.stability), -1);
}
```

辅助函数：`isDue = dueDate <= now`；`daysUntilDue = ceil((dueDate - now)/86400_000)`；模块尾部 `export { Rating };`。

### 6.2 闯关判分逻辑（src/lib/match.ts）

**归一化**：`normalize(s) = s.replace(/\s+/g, "").toLowerCase().trim()`（去全部空白 + 小写）。

**药物对比 diffIngredients(userAnswer[], correctAnswer[])**：
- 双方先 normalize；`correct` = 用户答对（去重），`missed` = 漏答，`wrong` = 多答。
- **评分公式：`score = correct.length / (correct + missed + wrong).length`**，total 为 0 时 score=0。
- **顺序检查**：仅当 `correct.length >= ceil(正确答案数/2)` 时检查：取“用户答案中答对部分的顺序”与“正确答案中用户答到部分的顺序”做 JSON.stringify 全等比较；否则 `orderCorrect` 默认 true。
- 另有 `jaccardSimilarity`（交集/并集，空并集返 1），当前业务未直接使用。

**文本相似度 textSimilarity(a, b)**（方歌/功用/主治题型）：
- normalize 后全等返 1；任一为空返 0。
- 标准编辑距离 DP（插入/删除/替换代价均 1），`相似度 = 1 - distance / max(lenA, lenB)`。

**通过阈值（逐字）**：

```ts
/** 60% 匹配度阈值（与原站一致） */
export const PASS_THRESHOLD = 0.6;
export function isPass(score: number): boolean { return score >= PASS_THRESHOLD; }
```

**评级自动推断（/api/answer，未显式传 rating 时）**：`score>=0.9→easy`，`>=0.7→good`，`>=0.6→hard`，否则 `again`。

### 6.3 连续打卡 streak（/api/answer 内 bumpStreak）

- **触发条件**：`wasFirstReview`（本次前 reviewCount===0）或 `ratingChanged`（存在旧 lastRating 且与本次不同，字符串化后比较）。同方同评级反复刷题不触发。
- **幂等**：若 `startOfDay(lastCheckIn) === startOfDay(now)` 直接返回（今日已打卡）。
- **连续判定**：上次打卡日==昨日 → `currentStreak+1`；否则重置为 1。`longestStreak = max(旧, 新)`；`totalCheckIns+1`；`checkInHistory` 为 ISO 日期字符串 JSON 数组，push `todayStart.toISOString()`。
- 首次无记录：create `{ currentStreak:1, longestStreak:1, lastCheckIn:now, totalCheckIns:1, checkInHistory:[todayStart] }`。

### 6.4 AI 每日推荐 prompt（/api/ai/daily-recommend，原文逐字收录）

**systemPrompt**：

```
你是中医考研学习规划师。根据用户的学习数据，推荐今日 10 首方剂的学习计划。
输出严格 JSON 格式：{"recommendations": [{"formulaId": "string", "reason": "string", "type": "new"|"review"}]}
- formulaId 必须从给定的候选列表中选取
- type="review" 用于 FSRS 已到期的方剂或近期错题方剂
- type="new" 用于未学过的方剂
- 推荐总数 10 首，复习:新学约 6:4
- reason 用一句话说明推荐理由（10-20 字）
```

**userPrompt 模板（模板字符串逐字，`${}` 为插值）**：

```
用户学习阶段：${user?.studyStage ?? "newbie"}
每日目标：${user?.dailyGoal ?? 10} 首

【FSRS 到期待复习方剂】（优先 type=review）
${dueForReview.map((m) => `- ${m.formulaId} (${m.formula.name})`).join("\n") || "（无）"}

【近 7 天错题方剂】（优先 type=review）
${wrongRecent.map((id) => `- ${id}`).join("\n") || "（无）"}

【未学方剂候选】（取 type=new）
${unlearnedFormulas.slice(0, 30).map((f) => `- ${f.id} (${f.name}, ${f.level})`).join("\n") || "（无）"}

请输出 JSON。
```

**调用参数**：`callDeepSeekJson(messages, { temperature: 0.3, maxTokens: 1500 })`（jsonMode 强制开启）。上下文裁剪：到期复习 `slice(0,10)`、错题 `slice(0,10)`（近 7 天 AnswerLog take 50 中筛 isCorrect=false）、未学候选 `slice(0,30)`。

### 6.5 数据清洗规则（raw_mnemonics.md → formulas_parsed.json）

解析器 `scripts/parse_mnemonics.py` 的全部规则：

**正则（逐字）**：

```python
chapter_re = re.compile(r'## 第([一二三四五六七八九十]+)章\s+(\S+)')
table_row_re = re.compile(r'^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$', re.MULTILINE)
# 实际切分用：re.split(r'## 第([一二三四五六七八九十]+)章\s+', text)
```

**处理流程**：
1. `re.split` 按章标题切分，parts[0] 为序言，之后 [章号中文, 章内容] 交替。
2. `cn2num` 中文数字转阿拉伯数字（支持 1–99：无"十"直查表；"十"=10；"十X"=10+X；"X十"=X*10；"X十Y"=X*10+Y）；章号超出 1–20 跳过。
3. 逐章用 `table_row_re.findall` 提取 (name, mnemonic, trigger) 三列，各自 strip。
4. **跳过规则**：`name.startswith("---")` 或 `name.startswith(":")` 或 `name == "方名"`（表头/分隔行）；`name` 或 `mnemonic` 为空也跳过。
5. 章名不取自文本，用硬编码 `CHAPTER_NAMES`（见 7.13）；`id = name`（pinyin_id 占位实现）。
6. 输出 `json.dumps(formulas, ensure_ascii=False, indent=2)`，并打印逐章 实有/应有（TARGET_COUNTS）对账报告。

**下游清洗（seed.ts）**：按 `name` 去重（seenNames Set，后重复项丢弃）；sample 数据按 name 合并覆盖；重建 id 为 `c{章号两位}_{方名}`。

### 6.6 Fallback 计划生成（src/lib/daily-plan.ts · generateFallbackPlan）

1. 取到期复习：`userMastery.findMany({ where: { userId, dueDate: { lte: new Date() } }, take: 7, orderBy: { dueDate: "asc" }, include: { formula: true } })`。
2. 取已学 id 集合；候选新方：`formula.findMany({ where: { level: "一类方" }, orderBy: [{ sortOrder: "asc" }], take: 50 })`，过滤已学后 `slice(0, 10 - due.length)`。
3. items：复习项 `reason: "FSRS 到期复习", type: "review"`；新学项 `reason: "新方剂", type: "new"`。
4. 落库 `dailyPlan.create`：`recommendedFormulas = JSON.stringify(items)`，`newCount/reviewCount/completedCount=0/isCompleted=false`。

边界：到期≥10 时 newOnes 为空（slice 负数→空数组）；一类方学完后新学项可能不足 10。`findTodayPlan` 用 `findFirst + AND[{gte 当日 0 点},{lte 当日 23:59:59.999}]` 而非复合唯一键 `findUnique({userId_planDate})`（兼容测试 mock）。

### 6.7 边界条件汇总

| # | 边界 | 处理 |
| --- | --- | --- |
| 1 | 答案切分器不一致 | `/api/answer`：`/[、,，;；\s]+/`（含分号）；`/api/ai/asr-check`：`/[、,，\s\n]+/`；前端 quiz/recite 组件：`/[、,，\s]+/`；背方歌切句：`/[。，,．.！!？?;\n]+/` |
| 2 | mnemonic 题型参考答案降级 | `traditionalMnemonic \|\| mnemonic \|\| ""` |
| 3 | 无效 timeSpentSeconds | 非 number → 0；否则 `Math.max(0, Math.floor(n))` |
| 4 | diffIngredients 全空输入 | total=0 → score=0（不除零）；jaccard 空并集 → 1 |
| 5 | 重复药名 | correct/missed/wrong 均经 Set 去重，重复不加分不扣分 |
| 6 | FSRS 首学 vs 复习 | `stability===0 \|\| reviewCount===0` 走 createEmptyCard，否则手工构造 state=2 卡片；scheduled_days 下限 1，elapsed_days 下限 0 |
| 7 | 复合唯一键 vs 测试 mock | mock 的 matchWhere 不识别 `userId_formulaId`/`userId_planDate`，故业务代码统一 `findFirst` 后按行 id update / create |
| 8 | streak 幂等 | 同日仅首次有效行为计 1 次；隔 ≥2 天重置为 1 |
| 9 | plan 完成幂等 | complete 路由只标记第一个未完成匹配项；重复提交返回当前状态不落库 |
| 10 | AI 返回脏数据 | formulaId 不在库内被过滤；超 10 条截断；不足 10 条 fallback 补齐去重 |
| 11 | DeepSeek 全链路降级 | 未配置/调用异常/JSON 解析失败 → callDeepSeekJson 返 null → fallback 计划，接口不报错 |
| 12 | Next.js 15 动态参数 | `params`/`searchParams` 为 Promise 需 await；中文 id 需 `decodeURIComponent` |
| 13 | email 大小写 | 注册与登录均 `toLowerCase()` 后查库 |
| 14 | 日期分桶时区 | stats/weekly 用本地时区 `ymd()`；startOfDay 用 `setHours(0,0,0,0)` 本地时间 |

### 6.8 src/lib 函数级规格（签名 + 伪代码，白名单外代码的规格化描述）

#### 6.8.1 match.ts（评分算法，91 行）

```
normalize(s: string): string
  → s.replace(/\s+/g, "").toLowerCase().trim()（只去空白+小写；**不剔标点**、不做繁简/别名归一）。

diffIngredients(userAnswer: string[], correctAnswer: string[]):
    { score, correct[], missed[], wrong[], orderCorrect }
  1. 两侧逐项 normalize；建 userSet/correctSet。
  2. correct = 去重(normUser 中命中 correctSet 者)；missed = 去重(normCorrect 中不在 userSet 者，按正确答案序)；
     wrong = 去重(normUser 中不在 correctSet 者)。
  3. **score = correct.length / (correct.length + missed.length + wrong.length)**，total=0 时 0；
     不做舍入，原精度返回（注意：多答会拉低分母，不是单纯 correct/正确数）。
  4. orderCorrect 默认 true；仅当 correct.length >= ceil(正确答案数/2) 时检查：
     JSON.stringify(normUser 中命中项序列) === JSON.stringify(normCorrect 中被答到项序列)。
  边界：用户重复报同一药只计一次（但重复项仍参与顺序序列比较，可致 orderCorrect=false）。

jaccardSimilarity(a: string[], b: string[]): number
  → |交集|/|并集|，空并集返 1；**当前业务未直接使用**（导出备用）。

textSimilarity(a: string, b: string): number
  1. 两侧 normalize；全等返 1；任一为空返 0。
  2. 标准编辑距离 DP（插入/删除/替换代价均 1）；相似度 = 1 - distance / max(lenA, lenB)。

PASS_THRESHOLD = 0.6（逐字常量，注释“与原站一致”）；isPass(score) = score >= PASS_THRESHOLD。
```

#### 6.8.2 fsrs.ts（参数常量见 §6.1，逐字已收录）

```
toCard(m: UserMastery 行 | null): Card         // 库行→ts-fsrs Card；null → createEmptyCard()
  映射：stability/difficulty 直接拷；due=dueDate；last_review=lastReview??undefined；
  reps=reviewCount；lapses=lapseCount；state：reviewCount===0 ? State.New : State.Review。
review(m | null, rating: "again"|"hard"|"good"|"easy", now = new Date())
  1. card = toCard(m)；grade = RATING_MAP[rating]（again→Rating.Again 等四映射）。
  2. next = f.repeat(card, now)[grade].card（f = fsrs(generatorParameters({...})),参数见 §6.1）。
  3. 返回 8 字段：{ stability, difficulty, retrievability(由 get_retrievability 或 1),
     lastReview: now, dueDate: next.due, reviewCount: next.reps, lapseCount: next.lapses, lastRating: rating }。
isDue(m, now): boolean → m.dueDate <= now
```

#### 6.8.3 streak 逻辑（非独立 lib 文件，内联于 api/answer/route.ts）

```
startOfDay(d: Date): Date → setHours(0,0,0,0) 后返回副本（本地时区）
bumpStreak(userId, now)（私有 async 函数，误写为独立模块会破坏单测 mock 路径）
  1. existing = userStreak.findFirst({userId})；无 → create {currentStreak:1, longestStreak:1,
     lastCheckIn:now, totalCheckIns:1, checkInHistory:[todayStart.toISOString()]} 并返回。
  2. todayStart = startOfDay(now)；yestStart = todayStart - 1 天（setDate(-1)）。
  3. startOfDay(lastCheckIn).getTime() === todayStart.getTime() → 直接返回（同日幂等）。
  4. lastStart === yestStart → currentStreak+1；否则 currentStreak=1。
  5. longestStreak = Math.max(旧, 新)；totalCheckIns+1；history push(todayStart.toISOString())
     后整体 JSON.stringify 落库（无长度裁剪）；update(by id)。
  边界：日期比较全部基于本地时区 startOfDay 的 getTime 相等，不用字符串 ymd。
```

#### 6.8.4 daily-plan.ts

```
startOfDay/endOfDay(d): 本地 0 点 / 23:59:59.999
findTodayPlan(prisma, userId, now): findFirst({ userId, planDate: { gte: startOfDay, lte: endOfDay } })
generateFallbackPlan(prisma, userId, now):
  1. due = userMastery.findMany({userId, dueDate<=now}, orderBy dueDate asc, take 10)  → review 项（reason "FSRS 到期复习"）。
  2. 新学配额 = 10 - due.length；候选 = 全部 formula 排序 [{level asc(一类方先)},{sortOrder asc}]
     过滤掉已有 mastery 者，取前配额 → new 项（reason "一类方优先新学"/"顺序新学"）。
  3. create DailyPlan（recommendedFormulas=JSON，newCount/reviewCount 统计）。
serializePlan(plan): { ...plan, items: safeParseItems(recommendedFormulas) }，删除原字符串字段。
```

#### 6.8.5 deepseek.ts

```
isDeepSeekConfigured(): boolean → !!process.env.DEEPSEEK_API_KEY
callDeepSeek(messages, opts?): fetch https://api.deepseek.com/chat/completions
  headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}` }；body: { model: "deepseek-chat",
  messages, temperature: 0.7, max_tokens: 2000, response_format: { type: "json_object" } }。
  非 2xx 抛 Error(`DeepSeek API 错误: ${status}`)；返回 choices[0].message.content。
extractJson(text): 同 enrich 脚本思路（剔围栏→首{尾}切片→JSON.parse）。
```

#### 6.8.6 auth.ts / db.ts / utils.ts

```
authOptions: providers=[Credentials({email,password})]；authorize → 查 user + bcrypt.compare，
  失败返 null；session.strategy="jwt"；jwt 回调注入 token.id；session 回调注入 session.user.id；
  pages.signIn="/auth/login"。
db.ts: 导出名为 db 的 PrismaClient；globalThis 单例防热重载重复实例化（标准 Next.js 模式）。
utils.ts: cn(...inputs) = twMerge(clsx(inputs))（shadcn 标配）。
```

### 6.9 评分推演示例（确定性算例，可用作单测期望值）

**diffIngredients 算例**（正确答案：麻黄/桂枝/杏仁/甘草；公式 score = c/(c+m+w)）：

| 用户输入（切分后） | correct | missed | wrong | score | isCorrect | rating 推断 |
| --- | --- | --- | --- | --- | --- | --- |
| 麻黄、桂枝、杏仁、甘草 | 4 | [] | [] | 4/4 = 1.0 | true | easy(≥0.9) |
| 麻黄、桂枝、杏仁 | 3 | [甘草] | [] | 3/4 = 0.75 | true | good(≥0.7) |
| 麻黄、桂枝、黄芪 | 2 | [杏仁,甘草] | [黄芪] | 2/5 = 0.4 | false | again(<0.6) |
| 麻黄、麻黄、桂枝 | 2（去重） | [杏仁,甘草] | [] | 2/4 = 0.5 | false | again |
| （空串） | [] | 全部 4 | [] | 0 | false | again |

注意第三行：多答错误药（wrong）会进入分母——score 不是“命中/应答”而是“命中/(命中+漏+多)”。

orderCorrect：输入“桂枝、麻黄”→ 命中 2 ≥ ceil(4/2)，命中项相对序与正确序不一致 → false；命中不足一半时不检查，恒为 true（仅 asr-check 对外暴露）。

**textSimilarity 算例**（编辑距离法；normalize 只去空白，**标点算字符**）：

| a | b | 推算 |
| --- | --- | --- |
| 完全相同文本 | — | 1.0（全等短路） |
| “发汗解表，宣肺平喘”(9字符) | “发汗解表宣肺平喘”(8字符) | distance=1 → 1-1/9 ≈ 0.89 |
| 28 字方歌 vs 其前 21 字 | — | distance=7 → 1-7/28 = 0.75 |
| 28 字方歌 vs 其前 14 字 | — | distance=14 → 0.5（不及格） |
| 完全无关同长文本 | — | 接近 0 |
| "" vs "" | — | 1（全等短路）；单空 → 0 |

注意：编辑距离法对语序颠倒会重罚（与字符集合法相反），对尾部缺失按比例线性扣分——背到 3/4 可拿 good，背一半则不及格。重构时不得“顺手优化”为 Jaccard/n-gram，否则契约测试期望值全部变化。

### 6.10 FSRS 调度不变量（行为契约，单测已覆盖）

因 `enable_fuzz: true` 引入随机扰动，具体间隔天数不可作为固定期望值；可验证的是以下**不变量**（与 tests/unit/fsrs.test.ts 断言一致）：

| # | 不变量 | 说明 |
| --- | --- | --- |
| 1 | 新卡首评后 state 离开 New | reviewCount 0→1，lastReview 置 now |
| 2 | 同一张卡同一时刻：interval(again) ≤ interval(hard) ≤ interval(good) ≤ interval(easy) | 四评级间隔单调 |
| 3 | rating=again 时 lapses +1，且 dueDate 接近 now（分钟级） | 遗忘短周期重排 |
| 4 | 连续 good/easy 下 stability 递增、间隔拉长 | 长期记忆曲线 |
| 5 | 任意序列后 dueDate ≤ now + 365 天 | maximum_interval 上限 |
| 6 | retrievability ∈ [0,1]；新卡写入 1 | 可提取性归一 |
| 7 | review() 纯函数：不读写库，输出 8 字段由调用方落库 | 便于单测 |
| 8 | toCard(null) === createEmptyCard() 语义 | 首次答题无 mastery 行也可评 |

典型序列推演（定性）：`good → good → again → good` 依次产生：短间隔(分钟/天)→更长间隔→即刻重排+lapse=1→从较低 stability 重新爬升。重构验证时应断言趋势而非具体天数。

### 6.11 /api/answer 十步全流程展开（源码级，重构时按此顺序实现）

本节将核心端点 `src/app/api/answer/route.ts`（279 行）的 POST 处理器按源码注释的 10 步逐步展开，是 §5.8 契约 + §6.1/§6.2/§6.3 算法的装配说明书。

**模块顶部常量（逐字）**：

```typescript
const VALID_MODES = ["learn", "quiz", "recite", "asr"] as const;
const VALID_QTYPES = ["ingredients", "mnemonic", "functions", "indications"] as const;
const VALID_RATINGS = ["again", "hard", "good", "easy"] as const;
```

导入依赖：`diffIngredients / textSimilarity / isPass`（@/lib/match）、`review / initialMastery / MasteryState`（@/lib/fsrs）、`getServerSession + authOptions`、`db`。

**① 鉴权**：`getServerSession(authOptions)`；`session?.user` 缺失 → 401 `未登录`；再取 `(session.user as {id?:string}).id`，缺失同样 401（两段独立 if）。

**② 解析与校验请求体**：`await req.json()` 包 try/catch，异常 → 400 `请求体格式错误`；解构 `{ formulaId, mode, questionType, userAnswer, rating, timeSpentSeconds } = body ?? {}`；随后按 §5.8 请求体字段表的顺序执行 5 条校验（顺序敏感——同时缺多个字段时只报第一条）。

**③ 查询方剂**：`db.formula.findUnique({ where: { id: formulaId } })`；为 null → 404 `方剂不存在`。

**④ 评分分支**：先 `correctIngredients = safeParseArr(formula.ingredients)`。

- `questionType === "ingredients"`：`userArr = splitIngredients(userAnswer)`（分隔正则 `/[、,，;；\s]+/`，过滤空段）→ `diffIngredients(userArr, correctIngredients)`；`score = result.score`（= correct/(correct+missed+wrong)，见 §6.8.1）；`diff = {correct, missed, wrong}`；`correctAnswer = JSON.stringify(correctIngredients)`。
- 其余三型（文本相似度）：参考答案选择规则——`mnemonic` → `formula.traditionalMnemonic || formula.mnemonic || ""`（**传统方歌优先**）；`functions` → `formula.functions || ""`；`indications`（else 分支）→ `formula.indications || ""`。`score = textSimilarity(userAnswer, reference)`（编辑距离，§6.8.1）；`diff` 三数组均为空；`correctAnswer = reference`。
- 统一 `isCorrect = isPass(score)`（即 `score >= PASS_THRESHOLD = 0.6`）。

**⑤ 评级推断**（仅当请求未显式传 rating）：

| score 区间 | finalRating |
| --- | --- |
| ≥ 0.9 | easy |
| ≥ 0.7 | good |
| ≥ 0.6 | hard |
| < 0.6 | again |

显式传入的 rating 直接采用（已在 ② 校验合法性）。

**⑥ 读取 mastery**：`db.userMastery.findFirst({ where: { userId, formulaId } })`——**刻意不用复合唯一键 findUnique/upsert**（源码注释：避免 compound-unique 在测试 mock 中的限制）。不存在时 `prev = initialMastery()`。三个派生量：

```text
wasFirstReview = prev.reviewCount === 0
prevRatingStr  = existing?.lastRating != null ? String(existing.lastRating) : null
                 // DB 存字符串评级，MasteryState 类型是 ts-fsrs 数字枚举，统一转字符串比较
ratingChanged  = prevRatingStr !== null && prevRatingStr !== finalRating
```

**⑦ FSRS 调度 + 落库**：`const now = new Date(); result = review(prev, finalRating, now); newState = result.state`。existing 存在 → `update({ where: { id: existing.id } })`，否则 create；两分支均全量覆写 8 个字段：stability / difficulty / retrievability / lastReview / dueDate / reviewCount / lapseCount / lastRating(=finalRating)。

**⑧ 写答题日志**：`db.answerLog.create` 落 `{ userId, formulaId, mode, questionType, userAnswer, correctAnswer, isCorrect, matchScore: score, timeSpentSeconds: 归一化值, rating: finalRating }`；timeSpentSeconds 归一化：`typeof v === "number" ? Math.max(0, Math.floor(v)) : 0`（负数归零、小数取整、缺省 0）。

**⑨ streak 触发**：仅当 `wasFirstReview || ratingChanged` 时调用私有函数 `bumpStreak(userId, now)`（实现见 §6.8.3：同日幂等 / 昨日 +1 / 断档重置 1 / checkInHistory push ISO 串）。同一方剂同评级重复作答**不**触发打卡——防刷。

**⑩ 响应**：`{ isCorrect, score, diff, nextReview: newState.dueDate, rating: finalRating }`；整个处理器包一层 try/catch，兜底 500。

<!-- SECTION 6 END -->

## 7. 核心文件逐一说明【文档主体】

本章覆盖全部业务文件：src/lib 8 个、4 个 API 目录 14 个路由、8 个页面、9 个组件、9 个 scripts 脚本（各自单独成节）、8 个测试文件。体例：`路径 | 职责 | 实现要点 | 关键代码 | 边界`。第 5/6 章已逐字收录的内容不重复，只标注交叉引用。

### 7.1 src/lib（共享库，8 文件）

#### 7.1.1 src/lib/db.ts（14 行）

职责：Prisma 单例。全文逐字：

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

注意：测试中此模块被 `tests/setup.ts` 的内存 Map mock 整体替换（vi.mock("@/lib/db")）。

#### 7.1.2 src/lib/utils.ts（7 行）

职责：Tailwind 类名合并。全文：`export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`（依赖 clsx + tailwind-merge）。

#### 7.1.3 src/lib/types.ts（93 行）

职责：前端共享 TypeScript 接口（与 Prisma 模型平行、但数组字段已反序列化）：
- `Formula`：17 字段，`alias: string[]`、`ingredients: string[]`、`level: "一类方" | "二类方"`、可选 `categoryName`。
- `FormulaCategory`：`{ id, name, description, sortOrder, formulaCount? }`。
- `UserMastery`：与表同构，`lastRating: "again"|"hard"|"good"|"easy"|null`。
- `AnswerLog`：`mode`/`questionType` 用字面量联合类型（与 5.3.4 校验常量一致）。
- `DailyPlanItem = { formulaId, formulaName, reason, type: "new"|"review" }`；`DailyPlan.recommendedFormulas: DailyPlanItem[]`。
- `UserStreak`：4 字段展示型。`StudyStage = "newbie"|"intensive"|"sprint"|"final"`；`User = { id, email, name, studyStage, dailyGoal }`。

#### 7.1.4 src/lib/auth.ts（59 行）

职责：NextAuth 配置 + bcrypt 包装。实现要点：
- `hashPassword`/`verifyPassword`：动态 `import("bcryptjs")`，salt rounds = **10**。
- `authOptions`（关键配置逐项）：`session: { strategy: "jwt" }`；`pages: { signIn: "/auth/login" }`；`secret: process.env.NEXTAUTH_SECRET`。
- CredentialsProvider：`credentials = { email: {label:"邮箱",type:"email"}, password: {label:"密码",type:"password"} }`；`authorize`：缺字段返 null → `findUnique({ email: 小写化 })` → bcrypt 比对 → 成功返 `{ id, email, name ?? undefined }`。
- 回调（逐字要点）：`jwt` 中 `if (user) token.id = user.id`；`session` 中 `(session.user as {id?:string}).id = token.id as string`。这是全部受保护 API 读 `userId` 的来源。

#### 7.1.5 src/lib/fsrs.ts（137 行）

FSRS 封装，参数常量/调用方式/公式已逐字收录于 §6.1。补充边界：`review()` 中新状态的 `retrievability` 存的是**复习前**的 R 值（`prev.stability===0 ? 1 : retrievability(prev, now)`），而非复习后；`lastRating` 存字符串四级。

#### 7.1.6 src/lib/match.ts（91 行）

判分工具，全部算法已收录于 §6.2。导出面：`normalize`、`jaccardSimilarity`、`diffIngredients`（返 `IngredientDiff = { score, correct, missed, wrong, orderCorrect }`）、`textSimilarity`、`PASS_THRESHOLD`、`isPass`。

#### 7.1.7 src/lib/deepseek.ts（100 行）

DeepSeek HTTP 客户端。常量（逐字）：

```ts
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;
```

实现要点：
- `callDeepSeek(messages, options)`：无 `DEEPSEEK_API_KEY` 直接 `throw new Error("DEEPSEEK_API_KEY not configured")`；URL = `(DEEPSEEK_BASE_URL || "https://api.deepseek.com") + "/v1/chat/completions"`；body 包含 `model/messages/temperature/max_tokens/stream:false`；`options.jsonMode` 时加 `response_format: { type: "json_object" }`；`Authorization: Bearer <key>`；非 2xx 抛 `DeepSeek API error: ${status} ${statusText}. ${errText.slice(0,200)}`；返回 `{ content: choices[0].message.content ?? "", tokensUsed: usage.total_tokens ?? 0 }`。
- `callDeepSeekJson<T>`：强制 jsonMode，`JSON.parse(content)`；**任何异常不抛错，`console.warn("[deepseek-json] failed:", …)` 后返 `null`**（降级链路的基石）。
- `isDeepSeekConfigured() = !!process.env.DEEPSEEK_API_KEY`。

#### 7.1.8 src/lib/daily-plan.ts（147 行）

今日计划共享逻辑（服务端组件与路由共用）。类型：`PlanItem = { formulaId, formulaName, reason, type: "new"|"review", completed?: boolean }`；`SerializedPlan = { id, userId, planDate: string(ISO), recommendedFormulas: PlanItem[], newCount, reviewCount, completedCount, isCompleted }`。
- `startOfDay(d=new Date())`：本地 `setHours(0,0,0,0)`。
- `findTodayPlan(userId, today)`：`findFirst({ where: { userId, AND: [{planDate:{gte:当日0点}},{planDate:{lte:当日23:59:59.999}}] } })`（注释明确说明：避开测试 mock 不支持复合唯一键）。
- `generateFallbackPlan`：见 §6.6。
- `serializePlan(plan)`：null 透传；`planDate` 兼容 Date/字符串统一转 ISO；`recommendedFormulas` 兼容已是数组（mock 场景）或 JSON 字符串（生产场景）。

### 7.2 src/app/api（14 路由实现要点，契约见 §5）

#### 7.2.1 api/auth/[...nextauth]/route.ts（7 行）

全文：`import NextAuth from "next-auth"; import { authOptions } from "@/lib/auth"; const handler = NextAuth(authOptions); export { handler as GET, handler as POST };`

#### 7.2.2 api/register/route.ts（50 行）

zod schema（逐字）：`z.object({ email: z.string().email("请输入有效邮箱"), password: z.string().min(6, "密码至少 6 位"), name: z.string().min(1, "请输入昵称").max(30) })`。实现：`safeParse` 失败取 `issues[0].message`；email 小写化查重（409）；`db.user.create({ data: { …, streak: { create: {} } }, select: {id,email,name} })` 嵌套创建空 UserStreak。

#### 7.2.3 api/formulas/route.ts（54 行）与 7.2.4 api/formulas/[id]/route.ts（38 行）

列表：where 动态拼装（categoryId 经 parseInt；search 为三字段 OR contains），`take = min(parseInt(limit ≠? "100"), 500)`，含 `include: { category: true }`，返回前 alias/ingredients 反序列化并附 `categoryName`。详情：Next.js 15 签名 `{ params }: { params: Promise<{ id: string }> }`，`const { id } = await params`。两文件各自内联了同形 `safeParseArr`。

#### 7.2.5 api/answer/route.ts（279 行，核心）

10 步流程、校验常量、bumpStreak、splitIngredients 正则均已逐字收录于 §5.3.4/§6.3。补充实现细节：
- 模块级常量用 `as const` + `(VALID_MODES as readonly string[]).includes(mode)` 校验。
- mastery 写回字段固定 9 个：stability/difficulty/retrievability/lastReview/dueDate/reviewCount/lapseCount + lastRating（update 按 `existing.id`，create 附 userId/formulaId）。
- `bumpStreak`/`startOfDay`/`splitIngredients`/`safeParseArr` 为文件内私有函数（非 lib 导出）。

#### 7.2.6 api/mastery/route.ts（54 行）

`findMany({ where:{userId}, include:{formula:true}, orderBy:[{dueDate:"asc"},{id:"asc"}] })`，手工映射输出字段（formula 只取 5 字段，可为 null）。

#### 7.2.7 api/streak/route.ts（40 行）

`findFirst({ where: { userId } })`；无记录返全 0 默认值（不 404）；有则取 4 字段输出。

#### 7.2.8 api/stats/weekly/route.ts（100 行）

7 日分桶算法见 §5.3.7。实现细节：桶用数组 + `Set<string>` 去重 formulaId；`ymd()` 本地时区手工拼 `YYYY-MM-DD`；`Number(log.timeSpentSeconds) || 0` 防脏数据。

#### 7.2.9 api/today-plan/route.ts（36 行）、7.2.10 complete（96 行）、7.2.11 next（52 行）

均薄层：鉴权 → `findTodayPlan`/`generateFallbackPlan`/`serializePlan` 组合。complete 的标记/幂等/计数逻辑见 §5.3.9；next 的 `items.find(i => !i.completed)` 见 §5.3.10；三文件各自内联 `safeParseItems`。

#### 7.2.12 api/ai/daily-recommend/route.ts（176 行）

prompt 原文见 §6.4，三层降级见 §5.3.11。实现细节：上下文四路 `Promise.all`（user/mastery含formula/近7天logs take50/全部formula 只选 id+name+level）；`dueForReview = mastery.filter(m => m.dueDate <= new Date()).slice(0,10)`；AI 结果用 `validIds` Set 过滤；nameMap 补 formulaName；最外层 catch 里**重新取 session** 再 fallback（因 catch 作用域拿不到 userId）。

#### 7.2.13 api/ai/asr-check/route.ts（77 行）

见 §5.3.12。实现细节：不碰 UserMastery/UserStreak（纯评分+留痕）；`correctAnswer` 直接存库里的 JSON 字符串原文。

#### 7.2.14 api/cron/daily-plan/route.ts（99 行）

见 §5.3.13。头部注释逐字：`// 配置在 vercel.json: { "crons": [{ "path": "/api/cron/daily-plan", "schedule": "0 19 * * *" }] }`、`// UTC 19:00 = UTC+8 03:00`（注意：仓库内实际**没有 vercel.json 文件**，部署时需自行创建，见 §10）。内部通过 `fetch(url.origin + …)` 自调用 daily-recommend，失败不阻塞降级 fallback。

### 7.3 页面层（src/app，8 个文件）

#### 7.3.1 src/app/layout.tsx（23 行）

- **职责**：根布局。`metadata = { title: "方剂口诀闯关 · AI 增强版", description: "中医考研方剂背诵辅助 · FSRS 间隔重复 + AI 精准反馈" }`（描述性文字以此意为准）。
- **实现要点**：`<html lang="zh-CN">`；body 内以 `<Providers>{children}</Providers>` 包裹（见 7.4.1）；引入 `./globals.css`。无字体加载逻辑（字体走 globals.css 的系统字体栈）。

#### 7.3.2 src/app/page.tsx（57 行）—— 首页（服务端组件）

- **职责**：按登录态分流：未登录 → `GuestHome`；已登录 → `TodayHome`。
- **实现要点**：
  1. `const session = await getServerSession(authOptions)`。
  2. **未登录分支**：`db.formulaCategory.findMany({ include: { _count: { select: { formulas: true } } }, orderBy: { sortOrder: "asc" } })` → `<GuestHome categories={...} />`。
  3. **已登录分支**：先算 `today = startOfDay(new Date())`（本地零点），再四路 `Promise.all`：
     - `db.dailyPlan.findUnique({ where: { userId_planDate: { userId, planDate: today } } })` —— **注意：此处用复合唯一键 `userId_planDate` 的 findUnique**，与 `src/lib/daily-plan.ts` 中 `findTodayPlan` 的 `findFirst` 是两条并存的查询路径（真实代码如此，复现时保留差异）；
     - `db.userMastery.count({ where: { userId } })`（作 masteredCount）；
     - `db.formula.count()`（作 totalFormulas）；
     - `db.userStreak.findUnique({ where: { userId } })`。
  4. plan 存在时用 `serializePlan` 同构逻辑序列化（Date→ISO 字符串、JSON 字符串→数组）后传给 `<TodayHome plan={...} stats={{ masteredCount, totalFormulas, currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0 }} />`。
- **边界**：plan 为 null 时 TodayHome 显示空态"暂无推荐"；页面不主动生成计划（生成由 CRON 或 today-plan GET 兜底负责）。

#### 7.3.3 src/app/globals.css（101 行）

- **职责**：Tailwind v4 主题变量 + 三段自定义样式。关键内容逐字收录（复现 UI 必需）：

```css
@theme {
  /* 方剂口诀闯关调色板：极简黑白 + 琥珀强调色 */
  --color-background: #ffffff;
  --color-foreground: #000000;
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  --color-border: #e5e5e5;
  --color-input: #e5e5e5;
  --color-ring: #000000;
  --color-primary: #000000;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f5f5f5;
  --color-secondary-foreground: #000000;
  --color-accent: #f59e0b; /* 琥珀色 */
  --color-accent-foreground: #000000;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  --color-card: #ffffff;
  --color-card-foreground: #000000;
  --color-popover: #ffffff;
  --color-popover-foreground: #000000;
  --radius: 0.5rem;
}
```

- 三段自定义样式：
  1. `.scrollbar-thin`：6px 细滚动条（thumb 用 `--color-border`，hover 变 `--color-muted-foreground`）。
  2. `.flip-card / .flip-card-inner / .flip-card-front / .flip-card-back`：3D 翻转卡（`perspective: 1000px`、`transform: rotateY(180deg)`、`transition: transform 0.6s`、`backface-visibility: hidden`）——当前组件未使用，属预留样式。
  3. **`.mask-text`（方歌遮罩核心）**：

```css
.mask-text {
  background-color: var(--color-accent);
  color: var(--color-accent);   /* 文字色=背景色 → 视觉遮罩 */
  border-radius: 4px;
  padding: 0 4px;
  transition: all 0.3s;
  cursor: pointer;
}
.mask-text:hover { opacity: 0.7; }
.mask-text.revealed { background-color: transparent; color: inherit; }
```

- body 字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`。

#### 7.3.4 src/app/auth/login/page.tsx（83 行）—— 客户端组件

- **职责**：邮箱+密码登录表单。
- **实现要点**：`"use client"`；state：email/password/loading/error；提交时 `signIn("credentials", { email, password, redirect: false })`；`res?.error` 非空 → `setError("邮箱或密码错误")`；成功 → `router.push("/")` + `router.refresh()`。
- **UI**：居中 Card（`max-w-md`），Label+Input（email 类型校验、password required），提交按钮 loading 态文案"登录中..."，底部链接"没有账号？去注册"→ `/auth/register`。

#### 7.3.5 src/app/auth/register/page.tsx（113 行）—— 客户端组件

- **职责**：注册 → 自动登录 → 回首页。
- **实现要点**：
  1. state：name/email/password/loading/error。
  2. 提交：`POST /api/register`（JSON body `{ name, email, password }`）；`!res.ok` → `setError(data.error ?? "注册失败")` 并 return。
  3. 注册成功后立即 `signIn("credentials", { email, password, redirect: false })`；若 `signRes?.error` → 错误文案逐字：**"注册成功但自动登录失败，请手动登录"**；否则 `router.push("/")` + `router.refresh()`。
  4. fetch 抛异常 → `setError("网络错误")`。
- **表单约束**：昵称 `required maxLength={30}`；邮箱 `type="email" required`；密码 `type="password" required minLength={6}`，placeholder "至少 6 位"。提交按钮文案"注册并登录"/"注册中..."。底部链接"已有账号？去登录"。

#### 7.3.6 src/app/formulas/[id]/page.tsx（60 行）—— 服务端组件

- **职责**：方剂详情页入口。
- **实现要点**：Next 15 规范 `const { id: rawId } = await params`；**`const id = decodeURIComponent(rawId)`**（方剂 id 含中文，URL 编码后必须解码，否则查库必 miss）；`db.formula.findUnique({ where: { id }, include: { category: true } })`；查无 → `notFound()`；将 Prisma 记录序列化为 `Formula` 类型（`ingredients: JSON.parse(f.ingredients)`，失败回退 `[]`；`categoryName: f.category?.name ?? null`）后传 `<FormulaDetail formula={...} />`。
- **边界**：`export const dynamic = "force-dynamic"`（避免静态化旧数据）。

#### 7.3.7 src/app/categories/[id]/page.tsx（85 行）—— 服务端组件

- **职责**：分类下的方剂列表。
- **实现要点**：`await params` 后 `parseInt(id, 10)`，NaN → `notFound()`；`db.formulaCategory.findUnique({ where: { id } })` 查无 → `notFound()`；`db.formula.findMany({ where: { categoryId: id }, orderBy: { sortOrder: "asc" } })`。
- **UI**：Header + 分类名标题 + 描述；每首方剂一张卡片，整卡 `<Link href={\`/formulas/${encodeURIComponent(f.id)}\`}>`，卡内显示方剂名 + `Badge variant={f.level === "一类方" ? "accent" : "secondary"}` 的等级徽章 + 口诀预览行（截断）。

#### 7.3.8 src/app/search/page.tsx（96 行）—— 服务端组件

- **职责**：三字段模糊搜索。
- **实现要点**：Next 15 规范 `const { q } = await searchParams`（searchParams 为 Promise）；`q?.trim()` 非空才查询：

```ts
db.formula.findMany({
  where: { OR: [
    { name: { contains: q } },
    { mnemonic: { contains: q } },
    { ingredients: { contains: q } },
  ] },
  take: 50,
  orderBy: { sortOrder: "asc" },
});
```

- **UI**：GET 表单（`<form action="/search" method="get">` + `<input name="q">`，服务端组件无 JS 提交），结果列表卡片跳详情页；q 为空显示提示语，有 q 无结果显示"未找到"。sqlite 的 `contains` 无 `mode: "insensitive"` 选项（中文场景无影响）。

### 7.4 组件层（src/components，7 业务组件 + 9 个 ui 基件）

#### 7.4.1 providers.tsx（8 行）

`"use client"`；仅导出 `Providers({ children })` → `<SessionProvider>{children}</SessionProvider>`。是全应用唯一的 Context 提供者（无主题/状态库 Provider）。

#### 7.4.2 header.tsx（52 行）

- `"use client"` + `useSession()`。
- 结构：`sticky top-0 z-50` 顶栏，`bg-background/95 backdrop-blur`；左侧 Logo 链接 `/`（BookOpen 图标 + "方剂口诀闯关"粗体）。
- 右侧导航按登录态：
  - 已登录：三个 ghost Button 链接 —— `/?view=categories`（Calendar 图标·分类）、`/?view=search`（Search 图标·搜索）、`/?view=profile`（Trophy 图标·我的）。**注意**：这三个 `view` 查询参数首页 page.tsx 并未消费，属占位导航（见 §10 已知问题）。
  - 未登录：`/auth/login`（ghost·登录）、`/auth/register`（accent·注册）。

#### 7.4.3 guest-home.tsx（88 行）—— 服务端组件（无 "use client"）

- **Props**：`categories: (FormulaCategory & { _count?: { formulas: number } })[]`。
- **结构**：
  1. Hero：标题"方剂口诀闯关"+ 副标题"中医考研方剂背诵辅助 · 路径驱动 + AI 精准反馈"+ 两按钮（accent"立即开始"→/auth/register；outline"已有账号"→/auth/login）。
  2. 三统计卡：分类数 `categories.length`、方剂总数 `totalCount = categories.reduce((sum,c)=>sum+(c._count?.formulas??0),0)`、"FSRS 智能算法"。
  3. 分类网格（`sm:grid-cols-2`）：每卡序号 `String(idx+1).padStart(2,"0")` + 分类名 + `Badge secondary` 显示"N 首"+ 描述。**注意**：分类卡片无链接（游客不能进列表页，纯展示）。
  4. footer 文案逐字："方剂口诀闯关 · 传承中医智慧 · 考研方剂完整版 · By Meoo 秒悟 ×"。

#### 7.4.4 today-home.tsx（198 行）—— 客户端组件

- **Props**：`plan: SerializedPlan | null` 与 `stats: { masteredCount, totalFormulas, currentStreak, longestStreak }`。`SerializedPlan.recommendedFormulas: PlanItem[]`，`PlanItem = { formulaId, formulaName, reason, type: "new"|"review", completed? }`。
- **计算**：`progress = Math.round(completedCount / recommendedFormulas.length * 100)`（useMemo，空计划=0）；`masteryPercent = Math.round(masteredCount / totalFormulas * 100)`（totalFormulas=0 时为 0）。
- **结构（自上而下）**：
  1. 今日学习卡：右上角 Flame 图标 + `currentStreak` "天连击"；`<Progress value={progress} className="h-3">`；"已完成 X / N 首"+ 百分比。
  2. 三统计卡：Target·已学方剂（masteredCount）、Zap·掌握度（masteryPercent%）、Flame·最长连击（longestStreak）。
  3. 今日推荐列表：每项序号 + 方剂名（completed 时追加绿色 ✓ 且整行 `opacity-60`）+ reason 小字 + `Badge variant={type==="new" ? "accent" : "secondary"}`（新学/复习）；空态文案"暂无推荐，请先学习几首方剂"。
  4. **一键开始按钮**（accent·lg·全宽）：`handleStart` → `GET /api/today-plan/next` → `data.done` 则 `router.refresh()`；否则 `router.push(\`/formulas/${encodeURIComponent(data.formulaId)}?mode=learn\`)`；`starting` state 防重入；按钮文案三态："今日已完成 ✓" / "加载中..." / "一键开始今日学习"；`disabled={!plan || plan.isCompleted || starting}`。
  5. 错题本按钮（outline）：`router.push("/?view=errors")` —— 占位，首页未实现该 view（见 §10）。
- **边界**：fetch 全部 try/catch 静默失败，不阻塞 UI。

#### 7.4.5 formula-detail.tsx（236 行）—— 客户端组件，详情页主体

- **State**：`mode: null | "learn" | "quiz" | "recite"`（初始 null，即详情态；**URL 的 ?mode= 参数不在此组件消费**，模式切换纯客户端 state——从计划跳转带 `?mode=learn` 等参数时仍落在详情态，属已知简化，见 §10）；`revealedLines: Set<number>`（已揭示的方歌句子索引，`toggleLine` 增删切换）。
- **方歌切句函数逐字**：

```ts
function splitMnemonicLines(text: string): string[] {
  if (!text) return [];
  return text.split(/[。，,．.！!？?;\n]+/).map((s) => s.trim()).filter(Boolean);
}
```

- **结构**：
  1. `mode !== null` 时顶部显示"← 返回详情"ghost 按钮（`setMode(null)`）。
  2. 头部：方剂名 h1 + `Badge variant={level === "一类方" ? "accent" : "secondary"}` + 分类名/出处小字。
  3. **详情态（mode===null）三 Tab**（defaultValue="traditional"）：
     - `traditional` 传统方歌：逐句渲染 `<span className={\`mask-text${revealed ? " revealed" : ""}\`} onClick={toggleLine}>`（初始全遮罩，点击揭示/再点重遮）；下方提示"点击方歌文字可遮罩 / 揭示"；若有 `traditionalMnemonicExplanation` 附"方歌解释"卡。
     - `mnemonic` 口诀：`text-2xl font-bold tracking-wider` 大字口诀；若有 `mnemonicExplanation` 附"拆字解释"卡（`text-accent` 琥珀高亮）。
     - `ingredients` 药物组成：ingredients 数组渲染为 outline Badge 横排 + Separator + "功用"/"主治"两段文字（空值显示"暂无"）。
  4. **learn 态**：静态说明卡（"学习模式"标题 + 4 条 li 使用说明 + 返回按钮），不含独立交互。
  5. **quiz 态**：`<QuizMode formula={formula} />`；**recite 态**：`<ReciteMode formula={formula} />`。
  6. 详情态底部三按钮（`sm:grid-cols-3`）：outline"开始学习"（BookOpen）/ accent"闯关测试"（Swords）/ default"背诵检测"（Brain）。

#### 7.4.6 quiz-mode.tsx（284 行）—— 闯关测试子组件

- **判分模式**：本地评分 + 静默上报（前端权威显示，服务端异步留痕）。
- **切分函数**：`splitIngredients(s)` = `s.split(/[、,，\s]+/).map(trim).filter(Boolean)`（与 recite-mode 相同，与后端 answer 路由的 `/[、,，;；\s]+/` 差一个分号——真实差异，复现保留）。
- **流程**：
  1. 题面：给出方剂名/口诀，要求输入完整药物组成；Input 回车或按钮提交。
  2. 提交：本地 `diffIngredients(splitIngredients(answer), formula.ingredients)` 得 `{score, missed, wrong, matched}`；`isPass(score)` 判通过（≥0.6）；立即渲染结果（得分=Math.round(score*100)、漏掉的药 destructive Badge、多答的药 secondary Badge）。
  3. 静默上报（各自 try/catch）：`POST /api/answer`（body `{formulaId, mode:"quiz", questionType:"ingredients", userAnswer}`，**不带 rating**，服务端按分数推断评级并走 FSRS）→ `POST /api/today-plan/complete`（body `{formulaId}`）。
  4. 结果区下方展示**四级评级按钮**（again 重来 / hard 困难 / good 良好 / easy 简单）：点击后再次 `POST /api/answer` 带显式 `rating` 字段（服务端以用户评级覆盖推断评级重算 FSRS），按钮置灰防重复。
  5. "下一题"：`GET /api/today-plan/next` → done 则回首页，否则 `router.push(\`/formulas/${encodeURIComponent(id)}?mode=quiz\`)`。
- **边界**：空输入禁提交；submitting 防重入；所有网络失败静默。

#### 7.4.7 recite-mode.tsx（291 行）—— 背诵检测子组件

- **题型常量逐字**：

```ts
const Q_TYPES = [
  { value: "ingredients", label: "药物组成", placeholder: "请输入药物组成，用顿号分隔" },
  { value: "mnemonic",   label: "方歌口诀", placeholder: "请默写传统方歌" },
  { value: "functions",  label: "功用主治", placeholder: "请默写功用主治" },
];
```

  （注意：**无 indications 独立题型**；"功用主治"题型只比对 `formula.functions` 字段。）
- **State**：qType / answer / result / submitting / **streak（本次会话连续答对数，useState 而非持久化）**。切换题型时清空 answer 与 result。
- **评分**：ingredients → `diffIngredients`（同 quiz）；mnemonic → `textSimilarity(answer, formula.traditionalMnemonic || "")`；functions → `textSimilarity(answer, formula.functions || "")`。`isPass(score)` 通过则 `setStreak(s=>s+1)` 否则归 0。
- **上报**：`POST /api/answer`（`{formulaId, mode:"recite", questionType: qType, userAnswer}`，无 rating）→ `POST /api/today-plan/complete`，均静默。
- **UI**：标题栏右侧 Flame + streak "连对"；三题型按钮（选中 accent，否则 outline）；结果区绿/红提示条（"通过！"/"未通过"+"得分：N 分"）；ingredients 题型额外展示"漏掉的药"（destructive Badge）与"多答的药"（secondary Badge）；按钮"再来一次"（清空重答）与"下一题"（同 quiz 的 next 逻辑，跳转带 `?mode=recite`）。
- **边界**：Enter 提交仅在无 result 时生效；`disabled={!!result || submitting}` 锁定输入。

#### 7.4.8 src/components/ui/（9 个 shadcn 风格基件）

badge.tsx / button.tsx / card.tsx / dialog.tsx / input.tsx / label.tsx / progress.tsx / separator.tsx / tabs.tsx。均为标准 shadcn/ui（new-york 风格）+ Tailwind v4 变量版实现，基于 `class-variance-authority` + `cn()`（见 7.1.2 utils.ts）。**项目级定制点**（复现必须保留）：

- `badge.tsx`：在 default/secondary/destructive/outline 之外**新增 `accent` variant**（琥珀底 `bg-accent text-accent-foreground`），用于"一类方"/"新学"徽章。
- `button.tsx`：同样**新增 `accent` variant**（琥珀底按钮），用于主 CTA（一键开始、闯关测试、注册等）。
- 其余 7 件为 shadcn 原样：card（Card/CardHeader/CardTitle/CardContent）、dialog（Radix Dialog 封装）、input、label（Radix Label）、progress（Radix Progress，指示条 `bg-primary`）、separator（Radix Separator）、tabs（Radix Tabs，TabsList/TabsTrigger/TabsContent）。依赖的 Radix 包版本见第 2 章依赖表。

### 7.5 数据管线与文档生成脚本（scripts/，9 个文件，逐个成节）

scripts 目录分两条链路：**数据管线**（parse_mnemonics.py → enrich_formulas.mjs → seed.ts，产出 custom.db）与**方案文档生成**（generate_plan_doc.mjs + 5 个 plan_doc_*.mjs 模块，产出 docx 设计方案书，与应用运行无关）。

#### 7.5.1 parse_mnemonics.py（140 行）—— 口诀解析器

- **输入**：`raw_mnemonics.md`（格式见 §4.5：`## 第X章 章名` + 三列 Markdown 表格 `| 方名 | 压缩字块 | 触发 |`）。路径**硬编码**：`RAW = Path('/home/z/my-project/data/raw_mnemonics.md')`、`OUT = Path('/home/z/my-project/data/formulas_parsed.json')`，异地重跑需改。
- **硬编码常量**：`CHAPTER_NAMES`（1–20 → 解表剂/泻下剂/和解剂/清热剂/祛暑剂/温里剂/表里双解剂/补益剂/固涩剂/安神剂/开窍剂/理气剂/理血剂/治风剂/治燥剂/祛湿剂/祛痰剂/消食剂/驱虫剂/涌吐剂）与 `TARGET_COUNTS`（原站每章应有数，逐字：`{1:13, 2:11, 3:9, 4:20, 5:8, 6:13, 7:4, 8:24, 9:9, 10:3, 11:4, 12:8, 13:14, 14:9, 15:6, 16:14, 17:12, 18:3, 19:3, 20:3}`，合计 190），用于末尾"有/应"对账。
- **处理流程**（正则逐字见 §6.5）：`re.split` 按 `## 第([一二三四五六七八九十]+)章\s+` 切章 → `cn2num` 中文数字转 1–20（越界跳过）→ `table_row_re.findall` 提取三列 → 跳过表头/分隔行（name 以 `---`/`:` 开头或 == "方名"）与空 name/mnemonic → 组装 13 字段记录：`id=name`（pinyin_id 占位实现直接返回名称）、`chapter`、`chapter_name`（查 CHAPTER_NAMES）、`name`、`mnemonic`、`trigger`，其余 7 个富化字段全部置空（`mnemonic_explanation/traditional_mnemonic/traditional_mnemonic_explanation/functions/indications/level` 为 `""`，`ingredients` 为 `[]`），**待 enrich 填充**。
- **输出**：`json.dumps(ensure_ascii=False, indent=2)` 写 formulas_parsed.json（190 条）；打印逐章 `有 X / 应 Y` 对账与合计缺口。
- **边界**：重复方名不去重（去重延到 seed.ts）；只依赖 Python 标准库（json/re/pathlib）。

#### 7.5.2 enrich_formulas.mjs（156 行）—— LLM 富化器（z-ai-web-dev-sdk）

- **输入**：`data/formulas_parsed.json`；`DATA_DIR` 硬编码 `/home/z/my-project/data`。**依赖 `import ZAI from 'z-ai-web-dev-sdk'`（不在 package.json，见 §10.2 G5）**，调用方式 `const zai = await ZAI.create(); zai.chat.completions.create({ messages, thinking: { type: 'disabled' } })`。注意：messages 中 SYSTEM_PROMPT 放在 `role: 'assistant'` 消息里（真实代码如此，非笔误），用户消息用 `buildUserPrompt`。
- **SYSTEM_PROMPT（原文逐字，白名单）**：

```
你是一位资深中医方剂学教授，精通考研方剂学全部 217 首方剂。你的任务是根据用户提供的方剂元数据，输出该方剂的完整结构化信息。

要求：
1. 传统方歌（traditional_mnemonic）：必须是教材通用版方歌，7 字句为主，4-8 句。如果是常用方剂，请用教材标准版本，不要自创。
2. 传统方歌解释（traditional_mnemonic_explanation）：逐句解释方歌，说明每句对应哪些药物、主治什么证候。要详细，至少 100 字。
3. 压缩口诀解释（mnemonic_explanation）：把"压缩字块"逐字拆解，说明每个字/词对应哪味药。格式如："妈(麻黄) + 跪(桂枝) + 着(杏仁) + 炒(甘草)"。如果压缩字块里有"+"号分隔，按段拆解。
4. 药物组成（ingredients）：JSON 数组，每味药一个元素，用通用名（如"麻黄"，不用"麻黄根"）。
5. 功用（functions）：8-20 字概括，如"发汗解表，宣肺平喘"。
6. 主治（indications）：50-150 字，含主症 + 舌脉。
7. 难度（level）：根据中医考研方剂学大纲，"一类方"为高频必考方（如麻黄汤、桂枝汤、白虎汤、四君子汤等），"二类方"为辅助记忆方。请基于考研实际出题频率判断。

输出格式：严格的 JSON，不要包 markdown 代码块，不要任何额外说明文字。JSON 字段顺序如下：
{"traditional_mnemonic": "...", "traditional_mnemonic_explanation": "...", "mnemonic_explanation": "...", "ingredients": ["..."], "functions": "...", "indications": "...", "level": "一类方"|"二类方"}
```

- **buildUserPrompt 模板（原文逐字，`${}` 为插值）**：

```
请为以下方剂生成完整结构化信息：

方名：${formula.name}
所属章节：第${formula.chapter}章 ${formula.chapter_name}
压缩字块：${formula.mnemonic}
触发关键词：${formula.trigger}

请输出 JSON。
```

- **命令行参数**（`process.argv[2]`，默认 `sample`）：`sample` → 固定 5 首 `['麻黄汤', '白虎汤', '四君子汤', '逍遥散', '二陈汤']`（命中不足 5 首则回退取前 5 条），输出 `formulas_sample.json`；`all` → 全量 190 首输出 `formulas_enriched.json`（**仓库未提交**，见 §10）；数字 N → 前 N 首。
- **健壮性**：`extractJson` 先剔 ``` 围栏再取首 `{` 至末 `}` 切片 JSON.parse；仅 429 错误重试（最多 3 次，退避 `3000 * attempt` ms），其他错误直接抛；串行调用每首间隔 `1500ms`；单首失败记入 errors 不中断全局，末尾打印失败列表。
- **输出字段**：`{ ...formula, ...data }` —— 在 parsed 13 字段上覆盖 traditional_mnemonic / traditional_mnemonic_explanation / mnemonic_explanation / ingredients / functions / indications / level。

#### 7.5.3 seed.ts（162 行）—— 数据库播种（bun db:seed）

- **输入**：`data/formulas_parsed.json`（必需）+ `data/formulas_sample.json`（可选，存在则按 name 合并富化字段）。
- **处理规则**：
  1. `CATEGORIES` 20 个分类名与 `CATEGORY_DESCRIPTIONS` 20 条描述常量（逐字已收录于 §6.6），按顺序 upsert `formulaCategory`（`sortOrder = 序号`）。
  2. 方剂 id 生成：`makeId = \`c${String(chapter).padStart(2, "0")}_${name}\``（如 `c01_麻黄汤`）—— **id 含中文**，前端路由必须 encode/decodeURIComponent。
  3. `seenNames` Set 去重（同名方只取首次出现）。
  4. 富化合并：`sampleMap`（name → enriched）；字段优先级 `enriched ?? parsed ?? 默认`，如 `level: enriched?.level ?? f.level ?? "二类方"`；`ingredients` 存库前 `JSON.stringify`。
  5. `sortOrder: imported`（导入序号递增）；`db.formula.upsert({ where: { id } })` 幂等可重跑。
- **输出**：写入 `DATABASE_URL` 指向的 sqlite（db/custom.db）；末尾打印导入统计（分类数/方剂数/跳过数）。
- **边界**：parsed.json 缺失直接抛错；sample.json 缺失静默跳过（try/catch）；chapter 号超出 1–20 的条目归入最后一类。

#### 7.5.4 generate_plan_doc.mjs（153 行）—— 设计方案书 docx 生成主入口

- **职责**：用 `docx` npm 包把 5 个 plan_doc 模块拼成《方剂口诀闯关-AI增强方案》Word 文档。**与应用运行无关，仅产出文档。**
- **实现要点**：三个 section —— 封面（无页边距）、目录（罗马页码）、正文（阿拉伯页码，页眉页脚）；正文章节来自 `chapter1..12` 函数数组拼接；输出路径硬编码 `/home/z/my-project/download/方剂口诀闯关-AI增强方案.docx`（Linux 容器路径，Windows 下重跑需改）。
- **字体**：SimSun（正文）/ SimHei（标题），正文字号 size 22（十一磅）。

#### 7.5.5 plan_doc_helpers.mjs —— docx 构造器与调色板

- 导出调色板 `P`（Deep Cyan 主题：`bg: "0B1C2C"`、`accent: "1B6B7A"` 等）与构造器 `h1/h2/h3/p/pRich/li/liTag/table/tableCaption/spacer`（封装 docx 的 Paragraph/TextRun/Table，统一字体、行距、边框、列宽百分比）。各 chapter 模块均 import 自此。

#### 7.5.6 plan_doc_cover.mjs —— 封面与目录

- 导出 `coverSection()`（深色背景封面：主标题"方剂口诀闯关 AI 增强方案"、副标题、日期）与 `tocSection()`（手写目录条目，非自动域）。

#### 7.5.7 plan_doc_chapters_1_4.mjs（189 行）—— 方案书第 1–4 章

- 执行摘要 + 第一章背景（**重要史料**：原站构建于无代码平台 meoo.run，React 18.2 + Supabase 2.98 SPA；原站 217 首 vs 本项目语料 190 首的差异分析）+ 第二章目标用户 + 第三章产品定义 + 第四章信息架构。纯文案内容，复现时可略（不影响应用功能）。

#### 7.5.8 plan_doc_chapters_5_8.mjs（303 行）—— 方案书第 5–8 章

- 第五章数据表设计（9 张表字段表）、第六章 FSRS、第七章技术栈、第八章 API。**注意历史差异**：方案书规划的是 Neon Postgres + Next.js 16，而实际实现落地为 **sqlite + Next.js 15.5**（以本文档第 2/4 章的实现现状为准，方案书仅供背景）。

#### 7.5.9 plan_doc_chapters_9_12.mjs（222 行）—— 方案书第 9–12 章

- 第九章 MVP 任务拆分（13 项交付物工时表，人日估算）、第十章数据策略、第十一章风险、第十二章后续路径（明确砍掉：AI 讲解助手/错题复盘/易混对比移 V2，AI 病案出题砍掉，支付 V3）。可作为 §10 TODO 清单的佐证。

### 7.6 测试（tests/，setup.ts + 7 个单测文件）

#### 7.6.1 vitest.config.ts（31 行）

- 插件 `@vitejs/plugin-react`；顶部 `config()` 加载 dotenv；别名 `@ → ./src`。
- test 配置：`environment: "jsdom"`、`globals: true`、`setupFiles: ["./tests/setup.ts"]`、include 三模式（`tests/unit/**/*.test.{ts,tsx}`、`tests/integration/**/*.test.{ts,tsx}`、`src/**/*.{test,spec}.{ts,tsx}`；后两类当前无文件）；coverage v8，reporter text+html，include `src/lib/**` 与 `src/components/**`。

#### 7.6.2 tests/setup.ts（186 行）—— 全局 mock 层（复现测试的关键）

四组 `vi.mock`：
1. `next/navigation`：useRouter 返回四个 `vi.fn()`（push/replace/refresh/back）；redirect/useSearchParams/usePathname 均稳定桩。
2. `next-auth/react`：useSession 固定 `{ data: null, status: "loading" }`；SessionProvider 直透 children。
3. `next-auth`：`getServerSession: vi.fn(() => null)`（各测试文件内用 `vi.mocked` 覆盖返回登录态）。
4. `@/lib/auth`：`hashPassword → \`hashed-${p}\``、`verifyPassword → h === \`hashed-${p}\``（绕过 bcrypt）。
5. `@/lib/db`：**内存 Prisma 替身** —— 9 张表各一个 `Map`（user/formula/formulaCategory/userMastery/answerLog/dailyPlan/studySession/aiConversation/userStreak）；`db` 是 Proxy，按模型名取表后返回 `makeProxy(table)`，实现 findUnique/findFirst/findMany（支持 where/take/orderBy 多键排序/include 时 `_count.formulas` 固定返 0）/count/create（无 id 时 `String(Date.now()+Math.random())`）/update/upsert/delete/groupBy（返 []）/aggregate（返 {}）；额外导出 `__tables` 供测试直接操作。
6. `matchWhere` 递归匹配器：支持 `AND/OR/NOT` 与操作符对象 `{ contains, gte, lte, gt, lt, in }`，其余严格等值。**注意**：不支持复合唯一键语法（如 `userId_planDate: {...}`）——因内层是操作符对象分支会全部 miss 而返回 false，测试中相关查询需用普通 where 字段。

#### 7.6.3 七个单测文件（tests/unit/）

| 文件 | 用例数 | 被测对象 | 覆盖要点 |
|---|---|---|---|
| fsrs.test.ts | 23 | src/lib/fsrs.ts | 初始卡片字段、四级评分后 stability/interval 单调性、R 公式边界（t=0 → R=1）、inferRating 四档阈值 |
| deepseek.test.ts | 12 | src/lib/deepseek.ts | isDeepSeekConfigured 真假、无 key 抛特定错、fetch 的 URL/body/model/jsonMode(response_format) 断言（mock 全局 fetch） |
| answer.test.ts | 28 | api/answer/route.ts | 401/400/404、quiz 判分、显式 rating vs 推断 rating、UserMastery 首建与更新、streak 触发/幂等、answerLog 写入 |
| asr-check.test.ts | 10 | api/ai/asr-check/route.ts | 401/400/404、满分/漏药/全错/多答、四种分隔符切分、answerLog 写入、空 ingredients 容错 |
| daily-recommend.test.ts | 9 | api/ai/daily-recommend/route.ts | 401、CRON_SECRET 403/放行、无 key 降级、AI 成功/补齐/非法 id 过滤/抛错降级、cached 命中 |
| today-plan.test.ts | 18 | api/today-plan/* 三路由 | GET 兜底生成、complete 标记/幂等/全完成置 isCompleted、next 顺序取题/done |
| formula-detail.test.tsx | 15 | src/components/formula-detail.tsx | 渲染方剂名/等级徽章、三 Tab 切换、遮罩点击揭示、模式切换按钮（Testing Library + jsdom） |

运行：`bun run test`（= `vitest run`），全部用例应全绿（实测共计 **115** 个用例，按文件分布如上表）。

### 7.7 附：src/lib/types.ts 全文（93 行，逐字）

前端共享类型定义，是组件层与 API 响应的类型契约（与 §4.8 数据字典对照）：

```typescript
// 方剂类型定义（前端共享）

export interface Formula {
  id: string;
  name: string;
  source: string;
  alias: string[];
  categoryId: number;
  categoryName?: string;
  mnemonic: string;
  mnemonicExplanation: string;
  traditionalMnemonic: string;
  traditionalMnemonicExplanation: string;
  ingredients: string[];
  functions: string;
  indications: string;
  trigger: string;
  level: "一类方" | "二类方";
  sortOrder: number;
}

export interface FormulaCategory {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
  formulaCount?: number;
}

export interface UserMastery {
  id: number;
  userId: string;
  formulaId: string;
  stability: number;
  difficulty: number;
  retrievability: number;
  lastReview: Date | null;
  dueDate: Date;
  reviewCount: number;
  lapseCount: number;
  lastRating: "again" | "hard" | "good" | "easy" | null;
}

export interface AnswerLog {
  id: number;
  userId: string;
  formulaId: string;
  mode: "learn" | "quiz" | "recite" | "asr";
  questionType: "ingredients" | "mnemonic" | "functions" | "indications";
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  matchScore: number;
  timeSpentSeconds: number;
  rating: "again" | "hard" | "good" | "easy" | null;
  createdAt: Date;
}

export interface DailyPlanItem {
  formulaId: string;
  formulaName: string;
  reason: string;
  type: "new" | "review";
}

export interface DailyPlan {
  id: number;
  userId: string;
  planDate: Date;
  recommendedFormulas: DailyPlanItem[];
  newCount: number;
  reviewCount: number;
  completedCount: number;
  isCompleted: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
  totalCheckIns: number;
}

export type StudyStage = "newbie" | "intensive" | "sprint" | "final";

export interface User {
  id: string;
  email: string;
  name: string | null;
  studyStage: StudyStage;
  dailyGoal: number;
}
```

注意两处类型与运行时的已知偏差（亦见 §10.3）：① `DailyPlan.recommendedFormulas` 在类型里是数组，但 serializePlan 实际输出字段名为 `items`（且 daily-recommend 返回原始字符串行）；② `DailyPlanItem` 缺 `completed` 字段，而实际 items 每项含 `completed: boolean`。

### 7.8 附：常量、正则与魔法值总索引（全库去重汇总，均已在正文逐字收录）

| # | 值/正则（逐字） | 位置 | 语义 | 详见 |
| --- | --- | --- | --- | --- |
| 1 | `VALID_MODES = ["learn","quiz","recite","asr"]` | api/answer | 模式白名单 | §5.3.4 |
| 2 | `VALID_QTYPES = ["ingredients","mnemonic","functions","indications"]` | api/answer | 题型白名单 | §5.3.4 |
| 3 | `VALID_RATINGS = ["again","hard","good","easy"]` | api/answer | 评级白名单 | §5.3.4 |
| 4 | `score >= 0.9→easy / >=0.7→good / >=0.6→hard / else→again` | api/answer | 评级推断阈值 | §6.2 |
| 5 | `isCorrect = score >= 0.6` | scoring/answer/asr | 判对阈值 | §6.2 |
| 6 | `/[、,，;；\s]+/` | api/answer | ingredients 答案切分 | §5.3.4 |
| 7 | `/[、,，\s\n]+/` | api/ai/asr-check | transcript 切分（无分号） | §5.3.12 |
| 8 | `/[。，,．.！!？?;\n]+/` | formula-detail | 口诀切句 splitMnemonicLines | §7.4 |
| 9 | FSRS `generatorParameters({ maximum_interval: 365, request_retention: 0.9, enable_fuzz: true })` | lib/fsrs.ts | 调度参数 | §6.1 |
| 10 | `take: 10`（到期复习上限）/ 计划总量 10 | daily-plan/daily-recommend | 计划容量 | §6.6 |
| 11 | `take: 50`（近 7 天 logs）/ `slice(0,10)`（dueForReview） | daily-recommend | prompt 上下文裁剪 | §7.2.12 |
| 12 | checkInHistory：ISO 日期 append，无长度上限 | api/answer bumpStreak | 打卡历史 | §6.3 |
| 13 | `limit 默认 100，上限 500` | api/formulas | 列表分页 | §5.3.2 |
| 14 | `updatedAt >= 7 天前` | api/cron/daily-plan | 活跃用户定义 | §5.3.13 |
| 15 | `maxDuration = 60` / `dynamic = "force-dynamic"` | api/cron/daily-plan | 运行时声明 | §5.3.13 |
| 16 | cron `0 19 * * *`（UTC 19 = 北京 03） | vercel.json（需自建） | 定时预生成 | §7.2.14 |
| 17 | `temperature: 0.7, max_tokens: 2000, response_format: json_object, model: "deepseek-chat"` | lib/deepseek.ts | AI 调用参数 | §6.8.5 |
| 18 | `密码≥6位，昵称 1-30 字` | api/register zod | 注册校验 | §5.3.1 |
| 19 | `bcrypt 盐轮 10`（bcryptjs 默认 hashSync(p,10)） | api/register | 密码哈希 | §7.2.2 |
| 20 | `TARGET_COUNTS = {1:13,…,20:3}` 合计 190 | parse_mnemonics.py | 逐章校验 | §7.5.1 |
| 21 | `table_row_re = ^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$`(MULTILINE) | parse_mnemonics.py | 表格行解析 | §7.5.1 |
| 22 | `串行间隔 1500ms；429 退避 3000*attempt，最多 3 次` | enrich_formulas.mjs | 限流 | §7.5.2 |
| 23 | `makeId = c{章号 padStart(2,'0')}_{方名}` | scripts/seed.ts | 业务主键 | §7.5.3 |
| 24 | `--color-accent: #f59e0b`；`.mask-text`；`.flip-card` | globals.css | 视觉主题/遮罩 | §8.2 |
| 25 | `hashed-${password}` | tests/setup.ts | mock 哈希约定 | §7.6 |
| 26 | `next dev -p 3000` | package.json | 开发端口 | §2.6 |
| 27 | `DATABASE_URL=file:/home/z/my-project/db/custom.db` | .env | 占位路径（非密钥） | §2.4 |
| 28 | `/home/z/my-project/{data,db}` 硬编码 | 三个 scripts | 复现需改写 | §10.3 |

<!-- SECTION 7 END -->

## 8. UI 与交互

### 8.1 页面路由总表

| # | 路由 | 文件 | 渲染方式 | 鉴权 | 说明 |
|---|---|---|---|---|---|
| 1 | `/` | src/app/page.tsx | Server Component | 可选 | 未登录 GuestHome，已登录 TodayHome |
| 2 | `/auth/login` | src/app/auth/login/page.tsx | Client | 无 | 登录表单，signIn credentials |
| 3 | `/auth/register` | src/app/auth/register/page.tsx | Client | 无 | 注册 → 自动登录 → / |
| 4 | `/formulas/[id]` | src/app/formulas/[id]/page.tsx | Server（force-dynamic） | 无（页面可看，交互 API 需登录） | 方剂详情 + 三模式；id 需 decodeURIComponent |
| 5 | `/categories/[id]` | src/app/categories/[id]/page.tsx | Server | 无 | 分类方剂列表，id 为数字 |
| 6 | `/search?q=` | src/app/search/page.tsx | Server | 无 | 三字段 contains，take 50 |

另有占位链接（均落在 `/` 且首页未消费 view 参数，点击后等价于回首页）：`/?view=categories`、`/?view=search`、`/?view=profile`（Header）、`/?view=errors`（错题本按钮）。复现时保留原样并在 §10 登记为 TODO。

### 8.2 视觉体系

- **设计语言**：极简黑白 + 琥珀强调色（`#f59e0b`）。黑 = primary（默认按钮/进度条），琥珀 = accent（主 CTA、一类方徽章、新学徽章、连击火焰、遮罩色、拆字高亮），红 = destructive（错误/漏药），灰 = secondary/muted（二类方、复习、多答）。
- **布局宽度**：全站统一 `container mx-auto max-w-2xl px-4`（移动优先单栏）；Header `max-w-2xl` 同宽。
- **图标语义（lucide-react）**：BookOpen=Logo/学习；Swords=闯关；Brain=背诵；Flame=连击/连对；Target=已学；Zap=掌握度；Calendar/Search/Trophy=导航；CheckCircle2/XCircle=判定结果；ArrowRight=下一题；ArrowLeft=返回。
- **字体**：系统字体栈（见 §7.3.3），无 next/font。

### 8.3 页面状态机

#### 8.3.1 首页（/）

```
[服务端] getServerSession
 ├─ 无 session → GuestHome（静态，无客户端状态）
 └─ 有 session → 查 plan/统计 → TodayHome
      TodayHome 客户端状态：starting: boolean
      idle ─点"一键开始"→ starting ─fetch next─┬─ done → router.refresh() → idle
                                            ├─ formulaId → 跳 /formulas/[id]?mode=learn
                                            └─ 失败 → 静默 → idle
```

#### 8.3.2 方剂详情页（/formulas/[id]）—— FormulaDetail 模式状态机

```
mode: null(详情) ⇄ learn ⇄ quiz ⇄ recite   （任意态可回 null，“返回详情”按钮）
详情态内嵌 Tab 状态：traditional | mnemonic | ingredients（defaultValue=traditional）
traditional 内嵌遮罩状态：revealedLines: Set<number>，逐句独立 toggle
```

注意：URL 上的 `?mode=learn|quiz|recite` 仅作跳转意图标记，组件不读取（初始永远是详情态）——已知简化，见 §10。

#### 8.3.3 闯关模式（QuizMode）

```
answering ─提交─→ scoring（本地 diffIngredients，同步）─→ result
  result 展示：得分/通过与否/漏药(destructive)/多答(secondary)
  result 后台：静默 POST /api/answer（无 rating）+ POST /api/today-plan/complete
  result ─点评级(again|hard|good|easy)─→ rated（再次 POST /api/answer 带 rating，按钮置灰）
  result|rated ─点"下一题"─→ GET /api/today-plan/next ─┬─ done → 回 /
                                                       └─ id → 跳 ?mode=quiz 新方剂
```

#### 8.3.4 背诵检测（ReciteMode）

```
题型 qType: ingredients | mnemonic | functions（切换时清空 answer/result）
answering ─提交─→ result（本地评分：diff 或 textSimilarity）
  通过 → 会话连对 streak+1；未通过 → streak=0（纯 useState，刷新归零）
  result 后台：静默 POST /api/answer（mode=recite）+ complete
  result ─"再来一次"→ answering（清空）；─"下一题"→ next（同 quiz，跳 ?mode=recite）
```

#### 8.3.5 登录/注册流程

```
注册：form → POST /api/register ─┬─ !ok → 显示 data.error
                                └─ ok → signIn(redirect:false) ─┬─ error → "注册成功但自动登录失败，请手动登录"
                                                                └─ ok → push(/) + refresh()
登录：form → signIn(redirect:false) ─┬─ error → "邮箱或密码错误"
                                     └─ ok → push(/) + refresh()
```

### 8.4 组件树

```
RootLayout (layout.tsx)
└─ Providers (SessionProvider)
   ├─ / ─┬─ GuestHome ── Header / Hero / 统计卡×3 / 分类卡网格 / footer
   │     └─ TodayHome ── Header / 进度卡(Progress) / 统计卡×3 / 推荐列表(Badge) / 两按钮
   ├─ /auth/login ── Card+Input×2
   ├─ /auth/register ── Card+Input×3
   ├─ /formulas/[id] ── FormulaDetail
   │     ├─ Header
   │     ├─ Tabs(traditional/mnemonic/ingredients)
   │     ├─ QuizMode（mode=quiz 时）
   │     └─ ReciteMode（mode=recite 时）
   ├─ /categories/[id] ── Header + 方剂卡列表(Link)
   └─ /search ── Header + GET 表单 + 结果卡列表
```

### 8.5 状态管理策略

1. **无全局状态库**（无 Redux/Zustand/Context 业务 store）。唯一 Context 是 NextAuth `SessionProvider`。
2. **服务端取数 + props 下发**：所有列表/详情数据在 Server Component 里用 Prisma 直查，序列化后传入客户端组件；客户端不再拉列表。
3. **客户端只管交互态**：useState 局部状态（mode/answer/result/streak/starting 等），无跨页面共享。
4. **同步机制**：写操作后靠 `router.refresh()`（重跑服务端取数）或整页跳转；无 SWR/React Query。
5. **乐观/静默策略**：评分在前端本地完成即时反馈，服务端上报 fire-and-forget（try/catch 全静默）；因此断网时 UI 仍可用，但 FSRS/连击不更新（接受的一致性权衡）。

### 8.6 关键交互细节清单

| 交互 | 实现 | 位置 |
|---|---|---|
| 方歌逐句遮罩 | `.mask-text`（文字色=背景色）+ 点击 toggle `revealed` 类 | FormulaDetail + globals.css |
| 方歌切句 | `/[。，,．.！!？?;\n]+/` | FormulaDetail.splitMnemonicLines |
| 答案切分（前端） | `/[、,，\s]+/` | quiz-mode / recite-mode |
| 回车提交 | Input onKeyDown Enter（仅无 result 时） | quiz/recite |
| 进度百分比 | `Math.round(completed/total*100)` | TodayHome |
| 完成项样式 | `opacity-60` + 绿色 ✓ | TodayHome 推荐列表 |
| 等级徽章 | 一类方=accent / 二类方=secondary | FormulaDetail / categories/[id] |
| 新学·复习徽章 | new=accent / review=secondary | TodayHome |
| 防重入 | starting/submitting boolean + disabled | 所有提交按钮 |
| 中文 id 跳转 | 一律 `encodeURIComponent(formulaId)` | 所有 push/Link；详情页 decode |

### 8.7 交互文案与可见元素规格

语义层面固定（重构必须保留），具体中文措辞可微调：

| 位置 | 元素 | 语义规格 |
| --- | --- | --- |
| 详情页模式入口 | 三卡片/按钮 | 学习（learn）/ 闯关（quiz）/ 背诵（recite），点击进入对应 mode |
| learn 模式 | 逐行揭示 | 口诀按 splitMnemonicLines 切句，逐句点击揭示；完成后静默 POST answer（rating 缺省） |
| quiz 模式 | 药物输入框 + 提交按钮 | 本地 diffIngredients 即时反馈 correct/missed/wrong 三色列表 |
| recite 模式 | 遮罩文本 + 显示答案按钮 | .mask-text（文字色=背景色），点击/按钮揭示；本地 textSimilarity 评分 |
| 答题后 | 四评级按钮 | 语义固定 again/hard/good/easy（中文标签如：忘记/困难/良好/简单），点击二次 POST answer 带显式 rating |
| 首页（登录态） | 今日计划卡 | 展示 items 进度 x/y，“开始学习”跳 next 端点结果页 |
| 首页（未登录） | guest-home | 产品介绍 + 登录/注册 CTA，不请求任何会话端点 |
| 顶部栏 | 用户名/退出 | session.user.name 展示；signOut() 回首页 |
| 登录/注册页 | 表单 | 错误文案直接展示 API `error` 字段（如“该邮箱已注册”） |
| 图标 | lucide-react | 装饰性，不承载交互语义 |

### 8.8 关键数据流时序（文字时序图）

**时序 A：闯关答题（quiz）**

```
用户输入药物 → 前端 diffIngredients 本地评分 → 立即渲染 diff 三色反馈
  └→ 并行 fire-and-forget：
      POST /api/answer {mode:quiz, questionType:ingredients, userAnswer, timeSpentSeconds}
        → 服务端重新评分（同算法，不信任前端）→ FSRS review → mastery upsert → AnswerLog → 按需 bumpStreak
      POST /api/today-plan/complete {formulaId}（在计划内才有效，否则幂等无操作）
用户点评级按钮 → 再 POST /api/answer 带 rating → 以显式评级重算 FSRS（同日二次评级变化会再触发 streak）
```

**时序 B：今日计划生成**

```
首页加载 → GET /api/today-plan
  └→ findTodayPlan 命中 → serializePlan 直接返回
  └→ 未命中 → generateFallbackPlan（到期复习≤10 + 一类方新学补齐）→ 落库 → 返回
（AI 路径仅由 daily-recommend/cron 触发，today-plan 本身永不调 AI）
```

**时序 C：凭证登录**

```
登录表单 → signIn("credentials", {email, password, redirect:false})
  → authorize：findUnique(email小写) → bcrypt.compare → 成功返 {id, email, name}
  → jwt 回调 token.id = user.id → session 回调 session.user.id = token.id
前端根据返回 error 字段展示失败文案，成功后 router.push("/") + refresh
```

**时序 D：语音背诵（asr）**

```
浏览器 SpeechRecognition（lang=zh-CN）→ transcript
  → POST /api/ai/asr-check {formulaId, transcript}
  → 服务端切分+diffIngredients → 返 score/diff/orderCorrect（写 AnswerLog，不动 FSRS/streak）
不支持 SpeechRecognition 的浏览器 → 降级提示，功能隐藏
```

### 8.9 页面/组件 ↔ API 依赖矩阵（汇总 §8.8 时序，供前后端对账）

| 前端位置 | 调用 | 对应时序/功能 |
| --- | --- | --- |
| auth/register/page.tsx | POST /api/register → 成功后 signIn("credentials") 自动登录 | F01 |
| auth/login/page.tsx | signIn("credentials")（NextAuth 内置端点，§5.7） | 时序 C |
| page.tsx + today-home.tsx | GET /api/today-plan（推荐列表/进度）、GET /api/streak（连击）、GET /api/stats/weekly（统计卡） | 时序 B / F04 |
| quiz-mode.tsx | 本地 diffIngredients 即时反馈 + POST /api/answer + POST /api/today-plan/complete | 时序 A / F09 |
| recite-mode.tsx | POST /api/answer（questionType 三型） | 时序 A 同型 / F10 |
| 「下一题」按钮 | GET /api/today-plan/next → 路由跳转下一首 | §1.3 闭环 / F18 |
| 语音路径 | 浏览器 SpeechRecognition → POST /api/ai/asr-check | 时序 D（F15 注：无稳定前端入口） |
| categories/formulas/search 页 | 服务端组件直查 db（Prisma），不经 HTTP API | §7.3 |
| header.tsx | 无 API（仅导航链接，含 F22 占位 view 参数） | §10.3 |
| （无前端调用方） | GET/POST /api/cron/daily-plan（Vercel Cron/运维）、POST /api/ai/daily-recommend（服务侧/预留）、GET /api/formulas、GET /api/mastery | §7.2/§5.1 |

对账规则：重构后若前端新增/减少端点调用，必须同步更新本矩阵与 §5.1 总表，两者与 src/app/api 下 route.ts 文件数（14）三方一致才算契约闭合。

<!-- SECTION 8 END -->

## 9. 从零复现步骤

> 目标：在全新机器上，仅凭本文档重建可运行、可测试、数据完整的应用。默认使用 **Bun**（仓库含 bun.lock；npm/pnpm 也可，命令自行替换）。全程约 20–40 分钟（含可选 AI 富化则另计）。

### 9.1 前置条件

| 工具 | 版本要求 | 用途 |
|---|---|---|
| Bun | ≥ 1.1（或 Node.js ≥ 20） | 包管理/运行/测试 |
| Python | ≥ 3.9（仅标准库） | parse_mnemonics.py |
| sqlite | 无需单独安装（Prisma 内置驱动） | 数据库 |
| DEEPSEEK_API_KEY | 可选 | 运行时 AI 每日推荐（缺省时全链路降级可用） |
| z-ai-web-dev-sdk | 可选 | 仅 enrich_formulas.mjs 富化脚本需要（不在 package.json，见 §10.2 G5） |

### 9.2 编号步骤

**步骤 1 —— 创建项目骨架**

```bash
mkdir 方剂口诀闯关-AI增强方案 && cd 方剂口诀闯关-AI增强方案
```

按第 3 章目录树创建目录结构；按第 2 章逐字还原 `package.json`（依赖版本表 + scripts）、`tsconfig.json`（target ES2017、paths `@/* → ./src/*`、strict）、`next.config.ts`（默认导出即可）、`postcss.config.mjs`（`@tailwindcss/postcss` 插件）、`components.json`（shadcn new-york）、`vitest.config.ts`（§7.6.1 逐字）。

**步骤 2 —— 安装依赖**

```bash
bun install
```

验收：`bun.lock` 生成；`bunx prisma -v` 可运行；无 peer 冲突报错。

**步骤 3 —— 环境变量**

创建 `.env`（键位见 §2.4，本地最小集）：

```env
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=<任意随机长字符串>
NEXTAUTH_URL=http://localhost:3000
# 可选：
DEEPSEEK_API_KEY=<占位>
CRON_SECRET=<占位>
```

**步骤 4 —— 还原数据模型并建库**

将 §4.1 的 `prisma/schema.prisma`（183 行）逐字落盘，然后：

```bash
mkdir db
bun run db:push        # = prisma db push（项目未用 migrate 历史，push 即可）
bunx prisma generate   # 生成客户端（package.json 无 db:generate 脚本，直接用 bunx）
```

验收：`db/custom.db` 生成；`bunx prisma studio` 能看到 9 张空表（User/Formula/FormulaCategory/UserMastery/AnswerLog/DailyPlan/StudySession/AiConversation/UserStreak）。

**步骤 5 —— 准备语料**

- `raw_mnemonics.md`：按 §4.5 格式规范重建（20 个 `## 第X章 章名` 标题、每章一个 `| 方名 | 压缩字块 | 触发 |` 三列表格，共 190 行数据）。此文件源自 `方剂.txt`（1MB 语料，不可内嵌）的人工提炼；若无原始语料，可用任意符合格式的方剂口诀数据代替（功能不受影响，内容不同）。
- 若能拿到原仓库的 `data/formulas_parsed.json`，可跳过步骤 6 直接用。

**步骤 6 —— 解析口诀 → parsed.json**

```bash
python scripts/parse_mnemonics.py
```

验收：`data/formulas_parsed.json` 生成，数组长度 190（以自备语料为准），每条含 §4.3 的 13 字段；控制台打印各章"有/应"对账。**注意**：脚本内 RAW/OUT 路径硬编码为 `/home/z/my-project/data/…`，重跑前需改为本地路径。

**步骤 7 ——（可选）AI 富化**

```bash
node scripts/enrich_formulas.mjs sample   # 仅 5 首（麻黄汤/白虎汤/四君子汤/逍遥散/二陈汤），产出 data/formulas_sample.json
node scripts/enrich_formulas.mjs all      # 全量 190 首，产出 data/formulas_enriched.json，约需 190×(1.5s+请求时长)
node scripts/enrich_formulas.mjs 13       # 前 13 首（数字参数）
```

需要 `z-ai-web-dev-sdk` 可用环境（见 §10.2 G5；脚本 DATA_DIR 同样硬编码 `/home/z/my-project/data`，重跑需改）。跳过此步时 seed 仅用 parsed 字段（ingredients/functions 等为空，详情页显示"暂无"，闯关/背诵仍可用但无参考答案——因此**建议至少跑 --sample**。

**步骤 8 —— 播种**

```bash
bun run db:seed   # = tsx scripts/seed.ts
```

验收：控制台打印"分类 20 / 方剂 190"量级统计；Prisma Studio 中 `Formula` 190 行、`FormulaCategory` 20 行；任取一行 id 形如 `c01_麻黄汤`。重跑幂等（upsert）。

**步骤 9 —— 启动与冒烟**

```bash
bun run dev   # next dev，http://localhost:3000
```

冒烟清单：
1. 未登录首页：GuestHome，分类卡 20 张，方剂总数 190。
2. 注册一个账号 → 自动登录 → TodayHome（首次无计划，显示"暂无推荐"）。
3. `GET /api/today-plan`（登录态访问）→ 兜底生成 10 条计划；刷新首页可见推荐列表。
4. 一键开始 → 进详情页 → 闯关测试提交答案 → 得分/评级按钮可用 → 下一题轮转。
5. 背诵检测三题型切换、方歌遮罩点击揭示。
6. `/search?q=麻黄` 有结果；`/categories/1` 列表正常。

**步骤 10 —— 测试与构建**

```bash
bun run test    # vitest run，预期 7 文件 115 用例全绿
 bun run lint   # next lint（若配置了 eslint）
bun run build   # next build 无错无 TS 报错
```

### 9.3 验收标准总表

| # | 验收项 | 标准 |
|---|---|---|
| 1 | 依赖 | package.json 与 §2.2 逐项一致，bun install 无错 |
| 2 | schema | prisma/schema.prisma 与 §4.1 逐字一致（183 行），db push 成功 |
| 3 | 数据 | Formula=190、FormulaCategory=20；id 格式 `cNN_名` |
| 4 | API | 14 个端点与 §5.1 表一一对应，鉴权/错误码符合 §5.4 |
| 5 | FSRS | 答题后 UserMastery 生成，dueDate/stability 随评级变化（参数见 §6.1） |
| 6 | 降级 | 无 DEEPSEEK_API_KEY 时 daily-recommend 返 `degraded:true` 且仍出 10 条 |
| 7 | 测试 | vitest run → 115 passed / 0 failed |
| 8 | 构建 | next build 成功，首页/详情页 force-dynamic 正常 |
| 9 | UI | §8.6 交互清单逐项可操作；琥珀主题色 #f59e0b |
| 10 | 幂等 | 重跑 seed、重复 complete、同日重复答题均不产生脏数据 |

### 9.4 常见故障排查（症状 → 根因 → 处置）

| # | 症状 | 根因 | 处置 |
| --- | --- | --- | --- |
| 1 | `Error: @prisma/client did not initialize yet` | 未跑 prisma generate | `bunx prisma generate` |
| 2 | `Error code 14: Unable to open the database file` | DATABASE_URL 仍为 `/home/z/…` 容器路径，或 db/ 目录不存在 | 改 `.env` 为相对路径并先建 `db/` 目录 |
| 3 | seed 报 `Cannot find module 'data/formulas_parsed.json'` | seed.ts 硬编码 `/home/z/my-project/data` | 按 §9 步骤 6 改为 `path.join(process.cwd(),'data')` |
| 4 | `node scripts/parse_mnemonics.py` 报语法错 | 这是 Python 脚本 | `python scripts/parse_mnemonics.py` |
| 5 | parse 脚本报 `章数量不符` | raw_mnemonics.md 表格行被改动/丢失 | 比对 TARGET_COUNTS（§7.5.1）逐章核数 |
| 6 | enrich 报 `Cannot find package 'z-ai-web-dev-sdk'` | SDK 不在依赖表（G5） | `bun add z-ai-web-dev-sdk` 或改写为 lib/deepseek.ts 同款直连 |
| 7 | 登录后 session.user.id 为 undefined | 漏实现 jwt/session 回调 | 按 §6.8.6 补 authOptions 两回调 |
| 8 | 所有会话端点 401 | NEXTAUTH_SECRET 未设或 cookie 域不匹配 | 设 `.env` 两键；本地用 http://localhost:3000 |
| 9 | `bun run test` 大面积失败且报 Prisma 真实连接 | tests/setup.ts 未被加载 | 核对 vitest.config.ts 的 setupFiles 路径 |
| 10 | 测试中 upsert/复合唯一键报错 | mock 不支持复合键语法 | 业务代码必须保持 findFirst+create/update 写法（§6.7） |
| 11 | 详情页 404（中文 id） | 跳转未 encodeURIComponent | 所有 push/Link 包一层 encode（§8.6） |
| 12 | daily-recommend 永远 degraded | 未配 DEEPSEEK_API_KEY | 预期行为（三层降级②）；配键后走 AI 路径 |
| 13 | cron 端点 500 `CRON_SECRET not configured` | 未设 CRON_SECRET | `.env` 补键；仅部署定时任务时必需 |
| 14 | Windows 下 python 读 raw_mnemonics.md 乱码 | 默认 GBK 编码 | 脚本已 `encoding='utf-8'`；若自行改写勿丢此参数 |
| 15 | `next build` 报 ESLint 错 | 严格规则 | 先 `bun run lint` 修序；不得关闭规则掩盖类型错误 |

### 9.5 复现自检清单（逐项勾选，全部通过才算复现完成）

**数据层**
- [ ] `formula_categories` 恰 20 行，`formulas` 恰 190 行（`SELECT COUNT(*)`）
- [ ] 抽查 `c01_麻黄汤`：mnemonic=“妈跪着炒”、trigger=“身疼无汗”、ingredients 反序列化为 4 味药
- [ ] 合并覆盖生效：sample 5 首（麻黄汤/白虎汤/四君子汤/逍遥散/二陈汤）含非空 traditionalMnemonic
- [ ] 重跑 `bun run db:seed` 不报错不翻倍（幂等）

**API 层**（对照 §5.5 逐条 curl）
- [ ] register→login→session 三步拿到含 id 的 session
- [ ] answer 场景 A：score=0.4、diff 三数组内容一致、rating=again
- [ ] 同一方剂二答：mastery.reviewCount 递增、dueDate 后移
- [ ] streak：首答后 currentStreak=1；同日重复答题不变
- [ ] today-plan：新用户首次 GET 即得 10 项 fallback 计划（无 mastery 时 10 项全 new）
- [ ] complete 同一 formulaId 二次提交：计数不变（幂等）
- [ ] 未配 DEEPSEEK_API_KEY 时 daily-recommend 返 degraded+reason
- [ ] cron：无密钥 401，`?secret=` 与 Bearer 均可过

**质量门禁**
- [ ] `bun run test` → 7 文件 115 用例全绿
- [ ] `bun run typecheck` / `bun run lint` / `bun run build` 均 0 错
- [ ] 浏览器走完：注册→登录→首页计划→详情页三模式→评级→mastery/stats 页有数据

### 9.6 部署与定时任务（可选，Vercel 为例）

仓库**未含** vercel.json，若需定时预生成计划，按 cron 路由头注释（§7.2.14）自建：

```json
{ "crons": [{ "path": "/api/cron/daily-plan", "schedule": "0 19 * * *" }] }
```

注意：① sqlite 文件库不适合 serverless 多实例，部署需换 Turso/libsql 或自托管单实例（schema 无需改，datasource 换 url 即可）；② 环境变量需在平台配齐 5 键（§2.4）；③ Vercel Cron 自动带 `Authorization: Bearer <CRON_SECRET>`？**不会**——需在 cron 路径上自行拼 `?secret=`，或用 Vercel 的 CRON_SECRET 约定头（项目已兼容两种传法）。

### 9.7 复现辅助脚本（一键串联步骤 4–10，PowerShell）

```powershell
# 在项目根目录执行；前提：已装 bun/python，已按步骤 5/6 修正脚本路径与 .env
bun install
bunx prisma generate
New-Item -ItemType Directory -Force db | Out-Null
python scripts/parse_mnemonics.py          # → data/formulas_parsed.json（190 条）
# 可选：node scripts/enrich_formulas.mjs all   # 需 z-ai-web-dev-sdk，产 formulas_enriched.json
bun run db:push                            # 建表 → db/custom.db
bun run db:seed                            # 20 分类 + 190 方剂（幂等）
bun run test                               # 预期 115 用例全绿
bun run dev                                # http://localhost:3000
```

bash 版将 `New-Item …` 换为 `mkdir -p db`，其余命令相同。

### 9.8 验收冒烟请求序列（确定性期望值，复现完成后按序执行）

以下序列的期望值全部由算法确定性推导（不依赖 AI 外部服务），任何一步不符即判定复现失败。鉴权端点需要 `next-auth.session-token` Cookie：先在浏览器完成注册/登录，再从 DevTools → Application → Cookies 复制该值填入 `<TOKEN>`。

```powershell
$base = "http://localhost:3000"
$cookie = "next-auth.session-token=<TOKEN>"

# S1 注册（无鉴权；请求体 shape 见 §5.5.1，邮箱换成未注册过的值）
#    期望：201/200 且返回用户信息（不含 passwordHash）；重复注册同邮箱 → 冲突错误（§5.4）

# S2 方剂详情（验证 seed 数据 + JSON 数组字段已反序列化）
Invoke-RestMethod "$base/api/formulas/c01_%E9%BA%BB%E9%BB%84%E6%B1%A4" -Headers @{Cookie=$cookie}
#    期望：name=麻黄汤、mnemonic=妈跪着炒、trigger=身疼无汗、ingredients 为数组（AI 富化样本已并入）

# S3 满分作答（确定性：userAnswer 逐字复制 S2 返回的 traditionalMnemonic）
#    POST $base/api/answer  body:
#    { "formulaId":"c01_麻黄汤", "mode":"recite", "questionType":"mnemonic",
#      "userAnswer":"<S2 的 traditionalMnemonic 原文>" }
#    期望：score=1、isCorrect=true、rating="easy"、diff 三数组为空、nextReview 为未来时刻

# S4 零分作答（确定性：空串与任意非空参考的编辑距离相似度 = 0）
#    同上但 userAnswer=""
#    期望：score=0、isCorrect=false、rating="again"

# S5 校验顺序（同时缺多字段只报第一条，验证 §5.8 顺序契约）
#    POST /api/answer  body: {}
#    期望：400 {"error":"缺少 formulaId"}

# S6 打卡联动（S3 是该用户对该方剂的首次作答 → wasFirstReview 触发 bumpStreak）
Invoke-RestMethod "$base/api/streak" -Headers @{Cookie=$cookie}
#    期望：currentStreak=1、totalCheckIns=1、checkInHistory 含今日 0 点 ISO 串；
#    再次执行 S3（评级不变、非首答）→ streak 数值不变（同日幂等 + 防刷双保险）

# S7 今日计划（无 AI Key 时走 fallback，验证 §6.6）
Invoke-RestMethod "$base/api/today-plan" -Headers @{Cookie=$cookie}
#    期望：返回计划对象，recommendedFormulas 非空（新用户 → 一类方优先的新学列表）

# S8 未鉴权拒绝
#    不带 Cookie 调 GET /api/streak → 401 {"error":"未登录"}
```

断言汇总：S3/S4 的 score 期望值不依赖数据内容（复制参考答案→1；空串→0），是最强的算法验收锚点；S5 验证校验顺序；S6 验证 streak 触发条件（wasFirstReview || ratingChanged）与同日幂等。

<!-- SECTION 9 END -->

## 10. 不可文本化资产与已知问题

### 10.1 不可文本化资产处置

| 资产 | 体积 | 处置方式 |
|---|---|---|
| `方剂.txt` | 约 1MB | 原始中医方剂语料（教材体例：方名/出处/组成/用法/功用/主治/方解段落）。**不内嵌**；它不进任何脚本，仅作 raw_mnemonics.md 人工提炼与 enrich 人工校对的参考。丢失后果：无法校验 AI 富化内容的准确性，但应用可完整运行。 |
| `db/custom.db` | 156KB sqlite | **不内嵌、不需拷贝**。完整再生链路：schema（§4.1）→ `prisma db push` → `parse_mnemonics.py`（§7.5.1）→ 可选 `enrich_formulas.mjs`（§7.5.2）→ `seed.ts`（§7.5.3）。用户表/答题日志为运行时数据，新库从空开始属正常。 |
| `raw_mnemonics.md` | 文本 | 可文本化，格式规范+样例已入 §4.5；但 190 条全量内容未内嵌（篇幅），丢失时需从 方剂.txt 重新提炼或用 parsed.json 反向还原（name/mnemonic/trigger 三列即可重构表格）。 |
| `data/formulas_parsed.json` | 70KB | 可由 raw_mnemonics.md 确定性再生；格式+3 样例已入 §4.3。 |
| `data/formulas_sample.json` | 5 条 | 可由 enrich --sample 再生（需 key）；麻黄汤完整样例已逐字入 §4.4。 |
| worklog.md | 文本 | 开发过程日志，不参与运行；本文档已吸收其结论性信息，复现不依赖它。 |

### 10.2 复现缺口清单（诚实声明）

| # | 缺口 | 影响 | 绕行方案 |
|---|---|---|---|
| G1 | `方剂.txt` 1MB 语料未内嵌 | 口诀/方歌的**真实中医内容**无法仅凭本文档逐字还原（仅 §4.3/4.4/4.5 的 4 首完整样例） | 用样例格式自备语料；或从原仓库拷贝 data/ 与 raw_mnemonics.md |
| G2 | `data/formulas_enriched.json` 仓库未提交 | 全量 190 首的富化字段（ingredients 等）需重新花钱跑 DeepSeek | 跑 --sample 验证链路；或接受空字段降级体验 |
| G3 | `DEEPSEEK_API_KEY` 需自备 | enrich 与 AI 推荐不可用 | 全链路已设计降级（degraded fallback，§6.6） |
| G4 | `vercel.json` 不存在 | cron 路由注释引用了它但仓库没有；部署 Vercel 时无定时触发 | 部署时自建：`{ "crons": [{ "path": "/api/cron/daily-plan", "schedule": "0 19 * * *" }] }` |
| G5 | `z-ai-web-dev-sdk` 不在 package.json | **enrich_formulas.mjs 顶部 `import ZAI from 'z-ai-web-dev-sdk'` 依赖它**，装完依赖直接跑会 MODULE_NOT_FOUND | 单独安装该 SDK（原容器环境自带），或把脚本改写为直连 DeepSeek（lib/deepseek.ts 已有等价封装） |
| G6 | 未提交 ESLint 配置细节未全量收录 | lint 规则可能有出入 | 用 next 默认 eslint-config-next 即可 |

### 10.3 已知问题与坑（复现时保留原样，除非明确要修）

1. **`?mode=` 参数不生效**：跳转带 `?mode=learn|quiz|recite`，但 FormulaDetail 不读 searchParams，落地永远是详情态，用户需再点一次模式按钮。
2. **`/?view=xxx` 全部是占位**：分类/搜索/我的/错题本四个入口点击后等于回首页（首页不消费 view）；已登录用户反而没有到达 /search 与 /categories/[id] 的导航链路（只能手输 URL）。
3. **切分正则三处不一致**：后端 answer `/[、,，;；\s]+/`、asr-check `/[、,，\s\n]+/`、前端 `/[、,，\s]+/` —— 含分号的答案在前后端得分可能不同（前端显示为准，后端留痕另算）。
4. **首页与 lib 查计划路径不同**：page.tsx 用复合键 `findUnique`，daily-plan.ts 用 `findFirst`；行为等价但代码不对称。
5. **时区**：`startOfDay` 用服务器本地时区，而 Vercel cron 按 UTC 19:00（=UTC+8 03:00）触发；若部署在非 UTC 服务器，"今日"边界会漂移。
6. **quiz 首次上报无 rating + 评级后二次上报**：同一题会写两条 AnswerLog（第二条带 rating），FSRS 也会被推进两次 —— 真实行为，统计口径需知晓。
7. **recite 的 mnemonic 题型依赖 `traditionalMnemonic`**：未富化时该字段为空，textSimilarity 对空参考永远 0 分（背什么都不通过）。
8. **setup.ts 的 mock 不支持复合唯一键查询**（§7.6.2）：若未来给 page.tsx 写测试会踩到。
9. **中文 id 路由**：任何新增跳转忘记 encodeURIComponent 会在部分浏览器/代理下 404。
10. **脚本路径硬编码**：generate_plan_doc.mjs 输出 `/home/z/my-project/download/`、parse_mnemonics.py 的 RAW/OUT、enrich_formulas.mjs 的 DATA_DIR 均硬编码原容器绝对路径 `/home/z/my-project/…`：异地重跑一律先改路径。

### 10.4 TODO（源自方案书 V2/V3 规划与代码占位）

- 错题本（/?view=errors 占位 → 真实页面）；AI 讲解助手、易混方对比（V2）；ASR 语音输入前端（后端 /api/ai/asr-check 已就绪，前端未接麦克风）；成就系统重评估；全文搜索；支付（V3）；StudySession/AiConversation 两表已建模但代码未写入（预留）。

### 10.5 分阶段复现工序建议（供 AI 执行体排期）

| 阶段 | 交付物 | 依赖章节 | 验收 |
| --- | --- | --- | --- |
| P1 骨架 | Next15+TS+Tailwind4 工程、§2.6 package.json、目录树 | §2/§3 | bun install + dev 可起 |
| P2 数据 | schema 全文、raw_mnemonics.md（按 §4.5 格式重建 190 条）、parse+seed | §4/§7.5 | §9.5 数据层 4 项 |
| P3 内核 | lib 八文件（fsrs/scoring/streak/daily-plan/deepseek/auth/prisma/types） | §6/§7.1/§7.7 | fsrs/scoring 单测绿 |
| P4 API | 14 路由逐个对照 §5.3+§5.5 实现 | §5/§7.2 | §5.6 全部单测绿 |
| P5 UI | 8 页面 + 组件树 + 五状态机 | §7.3/§7.4/§8 | §9.5 浏览器链路 |
| P6 增强 | daily-recommend/asr/cron + 部署 | §5.3.11-13/§9.6 | 降级链路三态可复现 |

工序原则：每阶段结束先跑对应验收再进入下一阶段；P2 的口诀语料若无法获得原件，按 G1 缺口声明用教材方歌自行编制同格式表格，不影响 P3-P6 的代码层复现保真。

### 10.6 本文档使用导读（重构执行体必读）

**消费顺序建议**（与 §10.5 工序对应）：

1. 通读 §1 + §3 建立全貌；按 §9.2 编号步骤作为执行主线。
2. 建骨架阶段：§2.6 package.json 逐字落盘 → §4.1 schema 逐字落盘 → §2.5 配置文件。
3. 数据管线阶段：§4.5 造 raw_mnemonics.md → §7.5.1 实现 parse_mnemonics.py（正则/章名/数量以 §6.5 + §7.8 为准）→ §4.10 seed 合并规则。
4. 业务实现阶段：lib 层按 §6.8 函数级规格 + §6.1/§6.2 算法逐字常量；API 层按 §5 契约（answer 端点直接按 §6.11 十步装配）；UI 层按 §8。
5. 验收阶段：§9.3 总表 → §9.5 自检清单 → §9.8 冒烟序列。

**材料优先级裁决规则**（内容冲突时从高到低）：

| 优先级 | 材料 | 说明 |
| --- | --- | --- |
| 1 | 逐字收录区（§4.1/§2.6/§7.7/§6.4 prompt/§6.1 常量/正则） | 一字不差照抄 |
| 2 | 确定性算例与契约表（§5.5/§5.8/§6.9/§9.8） | 期望值即验收标准 |
| 3 | 函数级规格与伪代码（§6.8/§6.11） | 逻辑等价即可，命名建议保持 |
| 4 | 规格化描述（§7 其余、§8） | 允许实现自由度 |
| 5 | worklog.md（原项目内） | 仅过程参考，与本文档冲突时以本文档为准 |

**三条红线**：① 不得升级 §2.7 列出的禁区依赖版本；② `.env` 只含 DATABASE_URL 占位 + 可选 DEEPSEEK_API_KEY/NEXTAUTH_SECRET（本文档零收录真实密钥，所有 `<占位>` 需自行生成）；③ 方剂.txt 与 db/custom.db 为不可文本化资产，处置方式以 §10.1 为准，不得虚构其内容。

**完成定义**：§9.5 自检清单全项通过 + §9.8 八步冒烟全部符合期望 + `bun run test` 115 用例全绿。

### 10.7 常见重构误区与文档自查记录

**常见重构误区（均为看似合理但与源码不符的写法，重构时勿犯）**：

| # | 误区 | 正确做法（源码事实） |
| --- | --- | --- |
| 1 | 把闯关得分写成 `correct / 正确答案总数` | `score = correct / (correct + missed + wrong)`，多答（wrong）会拉低分母（§6.8.1） |
| 2 | 用字符集合 Jaccard 实现 textSimilarity | 真实实现是编辑距离 DP：`1 - distance/max(lenA,lenB)`；jaccardSimilarity 存在但业务未用（§6.8.1） |
| 3 | 把 streak 拆成独立 lib 文件（如 streak.ts） | bumpStreak 是 api/answer/route.ts 内联私有函数（§6.8.3）；src/lib 只有 8 个文件（§7.1） |
| 4 | 给 checkInHistory 加长度裁剪（如保留 365 条） | 源码无任何裁剪，push `todayStart.toISOString()` 后全量存（§6.8.3） |
| 5 | 用复合唯一键 upsert 操作 UserMastery/DailyPlan | 业务代码统一 findFirst + 显式 create/update，为兼容测试 mock（§6.7） |
| 6 | recite 参考答案取 mnemonic 优先 | `traditionalMnemonic || mnemonic || ""`，传统方歌优先（§6.11 ④） |
| 7 | 凭常识默写 20 章章名/数量 | 必须照抄 parse_mnemonics.py 的 CHAPTER_NAMES 与 TARGET_COUNTS（§4.9，合计 190） |
| 8 | 升级依赖到“更新”版本 | §2.7 禁区：Next 15/React 19/Tailwind 4/zod 3/NextAuth 4 均不得擅升 |
| 9 | 给 F21–F23 占位功能补完实现 | 保持占位现状才算忠实复现（§1.6/§10.3） |
| 10 | 把 normalize 写成剔除标点 | 只去空白 + 小写，**不剔标点**（§6.8.1） |

**文档自查记录（生成日当日执行）**：

| 自查项 | 方法 | 结果 |
| --- | --- | --- |
| §4.1 schema 内嵌行数 = 183 | 代码块内容行计数 | ✅ 183 行，与 prisma/schema.prisma 逐字一致 |
| §5.1 端点数 = src/app/api 下 route.ts 数 | 目录枚举 | ✅ 14 = 14（§8.9 三方对账规则） |
| §2.2 版本表 = package.json | 与 §2.6 逐字全文交叉 | ✅ 一致（69 行全文已内嵌） |
| §4.3 样例 = 3 条完整记录 | 逐字取自文件头部 | ✅ 麻黄汤/桂枝汤/九味羌活汤 |
| 算法常量/正则/prompt 与源码一致 | 回读 match.ts/fsrs.ts/deepseek.ts/parse_mnemonics.py 核对 | ✅ 含 score 公式、编辑距离、CHAPTER_NAMES 等均已按源码修正 |
| 密钥零收录 | 全文检索 | ✅ 仅 .env 本地 sqlite 路径照录（非凭据），其余均 `<占位>` |

**文档维护约定**：

1. 本文档是 **现状快照**（生成日 2026-07-28），不随 worklog.md 自动演进；源码变更后应重新生成或按章增量修订，并更新元信息日期。
2. 修订时的不变量：① 逐字收录区必须与源文件 diff 为空；② §5.1/§8.9 与 route.ts 文件数三方一致；③ §1.2 功能编号只增不改（废弃标 ❌ 不删行）；④ 每章末尾 `<!-- SECTION n END -->` 标记不得移除。
3. 阅读入口：重构执行体从 §10.6 导读开始；人类评审从目录 + §1.2 + §10.2 缺口清单开始。

（全文完）

<!-- SECTION 10 END -->

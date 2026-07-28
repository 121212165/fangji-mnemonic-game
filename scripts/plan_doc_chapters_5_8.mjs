// /home/z/my-project/scripts/plan_doc_chapters_5_8.mjs
// 第 5-8 章：数据表 / FSRS / 技术栈 / API
import { h1, h2, h3, p, pRich, li, liTag, table, tableCaption, spacer } from './plan_doc_helpers.mjs';

// 第五章 完整数据表设计
export function chapter5DataModel() {
  return [
    h1('第五章 完整数据表设计'),

    h2('5.1 数据库选型'),
    p('数据库选用 Neon Postgres——一个 Serverless 架构的 Postgres 托管服务，与 Vercel 原生集成，免费额度对当前用户量（5 至 9 人，预计半年内不超过 100 人）完全够用。Neon 的优势在于：分支功能便于开发测试，按用量计费避免闲置浪费，与 Prisma ORM 配合良好。ORM 选用 Prisma，原因是其类型安全、迁移管理规范、与 Next.js 集成成熟。'),
    p('不选 Supabase 数据库的原因是：虽然原站用了 Supabase，但 Supabase 数据库与 Supabase Auth 深度耦合，且其 RLS（Row Level Security）策略在复杂业务场景下调试困难。新系统只用 NextAuth.js 做认证（不绑定任何数据库），用 Neon 做数据存储，用 Prisma 做数据访问层，三者解耦，灵活性最高。'),

    h2('5.2 完整表清单'),
    p('新系统共设计 9 张表，按职责分为三组：内容表（formulas、formula_categories）、用户行为表（users、user_mastery、user_answer_logs、user_study_sessions、user_streaks）、AI 与计划表（user_daily_plans、ai_conversations）。每张表的字段设计如下。'),

    h3('5.2.1 formula_categories（方剂分类表）'),
    tableCaption('表 5-1  formula_categories 字段设计'),
    table(
      ['字段名', '类型', '说明', '索引'],
      [
        ['id', 'Int (PK)', '分类 ID，自增', '主键'],
        ['name', 'String', '分类名称（如「解表剂」）', '唯一索引'],
        ['description', 'String', '分类描述（如「用于治疗外感表证的方剂」）', '—'],
        ['sort_order', 'Int', '排序权重（1 至 20）', '普通索引'],
        ['formula_count', 'Int', '该分类下方剂数量（冗余字段，加速查询）', '—'],
      ],
      [22, 18, 50, 10]
    ),

    h3('5.2.2 formulas（方剂主表）'),
    p('方剂主表的核心设计点是处理「同名异方」问题——中医方剂中存在大量同名但组成、出处不同的方剂，例如《伤寒论》的「四逆汤」与后世变方「四逆汤」组成可能不同，《温病条辨》的「银翘散」与民间俗称的「银翘散」也可能存在差异。因此方剂表的唯一性不能仅由方名决定，必须引入「出处」字段构成复合唯一键。'),
    tableCaption('表 5-2  formulas 字段设计'),
    table(
      ['字段名', '类型', '说明', '索引'],
      [
        ['id', 'String (PK)', '方剂 ID（slug 形式，如「ma_huang_tang_shanghanlun」）', '主键'],
        ['name', 'String', '方剂名称（如「麻黄汤」），不唯一', '普通索引（非唯一）'],
        ['source', 'String', '出处（如「《伤寒论》」「《温病条辨》」「《太平惠民和剂局方》」）', '复合唯一索引 (name, source)'],
        ['alias', 'String[]', '别名数组（如「四逆散」可含「四逆汤」别名，便于搜索）', 'GIN 索引'],
        ['category_id', 'Int (FK)', '所属分类 ID', '外键索引'],
        ['mnemonic', 'String', '压缩字块（如「妈跪着炒」）', '—'],
        ['mnemonic_explanation', 'String', '压缩字块解释（如「妈(麻黄)+跪(桂枝)…」）', '—'],
        ['traditional_mnemonic', 'Text', '传统方歌（教材标准版）', '全文索引'],
        ['traditional_mnemonic_explanation', 'Text', '传统方歌逐句解释', '—'],
        ['ingredients', 'String[]', '药物组成数组（如 ["麻黄","桂枝","杏仁","甘草"]）', 'GIN 索引'],
        ['functions', 'String', '功用（如「发汗解表，宣肺平喘」）', '—'],
        ['indications', 'Text', '主治（含主症与舌脉）', '—'],
        ['trigger', 'String', '触发关键词（如「身疼无汗」）', '—'],
        ['level', 'String', '难度（一类方/二类方）', '普通索引'],
        ['sort_order', 'Int', '分类内排序权重', '—'],
        ['created_at', 'DateTime', '创建时间', '—'],
        ['updated_at', 'DateTime', '更新时间', '—'],
      ],
      [22, 16, 50, 12]
    ),
    p('同名异方的处理策略分两种情况。其一，常见方剂（如「四逆汤」「理中汤」「桂枝汤」）若不同出处组成相同，合并为一条，source 字段填最早出处，alias 字段记录其他出处名；若不同出处组成不同，作为独立条目存储，display 时加出处后缀以示区分（如「四逆汤（《伤寒论》）」与「四逆汤（《局方》）」）。其二，用户搜索时若输入「四逆汤」，系统返回所有同名方剂列表供用户选择，避免歧义。这一设计确保方剂数据的学术严谨性，也符合考研方剂学的教学惯例。'),

    h3('5.2.3 users（用户表）'),
    p('用户表由 NextAuth.js 接管，Prisma 中只需声明模型用于关联查询，认证逻辑不写入业务代码。核心字段包括：id、email、name、password_hash（由 NextAuth 管理）、study_stage（用户当前学习阶段，枚举值 newbie/intensive/sprint/final）、daily_goal（每日学习目标，默认 10 首）、created_at。study_stage 字段是 AI 每日推荐的关键输入，可由用户手动切换或由系统根据学习时长自动判断。'),

    h3('5.2.4 user_mastery（用户掌握度表）—— FSRS 核心'),
    tableCaption('表 5-3  user_mastery 字段设计（FSRS 算法字段已标★）'),
    table(
      ['字段名', '类型', '说明', '索引'],
      [
        ['id', 'Int (PK)', '记录 ID，自增', '主键'],
        ['user_id', 'String (FK)', '用户 ID', '复合索引 (user_id, formula_id)'],
        ['formula_id', 'String (FK)', '方剂 ID', '复合索引'],
        ['★ stability', 'Float', 'FSRS 稳定性参数（越大越稳定）', '—'],
        ['★ difficulty', 'Float', 'FSRS 难度参数（1-10，越大越难）', '—'],
        ['★ retrievability', 'Float', 'FSRS 可提取性（0-1，当前记忆强度）', '—'],
        ['★ last_review', 'DateTime', '上次复习时间', '普通索引'],
        ['★ due_date', 'DateTime', '下次到期时间（FSRS 计算）', '复合索引 (user_id, due_date)'],
        ['review_count', 'Int', '累计复习次数', '—'],
        ['lapse_count', 'Int', '累计遗忘次数（评为「重来」的次数）', '—'],
        ['last_rating', 'String', '上次评级（again/hard/good/easy）', '—'],
        ['created_at', 'DateTime', '首次学习时间', '—'],
        ['updated_at', 'DateTime', '最近更新时间', '—'],
      ],
      [22, 18, 50, 10]
    ),
    p('user_mastery 是新系统最重要的表——FSRS 算法的所有计算都基于这张表的数据。每次用户答题后，系统根据评级更新 stability/difficulty/retrievability 三个参数，重新计算 due_date。今日学习主页的「今日推荐」就是查询 due_date <= now() 的所有方剂。'),

    h3('5.2.5 user_answer_logs（答题日志表）'),
    tableCaption('表 5-4  user_answer_logs 字段设计'),
    table(
      ['字段名', '类型', '说明', '索引'],
      [
        ['id', 'Int (PK)', '记录 ID', '主键'],
        ['user_id', 'String (FK)', '用户 ID', '复合索引 (user_id, created_at)'],
        ['formula_id', 'String (FK)', '方剂 ID', '普通索引'],
        ['mode', 'String', '答题模式（learn/quiz/recite/asr）', '—'],
        ['question_type', 'String', '题型（ingredients/mnemonic/functions/indications）', '—'],
        ['user_answer', 'Text', '用户答案（文本或 ASR 转写）', '—'],
        ['correct_answer', 'Text', '正确答案（快照，避免方剂更新影响历史）', '—'],
        ['is_correct', 'Boolean', '是否正确', '普通索引'],
        ['match_score', 'Float', '匹配度（0-1，用于模糊评分）', '—'],
        ['time_spent_seconds', 'Int', '答题用时（秒）', '—'],
        ['rating', 'String', '用户主观评级（again/hard/good/easy）', '—'],
        ['ai_feedback_snapshot', 'Json', 'AI 错题复盘快照（避免重复调用）', '—'],
        ['created_at', 'DateTime', '答题时间', '复合索引'],
      ],
      [22, 18, 50, 10]
    ),

    h3('5.2.6 user_daily_plans（每日学习计划表）'),
    p('存储 AI 预生成的每日学习计划，用户打开今日学习主页时直接读取，无需实时调用 AI。字段包括：id、user_id、plan_date（计划日期）、recommended_formulas（JSON 数组，含方剂 ID 与推荐理由）、new_count（新学数量）、review_count（复习数量）、completed_count（已完成数量）、is_completed（是否全部完成）、created_at。Vercel Cron 每日凌晨 3 点为所有活跃用户预生成当日计划。'),

    h3('5.2.7 user_study_sessions（学习会话表）'),
    p('记录用户每次学习会话的元数据，用于统计与画像。字段包括：id、user_id、started_at、ended_at、duration_seconds、formulas_studied（JSON 数组）、mode（学习/闯关/背诵）、correct_count、wrong_count。该表是「学习统计」页面的数据源，也是 AI 错因画像周报的输入之一。'),

    h3('5.2.8 ai_conversations（AI 对话记录表）'),
    p('记录所有 AI 讲解助手的对话历史，用于上下文延续与后续训练。字段包括：id、user_id、formula_id（关联方剂，可为空表示通用对话）、messages（JSON 数组，含 role 与 content）、message_count、total_tokens（累计 token 用量，用于成本控制）、created_at、updated_at。该表也用于 AI 二创口诀、易混对比等场景的对话历史存储。'),

    h3('5.2.9 user_streaks（连续打卡表）'),
    p('记录用户连续打卡天数，是驱动「快乐」感受的核心数据。字段包括：id、user_id、current_streak（当前连续天数）、longest_streak（历史最长）、last_check_in（上次打卡日期）、total_check_ins（累计打卡天数）、check_in_history（JSON 数组，最近 90 天打卡记录）。连续打卡只统计学习时长超过 5 分钟的会话，避免用户秒打卡刷数据。'),

    h2('5.3 关键关系与索引策略'),
    p('表关系描述如下：formula_categories 与 formulas 是一对多；users 与 user_mastery、user_answer_logs、user_daily_plans、user_study_sessions、ai_conversations、user_streaks 都是一对多；formulas 与 user_mastery、user_answer_logs 是一对多（通过 formula_id 关联）。所有外键均建立索引，所有按 user_id 查询的字段建立复合索引。user_mastery 的 (user_id, due_date) 复合索引是今日推荐查询的核心，必须建立。ingredients 字段使用 GIN 索引支持「包含某味药的所有方剂」查询。'),
  ];
}

// 第六章 FSRS
export function chapter6FSRS() {
  return [
    h1('第六章 间隔重复算法（FSRS）集成方案'),

    h2('6.1 为何选择 FSRS'),
    p('间隔重复算法（Spaced Repetition）是记忆类应用的核心引擎。原站使用的「重来/困难/良好/简单」评级本质上是 SM-2 算法的简化版，SM-2 是 1987 年提出的算法，存在两个根本缺陷：第一，难度参数与稳定性参数耦合，导致用户连续答对后无法快速提升稳定性；第二，对「忘记」的处理过于简单，一次忘记就会大幅降低稳定性，不符合真实记忆规律。'),
    p('FSRS（Free Spaced Repetition Scheduler）是 2022 年由开源社区推出的新一代间隔重复算法，被 Anki、Mochi、Andy等主流记忆类应用采用。FSRS 基于认知科学的三参数模型（DSR 模型：Difficulty、Stability、Retriability），通过用户历史答题数据训练个性化参数，预测精度显著优于 SM-2。开源、有论文支撑、有真实用户验证、有 ts-fsrs 等成熟 JS 实现，是新系统的最佳选择。'),

    h2('6.2 FSRS 核心概念'),
    p('FSRS 的核心是三个参数。'),
    pRich([
      { text: '稳定性（Stability, S）：', bold: true },
      { text: '表示记忆的牢固程度，单位是「天」。S=10 意味着如果今天不再复习，10 天后记忆强度会从 100% 衰减到 90%。S 越大记忆越牢固，复习间隔可以越长。' },
    ]),
    pRich([
      { text: '难度（Difficulty, D）：', bold: true },
      { text: '表示该方剂对当前用户的难度，取值 1 至 10。D 越大越难，每次复习时 D 会根据用户评级动态调整。难方剂的复习间隔会被压缩，避免反复忘记。' },
    ]),
    pRich([
      { text: '可提取性（Retriability, R）：', bold: true },
      { text: '表示当前时刻能回忆起该方剂的概率，取值 0 至 1。R 随时间衰减，公式为 R = (1 + t/(9·S))^(-1)，其中 t 是距上次复习的天数。当 R 降到 0.9 时触发复习。' },
    ]),
    p('三个参数相互影响：复习时用户评级高（good/easy），S 上升、D 下降；评级低（again/hard），S 下降或不变、D 上升。FSRS 根据这三个参数计算下次复习时间 due_date，写入 user_mastery 表。'),

    h2('6.3 集成路径'),
    p('FSRS 算法通过 ts-fsrs 库集成（npm 包，TypeScript 原生支持）。架构上分为两层：算法计算在前端完成（ts-fsrs 是纯函数库，无需后端），参数与历史持久化在后端 Neon Postgres。具体流程是：用户答题后，前端从 user_mastery 表读取该方剂的 S/D/R/last_review，调用 ts-fsrs 的 fsrs() 函数计算新的 S/D/R 与下次 due_date，将结果回写到 user_mastery 表。'),
    p('前端集成而非后端集成的原因是：FSRS 计算是纯函数，前端调用响应更快，且减轻后端负载。但参数持久化必须走后端，否则用户换设备会丢失进度。这种「前端计算 + 后端持久化」的架构是 Anki Web、Mochi 等成熟应用的标准做法。'),

    h2('6.4 用户评级映射'),
    p('原站的「重来/困难/良好/简单」四级评级直接映射到 FSRS 的 Rating 枚举，无需用户重新适应。映射关系如下表。'),
    tableCaption('表 6-1  用户评级到 FSRS Rating 的映射'),
    table(
      ['原站评级', 'FSRS Rating', '数值', '含义', '对 S/D 的影响'],
      [
        ['重来', 'Again', '1', '完全忘记，需要重新学习', 'S 大幅下降，D 上升'],
        ['困难', 'Hard', '2', '勉强记得，但费了力气', 'S 小幅下降，D 小幅上升'],
        ['良好', 'Good', '3', '正常回忆，符合预期', 'S 上升，D 不变或小幅下降'],
        ['简单', 'Easy', '4', '轻松回忆，远超预期', 'S 大幅上升，D 下降'],
      ],
      [14, 16, 10, 30, 30]
    ),

    h2('6.5 与原站伪 SRS 的对比'),
    p('原站的「伪 SRS」本质上是按用户主观评级排序——用户评为「重来」的方剂排在前面，「简单」的排在后面，没有任何时间维度。这意味着用户连续三天打开 App 都会看到同样的「重来」方剂，即使第二天其实已经记住了。'),
    p('FSRS 的根本区别在于引入了时间维度——每首方剂都有 due_date 字段，到期才会出现在今日推荐中。一首方剂今天评为「良好」，下次到期可能是 3 天后；评为「简单」，下次到期可能是 7 天后。这种基于时间的调度避免了「过度复习」（已掌握的方剂反复出现浪费时间）与「不足复习」（快要忘记的方剂迟迟不出现导致再次忘记）两个极端，是「效率」原则的核心实现。'),
    p('FSRS 还有一个重要特性是个性化——算法会根据用户历史答题数据训练个性化参数，每个用户的 S/D 模型不同。这意味着同样一首方剂，对记忆能力强的用户可能 7 天后到期，对记忆能力弱的用户可能 3 天后到期，真正实现「千人千面」。'),
  ];
}

// 第七章 技术栈
export function chapter7TechStack() {
  return [
    h1('第七章 技术栈最终方案'),

    h2('7.1 技术栈总表'),
    p('经过对原站技术栈的复盘与对未来扩展需求的预判，新系统技术栈确定如下。所有选型都遵循「成熟稳定、社区活跃、与 Next.js 生态契合」三原则，避免使用过于小众或维护停滞的库。'),
    tableCaption('表 7-1  技术栈最终选型'),
    table(
      ['层级', '技术', '版本', '选型理由'],
      [
        ['前端框架', 'Next.js', '16.x', 'App Router、Server Components、Vercel 原生集成'],
        ['语言', 'TypeScript', '5.x', '类型安全，与 Prisma 配合良好'],
        ['样式', 'Tailwind CSS', 'v4', '原子化 CSS，与原站 Tailwind v3 平滑升级'],
        ['UI 组件库', 'shadcn/ui', 'latest', '基于 Radix UI，可定制性强，不锁定'],
        ['动画', 'Framer Motion', '11.x', '与原站一致，迁移成本低'],
        ['图标', 'Lucide React', '0.x', '与原站一致'],
        ['ORM', 'Prisma', '5.x', '类型安全、迁移管理规范'],
        ['数据库', 'Neon Postgres', 'Serverless', 'Vercel 原生集成、免费额度够用'],
        ['认证', 'NextAuth.js', '4.x', '邮箱密码方案，无外部依赖'],
        ['LLM', 'DeepSeek V4', 'API', '性价比最优，中文中医领域表现稳定'],
        ['间隔重复', 'ts-fsrs', '4.x', 'FSRS 算法的 TypeScript 实现'],
        ['ASR', 'Web Speech API', '浏览器原生', 'Chrome/Edge 支持良好，无需额外 SDK'],
        ['定时任务', 'Vercel Cron', '原生', '每日预生成计划，零配置'],
        ['支付（预留）', '支付宝 SDK', '—', 'V3 阶段接入，预留接口'],
        ['部署', 'Vercel', '—', '一键部署、自动扩容、Edge Network'],
      ],
      [14, 20, 14, 52]
    ),

    h2('7.2 部署架构'),
    p('部署架构非常简洁：Next.js 应用部署在 Vercel（前端 + Route Handler 都跑在 Vercel Edge 或 Node Runtime），数据库使用 Neon Postgres（Serverless 架构，按用量计费），定时任务使用 Vercel Cron（每日凌晨 3 点预生成当日学习计划），文件存储暂不需要（方剂图标等静态资源放 public 目录）。这套架构的优势是「零运维」——Vercel 与 Neon 都自动扩缩容，项目方无需关注服务器、负载均衡、备份等运维问题。'),
    p('DeepSeek API 通过 Route Handler 代理调用，密钥存储在 Vercel 环境变量中，前端永远拿不到。所有 AI 调用日志写入 ai_conversations 表，便于成本监控与异常排查。如果未来 AI 调用量增长，可考虑加入 Redis 缓存高频调用结果（如方剂讲解的常见问题），但 MVP 阶段不需要。'),

    h2('7.3 目录结构草案'),
    p('Next.js 16 App Router 推荐的目录结构如下，遵循「按功能聚合」原则。'),
    li('src/'),
    li('app/', 1),
    li('(auth)/login/page.tsx, register/page.tsx', 2),
    li('(main)/page.tsx                // 今日学习主页', 2),
    li('(main)/formulas/[id]/page.tsx  // 方剂详情页', 2),
    li('(main)/categories/[id]/page.tsx// 分类浏览', 2),
    li('(main)/search/page.tsx         // 全库搜索', 2),
    li('(main)/profile/page.tsx        // 个人中心', 2),
    li('api/', 1),
    li('auth/[...nextauth]/route.ts', 2),
    li('formulas/route.ts, [id]/route.ts', 2),
    li('today-plan/route.ts', 2),
    li('answer/route.ts', 2),
    li('ai/explain/route.ts, contrast/route.ts, asr-check/route.ts', 2),
    li('cron/daily-plan/route.ts       // Vercel Cron 入口', 2),
    li('components/', 1),
    li('ui/                            // shadcn/ui 组件', 2),
    li('formula/                       // 方剂相关组件', 2),
    li('ai/                            // AI 助手组件', 2),
    li('lib/', 1),
    li('db.ts                          // Prisma 客户端单例', 2),
    li('auth.ts                        // NextAuth 配置', 2),
    li('fsrs.ts                        // FSRS 算法封装', 2),
    li('deepseek.ts                    // DeepSeek API 客户端', 2),
    li('prisma/', 1),
    li('schema.prisma                  // 数据模型定义', 2),
    li('migrations/                    // 数据库迁移文件', 2),
    li('public/                        // 静态资源', 1),

    h2('7.4 与原站技术栈的差异及迁移策略'),
    p('与原站相比，新系统的根本差异是从「React SPA + Supabase」迁移到「Next.js 全栈 + Neon Postgres」。这意味着：所有 React 组件需要从 React Router 路由迁移到 App Router 文件路由；所有 Supabase 客户端调用需要重写为 Prisma 客户端调用（通过 Route Handler）；所有用户认证从 Supabase Auth 迁移到 NextAuth.js；所有业务逻辑从前端移到 Route Handler（避免前端持有数据库凭据）。'),
    p('迁移策略是「全部重写，不复用原站代码」——原因是原站代码项目方没有完整获取（部署在无代码平台），即使获取也需要大量改造才能适配新架构，不如从零写更高效。视觉风格 1:1 复刻原站（极简黑白 + 琥珀强调色），但组件实现使用 shadcn/ui 重写，质感会更好。原站的方剂数据通过前述的 C+D 混合策略（AI 生成 + 人工校验）重新构建，不复用原站数据。'),
  ];
}

// 第八章 API 设计
export function chapter8API() {
  return [
    h1('第八章 API 设计草案'),

    h2('8.1 API 分层'),
    p('API 按访问权限与功能分为四层。公开 API 无需认证，主要服务方剂数据查询；认证 API 需要用户登录，处理用户行为数据；AI API 需要认证且限流，代理 DeepSeek 调用；定时任务 API 仅 Vercel Cron 可调用，使用 CRON_SECRET 鉴权。所有 API 返回统一 JSON 格式 { code, data, message }，错误码遵循 HTTP 标准。'),

    h2('8.2 关键端点列表'),

    h3('8.2.1 公开 API'),
    tableCaption('表 8-1  公开 API 端点'),
    table(
      ['方法', '路径', '说明', '响应'],
      [
        ['GET', '/api/formulas', '方剂列表（支持分类、难度、搜索筛选）', '方剂数组'],
        ['GET', '/api/formulas/[id]', '方剂详情', '方剂完整字段'],
        ['GET', '/api/categories', '分类列表', '分类数组'],
      ],
      [10, 30, 40, 20]
    ),

    h3('8.2.2 认证 API'),
    tableCaption('表 8-2  认证 API 端点'),
    table(
      ['方法', '路径', '说明', '请求体', '响应'],
      [
        ['POST', '/api/auth/register', '注册', '{email, password, name}', '用户信息'],
        ['POST', '/api/auth/login', '登录（NextAuth 接管）', '{email, password}', '会话 token'],
        ['GET', '/api/today-plan', '今日学习计划', '—', '推荐方剂 + 进度'],
        ['POST', '/api/answer', '提交答题', '{formula_id, mode, user_answer, rating}', '是否正确 + FSRS 更新'],
        ['GET', '/api/mastery', '我的掌握度', '—', '掌握度分布'],
        ['GET', '/api/stats/weekly', '周报数据', '—', '本周统计'],
        ['GET', '/api/streak', '连续打卡', '—', '当前/最长连击'],
      ],
      [10, 28, 20, 22, 20]
    ),

    h3('8.2.3 AI API'),
    tableCaption('表 8-3  AI API 端点'),
    table(
      ['方法', '路径', '说明', '请求体', '响应'],
      [
        ['POST', '/api/ai/asr-check', 'ASR 背诵评分', '{formula_id, transcript}', '评分 JSON'],
        ['POST', '/api/ai/daily-recommend', '生成每日推荐（内部）', '{user_id}', '推荐方剂 + 理由'],
      ],
      [10, 28, 22, 22, 18]
    ),
    p('AI 讲解助手、错题复盘、易混对比三项 AI 能力已从 MVP 范围移至 V2 阶段（详见第 9 章 9.1 节），对应的 API 端点（/api/ai/explain、/api/ai/contrast）暂不在 MVP 实现。V2 阶段补回时，讲解助手将采用 SSE 流式响应，错题复盘与易混对比采用 JSON 一次性返回。'),

    h3('8.2.4 定时任务 API'),
    p('Vercel Cron 每日凌晨 3 点（UTC+8）调用 /api/cron/daily-plan，为所有活跃用户（最近 7 天有登录）预生成当日学习计划。该端点使用 CRON_SECRET 环境变量鉴权，仅 Vercel Cron 可调用。预生成的计划写入 user_daily_plans 表，用户打开今日学习主页时直接读取，无需实时 AI 调用，保证响应速度。'),

    h2('8.3 错误处理与限流'),
    p(`所有 API 使用统一的错误处理中间件，捕获异常后返回 { code: 4xx/5xx, message: "错误描述" }。AI API 额外加入限流：每用户每分钟最多 10 次 AI 调用，每日最多 100 次，超出返回 429。限流基于 user_id + 时间窗口在内存中计数（Vercel Edge Runtime 的 KV 也可用），MVP 阶段不需要 Redis。`),
    p('AI API 的超时设置为 30 秒（DeepSeek V4 通常 3 至 8 秒返回，留足余量），超时后返回 504 并提示用户重试。所有 AI 调用失败都有降级策略：ASR 评分失败回退到「请重试或改用文本输入」提示；每日推荐失败回退到纯 FSRS 推荐（不加 AI 个性化）。V2 阶段补回讲解助手后，将单独实现 SSE 流式响应与 60 秒超时配置。'),
  ];
}

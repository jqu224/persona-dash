/**
 * 游戏中心注册表：Category（内容分类）× Type（玩法 schema）双维度。
 * - category 按内容划分（心灵驿站/英语练习/技术问答/企业文化/人格测试/益智游戏）
 * - type 按玩法 schema 划分（practice 引导练习 / quiz 答题闯关 / test 人格测试 / puzzle 益智游戏 / toy 互动玩具）
 * 一个入口两个维度正交：如 Wordle = 英语练习 × puzzle。
 * id 同时是最佳成绩的 localStorage 键。
 */
export type GameCategory = '心灵驿站' | '英语练习' | '技术问答' | '企业文化' | '人格测试' | '益智游戏';
export type GameType = 'practice' | 'quiz' | 'test' | 'puzzle' | 'toy';

export interface GameEntry {
  id: string;
  name: string;
  desc: string;
  category: GameCategory;
  type: GameType;
  /** WidgetBody 按此路由到引擎组件 */
  engine: string;
  params?: Record<string, unknown>;
  icon: string;
  ckey: string;
}

export const CATEGORIES: { key: GameCategory; icon: string; blurb: string }[] = [
  { key: '心灵驿站', icon: 'air', blurb: '呼吸、着陆、扫描……跟着做就好的自助练习' },
  { key: '英语练习', icon: 'abc', blurb: 'CET 词库驱动的猜词、拼词与打字' },
  { key: '技术问答', icon: 'code', blurb: 'Agent 通识与互联网常识，答题涨知识' },
  { key: '企业文化', icon: 'groups', blurb: '入职闯关、破冰与提问，内容来自明道云工作表' },
  { key: '人格测试', icon: 'psychology', blurb: 'MBTI / DISC / SBTI / 摸鱼指数' },
  { key: '益智游戏', icon: 'casino', blurb: '经典小游戏引擎 × 参数变体，即点即玩' },
];

export const TYPES: { key: GameType; label: string; icon: string; blurb: string }[] = [
  { key: 'puzzle', label: '益智游戏', icon: 'casino', blurb: '街机 / 棋盘 / 益智引擎与它们的变体' },
  { key: 'quiz', label: '答题闯关', icon: 'psychology', blurb: '选择题闯关，答完出战绩' },
  { key: 'test', label: '人格测试', icon: 'target', blurb: '选项计权重，测完出人格结果' },
  { key: 'practice', label: '引导练习', icon: 'air', blurb: '自动倒计时 / 分步引导的自助练习' },
  { key: 'toy', label: '互动玩具', icon: 'bolt', blurb: '生成式像素玩具与即点即乐的小玩意' },
];

/* ===== 引擎变体批量构造 ===== */
const e = (
  engine: string,
  id: string,
  name: string,
  desc: string,
  icon: string,
  ckey: string,
  params?: Record<string, unknown>,
): GameEntry => ({ id, name, desc, category: '益智游戏', type: 'puzzle', engine, icon, ckey, params });

const SNAKE_STEPS = [
  { id: 'snake-slow', name: '贪吃蛇 · 漫步', ms: 220, wrap: false, desc: '慢节奏热身，新手友好' },
  { id: 'snake-normal', name: '贪吃蛇 · 标准', ms: 140, wrap: false, desc: '经典速度，稳中求长' },
  { id: 'snake-fast', name: '贪吃蛇 · 疾速', ms: 90, wrap: false, desc: '手速开始重要了' },
  { id: 'snake-turbo', name: '贪吃蛇 · 极速', ms: 55, wrap: false, desc: '反应堆级别的刺激' },
  { id: 'snake-wrap', name: '贪吃蛇 · 穿墙', ms: 130, wrap: true, desc: '边界是门，撞了就到对面' },
];

const BREAKOUTS = [
  { id: 'breakout-easy', name: '弹弹球 · 新手', paddle: 96, rows: 3, speed: 2.6, desc: '加长球板 + 少量砖块' },
  { id: 'breakout-normal', name: '弹弹球 · 标准', paddle: 76, rows: 4, speed: 3.2, desc: '经典手感' },
  { id: 'breakout-hard', name: '弹弹球 · 困难', paddle: 58, rows: 5, speed: 3.9, desc: '板短球快，眼疾手快' },
  { id: 'breakout-nightmare', name: '弹弹球 · 噩梦', paddle: 44, rows: 6, speed: 4.6, desc: '文曲星地狱难度复刻' },
];

const TETRIS = [
  { id: 'tetris-casual', name: '俄罗斯方块 · 休闲', ms: 900, desc: '慢速思考型' },
  { id: 'tetris-normal', name: '俄罗斯方块 · 标准', ms: 550, desc: '经典下落速度' },
  { id: 'tetris-sprint', name: '俄罗斯方块 · 竞速', ms: 260, desc: '堆到顶之前尽量消行' },
];

const G2048 = [
  { id: '2048-3', name: '2048 · 3×3', n: 3, desc: '小棋盘，几步就见分晓' },
  { id: '2048-4', name: '2048 · 4×4', n: 4, desc: '经典原版规格' },
  { id: '2048-5', name: '2048 · 5×5', n: 5, desc: '大棋盘，长线经营' },
  { id: '2048-6', name: '2048 · 6×6', n: 6, desc: '巨幕棋盘，极限挑战' },
];

const MEMORY_THEMES: { key: string; name: string; icons: string[] }[] = [
  { key: 'animal', name: '动物', icons: ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐸'] },
  { key: 'food', name: '美食', icons: ['🍎', '🍔', '🍜', '🍣', '🍰', '🍩', '🍕', '🌮'] },
  { key: 'face', name: '表情', icons: ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯'] },
  { key: 'sport', name: '运动', icons: ['⚽', '🏀', '🏓', '🏸', '🎾', '🏐', '🏉', '🥏'] },
  { key: 'plant', name: '植物', icons: ['🌱', '🌳', '🌸', '🌻', '🌵', '🍀', '🌴', '🍁'] },
  { key: 'travel', name: '交通', icons: ['🚗', '🚌', '🚲', '✈️', '🚀', '⛵', '🚂', '🛸'] },
  { key: 'space', name: '太空', icons: ['🌍', '🌙', '⭐', '☄️', '🪐', '🔭', '👽', '🛰️'] },
  { key: 'office', name: '办公', icons: ['💻', '📱', '📎', '🖊️', '📌', '🗂️', '☕', '⏰'] },
];

const LIGHTS = [
  { id: 'lights-3', name: '点灯 · 3 阶', n: 3, desc: '九盏灯，找出全灭的组合' },
  { id: 'lights-4', name: '点灯 · 4 阶', n: 4, desc: '经典规格' },
  { id: 'lights-5', name: '点灯 · 5 阶', n: 5, desc: '需要一点策略了' },
  { id: 'lights-6', name: '点灯 · 6 阶', n: 6, desc: '灯海战术' },
];

const FIFTEEN = [
  { id: 'fifteen-3', name: '数字华容道 · 3×3', n: 3, desc: '八数码，入门首选' },
  { id: 'fifteen-4', name: '数字华容道 · 4×4', n: 4, desc: '经典十五数码' },
  { id: 'fifteen-5', name: '数字华容道 · 5×5', n: 5, desc: '二十四数码，头脑风暴' },
];

const MINES = [
  { id: 'mine-9', name: '扫雷 · 初级', n: 9, mines: 10, desc: '9×9 · 10 雷，首击保护' },
  { id: 'mine-12', name: '扫雷 · 中级', n: 12, mines: 24, desc: '12×12 · 24 雷' },
  { id: 'mine-16', name: '扫雷 · 高级', n: 16, mines: 48, desc: '16×16 · 48 雷，推理狂欢' },
];

const HANOI = [
  { id: 'hanoi-3', name: '汉诺塔 · 3 层', n: 3, desc: '7 步最优，熟悉规则' },
  { id: 'hanoi-4', name: '汉诺塔 · 4 层', n: 4, desc: '15 步最优' },
  { id: 'hanoi-5', name: '汉诺塔 · 5 层', n: 5, desc: '31 步最优' },
  { id: 'hanoi-6', name: '汉诺塔 · 6 层', n: 6, desc: '63 步最优，耐心试炼' },
];

const SIMON = [
  { id: 'simon-4', name: '记忆旋律 · 4 键', n: 4, desc: '经典四色琴键' },
  { id: 'simon-5', name: '记忆旋律 · 5 键', n: 5, desc: '多一色，多一分难度' },
  { id: 'simon-6', name: '记忆旋律 · 6 键', n: 6, desc: '六键全开，听觉记忆拉满' },
];

const WHACKS = [
  { id: 'whack-30', name: '打地鼠 · 30 秒', secs: 30, desc: '半分钟热身局' },
  { id: 'whack-45', name: '打地鼠 · 45 秒', secs: 45, desc: '标准局' },
  { id: 'whack-60', name: '打地鼠 · 60 秒', secs: 60, desc: '满分钟耐力局' },
];

const REACTIONS = [
  { id: 'react-single', name: '手速 · 反应测试', mode: 'single', desc: '变绿那刻立刻点，测反应毫秒' },
  { id: 'react-cps5', name: '手速 · 5 秒连点', mode: 'cps', secs: 5, desc: '5 秒内能点多少下' },
  { id: 'react-cps10', name: '手速 · 10 秒连点', mode: 'cps', secs: 10, desc: '10 秒狂点耐力赛' },
];

const FLOODS = [
  { id: 'flood-10', name: '色块泛滥 · 小盘', n: 10, desc: '10×10，25 步内填满' },
  { id: 'flood-12', name: '色块泛滥 · 中盘', n: 12, desc: '12×12，30 步内填满' },
  { id: 'flood-14', name: '色块泛滥 · 大盘', n: 14, desc: '14×14，36 步内填满' },
];

const COLORFINDS = [
  { id: 'colorfind-4', name: '色彩找不同 · 4 阶', n: 4, desc: '色差明显，热身局' },
  { id: 'colorfind-5', name: '色彩找不同 · 5 阶', n: 5, desc: '需要眯起眼睛了' },
  { id: 'colorfind-6', name: '色彩找不同 · 6 阶', n: 6, desc: '色觉与眼力的极限' },
];

const MATHS = [
  { id: 'math-easy', name: '算术快闪 · 入门', level: 1, desc: '两位数加减，10 题限时' },
  { id: 'math-mid', name: '算术快闪 · 进阶', level: 2, desc: '乘除混搭' },
  { id: 'math-hard', name: '算术快闪 · 大师', level: 3, desc: '混合运算，心算风暴' },
];

const SEQS = [
  { id: 'seq-easy', name: '序列推理 · 入门', level: 1, desc: '等差等比，找规律填数' },
  { id: 'seq-mid', name: '序列推理 · 进阶', level: 2, desc: '平方、斐波那契与混合' },
  { id: 'seq-hard', name: '序列推理 · 大师', level: 3, desc: '交错与递推，烧脑局' },
];

const PONGS = [
  { id: 'pong-casual', name: '乒乓人机 · 休闲', ai: 0.55, desc: 'AI 悠悠球，来回复健' },
  { id: 'pong-rival', name: '乒乓人机 · 竞技', ai: 0.85, desc: 'AI 快拍手，先得 7 分' },
];

const DODGES = [
  { id: 'dodge-casual', name: '陨石躲避 · 休闲', density: 0.6, desc: '陨石稀疏，走位练习' },
  { id: 'dodge-hardcore', name: '陨石躲避 · 硬核', density: 1.5, desc: '弹幕级密度，活得越久分越高' },
];

const SPANS = [
  { id: 'span-digit', name: '数字记忆 · 顺背', mode: 'forward', desc: '记住越来越长的数字串' },
  { id: 'span-reverse', name: '数字记忆 · 倒背', mode: 'reverse', desc: '倒着背出来，难度翻倍' },
];

const SUDOKUS = [
  { id: 'sudoku-4', name: '四宫数独 · 入门', clues: 6, desc: '4×4，规则入门' },
  { id: 'sudoku-4-hard', name: '四宫数独 · 挑战', clues: 4, desc: '提示更少，推理更多' },
];

const WORDLES = [
  { id: 'wordle-5', name: '单词大师 · 五字母', len: 5, desc: '6 次机会猜出 CET 单词' },
  { id: 'wordle-6', name: '单词大师 · 六字母', len: 6, desc: '更长的词，更多的可能' },
];

const TYPINGS = [
  { id: 'typing-words', name: '打字练习 · 单词', mode: 'words', desc: 'CET 高频词连打，计 WPM' },
  { id: 'typing-quote', name: '打字练习 · 金句', mode: 'quote', desc: '整句输入，考验准确率' },
];

/* ===== 汇总注册表（顺序即展示顺序） ===== */
export const GAMES: GameEntry[] = [
  /* --- 心灵驿站（practice） --- */
  { id: 'breathe', name: '方块呼吸', desc: '4-4-4-4 呼吸引导，圆圈缩放跟节奏', category: '心灵驿站', type: 'practice', engine: 'breathe', icon: 'air', ckey: 'cyan' },
  { id: '478', name: '4-7-8 助眠呼吸', desc: '吸 4 秒 · 屏 7 秒 · 呼 8 秒', category: '心灵驿站', type: 'practice', engine: '478', icon: 'snow', ckey: 'teal' },
  { id: 'muscle', name: '握拳放松', desc: '绷紧 5 秒松开 10 秒，自动倒计时', category: '心灵驿站', type: 'practice', engine: 'muscle', icon: 'hand', ckey: 'amber' },
  { id: 'five', name: '54321 着陆', desc: '五感逐一点名，把注意力拉回当下', category: '心灵驿站', type: 'practice', engine: 'five', icon: 'touch', ckey: 'pink' },
  { id: 'mindful', name: '正念数息', desc: '观呼吸数到 8，走神就轻轻拉回', category: '心灵驿站', type: 'practice', engine: 'mindful', icon: 'target', ckey: 'teal' },
  { id: 'scan', name: '身体扫描', desc: '从脚到脸，一个部位一个部位松下来', category: '心灵驿站', type: 'practice', engine: 'scan', icon: 'home', ckey: 'green' },
  { id: 'energy', name: '提神站', desc: '100 张 emoji 像素画，换一张醒一醒', category: '心灵驿站', type: 'practice', engine: 'energy', icon: 'bolt', ckey: 'orange' },

  /* --- 英语练习 --- */
  { id: 'hangman', name: '猜单词', desc: 'CET 英文词库，26 键字母键盘', category: '英语练习', type: 'puzzle', engine: 'hangman', icon: 'abc', ckey: 'lime' },
  ...WORDLES.map(w => ({ id: w.id, name: w.name, desc: w.desc, category: '英语练习' as const, type: 'puzzle' as const, engine: 'wordle', icon: 'abc', ckey: 'green', params: { len: w.len } })),
  ...TYPINGS.map(t => ({ id: t.id, name: t.name, desc: t.desc, category: '英语练习' as const, type: 'puzzle' as const, engine: 'typing', icon: 'code', ckey: 'blue', params: { mode: t.mode } })),
  { id: 'wordquiz', name: '单词速测', desc: 'CET 高频词中英互选，10 题一局', category: '英语练习', type: 'quiz', engine: 'wordquiz', icon: 'book', ckey: 'violet' },

  /* --- 技术问答 --- */
  { id: 'trivia-agent', name: 'Agent 架构通识', desc: '14 题测你的 Agent 认知水平', category: '技术问答', type: 'quiz', engine: 'trivia', icon: 'code', ckey: 'violet', params: { set: 'agent-arch' } },
  { id: 'trivia-history', name: '互联网编年史', desc: '从 ARPANET 到中国接入', category: '技术问答', type: 'quiz', engine: 'trivia', icon: 'trending', ckey: 'red', params: { set: 'internet-history' } },
  { id: 'trivia-edge', name: '互联网边缘问答', desc: '边缘计算小考，5 题快闪', category: '技术问答', type: 'quiz', engine: 'trivia', icon: 'barchart', ckey: 'blue', params: { set: 'internet-edge' } },
  { id: 'fact', name: '冷知识', desc: '抽一条冷知识，涨点奇怪的知识', category: '技术问答', type: 'quiz', engine: 'fact', icon: 'snow', ckey: 'cyan' },

  /* --- 企业文化（内容来自明道云工作表） --- */
  { id: 'quiz', name: '答题闯关', desc: '题库来自明道云「知识测验题库」表', category: '企业文化', type: 'quiz', engine: 'quiz', icon: 'psychology', ckey: 'blue' },
  { id: 'break', name: '破冰话题', desc: '随机一个话题，认识工友也能用', category: '企业文化', type: 'toy', engine: 'break', icon: 'casino', ckey: 'orange' },
  { id: 'bgta', name: 'BGTA 提问生成', desc: '把问题组织成四段式，一次问清楚', category: '企业文化', type: 'toy', engine: 'bgta', icon: 'forum', ckey: 'green' },

  /* --- 人格测试 --- */
  { id: 'test-mbti', name: 'MBTI 16 型人格', desc: '12 道二选一，测出你的四字母人格', category: '人格测试', type: 'test', engine: 'test', icon: 'psychology', ckey: 'purple', params: { test: 'mbti' } },
  { id: 'test-disc', name: 'DISC 职场人格', desc: '20 道四选一，测你在团队里的行为风格', category: '人格测试', type: 'test', engine: 'test', icon: 'groups', ckey: 'blue', params: { test: 'disc' } },
  { id: 'test-sbti', name: 'SBTI 沙雕人格', desc: '干饭/社恐/熬夜/搞钱，16 种沙雕人格', category: '人格测试', type: 'test', engine: 'test', icon: 'casino', ckey: 'yellow', params: { test: 'sbti' } },
  { id: 'test-work', name: '职场摸鱼指数', desc: '8 道题，测测你的带薪快乐浓度', category: '人格测试', type: 'test', engine: 'test', icon: 'schedule', ckey: 'orange', params: { test: 'work' } },

  /* --- 益智游戏：街机 --- */
  ...SNAKE_STEPS.map(s => e('snake', s.id, s.name, s.desc, 'code', 'green', { ms: s.ms, wrap: s.wrap })),
  ...BREAKOUTS.map(b => e('breakout', b.id, b.name, b.desc, 'widgets', 'orange', { paddle: b.paddle, rows: b.rows, speed: b.speed })),
  ...TETRIS.map(t => e('tetris', t.id, t.name, t.desc, 'widgets', 'violet', { ms: t.ms })),
  ...PONGS.map(p => e('pong', p.id, p.name, p.desc, 'send', 'cyan', { ai: p.ai })),
  ...DODGES.map(d => e('dodge', d.id, d.name, d.desc, 'bolt', 'red', { density: d.density })),

  /* --- 益智游戏：棋盘/推理 --- */
  ...G2048.map(g => e('g2048', g.id, g.name, g.desc, 'barchart', 'yellow', { n: g.n })),
  ...MEMORY_THEMES.flatMap(m => [
    e('memory', `memory-${m.key}-8`, `记忆翻牌 · ${m.name}`, `8 对 ${m.name}图案，翻出全部配对`, 'brush', 'pink', { theme: m.key, pairs: 8 }),
    e('memory', `memory-${m.key}-12`, `记忆翻牌 · ${m.name} · 大`, `12 对 ${m.name}图案，记性大考`, 'brush', 'purple', { theme: m.key, pairs: 12 }),
  ]),
  ...LIGHTS.map(l => e('lights', l.id, l.name, l.desc, 'light_mode', 'amber', { n: l.n })),
  ...FIFTEEN.map(f => e('fifteen', f.id, f.name, f.desc, 'schedule', 'teal', { n: f.n })),
  ...MINES.map(m => e('mines', m.id, m.name, m.desc, 'target', 'red', { n: m.n, mines: m.mines })),
  ...FLOODS.map(f => e('flood', f.id, f.name, f.desc, 'palette', 'cyan', { n: f.n })),
  ...SUDOKUS.map(s => e('sudoku4', s.id, s.name, s.desc, 'folder', 'blue', { clues: s.clues })),
  ...COLORFINDS.map(c => e('colorfind', c.id, c.name, c.desc, 'palette', 'green', { n: c.n })),

  /* --- 益智游戏：脑力/记忆 --- */
  ...HANOI.map(h => e('hanoi', h.id, h.name, h.desc, 'folder', 'indigo', { n: h.n })),
  ...SIMON.map(s => e('simon', s.id, s.name, s.desc, 'chatbubble', 'violet', { n: s.n })),
  ...MATHS.map(m => e('math', m.id, m.name, m.desc, 'barchart', 'orange', { level: m.level })),
  ...SEQS.map(s => e('seq', s.id, s.name, s.desc, 'trending', 'blue', { level: s.level })),
  ...SPANS.map(s => e('span', s.id, s.name, s.desc, 'psychology', 'teal', { mode: s.mode })),

  /* --- 益智游戏：反应 --- */
  ...WHACKS.map(w => e('whack', w.id, w.name, w.desc, 'hand', 'amber', { secs: w.secs })),
  ...REACTIONS.map(r => e('reaction', r.id, r.name, r.desc, 'bolt', 'yellow', { mode: r.mode, secs: r.secs })),

  /* --- 益智游戏：孔明棋 --- */
  e('peg', 'peg-classic', '孔明棋 · 经典十字', '33 孔欧式棋盘，跳吃剩越少越强', 'check', 'green', undefined),

  /* --- 互动玩具 --- */
  { id: 'ball', name: '变形球', desc: '万花筒/海螺/五角星……转 90°、放大缩小', category: '益智游戏', type: 'toy', engine: 'ball', icon: 'casino', ckey: 'cyan' },
  { id: 'rps', name: '石头剪刀布', desc: '和 AI 来一局，战绩实时累计', category: '益智游戏', type: 'toy', engine: 'rps', icon: 'hand', ckey: 'yellow' },
];

export const GAME_COUNT = GAMES.length;

export function gameById(id: string): GameEntry | undefined {
  return GAMES.find(g => g.id === id);
}

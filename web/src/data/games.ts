/**
 * 游戏中心注册表：Category（内容分类）× Type（玩法 schema）双维度。
 * 一游戏一入口；同类变体（难度/棋盘/主题）不单列卡片，
 * 而是作为 variants 挂在入口里，由游戏弹窗内的选项条切换（见 WidgetBody EngineHost）。
 * id（或 id:variantId）是最佳成绩的 localStorage 键。
 */
export type GameCategory = '心灵驿站' | '英语练习' | '技术问答' | '企业文化' | '人格测试' | '益智游戏';
export type GameType = 'practice' | 'quiz' | 'test' | 'puzzle' | 'toy';

export interface GameVariant {
  id: string;
  label: string;
  params?: Record<string, unknown>;
}

export interface GameEntry {
  id: string;
  name: string;
  desc: string;
  category: GameCategory;
  type: GameType;
  /** WidgetBody 按此路由到引擎组件 */
  engine: string;
  /** 默认参数（无 variants 时生效） */
  params?: Record<string, unknown>;
  /** 同游戏内的可选变体（难度/棋盘/主题/题库），弹窗内选项条切换 */
  variants?: GameVariant[];
  icon: string;
  ckey: string;
}

export const CATEGORIES: { key: GameCategory; icon: string; blurb: string }[] = [
  { key: '心灵驿站', icon: 'air', blurb: '呼吸、着陆、扫描……跟着做就好的自助练习' },
  { key: '英语练习', icon: 'abc', blurb: 'CET 词库驱动的猜词、拼词与打字' },
  { key: '技术问答', icon: 'code', blurb: 'Agent 通识与互联网常识，答题涨知识' },
  { key: '企业文化', icon: 'groups', blurb: '入职闯关、破冰与提问，内容来自明道云工作表' },
  { key: '人格测试', icon: 'psychology', blurb: 'MBTI / DISC / SBTI / 摸鱼指数' },
  { key: '益智游戏', icon: 'casino', blurb: '经典小游戏引擎，难度与玩法在游戏内切换' },
];

export const TYPES: { key: GameType; label: string; icon: string; blurb: string }[] = [
  { key: 'puzzle', label: '益智游戏', icon: 'casino', blurb: '街机 / 棋盘 / 益智引擎，难度在游戏内选' },
  { key: 'quiz', label: '答题闯关', icon: 'psychology', blurb: '选择题闯关，答完出战绩' },
  { key: 'test', label: '人格测试', icon: 'target', blurb: '选项计权重，测完出人格结果' },
  { key: 'practice', label: '引导练习', icon: 'air', blurb: '自动倒计时 / 分步引导的自助练习' },
  { key: 'toy', label: '互动玩具', icon: 'bolt', blurb: '生成式像素玩具与即点即乐的小玩意' },
];

/* ===== 注册表 ===== */
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
  {
    id: 'wordle', name: '单词大师', desc: 'Wordle 式猜词，颜色反馈提示',
    category: '英语练习', type: 'puzzle', engine: 'wordle', icon: 'abc', ckey: 'green',
    variants: [
      { id: 'w5', label: '五字母', params: { len: 5 } },
      { id: 'w6', label: '六字母', params: { len: 6 } },
    ],
  },
  {
    id: 'typing', name: '打字练习', desc: '照打计 WPM 与准确率',
    category: '英语练习', type: 'puzzle', engine: 'typing', icon: 'code', ckey: 'blue',
    variants: [
      { id: 'words', label: '单词', params: { mode: 'words' } },
      { id: 'quote', label: '金句', params: { mode: 'quote' } },
    ],
  },
  { id: 'wordquiz', name: '单词速测', desc: 'CET 高频词中英互选，10 题一局', category: '英语练习', type: 'quiz', engine: 'wordquiz', icon: 'book', ckey: 'violet' },

  /* --- 技术问答（feishu-ai 通用题库，飞书/字节专属不收） --- */
  {
    id: 'trivia', name: '技术问答', desc: 'Agent 通识与互联网常识，答完出称号',
    category: '技术问答', type: 'quiz', engine: 'trivia', icon: 'code', ckey: 'violet',
    params: { set: 'agent-arch' },
    variants: [
      { id: 'agent', label: 'Agent 架构', params: { set: 'agent-arch' } },
      { id: 'history', label: '互联网编年史', params: { set: 'internet-history' } },
      { id: 'edge', label: '互联网边缘', params: { set: 'internet-edge' } },
    ],
  },
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
  {
    id: 'snake', name: '贪吃蛇', desc: '方向键/滑动控制，吃食变长',
    category: '益智游戏', type: 'puzzle', engine: 'snake', icon: 'code', ckey: 'green',
    params: { ms: 140, wrap: false },
    variants: [
      { id: 'slow', label: '漫步', params: { ms: 220, wrap: false } },
      { id: 'normal', label: '标准', params: { ms: 140, wrap: false } },
      { id: 'fast', label: '疾速', params: { ms: 90, wrap: false } },
      { id: 'turbo', label: '极速', params: { ms: 55, wrap: false } },
      { id: 'wrap', label: '穿墙', params: { ms: 130, wrap: true } },
    ],
  },
  {
    id: 'breakout', name: '弹弹球', desc: '接住球，打光所有砖块',
    category: '益智游戏', type: 'puzzle', engine: 'breakout', icon: 'widgets', ckey: 'orange',
    params: { paddle: 76, rows: 4, speed: 3.2 },
    variants: [
      { id: 'easy', label: '新手', params: { paddle: 96, rows: 3, speed: 2.6 } },
      { id: 'normal', label: '标准', params: { paddle: 76, rows: 4, speed: 3.2 } },
      { id: 'hard', label: '困难', params: { paddle: 58, rows: 5, speed: 3.9 } },
      { id: 'nm', label: '噩梦', params: { paddle: 44, rows: 6, speed: 4.6 } },
    ],
  },
  {
    id: 'tetris', name: '俄罗斯方块', desc: '移动 · 旋转 · 消行得分',
    category: '益智游戏', type: 'puzzle', engine: 'tetris', icon: 'widgets', ckey: 'violet',
    params: { ms: 550 },
    variants: [
      { id: 'casual', label: '休闲', params: { ms: 900 } },
      { id: 'normal', label: '标准', params: { ms: 550 } },
      { id: 'sprint', label: '竞速', params: { ms: 260 } },
    ],
  },
  {
    id: 'pong', name: '乒乓人机', desc: '上下移动球拍，先得 7 分者胜',
    category: '益智游戏', type: 'puzzle', engine: 'pong', icon: 'send', ckey: 'cyan',
    params: { ai: 0.55 },
    variants: [
      { id: 'casual', label: '休闲', params: { ai: 0.55 } },
      { id: 'rival', label: '竞技', params: { ai: 0.85 } },
    ],
  },
  {
    id: 'dodge', name: '陨石躲避', desc: '移动小点躲开落下的陨石，活得越久分越高',
    category: '益智游戏', type: 'puzzle', engine: 'dodge', icon: 'bolt', ckey: 'red',
    params: { density: 1 },
    variants: [
      { id: 'casual', label: '休闲', params: { density: 0.6 } },
      { id: 'hardcore', label: '硬核', params: { density: 1.5 } },
    ],
  },

  /* --- 益智游戏：棋盘/推理 --- */
  {
    id: 'g2048', name: '2048', desc: '滑动合并相同数字，冲 2048',
    category: '益智游戏', type: 'puzzle', engine: 'g2048', icon: 'barchart', ckey: 'yellow',
    params: { n: 4 },
    variants: [
      { id: 'n3', label: '3×3', params: { n: 3 } },
      { id: 'n4', label: '4×4', params: { n: 4 } },
      { id: 'n5', label: '5×5', params: { n: 5 } },
      { id: 'n6', label: '6×6', params: { n: 6 } },
    ],
  },
  {
    id: 'memory', name: '记忆翻牌', desc: '翻出全部成对图案，翻牌次数越少越强',
    category: '益智游戏', type: 'puzzle', engine: 'memory', icon: 'brush', ckey: 'pink',
    params: { theme: 'animal', pairs: 8 },
    variants: [
      { id: 'animal', label: '动物', params: { theme: 'animal', pairs: 8 } },
      { id: 'food', label: '美食', params: { theme: 'food', pairs: 8 } },
      { id: 'face', label: '表情', params: { theme: 'face', pairs: 8 } },
      { id: 'sport', label: '运动', params: { theme: 'sport', pairs: 8 } },
      { id: 'plant', label: '植物', params: { theme: 'plant', pairs: 8 } },
      { id: 'travel', label: '交通', params: { theme: 'travel', pairs: 8 } },
      { id: 'space', label: '太空', params: { theme: 'space', pairs: 8 } },
      { id: 'office', label: '办公', params: { theme: 'office', pairs: 8 } },
    ],
  },
  {
    id: 'lights', name: '点灯', desc: '点一盏翻转十字，全部熄灭即胜',
    category: '益智游戏', type: 'puzzle', engine: 'lights', icon: 'light_mode', ckey: 'amber',
    params: { n: 4 },
    variants: [
      { id: 'n3', label: '3 阶', params: { n: 3 } },
      { id: 'n4', label: '4 阶', params: { n: 4 } },
      { id: 'n5', label: '5 阶', params: { n: 5 } },
      { id: 'n6', label: '6 阶', params: { n: 6 } },
    ],
  },
  {
    id: 'fifteen', name: '数字华容道', desc: '滑动数字块排成顺序',
    category: '益智游戏', type: 'puzzle', engine: 'fifteen', icon: 'schedule', ckey: 'teal',
    params: { n: 4 },
    variants: [
      { id: 'n3', label: '3×3', params: { n: 3 } },
      { id: 'n4', label: '4×4', params: { n: 4 } },
      { id: 'n5', label: '5×5', params: { n: 5 } },
    ],
  },
  {
    id: 'mines', name: '扫雷', desc: '左键翻开 · 右键插旗，首击保护',
    category: '益智游戏', type: 'puzzle', engine: 'mines', icon: 'target', ckey: 'red',
    params: { n: 9, mines: 10 },
    variants: [
      { id: 'easy', label: '初级', params: { n: 9, mines: 10 } },
      { id: 'mid', label: '中级', params: { n: 12, mines: 24 } },
      { id: 'hard', label: '高级', params: { n: 16, mines: 48 } },
    ],
  },
  {
    id: 'flood', name: '色块泛滥', desc: '从左上角开始，限步数把整盘填成同色',
    category: '益智游戏', type: 'puzzle', engine: 'flood', icon: 'palette', ckey: 'cyan',
    params: { n: 12 },
    variants: [
      { id: 's', label: '小盘', params: { n: 10 } },
      { id: 'm', label: '中盘', params: { n: 12 } },
      { id: 'l', label: '大盘', params: { n: 14 } },
    ],
  },
  {
    id: 'sudoku4', name: '四宫数独', desc: '每行每列每宫 1-4 不重复',
    category: '益智游戏', type: 'puzzle', engine: 'sudoku4', icon: 'folder', ckey: 'blue',
    params: { clues: 6 },
    variants: [
      { id: 'easy', label: '入门', params: { clues: 6 } },
      { id: 'hard', label: '挑战', params: { clues: 4 } },
    ],
  },
  {
    id: 'colorfind', name: '色彩找不同', desc: '找到颜色不一样的那块，色差越来越小',
    category: '益智游戏', type: 'puzzle', engine: 'colorfind', icon: 'palette', ckey: 'green',
    params: { n: 4 },
    variants: [
      { id: 'n4', label: '4 阶', params: { n: 4 } },
      { id: 'n5', label: '5 阶', params: { n: 5 } },
      { id: 'n6', label: '6 阶', params: { n: 6 } },
    ],
  },

  /* --- 益智游戏：脑力/记忆 --- */
  {
    id: 'hanoi', name: '汉诺塔', desc: '把整摞移到最右柱，大盘不能压小盘',
    category: '益智游戏', type: 'puzzle', engine: 'hanoi', icon: 'folder', ckey: 'indigo',
    params: { n: 3 },
    variants: [
      { id: 'n3', label: '3 层', params: { n: 3 } },
      { id: 'n4', label: '4 层', params: { n: 4 } },
      { id: 'n5', label: '5 层', params: { n: 5 } },
      { id: 'n6', label: '6 层', params: { n: 6 } },
    ],
  },
  {
    id: 'simon', name: '记忆旋律', desc: '跟着亮的键按，一轮比一轮长',
    category: '益智游戏', type: 'puzzle', engine: 'simon', icon: 'chatbubble', ckey: 'violet',
    params: { n: 4 },
    variants: [
      { id: 'k4', label: '4 键', params: { n: 4 } },
      { id: 'k5', label: '5 键', params: { n: 5 } },
      { id: 'k6', label: '6 键', params: { n: 6 } },
    ],
  },
  {
    id: 'math', name: '算术快闪', desc: '10 题限时心算，越快越准分越高',
    category: '益智游戏', type: 'puzzle', engine: 'math', icon: 'barchart', ckey: 'orange',
    params: { level: 1 },
    variants: [
      { id: 'l1', label: '入门', params: { level: 1 } },
      { id: 'l2', label: '进阶', params: { level: 2 } },
      { id: 'l3', label: '大师', params: { level: 3 } },
    ],
  },
  {
    id: 'seq', name: '序列推理', desc: '找规律填数，8 题见真章',
    category: '益智游戏', type: 'puzzle', engine: 'seq', icon: 'trending', ckey: 'blue',
    params: { level: 1 },
    variants: [
      { id: 'l1', label: '入门', params: { level: 1 } },
      { id: 'l2', label: '进阶', params: { level: 2 } },
      { id: 'l3', label: '大师', params: { level: 3 } },
    ],
  },
  {
    id: 'span', name: '数字记忆', desc: '记住数字串再输入，越来越长',
    category: '益智游戏', type: 'puzzle', engine: 'span', icon: 'psychology', ckey: 'teal',
    params: { mode: 'forward' },
    variants: [
      { id: 'f', label: '顺背', params: { mode: 'forward' } },
      { id: 'r', label: '倒背', params: { mode: 'reverse' } },
    ],
  },

  /* --- 益智游戏：反应 --- */
  {
    id: 'whack', name: '打地鼠', desc: '限时点中地鼠，手眼协调热身',
    category: '益智游戏', type: 'puzzle', engine: 'whack', icon: 'hand', ckey: 'amber',
    params: { secs: 30 },
    variants: [
      { id: 's30', label: '30 秒', params: { secs: 30 } },
      { id: 's45', label: '45 秒', params: { secs: 45 } },
      { id: 's60', label: '60 秒', params: { secs: 60 } },
    ],
  },
  {
    id: 'reaction', name: '手速挑战', desc: '反应毫秒与连点 CPS',
    category: '益智游戏', type: 'puzzle', engine: 'reaction', icon: 'bolt', ckey: 'yellow',
    params: { mode: 'single' },
    variants: [
      { id: 'single', label: '反应', params: { mode: 'single' } },
      { id: 'cps5', label: '5 秒连点', params: { mode: 'cps', secs: 5 } },
      { id: 'cps10', label: '10 秒连点', params: { mode: 'cps', secs: 10 } },
    ],
  },

  /* --- 益智游戏：孔明棋与互动玩具 --- */
  { id: 'peg', name: '孔明棋', desc: '跳吃相邻棋子，剩得越少越强', category: '益智游戏', type: 'puzzle', engine: 'peg', icon: 'check', ckey: 'green' },
  { id: 'ball', name: '变形球', desc: '万花筒/海螺/五角星……转 90°、放大缩小', category: '益智游戏', type: 'toy', engine: 'ball', icon: 'casino', ckey: 'cyan' },
  { id: 'rps', name: '石头剪刀布', desc: '和 AI 来一局，战绩实时累计', category: '益智游戏', type: 'toy', engine: 'rps', icon: 'hand', ckey: 'yellow' },
];

export const GAME_COUNT = GAMES.length;

export function gameById(id: string): GameEntry | undefined {
  return GAMES.find(g => g.id === id);
}

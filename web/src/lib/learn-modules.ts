import { capabilityClient, logger } from '@/lib/platform';

import type { LearningModuleTextToJsonOneOutput } from '@shared/plugin-types';

/* ===== 类型 ===== */

/** 背单词词条（艾宾浩斯遗忘曲线调度） */
export interface IVocabItem {
  id: string;
  word: string;
  translation: string;
  /** 已连续答对次数（0 = 还没学过） */
  stage: number;
  /** 下次到期日（YYYY-MM-DD） */
  nextDue: string;
  /** 答错次数 */
  wrong: number;
}

/** 测试题（第 1 天 / 24h / 48h / 1 周 / 1 个月滚动复习） */
export interface IQuizItem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  stage: number;
  nextDue: string;
  wrong: number;
}

export type IModuleItem = IVocabItem | IQuizItem;

export interface IUserModule {
  id: string;
  type: 'vocabulary' | 'quiz';
  title: string;
  createdAt: number;
  items: IModuleItem[];
}

/* ===== 调度（rolling window） ===== */

/**
 * 复习间隔（天）：
 * - 背单词：艾宾浩斯遗忘曲线，学完后第 1 / 2 / 4 / 7 / 15 天各复习一次；
 * - 测试：用户指定节奏 —— 第 1 天（当天）、24 小时、48 小时、1 周、1 个月，
 *   换算成"答对后距下一次的天数"= [1, 1, 5, 23]。
 * stage 从 0 开始：stage = 已通过的复习次数；stage 走满 GAPS.length 即毕业出窗。
 */
export const GAPS: Record<IUserModule['type'], number[]> = {
  vocabulary: [1, 2, 4, 7, 15],
  quiz: [1, 1, 5, 23],
};

export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

export function isMastered(item: IModuleItem): boolean {
  return item.stage >= GAPS[moduleKind(item)].length;
}

export function moduleKind(item: IModuleItem): 'vocabulary' | 'quiz' {
  return 'word' in item ? 'vocabulary' : 'quiz';
}

/** 今日到期（rolling window）：未毕业 且 nextDue ≤ 今天 */
export function isDue(item: IModuleItem, today = todayStr()): boolean {
  return !isMastered(item) && item.nextDue <= today;
}

/** 答题后推进调度：答对 → 下一间隔；答错 → 回到第 1 天、明天重现 */
export function advance(item: IModuleItem, correct: boolean): IModuleItem {
  const gaps = GAPS[moduleKind(item)];
  const today = todayStr();
  if (correct) {
    const nextStage = item.stage + 1;
    if (nextStage > gaps.length) return item; // 已毕业
    const nextDue = addDays(today, gaps[item.stage]);
    return { ...item, stage: nextStage, nextDue };
  }
  return { ...item, stage: 0, nextDue: addDays(today, 1), wrong: item.wrong + 1 };
}

export function moduleStats(m: IUserModule) {
  const total = m.items.length;
  const due = m.items.filter(i => isDue(i)).length;
  const mastered = m.items.filter(i => isMastered(i)).length;
  return { total, due, mastered, pct: total > 0 ? Math.round((mastered / total) * 100) : 0 };
}

/* ===== 一句话生成（AI 插件 + 本地兜底） ===== */

const MODULE_PLUGIN_ID = 'learning_module_text_to_json_1';

function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** 插件输出 → 规范化模块（过滤非法条目） */
function normalize(type: string, title: string, raw: unknown[]): IUserModule | null {
  const t: IUserModule['type'] = type === 'quiz' ? 'quiz' : 'vocabulary';
  const today = todayStr();
  const items: IModuleItem[] = [];
  for (const r of raw) {
    if (typeof r !== 'object' || r === null) continue;
    const o = r as Record<string, unknown>;
    if (t === 'vocabulary') {
      const word = typeof o.word === 'string' ? o.word.trim() : '';
      const translation = typeof o.translation === 'string' ? o.translation.trim() : '';
      if (word && translation) {
        items.push({ id: uid('w'), word, translation, stage: 0, nextDue: today, wrong: 0 });
      }
    } else {
      const question = typeof o.question === 'string' ? o.question.trim() : '';
      const options = Array.isArray(o.options) ? o.options.map(String).filter(Boolean) : [];
      const answer = typeof o.answer === 'string' ? o.answer.trim() : '';
      if (question && options.length >= 2 && options.includes(answer)) {
        items.push({ id: uid('q'), question, options, answer, stage: 0, nextDue: today, wrong: 0 });
      }
    }
  }
  if (items.length === 0) return null;
  return { id: uid('mod'), type: t, title: title.trim() || (t === 'quiz' ? '知识测试' : '背单词'), createdAt: Date.now(), items };
}

/* 本地兜底：AI 不可用时按关键词生成演示模块 */
const FALLBACK_WORDS: Array<[string, string]> = [
  ['onboarding', '入职引导；新员工融入流程'],
  ['deliverable', '可交付成果'],
  ['milestone', '里程碑'],
  ['alignment', '对齐（目标/口径一致）'],
  ['stakeholder', '利益相关方'],
  ['retrospective', '复盘会；回顾总结'],
];

const FALLBACK_QUIZ: Array<{ question: string; options: string[]; answer: string }> = [
  { question: '入职第 1 天应该优先完成什么？', options: ['领电脑与开账号', '直接写代码', '约客户开会', '提交年假申请'], answer: '领电脑与开账号' },
  { question: '遇到问题最快的求助路径是？', options: ['先自己憋 3 天', '查知识库 + 问导师', '发朋友圈', '给 CEO 写邮件'], answer: '查知识库 + 问导师' },
  { question: '代码提交前必须做什么？', options: ['自测 + 走 MR 评审', '直接 push master', '关掉电脑', '什么都不做'], answer: '自测 + 走 MR 评审' },
  { question: '团队周会一般用来做什么？', options: ['同步进展与风险', '补觉', '看电影', '订下午茶'], answer: '同步进展与风险' },
  { question: '新需求上线前需要经过？', options: ['测试 + 发布平台审批', '口头确认即可', '跳过所有检查', '先上线再补文档'], answer: '测试 + 发布平台审批' },
];

function fallbackModule(requirement: string): IUserModule {
  const text = requirement.toLowerCase();
  const wantQuiz = /测|考|题|quiz/.test(text);
  const today = todayStr();
  if (wantQuiz) {
    return {
      id: uid('mod'),
      type: 'quiz',
      title: '入职知识测试（离线演示题）',
      createdAt: Date.now(),
      items: FALLBACK_QUIZ.map(q => ({ id: uid('q'), ...q, stage: 0, nextDue: today, wrong: 0 })),
    };
  }
  return {
    id: uid('mod'),
    type: 'vocabulary',
    title: '职场英语背单词（离线演示词库）',
    createdAt: Date.now(),
    items: FALLBACK_WORDS.map(([word, translation]) => ({ id: uid('w'), word, translation, stage: 0, nextDue: today, wrong: 0 })),
  };
}

/** 一句话 → 学习模块。AI 插件失败时回退本地种子，保证入口永远可用 */
export async function generateModule(requirement: string): Promise<{ module: IUserModule; byAI: boolean }> {
  const req = requirement.trim();
  if (!req) throw new Error('请先输入一句话描述你想要的模块');
  try {
    const out = await capabilityClient
      .load(MODULE_PLUGIN_ID)
      .call<LearningModuleTextToJsonOneOutput>('textToJson', { module_requirement: req });
    const mod = normalize(out?.module_type, out?.title ?? '', Array.isArray(out?.items) ? out.items : []);
    if (mod) return { module: mod, byAI: true };
    logger.warn('模块生成结果为空，使用本地兜底');
  } catch (error) {
    logger.error('AI 生成模块失败，走本地兜底:', String(error));
  }
  return { module: fallbackModule(req), byAI: false };
}

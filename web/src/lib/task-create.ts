import { capabilityClient, logger } from '@/lib/platform';

import type { TaskAutoSplitTextToJsonOneOutput } from '@shared/plugin-types';

/* ===== 任务分类体系 ===== */

export const TASK_CATEGORIES = ['前端项目', '后端项目', '财务', '法务', '数据', '全站'] as const;

export const SUB_HINTS: Record<string, string[]> = {
  前端项目: ['组件库', '活动页', '性能优化', '前端基建'],
  后端项目: ['API', '数据库', '服务治理', '部署'],
  财务: ['报销', '预算', '对账', '发票'],
  法务: ['合同', '合规', '知识产权', '审查'],
  数据: ['看板', '埋点', '清洗', '报表'],
  全站: ['通用'],
};

/** 插件实例：入职任务多维表格（新增/更新记录）· 任务自动拆分 · 参考图描述 */
const PLUGIN = {
  bitable: 'feishu_bitable_onboarding_task_read_1',
  split: 'task_auto_split_text_to_json_1',
  imageDesc: 'ai_image_reference_task_description_1',
};

export interface ISubtask {
  title: string;
  note: string;
}

/* ===== 任务标题编号（按分类自动升序） ===== */

const USER_TITLE_RE = /^(前端项目|后端项目|财务|法务|数据|全站)\s(\d+)\s*·/;

/** 判断一条看板任务是否为「+」号创建的用户任务（标题形如「数据 2 · xxx」） */
export function isUserTaskTitle(title: string): boolean {
  return USER_TITLE_RE.test(title);
}

export function parseTaskCode(title: string): { cat: string; num: number } | null {
  const m = title.match(USER_TITLE_RE);
  return m ? { cat: m[1], num: Number(m[2]) } : null;
}

/** 该分类下的下一个编号：已有「数据 1」则返回 2（支持自定义分类） */
export function nextTaskNumber(titles: string[], category: string): number {
  const re = new RegExp(
    `^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s(\\d+)\\s*·`,
  );
  let max = 0;
  for (const t of titles) {
    const m = t.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

export function taskDisplayTitle(category: string, num: number, name: string): string {
  return `${category} ${num} · ${name}`;
}

/* ===== 子任务：同一背景的任务收敛在同一条飞书记录（同一段描述）里 ===== */

export const SUBTASK_MARK = '子任务：';

export function buildTaskDescription(
  description: string,
  subtasks: ISubtask[],
  category: string,
  subcategory: string,
): string {
  const head = description.trim() || '（描述待补充）';
  const meta = `分类：${category}${subcategory ? ` / ${subcategory}` : ''} · 来源：工作台快速创建`;
  if (subtasks.length === 0) return `${head}\n\n${meta}`;
  const lines = subtasks.map(s => `□ ${s.title}${s.note ? ` —— ${s.note}` : ''}`);
  return `${head}\n\n${meta}\n${SUBTASK_MARK}\n${lines.join('\n')}`;
}

export interface ISubtaskRow {
  title: string;
  done: boolean;
}

export function parseSubtasks(desc: string): ISubtaskRow[] {
  const idx = desc.indexOf(SUBTASK_MARK);
  if (idx < 0) return [];
  return desc
    .slice(idx + SUBTASK_MARK.length)
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^[□☑]\s/.test(l))
    .map(l => ({ done: l.startsWith('☑'), title: l.slice(2).split(' —— ')[0].trim() }))
    .filter(s => s.title.length > 0);
}

/** 描述正文（去掉子任务清单段） */
export function stripSubtasks(desc: string): string {
  const idx = desc.indexOf(SUBTASK_MARK);
  return (idx < 0 ? desc : desc.slice(0, idx)).trim();
}

/** 勾选/取消第 i 条子任务，返回新的完整描述（用于写回明道云） */
export function toggleSubtaskLine(desc: string, target: number): string {
  const idx = desc.indexOf(SUBTASK_MARK);
  if (idx < 0) return desc;
  const head = desc.slice(0, idx + SUBTASK_MARK.length);
  let seen = -1;
  const lines = desc.slice(idx + SUBTASK_MARK.length).split('\n').map(l => {
    if (/^[□☑]\s/.test(l)) {
      seen += 1;
      if (seen === target) return l.startsWith('□') ? l.replace('□', '☑') : l.replace('☑', '□');
    }
    return l;
  });
  return head + lines.join('\n');
}

/* ===== AI：自动拆分子任务 ===== */

export async function splitTask(input: {
  name: string;
  category: string;
  subcategory: string;
  description: string;
}): Promise<ISubtask[]> {
  const out = await capabilityClient.load(PLUGIN.split).call<TaskAutoSplitTextToJsonOneOutput>('textToJson', {
    task_name: input.name,
    task_category: input.category,
    task_subcategory: input.subcategory,
    task_description: input.description || '（暂无描述，请根据任务名称与分类拆分）',
  });
  const raw = Array.isArray(out?.subtasks) ? out.subtasks : [];
  return raw
    .map(r => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        title: typeof o.title === 'string' ? o.title.trim() : '',
        note: typeof o.note === 'string' ? o.note.trim() : '',
      };
    })
    .filter(s => s.title.length > 0);
}

/* ===== AI：参考图 → 任务描述（流式） ===== */

export async function streamImageDescription(
  images: File[],
  prompt: string,
  onDelta: (full: string) => void,
): Promise<string> {
  const stream = capabilityClient
    .load(PLUGIN.imageDesc)
    .callStream<{ content?: string }>('imageUnderstanding', { reference_images: images, custom_prompt: prompt });
  let full = '';
  for await (const chunk of stream) {
    const piece = typeof chunk?.content === 'string' ? chunk.content : '';
    if (piece) {
      full += piece;
      onDelta(full);
    }
  }
  return full;
}

/* ===== 明道云工作表：新增任务记录 / 更新描述 ===== */

export interface ITaskRecordInput {
  title: string;
  desc: string;
  category: string;
}

/**
 * 把任务写入「入职任务」表。
 * 先带分类字段尝试（任务分类为多选，选项不存在会被拒），
 * 失败则退化为纯文本字段 + 状态，保证任务一定能落进表格。
 */
export async function createBitableTask(input: ITaskRecordInput): Promise<boolean> {
  const full = {
    records: [
      {
        record: {
          任务名称: input.title,
          任务描述: input.desc,
          任务分类: [input.category],
          任务状态: '未开始',
        },
      },
    ],
  };
  const minimal = {
    records: [
      {
        record: {
          任务名称: input.title,
          任务描述: input.desc,
          任务状态: '未开始',
        },
      },
    ],
  };
  try {
    await capabilityClient.load(PLUGIN.bitable).call('batchAddRecords', full);
    return true;
  } catch (e1) {
    logger.warn('带分类写入被拒绝，降级为纯文本写入:', String(e1));
    try {
      await capabilityClient.load(PLUGIN.bitable).call('batchAddRecords', minimal);
      return true;
    } catch (e2) {
      logger.error('任务写入明道云工作表失败:', String(e2));
      return false;
    }
  }
}

/** 勾选子任务后，把更新后的整段描述写回明道云 */
export async function updateTaskDescription(recordId: string, desc: string): Promise<boolean> {
  try {
    await capabilityClient
      .load(PLUGIN.bitable)
      .call('batchUpdateRecords', { records: [{ id: recordId, record: { 任务描述: desc } }] });
    return true;
  } catch (error) {
    logger.error('子任务勾选写回明道云失败:', String(error));
    return false;
  }
}

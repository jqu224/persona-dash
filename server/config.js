/**
 * 配置：环境变量 + server/.env（零依赖自解析）。
 * 表映射键沿用妙搭插件实例 ID（前端 capabilityClient 同签名调用直达这里）；
 * 字段定义与 scripts/seed-mingdao.mjs 建出的工作表一一对应（中文名 ↔ 字段 alias）。
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// 轻量 .env 加载（KEY=VALUE，忽略注释与空行）
try {
  const raw = readFileSync(resolve(ROOT, 'server/.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
} catch {
  /* 无 .env 则纯环境变量（Zeabur 等平台注入） */
}

const env = k => process.env[k] ?? '';

function tableConfig(prefix) {
  return { worksheetId: env(`MD_WS_${prefix}`) };
}

/** 字段定义：中文名 → { alias, kind }（与建表脚本一致） */
const F = (alias, kind = 'text') => ({ alias, kind });

export const CFG = {
  port: Number(env('PORT') || 8787),
  appId: env('MD_APP_ID') || '977a582e-4874-4143-9676-e6310b9c1a17',
  pat: env('MINGDAO_PAT'),
  mingdaoApiBase: env('MINGDAO_API_BASE') || 'https://api.mingdao.com',

  aiBase: (env('AI_API_BASE') || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, ''),
  aiKey: env('AI_API_KEY'),
  aiModel: env('AI_MODEL') || 'glm-4-flash',
  aiVisionModel: env('AI_VISION_MODEL') || 'glm-4v-flash',

  tables: {
    role: tableConfig('ROLE'),
    task: tableConfig('TASK'),
    worktool: tableConfig('WORKTOOL'),
    quiz: tableConfig('QUIZ'),
    member: tableConfig('MEMBER'),
    tutorial: tableConfig('TUTORIAL'),
  },

  fields: {
    role: {
      角色名称: F('biz_role_name'),
      入职周期周数: F('biz_role_weeks', 'number'),
      部门: F('biz_role_dept'),
    },
    task: {
      任务名称: F('biz_task_name'),
      任务描述: F('biz_task_desc'),
      任务分类: F('biz_task_cat', 'select'),
      任务状态: F('biz_task_status', 'select'),
      阶段: F('biz_task_phase'),
      所属工种: F('biz_task_role'),
    },
    worktool: {
      工具名称: F('biz_tool_name'),
      工具分类: F('biz_tool_cat', 'select'),
      一句话说明: F('biz_tool_brief'),
      掌握程度: F('biz_tool_mastery', 'number'),
      是否必须掌握: F('biz_tool_required', 'checkbox'),
      使用指南: F('biz_tool_guide'),
    },
    quiz: {
      题目: F('biz_quiz_q'),
      正确答案: F('biz_quiz_answer'),
      错误选项: F('biz_quiz_wrong'),
      解析: F('biz_quiz_why'),
    },
    member: {
      姓名: F('biz_member_name'),
      职位: F('biz_member_title'),
      团队: F('biz_member_team'),
      负责领域: F('biz_member_areas'),
      工位: F('biz_member_desk'),
      一句话介绍: F('biz_member_quote'),
      角色标签: F('biz_member_tag'),
    },
    tutorial: {
      教程标题: F('biz_tut_title'),
      所属工具: F('biz_tut_tool'),
      分类: F('biz_tut_cat'),
      难度: F('biz_tut_level', 'select'),
      预计学习时长: F('biz_tut_mins'),
      是否必修: F('biz_tut_required', 'checkbox'),
      内容: F('biz_tut_content'),
    },
  },
};

/* 妙搭插件实例 ID → 明道云工作表 */
export const PLUGIN_TABLE = {
  feishu_bitable_onboarding_role_read_1: 'role',
  feishu_bitable_onboarding_task_read_1: 'task',
  feishu_bitable_onboarding_task_update_1: 'task',
  feishu_bitable_work_tool_guide_read_1: 'worktool',
  feishu_bitable_knowledge_quiz_read_1: 'quiz',
  feishu_bitable_team_member_read_1: 'member',
  feishu_bitable_tool_tutorial_read_1: 'tutorial',
};

export function tableState() {
  const out = {};
  for (const [k, v] of Object.entries(CFG.tables)) {
    out[k] = { ok: Boolean(v.worksheetId), worksheetId: v.worksheetId ? `${v.worksheetId.slice(0, 6)}…` : null };
  }
  return { mingdao: Boolean(CFG.pat), appId: CFG.appId, ai: Boolean(CFG.aiKey), tables: out };
}

/**
 * 配置：环境变量 + .env 文件（零依赖自解析）。
 * 表映射键沿用妙搭插件实例 ID（前端 capabilityClient 同签名调用直达这里），
 * 同一张表的读/写插件都映射到同一个 worksheetId。
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
  return { worksheetId: env(`MD_WS_${prefix}`), viewId: env(`MD_VIEW_${prefix}`) };
}

export const CFG = {
  port: Number(env('PORT') || 8787),
  mingdaoApiBase: env('MINGDAO_API_BASE') || 'https://api.mingdao.com',
  appKey: env('MINGDAO_APP_KEY'),
  sign: env('MINGDAO_SIGN'),

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
    out[k] = { ok: Boolean(v.worksheetId), worksheetId: v.worksheetId ? `${v.worksheetId.slice(0, 6)}…` : null, viewId: Boolean(v.viewId) };
  }
  return { mingdao: Boolean(CFG.appKey && CFG.sign), ai: Boolean(CFG.aiKey), tables: out };
}

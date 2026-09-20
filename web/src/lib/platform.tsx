/**
 * 平台层适配（原 @lark-apaas/client-toolkit-lite 的去平台化替身）。
 *
 * 双模式数据管道（capabilityClient 签名不变，业务代码只改过 import）：
 *
 *  mode = 'direct'（生产，Zion 静态托管）
 *    浏览器直连明道云 v2 开放 API（应用授权密钥 appKey+sign 随请求体发送），
 *    官方支持 CORS（预检放行 POST），密钥是应用级（对应「外部门户」场景），
 *    不可放 PAT（个人身份令牌）。
 *
 *  mode = 'proxy'（本地开发）
 *    走本仓 server/ 的 /api/cap/*（Node 代理持 PAT，AI 走智谱）。
 *
 * 配置来源：/config.js 挂 window.__PD_CONFIG__（见 web/public/config.js）。
 * AI 能力在 direct 模式下暂不可用 → 抛错，上层全部有本地兜底。
 */
import type { ReactNode } from 'react';

/* ===== logger：console 直通 ===== */
export const logger = {
  info: (...args: unknown[]) => console.info('[pd]', ...args),
  warn: (...args: unknown[]) => console.warn('[pd]', ...args),
  error: (...args: unknown[]) => console.error('[pd]', ...args),
};

/* ===== scopedStorage：localStorage 替身（隐私模式静默降级） ===== */
const memStore = new Map<string, string>();
function storage(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    localStorage.setItem('__pd_probe__', '1');
    localStorage.removeItem('__pd_probe__');
    return localStorage;
  } catch {
    return {
      getItem: (k: string) => memStore.get(k) ?? null,
      setItem: (k: string, v: string) => void memStore.set(k, v),
    };
  }
}
export const scopedStorage = {
  getItem(key: string): string | null {
    return storage().getItem(key);
  },
  setItem(key: string, value: string): void {
    storage().setItem(key, value);
  },
};

/* ===== 运行时配置（/config.js） ===== */
interface TableCfg {
  worksheetId: string;
  viewId: string;
}
interface PdConfig {
  mode?: 'direct' | 'proxy';
  apiBase?: string;
  appKey?: string;
  sign?: string;
  tables?: Record<string, TableCfg>;
  proxyBase?: string;
}
declare global {
  interface Window {
    __PD_CONFIG__?: PdConfig;
  }
}
const CFG: PdConfig = typeof window !== 'undefined' ? (window.__PD_CONFIG__ ?? {}) : {};

/* ===== 表映射：妙搭插件实例 ID → 表键 ===== */
const PLUGIN_TABLE: Record<string, string> = {
  feishu_bitable_onboarding_role_read_1: 'role',
  feishu_bitable_onboarding_task_read_1: 'task',
  feishu_bitable_onboarding_task_update_1: 'task',
  feishu_bitable_work_tool_guide_read_1: 'worktool',
  feishu_bitable_knowledge_quiz_read_1: 'quiz',
  feishu_bitable_team_member_read_1: 'member',
  feishu_bitable_tool_tutorial_read_1: 'tutorial',
};

/* 字段定义：中文名 → { alias, controlId, kind }（与明道云工作表结构一一对应） */
type FieldKind = 'text' | 'select' | 'checkbox' | 'number';
interface FieldDef {
  alias: string;
  controlId: string;
  kind: FieldKind;
}
const F = (alias: string, controlId: string, kind: FieldKind = 'text'): FieldDef => ({ alias, controlId, kind });

const FIELDS: Record<string, Record<string, FieldDef>> = {
  role: {
    角色名称: F('biz_role_name', '6aaf853c8338a31378906d75'),
    入职周期周数: F('biz_role_weeks', '6aaf853c8338a31378906d76', 'number'),
    部门: F('biz_role_dept', '6aaf853c8338a31378906d77'),
  },
  task: {
    任务名称: F('biz_task_name', '6aaf853d8338a31378906d89'),
    任务分类: F('biz_task_cat', '6aaf853d8338a31378906d8a', 'select'),
    任务状态: F('biz_task_status', '6aaf853d8338a31378906d8b', 'select'),
    阶段: F('biz_task_phase', '6aaf853d8338a31378906d8c'),
    所属工种: F('biz_task_role', '6aaf853d8338a31378906d8d'),
    任务描述: F('biz_task_desc', '6aaf853d8338a31378906d8e'),
  },
  worktool: {
    工具名称: F('biz_tool_name', '6aaf853fcc716b6435915b74'),
    工具分类: F('biz_tool_cat', '6aaf853fcc716b6435915b75', 'select'),
    掌握程度: F('biz_tool_mastery', '6aaf853fcc716b6435915b76', 'number'),
    是否必须掌握: F('biz_tool_required', '6aaf853fcc716b6435915b77', 'checkbox'),
    一句话说明: F('biz_tool_brief', '6aaf853fcc716b6435915b78'),
    使用指南: F('biz_tool_guide', '6aaf853fcc716b6435915b79'),
  },
  quiz: {
    题目: F('biz_quiz_q', '6aaf85414f3bf23dafb6f2a8'),
    正确答案: F('biz_quiz_answer', '6aaf85414f3bf23dafb6f2a9'),
    错误选项: F('biz_quiz_wrong', '6aaf85414f3bf23dafb6f2aa'),
    解析: F('biz_quiz_why', '6aaf85414f3bf23dafb6f2ab'),
  },
  member: {
    姓名: F('biz_member_name', '6aaf8542fc73c8bffe9e603f'),
    职位: F('biz_member_title', '6aaf8542fc73c8bffe9e6040'),
    团队: F('biz_member_team', '6aaf8542fc73c8bffe9e6041'),
    角色标签: F('biz_member_tag', '6aaf8542fc73c8bffe9e6042'),
    工位: F('biz_member_desk', '6aaf8542fc73c8bffe9e6043'),
    负责领域: F('biz_member_areas', '6aaf8542fc73c8bffe9e6044'),
    一句话介绍: F('biz_member_quote', '6aaf8542fc73c8bffe9e6045'),
  },
  tutorial: {
    教程标题: F('biz_tut_title', '6aaf8544c9423fb0233056f4'),
    所属工具: F('biz_tut_tool', '6aaf8544c9423fb0233056f5'),
    分类: F('biz_tut_cat', '6aaf8544c9423fb0233056f6'),
    难度: F('biz_tut_level', '6aaf8544c9423fb0233056f7', 'select'),
    预计学习时长: F('biz_tut_mins', '6aaf8544c9423fb0233056f8'),
    是否必修: F('biz_tut_required', '6aaf8544c9423fb0233056f9', 'checkbox'),
    内容: F('biz_tut_content', '6aaf8544c9423fb0233056fa'),
  },
};

/* ===== 直连明道云 v2 ===== */
const API_BASE = CFG.apiBase ?? 'https://api.mingdao.com';

function authBody(): Record<string, string> {
  if (!CFG.appKey || !CFG.sign) {
    throw new Error('明道云授权密钥未配置（/config.js：appKey / sign）');
  }
  return { appKey: CFG.appKey, sign: CFG.sign };
}

async function v2<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }
  const obj = (data ?? {}) as { success?: boolean; error_msg?: string; errorMsg?: string };
  if (!res.ok || obj.success === false) {
    throw new Error(`明道云 ${path}：${obj.error_msg ?? obj.errorMsg ?? `HTTP ${res.status}`}`);
  }
  return data as T;
}

function encodeValue(kind: FieldKind, v: unknown): unknown {
  if (v == null) return '';
  if (kind === 'select') {
    // v2 单选字段直接传字符串（多选才用数组）
    const arr = Array.isArray(v) ? v.map(String) : String(v).split(/[,，;；、]/).map(s => s.trim()).filter(Boolean);
    return arr.length === 1 ? arr[0] : arr;
  }
  if (kind === 'checkbox') return v === true || v === '是' || v === 'true' || v === 1 || v === '1';
  if (kind === 'number') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return String(v);
}

/** 解包 v2 返回的字段值（checkbox '1'/'0' → 布尔；单选已是纯字符串） */
function decodeValue(kind: FieldKind | undefined, v: unknown): unknown {
  if (kind === 'checkbox') return v === true || v === 1 || v === '1' || v === 'true' || v === '是';
  if (Array.isArray(v) && v.length > 0 && v.every(x => x && typeof x === 'object' && 'value' in x)) {
    return (v as Array<{ value: unknown }>).map(x => x.value);
  }
  return v;
}

function tableOf(pluginId: string): { key: string; ws: TableCfg } {
  const key = PLUGIN_TABLE[pluginId];
  if (!key) throw new Error(`未知插件：${pluginId}`);
  const ws = CFG.tables?.[key];
  if (!ws?.worksheetId) throw new Error(`表「${key}」未在 /config.js 配置 worksheetId`);
  return { key, ws };
}

async function directCall<T = unknown>(pluginId: string, method: string, input: unknown): Promise<T> {
  const { key, ws } = tableOf(pluginId);
  const defs = FIELDS[key];

  if (method === 'searchRecords') {
    const records: Array<{ id: string; record: Record<string, unknown> }> = [];
    for (let pageIndex = 1; pageIndex <= 50; pageIndex += 1) {
      const res = await v2<{ data?: { rows?: Array<Record<string, unknown>> } }>('/v2/open/worksheet/getFilterRows', {
        ...authBody(),
        worksheetId: ws.worksheetId,
        viewId: ws.viewId,
        pageIndex,
        pageSize: 100,
      });
      const rows = res?.data?.rows ?? [];
      for (const row of rows) {
        const record: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (k === 'rowid' || k === 'rowId' || k === 'rid' || k.startsWith('_')) continue;
          const [zh, def] = Object.entries(defs).find(([, d]) => d.controlId === k || d.alias === k) ?? [k, undefined];
          record[zh] = decodeValue(def?.kind, v);
        }
        records.push({ id: String(row.rowid ?? row.rowId ?? row.rid ?? ''), record });
      }
      if (rows.length < 100) break;
    }
    return { records, hasMore: false } as T;
  }

  if (method === 'batchAddRecords') {
    const inputRecs = (input as { records?: Array<{ record?: Record<string, unknown> }> })?.records ?? [];
    // v2 addRows 的 rows 是嵌套数组：每行 = 单元格数组
    const rows = inputRecs.map(r =>
      Object.entries(r.record ?? {})
        .filter(([name]) => defs[name])
        .map(([name, value]) => ({ controlId: defs[name].alias, value: encodeValue(defs[name].kind, value) })),
    );
    if (rows.length === 0) return { success: true } as T;
    return v2('/v2/open/worksheet/addRows', { ...authBody(), worksheetId: ws.worksheetId, rows, triggerWorkflow: true });
  }

  if (method === 'batchUpdateRecords') {
    const inputRecs = (input as { records?: Array<{ id?: string; record?: Record<string, unknown> }> })?.records ?? [];
    // v2 editRows 只支持「一组值批量套用」，不同行不同值 → 逐条 editRow
    for (const r of inputRecs) {
      const cells = Object.entries(r.record ?? {})
        .filter(([name]) => defs[name])
        .map(([name, value]) => ({ controlId: defs[name].alias, value: encodeValue(defs[name].kind, value) }));
      if (!r.id || cells.length === 0) continue;
      await v2('/v2/open/worksheet/editRow', {
        ...authBody(),
        worksheetId: ws.worksheetId,
        rowId: r.id,
        controls: cells,
        triggerWorkflow: true,
      });
    }
    return { success: true } as T;
  }

  throw new Error(`不支持的表方法：${method}`);
}

/* ===== 代理模式（本地开发走 server/） ===== */
const PROXY_BASE = CFG.proxyBase ?? '';

function hasFile(v: unknown): boolean {
  if (typeof File !== 'undefined' && v instanceof File) return true;
  if (Array.isArray(v)) return v.some(hasFile);
  if (v && typeof v === 'object') return Object.values(v).some(hasFile);
  return false;
}

async function proxyCall<T>(pluginId: string, method: string, input: unknown): Promise<T> {
  const url = `${PROXY_BASE}/api/cap/${encodeURIComponent(pluginId)}/${encodeURIComponent(method)}`;
  const init: RequestInit = { method: 'POST' };
  if (hasFile(input)) {
    const fd = new FormData();
    const obj = (input ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.every(x => x instanceof File)) v.forEach((f, i) => fd.append(`${k}[${i}]`, f));
      else if (v instanceof File) fd.append(k, v);
      else fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
    init.body = fd;
  } else {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(input ?? {});
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(`[cap:${pluginId}.${method}] ${msg}`);
  }
  return data as T;
}

async function* proxyStream<T>(pluginId: string, method: string, input: unknown): AsyncGenerator<T> {
  const url = `${PROXY_BASE}/api/cap/${encodeURIComponent(pluginId)}/${encodeURIComponent(method)}?stream=1`;
  const init: RequestInit = { method: 'POST' };
  if (hasFile(input)) {
    const fd = new FormData();
    const obj = (input ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.every(x => x instanceof File)) v.forEach((f, i) => fd.append(`${k}[${i}]`, f));
      else if (v instanceof File) fd.append(k, v);
      else fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
    init.body = fd;
  } else {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(input ?? {});
  }
  const res = await fetch(url, init);
  if (!res.ok || !res.body) throw new Error(`[cap:${pluginId}.${method}] HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const s = line.trim();
      if (!s) continue;
      try {
        yield JSON.parse(s) as T;
      } catch {
        yield { content: s } as T;
      }
    }
  }
}

/* ===== capabilityClient（双模式） ===== */
const isDirect = CFG.mode !== 'proxy';

export const capabilityClient = {
  load(pluginId: string) {
    return {
      call<T = unknown>(method: string, input?: unknown): Promise<T> {
        if (isDirect) return directCall<T>(pluginId, method, input);
        return proxyCall<T>(pluginId, method, input);
      },
      callStream<T = unknown>(method: string, input?: unknown): AsyncGenerator<T> {
        if (isDirect) {
          // direct 模式无 AI 代理：抛错让上层走本地兜底
          throw new Error('AI 能力需代理模式（本地开发 server/ 或后续接入 Zion BaaS 代理）');
        }
        return proxyStream<T>(pluginId, method, input);
      },
    };
  },
};

/* ===== UniversalLink：外链 <a> ===== */
export function UniversalLink(props: {
  to: string;
  target?: string;
  rel?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { to, target = '_blank', rel = 'noopener noreferrer', className, children, onClick } = props;
  return (
    <a href={to} target={target} rel={rel} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

/* ===== AppContainer / ErrorRender：直通与兜底 UI ===== */
export function AppContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function ErrorRender({ error }: { error: unknown; resetErrorBoundary?: () => void }) {
  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', color: '#711' }}>
      <h2 style={{ marginBottom: 8 }}>页面出错了</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{String(error instanceof Error ? error.message : error)}</pre>
    </div>
  );
}

/**
 * 明道云 HAP v2 开放 API 客户端（应用级 appKey + sign 鉴权）。
 * 文档：https://help.mingdao.com/api/write-data-to-worksheet 与应用内 API 开发文档。
 *
 * 只封装本项目用到的四个操作：
 *   getFilterRows   按视图分页拉记录（服务端内部循环取全量）
 *   addRows         批量新增
 *   editRows        批量编辑（失败时逐条 editRow 兜底）
 *   getWorksheetInfo 拉工作表结构（字段名 ↔ controlId 映射，避免手工配别名）
 */
import { CFG } from './config.js';

const BASE = CFG.mingdaoApiBase.replace(/\/$/, '');
const PAGE_SIZE = 100;

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appKey: CFG.appKey, sign: CFG.sign, ...body }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`明道云 ${path} 返回非 JSON（HTTP ${res.status}）：${text.slice(0, 200)}`);
  }
  if (!json.success) {
    // 常见错误码：10001 缺参数 / 10002 参数错 / 10005 无权限 / 10102 签名不合法
    throw new Error(`明道云 ${path} 失败：code=${json.code ?? '?'} ${String(json.errorMsg ?? json.message ?? '').slice(0, 300)}`);
  }
  return json;
}

/* ===== 工作表结构缓存：字段名 ↔ controlId ===== */
const schemaCache = new Map(); // worksheetId -> { byName: Map<name, control>, byId: Map<id, control> }

export async function getSchema(worksheetId, { force = false } = {}) {
  if (!force && schemaCache.has(worksheetId)) return schemaCache.get(worksheetId);
  const res = await call('/v2/open/worksheet/getWorksheetInfo', { worksheetId, getTemplate: true });
  const controls = res?.data?.template?.controls ?? res?.data?.controls ?? [];
  const byName = new Map();
  const byId = new Map();
  for (const c of controls) {
    if (c.controlName) byName.set(c.controlName, c);
    byId.set(c.controlId, c);
  }
  const schema = { byName, byId };
  schemaCache.set(worksheetId, schema);
  return schema;
}

/* ===== 控件类型（明道云 type 编号，按需补充） =====
 * 2 文本 3 单选 4 多选 6 数值 5 日期 14 复选(布尔) 7 附件 8 成员 9 部门
 */
function encodeValue(control, value) {
  if (value == null) return '';
  const t = control?.type;
  if (t === 4) return Array.isArray(value) ? value.map(String) : String(value).split(/[,，;；、]/).map(s => s.trim()).filter(Boolean);
  if (t === 6) return Number(value) || 0;
  if (t === 14) return value === true || value === '是' || value === 'true';
  if (t === 3) return String(value);
  return String(value);
}

function decodeValue(control, value) {
  if (value == null) return '';
  // 富文本/选项等对象结构统一交由前端 toText/toArr 解包，这里只保证数组语义正确
  const t = control?.type;
  if (t === 4 && !Array.isArray(value)) return value == null || value === '' ? [] : [value];
  return value;
}

function fieldsToControls(worksheetId, schema, fields) {
  const out = [];
  for (const [name, value] of Object.entries(fields ?? {})) {
    const control = schema.byName.get(name) ?? schema.byId.get(name);
    if (!control) {
      throw new Error(`工作表字段不存在：「${name}」(${worksheetId})。已有字段：${[...schema.byName.keys()].join('、')}`);
    }
    out.push({ controlId: control.controlId, value: encodeValue(control, value) });
  }
  return out;
}

/* ===== 查询：拉全量并归一化为 { id, record: {字段名: 值} } ===== */
export async function fetchAllRows(worksheetId, viewId) {
  const schema = await getSchema(worksheetId);
  const rows = [];
  for (let pageIndex = 1; pageIndex <= 50; pageIndex += 1) {
    const res = await call('/v2/open/worksheet/getFilterRows', {
      worksheetId,
      viewId,
      pageIndex,
      pageSize: PAGE_SIZE,
      status: 1, // 正常数据（非回收站）
      getSystemFields: false,
    });
    const page = res?.data?.rows ?? [];
    for (const row of page) {
      const id = row.rowId ?? row.rid ?? row.id ?? '';
      const record = {};
      for (const [key, value] of Object.entries(row)) {
        if (['rowId', 'rid', 'id', 'allowEdit', 'isSubList', 'index'].includes(key)) continue;
        const control = schema.byId.get(key);
        const name = control?.controlName ?? key;
        record[name] = decodeValue(control, value);
      }
      rows.push({ id, record });
    }
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

/* ===== 新增 ===== */
export async function addRows(worksheetId, records) {
  const schema = await getSchema(worksheetId);
  const rows = records.map(r => ({ controls: fieldsToControls(worksheetId, schema, r.record ?? r.fields ?? r) }));
  return call('/v2/open/worksheet/addRows', { worksheetId, rows, triggerWorkflow: true });
}

/* ===== 编辑 ===== */
export async function editRows(worksheetId, records) {
  const schema = await getSchema(worksheetId);
  const rows = records.map(r => ({
    rowId: r.id ?? r.rowId ?? r.recordId,
    controls: fieldsToControls(worksheetId, schema, r.record ?? r.fields ?? r),
  }));
  try {
    return await call('/v2/open/worksheet/editRows', { worksheetId, rows, triggerWorkflow: true });
  } catch (e) {
    // 批量端点不可用时逐条兜底
    let lastErr;
    for (const row of rows) {
      try {
        await call('/v2/open/worksheet/editRow', { worksheetId, ...row, triggerWorkflow: true });
      } catch (e2) {
        lastErr = e2;
      }
    }
    if (lastErr) throw lastErr;
    return { success: true };
  }
}

export async function deleteRow(worksheetId, rowId) {
  return call('/v2/open/worksheet/deleteRow', { worksheetId, rowId });
}

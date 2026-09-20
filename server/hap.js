/**
 * 明道云 HAP 运行时适配：走官方 MCP 通道（Streamable HTTP，PAT 鉴权）。
 * 文档：https://apidoc2.mingdao.com/application_v3/pat/zh-Hans/
 *
 * 前端 capabilityClient 的三种操作映射：
 *   searchRecords      → MCP get_record_list（分页拉全量，字段名归一为中文）
 *   batchAddRecords    → MCP batch_create_records（按字段类型编码值）
 *   batchUpdateRecords → MCP update_record 逐条（不同行不同值）
 */
import { CFG } from './config.js';

const MCP_URL = (process.env.MINGDAO_MCP_URL || 'https://api.mingdao.com/mcp');
let rpcId = 0;

async function mcp(name, args = {}) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${CFG.pat}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method: 'tools/call', params: { name, arguments: args } }),
  });
  const text = await res.text();
  const dataLine = text.split('\n').find(l => l.startsWith('data:'));
  let payload;
  try {
    payload = JSON.parse(dataLine ? dataLine.slice(5) : text);
  } catch {
    throw new Error(`MCP ${name} 非 JSON 响应（HTTP ${res.status}）：${text.slice(0, 200)}`);
  }
  if (payload.error) throw new Error(`MCP ${name} 错误：${JSON.stringify(payload.error).slice(0, 300)}`);
  if (payload.result?.isError) throw new Error(`MCP ${name} 执行失败：${JSON.stringify(payload.result.content).slice(0, 400)}`);
  const sc = payload.result?.structuredContent;
  if (sc !== undefined) return sc;
  const texts = (payload.result?.content ?? []).filter(c => c.type === 'text').map(c => c.text);
  try {
    return JSON.parse(texts.join('\n'));
  } catch {
    return texts.join('\n');
  }
}

/* ===== 值编码：前端中文字段值 → MCP 字段值 ===== */
function encodeValue(kind, v) {
  if (v == null) return '';
  if (kind === 'select') {
    const arr = Array.isArray(v) ? v : String(v).split(/[,，;；、]/).map(s => s.trim()).filter(Boolean);
    return arr.map(String);
  }
  if (kind === 'checkbox') return v === true || v === '是' || v === 'true' || v === 1 || v === '1' ? 1 : 0;
  if (kind === 'number') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return String(v);
}

/** 读取归一化：[{key,value}] → 字符串数组；其余原样（前端 toText/toArr 兼容） */
function normalizeValue(v) {
  if (Array.isArray(v) && v.length > 0 && v.every(x => x && typeof x === 'object' && 'value' in x)) {
    return v.map(x => x.value);
  }
  return v;
}

function tableFields(tableKey) {
  return CFG.fields[tableKey] ?? {};
}

/* ===== 查询：拉全量并映射为 { id, record: {中文字段: 值} } ===== */
export async function fetchAllRows(tableKey) {
  const t = CFG.tables[tableKey];
  const nameOf = {};
  for (const [zh, def] of Object.entries(tableFields(tableKey))) nameOf[def.alias] = zh; // alias → 中文名
  const rows = [];
  for (let pageIndex = 1; pageIndex <= 20; pageIndex += 1) {
    const res = await mcp('get_record_list', { appId: CFG.appId, worksheet_id: t.worksheetId, pageSize: 1000, pageIndex });
    const page = res?.data?.rows ?? [];
    for (const row of page) {
      const record = {};
      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith('_') || key === 'rowId') continue;
        const name = nameOf[key] ?? key;
        record[name] = normalizeValue(value);
      }
      rows.push({ id: row.rowId, record });
    }
    if (page.length < 1000) break;
  }
  return rows;
}

/* ===== 新增 ===== */
export async function addRows(tableKey, records) {
  const t = CFG.tables[tableKey];
  const defs = tableFields(tableKey);
  const rows = records.map(r => {
    const fields = Object.entries(r.record ?? r.fields ?? r)
      .filter(([name]) => defs[name])
      .map(([name, value]) => {
        const def = defs[name];
        const field = { id: def.alias, value: encodeValue(def.kind, value) };
        if (def.kind === 'select') field.type = '2'; // 允许自动追加新选项（如自定义分类）；注意 MCP 要求是字符串
        return field;
      });
    return { fields };
  });
  if (rows.length === 0) return { success: true };
  return mcp('batch_create_records', { appId: CFG.appId, worksheet_id: t.worksheetId, rows });
}

/* ===== 编辑：不同行不同值 → 逐条 update_record ===== */
export async function editRows(tableKey, records) {
  const t = CFG.tables[tableKey];
  const defs = tableFields(tableKey);
  for (const r of records) {
    const fields = Object.entries(r.record ?? r.fields ?? r)
      .filter(([name]) => defs[name])
      .map(([name, value]) => ({ id: defs[name].alias, value: encodeValue(defs[name].kind, value) }));
    const rowId = r.id ?? r.rowId ?? r.recordId;
    if (!rowId || fields.length === 0) continue;
    await mcp('update_record', { appId: CFG.appId, worksheet_id: t.worksheetId, row_id: rowId, fields });
  }
  return { success: true };
}

/**
 * 明道云 HAP MCP 调用助手（Streamable HTTP，PAT 鉴权）。
 * 用法：
 *   node scripts/mcp.mjs <toolName> ['{"json": "args"}']
 *   node scripts/mcp.mjs --schema <toolName>   # 打印某工具的 inputSchema
 *   node scripts/mcp.mjs --tools               # 列出全部工具名
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  for (const line of readFileSync(resolve(ROOT, 'server/.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const PAT = process.env.MINGDAO_PAT;
const URL_ = process.env.MINGDAO_MCP_URL || 'https://api.mingdao.com/mcp';
if (!PAT) {
  console.error('缺少 MINGDAO_PAT（server/.env 或环境变量）');
  process.exit(1);
}

async function rpc(method, params, id) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${PAT}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) }),
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text.startsWith('event:') || text.includes('\ndata:') ? text.split('\n').find(l => l.startsWith('data:')).slice(5) : text);
  } catch {
    throw new Error(`非 JSON 响应（HTTP ${res.status}）：${text.slice(0, 300)}`);
  }
  if (payload.error) throw new Error(`RPC ${method} 错误：${JSON.stringify(payload.error).slice(0, 500)}`);
  return payload.result;
}

async function callTool(name, args) {
  const result = await rpc('tools/call', { name, arguments: args ?? {} }, 1);
  if (result.isError) throw new Error(`工具 ${name} 执行失败：${JSON.stringify(result.content).slice(0, 800)}`);
  const texts = (result.content ?? []).filter(c => c.type === 'text').map(c => c.text);
  const structured = result.structuredContent ?? undefined;
  const raw = structured ?? (texts.length === 1 ? (() => { try { return JSON.parse(texts[0]); } catch { return texts[0]; } })() : texts);
  return raw;
}

const [, , cmd, ...rest] = process.argv;

if (cmd === '--tools') {
  const result = await rpc('tools/list', {}, 1);
  const tools = result.tools ?? [];
  console.log(tools.map(t => t.name).join('\n'));
} else if (cmd === '--schema') {
  const result = await rpc('tools/list', {}, 1);
  const tool = (result.tools ?? []).find(t => t.name === rest[0]);
  if (!tool) throw new Error(`工具不存在：${rest[0]}`);
  console.log(JSON.stringify(tool.inputSchema, null, 2));
  if (tool.description) console.log(`\n# 描述：\n${tool.description}`);
} else if (cmd) {
  const args = rest[0] ? JSON.parse(rest[0]) : {};
  const out = await callTool(cmd, args);
  console.log(JSON.stringify(out, null, 2).slice(0, 12000));
} else {
  console.error('用法：node scripts/mcp.mjs <toolName> [jsonArgs] | --schema <tool> | --tools');
  process.exit(1);
}

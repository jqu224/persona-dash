/**
 * persona-dash 主服务（零依赖 Node ≥ 18）：
 *   POST /api/cap/:pluginId/:method  前端 capabilityClient 同签名管道
 *   GET  /api/health                 配置自检
 *   /*                             静态托管 web/dist（SPA 回退 index.html）
 *
 * bitable 插件 → 明道云工作表（查/增/改）；AI 插件 → 智谱 LLM。
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { CFG, PLUGIN_TABLE, tableState } from './config.js';
import { fetchAllRows, addRows, editRows } from './mingdao.js';
import { splitTask, generateModule, imageDescription } from './ai.js';

const DIST = resolve(new URL('.', import.meta.url).pathname, '..', 'web', 'dist');
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/* ===== 请求体读取（JSON 或 multipart） ===== */
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > 26_214_400) {
        reject(new Error('请求体超过 25MB 上限'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** 极简 multipart/form-data 解析：返回 { fields, files: [{name, filename, mimeType, buffer}] } */
function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!m) throw new Error('multipart 缺少 boundary');
  const boundary = Buffer.from(`--${m[1] || m[2]}`);
  const fields = {};
  const files = [];
  let start = buffer.indexOf(boundary);
  while (start !== -1) {
    const next = buffer.indexOf(boundary, start + boundary.length);
    if (next === -1) break;
    let part = buffer.subarray(start + boundary.length, next);
    if (part.subarray(0, 2).toString() === '\r\n') part = part.subarray(2);
    if (part.subarray(-2).toString() === '\r\n') part = part.subarray(0, -2);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headers = part.subarray(0, headerEnd).toString('utf8');
      const body = part.subarray(headerEnd + 4);
      const nameM = /name="([^"]*)"/.exec(headers);
      const fileM = /filename="([^"]*)"/.exec(headers);
      const typeM = /content-type:\s*([^\r\n]+)/i.exec(headers);
      const name = nameM?.[1] ?? '';
      if (fileM && fileM[1]) {
        files.push({ name, filename: fileM[1], mimeType: typeM?.[1]?.trim() || 'application/octet-stream', buffer: body });
      } else {
        fields[name] = body.toString('utf8');
      }
    }
    start = next;
  }
  return { fields, files };
}

function parseInput(req, buffer) {
  const ct = req.headers['content-type'] ?? '';
  if (ct.includes('multipart/form-data')) {
    const { fields, files } = parseMultipart(buffer, ct);
    // FormData 里的 JSON 值（对象/数组字段）还原结构
    for (const [k, v] of Object.entries(fields)) {
      const s = v.trim();
      if (/^[[{]/.test(s)) {
        try {
          fields[k] = JSON.parse(s);
        } catch {
          /* 保持字符串 */
        }
      }
    }
    return { input: fields, files };
  }
  if (buffer.length === 0) return { input: {}, files: [] };
  try {
    return { input: JSON.parse(buffer.toString('utf8')), files: [] };
  } catch {
    throw new Error('请求体不是合法 JSON');
  }
}

/* ===== /api/cap 路由 ===== */
const AI_PLUGINS = {
  task_auto_split_text_to_json_1: { textToJson: splitTask },
  learning_module_text_to_json_1: { textToJson: generateModule },
};

async function handleCap(pluginId, method, { input, files }, res, isStream) {
  /* --- 明道云工作表 --- */
  const tableKey = PLUGIN_TABLE[pluginId];
  if (tableKey) {
    const t = CFG.tables[tableKey];
    if (!t.worksheetId) throw new Error(`表「${tableKey}」未配置 worksheetId（环境变量 MD_WS_${tableKey.toUpperCase()}）`);
    if (method === 'searchRecords') {
      // 客户端会按 hasMore 分页循环；服务端一次给全量，循环一次即结束
      const rows = await fetchAllRows(t.worksheetId, t.viewId);
      log(`[cap] ${tableKey}.searchRecords → ${rows.length} 行`);
      return sendJson(res, 200, { records: rows, hasMore: false });
    }
    if (method === 'batchAddRecords') {
      const records = input.records ?? [];
      if (records.length === 0) return sendJson(res, 200, { success: true });
      await addRows(t.worksheetId, records);
      log(`[cap] ${tableKey}.batchAddRecords ← ${records.length} 行`);
      return sendJson(res, 200, { success: true });
    }
    if (method === 'batchUpdateRecords') {
      const records = input.records ?? [];
      if (records.length === 0) return sendJson(res, 200, { success: true });
      await editRows(t.worksheetId, records);
      log(`[cap] ${tableKey}.batchUpdateRecords ← ${records.length} 行`);
      return sendJson(res, 200, { success: true });
    }
    throw new Error(`不支持的表方法：${method}`);
  }

  /* --- AI：任务拆分 / 学习模块 --- */
  const aiPlugin = AI_PLUGINS[pluginId];
  if (aiPlugin) {
    const fn = aiPlugin[method];
    if (!fn) throw new Error(`不支持的 AI 方法：${method}`);
    const out = await fn(input);
    return sendJson(res, 200, out);
  }

  /* --- AI：参考图 → 任务描述（流式 NDJSON） --- */
  if (pluginId === 'ai_image_reference_task_description_1' && method === 'imageUnderstanding') {
    if (files.length === 0) throw new Error('缺少参考图（reference_images）');
    if (!isStream) {
      // 非流式：聚合全部增量一次性返回
      let full = '';
      await imageDescription({ images: files, custom_prompt: input.custom_prompt }, d => {
        full += d;
      });
      return sendJson(res, 200, { content: full });
    }
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    await imageDescription({ images: files, custom_prompt: input.custom_prompt }, d => {
      res.write(`${JSON.stringify({ content: d })}\n`);
    });
    res.end();
    log(`[cap] imageUnderstanding 流式完成（${files.length} 图）`);
    return undefined;
  }

  throw new Error(`未知插件：${pluginId}`);
}

/* ===== 响应工具 ===== */
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

/* ===== 静态托管 ===== */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(pathname, res) {
  let file = join(DIST, decodeURIComponent(pathname));
  if (!file.startsWith(DIST)) return sendJson(res, 403, { error: 'forbidden' });
  if (!existsSync(file) || statSync(file).isDirectory()) {
    // SPA 回退
    file = join(DIST, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('web/dist 尚未构建：请先 cd web && npm run build');
      return;
    }
  }
  const type = MIME[extname(file)] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400' });
  createReadStream(file).pipe(res);
}

/* ===== 主服务 ===== */
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const pathname = url.pathname;
  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, ts: Date.now(), ...tableState() });
    }
    const cap = /^\/api\/cap\/([^/]+)\/([^/]+)$/.exec(pathname);
    if (cap && req.method === 'POST') {
      const [, pluginId, method] = cap;
      const buffer = await readBody(req);
      const parsed = parseInput(req, buffer);
      const result = await handleCap(pluginId, method, parsed, res, url.searchParams.get('stream') === '1');
      if (result !== undefined) sendJson(res, 200, result);
      return undefined;
    }
    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: `未知接口：${req.method} ${pathname}` });
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      return serveStatic(pathname, res);
    }
    return sendJson(res, 405, { error: 'method not allowed' });
  } catch (err) {
    log('[err]', req.method, pathname, String(err?.message ?? err));
    if (!res.headersSent) sendJson(res, 502, { error: String(err?.message ?? err) });
    else res.end();
    return undefined;
  }
});

server.listen(CFG.port, () => {
  const hasDist = existsSync(join(DIST, 'index.html'));
  log(`persona-dash server → http://127.0.0.1:${CFG.port}（静态目录 ${hasDist ? '就绪' : '未构建'}）`);
  log(`配置：${JSON.stringify(tableState())}`);
});

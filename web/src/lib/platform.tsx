/**
 * 平台层适配（原 @lark-apaas/client-toolkit-lite 的去平台化替身）。
 *
 * 原应用跑在飞书妙搭上，数据读写与 AI 能力都经 capabilityClient 运行时
 * RPC 代理到 bitable / AI 插件。脱离妙搭后，全部调用改走本项目自带的后端
 * 代理（server/，转发明道云 HAP 开放 API 与智谱 LLM），接口签名保持不变，
 * 业务代码只改 import 来源。
 *
 * 统一管道：POST /api/cap/:pluginId/:method
 *   - 普通输入 → JSON body
 *   - 含 File 的输入 → FormData（服务端转 base64 喂视觉模型）
 *   - callStream → NDJSON 流，逐行 yield 解析结果
 */
import type { ReactNode } from 'react';

/* ===== logger：console 直通 ===== */
export const logger = {
  info: (...args: unknown[]) => console.info('[md]', ...args),
  warn: (...args: unknown[]) => console.warn('[md]', ...args),
  error: (...args: unknown[]) => console.error('[md]', ...args),
};

/* ===== scopedStorage：localStorage 替身（隐私模式静默降级） ===== */
const memStore = new Map<string, string>();
function storage(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    localStorage.setItem('__md_probe__', '1');
    localStorage.removeItem('__md_probe__');
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

/* ===== capabilityClient → 后端代理 ===== */
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function hasFile(v: unknown): boolean {
  if (typeof File !== 'undefined' && v instanceof File) return true;
  if (Array.isArray(v)) return v.some(hasFile);
  if (v && typeof v === 'object') return Object.values(v).some(hasFile);
  return false;
}

async function request<T>(pluginId: string, method: string, input: unknown): Promise<T> {
  const url = `${API_BASE}/api/cap/${encodeURIComponent(pluginId)}/${encodeURIComponent(method)}`;
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
      (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string')
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(`[cap:${pluginId}.${method}] ${msg}`);
  }
  return data as T;
}

async function* requestStream<T>(pluginId: string, method: string, input: unknown): AsyncGenerator<T> {
  const url = `${API_BASE}/api/cap/${encodeURIComponent(pluginId)}/${encodeURIComponent(method)}?stream=1`;
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
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`[cap:${pluginId}.${method}] HTTP ${res.status} ${text.slice(0, 200)}`);
  }
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
  const tail = buf.trim();
  if (tail) {
    try {
      yield JSON.parse(tail) as T;
    } catch {
      yield { content: tail } as T;
    }
  }
}

export const capabilityClient = {
  load(pluginId: string) {
    return {
      call<T = unknown>(method: string, input?: unknown): Promise<T> {
        return request<T>(pluginId, method, input);
      },
      callStream<T = unknown>(method: string, input?: unknown): AsyncGenerator<T> {
        return requestStream<T>(pluginId, method, input);
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

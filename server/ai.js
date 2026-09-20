/**
 * AI 能力：原妙搭三个官方插件 → 智谱 OpenAI 兼容接口。
 * prompts 原样迁移自 web/shared/capabilities/*.json（{{input.*}} 占位符替换）。
 * 输出强约束 JSON（response_format + 围栏剥离 + 首个 JSON 块提取三重兜底）。
 */
import { CFG } from './config.js';

/* ===== 提示词（迁移自妙搭 capabilities，仅换掉占位符语法） ===== */
const PROMPT_SPLIT = `你是一位专业的项目管理专家，擅长将复杂任务拆解为可执行的具体子任务。

请根据以下任务信息，将其拆分为3-6个结构化子任务：
任务名称：{task_name}
任务分类：{task_category}
任务子分类：{task_subcategory}
任务描述：{task_description}

拆分要求：
1. 每个子任务独立完整、逻辑清晰、符合任务目标
2. 子任务按照执行顺序排列
3. 子任务标题简洁明确，可直接作为执行项
4. 每个子任务的说明清晰表述该子任务的核心要求或预期成果
5. 确保子任务覆盖原任务的全部需求，无遗漏
6. 严格生成3-6条子任务，不得超出或少于这个范围

只输出 JSON 对象：{"subtasks": [{"title": "子任务标题", "note": "一句话说明"}]}`;

const PROMPT_MODULE = `你是专业的学习模块设计专家，擅长根据用户的简短描述生成结构化的学习模块配置。

请根据以下用户需求生成学习模块JSON：
用户需求：{module_requirement}

生成要求：
1. 模块类型只能是"vocabulary"（背单词模块）或"quiz"（知识测试模块），根据用户需求自动判断
2. 标题要简洁明了，准确反映模块内容
3. 词条/题目数量控制在5-10个之间
4. 背单词模块的词条包含word（单词）、translation（释义）两个字段
5. 测试模块的题目包含question（题目）、options（选项数组，4个选项）、answer（正确答案）三个字段
6. 内容要准确、实用，符合对应模块类型的使用场景

只输出 JSON 对象：{"module_type": "vocabulary|quiz", "title": "标题", "items": [...]}`;

function fill(template, input) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(input[k] ?? ''));
}

/* ===== OpenAI 兼容调用 ===== */
async function chat({ messages, temperature = 0.5, maxTokens = 4096, json = true, model, stream = false, onDelta }) {
  const body = {
    model: model || CFG.aiModel,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };
  if (json) body.response_format = { type: 'json_object' };
  const res = await fetch(`${CFG.aiBase}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CFG.aiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI 接口 HTTP ${res.status}：${text.slice(0, 300)}`);
  }
  if (!stream) {
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }
  // SSE 流式：逐 delta 回调
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
      if (!s.startsWith('data:')) continue;
      const payload = s.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (delta && onDelta) onDelta(delta);
      } catch {
        /* 忽略半包 */
      }
    }
  }
  return '';
}

/* ===== JSON 三重兜底解析 ===== */
function parseJson(text) {
  const raw = String(text ?? '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    /* continue */
  }
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* continue */
    }
  }
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(raw.slice(first, last + 1));
    } catch {
      /* continue */
    }
  }
  throw new Error(`AI 输出无法解析为 JSON：${raw.slice(0, 200)}`);
}

/* ===== 对外三个能力（与妙搭插件方法名一致） ===== */

/** textToJson · 任务拆分 → { subtasks: [{title, note}] } */
export async function splitTask(input) {
  const content = await chat({
    messages: [
      { role: 'system', content: '你是任务拆解助手，永远只输出严格合法的 JSON。' },
      { role: 'user', content: fill(PROMPT_SPLIT, input) },
    ],
    json: true,
  });
  return parseJson(content);
}

/** textToJson · 学习模块生成 → { module_type, title, items } */
export async function generateModule(input) {
  const content = await chat({
    messages: [
      { role: 'system', content: '你是学习模块设计助手，永远只输出严格合法的 JSON。' },
      { role: 'user', content: fill(PROMPT_MODULE, input) },
    ],
    json: true,
  });
  return parseJson(content);
}

/** imageUnderstanding · 参考图 → 任务描述（流式），images 为 [{buffer, mimeType}] */
export async function imageDescription({ images, custom_prompt: customPrompt }, onDelta) {
  const prompt = `你是一位专业的任务描述生成专家，擅长根据参考图片内容生成清晰、具体、可执行的任务描述。

请对提供的参考图片进行详细分析，并生成适合用于任务管理系统的任务描述文本。

分析要求：
1. 首先描述图片的核心内容和主要元素
2. 提取图片中包含的关键信息、要求或目标
3. 转化为结构化的任务描述，包含任务目标、核心要点、交付要求等
4. 语言简洁明了，符合企业内部任务描述的专业风格
5. 突出可执行性，避免模糊表述

用户补充要求：${customPrompt || '无'}

输出要求：
- 总长度控制在200-500字之间
- 采用分点结构，重点内容突出
- 确保描述准确，与图片内容完全一致
- 如图片中包含文字信息，需准确提取并融入任务描述中
- 如有不确定的内容，明确标注说明`;
  const content = [
    { type: 'text', text: prompt },
    ...images.slice(0, 4).map(img => ({
      type: 'image_url',
      image_url: { url: `data:${img.mimeType || 'image/png'};base64,${img.buffer.toString('base64')}` },
    })),
  ];
  await chat(
    {
      messages: [{ role: 'user', content }],
      temperature: 0.5,
      maxTokens: 2048,
      json: false,
      model: CFG.aiVisionModel,
      stream: true,
      onDelta,
    },
  );
}

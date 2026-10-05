<div align="center">
  <img src="docs/assets/hero.svg" alt="persona-dash — 本地优先、可插拔数据面的个人成长工作台" width="100%">
</div>

<div align="center">
<pre>~/persona-dash (main*)   本地优先 · 可插拔数据面   glm-4-flash · 3 条 AI 流   零依赖 Node :8787</pre>
</div>

<div align="center">

[![English](https://img.shields.io/badge/lang-English-8b949e?style=for-the-badge&labelColor=0d1117)](README.md)
[![中文](https://img.shields.io/badge/lang-%E4%B8%AD%E6%96%87-295243?style=for-the-badge&labelColor=0d1117)](README.zh-CN.md)

</div>

## persona-dash

**开箱即用的个人成长工作台，面向人和编程 Agent**

可在 localhost 直接跑的每日成长工作台。数据面的**默认目标**是本地文件夹（零账号）。当前已落地的适配器是 [明道云 HAP](https://www.mingdao.com) 工作表（经 `server/`）；飞书文档 / 腾讯文档，以及 workbuddy、飞书 webapp、妙搭同签名 `capabilityClient` 等宿主接入在路线图上。AI 仍走关键路径：一句话拆子任务、一句话生成学习模块、参考图生成任务描述。

![status](https://img.shields.io/badge/status-oss-295243?style=flat-square)
![data](https://img.shields.io/badge/data-%E6%9C%AC%E5%9C%B0%E4%BC%98%E5%85%88%20%C2%B7%20%E5%8F%AF%E6%8F%92%E6%8B%94-555555?style=flat-square)
![ai](https://img.shields.io/badge/ai-glm--4--flash%20%C2%B7%203%20%E6%9D%A1%20AI%20%E6%B5%81-295243?style=flat-square)
![runtime](https://img.shields.io/badge/runtime-%E9%9B%B6%E4%BE%9D%E8%B5%96%20Node%20%E2%89%A5%2018-555555?style=flat-square)
![hosts](https://img.shields.io/badge/hosts-localhost%20%C2%B7%20%E5%8F%AF%E5%B5%8C%E5%85%A5-555555?style=flat-square)

面向 ToC 用户与编程 Agent 宿主（Codex、WorkBuddy、QCoder、Qwen Work、豆包工作等）：现在是普通 webapp，也按可嵌入 workbuddy / 飞书 / 妙搭能力 API 来设计。

***上手提示：***

1. 先读[定位](#定位)——本地文件夹默认目标 vs 当前已跑通的明道云适配器。
2. 跑一遍[运行](#运行)里的三条命令——配置 `.env`、可选建库、启动。
3. 打开 `http://127.0.0.1:8787`——页脚显示后台状态；未配置 AI key 时，AI 入口自动降级本地演示语料。

---

## 定位

| 层 | 含义 |
| --- | --- |
| **数据面** | 可插拔。**默认目标：** 磁盘上的本地文件夹。**当前已交付：** 明道云 HAP 工作表，经 MCP（`get_record_list` / `batch_create_records` / `update_record`，Bearer PAT）。下一步：飞书文档 / 多维表格、腾讯文档 |
| **AI** | 智谱 glm-4-flash（OpenAI 兼容）在关键路径上：一句话任务 → 3–6 条可执行子任务；一句话 → 背单词/知识测验模块；参考图 → 流式生成任务描述 |
| **前端** | React 19 + Vite + Tailwind v4 工作台；调用妙搭同签名的 `capabilityClient`，宿主 shim 保持薄 |
| **宿主** | 开箱即用的 localhost webapp；可嵌入 workbuddy / 飞书 webapp / 妙搭 |
| **降级** | 后端不可达 → 本地种子数据，页面不白屏；`AI_API_KEY` 未配置 → 本地演示语料，功能不缺失 |

## 流水线

```text
web/                      React 19 工作台
  │  fetch /api/cap/:plugin/:method   ← capabilityClient 同签名 shim，UI 层零改动
  ▼
server/                   零依赖 Node — API + 静态托管，端口 8787
  ├─ 数据适配器（当前：hap.js → 明道云 HAP）
  │            （目标：本地文件夹 · 飞书 · 腾讯文档）
  └─ ai.js   ── OpenAI 兼容接口 ─────────►  智谱 glm-4-flash
  ▲
  └─ 适配器不可达 → 本地种子数据 · 无 AI key → 本地演示语料
```

| 流 | 输入 | 输出 | 闸门 |
| --- | --- | --- | --- |
| **任务同步** | 界面上的勾选与新建 | 当前数据面中的记录变更 | 适配器不可达 → 本地种子数据 |
| **快速创建** | 一句话任务 | 3–6 条可执行子任务 | 无 `AI_API_KEY` → 本地演示拆解 |
| **我的模块** | 一句话 | 背单词 / 知识测验模块 | 无 `AI_API_KEY` → 本地演示语料 |
| **参考图 → 描述** | 参考图 | 流式生成、可直接使用的任务描述 | 无 `AI_API_KEY` → 本地演示 |

## 目录结构

| 路径 | 职责 |
| --- | --- |
| `web/` | React 19 + Vite + Tailwind v4 工作台 |
| `server/` | 零依赖 Node 代理——数据适配器 + 智谱 AI + 静态托管 |
| `scripts/` | `seed-mingdao.mjs`（可选明道云建库）、`mcp.mjs`、`gen-seed-csv.mjs` |
| `docs/` | `mingdao-setup.md`——可选明道云适配器说明 |
| `mingdao-seed/` | 手动导入明道云用的 CSV 备份 |

## 契约

| 契约 | 规则 |
| --- | --- |
| **数据面负责持久化** | 当前适配器是写入目标；应用自身不另设私有数据库 |
| **Shim 签名** | `web/` 调用妙搭同签名的 `capabilityClient`；`server/` 在 `/api/cap/:plugin/:method` 提供同形接口 |
| **优雅降级** | 适配器不可达 → 本地种子数据；`AI_API_KEY` 未配置 → 本地演示语料 |
| **密钥** | Token 与 AI key 只存在于 `server/.env`（已 git-ignore）；本公开仓库不含实例凭证 |

## 运行

前置：Node ≥ 18。当前可选：明道云**个人访问令牌**与应用 id（见 [`docs/mingdao-setup.md`](docs/mingdao-setup.md)）。可选：[智谱](https://open.bigmodel.cn) API key。没有明道云凭证时，界面仍可用本地种子数据启动。

```bash
# 1. 配置
cp server/.env.example server/.env
#    可选：MINGDAO_PAT=pat_xxx 与 MD_APP_ID=...
#    可选：AI_API_KEY=...

# 2. 可选 — 一键建明道云工作表（幂等）
node scripts/seed-mingdao.mjs

# 3. 启动
node server/index.js          # 同源托管 API + 前端构建产物，端口 8787
# 或前端开发模式
cd web && npm install && npm run dev   # Vite 开发服务器将 /api 代理到 8787
```

打开 `http://127.0.0.1:8787`。

## 部署与运维

| 主题 | 做法 |
| --- | --- |
| **部署** | 任何 Node 主机均可。以 [Zeabur](https://zeabur.com) 为例：推送仓库 → 用 `server/` 建一个服务（同时托管 `web/dist`）→ 按 `server/.env.example` 配置环境变量 |
| **嵌入** | 把 HTTPS 链接放进宿主 webview / 自定义页面（workbuddy、飞书、明道云嵌入 URL 等） |
| **明道云适配器** | `scripts/seed-mingdao.mjs` 幂等；细节见 [`docs/mingdao-setup.md`](docs/mingdao-setup.md) |

## 许可

[MIT](LICENSE)。

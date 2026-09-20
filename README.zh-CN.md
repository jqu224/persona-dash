<div align="center">
  <img src="docs/assets/hero.svg" alt="persona-dash — 跑在明道云工作表上的个人成长工作台" width="100%">
</div>

<div align="center">
<pre>~/persona-dash (main*)   明道云后端 · 6 张工作表   glm-4-flash · 3 条 AI 流   零依赖 Node :8787</pre>
</div>

<div align="center">

[![English](https://img.shields.io/badge/lang-English-8b949e?style=for-the-badge&labelColor=0d1117)](README.md)
[![中文](https://img.shields.io/badge/lang-%E4%B8%AD%E6%96%87-61B65D?style=for-the-badge&labelColor=0d1117)](README.zh-CN.md)

</div>

## persona-dash

**把零代码平台当数据库的成长工作台**

一个每日成长工作台：每一张卡、每一条任务、每一格进度都是[明道云 HAP](https://www.mingdao.com)工作表里的真实记录——AI 真实参与关键任务：一句话拆解子任务、一句话生成学习模块、参考图生成任务描述。

![status](https://img.shields.io/badge/status-live-61B65D?style=flat-square)
![backend](https://img.shields.io/badge/backend-%E6%98%8E%E9%81%93%E4%BA%91%20HAP%20%C2%B7%206%20%E5%BC%A0%E5%B7%A5%E4%BD%9C%E8%A1%A8-919DF4?style=flat-square)
![ai](https://img.shields.io/badge/ai-glm--4--flash%20%C2%B7%203%20%E6%9D%A1%20AI%20%E6%B5%81-61B65D?style=flat-square)
![runtime](https://img.shields.io/badge/runtime-%E9%9B%B6%E4%BE%9D%E8%B5%96%20Node%20%E2%89%A5%2018-8b949e?style=flat-square)
![target](https://img.shields.io/badge/target-%E4%B8%AA%E4%BA%BA%E6%88%90%E9%95%BF%E5%B7%A5%E4%BD%9C%E5%8F%B0-919DF4?style=flat-square)

管理侧零代码，关键路径上是真实 AI——在明道云里改字段、建视图、配自动化，应用照常运行。

***上手提示：***

1. 先读 [`docs/mingdao-setup.md`](docs/mingdao-setup.md)——PAT 鉴权、应用 id、6 张工作表如何一键建库。
2. 跑一遍[运行](#运行)里的三条命令——配置 `.env`、建库、启动。
3. 打开 `http://127.0.0.1:8787`——页脚显示后台已接入即成功；未配置 AI key 时，AI 入口自动降级本地演示语料。

---

## 定位

大多数「AI 工作台」演示把界面接在一份 mock JSON 上就止步了。这个仓库把技术栈反过来：零代码平台持有数据，AI 承担真实的写作任务，React 应用只是上面的一层薄工作台。

| 层 | 含义 |
| --- | --- |
| **数据** | 明道云工作表是唯一事实源——每一张卡、每一条任务、每一格进度都通过官方 MCP 通道（`get_record_list` / `batch_create_records` / `update_record`，Bearer PAT 鉴权）读写真实记录 |
| **AI** | 智谱 glm-4-flash（OpenAI 兼容）在关键路径上：一句话任务 → 3–6 条可执行子任务；一句话 → 背单词/知识测验模块；参考图 → 流式生成任务描述 |
| **前端** | React 19 + Vite + Tailwind v4 工作台，自妙搭导出代码去平台化；仍然调用妙搭同签名的 `capabilityClient` |
| **降级** | 后端不可达 → 本地种子数据，页面永不白屏；`AI_API_KEY` 未配置 → 本地演示语料，功能永不缺失 |

## 流水线

```text
web/                      React 19 工作台
  │  fetch /api/cap/:plugin/:method   ← capabilityClient 同签名 shim，UI 层零改动
  ▼
server/                   零依赖 Node — API + 静态托管，端口 8787
  ├─ hap.js  ── MCP 通道（Bearer PAT）──►  明道云 HAP · 6 张工作表
  └─ ai.js   ── OpenAI 兼容接口 ─────────►  智谱 glm-4-flash
  ▲
  └─ 明道云不可达 → 本地种子数据 · 无 AI key → 本地演示语料
```

| 流 | 输入 | 输出 | 闸门 |
| --- | --- | --- | --- |
| **任务同步** | 界面上的勾选与新建 | 工作表里的真实记录变更（`batch_create_records` / `update_record`） | 明道云不可达 → 本地种子数据 |
| **快速创建** | 一句话任务 | 3–6 条可执行子任务 | 无 `AI_API_KEY` → 本地演示拆解 |
| **我的模块** | 一句话 | 背单词 / 知识测验模块 | 无 `AI_API_KEY` → 本地演示语料 |
| **参考图 → 描述** | 参考图 | 流式生成、可直接使用的任务描述 | 无 `AI_API_KEY` → 本地演示 |

## 目录结构

| 路径 | 职责 |
| --- | --- |
| `web/` | React 19 + Vite + Tailwind v4 工作台 |
| `server/` | 零依赖 Node 代理——明道云 MCP + 智谱 AI + 静态托管 |
| `scripts/` | `seed-mingdao.mjs`（一键建库）、`mcp.mjs`（HAP MCP 命令行助手）、`gen-seed-csv.mjs`（CSV 导出） |
| `docs/` | `mingdao-setup.md`——后台搭建与鉴权说明 |
| `mingdao-seed/` | 手动导入用的 CSV 备份 |

## 契约

| 契约 | 规则 |
| --- | --- |
| **平台持有数据** | 工作表是唯一写入目标——管理员在明道云里改字段、建视图、配自动化，应用照常工作；应用自身不另设数据库 |
| **Shim 签名** | `web/` 仍调用妙搭同签名的 `capabilityClient`；`server/` 在 `/api/cap/:plugin/:method` 上提供同形接口，UI 层零改动 |
| **优雅降级** | 后端不可达 → 本地种子数据；`AI_API_KEY` 未配置 → 本地演示语料。不白屏、不死按钮 |
| **密钥** | PAT 与 AI key 只存在于 `server/.env`（已 git-ignore）；本仓库不含实例标识——真实运行的实例放在独立私有仓库 |

## 运行

前置：Node ≥ 18；一个明道云账号及**个人访问令牌**（头像 → 授权与访问 → 添加）；可选一个[智谱](https://open.bigmodel.cn) API key。

```bash
# 1. 配置
cp server/.env.example server/.env
#    填 MINGDAO_PAT=pat_xxx（以及你的 MD_APP_ID）

# 2. 一键建库（幂等）：自动创建 6 张工作表并灌入种子数据
node scripts/seed-mingdao.mjs

# 3. 启动
node server/index.js          # 同源托管 API + 前端构建产物，端口 8787
# 或前端开发模式
cd web && npm install && npm run dev   # Vite 开发服务器将 /api 代理到 8787
```

打开 `http://127.0.0.1:8787`，页脚显示后台已接入即成功。

## 部署与运维

| 主题 | 做法 |
| --- | --- |
| **部署** | 任何 Node 主机均可。以 [Zeabur](https://zeabur.com) 为例：推送仓库 → 用 `server/` 建一个服务（已同时托管 `web/dist`）→ 按 `server/.env.example` 配置环境变量 |
| **嵌入** | 把 HTTPS 链接放进明道云自定义页面的「嵌入 URL」组件——工作台变成一个原生观感的 HAP 页面 |
| **建库** | `scripts/seed-mingdao.mjs` 幂等，可随时重跑；细节见 [`docs/mingdao-setup.md`](docs/mingdao-setup.md) |

## 许可

[MIT](LICENSE)。

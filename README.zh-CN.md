# persona-dash · 个人成长后台

**每日成长工作台** — 以[明道云 HAP](https://www.mingdao.com)工作表为唯一数据后端的成长工作台，AI 真实参与关键任务：自动拆解子任务、一句话生成学习模块、参考图流式生成任务描述。

[English](README.md) | 简体中文

## 为什么这是「真实可用的 AI」

- **真后端，非演示**：页面上的每一张卡、每一条任务、每一格进度，都通过明道云官方开放接口（MCP 通道 + 个人访问令牌）读写工作表。把任务点成「已完成」，明道云里那行记录真的变了。
- **AI 在关键任务上**：「+ 快速创建」用大模型把一句话拆成 3–6 条可执行子任务；「我的模块」一句话生成背单词/知识测验模块；上传参考图流式生成任务描述。
- **零代码平台当数据层**：管理员在明道云里改字段、建视图、配自动化，前端照常工作；后端不可达时自动降级本地种子数据，页面永不白屏。

## 架构

```
浏览器
  └─ web/                 React 19 + Vite 工作台（自妙搭导出代码去平台化）
        │  fetch /api/cap/:plugin/:method   （capabilityClient 同签名 shim，UI 层零改动）
        ▼
server/                  Node ≥18，零依赖
  ├─ hap.js              → 明道云官方 MCP 通道（https://api.mingdao.com/mcp，Bearer PAT）
  │                        get_record_list / batch_create_records / update_record
  └─ ai.js               → 智谱 glm-4-flash（OpenAI 兼容），prompts 1:1 迁移
        ▼
明道云工作表             6 张：工种角色 / 入职任务 / 工作工具 / 知识测验题库 / 团队成员 / 工具教程
```

## 快速开始

前置：Node ≥ 18；一个明道云账号及**个人访问令牌**（头像 → 授权与访问 → 添加）；可选一个[智谱](https://open.bigmodel.cn) API key 用于 AI 能力。

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

打开 `http://127.0.0.1:8787`，页脚显示后台已接入即成功。未配置 AI_API_KEY 时 AI 入口走本地演示词库/题库，功能不缺失。

## 部署

任何 Node 主机均可。以 [Zeabur](https://zeabur.com) 为例：推送本仓库 → 用 `server/` 建一个服务（`server/index.js` 已同时托管 `web/dist` 静态产物）→ 按 `server/.env.example` 配置环境变量 → 完成。得到的 HTTPS 链接可通过明道云自定义页面的「嵌入 URL」组件嵌入应用。

## 目录结构

```
web/       React 19 + Vite + Tailwind v4 工作台
server/    零依赖 Node 代理：明道云 MCP + 智谱 AI + 静态托管
scripts/   seed-mingdao.mjs（一键建库）、mcp.mjs（HAP MCP 命令行助手）、gen-seed-csv.mjs（CSV 导出）
docs/      mingdao-setup.md — 后台搭建与鉴权说明
mingdao-seed/  手动导入用的 CSV 备份
```

## 安全说明

密钥（PAT、AI key）只存在于 `server/.env`（已 git-ignore）。本开源仓库不含任何实例标识；真实运行的实例与配置放在独立的私有仓库中。

## 许可

[MIT](LICENSE)

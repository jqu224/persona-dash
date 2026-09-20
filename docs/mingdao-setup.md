# 明道云后台搭建（已自动化 ✅）

> 2026-09-20 更新：后台已通过 PAT + MCP 通道**全自动建好**，无需手动操作。
> 本文档保留作为架构说明与重建指南。

## 已完成的自动化内容

运行 `node scripts/seed-mingdao.mjs`（幂等，可重复执行）自动完成：

1. 在应用「小笼 AI 个人平台」（`appId 977a582e-4874-4143-9676-e6310b9c1a17`）下创建 6 张工作表：
   - `工种角色`（roles）— 切换身份的演示身份
   - `入职任务`（tasks）— 任务看板与成长地图数据源；任务状态单选带色板（未开始/进行中/已完成）
   - `工作工具`（worktools）— 工具中心；掌握程度 0-1 数值 + 必修复选框
   - `知识测验题库`（quiz）— 答题闯关；错误选项用「、」分隔
   - `团队成员`（members）— 伙伴与提问页
   - `工具教程`（tutorials）— 教程列表；难度单选 + 必修复选框
2. 灌入种子数据（与前端本地兜底数据同源：4/8/6/5/3/4 行）。
3. 把各表 `worksheetId` 写入 `server/.env`。

## 鉴权方式：个人访问令牌（PAT）

- 创建位置：明道云头像 →【授权与访问】→【添加】（设置名称/有效期/应用范围/接口范围）
- 传输：`Authorization: Bearer pat_xxx`，走官方 MCP 通道 `https://api.mingdao.com/mcp`（Streamable HTTP JSON-RPC）
- 前置：组织管理需开启「API 访问策略 → 个人访问令牌」
- 本地配置在 `server/.env`（已 gitignore，绝不入库）：`MINGDAO_PAT=pat_…`
- 通道能力：应用/工作表/记录/视图/图表/自定义页面/工作流/对话机器人 全量工具（`node scripts/mcp.mjs --tools` 可列出全部 100+ 工具）

## 重建（换组织/换应用时）

```bash
# 1. server/.env 填 MINGDAO_PAT（和 MD_APP_ID 如换应用）
# 2. 一键建表+灌数
node scripts/seed-mingdao.mjs
# 3. 起服务验证
node server/index.js   # GET /api/health 应显示 mingdao:true 且 6 表 ok
```

## 传统方式（备用）

`mingdao-seed/` 下的 6 个 CSV 仍可用于手工导入（工作表「从 Excel 导入」）；应用级 appKey+sign 授权密钥路径未启用（PAT 已满足全部需求）。

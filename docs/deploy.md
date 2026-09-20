# 部署指南（实际路线：Zion 静态托管 + 浏览器直连明道云）

> 2026-09-20 定稿：项目最终采用「**Zion Static Site Hosting 托管前端 + 浏览器直连明道云 v2 开放 API**」。
> 无需任何服务器：前端是纯静态文件，数据面由明道云官方 API（应用授权密钥 appKey/sign，官方支持 CORS）承担。

## 架构（零服务器）

```
浏览器（评委/用户）
  ├─ 静态页面      ← Zion static site（*.cave.functorz-app.com，国内直连）
  └─ 数据读写      ← 直连 api.mingdao.com/v2/open/worksheet/*（appKey+sign 随请求体）
```

- 前端 `web/` 构建产物由 Zion CLI `site deploy` 部署（见下）。
- 数据全部落在明道云工作表；字段别名在明道云里设置一次即可。
- **安全边界**：`appKey/sign` 是应用级授权密钥（官方设计用于外部门户等 C 端直连场景），可以放前端；
  PAT（个人访问令牌）代表个人身份，绝不可放前端——它只在本地开发模式（server/ 代理）使用。

## 步骤

### 1. 明道云准备（一次性）
- 一键建表 + 种子数据：`node scripts/seed-mingdao.mjs`（走 PAT + MCP 通道）
- 应用内「API 开发文档 → 应用授权 → 新建授权密钥」拿 `appKey` / `sign`

### 2. 前端配置
- 复制 `web/public/config.example.js` 为 `config.js`（实例仓库已放真实值）
- 填 `appKey` / `sign` 和每张表的 `worksheetId` / `viewId`（seed 脚本会写进 server/.env，视图 ID 用各表「全部」视图）

### 3. Zion 部署
```bash
cd web && npm install && npm run build
# 把实例 config.js 覆盖进构建产物
cp ../persona-dash-eg/web/public/config.js dist/config.js   # 实例仓库路径按实际调整
# 登录（开浏览器一次性授权）
npx -y zion-mcp@2.7.7 login --no-daemon
npx -y zion-mcp@2.7.7 project set-current --projectExId <Zion项目ExId>
npx -y zion-mcp@2.7.7 site deploy --dir web/dist --target BETA --no-daemon
```
返回的 `siteUrl` 即体验链接（HTTPS，国内直连）。`--target PROD` 需要人工在 GUI 确认。

### 4. 明道云嵌入（加分项）
应用内新建自定义页面 → 用「嵌入 URL」组件放体验链接 → 可按需开启公开分享（仅应用管理员，UI 操作）。
（也可用 MCP：`create_app_items` 建页面 + `update_custom_page` 放 `componentType:"html"` 组件。）

## 历史路线（已弃用，留档）

- Zeabur / CloudBase / Sealos 服务器方案：见 git 历史 `docs/deploy.md` 早期版本。因「零服务器直连」可行且更优雅而弃用。
- 本地代理 server/：保留用于开发（PAT + 智谱 AI），生产不需要它。

## 常见问题

- **页面显示「当前为本地演示数据」**：config.js 没被加载或缓存。检查 `index.html` 里 `<script src="/config.js?v=N">` 的版本号，改号后重新部署。
- **明道云 API 报 10001 参数缺少**：v2 接口的 `appKey/sign` 必须放在 JSON body；`rowid` 是小写；单选字段直接传字符串。
- **AI 能力在直连模式下不可用**：AI 走本地代理（server/）或后续接 Zion BaaS 行为流；前端已内置本地兜底，功能不缺失。

# 部署指南（国内直连优先）

> 硬约束：体验链接要给国内评委打开。需要「国内直连 + 自带 HTTPS 域名（免备案）+ 能跑 Node/容器」。
> 海外平台（Vercel/Netlify/Render/Fly 等默认域名在国内时通时断）不推荐。

## 路线 A（推荐）：腾讯云 CloudBase 云托管（CloudBase Run）

理由：国内直连、平台提供 HTTPS 默认域名（`*.tcloudbaseapp.com`，免备案）、按量计费（新用户有试用额度，跑这个 demo 每天几分钱量级）、支持直接从 GitHub 导入或上传镜像/代码。

步骤：
1. 微信扫码登录 [腾讯云 CloudBase 控制台](https://tcb.cloud.tencent.com/)（需实名认证，个人即可）。
2. 创建云开发环境（按量付费环境即可）。
3. 云托管 → 新建服务：
   - 接入方式：**GitHub 仓库**（选 `jqu224/private-persona-dash-eg`）或「上传代码」/ 镜像（仓库里有 `Dockerfile`，直接选 Dockerfile 构建）
   - 监听端口：`8080`（平台会注入 `PORT` 环境变量，服务自动适配）
   - 实例副本数：最小 0（省钱，冷启动几秒）或最小 1（演示期更稳）
4. 配置环境变量：把 `server/.env` 里的键值逐条填入（MINGDAO_PAT / MD_APP_ID / MD_WS_* / AI_API_KEY 可选）。
5. 发布版本 → 拿到默认域名 URL（HTTPS）→ 发给我，我接着配明道云嵌入。

## 路线 B：Sealos 容器云（最快，3 分钟）

理由：国内节点直连、支付宝充值几块钱即可、无备案、自带 HTTPS 域名。

步骤：
1. 登录 [sealos.run](https://sealos.run)（手机号即可）→ 充值最低额度。
2. 「应用管理」→ 部署应用 → 镜像：本地 `docker build -t persona-dash .` 后推到任意镜像仓库（或用 Sealos 的代码构建）。
3. 端口 8080 → 开公网 → 得到 HTTPS 域名。
4. 环境变量同上。

## 路线 C（兜底，仅演示视频用）：本机运行 + 内网穿透

`node server/index.js` + cpolar/花生壳/飞牛等穿透工具拿临时 HTTPS 域名。**不适合评委长期体验**（电脑要一直开机、带宽小），只用于录制演示视频。

## 不推荐

- Vercel / Netlify / Render / Fly.io / Cloudflare Pages：默认域名在国内不稳或被污染，评委打不开的风险不可接受。
- GitHub Pages：纯静态，承载不了 API 代理。

## 部署完成后

把 HTTPS URL 发给助手：会用明道云 MCP 的 `create_custom_page` 在应用里自动建「嵌入 URL」自定义页面并开启公开分享，无需手动操作。

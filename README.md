# persona-dash · Personal Growth Workspace

**个人成长后台 · 每日成长工作台** — a growth workspace where [Mingdao HAP](https://www.mingdao.com) worksheets are the single data backend, and AI genuinely joins the loop: auto-splitting tasks, generating learning modules, and writing task descriptions from reference images.

English | [简体中文](README.zh-CN.md)

## Why this is "real AI"

- **Real backend, not mock**: every card, task and progress bar you see is read from / written to Mingdao HAP worksheets through the official open API (MCP channel, PAT auth). Toggle a task to "已完成" and the worksheet row actually changes.
- **AI in critical tasks, not window dressing**: the "+ 快速创建" flow calls an LLM to split a one-line task into 3–6 executable subtasks; "我的模块" generates vocabulary/quiz modules from one sentence; a reference image can be streamed into a ready-to-use task description.
- **Zero-code platform as the data layer**: admins can reshape fields, views and automations in Mingdao while the app keeps working — the frontend degrades gracefully to local seed data when the backend is unreachable.

## Architecture

```
Browser
  └─ web/                 React 19 + Vite workbench (de-platformed from a Miaoda export)
        │  fetch /api/cap/:plugin/:method   (capabilityClient-shaped shim, UI untouched)
        ▼
server/                  Node ≥18, zero-dependency
  ├─ hap.js              → Mingdao HAP official MCP channel (https://api.mingdao.com/mcp, Bearer PAT)
  │                        get_record_list / batch_create_records / update_record
  └─ ai.js               → Zhipu glm-4-flash (OpenAI-compatible), prompts migrated 1:1
        ▼
Mingdao HAP worksheets   6 tables: roles / tasks / worktools / quiz / members / tutorials
```

## Quick start

Prerequisites: Node ≥ 18, a Mingdao HAP account with a **Personal Access Token** (avatar → Authorization & Access → Add), optionally a [Zhipu](https://open.bigmodel.cn) API key for the AI features.

```bash
# 1. configure
cp server/.env.example server/.env
#    fill MINGDAO_PAT=pat_xxx   (and MD_APP_ID to your HAP app id)

# 2. provision the backend (idempotent): creates 6 worksheets + seed rows
node scripts/seed-mingdao.mjs

# 3. run
node server/index.js          # serves API + built frontend on :8787
# or for frontend development
cd web && npm install && npm run dev   # Vite dev server proxies /api to :8787
```

Open `http://127.0.0.1:8787` — the footer should say the backend is live. Until AI_API_KEY is set, AI entry points fall back to local demos.

## Deploy

Any Node host works. With [Zeabur](https://zeabur.com): push this repo, create one service from `server/` (or serve the built `web/dist` from the same service — `server/index.js` already does), set the env vars from `server/.env.example`, done. The HTTPS URL can then be embedded into a Mingdao custom page via the "Embed URL" component.

## Repo layout

```
web/       React 19 + Vite + Tailwind v4 workbench
server/    zero-dep Node proxy: HAP MCP + Zhipu AI + static hosting
scripts/   seed-mingdao.mjs (provision), mcp.mjs (HAP MCP CLI helper), gen-seed-csv.mjs (CSV export)
docs/      mingdao-setup.md — backend provisioning & auth notes
mingdao-seed/  CSV fallback for manual import
```

## Security notes

Secrets (PAT, AI keys) live only in `server/.env`, which is git-ignored. The open-source repo contains no instance identifiers. This project is the generic setup; a running instance with real config lives in a separate private repo.

## License

[MIT](LICENSE)

<div align="center">
  <img src="docs/assets/hero.svg" alt="persona-dash — personal growth workspace on a Mingdao HAP backend" width="100%">
</div>

<div align="center">
<pre>~/persona-dash (main*)   mingdao hap · 6 worksheets   glm-4-flash · 3 ai flows   zero-dep node :8787</pre>
</div>

<div align="center">

[![English](https://img.shields.io/badge/lang-English-61B65D?style=for-the-badge&labelColor=0d1117)](README.md)
[![中文](https://img.shields.io/badge/lang-%E4%B8%AD%E6%96%87-8b949e?style=for-the-badge&labelColor=0d1117)](README.zh-CN.md)

</div>

## persona-dash

**The growth workspace where the no-code platform is the database**

A daily growth workbench where every card, task and progress bar is a real [Mingdao HAP](https://www.mingdao.com) worksheet row — and AI genuinely joins the loop: splitting one-line tasks into subtasks, generating learning modules from a sentence, writing task descriptions from a reference image.

![status](https://img.shields.io/badge/status-live-61B65D?style=flat-square)
![backend](https://img.shields.io/badge/backend-mingdao%20hap%20%C2%B7%206%20worksheets-919DF4?style=flat-square)
![ai](https://img.shields.io/badge/ai-glm--4--flash%20%C2%B7%203%20flows-61B65D?style=flat-square)
![runtime](https://img.shields.io/badge/runtime-zero%20dep%20node%20%E2%89%A5%2018-8b949e?style=flat-square)
![target](https://img.shields.io/badge/target-personal%20growth%20workspace-919DF4?style=flat-square)

Zero-code on the admin side, real AI on the critical path — reshape fields, views and automations in HAP while the app keeps running.

***Tips for getting started:***

1. Read [`docs/mingdao-setup.md`](docs/mingdao-setup.md) — PAT auth, app id, and how the 6 worksheets get provisioned.
2. Run the three commands in [Run it](#run-it) — configure `.env`, seed the backend, start the server.
3. Open `http://127.0.0.1:8787` — the footer confirms the backend is live; AI entry points degrade to local demo corpora until a key is set.

---

## Positioning

Most "AI workbench" demos wire the UI to a mock JSON file and stop there. This repo flips the stack: the zero-code platform owns the data, AI handles real writing jobs, and the React app stays a thin workbench on top.

| Layer | What it means |
| --- | --- |
| **Data** | Mingdao HAP worksheets are the single source of truth — every card, task and progress bar reads/writes real rows via the official MCP channel (`get_record_list` / `batch_create_records` / `update_record`, Bearer PAT auth) |
| **AI** | Zhipu glm-4-flash (OpenAI-compatible) on the critical path: one-line task → 3–6 executable subtasks; one sentence → vocabulary/quiz module; reference image → streamed task description |
| **Frontend** | React 19 + Vite + Tailwind v4 workbench, de-platformed from a Miaoda export; still calls the Miaoda-style `capabilityClient` |
| **Degradation** | Backend unreachable → local seed data, no white screens; `AI_API_KEY` unset → local demo corpora, no dead buttons |

## Pipeline

```text
web/                      React 19 workbench
  │  fetch /api/cap/:plugin/:method   ← capabilityClient-shaped shim, UI untouched
  ▼
server/                   zero-dependency Node — API + static hosting on :8787
  ├─ hap.js  ── MCP channel (Bearer PAT) ──►  Mingdao HAP · 6 worksheets
  └─ ai.js   ── OpenAI-compatible API ─────►  Zhipu glm-4-flash
  ▲
  └─ HAP unreachable → local seed data · no AI key → local demo corpora
```

| Flow | Input | Output | Gate |
| --- | --- | --- | --- |
| **Task sync** | toggles and creates in the UI | real row changes in the worksheets (`batch_create_records` / `update_record`) | HAP unreachable → local seed data |
| **Quick create** | one-line task | 3–6 executable subtasks | no `AI_API_KEY` → local demo split |
| **My modules** | one sentence | vocabulary / quiz module | no `AI_API_KEY` → local demo corpora |
| **Image → description** | reference image | streamed, ready-to-use task description | no `AI_API_KEY` → local demo |

## Repository layout

| Path | Role |
| --- | --- |
| `web/` | React 19 + Vite + Tailwind v4 workbench |
| `server/` | Zero-dependency Node proxy — HAP MCP + Zhipu AI + static hosting |
| `scripts/` | `seed-mingdao.mjs` (provisioning), `mcp.mjs` (HAP MCP CLI helper), `gen-seed-csv.mjs` (CSV export) |
| `docs/` | `mingdao-setup.md` — backend provisioning & auth notes |
| `mingdao-seed/` | CSV fallback for manual import |

## Contracts

| Contract | Rule |
| --- | --- |
| **Platform owns the data** | Worksheets are the only write target — admins reshape fields, views and automations in HAP while the app keeps working; the app keeps no private database |
| **Shim signature** | `web/` still calls the Miaoda-shaped `capabilityClient`; `server/` serves the same shape at `/api/cap/:plugin/:method`, so the UI layer needed zero rewrites |
| **Graceful degradation** | Backend unreachable → local seed data; `AI_API_KEY` unset → local demo corpora. No white screens, no dead buttons |
| **Secrets** | PAT and AI keys live only in `server/.env` (git-ignored); the repo contains no instance identifiers — the running instance lives in a separate private repo |

## Run it

Prerequisites: Node ≥ 18, a Mingdao HAP account with a **Personal Access Token** (avatar → Authorization & Access → Add), optionally a [Zhipu](https://open.bigmodel.cn) API key.

```bash
# 1. configure
cp server/.env.example server/.env
#    fill MINGDAO_PAT=pat_xxx (and MD_APP_ID with your HAP app id)

# 2. provision the backend (idempotent): creates 6 worksheets + seed rows
node scripts/seed-mingdao.mjs

# 3. run
node server/index.js          # serves API + built frontend on :8787
# or for frontend development
cd web && npm install && npm run dev   # Vite dev server proxies /api to :8787
```

Open `http://127.0.0.1:8787` — the footer should say the backend is live.

## For operators

| Topic | How |
| --- | --- |
| **Deploy** | Any Node host works. On [Zeabur](https://zeabur.com): push the repo → one service from `server/` (it already serves `web/dist`) → set the env vars from `server/.env.example` |
| **Embed** | Put the HTTPS URL into a Mingdao custom page via the "Embed URL" component — the workspace becomes a native-looking HAP page |
| **Provision** | `scripts/seed-mingdao.mjs` is idempotent — rerun any time; details in [`docs/mingdao-setup.md`](docs/mingdao-setup.md) |

## License

[MIT](LICENSE).

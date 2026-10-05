<div align="center">
  <img src="docs/assets/hero.svg" alt="persona-dash — personal growth workbench, local-first, pluggable data plane" width="100%">
</div>

<div align="center">
<pre>~/persona-dash (main*)   local-first · pluggable data plane   glm-4-flash · 3 ai flows   zero-dep node :8787</pre>
</div>

<div align="center">

[![English](https://img.shields.io/badge/lang-English-295243?style=for-the-badge&labelColor=0d1117)](README.md)
[![中文](https://img.shields.io/badge/lang-%E4%B8%AD%E6%96%87-8b949e?style=for-the-badge&labelColor=0d1117)](README.zh-CN.md)

</div>

## persona-dash

**An open-box personal growth workbench for people and coding agents**

A daily growth workspace you can run on localhost. The target default data plane is a **local folder** (zero account). Today the shipped adapter is [Mingdao HAP](https://www.mingdao.com) worksheets via `server/`; Feishu docs / Tencent docs and host shims (workbuddy, Feishu webapp, Miaoda-shaped `capabilityClient`) are on the roadmap. AI stays on the critical path: split one-line tasks, generate learning modules from a sentence, write task descriptions from a reference image.

![status](https://img.shields.io/badge/status-oss-295243?style=flat-square)
![data](https://img.shields.io/badge/data-local--first%20%C2%B7%20pluggable-555555?style=flat-square)
![ai](https://img.shields.io/badge/ai-glm--4--flash%20%C2%B7%203%20flows-295243?style=flat-square)
![runtime](https://img.shields.io/badge/runtime-zero%20dep%20node%20%E2%89%A5%2018-555555?style=flat-square)
![hosts](https://img.shields.io/badge/hosts-localhost%20%C2%B7%20embeddable-555555?style=flat-square)

Built for ToC users and agent hosts (Codex, WorkBuddy, QCoder, Qwen Work, Doubao Work, and peers): plain webapp now, embeddable under workbuddy / Feishu / Miaoda-shaped capability APIs.

***Tips for getting started:***

1. Skim [Positioning](#positioning) — local-folder default target vs the Mingdao adapter that runs today.
2. Run the three commands in [Run it](#run-it) — configure `.env`, optionally seed Mingdao, start the server.
3. Open `http://127.0.0.1:8787` — footer shows backend status; AI entry points degrade to local demo corpora until a key is set.

---

## Positioning

| Layer | What it means |
| --- | --- |
| **Data plane** | Pluggable. **Default target:** local folder on disk. **Shipped today:** Mingdao HAP worksheets over MCP (`get_record_list` / `batch_create_records` / `update_record`, Bearer PAT). Next: Feishu docs / bitable, Tencent docs |
| **AI** | Zhipu glm-4-flash (OpenAI-compatible) on the critical path: one-line task → 3–6 executable subtasks; one sentence → vocabulary/quiz module; reference image → streamed task description |
| **Frontend** | React 19 + Vite + Tailwind v4 workbench; calls a Miaoda-shaped `capabilityClient` so host shims stay thin |
| **Hosts** | Localhost webapp out of the box; designed to embed under workbuddy / Feishu webapp / Miaoda |
| **Degradation** | Backend unreachable → local seed data, no white screens; `AI_API_KEY` unset → local demo corpora, no dead buttons |

## Pipeline

```text
web/                      React 19 workbench
  │  fetch /api/cap/:plugin/:method   ← capabilityClient-shaped shim, UI untouched
  ▼
server/                   zero-dependency Node — API + static hosting on :8787
  ├─ data adapter (today: hap.js → Mingdao HAP)
  │                 (target: local folder · Feishu · Tencent docs)
  └─ ai.js   ── OpenAI-compatible API ─────►  Zhipu glm-4-flash
  ▲
  └─ adapter unreachable → local seed data · no AI key → local demo corpora
```

| Flow | Input | Output | Gate |
| --- | --- | --- | --- |
| **Task sync** | toggles and creates in the UI | row changes in the active data plane | adapter unreachable → local seed data |
| **Quick create** | one-line task | 3–6 executable subtasks | no `AI_API_KEY` → local demo split |
| **My modules** | one sentence | vocabulary / quiz module | no `AI_API_KEY` → local demo corpora |
| **Image → description** | reference image | streamed, ready-to-use task description | no `AI_API_KEY` → local demo |

## Repository layout

| Path | Role |
| --- | --- |
| `web/` | React 19 + Vite + Tailwind v4 workbench |
| `server/` | Zero-dependency Node proxy — data adapter + Zhipu AI + static hosting |
| `scripts/` | `seed-mingdao.mjs` (optional Mingdao provision), `mcp.mjs`, `gen-seed-csv.mjs` |
| `docs/` | `mingdao-setup.md` — optional Mingdao adapter setup |
| `mingdao-seed/` | CSV fallback for manual Mingdao import |

## Contracts

| Contract | Rule |
| --- | --- |
| **Data plane owns persistence** | The active adapter is the write target; the app keeps no private database of its own |
| **Shim signature** | `web/` calls Miaoda-shaped `capabilityClient`; `server/` serves the same shape at `/api/cap/:plugin/:method` |
| **Graceful degradation** | Adapter unreachable → local seed data; `AI_API_KEY` unset → local demo corpora |
| **Secrets** | Tokens and AI keys live only in `server/.env` (git-ignored); this public tree holds no instance credentials |

## Run it

Prerequisites: Node ≥ 18. Optional today: a Mingdao HAP **Personal Access Token** and app id (see [`docs/mingdao-setup.md`](docs/mingdao-setup.md)). Optional: a [Zhipu](https://open.bigmodel.cn) API key. Without Mingdao credentials the UI still boots on local seed data.

```bash
# 1. configure
cp server/.env.example server/.env
#    optional: MINGDAO_PAT=pat_xxx and MD_APP_ID=...
#    optional: AI_API_KEY=...

# 2. optional — provision Mingdao worksheets (idempotent)
node scripts/seed-mingdao.mjs

# 3. run
node server/index.js          # serves API + built frontend on :8787
# or for frontend development
cd web && npm install && npm run dev   # Vite dev server proxies /api to :8787
```

Open `http://127.0.0.1:8787`.

## For operators

| Topic | How |
| --- | --- |
| **Deploy** | Any Node host. On [Zeabur](https://zeabur.com): push the repo → one service from `server/` (serves `web/dist`) → set env vars from `server/.env.example` |
| **Embed** | Point a host webview / custom page at the HTTPS URL (workbuddy, Feishu, Mingdao embed URL, and similar) |
| **Mingdao adapter** | `scripts/seed-mingdao.mjs` is idempotent; details in [`docs/mingdao-setup.md`](docs/mingdao-setup.md) |

## License

[MIT](LICENSE).

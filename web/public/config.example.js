/**
 * persona-dash 运行时配置模板。
 * 复制为 config.js 并按注释填写：
 *   1. mode 默认 direct（浏览器直连明道云 v2 开放 API）
 *   2. appKey/sign：明道云应用 →「API 开发文档」→「应用授权」→ 新建授权密钥（应用级，可放前端）
 *   3. tables：每张工作表的 worksheetId 与任一视图 viewId（应用内 API 开发文档可查）
 *      —— 一键建库脚本 node scripts/seed-mingdao.mjs 会在 server/.env 里给出 worksheetId。
 *
 * ⚠️ 安全边界：PAT（个人访问令牌）绝不可放这里，它代表个人身份。
 */
window.__PD_CONFIG__ = {
  mode: 'direct',
  apiBase: 'https://api.mingdao.com',
  appKey: '',
  sign: '',
  tables: {
    role: { worksheetId: '', viewId: '' },
    task: { worksheetId: '', viewId: '' },
    worktool: { worksheetId: '', viewId: '' },
    quiz: { worksheetId: '', viewId: '' },
    member: { worksheetId: '', viewId: '' },
    tutorial: { worksheetId: '', viewId: '' },
  },
};

/**
 * 明道云自动建库：在工作表应用「小笼 AI 个人平台」里创建 6 张工作表并灌入种子数据。
 * 幂等：已存在的表（按 worksheet alias 匹配）跳过创建、跳过灌数。
 *
 * 用法：node scripts/seed-mingdao.mjs
 * 依赖：server/.env 里的 MINGDAO_PAT（MCP 通道）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(resolve(ROOT, 'server/.env'))) {
  for (const line of readFileSync(resolve(ROOT, 'server/.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const PAT = process.env.MINGDAO_PAT;
if (!PAT) throw new Error('缺少 MINGDAO_PAT');
const APP_ID = process.env.MD_APP_ID || '977a582e-4874-4143-9676-e6310b9c1a17';
const MCP_URL = process.env.MINGDAO_MCP_URL || 'https://api.mingdao.com/mcp';

let rpcId = 0;
async function callTool(name, args = {}) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${PAT}` },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method: 'tools/call', params: { name, arguments: args } }),
  });
  const text = await res.text();
  const dataLine = text.split('\n').find(l => l.startsWith('data:'));
  const payload = JSON.parse(dataLine ? dataLine.slice(5) : text);
  if (payload.error) throw new Error(`${name} RPC 错误：${JSON.stringify(payload.error).slice(0, 400)}`);
  if (payload.result?.isError) throw new Error(`${name} 执行失败：${JSON.stringify(payload.result.content).slice(0, 600)}`);
  const sc = payload.result?.structuredContent;
  if (sc) return sc;
  const texts = (payload.result?.content ?? []).filter(c => c.type === 'text').map(c => c.text);
  try {
    return JSON.parse(texts.join('\n'));
  } catch {
    return texts.join('\n');
  }
}

const log = (...a) => console.log(...a);

/* ===== 字段定义：f(名, 别名, 类型, 行, 跨度, 额外) ===== */
const f = (name, alias, type, row, span, extra = {}) => ({ name, alias, type, layout: { rowIndex: row, span }, ...extra });

const TABLES = [
  {
    key: 'ROLE',
    alias: 'roles',
    name: '工种角色',
    remark: '工作台「切换身份」演示身份。字段：角色名称/入职周期周数/部门。',
    fields: [
      f('角色名称', 'biz_role_name', 'Text', 0, 6, { isTitle: true }),
      f('入职周期周数', 'biz_role_weeks', 'Number', 0, 3, { precision: 0 }),
      f('部门', 'biz_role_dept', 'Text', 0, 3),
    ],
    rows: [
      [['角色名称', '张小明'], ['入职周期周数', 1], ['部门', '产品部']],
      [['角色名称', '李一诺'], ['入职周期周数', 2], ['部门', '研发部']],
      [['角色名称', '王雨桐'], ['入职周期周数', 3], ['部门', '设计部']],
      [['角色名称', '陈小满'], ['入职周期周数', 4], ['部门', '运营部']],
    ],
  },
  {
    key: 'TASK',
    alias: 'tasks',
    name: '入职任务',
    remark: '任务看板与成长地图数据源。任务状态流转：未开始/进行中/已完成。',
    fields: [
      f('任务名称', 'biz_task_name', 'Text', 0, 12, { isTitle: true }),
      f('任务分类', 'biz_task_cat', 'SingleSelect', 1, 6, {
        options: [
          { value: '熟悉工友', index: 1 },
          { value: '熟悉工具', index: 2 },
          { value: '熟悉业务', index: 3 },
          { value: '熟悉项目', index: 4 },
        ],
      }),
      f('任务状态', 'biz_task_status', 'SingleSelect', 1, 6, {
        config: { isColorOptions: true },
        options: [
          { value: '未开始', index: 1, color: '#484848' },
          { value: '进行中', index: 2, color: '#2D46C4' },
          { value: '已完成', index: 3, color: '#00C345' },
        ],
      }),
      f('阶段', 'biz_task_phase', 'Text', 2, 6),
      f('所属工种', 'biz_task_role', 'Text', 2, 6),
      f('任务描述', 'biz_task_desc', 'Text', 3, 12, { config: { textMode: 'multiLine' } }),
    ],
    rows: [
      [['任务名称', '完成安全培训与账号开通'], ['任务描述', '跟着《入职日程》Day 0 完成，领完电脑后 30 分钟可搞定。'], ['任务分类', ['熟悉工具']], ['任务状态', ['已完成']], ['阶段', 'Week 1'], ['所属工种', '张小明']],
      [['任务名称', '安装飞书、代码平台、VPN'], ['任务描述', 'P0 软件清单前三项，安装遇到权限问题走 IT 工单。'], ['任务分类', ['熟悉工具']], ['任务状态', ['已完成']], ['阶段', 'Week 1'], ['所属工种', '张小明']],
      [['任务名称', '约导师 1 对 1，聊本周任务'], ['任务描述', '带上「我想知道团队在做什么 + 我第一周做什么」。'], ['任务分类', ['熟悉工友']], ['任务状态', ['进行中']], ['阶段', 'Week 1'], ['所属工种', '张小明']],
      [['任务名称', '跑通本地构建与单元测试'], ['任务描述', '按团队 wiki 的前端项目规范执行，卡住先查 README。'], ['任务分类', ['熟悉工具']], ['任务状态', ['未开始']], ['阶段', 'Week 1'], ['所属工种', '张小明']],
      [['任务名称', '认识产品、设计、数据三方接口人'], ['任务描述', '约 15 分钟认识你的上下游，记住谁管什么。'], ['任务分类', ['熟悉工友']], ['任务状态', ['未开始']], ['阶段', 'Week 2'], ['所属工种', '张小明']],
      [['任务名称', '读懂团队 OKR 与指标口径'], ['任务描述', '先对齐「指标怎么算」，再讨论数字才有意义。'], ['任务分类', ['熟悉业务']], ['任务状态', ['未开始']], ['阶段', 'Week 2'], ['所属工种', '张小明']],
      [['任务名称', '走完第一个真实 case 的提交流程'], ['任务描述', '修 bug 或写小功能，完成第一个 MR/PR。'], ['任务分类', ['熟悉项目']], ['任务状态', ['未开始']], ['阶段', 'Week 3'], ['所属工种', '张小明']],
      [['任务名称', '整理 30-60-90 天成长计划'], ['任务描述', '和导师对齐前 30/60/90 天的目标与检查点。'], ['任务分类', ['熟悉业务']], ['任务状态', ['未开始']], ['阶段', 'Week 3'], ['所属工种', '张小明']],
    ],
  },
  {
    key: 'WORKTOOL',
    alias: 'worktools',
    name: '工作工具',
    remark: '工具中心页数据源。掌握程度存 0-1 小数。',
    fields: [
      f('工具名称', 'biz_tool_name', 'Text', 0, 6, { isTitle: true }),
      f('工具分类', 'biz_tool_cat', 'SingleSelect', 0, 6, {
        options: [
          { value: '开发工具', index: 1 },
          { value: '协作办公', index: 2 },
          { value: '设计工具', index: 3 },
          { value: '数据工具', index: 4 },
          { value: 'HR系统', index: 5 },
          { value: '基础设施', index: 6 },
        ],
      }),
      f('掌握程度', 'biz_tool_mastery', 'Number', 1, 4, { precision: 2 }),
      f('是否必须掌握', 'biz_tool_required', 'Checkbox', 1, 4),
      f('一句话说明', 'biz_tool_brief', 'Text', 1, 4),
      f('使用指南', 'biz_tool_guide', 'Text', 2, 12, { config: { textMode: 'multiLine' } }),
    ],
    rows: [
      [['工具名称', 'Git'], ['工具分类', ['开发工具']], ['一句话说明', '分布式版本控制工具，用于代码版本管理'], ['掌握程度', 0.95], ['是否必须掌握', 1], ['使用指南', '安装后配置用户名邮箱，通过命令行提交代码']],
      [['工具名称', '飞书'], ['工具分类', ['协作办公']], ['一句话说明', '企业协作办公平台，支持即时通讯与文档协作'], ['掌握程度', 0.85], ['是否必须掌握', 1], ['使用指南', '注册企业账号，创建群组共享文件']],
      [['工具名称', 'Figma'], ['工具分类', ['设计工具']], ['一句话说明', '在线UI设计协作工具，支持原型制作'], ['掌握程度', 0.78], ['是否必须掌握', 1], ['使用指南', '创建设计文件，邀请团队成员共同编辑']],
      [['工具名称', 'Tableau'], ['工具分类', ['数据工具']], ['一句话说明', '数据可视化工具，用于制作交互式报表'], ['掌握程度', 0.65], ['是否必须掌握', 0], ['使用指南', '连接数据源，拖拽字段生成图表']],
      [['工具名称', 'Workday'], ['工具分类', ['HR系统']], ['一句话说明', '企业HR管理系统，处理员工薪酬与考勤'], ['掌握程度', 0.9], ['是否必须掌握', 1], ['使用指南', '登录后查看个人薪酬明细，提交考勤申请']],
      [['工具名称', 'Docker'], ['工具分类', ['基础设施']], ['一句话说明', '容器化工具，用于应用环境的快速部署'], ['掌握程度', 0.88], ['是否必须掌握', 1], ['使用指南', '编写Dockerfile，构建镜像并运行容器']],
    ],
  },
  {
    key: 'QUIZ',
    alias: 'quiz',
    name: '知识测验题库',
    remark: '答题闯关题库。错误选项用「、」分隔多个选项。',
    fields: [
      f('题目', 'biz_quiz_q', 'Text', 0, 12, { isTitle: true, config: { textMode: 'multiLine' } }),
      f('正确答案', 'biz_quiz_answer', 'Text', 1, 12),
      f('错误选项', 'biz_quiz_wrong', 'Text', 2, 12, { config: { textMode: 'multiLine' } }),
      f('解析', 'biz_quiz_why', 'Text', 3, 12, { config: { textMode: 'multiLine' } }),
    ],
    rows: [
      [['题目', '网络连不上，第一时间应该去哪里问？'], ['正确答案', 'IT 工单系统，附设备型号和错误截图'], ['错误选项', '随便找个同事问、发到部门大群、等第二天再说'], ['解析', '账号、权限、网络类问题统一走 IT 工单，1 个工作日响应。']],
      [['题目', '想确认需求优先级，应该找谁、带什么？'], ['正确答案', '产品负责人，带上证据和影响面'], ['错误选项', '直接问技术群、找 HR 伙伴、自己拍板'], ['解析', '产品与需求类问题找产品负责人，一次给足背景。']],
      [['题目', '「BGTA」中的 T 指什么？'], ['正确答案', 'Tried 已尝试'], ['错误选项', 'Topic 话题、Team 团队、Time 时间'], ['解析', 'B 背景、G 目标、T 已尝试、A 请求，四段式提问。']],
      [['题目', '代码仓库和提交流程在哪个平台看？'], ['正确答案', 'code.example.com'], ['错误选项', 'home.example.com、benefits.example.com、data.example.com'], ['解析', '代码平台统一管理仓库、MR/PR 与 CI。']],
      [['题目', '入职 Day 1 的完成标准是什么？'], ['正确答案', '能说清团队在做什么、自己第一周做什么'], ['错误选项', '把软件全装完、做完一个需求、写完年度规划'], ['解析', 'Day 1 加部门群、见 Leader、读 wiki，能说清目标即可。']],
    ],
  },
  {
    key: 'MEMBER',
    alias: 'members',
    name: '团队成员',
    remark: '「伙伴与提问」页数据源。',
    fields: [
      f('姓名', 'biz_member_name', 'Text', 0, 4, { isTitle: true }),
      f('职位', 'biz_member_title', 'Text', 0, 4),
      f('团队', 'biz_member_team', 'Text', 0, 4),
      f('角色标签', 'biz_member_tag', 'Text', 1, 4),
      f('工位', 'biz_member_desk', 'Text', 1, 4),
      f('负责领域', 'biz_member_areas', 'Text', 1, 4),
      f('一句话介绍', 'biz_member_quote', 'Text', 2, 12, { config: { textMode: 'multiLine' } }),
    ],
    rows: [
      [['姓名', '王芳'], ['职位', '前端工程师'], ['团队', '在线'], ['负责领域', '组件库 · 前端基建'], ['工位', 'B3-021'], ['一句话介绍', '组件用法先看文档，再到技术群找模块 owner。'], ['角色标签', '你的导师']],
      [['姓名', '李华'], ['职位', '产品负责人'], ['团队', '今日可约'], ['负责领域', '需求评审 · 产品规划'], ['工位', 'A1-108'], ['一句话介绍', '有任何需求疑问，随时约我 1 对 1。'], ['角色标签', '直属 Leader']],
      [['姓名', '吴静'], ['职位', 'HR 伙伴'], ['团队', '1 个工作日内响应'], ['负责领域', '制度与福利'], ['工位', 'C2-015'], ['一句话介绍', '社保、假期、报销问题都可以找我。'], ['角色标签', 'HR 伙伴']],
    ],
  },
  {
    key: 'TUTORIAL',
    alias: 'tutorials',
    name: '工具教程',
    remark: '工具教程列表数据源。',
    fields: [
      f('教程标题', 'biz_tut_title', 'Text', 0, 12, { isTitle: true }),
      f('所属工具', 'biz_tut_tool', 'Text', 1, 6),
      f('分类', 'biz_tut_cat', 'Text', 1, 3),
      f('难度', 'biz_tut_level', 'SingleSelect', 1, 3, {
        options: [
          { value: '入门', index: 1 },
          { value: '进阶', index: 2 },
          { value: '高级', index: 3 },
        ],
      }),
      f('预计学习时长', 'biz_tut_mins', 'Text', 2, 6),
      f('是否必修', 'biz_tut_required', 'Checkbox', 2, 6),
      f('内容', 'biz_tut_content', 'Text', 3, 12, { config: { textMode: 'multiLine' } }),
    ],
    rows: [
      [['教程标题', 'Git 提交规范速成'], ['所属工具', 'Git'], ['分类', '开发'], ['难度', ['入门']], ['预计学习时长', '20 分钟'], ['是否必修', 1], ['内容', 'feat/fix/chore 前缀约定 + squash merge 流程，配 3 个示例。']],
      [['教程标题', '飞书文档协作三招'], ['所属工具', '飞书'], ['分类', '协作'], ['难度', ['入门']], ['预计学习时长', '15 分钟'], ['是否必修', 1], ['内容', '共享链接权限、评论@人、文档结构化标题的使用要点。']],
      [['教程标题', 'Figma 设计稿标注与取值'], ['所属工具', 'Figma'], ['分类', '设计'], ['难度', ['进阶']], ['预计学习时长', '30 分钟'], ['是否必修', 1], ['内容', '按设计系统取色值、圆角、间距，切图导出规范。']],
      [['教程标题', 'Tableau 看板入门'], ['所属工具', 'Tableau'], ['分类', '数据'], ['难度', ['入门']], ['预计学习时长', '40 分钟'], ['是否必修', 0], ['内容', '连接数据源、拖拽维度度量、常用图表类型选择。']],
    ],
  },
];

/* ===== 执行 ===== */
const existing = await callTool('get_app_worksheets_list', { appId: APP_ID });
const existingList = existing?.data?.worksheets ?? existing?.data ?? [];
const findExisting = alias =>
  (Array.isArray(existingList) ? existingList : []).find(w => w.alias === alias || w.alias === `biz_${alias}`);

const envLines = [];
let created = 0;
for (const t of TABLES) {
  const found = findExisting(t.alias);
  let wsId;
  if (found) {
    wsId = found.worksheetId ?? found.worksheet_id ?? found.id;
    log(`↷ 表「${t.name}」已存在（${wsId}），跳过创建与灌数`);
  } else {
    const res = await callTool('create_worksheet', {
      appId: APP_ID,
      name: t.name,
      alias: t.alias,
      remark: t.remark,
      returnData: true,
      fields: t.fields,
    });
    const d = res?.data ?? res;
    wsId = d?.worksheetId ?? d?.worksheet_id ?? d?.id;
    log(`✓ 建表「${t.name}」→ ${wsId}`);
    // 灌数据：字段 id 用中文 name（MCP 支持 id 传字段标识；用 alias 更稳，但中文 name 也可）——统一用 alias
    const aliasOf = new Map(t.fields.map(fd => [fd.name, fd.alias]));
    const rows = t.rows.map(pairs => ({
      fields: pairs.map(([n, v]) => ({ id: aliasOf.get(n), value: v })),
    }));
    for (let i = 0; i < rows.length; i += 50) {
      await callTool('batch_create_records', { appId: APP_ID, worksheet_id: wsId, rows: rows.slice(i, i + 50) });
    }
    log(`  ✓ 灌入 ${rows.length} 行`);
    created += 1;
  }
  envLines.push(`MD_WS_${t.key}=${wsId}`);
  envLines.push(`MD_VIEW_${t.key}=`);
}

// 把表 ID 合并进 server/.env（保留原有其他行）
const envPath = resolve(ROOT, 'server/.env');
let current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
for (const line of envLines) {
  const [k] = line.split('=');
  if (k.endsWith('_VIEW') || line.endsWith('=')) continue; // 视图 ID 不再需要
  const re = new RegExp(`^${k}=.*$`, 'm');
  if (re.test(current)) current = current.replace(re, line);
  else current = current.replace(/\s*$/, '') + '\n' + line + '\n';
}
writeFileSync(envPath, current);
log(`\n完成：新建 ${created} 张表，worksheetId 已写入 server/.env`);

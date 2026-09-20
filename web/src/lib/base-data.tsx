// EXPORTS: ITeamMember, IToolTutorial, IWorkTool, IBoardTask, BaseDataState, BaseDataProvider, useBaseData, updateTaskStatus
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { capabilityClient, logger } from '@/lib/platform';

import {
  GUIDES,
  IGuide,
  IPeopleRole,
  IQuizItem,
  ISeedTask,
  ITrack,
  QUIZ,
  ROLES,
  SEED_TASKS,
  TRACKS,
} from '@/data/onboarding';
import { isUserTaskTitle } from '@/lib/task-create';

/* ===== 飞书多维表格「新人助手 Onboarding Helper」插件实例（一表一实例，仅读） ===== */
export const PLUGIN_IDS = {
  roles: 'feishu_bitable_onboarding_role_read_1',
  tasks: 'feishu_bitable_onboarding_task_read_1',
  tools: 'feishu_bitable_work_tool_guide_read_1',
  quiz: 'feishu_bitable_knowledge_quiz_read_1',
  members: 'feishu_bitable_team_member_read_1',
  tutorials: 'feishu_bitable_tool_tutorial_read_1',
  taskWrite: 'feishu_bitable_onboarding_task_update_1',
} as const;

/* ===== Base 新增的两类数据 ===== */
export interface ITeamMember {
  id: string;
  name: string;
  title: string;
  team: string;
  areas: string;
  desk: string;
  quote: string;
  tag: string;
}

export interface IToolTutorial {
  id: string;
  title: string;
  tool: string;
  cat: string;
  level: string;
  mins: string;
  required: boolean;
  content: string;
}

/* 工作工具表（全字段）：工具中心页卡片 */
export interface IWorkTool {
  id: string;
  name: string;
  cat: string;
  desc: string;
  /** 掌握度百分比 0-100（Base progress 字段） */
  mastery: number;
  required: boolean;
  guide: string;
}

/* 入职任务表（全量）：任务看板页 */
export interface IBoardTask {
  id: string;
  title: string;
  desc: string;
  cat: string;
  phase: string;
  status: string;
  track: string;
  /** 所属工种（如 Software Frontend） */
  role: string;
  /** 是否为「+」号创建的用户自建任务 */
  user?: boolean;
}

export type BaseSyncState = 'local' | 'live' | 'error';

export interface BaseDataState {
  roles: IPeopleRole[];
  seedTasks: ISeedTask[];
  tracks: ITrack[];
  guides: IGuide[];
  quiz: IQuizItem[];
  members: ITeamMember[];
  tutorials: IToolTutorial[];
  workTools: IWorkTool[];
  boardTasks: IBoardTask[];
  sync: BaseSyncState;
  /** 重新从飞书多维表格拉取全量数据（新建任务后调用） */
  refresh: () => Promise<void>;
}

/* ===== 本地兜底数据（页面秒开） ===== */
const FALLBACK_MEMBERS: ITeamMember[] = [
  { id: 'm1', name: '王芳', title: '前端工程师', team: '在线', areas: '组件库 · 前端基建', desk: '', quote: '组件用法先看文档，再到技术群找模块 owner。', tag: '你的导师' },
  { id: 'm2', name: '李华', title: '产品负责人', team: '今日可约', areas: '需求评审 · 产品规划', desk: '', quote: '有任何需求疑问，随时约我 1 对 1。', tag: '直属 Leader' },
  { id: 'm3', name: '吴静', title: 'HR 伙伴', team: '1 个工作日内响应', areas: '制度与福利', desk: '', quote: '社保、假期、报销问题都可以找我。', tag: 'HR 伙伴' },
];

const FALLBACK_WORK_TOOLS: IWorkTool[] = [
  { id: 'w1', name: 'Git', cat: '开发工具', desc: '分布式版本控制工具，用于代码版本管理', mastery: 95, required: true, guide: '安装后配置用户名邮箱，通过命令行提交代码' },
  { id: 'w2', name: '飞书', cat: '协作办公', desc: '企业协作办公平台，支持即时通讯与文档协作', mastery: 85, required: true, guide: '注册企业账号，创建群组共享文件' },
  { id: 'w3', name: 'Figma', cat: '设计工具', desc: '在线UI设计协作工具，支持原型制作', mastery: 78, required: true, guide: '创建设计文件，邀请团队成员共同编辑' },
  { id: 'w4', name: 'Tableau', cat: '数据工具', desc: '数据可视化工具，用于制作交互式报表', mastery: 65, required: false, guide: '连接数据源，拖拽字段生成图表' },
  { id: 'w5', name: 'Workday', cat: 'HR系统', desc: '企业HR管理系统，处理员工薪酬与考勤', mastery: 90, required: true, guide: '登录后查看个人薪酬明细，提交考勤申请' },
  { id: 'w6', name: 'Docker', cat: '基础设施', desc: '容器化工具，用于应用环境的快速部署', mastery: 88, required: true, guide: '编写Dockerfile，构建镜像并运行容器' },
];

const FALLBACK_BOARD_TASKS: IBoardTask[] = SEED_TASKS.map((s, i) => ({
  id: s.id,
  title: s.t,
  desc: s.d,
  cat: '熟悉工具',
  phase: `Week ${Math.min(5, Math.floor(i / 3) + 1)} 入职适应`,
  status: s.w === 'today' ? '进行中' : '未开始',
  track: s.tr,
  role: 'Software Frontend',
}));

const LOCAL_STATE: BaseDataState = {
  roles: ROLES,
  seedTasks: SEED_TASKS,
  tracks: TRACKS,
  guides: GUIDES,
  quiz: QUIZ,
  members: FALLBACK_MEMBERS,
  tutorials: [],
  workTools: FALLBACK_WORK_TOOLS,
  boardTasks: FALLBACK_BOARD_TASKS,
  sync: 'local',
  refresh: async () => {},
};

/* ===== 通用工具：多维表格字段值解包（兼容 string / 数组 / 富文本对象） ===== */
function toText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '是' : '否';
  if (Array.isArray(v)) {
    return v
      .map(item => toText(item))
      .filter(Boolean)
      .join(' · ');
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    // 富文本段 / 链接 / 人名等常见对象结构
    for (const key of ['text', 'value', 'name', 'title', 'link']) {
      if (typeof o[key] === 'string') return (o[key] as string).trim();
    }
    return '';
  }
  return '';
}

function toArr(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(toText).filter(Boolean);
  const s = toText(v);
  return s ? [s] : [];
}

function toNum(v: unknown): number {
  const m = toText(v).match(/\d+/);
  return m ? Number(m[0]) : 0;
}

interface RawRecord {
  id: string;
  record: Record<string, unknown>;
}

interface SearchRecordsResult {
  records?: RawRecord[];
  hasMore?: boolean;
  pageToken?: string;
}

/* ===== 分页拉全量 ===== */
async function fetchAll(pluginId: string): Promise<RawRecord[]> {
  const out: RawRecord[] = [];
  let pageToken: string | undefined;
  do {
    const input: Record<string, unknown> = { pageSize: 500 };
    if (pageToken) input.pageToken = pageToken;
    const res = (await capabilityClient
      .load(pluginId)
      .call('searchRecords', input)) as SearchRecordsResult;
    out.push(
      ...(res?.records ?? []).map(r => {
        // 兼容 record 为 { fields: {...} } 嵌套结构或扁平结构
        const rec = r.record as Record<string, unknown>;
        const fields =
          rec && typeof rec.fields === 'object' && rec.fields != null
            ? (rec.fields as Record<string, unknown>)
            : rec;
        return { id: r.id, record: fields ?? {} };
      }),
    );
    pageToken = res?.hasMore ? res.pageToken : undefined;
  } while (pageToken);
  return out;
}

/* ===== 适配器：Base 记录 → 页面数据模型 ===== */
const ROLE_ICON_CYCLE = ['green', 'blue', 'orange', 'pink', 'teal', 'amber'];

function mapRoles(rows: RawRecord[]): IPeopleRole[] {
  return rows
    .map(r => {
      const name = toText(r.record['角色名称']);
      if (!name) return null;
      const weeks = toNum(r.record['入职周期周数']);
      const team = toArr(r.record['部门'])[0] ?? '—';
      const role: IPeopleRole = {
        id: r.id,
        name,
        team,
        role: name,
        day: weeks > 0 ? weeks * 7 : 1,
        hi: `早上好，${name}`,
        avatar: name[0] ?? '友',
      };
      return role;
    })
    .filter((x): x is IPeopleRole => x != null);
}

function trackIdOf(cat: string): string {
  if (cat.includes('工友') || cat.includes('人')) return 't1';
  if (cat.includes('业务')) return 't3';
  if (cat.includes('项目')) return 't4';
  return 't2';
}

function weekNo(phase: string): number {
  const m = phase.match(/(\d+)/);
  return m ? Number(m[1]) : 99;
}

interface TaskRow {
  id: string;
  t: string;
  d: string;
  cat: string;
  phase: string;
  status: string;
  tr: string;
  role: string;
  user: boolean;
}

function mapTaskRows(rows: RawRecord[]): TaskRow[] {
  return rows
    .map(r => {
      const t = toText(r.record['任务名称']);
      if (!t) return null;
      const cat = toArr(r.record['任务分类']).join('/');
      const row: TaskRow = {
        id: r.id,
        t,
        d: toText(r.record['任务描述']),
        cat,
        phase: toArr(r.record['阶段'])[0] ?? '',
        status: toArr(r.record['任务状态'])[0] ?? '未开始',
        tr: trackIdOf(cat),
        role: toArr(r.record['所属工种'])[0] ?? '',
        user: isUserTaskTitle(t),
      };
      return row;
    })
    .filter((x): x is TaskRow => x != null)
    .sort((a, b) => weekNo(a.phase) - weekNo(b.phase));
}

function buildSeedTasks(taskRows: TaskRow[]): ISeedTask[] {
  // 用户自建任务不进入首页成长清单，只在任务看板展示
  const onboard = taskRows.filter(r => !r.user);
  const doing = onboard.filter(r => r.status === '进行中').slice(0, 5);
  const todo = onboard.filter(r => r.status !== '进行中' && r.status !== '已完成').slice(0, 7);
  return [...doing, ...todo].map(r => ({
    id: r.id,
    t: r.t,
    tr: r.tr,
    w: r.status === '进行中' ? 'today' : 'todo',
    d: r.d || `${r.phase}阶段的入职任务。`,
    by: `新人助手 Base · ${r.phase || '入职任务'}`,
  }));
}

function buildTracks(taskRows: TaskRow[]): ITrack[] {
  const onboard = taskRows.filter(r => !r.user);
  return TRACKS.map(meta => {
    const rows = onboard.filter(r => r.tr === meta.id);
    const done = rows.filter(r => r.status === '已完成').length;
    return {
      ...meta,
      total: rows.length,
      done,
      t: `${rows.length} 项 · 已做 ${done}`,
    };
  });
}

const GUIDE_META = [
  { icon: 'chat', ckey: 'green' },
  { icon: 'code', ckey: 'blue' },
  { icon: 'brush', ckey: 'pink' },
  { icon: 'barchart', ckey: 'teal' },
  { icon: 'book', ckey: 'orange' },
  { icon: 'target', ckey: 'amber' },
];

function mapGuides(rows: RawRecord[]): IGuide[] {
  return rows
    .map((r, i) => {
      const name = toText(r.record['工具名称']);
      if (!name) return null;
      const brief = toText(r.record['一句话说明']);
      const how = toText(r.record['使用指南']);
      const steps = [brief, how].filter(Boolean);
      const meta = GUIDE_META[i % GUIDE_META.length];
      const guide: IGuide = {
        name,
        icon: meta.icon,
        ckey: meta.ckey,
        steps: steps.length > 0 ? steps : ['查看团队文档了解该工具'],
      };
      return guide;
    })
    .filter((x): x is IGuide => x != null);
}

function mapQuiz(rows: RawRecord[]): IQuizItem[] {
  return rows
    .map(r => {
      const q = toText(r.record['题目']);
      const right = toText(r.record['正确答案']);
      const wrong = toText(r.record['错误选项']);
      if (!q || !right) return null;
      // 错误选项支持「，/；/、/换行」分隔的多个选项
      const wrongList = wrong
        ? wrong.split(/[,，;；、\n]+/).map(s => s.trim()).filter(Boolean)
        : [];
      const opts = [right, ...wrongList];
      // 洗牌，保证正确答案不固定在第一位
      for (let i = opts.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      const item: IQuizItem = {
        q,
        opts,
        a: opts.indexOf(right),
        why: toText(r.record['解析']),
      };
      return item;
    })
    .filter((x): x is IQuizItem => x != null);
}

function mapMembers(rows: RawRecord[]): ITeamMember[] {
  return rows
    .map(r => {
      const name = toText(r.record['姓名']);
      if (!name) return null;
      const member: ITeamMember = {
        id: r.id,
        name,
        title: toArr(r.record['职位'])[0] ?? '—',
        team: toArr(r.record['团队'])[0] ?? '',
        areas: toArr(r.record['负责领域']).join(' · '),
        desk: toText(r.record['工位']),
        quote: toText(r.record['一句话介绍']),
        tag: toArr(r.record['角色标签'])[0] ?? '',
      };
      return member;
    })
    .filter((x): x is ITeamMember => x != null);
}

function mapTutorials(rows: RawRecord[]): IToolTutorial[] {
  return rows
    .map(r => {
      const title = toText(r.record['教程标题']);
      if (!title) return null;
      const t: IToolTutorial = {
        id: r.id,
        title,
        tool: toArr(r.record['所属工具'])[0] ?? '通用',
        cat: toArr(r.record['分类'])[0] ?? '',
        level: toArr(r.record['难度'])[0] ?? '',
        mins: toText(r.record['预计学习时长']),
        required: toText(r.record['是否必修']).includes('是'),
        content: toText(r.record['内容']),
      };
      return t;
    })
    .filter((x): x is IToolTutorial => x != null);
}

/* 工作工具表全字段映射（工具中心页） */
function mapWorkTools(rows: RawRecord[]): IWorkTool[] {
  return rows
    .map(r => {
      const name = toText(r.record['工具名称']);
      if (!name) return null;
      // progress 字段为 0-1 小数（也可能直接存百分比）
      const mVal = parseFloat(toText(r.record['掌握程度']));
      const mastery = Number.isFinite(mVal)
        ? mVal > 1
          ? Math.min(100, Math.round(mVal))
          : Math.round(mVal * 100)
        : 0;
      const requiredRaw = r.record['是否必须掌握'];
      const tool: IWorkTool = {
        id: r.id,
        name,
        cat: toArr(r.record['工具分类'])[0] ?? '其他',
        desc: toText(r.record['一句话说明']),
        mastery,
        required: requiredRaw === true || toText(requiredRaw).includes('是'),
        guide: toText(r.record['使用指南']),
      };
      return tool;
    })
    .filter((x): x is IWorkTool => x != null);
}

/* 入职任务全量 → 看板任务 */
function toBoardTasks(rows: TaskRow[]): IBoardTask[] {
  return rows.map(r => ({
    id: r.id,
    title: r.t,
    desc: r.d,
    cat: r.cat,
    phase: r.phase,
    status: r.status,
    track: r.tr,
    role: r.role,
    user: r.user,
  }));
}

/* ===== 任务状态写回飞书多维表格（入职任务表） ===== */
const TASK_STATUS_VALUES = ['未开始', '进行中', '已完成'] as const;

export function isTaskStatus(v: string): boolean {
  return (TASK_STATUS_VALUES as readonly string[]).includes(v);
}

export async function updateTaskStatus(recordId: string, status: string): Promise<boolean> {
  try {
    await capabilityClient.load(PLUGIN_IDS.taskWrite).call('batchUpdateRecords', {
      records: [{ id: recordId, record: { 任务状态: status } }],
    });
    logger.info('任务状态已写回飞书:', recordId, status);
    return true;
  } catch (error) {
    logger.error('任务状态写回飞书失败:', String(error));
    return false;
  }
}

/* ===== 直连飞书：每次挂载全量拉取（不再使用本地缓存） ===== */

const BaseDataContext = createContext<BaseDataState>(LOCAL_STATE);

async function loadAll(): Promise<Partial<BaseDataState>> {
  const [rolesR, tasksR, toolsR, quizR, membersR, tutorialsR] = await Promise.allSettled([
    fetchAll(PLUGIN_IDS.roles),
    fetchAll(PLUGIN_IDS.tasks),
    fetchAll(PLUGIN_IDS.tools),
    fetchAll(PLUGIN_IDS.quiz),
    fetchAll(PLUGIN_IDS.members),
    fetchAll(PLUGIN_IDS.tutorials),
  ]);

  const value = (r: PromiseSettledResult<RawRecord[]>) =>
    r.status === 'fulfilled' ? r.value : [];

  const roles = value(rolesR);
  const taskRows = mapTaskRows(value(tasksR));
  const guides = value(toolsR);
  const quiz = value(quizR);
  const members = value(membersR);
  const tutorials = value(tutorialsR);

  // 六张表全部失败 → 保持本地数据
  const anyOk = [rolesR, tasksR, toolsR, quizR, membersR, tutorialsR].some(
    r => r.status === 'fulfilled',
  );
  if (!anyOk) {
    logger.warn('飞书后台同步失败，继续使用本地演示数据');
    return { sync: 'error' };
  }

  // 任一张表拉到空数据、或映射后为空，都回退到本地对应数据，避免页面空白/崩溃
  const mappedRoles = mapRoles(roles);
  const mappedGuides = mapGuides(guides);
  const mappedQuiz = mapQuiz(quiz);
  const mappedMembers = mapMembers(members);
  const mappedTutorials = mapTutorials(tutorials);
  const mappedSeeds = buildSeedTasks(taskRows);
  const mappedTracks = buildTracks(taskRows);
  const mappedWorkTools = mapWorkTools(guides);
  const mappedBoard = toBoardTasks(taskRows);

  return {
    roles: mappedRoles.length > 0 ? mappedRoles : LOCAL_STATE.roles,
    seedTasks: mappedSeeds.length > 0 ? mappedSeeds : LOCAL_STATE.seedTasks,
    tracks: mappedTracks.length > 0 ? mappedTracks : LOCAL_STATE.tracks,
    guides: mappedGuides.length > 0 ? mappedGuides : LOCAL_STATE.guides,
    quiz: mappedQuiz.length > 0 ? mappedQuiz : LOCAL_STATE.quiz,
    members: mappedMembers.length > 0 ? mappedMembers : LOCAL_STATE.members,
    tutorials: mappedTutorials,
    workTools: mappedWorkTools.length > 0 ? mappedWorkTools : LOCAL_STATE.workTools,
    boardTasks: mappedBoard.length > 0 ? mappedBoard : LOCAL_STATE.boardTasks,
    sync: 'live',
  };
}

export function BaseDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BaseDataState>(LOCAL_STATE);

  const refresh = useCallback(async () => {
    const patch = await loadAll();
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadAll().then(patch => {
      if (!cancelled) setState(prev => ({ ...prev, ...patch }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctxValue = useMemo(() => ({ ...state, refresh }), [state, refresh]);
  return <BaseDataContext.Provider value={ctxValue}>{children}</BaseDataContext.Provider>;
}

export function useBaseData(): BaseDataState {
  return useContext(BaseDataContext);
}

import { useEffect, useMemo, useRef, useState } from 'react';

import { scopedStorage } from '@/lib/platform';

import Mi from '@/components/workbench/Mi';
import { ViewName } from '@/data/onboarding';
import { IBoardTask, updateTaskStatus } from '@/lib/base-data';
import {
  parseSubtasks,
  parseTaskCode,
  stripSubtasks,
  toggleSubtaskLine,
  updateTaskDescription,
} from '@/lib/task-create';

import BoardCalendar, { CalView, dayKeyOf } from './BoardCalendar';
import BoardKanban from './BoardKanban';

interface TasksBoardViewProps {
  active: boolean;
  boardTasks: IBoardTask[];
  /** 本地状态覆盖（record id → 任务状态），写回明道云后乐观更新 */
  overrides: Record<string, string>;
  /** 写回明道云后的回调（成功/失败提示由页面层统一处理） */
  onStatusChange: (id: string, status: string, synced: boolean) => void;
  /** 轻提示（子任务写回成功/失败） */
  notify: (msg: string) => void;
  onSwitchView: (v: ViewName) => void;
}

const STATUS_CYCLE: Record<string, string> = {
  未开始: '进行中',
  进行中: '已完成',
  已完成: '未开始',
};

const STATUS_CKEY: Record<string, { fg: string; bg: string }> = {
  未开始: { fg: 'var(--sub)', bg: 'var(--soft)' },
  进行中: { fg: 'var(--amber)', bg: 'var(--amber-bg)' },
  已完成: { fg: 'var(--ok)', bg: 'var(--ok-bg)' },
  已锁定: { fg: 'var(--sub-2)', bg: 'var(--soft)' },
};

function weekKey(phase: string): number {
  const m = phase.match(/(\d+)/);
  return m ? Number(m[1]) : 99;
}

const CAL_PLAN_KEY = 'wb-cal-plan-v1';

function readPlan(): Record<string, string> {
  try {
    const raw = scopedStorage.getItem(CAL_PLAN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function TasksBoardView({ active, boardTasks, overrides, onStatusChange, notify, onSwitchView }: TasksBoardViewProps) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [pending, setPending] = useState<string | null>(null);
  /** 描述覆盖（record id → 最新描述，勾选子任务后乐观更新并写回明道云） */
  const [descOverrides, setDescOverrides] = useState<Record<string, string>>({});
  /** 看板 / 日历视图切换，默认看板 */
  const [boardMode, setBoardMode] = useState<'kanban' | 'calendar'>('kanban');
  /** 日历视图形态：3 天 / 7 天 / 月视图 */
  const [calView, setCalView] = useState<CalView>('3d');
  /** 日历排期（任务 id → 日期 key），持久化到本地 */
  const [calPlan, setCalPlan] = useState<Record<string, string>>(readPlan);

  const changeCalPlan = (next: Record<string, string>) => {
    setCalPlan(next);
    try {
      scopedStorage.setItem(CAL_PLAN_KEY, JSON.stringify(next));
    } catch {
      /* 存储失败时仅保留会话内排期 */
    }
  };

  /* 首次进入日历前，把「进行中」任务默认排到今天，避免空白日历 */
  const seededPlan = useRef(false);
  useEffect(() => {
    if (seededPlan.current) return;
    const existing = readPlan();
    if (Object.keys(existing).length > 0) {
      seededPlan.current = true;
      return;
    }
    const todo: Record<string, string> = {};
    const today = dayKeyOf(new Date());
    for (const t of boardTasks) {
      if ((overrides[t.id] ?? t.status) === '进行中') todo[t.id] = today;
    }
    if (Object.keys(todo).length > 0) {
      seededPlan.current = true;
      changeCalPlan(todo);
    }
  }, [boardTasks, overrides]);

  const roles = useMemo(() => {
    const set = new Set(boardTasks.map(t => t.role).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [boardTasks]);

  const statusOf = (t: IBoardTask) => overrides[t.id] ?? t.status;

  const stats = useMemo(() => {
    let done = 0;
    let doing = 0;
    let todo = 0;
    for (const t of boardTasks) {
      const s = overrides[t.id] ?? t.status;
      if (s === '已完成') done += 1;
      else if (s === '进行中') doing += 1;
      else todo += 1;
    }
    const total = boardTasks.length;
    return { total, done, doing, todo, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [boardTasks, overrides]);

  const roleTasks = useMemo(
    () => (roleFilter === 'all' ? boardTasks : boardTasks.filter(t => t.role === roleFilter)),
    [boardTasks, roleFilter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, IBoardTask[]>();
    for (const t of roleTasks) {
      // 用户自建任务按「我的任务 · 分类」分组，同背景的任务收敛在同一组
      const key = t.user
        ? `我的任务 · ${parseTaskCode(t.title)?.cat ?? '未分类'}`
        : t.phase || '未分阶段';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const ka = a[0].startsWith('我的任务') ? -1 : weekKey(a[0]);
      const kb = b[0].startsWith('我的任务') ? -1 : weekKey(b[0]);
      return ka - kb;
    });
  }, [roleTasks]);

  /* 勾选子任务：乐观更新描述 + 写回明道云 */
  const toggleSub = (t: IBoardTask, i: number) => {
    const base = descOverrides[t.id] ?? t.desc;
    const next = toggleSubtaskLine(base, i);
    setDescOverrides(prev => ({ ...prev, [t.id]: next }));
    updateTaskDescription(t.id, next).then(ok =>
      notify(ok ? '子任务进度已写回明道云' : '子任务写回失败，稍后重试'),
    );
  };

  /* 统一的状态变更入口：乐观更新 + 写回明道云 */
  const applyStatus = (id: string, next: string) => {
    setPending(id);
    updateTaskStatus(id, next)
      .then(ok => onStatusChange(id, next, ok))
      .finally(() => setPending(null));
  };

  const cycleStatus = (t: IBoardTask) => {
    const cur = statusOf(t);
    if (cur === '已锁定') return;
    applyStatus(t.id, STATUS_CYCLE[cur] ?? '进行中');
  };

  return (
    <section className={'view' + (active ? ' on' : '')} id="view-tasks">
      <button className="back" onClick={() => onSwitchView('home')}>
        <Mi name="chevron" />
        返回成长地图
      </button>
      <div style={{ margin: '18px 0 26px' }}>
        <div className="eyebrow">Task Board</div>
        <h1 style={{ marginTop: 5 }}>任务看板</h1>
        <p className="muted" style={{ marginTop: 7 }}>
          全部入职任务来自明道云工作表「入职任务」表；看板拖拽或点击状态，都会写回明道云。
        </p>
      </div>

      <div className="board-stats">
        <div className="bs-item">
          <b>{stats.total}</b>
          <span>全部任务</span>
        </div>
        <div className="bs-item">
          <b style={{ color: 'var(--amber)' }}>{stats.doing}</b>
          <span>进行中</span>
        </div>
        <div className="bs-item">
          <b style={{ color: 'var(--sub)' }}>{stats.todo}</b>
          <span>未开始</span>
        </div>
        <div className="bs-item">
          <b style={{ color: 'var(--ok)' }}>{stats.done}</b>
          <span>已完成</span>
        </div>
        <div className="bs-rate">
          <div className="mastery-bar">
            <span style={{ width: `${stats.rate}%` }} />
          </div>
          <em>{stats.rate}%</em>
        </div>
      </div>

      <div className="section">
        <div className="row-head">
          <div>
            <h2>{boardMode === 'kanban' ? '看板视图' : '日历视图'}</h2>
            <p className="muted" style={{ marginTop: 3 }}>
              {boardMode === 'kanban'
                ? '按状态分三列，拖拽卡片到目标列松手，即可切换状态并写回明道云。'
                : '支持 3 天 / 7 天 / 月视图排期，拖动卡片到目标日期即可安排。'}
            </p>
          </div>
          <div className="vhead-right">
            <span className="online">{roleTasks.length} 张卡片</span>
            <div className="vswitch">
              <button
                className={boardMode === 'kanban' ? 'on' : ''}
                onClick={() => setBoardMode('kanban')}
              >
                <Mi name="widgets" />
                看板
              </button>
              <button
                className={boardMode === 'calendar' ? 'on' : ''}
                onClick={() => setBoardMode('calendar')}
              >
                <Mi name="schedule" />
                日历
              </button>
            </div>
          </div>
        </div>
        {boardMode === 'kanban' ? (
          <BoardKanban
            tasks={roleTasks}
            overrides={overrides}
            onDropStatus={applyStatus}
          />
        ) : (
          <BoardCalendar
            tasks={roleTasks}
            overrides={overrides}
            view={calView}
            onViewChange={setCalView}
            plan={calPlan}
            onPlanChange={changeCalPlan}
            notify={notify}
          />
        )}
      </div>

      <div className="wtabs">
        {roles.map(r => (
          <button
            key={r}
            className={'wtab' + (roleFilter === r ? ' on' : '')}
            onClick={() => setRoleFilter(r)}
          >
            {r === 'all' ? '全部工种' : r}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="section">
          <p className="muted" style={{ padding: '24px 0' }}>当前筛选条件下没有任务，换个条件试试。</p>
        </div>
      ) : (
        groups.map(([phase, tasks]) => {
          const done = tasks.filter(t => statusOf(t) === '已完成').length;
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <div className="section" key={phase}>
              <div className="row-head">
                <div>
                  <h2>{phase}</h2>
                  <div className="phasebar">
                    <div className="mastery-bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <em>
                      {done}/{tasks.length} · {pct}%
                    </em>
                  </div>
                </div>
              </div>
              <div className="board-list">
                {tasks.map(t => {
                  const s = statusOf(t);
                  const c = STATUS_CKEY[s] ?? STATUS_CKEY['未开始'];
                  const locked = s === '已锁定';
                  const descNow = descOverrides[t.id] ?? t.desc;
                  const subs = parseSubtasks(descNow);
                  const mainDesc = stripSubtasks(descNow);
                  return (
                    <article className={'bcard' + (locked ? ' locked' : '')} key={t.id}>
                      <div className="bcard-main">
                        <b>{t.title}</b>
                        <p className="muted">{mainDesc || '任务描述待补充，可到明道云后台完善。'}</p>
                        {subs.length > 0 ? (
                          <ul className="bcheck">
                            {subs.map((sub, i) => (
                              <li
                                key={sub.title + i}
                                className={sub.done ? 'on' : ''}
                                onClick={() => toggleSub(t, i)}
                                title="点击切换勾选，进度会写回明道云"
                              >
                                <span className="bcheck-box">{sub.done ? '☑' : '□'}</span>
                                {sub.title}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="bcard-side">
                        <span className="bcat">{t.cat || '通用'}</span>
                        {t.role ? <span className="brole">{t.role}</span> : null}
                        <button
                          className="bstatus"
                          style={{ background: c.bg, color: c.fg }}
                          disabled={locked || pending === t.id}
                          onClick={() => cycleStatus(t)}
                          title={locked ? '前置任务未完成，暂锁定' : '点击切换状态'}
                        >
                          {pending === t.id ? '同步中…' : s}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

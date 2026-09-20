import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';

import Mi from '@/components/workbench/Mi';
import { IBoardTask } from '@/lib/base-data';

/** 日历视图形态：3 天 / 7 天 / 月视图 */
export type CalView = '3d' | '7d' | 'month';

interface BoardCalendarProps {
  tasks: IBoardTask[];
  overrides: Record<string, string>;
  view: CalView;
  onViewChange: (v: CalView) => void;
  /** 排期表（任务 id → 'YYYY-MM-DD'），由页面层持久化 */
  plan: Record<string, string>;
  onPlanChange: (plan: Record<string, string>) => void;
  notify: (msg: string) => void;
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const STATUS_STYLE: Record<string, { fg: string; bg: string }> = {
  未开始: { fg: 'var(--sub)', bg: 'var(--soft)' },
  进行中: { fg: 'var(--amber)', bg: 'var(--amber-bg)' },
  已完成: { fg: 'var(--ok)', bg: 'var(--ok-bg)' },
  已锁定: { fg: 'var(--sub-2)', bg: 'var(--soft)' },
};

const VIEW_OPTIONS: { id: CalView; label: string }[] = [
  { id: '3d', label: '3 天' },
  { id: '7d', label: '7 天' },
  { id: 'month', label: '月视图' },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function dayKeyOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function CalCardFace({ task, tag }: { task: IBoardTask; tag?: string }) {
  return (
    <>
      <b>{task.title}</b>
      <span className="kb-meta">
        {task.cat || '通用'}
        {tag ? ` · ${tag}` : ''}
      </span>
    </>
  );
}

/** 3 天 / 7 天视图的整卡（与看板卡片同款，可拖） */
function CalCard({ task, tag }: { task: IBoardTask; tag?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={'kb-card cal-card' + (isDragging ? ' dragging' : '')}
      title="按住拖动到目标日期"
    >
      <CalCardFace task={task} tag={tag} />
    </div>
  );
}

/** 月视图格内的迷你卡（单行标题 + 状态色点，可拖） */
function CalMiniCard({ task }: { task: IBoardTask }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const st = task.status;
  const color =
    st === '进行中' ? 'var(--amber)' : st === '已完成' ? 'var(--ok)' : 'var(--sub-2)';
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={'cal-mini' + (isDragging ? ' dragging' : '')}
      title="按住拖动到目标日期"
    >
      <i className="cal-mini-dot" style={{ background: color }} />
      <span className="cal-mini-title">{task.title}</span>
    </div>
  );
}

function statusOfTask(t: IBoardTask, overrides: Record<string, string>): string {
  return overrides[t.id] ?? t.status;
}

interface DayCell {
  key: string;
  date: Date;
  label: string;
  week: string;
  today: boolean;
  inMonth: boolean;
}

export default function BoardCalendar({
  tasks,
  overrides,
  view,
  onViewChange,
  plan,
  onPlanChange,
  notify,
}: BoardCalendarProps) {
  const [active, setActive] = useState<IBoardTask | null>(null);
  /** 月视图光标（当前展示的月份） */
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const days = useMemo<DayCell[]>(() => {
    const now = new Date();
    const mk = (d: Date, today: boolean, inMonth = true): DayCell => ({
      key: dayKeyOf(d),
      date: d,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      week: WEEK[d.getDay()],
      today,
      inMonth,
    });
    if (view === 'month') {
      // 当月第一周周日起共 6 周（42 格），非本月格子置灰但仍可排期
      const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
      const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
      const todayKey = dayKeyOf(now);
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        return mk(d, dayKeyOf(d) === todayKey, d.getMonth() === monthCursor.getMonth());
      });
    }
    const len = view === '3d' ? 3 : 7;
    const todayKey = dayKeyOf(now);
    return Array.from({ length: len }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      return mk(d, dayKeyOf(d) === todayKey);
    });
  }, [view, monthCursor]);

  const windowKeys = useMemo(() => new Set(days.map(d => d.key)), [days]);

  /* 分组：窗口内按日期分组，未排期 / 排在窗口外的进入底部「待安排」条 */
  const grouped = useMemo(() => {
    const byDay: Record<string, IBoardTask[]> = {};
    for (const d of days) byDay[d.key] = [];
    const pool: { task: IBoardTask; tag?: string }[] = [];
    for (const t of tasks) {
      if (statusOfTask(t, overrides) === '已锁定') continue;
      const day = plan[t.id];
      if (day && byDay[day]) byDay[day].push(t);
      else if (day && !windowKeys.has(day)) {
        const [m, dd] = day.split('-').slice(1);
        pool.push({ task: t, tag: `已排 ${Number(m)}/${Number(dd)}` });
      } else {
        pool.push({ task: t });
      }
    }
    return { byDay, pool };
  }, [tasks, overrides, plan, days, windowKeys]);

  const handleDragStart = (event: DragStartEvent) => {
    setActive(tasks.find(x => x.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActive(null);
    const overId = event.over?.id as string | undefined;
    if (!overId) return;
    const id = String(event.active.id);
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    if (overId === 'pool') {
      if (plan[id] !== undefined) {
        const next = { ...plan };
        delete next[id];
        onPlanChange(next);
        notify('已取消排期，回到待安排');
      }
      return;
    }
    const day = overId.replace(/^d:/, '');
    if (!windowKeys.has(day) || plan[id] === day) return;
    onPlanChange({ ...plan, [id]: day });
    const cell = days.find(x => x.key === day);
    notify(
      `「${t.title}」已排到 ${
        cell ? (cell.today ? '今天' : view === 'month' ? `${cell.label}` : `${cell.label} ${cell.week}`) : day
      }`,
    );
  };

  const moveMonth = (delta: number) =>
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  return (
    <div>
      <div className="cal-toolbar">
        <div className="cal-span">
          {VIEW_OPTIONS.map(o => (
            <button
              key={o.id}
              className={'cal-span-btn' + (view === o.id ? ' on' : '')}
              onClick={() => onViewChange(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {view === 'month' ? (
          <div className="cal-span">
            <button className="cal-span-btn" onClick={() => moveMonth(-1)}>
              ‹
            </button>
            <span className="cal-span-label">
              {monthCursor.getFullYear()} 年 {monthCursor.getMonth() + 1} 月
            </span>
            <button className="cal-span-btn" onClick={() => moveMonth(1)}>
              ›
            </button>
            <button
              className="cal-span-btn"
              onClick={() => setMonthCursor(new Date())}
            >
              回到本月
            </button>
          </div>
        ) : null}
        <span className="muted" style={{ fontSize: 12 }}>
          拖动卡片到目标日期排期 · 拖回下方「待安排」可取消
        </span>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {view === 'month' ? (
          <div className="cal-month">
            <div className="cal-week-head">
              {WEEK.map(w => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="cal-month-grid">
              {days.map(d => (
                <MonthCell
                  key={d.key}
                  cell={d}
                  tasks={grouped.byDay[d.key]}
                  overrides={overrides}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="cal-scroll">
            <div className="cal-strip">
              <div className={'cal-strip-grid cols-' + days.length}>
                {days.map(d => {
                  const list = grouped.byDay[d.key];
                  return (
                    <DayColumn
                      key={d.key}
                      cell={d}
                      count={list.length}
                      tasks={list}
                      overrides={overrides}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <PoolBar items={grouped.pool} />

        <DragOverlay>
          {active ? (
            <div className="kb-card overlay">
              <CalCardFace task={active} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ===== 3 天 / 7 天视图：一天一列 ===== */

function DayColumn({
  cell,
  count,
  tasks,
  overrides,
}: {
  cell: DayCell;
  count: number;
  tasks: IBoardTask[];
  overrides: Record<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `d:${cell.key}` });
  return (
    <div ref={setNodeRef} className={'cal-day' + (isOver ? ' over' : '')}>
      <div className="kb-col-head">
        <span className="kb-dot" style={{ background: 'var(--yellow-bg)', color: 'var(--amber)' }}>
          <Mi name="schedule" />
        </span>
        <b>
          {cell.label} {cell.week}
          {cell.today ? <em className="cal-today">今天</em> : null}
        </b>
        <span className="kb-count">{count}</span>
      </div>
      <div className="kb-col-body">
        {tasks.map(t => {
          const c = STATUS_STYLE[statusOfTask(t, overrides)] ?? STATUS_STYLE['未开始'];
          return (
            <div key={t.id} className="cal-wrap">
              <CalCard task={t} />
              <i className="cal-state" style={{ background: c.bg, color: c.fg }}>
                {statusOfTask(t, overrides)}
              </i>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== 月视图：周历网格 ===== */

function MonthCell({
  cell,
  tasks,
  overrides,
}: {
  cell: DayCell;
  tasks: IBoardTask[];
  overrides: Record<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `d:${cell.key}` });
  return (
    <div
      ref={setNodeRef}
      className={'cal-cell' + (isOver ? ' over' : '') + (cell.inMonth ? '' : ' dim')}
    >
      <span className={'cal-cell-num' + (cell.today ? ' today' : '')}>
        {cell.date.getDate()}
      </span>
      <div className="cal-cell-body">
        {tasks.map(t => (
          <CalMiniCard key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}

/* ===== 底部待安排条 ===== */

function PoolBar({ items }: { items: { task: IBoardTask; tag?: string }[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'pool' });
  return (
    <div ref={setNodeRef} className={'cal-pool' + (isOver ? ' over' : '')}>
      <span className="cal-pool-head">
        <Mi name="folder" />
        待安排
        <i className="kb-count">{items.length}</i>
      </span>
      <div className="cal-pool-body">
        {items.map(({ task, tag }) => (
          <CalCard key={task.id} task={task} tag={tag} />
        ))}
      </div>
    </div>
  );
}

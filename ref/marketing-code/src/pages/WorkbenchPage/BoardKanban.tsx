import { useMemo, useState, type ReactNode } from 'react';
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

interface BoardKanbanProps {
  tasks: IBoardTask[];
  overrides: Record<string, string>;
  onDropStatus: (id: string, status: string) => void;
}

const COLUMNS = [
  { id: '未开始', icon: 'schedule', fg: 'var(--sub)', bg: 'var(--soft)' },
  { id: '进行中', icon: 'bolt', fg: 'var(--amber)', bg: 'var(--amber-bg)' },
  { id: '已完成', icon: 'checkcircle', fg: 'var(--ok)', bg: 'var(--ok-bg)' },
];

function KanbanCardFace({ task }: { task: IBoardTask }) {
  return (
    <>
      <b>{task.title}</b>
      <span className="kb-meta">
        {task.cat || '通用'}
        {task.role ? ` · ${task.role}` : ''}
      </span>
    </>
  );
}

function KanbanCard({ task }: { task: IBoardTask }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={'kb-card' + (isDragging ? ' dragging' : '')}
    >
      <KanbanCardFace task={task} />
    </div>
  );
}

interface KanbanColumnProps {
  col: (typeof COLUMNS)[number];
  count: number;
  children: ReactNode;
}

function KanbanColumn({ col, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div ref={setNodeRef} className={'kb-col' + (isOver ? ' over' : '')}>
      <div className="kb-col-head">
        <span className="kb-dot" style={{ background: col.bg, color: col.fg }}>
          <Mi name={col.icon} />
        </span>
        <b>{col.id}</b>
        <span className="kb-count">{count}</span>
      </div>
      <div className="kb-col-body">{children}</div>
    </div>
  );
}

export default function BoardKanban({ tasks, overrides, onDropStatus }: BoardKanbanProps) {
  const [activeTask, setActiveTask] = useState<IBoardTask | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const grouped = useMemo(() => {
    const map: Record<string, IBoardTask[]> = { 未开始: [], 进行中: [], 已完成: [] };
    for (const t of tasks) {
      const s = overrides[t.id] ?? t.status;
      // 锁定任务不进看板，仍保留下方周分组中
      if (s === '已锁定') continue;
      (map[s] ?? map['未开始']).push(t);
    }
    return map;
  }, [tasks, overrides]);

  const handleDragStart = (event: DragStartEvent) => {
    const t = tasks.find(x => x.id === event.active.id);
    setActiveTask(t ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const overId = event.over?.id as string | undefined;
    if (!overId) return;
    const t = tasks.find(x => x.id === event.active.id);
    if (!t) return;
    const cur = overrides[t.id] ?? t.status;
    if (overId !== cur) onDropStatus(t.id, overId);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kb-board">
        {COLUMNS.map(col => (
          <KanbanColumn key={col.id} col={col} count={grouped[col.id].length}>
            {grouped[col.id].map(t => (
              <KanbanCard key={t.id} task={t} />
            ))}
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="kb-card overlay">
            <KanbanCardFace task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableTaskCard } from '@/components/task-card';
import type { Column } from '@/components/types';
import { cn } from '@/lib/utils';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

// 列内任务放置区域组件
export function DroppableTaskArea({
  column,
  isOver,
}: {
  column: Column;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `column-droppable-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  return (
    <SortableContext
      items={column.tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[100px] space-y-3 rounded-lg transition-colors duration-200',
          isOver &&
            column.tasks.length === 0 &&
            'border-2 border-dashed border-blue-300 bg-blue-50',
        )}
      >
        {column.tasks.map((task) => (
          <SortableTaskCard key={task.id} task={task} />
        ))}
        {/* 空列占位提示 */}
        {column.tasks.length === 0 && !isOver && (
          <div className="flex h-[100px] items-center justify-center text-sm text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </SortableContext>
  );
}

// 可排序的看板列组件
export function SortableColumn({
  column,
  onDelete,
  onAddTask,
  isOver,
}: {
  column: Column;
  onDelete: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
  isOver: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-[300px] flex-shrink-0 rounded-xl bg-gray-50 p-3 transition-all duration-200 outline-none',
        isDragging && 'scale-95 opacity-50',
      )}
    >
      {/* 列标题 */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {column.title}
          </h3>
          <span className="min-w-[20px] rounded bg-gray-200/70 px-1.5 text-center text-sm text-gray-500">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center">
          <button
            className="cursor-grab rounded p-1.5 transition-colors hover:bg-gray-200 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <button
            className="rounded p-1.5 transition-colors hover:bg-gray-200"
            onClick={() => onAddTask(column.id)}
            title="Add task"
          >
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
          <button
            className="group rounded p-1.5 transition-colors hover:bg-red-100"
            onClick={() => onDelete(column.id)}
            title="Delete board"
          >
            <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* 任务卡片列表 */}
      <DroppableTaskArea column={column} isOver={isOver} />
    </div>
  );
}

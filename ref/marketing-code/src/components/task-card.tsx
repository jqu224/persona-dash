'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/components/types';
import { cn } from '@/lib/utils';
import { MessageSquare, Paperclip } from 'lucide-react';
import { Image } from '@/components/ui/image';

// 圆形进度条组件
export function CircularProgress({ progress }: { progress: number }) {
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isComplete = progress === 100;

  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        {progress > 0 && (
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke={isComplete ? '#22c55e' : '#9ca3af'}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
  );
}

// 优先级标签组件
export function PriorityBadge({
  priority,
}: {
  priority: 'Low' | 'Medium' | 'High';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border bg-white px-2.5 py-1 text-xs font-medium',
        priority === 'High' && 'border-gray-900 text-gray-900',
        priority === 'Medium' && 'border-gray-300 text-gray-700',
        priority === 'Low' && 'border-gray-300 text-gray-500',
      )}
    >
      {priority}
    </span>
  );
}

// 头像组组件
export function AvatarGroup({ assignees }: { assignees: Task['assignees'] }) {
  return (
    <div className="flex -space-x-2">
      {assignees.slice(0, 3).map((assignee, index) => (
        <div
          key={index}
          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100"
        >
          {assignee.avatar ? (
            <Image
              src={assignee.avatar}
              alt={assignee.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-medium text-gray-500">
              {assignee.initials}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// 任务卡片内容组件（用于正常显示和 DragOverlay）
export function TaskCardContent({ task }: { task: Task }) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div>
        <h4 className="text-sm leading-tight font-semibold text-gray-900">
          {task.title}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
          {task.description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <AvatarGroup assignees={task.assignees} />
        <CircularProgress progress={task.progress} />
      </div>

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-3 text-gray-400">
          <div className="flex items-center gap-1">
            <Paperclip className="h-4 w-4" />
            <span className="text-sm">{task.attachments}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{task.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 可排序的任务卡片组件
export function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab outline-none active:cursor-grabbing',
        isDragging && 'scale-95 opacity-40',
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCardContent task={task} />
    </div>
  );
}

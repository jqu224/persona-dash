'use client';

import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SortableColumn } from '@/components/sortable-column';
import { TaskCardContent } from '@/components/task-card';
import {
  initialColumns,
  teamMembers,
} from '@/components/data';
import type { Column, Task } from '@/components/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeView, setActiveView] = useState<'Board' | 'List' | 'Table'>(
    'Board',
  );
  const [search, setSearch] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<
    'Low' | 'Medium' | 'High'
  >('Medium');

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 判断 ID 是否为列 ID
  const isColumnId = (id: string): boolean => {
    return columns.some((column) => column.id === id);
  };

  // 自定义碰撞检测
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      const taskCollision = pointerCollisions.find(
        (collision) =>
          !String(collision.id).startsWith('column-droppable-') &&
          !isColumnId(String(collision.id)),
      );
      if (taskCollision) {
        return [taskCollision];
      }
      return pointerCollisions;
    }

    const closestCollisions = closestCorners(args);

    if (closestCollisions.length === 0) {
      return rectIntersection(args);
    }

    return closestCollisions;
  };

  // 获取要删除的列信息
  const columnToDelete = deleteColumnId
    ? columns.find((c) => c.id === deleteColumnId)
    : null;

  // 查找任务所在的列
  const findColumnByTaskId = (taskId: string): Column | undefined => {
    return columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
  };

  // 查找任务
  const findTaskById = (taskId: string): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    if (isColumnId(activeId)) {
      const column = columns.find((c) => c.id === activeId);
      setActiveColumn(column || null);
      setActiveTask(null);
    } else {
      const task = findTaskById(activeId);
      setActiveTask(task || null);
      setActiveColumn(null);
    }
  };

  // 从 droppable ID 提取列 ID
  const getColumnIdFromDroppable = (id: string): string | null => {
    if (id.startsWith('column-droppable-')) {
      return id.replace('column-droppable-', '');
    }
    return null;
  };

  // 拖拽经过
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (isColumnId(activeId)) return;

    const activeCol = findColumnByTaskId(activeId);

    let overCol: Column | undefined;
    let targetColumnId: string | null = null;

    const droppableColumnId = getColumnIdFromDroppable(overId);
    if (droppableColumnId) {
      overCol = columns.find((c) => c.id === droppableColumnId);
      targetColumnId = droppableColumnId;
    } else {
      overCol = findColumnByTaskId(overId);
      if (overCol) {
        targetColumnId = overCol.id;
      } else if (isColumnId(overId)) {
        overCol = columns.find((c) => c.id === overId);
        targetColumnId = overId;
      }
    }

    setOverColumnId(targetColumnId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) {
      return;
    }

    setColumns((prev) => {
      const taskToMove = activeCol.tasks.find((t) => t.id === activeId);
      if (!taskToMove) return prev;

      return prev.map((column) => {
        if (column.id === activeCol.id) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== activeId),
          };
        }
        if (column.id === overCol!.id) {
          const overIndex = column.tasks.findIndex((t) => t.id === overId);
          const newTasks = [...column.tasks];

          if (overIndex === -1) {
            newTasks.push(taskToMove);
          } else {
            newTasks.splice(overIndex, 0, taskToMove);
          }

          return {
            ...column,
            tasks: newTasks,
          };
        }
        return column;
      });
    });
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);
    setOverColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    if (isColumnId(activeId) && isColumnId(overId)) {
      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === activeId);
        const newIndex = prev.findIndex((c) => c.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (!isColumnId(activeId)) {
      const column = findColumnByTaskId(activeId);
      const overColumn = findColumnByTaskId(overId);

      if (column && overColumn && column.id === overColumn.id) {
        setColumns((prev) => {
          return prev.map((col) => {
            if (col.id !== column.id) return col;

            const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
            const newIndex = col.tasks.findIndex((t) => t.id === overId);

            return {
              ...col,
              tasks: arrayMove(col.tasks, oldIndex, newIndex),
            };
          });
        });
      }
    }
  };

  // 添加新列
  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;

    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: newBoardName.trim(),
      tasks: [],
    };

    setColumns((prev) => [...prev, newColumn]);
    setNewBoardName('');
    setIsAddBoardOpen(false);
  };

  // 删除列
  const handleDeleteBoard = () => {
    if (!deleteColumnId) return;
    setColumns((prev) => prev.filter((c) => c.id !== deleteColumnId));
    setDeleteColumnId(null);
  };

  // 添加新任务
  const handleAddTask = () => {
    if (!addTaskColumnId || !newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: 'New task description...',
      assignees: [],
      progress: 0,
      priority: newTaskPriority,
      attachments: 0,
      comments: 0,
    };

    setColumns((prev) =>
      prev.map((column) =>
        column.id === addTaskColumnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column,
      ),
    );

    setNewTaskTitle('');
    setNewTaskPriority('Medium');
    setAddTaskColumnId(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                >
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">+5</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 px-3 font-normal"
          >
            <UserPlus className="h-4 w-4" />
            Add Assignee
          </Button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        {/* 视图切换 */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {(['Board', 'List', 'Table'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeView === view
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {view}
            </button>
          ))}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="h-9 w-[180px] border-gray-200 bg-white pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-gray-200 px-3 font-normal"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2 bg-gray-900 px-3 font-normal hover:bg-gray-800"
            onClick={() => setIsAddBoardOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Board
          </Button>
        </div>
      </div>

      {/* 看板区域 */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                onDelete={setDeleteColumnId}
                onAddTask={setAddTaskColumnId}
                isOver={overColumnId === column.id}
              />
            ))}
          </div>
        </SortableContext>

        {/* 拖拽预览层 */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 cursor-grabbing">
              <TaskCardContent task={activeTask} />
            </div>
          ) : null}
          {activeColumn ? (
            <div className="w-[300px] rotate-2 rounded-xl bg-gray-50 p-3 opacity-90">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {activeColumn.title}
                </h3>
                <span className="rounded bg-gray-200/70 px-1.5 text-sm text-gray-500">
                  {activeColumn.tasks.length}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 删除确认对话框 */}
      <Dialog
        open={!!deleteColumnId}
        onOpenChange={(open) => !open && setDeleteColumnId(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete &quot;
              <span className="font-medium">{columnToDelete?.title}</span>
              &quot;?
              {columnToDelete && columnToDelete.tasks.length > 0 && (
                <span className="mt-2 block text-red-500">
                  This board contains {columnToDelete.tasks.length} task(s) that
                  will also be deleted.
                </span>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteColumnId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBoard}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加新任务对话框 */}
      <Dialog
        open={!!addTaskColumnId}
        onOpenChange={(open) => !open && setAddTaskColumnId(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTaskPriority(priority)}
                    className={cn(
                      'rounded border px-3 py-1.5 text-sm transition-colors',
                      newTaskPriority === priority
                        ? priority === 'High'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-900 bg-gray-100'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddTaskColumnId(null);
                setNewTaskTitle('');
                setNewTaskPriority('Medium');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加新列对话框 */}
      <Dialog open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Board</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter board name..."
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddBoard();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddBoardOpen(false);
                setNewBoardName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBoard}
              disabled={!newBoardName.trim()}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Add Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

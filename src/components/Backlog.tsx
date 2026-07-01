'use client';

import { useState, useMemo } from 'react';
import { Task, Sprint, Member, Project, Team } from '../types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { GripVertical, ChevronDown, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const CATEGORY_LABELS: Record<string, string> = {
  feature: 'FEAT',
  bug: 'BUG',
  improvement: 'IMPR',
  task: 'TASK',
  epic: 'EPIC',
};

const POINTS_OPTIONS = [0, 1, 2, 3, 5, 8, 13];

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'planning':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'planned':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'completed':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    default:
      return 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/10';
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'bug':
      return 'text-red-600 bg-red-500/10';
    case 'feature':
      return 'text-blue-600 bg-blue-500/10';
    case 'improvement':
      return 'text-purple-600 bg-purple-500/10';
    case 'epic':
      return 'text-amber-600 bg-amber-500/10';
    default:
      return 'text-gray-600 bg-gray-500/10';
  }
}

function generateDisplayId(task: Task): string {
  const prefix = CATEGORY_LABELS[task.category] || task.category.slice(0, 4).toUpperCase();
  const shortHash = task.id.replace(/-/g, '').slice(0, 4);
  return `${prefix}-${shortHash}`;
}

interface DraggableTaskRowProps {
  task: Task;
  members: Member[];
  currentUser: Member;
  isTeamAdmin: boolean;
  isPlatformAdmin: boolean;
  onUpdateTask: (task: Task) => void;
}

function DraggableTaskRow({
  task,
  members,
  currentUser,
  isTeamAdmin,
  isPlatformAdmin,
  onUpdateTask,
}: DraggableTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
  });

  const canEdit = isPlatformAdmin || isTeamAdmin || task.assignee?.id === currentUser.id;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-4 py-2.5 border-b border-outline-variant/5 last:border-b-0 ${
        isDragging ? 'opacity-30' : 'hover:bg-surface-container-low'
      } transition-colors`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-on-surface-variant/30 hover:text-on-surface-variant/60 shrink-0 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${getCategoryColor(task.category)}`}
      >
        {generateDisplayId(task)}
      </span>

      <span className="flex-1 text-sm text-on-surface truncate min-w-0">{task.title}</span>

      {task.labels.length > 0 && (
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {task.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-[9px] text-on-surface-variant">+{task.labels.length - 2}</span>
          )}
        </div>
      )}

      {canEdit ? (
        <select
          value={task.points || 0}
          onChange={(e) => onUpdateTask({ ...task, points: parseInt(e.target.value) || 0 })}
          className="w-14 text-[10px] font-bold text-center bg-surface-container-low border border-outline-variant/20 rounded px-1 py-0.5 outline-none focus:border-primary shrink-0 cursor-pointer"
        >
          {POINTS_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? '-' : `${p}pts`}
            </option>
          ))}
        </select>
      ) : (
        <span className="w-14 text-[10px] font-bold text-center text-on-surface-variant shrink-0">
          {task.points ? `${task.points}pts` : '-'}
        </span>
      )}

      {canEdit ? (
        <select
          value={task.assignee?.id || ''}
          onChange={(e) =>
            onUpdateTask({
              ...task,
              assignee: e.target.value ? members.find((m) => m.id === e.target.value) : undefined,
            })
          }
          className="max-w-[110px] text-[10px] font-bold bg-surface-container-low border border-outline-variant/20 rounded px-1 py-0.5 outline-none focus:border-primary shrink-0 cursor-pointer"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      ) : task.assignee ? (
        <div className="flex items-center gap-1.5 shrink-0 w-[110px]" title={task.assignee.name}>
          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
            <Image
              src={task.assignee.avatar}
              alt={task.assignee.name}
              fill
              className="object-cover"
              sizes="20px"
            />
          </div>
          <span className="text-[10px] text-on-surface-variant truncate">{task.assignee.name}</span>
        </div>
      ) : (
        <span className="text-[10px] text-on-surface-variant/50 shrink-0 w-[110px]">Unassigned</span>
      )}

      <span className="text-[10px] text-on-surface-variant/70 shrink-0 w-[90px] text-right">
        {task.dueDate || ''}
      </span>
    </div>
  );
}

interface SprintSectionProps {
  sprint: Sprint;
  tasks: Task[];
  members: Member[];
  currentUser: Member;
  isTeamAdmin: boolean;
  isPlatformAdmin: boolean;
  onUpdateTask: (task: Task) => void;
  onUpdateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
}

function SprintSection({
  sprint,
  tasks,
  members,
  currentUser,
  isTeamAdmin,
  isPlatformAdmin,
  onUpdateTask,
  onUpdateSprint,
}: SprintSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { setNodeRef, isOver } = useDroppable({
    id: `sprint-${sprint.id}`,
  });

  return (
    <div
      className={`bg-surface-container-low rounded-2xl border overflow-hidden ${
        isOver ? 'border-primary/40 ring-2 ring-primary/10' : 'border-outline-variant/10'
      } transition-all`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left"
      >
        <ChevronDown
          className={`w-4 h-4 text-on-surface-variant transition-transform shrink-0 ${
            isOpen ? '' : '-rotate-90'
          }`}
        />
        <span className="font-bold text-on-surface text-sm">{sprint.name}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(sprint.status)}`}
        >
          {sprint.status}
        </span>
        <span className="text-[10px] text-on-surface-variant/70 ml-auto hidden sm:inline">
          {sprint.startDate} — {sprint.endDate}
        </span>
        <span className="text-[10px] font-semibold text-on-surface-variant shrink-0">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
        {sprint.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSprint(sprint.id, { status: 'completed' });
            }}
            className="flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors shrink-0"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">Complete</span>
          </button>
        )}
      </button>

      <div ref={setNodeRef} className={isOpen ? '' : 'hidden'}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <DraggableTaskRow
              key={task.id}
              task={task}
              members={members}
              currentUser={currentUser}
              isTeamAdmin={isTeamAdmin}
              isPlatformAdmin={isPlatformAdmin}
              onUpdateTask={onUpdateTask}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-xs text-on-surface-variant/40 italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

interface BacklogProps {
  tasks: Task[];
  sprints: Sprint[];
  members: Member[];
  currentProject: Project;
  currentTeam: Team;
  currentUser: Member;
  isTeamAdmin: boolean;
  isPlatformAdmin: boolean;
  onUpdateTask: (task: Task) => void;
  onUpdateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
}

export function Backlog({
  tasks,
  sprints,
  members,
  currentProject,
  currentTeam,
  currentUser,
  isTeamAdmin,
  isPlatformAdmin,
  onUpdateTask,
  onUpdateSprint,
}: BacklogProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sortedSprints = useMemo(
    () =>
      [...sprints]
        .filter((s) => s.teamId === currentTeam.id)
        .sort((a, b) => {
          if (a.status === 'active') return -1;
          if (b.status === 'active') return 1;
          if (a.status === 'backlog') return 1;
          if (b.status === 'backlog') return -1;
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }),
    [sprints, currentTeam.id],
  );

  const sprintsWithTasks = useMemo(
    () =>
      sortedSprints.map((sprint) => ({
        sprint,
        tasks: tasks
          .filter((t) => t.projectId === currentProject.id && t.sprintId === sprint.id)
          .sort((a, b) => a.order - b.order),
      })),
    [sortedSprints, tasks, currentProject.id],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    if (!activeId.startsWith('task-')) return;

    const taskId = activeId.replace('task-', '');
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overId = over.id as string;
    let destSprintId: string | undefined;

    if (overId.startsWith('sprint-')) {
      destSprintId = overId.replace('sprint-', '');
    } else if (overId.startsWith('task-')) {
      const overTaskId = overId.replace('task-', '');
      const overTask = tasks.find((t) => t.id === overTaskId);
      if (overTask) {
        destSprintId = overTask.sprintId;
      }
    }

    if (destSprintId !== undefined && destSprintId !== task.sprintId) {
      onUpdateTask({ ...task, sprintId: destSprintId });
    }
  }

  const draggedTask = activeDragId?.startsWith('task-')
    ? tasks.find((t) => t.id === activeDragId.replace('task-', ''))
    : null;

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-on-surface">Backlog</h2>
          <p className="text-xs text-on-surface-variant">
            {currentProject.name} · {currentTeam.name}
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {sprintsWithTasks.map(({ sprint, tasks }) => (
              <SprintSection
                key={sprint.id}
                sprint={sprint}
                tasks={tasks}
                members={members}
                currentUser={currentUser}
                isTeamAdmin={isTeamAdmin}
                isPlatformAdmin={isPlatformAdmin}
                onUpdateTask={onUpdateTask}
                onUpdateSprint={onUpdateSprint}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {draggedTask ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-2xl border border-outline-variant/20 max-w-lg">
                <GripVertical className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${getCategoryColor(draggedTask.category)}`}
                >
                  {generateDisplayId(draggedTask)}
                </span>
                <span className="flex-1 text-sm text-on-surface truncate">
                  {draggedTask.title}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

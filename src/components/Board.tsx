import React, { useState } from 'react';
import { Task, Status, Activity, Project, Sprint, Member } from '../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Plus, Trash2, GripVertical, Settings2, X, Check } from 'lucide-react';

interface BoardProps {
  tasks: Task[];
  projects: Project[];
  currentProject: Project;
  sprints: Sprint[];
  members: Member[];
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onTasksReorder: (tasks: Task[]) => void;
  onAddTask: (status: Status) => string;
  currentUser: Member;
}

export function Board({ 
  tasks, 
  projects, 
  currentProject,
  sprints, 
  members, 
  onUpdateTask, 
  onUpdateProject,
  onTasksReorder, 
  onAddTask, 
  currentUser 
}: BoardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null);
  const [originalStatus, setOriginalStatus] = useState<Status | null>(null);
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState('');

  const columns = [...currentProject.columns].sort((a, b) => a.order - b.order);
  const isLead = currentUser.id === currentProject.leadId || currentUser.role === 'admin';

  const handleAddNewTask = (status: Status) => {
    const newId = onAddTask(status);
    setSelectedTaskId(newId);
  };

  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) return;
    const newColumn = {
      id: newColumnLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newColumnLabel,
      order: columns.length
    };
    onUpdateProject({
      ...currentProject,
      columns: [...currentProject.columns, newColumn]
    });
    setNewColumnLabel('');
  };

  const handleDeleteColumn = (columnId: string) => {
    const hasTasks = tasks.some(t => t.status === columnId);
    if (hasTasks) {
      alert("Cannot delete column with tasks in it.");
      return;
    }
    onUpdateProject({
      ...currentProject,
      columns: currentProject.columns.filter(c => c.id !== columnId)
    });
  };

  const logActivity = (task: Task, action: string, target?: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      user: currentUser,
      action,
      target,
      timestamp: 'Just now',
    };
    return [newActivity, ...(task.activities || [])];
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const activeTask = tasks.find(t => t.id === activeId);
  const activeColumn = columns.find(c => c.id === activeId);

  function findContainer(id: string) {
    const task = tasks.find(t => t.id === id);
    if (task) return task.status;
    return columns.find(c => c.id === id)?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    
    if (columns.some(c => c.id === active.id)) {
      setActiveType('column');
    } else {
      setActiveType('task');
      const task = tasks.find(t => t.id === active.id);
      if (task) setOriginalStatus(task.status);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (activeType === 'column') return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const activeIndex = tasks.findIndex(t => t.id === activeId);
    const overIndex = tasks.findIndex(t => t.id === overId);

    let newIndex;
    if (columns.some(c => c.id === overId)) {
      newIndex = tasks.length;
    } else {
      const isBelowLastItem = over && overIndex === tasks.length - 1;
      const modifier = isBelowLastItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : tasks.length;
    }

    const newTasks = [...tasks];
    newTasks[activeIndex] = { ...newTasks[activeIndex], status: overContainer as Status };
    onTasksReorder(arrayMove(newTasks, activeIndex, newIndex));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (activeType === 'column') {
      if (over && active.id !== over.id) {
        const oldIndex = columns.findIndex(c => c.id === active.id);
        const newIndex = columns.findIndex(c => c.id === over.id);
        const newColumns = arrayMove(columns, oldIndex, newIndex).map((col, idx) => ({
          ...col,
          order: idx
        }));
        onUpdateProject({
          ...currentProject,
          columns: newColumns
        });
      }
    } else {
      const activeId = active.id as string;
      const task = tasks.find(t => t.id === activeId);

      if (task && originalStatus && task.status !== originalStatus) {
        const columnLabel = columns.find(c => c.id === task.status)?.label;
        const updatedTask = {
          ...task,
          activities: logActivity(task, 'moved to', columnLabel)
        };
        onUpdateTask(updatedTask);
      }

      if (!over) {
        setActiveId(null);
        setActiveType(null);
        setOriginalStatus(null);
        return;
      }

      const overId = over.id as string;

      const activeContainer = findContainer(activeId);
      const overContainer = findContainer(overId);

      if (activeContainer && overContainer && activeContainer === overContainer) {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        if (activeIndex !== overIndex) {
          onTasksReorder(arrayMove(tasks, activeIndex, overIndex));
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
    setOriginalStatus(null);
  }

  const handleUpdateStatus = (id: string, status: Status) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      onUpdateTask({ ...task, status });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Board</h2>
            {isLead && (
              <button 
                onClick={() => setIsManagingColumns(!isManagingColumns)}
                className={`p-1.5 rounded-lg transition-all ${isManagingColumns ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                title="Manage Columns"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isManagingColumns && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <input 
                type="text"
                placeholder="New column name..."
                value={newColumnLabel}
                onChange={(e) => setNewColumnLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                className="bg-surface-container-high text-sm px-3 py-1.5 rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary w-48"
              />
              <button 
                onClick={handleAddColumn}
                className="p-1.5 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6 items-start h-full min-w-max">
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column, idx) => (
              <Column 
                key={column.id}
                column={column}
                tasks={tasks.filter(t => t.status === column.id)}
                projects={projects}
                onTaskClick={setSelectedTaskId}
                onAddTask={handleAddNewTask}
                onUpdateStatus={handleUpdateStatus}
                availableStatuses={columns.map(c => c.id)}
                isManaging={isManagingColumns}
                onDelete={() => handleDeleteColumn(column.id)}
                canAddTask={idx === 0}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeType === 'task' && activeTask ? (
            <div className="w-80 opacity-90 scale-105 rotate-2 transition-transform">
              <TaskCard 
                task={activeTask} 
                projectName={projects.find(p => p.id === activeTask.projectId)?.name}
                projectColor={projects.find(p => p.id === activeTask.projectId)?.color}
                onClick={() => {}} 
                onUpdateStatus={() => {}}
                availableStatuses={columns.map(c => c.id)}
              />
            </div>
          ) : activeType === 'column' && activeColumn ? (
            <div className="w-80 opacity-90 scale-105 transition-transform">
              <Column 
                column={activeColumn} 
                tasks={tasks.filter(t => t.status === activeColumn.id)} 
                projects={projects}
                onTaskClick={() => {}}
                onAddTask={() => {}}
                onUpdateStatus={() => {}}
                availableStatuses={columns.map(c => c.id)}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>

        {selectedTask && (
          <TaskModal 
            task={selectedTask} 
            projects={projects}
            sprints={sprints}
            members={members}
            onClose={() => setSelectedTaskId(null)} 
            onUpdateTask={onUpdateTask}
            currentUser={currentUser}
          />
        )}
      </div>
    </DndContext>
  );
}

interface ColumnProps {
  column: { id: Status; label: string };
  tasks: Task[];
  projects: Project[];
  onTaskClick: (id: string) => void;
  onAddTask: (status: Status) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  availableStatuses: Status[];
  isOverlay?: boolean;
  isManaging?: boolean;
  onDelete?: () => void;
  canAddTask?: boolean;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  projects, 
  onTaskClick, 
  onAddTask, 
  onUpdateStatus, 
  availableStatuses,
  isOverlay = false,
  isManaging = false,
  onDelete,
  canAddTask = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id,
    data: {
      type: 'column',
    },
    disabled: !isManaging && !isOverlay
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`w-80 flex-shrink-0 flex flex-col gap-4 ${isOverlay ? 'shadow-xl' : ''}`}
    >
      <div 
        className="flex items-center justify-between px-2 group"
      >
        <div className="flex items-center gap-2">
          {isManaging && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-surface-container-high rounded transition-colors">
              <GripVertical className="w-3 h-3 text-on-surface-variant/40" />
            </div>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {column.label}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isManaging && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-1 hover:bg-error/10 text-error rounded transition-colors"
              title="Delete Column"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <SortableContext
        id={column.id}
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-4 min-h-[200px] border border-transparent hover:border-outline-variant/10 transition-colors">
          {tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            return (
              <TaskCard 
                key={task.id} 
                task={task} 
                projectName={project?.name}
                projectColor={project?.color}
                onClick={() => onTaskClick(task.id)} 
                onUpdateStatus={onUpdateStatus}
                availableStatuses={availableStatuses}
              />
            );
          })}
          
          {canAddTask && (
            <button 
              onClick={() => onAddTask(column.id)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:border-primary/50 hover:text-primary transition-all bg-surface-container-low/50"
            >
              + Add Task
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

import React from 'react';
import { MessageSquare, Paperclip, ArrowRight } from 'lucide-react';
import { Task, Status } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  projectName?: string;
  projectColor?: string;
  onClick: () => void;
  onUpdateStatus?: (id: string, status: Status) => void;
  availableStatuses?: Status[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, projectName, projectColor, onClick, onUpdateStatus, availableStatuses }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStatus || !availableStatuses) return;
    const currentIndex = availableStatuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % availableStatuses.length;
    onUpdateStatus(task.id, availableStatuses[nextIndex]);
  };

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-2 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group relative"
      style={{ ...style, borderLeftColor: projectColor || '#4F46E5' }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-70">
          {projectName}
        </span>
        <div className="flex items-center gap-2">
          {onUpdateStatus && (
            <button 
              onClick={handleStatusClick}
              className="p-1 hover:bg-surface-container-high rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Move to next state"
            >
              <ArrowRight className="w-3 h-3 text-primary" />
            </button>
          )}
          {task.points !== undefined && (
            <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px] font-bold text-on-surface">
              {task.points}
            </span>
          )}
        </div>
      </div>
      <h4 className="text-sm font-semibold mb-2 text-on-surface group-hover:text-primary transition-colors">{task.title}</h4>
      
      <div className="flex gap-2 mb-3">
        {task.labels.map(label => (
          <span 
            key={label}
            className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest overflow-hidden" title={`Assigned to ${task.assignee.name}`}>
              <img 
                alt={task.assignee.name} 
                src={task.assignee.avatar}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="w-4 h-4 rounded-full border border-surface-container-lowest overflow-hidden opacity-50" title={`Created by ${task.creator.name}`}>
            <img 
              alt={task.creator.name} 
              src={task.creator.avatar}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-on-surface-variant">
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-bold">{task.comments.length}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span className="text-[10px] font-bold">{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

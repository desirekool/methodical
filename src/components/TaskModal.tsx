import { 
  X, 
  AlignLeft, 
  CheckSquare, 
  Paperclip, 
  List, 
  Plus, 
  Calendar, 
  ArrowRight, 
  Copy, 
  Archive, 
  Trash2,
  FileText,
  Check,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { Task, ChecklistItem, Comment, Activity, Project, Sprint, Member } from '../types';
import React, { useState } from 'react';

interface TaskModalProps {
  task: Task;
  projects: Project[];
  sprints: Sprint[];
  members: Member[];
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  currentUser: Member;
}

export function TaskModal({ task, projects, sprints, members, onClose, onUpdateTask, currentUser }: TaskModalProps) {
  const [commentText, setCommentText] = useState('');
  const [showActivities, setShowActivities] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingProjectSprint, setIsEditingProjectSprint] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);

  const completedCount = task.checklist.filter(i => i.completed).length;
  const progress = task.checklist.length > 0 ? Math.round((completedCount / task.checklist.length) * 100) : 0;

  const currentProject = projects.find(p => p.id === task.projectId);
  const currentSprint = sprints.find(s => s.id === task.sprintId);

  const logActivity = (action: string, target?: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      user: currentUser,
      action,
      target,
      timestamp: 'Just now',
    };
    return [newActivity, ...(task.activities || [])];
  };

  const toggleChecklistItem = (itemId: string) => {
    const item = task.checklist.find(i => i.id === itemId);
    const newChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateTask({ 
      ...task, 
      checklist: newChecklist,
      activities: logActivity(item?.completed ? 'unmarked' : 'completed', item?.text)
    });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newChecklistItem,
      completed: false,
    };
    onUpdateTask({ 
      ...task, 
      checklist: [...task.checklist, newItem],
      activities: logActivity('added checklist item', newChecklistItem)
    });
    setNewChecklistItem('');
    setIsAddingChecklistItem(false);
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    const item = task.checklist.find(i => i.id === itemId);
    onUpdateTask({ 
      ...task, 
      checklist: task.checklist.filter(i => i.id !== itemId),
      activities: logActivity('removed checklist item', item?.text)
    });
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    if (!task.labels.includes(newLabel)) {
      onUpdateTask({ 
        ...task, 
        labels: [...task.labels, newLabel],
        activities: logActivity('added label', newLabel)
      });
    }
    setNewLabel('');
    setIsAddingLabel(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    onUpdateTask({ 
      ...task, 
      labels: task.labels.filter(l => l !== labelToRemove),
      activities: logActivity('removed label', labelToRemove)
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser,
      text: commentText,
      createdAt: 'Just now',
    };
    onUpdateTask({ 
      ...task, 
      comments: [newComment, ...task.comments],
      activities: logActivity('added a comment')
    });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in duration-200">
      <div className="bg-surface-bright w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row border border-outline-variant/10">
        
        {/* Main Details Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              {isEditingProjectSprint ? (
                <div className="flex items-center gap-2 mb-2">
                  <select 
                    className="bg-surface-container-low border border-outline-variant/20 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary"
                    value={task.projectId}
                    onChange={(e) => {
                      const proj = projects.find(p => p.id === e.target.value);
                      onUpdateTask({ 
                        ...task, 
                        projectId: e.target.value,
                        activities: logActivity('moved to project', proj?.name)
                      });
                    }}
                    autoFocus
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <span className="text-on-surface-variant">/</span>
                  <select 
                    className="bg-surface-container-low border border-outline-variant/20 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary"
                    value={task.sprintId || ''}
                    onChange={(e) => {
                      const sprint = sprints.find(s => s.id === e.target.value);
                      onUpdateTask({ 
                        ...task, 
                        sprintId: e.target.value,
                        activities: logActivity('assigned to sprint', sprint?.name)
                      });
                      setIsEditingProjectSprint(false);
                    }}
                  >
                    <option value="">No Sprint</option>
                    {sprints.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 text-on-surface-variant mb-2 cursor-pointer hover:text-on-surface"
                  onClick={() => setIsEditingProjectSprint(true)}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    {currentProject?.name} / {currentSprint?.name || 'No Sprint'}
                  </span>
                </div>
              )}
              
              {isEditingTitle ? (
                <input 
                  className="text-2xl font-bold tracking-tight text-on-surface bg-transparent border-b-2 border-primary focus:outline-none w-full"
                  defaultValue={task.title}
                  onBlur={(e) => {
                    onUpdateTask({ 
                      ...task, 
                      title: e.target.value,
                      activities: logActivity('renamed task', e.target.value)
                    });
                    setIsEditingTitle(false);
                  }}
                  autoFocus
                />
              ) : (
                <h2 
                  className="text-2xl font-bold tracking-tight text-on-surface cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {task.title}
                </h2>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <AlignLeft className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Description</h3>
              {!isEditingDescription && (
                <button 
                  className="ml-auto text-[10px] font-bold text-primary hover:underline"
                  onClick={() => setIsEditingDescription(true)}
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full bg-surface-container-low rounded-xl p-5 leading-relaxed text-on-surface-variant text-sm border border-primary focus:outline-none min-h-[120px]"
                  defaultValue={task.description}
                  autoFocus
                  onBlur={(e) => {
                    onUpdateTask({ 
                      ...task, 
                      description: e.target.value,
                      activities: logActivity('updated description')
                    });
                    setIsEditingDescription(false);
                  }}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditingDescription(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90"
                    onClick={() => setIsEditingDescription(false)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="bg-surface-container-low rounded-xl p-5 leading-relaxed text-on-surface-variant text-sm cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => setIsEditingDescription(true)}
              >
                {task.description || <span className="italic opacity-50">Add a more detailed description...</span>}
              </div>
            )}
          </section>

          {/* Checklist */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Core Requirements</h3>
              <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-[10px] font-bold">{progress}%</span>
            </div>
            <div className="space-y-3">
              {task.checklist.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 group"
                >
                  <div 
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                      item.completed ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant group-hover:border-primary'
                    }`}
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </div>
                  <span 
                    className={`text-sm flex-1 transition-all cursor-pointer ${item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    {item.text}
                  </span>
                  <button 
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/10 text-error rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {isAddingChecklistItem ? (
                <div className="mt-4 space-y-2">
                  <input 
                    className="w-full bg-surface-container-low border border-primary rounded-lg px-4 py-2 text-sm focus:outline-none"
                    placeholder="What needs to be done?"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddChecklistItem}
                      className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => setIsAddingChecklistItem(false)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingChecklistItem(true)}
                  className="mt-4 text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  Add an item
                </button>
              )}
            </div>
          </section>

          {/* Attachments */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Paperclip className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Attachments</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl group cursor-pointer hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline-variant/20">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-outline-variant/10 overflow-hidden">
                    {attachment.type === 'pdf' ? (
                      <FileText className="w-6 h-6 text-primary" />
                    ) : (
                      <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate text-on-surface">{attachment.name}</div>
                    <div className="text-[10px] text-on-surface-variant">Added {attachment.addedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <List className="w-4 h-4 text-on-surface-variant" />
                <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Activity</h3>
              </div>
              <button 
                onClick={() => setShowActivities(!showActivities)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                {showActivities ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className="flex gap-4 mb-8">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <img 
                  alt={currentUser.name} 
                  src={currentUser.avatar}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden">
                  <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-3 min-h-[80px] resize-none placeholder:text-on-surface-variant/50" 
                    placeholder="Write a comment..."
                  />
                  <div className="flex justify-end p-2 border-t border-outline-variant/10 bg-surface-container-low/50">
                    <button 
                      onClick={handleAddComment}
                      className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {showActivities ? (
                <div className="space-y-4">
                  {(task.activities || []).map(activity => (
                    <div key={activity.id} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1">
                        <img 
                          alt={activity.user.name} 
                          src={activity.user.avatar}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-on-surface">
                          <span className="font-bold">{activity.user.name}</span>
                          {' '}{activity.action}{' '}
                          {activity.target && <span className="font-bold">"{activity.target}"</span>}
                        </p>
                        <span className="text-[10px] text-on-surface-variant">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                task.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <img 
                        alt={comment.author.name} 
                        src={comment.author.avatar}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-on-surface">{comment.author.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{comment.createdAt}</span>
                      </div>
                      <div className="text-sm text-on-surface-variant leading-relaxed">
                        {comment.text}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <button className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface">Reply</button>
                        <button className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface">Edit</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Actions Area */}
        <div className="w-full md:w-64 bg-surface-container-low p-8 border-l border-outline-variant/10 overflow-y-auto">
          <div className="space-y-8">
            {/* Status */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Status</h4>
              {isEditingStatus ? (
                <select 
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-primary text-xs font-bold focus:outline-none"
                  value={task.status}
                  autoFocus
                  onBlur={() => setIsEditingStatus(false)}
                  onChange={(e) => {
                    const column = currentProject?.columns.find(c => c.id === e.target.value);
                    onUpdateTask({ 
                      ...task, 
                      status: e.target.value,
                      activities: logActivity('changed status to', column?.label || e.target.value)
                    });
                    setIsEditingStatus(false);
                  }}
                >
                  {currentProject?.columns.map(column => (
                    <option key={column.id} value={column.id}>{column.label}</option>
                  ))}
                </select>
              ) : (
                <button 
                  onClick={() => setIsEditingStatus(true)}
                  className="w-full flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/20 hover:border-primary transition-colors group"
                >
                  <span className="text-xs font-bold capitalize">
                    {currentProject?.columns.find(c => c.id === task.status)?.label || task.status.replace('-', ' ')}
                  </span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Assignee & Creator */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Assignee</h4>
                {isEditingAssignee ? (
                  <div className="bg-surface-container-lowest border border-primary rounded-xl overflow-hidden shadow-lg">
                    <div className="max-h-40 overflow-y-auto">
                      {members.map(member => (
                        <button
                          key={member.id}
                          className="w-full flex items-center gap-3 p-2 hover:bg-surface-container-high transition-colors text-left"
                          onClick={() => {
                            onUpdateTask({ 
                              ...task, 
                              assignee: member,
                              activities: logActivity('assigned task to', member.name)
                            });
                            setIsEditingAssignee(false);
                          }}
                        >
                          <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                          <span className="text-xs font-bold">{member.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingAssignee(true)}
                    className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20 cursor-pointer hover:border-primary transition-colors"
                  >
                    {task.assignee ? (
                      <>
                        <img className="w-8 h-8 rounded-full" src={task.assignee.avatar} alt={task.assignee.name} referrerPolicy="no-referrer" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{task.assignee.name}</span>
                          <span className="text-[10px] text-on-surface-variant">Click to change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">Unassigned</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Creator</h4>
                <div className="flex items-center gap-3 p-2 opacity-70">
                  <img className="w-8 h-8 rounded-full" src={task.creator.avatar} alt={task.creator.name} referrerPolicy="no-referrer" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{task.creator.name}</span>
                    <span className="text-[10px] text-on-surface-variant">Original author</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {task.labels.map(label => (
                  <span 
                    key={label} 
                    className="group relative px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {label}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLabel(label);
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {isAddingLabel ? (
                  <div className="flex items-center gap-1">
                    <input 
                      className="bg-surface-container-lowest border border-primary rounded-full px-2 py-0.5 text-[10px] w-20 focus:outline-none"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      autoFocus
                      onBlur={handleAddLabel}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingLabel(true)}
                    className="px-3 py-1 bg-surface-container-high rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Story Points */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Story Points</h4>
              {isEditingPoints ? (
                <input 
                  type="number"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-primary text-xs font-bold focus:outline-none"
                  defaultValue={task.points || 0}
                  autoFocus
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateTask({ 
                      ...task, 
                      points: isNaN(val) ? 0 : val,
                      activities: logActivity('updated story points', e.target.value)
                    });
                    setIsEditingPoints(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingPoints(false)}
                />
              ) : (
                <div 
                  className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setIsEditingPoints(true)}
                >
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold">{task.points || 0} Points</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Due Date</h4>
              {isEditingDueDate ? (
                <input 
                  type="text"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-primary text-xs font-bold focus:outline-none"
                  defaultValue={task.dueDate}
                  autoFocus
                  onBlur={(e) => {
                    onUpdateTask({ 
                      ...task, 
                      dueDate: e.target.value,
                      activities: logActivity('updated due date', e.target.value)
                    });
                    setIsEditingDueDate(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingDueDate(false)}
                />
              ) : (
                <div 
                  className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setIsEditingDueDate(true)}
                >
                  <Calendar className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold">{task.dueDate}</span>
                </div>
              )}
            </div>

            <hr className="border-outline-variant/10"/>

            {/* Actions */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Actions</h4>
              <div className="space-y-2">
                <ActionButton icon={<ArrowRight className="w-3 h-3" />} label="Move" />
                <ActionButton icon={<Copy className="w-3 h-3" />} label="Copy" />
                <ActionButton icon={<Archive className="w-3 h-3" />} label="Archive" />
                <ActionButton icon={<Trash2 className="w-3 h-3" />} label="Delete" variant="danger" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, variant = 'default' }: { icon: React.ReactNode; label: string; variant?: 'default' | 'danger' }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
      variant === 'danger' 
        ? 'bg-error-container/10 text-error border-error/10 hover:bg-error/10' 
        : 'bg-surface-container-lowest text-on-surface border-outline-variant/10 hover:bg-primary/5'
    }`}>
      {icon}
      {label}
    </button>
  );
}

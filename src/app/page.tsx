'use client';

import { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Board } from '../components/Board';
import { FilterBar } from '../components/FilterBar';
import { Management } from '../components/Management';
import { INITIAL_TASKS, MEMBERS, PROJECTS, SPRINTS, TEAMS } from '../constants';
import { Task, Status, Project, Sprint, FilterState, Team, Member } from '../types';
import { Plus } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [sprints, setSprints] = useState<Sprint[]>(SPRINTS);
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [currentUser, setCurrentUser] = useState<Member>(MEMBERS[0]); // Default to Marcus (Admin)

  const [activeSprintId, setActiveSprintId] = useState<string | 'backlog'>(SPRINTS[0].id);
  const [activeView, setActiveView] = useState<'board' | 'management' | 'boards-list'>('board');
  const [managementTab, setManagementTab] = useState<'teams' | 'projects' | 'members'>('teams');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECTS[0].id);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    projectIds: [],
    memberIds: [],
    categories: [],
    labels: [],
  });

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const currentTeam = teams.find(t => t.id === currentProject?.teamId);

  // RBAC: Filter projects/boards based on user role and team membership
  const visibleProjects = useMemo(() => {
    if (currentUser.role === 'admin') return projects;
    const userTeams = teams.filter(t => t.memberIds.includes(currentUser.id)).map(t => t.id);
    return projects.filter(p => p.teamId && userTeams.includes(p.teamId));
  }, [projects, teams, currentUser]);

  const allCategories = useMemo(() => Array.from(new Set(tasks.map(t => t.category))), [tasks]);
  const allLabels = useMemo(() => Array.from(new Set(tasks.flatMap(t => t.labels))), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Sprint filter
      if (activeSprintId === 'backlog') {
        if (task.sprintId) return false;
      } else {
        if (task.sprintId !== activeSprintId) return false;
      }

      // Project filter (only show tasks for the selected project/board)
      if (task.projectId !== selectedProjectId) return false;

      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // FilterBar Project filter (additional filtering within the board)
      if (filters.projectIds.length > 0 && !filters.projectIds.includes(task.projectId)) {
        return false;
      }

      // Member filter (now Assignee filter)
      if (filters.memberIds.length > 0 && (!task.assignee || !filters.memberIds.includes(task.assignee.id))) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
        return false;
      }

      // Labels filter
      if (filters.labels.length > 0 && !task.labels.some(l => filters.labels.includes(l))) {
        return false;
      }

      return true;
    });
  }, [tasks, activeSprintId, filters, selectedProjectId]);

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTasksReorder = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleAddTask = (status?: Status) => {
    const defaultStatus = currentProject?.columns[0]?.id || 'todo';
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Task',
      description: 'Enter description here...',
      status: status || defaultStatus,
      projectId: selectedProjectId,
      sprintId: activeSprintId === 'backlog' ? undefined : activeSprintId,
      points: 0,
      category: 'Engineering',
      labels: ['New'],
      creator: currentUser,
      assignee: currentUser,
      dueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      checklist: [],
      attachments: [],
      comments: [],
      activities: [],
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  };

  const handleCreateSprint = () => {
    const newSprint: Sprint = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Sprint ${sprints.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'backlog'
    };
    setSprints([...sprints, newSprint]);
    setActiveSprintId(newSprint.id);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  return (
    <Layout 
      onAddTask={() => handleAddTask()}
      onAddProject={() => {
        setActiveView('management');
        setManagementTab('projects');
      }}
      onAddTeam={() => {
        setActiveView('management');
        setManagementTab('teams');
      }}
      onAddMember={() => {
        setActiveView('management');
        setManagementTab('members');
      }}
      currentUser={currentUser}
      onSwitchUser={(user) => {
        setCurrentUser(user);
        setActiveView('board');
      }}
      members={members}
      activeView={activeView}
      setActiveView={setActiveView}
      currentProject={currentProject}
    >
      {activeView === 'board' && (
        <div className="flex flex-col h-full">
          <div className="px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-on-surface">{currentProject?.name}</h2>
              <div className="flex items-center gap-2">
                <select 
                  value={activeSprintId}
                  onChange={(e) => setActiveSprintId(e.target.value)}
                  className="bg-surface-container-high text-on-surface text-sm px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option value="backlog">Backlog</option>
                  {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                  ))}
                </select>
                <button 
                  onClick={handleCreateSprint}
                  className="p-1.5 hover:bg-surface-container-highest rounded-lg text-primary transition-colors"
                  title="Create New Sprint"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-medium">Total Points:</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {filteredTasks.reduce((acc, t) => acc + (t.points || 0), 0)}
              </span>
            </div>
          </div>

          <FilterBar 
            filters={filters}
            setFilters={setFilters}
            projects={projects}
            members={members}
            categories={allCategories}
            labels={allLabels}
          />

          <Board 
            tasks={filteredTasks} 
            projects={projects}
            currentProject={currentProject!}
            sprints={sprints}
            members={members}
            onUpdateTask={handleUpdateTask} 
            onUpdateProject={handleUpdateProject}
            onTasksReorder={(newTasks) => {
              const otherTasks = tasks.filter(t => !filteredTasks.some(ft => ft.id === t.id));
              setTasks([...otherTasks, ...newTasks]);
            }} 
            onAddTask={handleAddTask}
            currentUser={currentUser}
          />
        </div>
      )}

      {activeView === 'management' && (
        <Management 
          teams={teams}
          projects={projects}
          members={members}
          onUpdateTeams={setTeams}
          onUpdateProjects={setProjects}
          onUpdateMembers={setMembers}
          currentUser={currentUser}
          activeTab={managementTab}
          onTabChange={setManagementTab}
        />
      )}

      {activeView === 'boards-list' && (
        <div className="p-8 bg-surface h-full overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold text-on-surface mb-8">Active Boards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setActiveView('board');
                }}
                className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: project.color }}>
                    {project.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-xs text-on-surface-variant">
                      {teams.find(t => t.id === project.teamId)?.name || 'No Team'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <span>{tasks.filter(t => t.projectId === project.id).length} Tasks</span>
                  <span>{tasks.filter(t => t.projectId === project.id && t.status === 'done').length} Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

'use client';

import { Layout } from '../components/Layout';
import { Board } from '../components/Board';
import { FilterBar } from '../components/FilterBar';
import { Management } from '../components/Management';
import { Plus } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

export default function App() {
  const {
    currentUser, setCurrentUser,
    members, setMembers,
    activeView, setActiveView,
    managementTab, setManagementTab,
    currentProject,
    filters, setFilters,
    projects, setProjects,
    allCategories, allLabels,
    filteredTasks,
    sprints,
    selectedProjectId, setSelectedProjectId,
    activeSprintId, setActiveSprintId,
    tasks, setTasks,
    teams, setTeams,
    visibleProjects,
    handleUpdateTask, handleAddTask,
    handleCreateSprint, handleUpdateProject,
    handleDeleteTask, handleCopyTask,
    isLoading, error,
  } = useAppState();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <p className="text-on-surface-variant">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <p className="text-on-surface-variant">Failed to load data</p>
    </div>
  );

  if (!currentProject) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <p className="text-on-surface-variant">No project selected</p>
    </div>
  );

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
      searchValue={filters.search}
      onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
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
            onDeleteTask={handleDeleteTask}
            onCopyTask={handleCopyTask}
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

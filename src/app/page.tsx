'use client';

import { Layout } from '@/components/Layout';
import { Board } from '@/components/Board';
import { FilterBar } from '@/components/FilterBar';
import { Management } from '@/components/Management';
import { Backlog } from '@/components/Backlog';
import { useAppState } from '@/hooks/useAppState';

export default function App() {
  const {
    currentUser, setCurrentUser,
    members, setMembers,
    activeView, setActiveView,
    managementTab, setManagementTab,
    currentProject, currentTeam,
    filters, setFilters,
    projects, setProjects,
    allCategories, allLabels,
    filteredTasks,
    sprints, visibleSprints,
    selectedProjectId, setSelectedProjectId,
    activeSprintId, setActiveSprintId,
    tasks, setTasks,
    teams, setTeams,
    visibleProjects,
    isTeamAdmin, isPlatformAdmin,
    handleUpdateTask, handleTasksReorder, handleAddTask,
    handleCreateSprint, handleUpdateSprint, handleDeleteSprint,
    handleUpdateProject,
    handleDeleteTask, handleCopyTask,
    handleCreateProject, handleDeleteProject,
    handleCreateTeam, handleUpdateTeam, handleDeleteTeam,
    handleCreateMember, handleUpdateMember, handleDeleteMember,
    handleAddComment, handleUpdateComment,
    isLoading, error,
  } = useAppState();

  if (isLoading) return (
    <div className="min-h-screen bg-surface p-8">
      <div className="flex items-center gap-4 mb-8 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-surface-container-high" />
          <div className="h-3 w-20 rounded bg-surface-container-high" />
        </div>
      </div>
      <div className="flex gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-80 flex-shrink-0 space-y-4">
            <div className="h-4 w-24 rounded bg-surface-container-high" />
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 min-h-[200px]">
              <div className="h-32 rounded-xl bg-surface-container-high" />
              <div className="h-24 rounded-xl bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="text-center space-y-2">
        <p className="text-on-surface-variant text-lg">Failed to load data</p>
        <p className="text-on-surface-variant/50 text-sm">Check that the server is running and the database is seeded</p>
      </div>
    </div>
  );

  if (!currentProject) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="text-center space-y-2">
        <p className="text-on-surface-variant text-lg">No project selected</p>
        <p className="text-on-surface-variant/50 text-sm">Create a project to get started</p>
      </div>
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
      setManagementTab={setManagementTab}
      currentProject={currentProject}
      projects={projects}
      teams={teams}
      searchValue={filters.search}
      onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
      setSelectedProjectId={setSelectedProjectId}
    >
      {activeView === 'board' && (
        <div className="flex flex-col h-full">
          <div className="px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface">
            <div className="flex items-center gap-4">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-surface-container-high text-on-surface text-sm px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer font-medium"
              >
                {visibleProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={activeSprintId}
                  onChange={(e) => setActiveSprintId(e.target.value)}
                  className="bg-surface-container-high text-on-surface text-sm px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  {[...visibleSprints]
                    .sort((a, b) => {
                      if (a.status === 'backlog') return -1;
                      if (b.status === 'backlog') return 1;
                      return 0;
                    })
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.status !== 'backlog' ? ` (${s.status})` : ''}
                      </option>
                    ))}
                </select>
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
            sprints={visibleSprints}
            members={members}
            onUpdateTask={handleUpdateTask}
            onUpdateProject={handleUpdateProject}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onTasksReorder={handleTasksReorder}
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
          sprints={sprints}
          currentUser={currentUser}
          activeTab={managementTab}
          isPlatformAdmin={isPlatformAdmin}
          onCreateProject={handleCreateProject}
          onUpdateProject={(projectId, updates) => {
            const project = projects.find(p => p.id === projectId);
            if (project) handleUpdateProject({ ...project, ...updates });
          }}
          onDeleteProject={handleDeleteProject}
          onCreateTeam={handleCreateTeam}
          onUpdateTeam={handleUpdateTeam}
          onDeleteTeam={handleDeleteTeam}
          onCreateMember={handleCreateMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onCreateSprint={handleCreateSprint}
          onUpdateSprint={handleUpdateSprint}
          onDeleteSprint={handleDeleteSprint}
        />
      )}

      {activeView === 'backlog' && currentTeam && (
        <Backlog
          tasks={tasks}
          sprints={sprints}
          members={members}
          currentProject={currentProject}
          currentTeam={currentTeam}
          currentUser={currentUser}
          isTeamAdmin={isTeamAdmin}
          isPlatformAdmin={isPlatformAdmin}
          onUpdateTask={handleUpdateTask}
          onUpdateSprint={handleUpdateSprint}
        />
      )}
    </Layout>
  );
}

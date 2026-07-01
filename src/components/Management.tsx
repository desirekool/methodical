'use client';

import React, { useState, useCallback } from 'react';
import { Team, Project, Member, Sprint, UserRole, TeamRole } from '../types';
import Image from 'next/image';
import { Plus, Trash2, Users, LayoutGrid, UserPlus, Shield, ChevronDown, ChevronRight, Edit3, X, Check } from 'lucide-react';

interface ManagementProps {
  teams: Team[];
  projects: Project[];
  members: Member[];
  sprints: Sprint[];
  currentUser: Member;
  activeTab: 'teams' | 'projects' | 'members';
  isPlatformAdmin: boolean;
  onCreateProject: (project: Project) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onCreateTeam: (team: Team) => void;
  onUpdateTeam: (teamId: string, memberIds: string[], memberRoles?: Record<string, string>) => void;
  onDeleteTeam: (id: string) => void;
  onCreateMember: (member: Member) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onCreateSprint: (sprint: Sprint) => void;
  onUpdateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  onDeleteSprint: (sprintId: string) => void;
}

const SPRINT_STATUS_ACTIONS: Record<string, { label: string; nextStatus: string; color: string } | null> = {
  planning: { label: 'Plan', nextStatus: 'planned', color: 'text-blue-600 bg-blue-500/10' },
  planned: { label: 'Start', nextStatus: 'active', color: 'text-green-600 bg-green-500/10' },
  active: { label: 'Complete', nextStatus: 'completed', color: 'text-purple-600 bg-purple-500/10' },
  completed: null,
  backlog: null,
};

const isTeamAdminFor = (member: Member, team: Team): boolean => {
  if (member.role === 'admin') return true;
  return team.memberRoles?.[member.id] === 'admin';
};

export const Management: React.FC<ManagementProps> = ({
  teams,
  projects,
  members,
  sprints,
  currentUser,
  activeTab,
  isPlatformAdmin,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  onCreateSprint,
  onUpdateSprint,
  onDeleteSprint,
}) => {
  const [newTeamName, setNewTeamName] = useState('');

  const visibleTeams = useCallback(() => {
    if (isPlatformAdmin) return teams;
    return teams.filter(t => isTeamAdminFor(currentUser, t));
  }, [teams, currentUser, isPlatformAdmin])();

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    onCreateTeam({
      id: crypto.randomUUID(),
      name: newTeamName,
      memberIds: [],
      memberRoles: {},
    });
    setNewTeamName('');
  };

  if (!isPlatformAdmin && visibleTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
        <Shield className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm">You do not have permission to manage this workspace.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="px-8 py-6 border-b border-outline-variant/10">
        <h2 className="text-2xl font-bold text-on-surface mb-4">Management</h2>
        {activeTab === 'teams' && (
          <div className="flex gap-4 max-w-xl">
            <input
              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="New team name..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button
              onClick={addTeam}
              className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 custom-scrollbar">
        {activeTab === 'teams' && (
          <TeamsManager
            teams={visibleTeams}
            projects={projects}
            members={members}
            sprints={sprints}
            currentUser={currentUser}
            onUpdateTeam={onUpdateTeam}
            onDeleteTeam={onDeleteTeam}
            onCreateProject={onCreateProject}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
            onCreateSprint={onCreateSprint}
            onUpdateSprint={onUpdateSprint}
            onDeleteSprint={onDeleteSprint}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsManager
            projects={projects}
            teams={teams}
            members={members}
            onCreateProject={onCreateProject}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        )}
        {activeTab === 'members' && (
          <MembersManager
            members={members}
            onCreateMember={onCreateMember}
            onUpdateMember={onUpdateMember}
            onDeleteMember={onDeleteMember}
          />
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
      active
        ? 'bg-primary text-on-primary shadow-md'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    }`}
  >
    {icon}
    {label}
  </button>
);

const TeamsManager = ({ teams, projects, members, sprints, currentUser, onUpdateTeam, onDeleteTeam, onCreateProject, onUpdateProject, onDeleteProject, onCreateSprint, onUpdateSprint, onDeleteSprint }: {
  teams: Team[]; projects: Project[]; members: Member[]; sprints: Sprint[]; currentUser: Member;
  onUpdateTeam: (teamId: string, memberIds: string[], memberRoles?: Record<string, string>) => void;
  onDeleteTeam: (id: string) => void;
  onCreateProject: (project: Project) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onCreateSprint: (sprint: Sprint) => void;
  onUpdateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  onDeleteSprint: (sprintId: string) => void;
}) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(teams.map(t => t.id)));
  const [addMemberOpen, setAddMemberOpen] = useState<string | null>(null);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [showNewSprint, setShowNewSprint] = useState<string | null>(null);
  const [sprintName, setSprintName] = useState('');
  const [sprintStart, setSprintStart] = useState('');
  const [sprintEnd, setSprintEnd] = useState('');
  const [showNewProject, setShowNewProject] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectColumns, setProjectColumns] = useState('To Do, In Progress, Done');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectColor, setEditProjectColor] = useState('');

  const toggleExpand = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const toggleMember = (teamId: string, memberId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const memberIds = team.memberIds.includes(memberId)
      ? team.memberIds.filter(id => id !== memberId)
      : [...team.memberIds, memberId];
    const memberRoles = { ...team.memberRoles };
    if (!team.memberIds.includes(memberId)) {
      memberRoles[memberId] = 'member';
    } else {
      delete memberRoles[memberId];
    }
    onUpdateTeam(teamId, memberIds, memberRoles);
  };

  const changeMemberRole = (teamId: string, memberId: string, role: TeamRole) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const memberRoles = { ...team.memberRoles, [memberId]: role };
    onUpdateTeam(teamId, team.memberIds, memberRoles);
  };

  const addSprint = (teamId: string) => {
    if (!sprintName.trim() || !sprintStart || !sprintEnd) return;
    onCreateSprint({
      id: crypto.randomUUID(),
      name: sprintName,
      startDate: sprintStart,
      endDate: sprintEnd,
      status: 'planning',
      teamId,
    });
    setSprintName('');
    setSprintStart('');
    setSprintEnd('');
    setShowNewSprint(null);
  };

  const addProject = (teamId: string) => {
    if (!projectName.trim()) return;
    const columnLabels = projectColumns.split(',').map(c => c.trim()).filter(c => c !== '');
    const columns = columnLabels.map((label, idx) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      order: idx,
    }));
    onCreateProject({
      id: crypto.randomUUID(),
      name: projectName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      teamId,
      leadId: members[0]?.id,
      columns: columns.length > 0 ? columns : [
        { id: 'todo', label: 'To Do', order: 0 },
        { id: 'in-progress', label: 'In Progress', order: 1 },
        { id: 'done', label: 'Done', order: 2 },
      ],
    });
    setProjectName('');
    setProjectColumns('To Do, In Progress, Done');
    setShowNewProject(null);
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditProjectName(project.name);
    setEditProjectColor(project.color);
  };

  const saveEditProject = (projectId: string) => {
    if (!editProjectName.trim()) return;
    onUpdateProject(projectId, { name: editProjectName, color: editProjectColor });
    setEditingProject(null);
  };

  const teamSprints = (teamId: string) => sprints.filter(s => s.teamId === teamId);
  const teamProjects = (teamId: string) => projects.filter(p => p.teamId === teamId);
  const availableMembers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return members;
    return members.filter(m => !team.memberIds.includes(m.id));
  };

  return (
    <div className="max-w-4xl space-y-4">
      {teams.map(team => {
        const isExpanded = expandedTeams.has(team.id);
        const canManage = isTeamAdminFor(currentUser, team);
        const tsprints = teamSprints(team.id);
        const tprojects = teamProjects(team.id);
        const availMembers = availableMembers(team.id);

        return (
          <div key={team.id} className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
            <button
              onClick={() => toggleExpand(team.id)}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-container-higher transition-colors text-left"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-on-surface-variant" />}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {team.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{team.name}</h3>
                  <p className="text-[10px] text-on-surface-variant">
                    {team.memberIds.length} members · {tprojects.length} projects · {tsprints.length} sprints
                  </p>
                </div>
              </div>
              {canManage && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTeam(team.id); }}
                  className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Members</h4>
                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={() => setAddMemberOpen(addMemberOpen === team.id ? null : team.id)}
                          className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {addMemberOpen === team.id && (
                          <div className="absolute top-full right-0 mt-1 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-10 p-2">
                            <input
                              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs mb-2 outline-none focus:border-primary"
                              placeholder="Search members..."
                              value={addMemberSearch}
                              onChange={(e) => setAddMemberSearch(e.target.value)}
                              autoFocus
                            />
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {availMembers
                                .filter(m => m.name.toLowerCase().includes(addMemberSearch.toLowerCase()))
                                .map(m => (
                                  <button
                                    key={m.id}
                                    onClick={() => { toggleMember(team.id, m.id); setAddMemberOpen(null); setAddMemberSearch(''); }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-surface-container-high rounded-lg text-xs text-left"
                                  >
                                    <Image src={m.avatar} alt={m.name} width={20} height={20} className="rounded-full" referrerPolicy="no-referrer" />
                                    {m.name}
                                  </button>
                                ))}
                              {availMembers.filter(m => m.name.toLowerCase().includes(addMemberSearch.toLowerCase())).length === 0 && (
                                <p className="text-[10px] text-on-surface-variant/50 px-2 py-1">No members found</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.memberIds.map(memberId => {
                      const member = members.find(m => m.id === memberId);
                      if (!member) return null;
                      const role = team.memberRoles?.[memberId] || 'member';
                      return (
                        <div key={memberId} className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-outline-variant/20 bg-surface-container-lowest">
                          <Image src={member.avatar} alt={member.name} width={18} height={18} className="rounded-full" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-bold">{member.name}</span>
                          {canManage ? (
                            <select
                              value={role}
                              onChange={(e) => changeMemberRole(team.id, memberId, e.target.value as TeamRole)}
                              className="text-[10px] font-bold outline-none bg-transparent cursor-pointer"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                              role === 'admin' ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-surface-container-low'
                            }`}>
                              {role}
                            </span>
                          )}
                          {canManage && (
                            <button
                              onClick={() => toggleMember(team.id, memberId)}
                              className="text-error/50 hover:text-error p-0.5 rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Projects</h4>
                    {canManage && (
                      <button
                        onClick={() => setShowNewProject(showNewProject === team.id ? null : team.id)}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {tprojects.map(project => (
                      <div key={project.id} className="flex items-center justify-between bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/10">
                        {editingProject === project.id ? (
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="color"
                              value={editProjectColor}
                              onChange={(e) => setEditProjectColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-none p-0"
                            />
                            <input
                              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
                              value={editProjectName}
                              onChange={(e) => setEditProjectName(e.target.value)}
                              autoFocus
                            />
                            <button onClick={() => saveEditProject(project.id)} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingProject(null)} className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                              <span className="font-bold text-sm text-on-surface">{project.name}</span>
                              <span className="text-[10px] text-on-surface-variant">{project.columns.length} columns</span>
                            </div>
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => startEditProject(project)} className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => onDeleteProject(project.id)} className="text-error/50 hover:text-error p-1.5 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {showNewProject === team.id && (
                      <div className="bg-surface-container-lowest rounded-xl p-4 border border-primary/30 space-y-3">
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="Board name..."
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          autoFocus
                        />
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="Columns (comma separated)"
                          value={projectColumns}
                          onChange={(e) => setProjectColumns(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => addProject(team.id)} className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all">Create</button>
                          <button onClick={() => setShowNewProject(null)} className="text-on-surface-variant hover:bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sprints</h4>
                    {canManage && (
                      <button
                        onClick={() => setShowNewSprint(showNewSprint === team.id ? null : team.id)}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Start</div>
                      <div className="col-span-2">End</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-3"></div>
                    </div>
                    {tsprints.map(sprint => {
                      const action = SPRINT_STATUS_ACTIONS[sprint.status];
                      return (
                        <div key={sprint.id} className="grid grid-cols-12 gap-2 items-center bg-surface-container-lowest rounded-xl px-4 py-2.5 border border-outline-variant/10">
                          <div className="col-span-3 font-bold text-sm text-on-surface">{sprint.name}</div>
                          <div className="col-span-2 text-xs text-on-surface-variant">{sprint.startDate}</div>
                          <div className="col-span-2 text-xs text-on-surface-variant">{sprint.endDate}</div>
                          <div className="col-span-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                              sprint.status === 'backlog' ? 'bg-surface-container-high text-on-surface-variant' :
                              sprint.status === 'planning' ? 'bg-yellow-500/10 text-yellow-600' :
                              sprint.status === 'planned' ? 'bg-blue-500/10 text-blue-600' :
                              sprint.status === 'active' ? 'bg-green-500/10 text-green-600' :
                              'bg-surface-container-lowest text-on-surface-variant'
                            }`}>
                              {sprint.status}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-center gap-1 justify-end">
                            {canManage && action && (
                              <button
                                onClick={() => onUpdateSprint(sprint.id, { status: action.nextStatus as Sprint['status'] })}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
                              >
                                {action.label}
                              </button>
                            )}
                            {canManage && sprint.status !== 'backlog' && (
                              <button
                                onClick={() => onDeleteSprint(sprint.id)}
                                className="text-error/50 hover:text-error p-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {showNewSprint === team.id && (
                      <div className="bg-surface-container-lowest rounded-xl p-4 border border-primary/30 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                            placeholder="Sprint name..."
                            value={sprintName}
                            onChange={(e) => setSprintName(e.target.value)}
                            autoFocus
                          />
                          <input
                            type="date"
                            className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                            value={sprintStart}
                            onChange={(e) => setSprintStart(e.target.value)}
                          />
                          <input
                            type="date"
                            className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                            value={sprintEnd}
                            onChange={(e) => setSprintEnd(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addSprint(team.id)} className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all">Create Sprint</button>
                          <button onClick={() => setShowNewSprint(null)} className="text-on-surface-variant hover:bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ProjectsManager = ({ projects, teams, members, onCreateProject, onUpdateProject, onDeleteProject }: {
  projects: Project[]; teams: Team[]; members: Member[];
  onCreateProject: (project: Project) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColumns, setNewProjectColumns] = useState('To Do, In Progress, Done');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectColor, setEditProjectColor] = useState('');

  const toggleExpand = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const columnLabels = newProjectColumns.split(',').map(c => c.trim()).filter(c => c !== '');
    const columns = columnLabels.map((label, idx) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      order: idx,
    }));
    onCreateProject({
      id: crypto.randomUUID(),
      name: newProjectName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      teamId: teams[0]?.id,
      leadId: members[0]?.id,
      columns: columns.length > 0 ? columns : [
        { id: 'todo', label: 'To Do', order: 0 },
        { id: 'in-progress', label: 'In Progress', order: 1 },
        { id: 'done', label: 'Done', order: 2 },
      ],
    });
    setNewProjectName('');
    setNewProjectColumns('To Do, In Progress, Done');
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditProjectName(project.name);
    setEditProjectColor(project.color);
  };

  const saveEditProject = (projectId: string) => {
    if (!editProjectName.trim()) return;
    onUpdateProject(projectId, { name: editProjectName, color: editProjectColor });
    setEditingProject(null);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Create New Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Board Name</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Marketing Campaign"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Columns (comma separated)</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="To Do, In Progress, Done"
              value={newProjectColumns}
              onChange={(e) => setNewProjectColumns(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={addProject}
          className="w-full bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md"
        >
          Create Board
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-2">Existing Boards</h3>
        {projects.map(project => {
          const isExpanded = expandedProjects.has(project.id);
          const team = teams.find(t => t.id === project.teamId);
          const lead = members.find(m => m.id === project.leadId);

          return (
            <div key={project.id} className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
              <button
                onClick={() => toggleExpand(project.id)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-container-higher transition-colors text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-on-surface-variant" />}
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{project.name}</h3>
                  <p className="text-[10px] text-on-surface-variant">
                    {team?.name || 'No Team'} · {project.columns.length} columns
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                  className="text-error/50 hover:text-error p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Details</h4>
                    {editingProject === project.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editProjectColor}
                          onChange={(e) => setEditProjectColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-none p-0 flex-shrink-0"
                        />
                        <input
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => saveEditProject(project.id)} className="text-primary hover:bg-primary/10 p-2 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingProject(null)} className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 flex-wrap">
                        <button
                          onClick={() => startEditProject(project)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 text-sm hover:border-primary transition-colors"
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="font-bold">{project.name}</span>
                          <Edit3 className="w-3 h-3 text-on-surface-variant" />
                        </button>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Team</label>
                          <select
                            value={project.teamId || ''}
                            onChange={(e) => onUpdateProject(project.id, { teamId: e.target.value })}
                            className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
                          >
                            <option value="">No Team</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Lead</label>
                          <select
                            value={project.leadId || ''}
                            onChange={(e) => onUpdateProject(project.id, { leadId: e.target.value })}
                            className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
                          >
                            <option value="">No Lead</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Columns</h4>
                    <div className="space-y-1.5">
                      {project.columns
                        .sort((a, b) => a.order - b.order)
                        .map(col => (
                          <div key={col.id} className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-2.5 border border-outline-variant/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <span className="text-sm font-medium text-on-surface">{col.label}</span>
                            <span className="text-[10px] text-on-surface-variant ml-auto">{col.order + 1}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MembersManager = ({ members, onCreateMember, onUpdateMember, onDeleteMember }: {
  members: Member[];
  onCreateMember: (member: Member) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
}) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const addMember = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    onCreateMember({
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`,
      role: 'user',
    });
    setNewName('');
    setNewEmail('');
  };

  const removeMember = (id: string) => {
    onDeleteMember(id);
  };

  const updateRole = (id: string, role: UserRole) => {
    onUpdateMember(id, { role });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Email..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button
          onClick={addMember}
          className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
        >
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {members.map(member => (
          <div key={member.id} className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10">
            <div className="flex items-center gap-4">
              <Image src={member.avatar} alt={member.name} width={40} height={40} className="rounded-full" referrerPolicy="no-referrer" />
              <div>
                <h3 className="font-bold text-on-surface">{member.name}</h3>
                <p className="text-xs text-on-surface-variant">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={member.role}
                onChange={(e) => updateRole(member.id, e.target.value as UserRole)}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => removeMember(member.id)} className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

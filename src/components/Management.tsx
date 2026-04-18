import React, { useState } from 'react';
import { Team, Project, Member, UserRole } from '../types';
import { Plus, Trash2, Users, LayoutGrid, UserPlus, Shield } from 'lucide-react';

interface ManagementProps {
  teams: Team[];
  projects: Project[];
  members: Member[];
  onUpdateTeams: (teams: Team[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateMembers: (members: Member[]) => void;
  currentUser: Member;
  activeTab: 'teams' | 'projects' | 'members';
  onTabChange: (tab: 'teams' | 'projects' | 'members') => void;
}

export const Management: React.FC<ManagementProps> = ({
  teams,
  projects,
  members,
  onUpdateTeams,
  onUpdateProjects,
  onUpdateMembers,
  currentUser,
  activeTab,
  onTabChange
}) => {
  if (currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
        <Shield className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm">Only administrators can manage teams, projects, and members.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-8 py-6 border-b border-outline-variant/10">
        <h2 className="text-2xl font-bold text-on-surface mb-6">Management</h2>
        <div className="flex gap-4">
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => onTabChange('teams')} 
            icon={<Users className="w-4 h-4" />} 
            label="Teams" 
          />
          <TabButton 
            active={activeTab === 'projects'} 
            onClick={() => onTabChange('projects')} 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Projects" 
          />
          <TabButton 
            active={activeTab === 'members'} 
            onClick={() => onTabChange('members')} 
            icon={<UserPlus className="w-4 h-4" />} 
            label="Members" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'teams' && (
          <TeamsManager teams={teams} members={members} onUpdate={onUpdateTeams} />
        )}
        {activeTab === 'projects' && (
          <ProjectsManager projects={projects} teams={teams} members={members} onUpdate={onUpdateProjects} />
        )}
        {activeTab === 'members' && (
          <MembersManager members={members} onUpdate={onUpdateMembers} />
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

const TeamsManager = ({ teams, members, onUpdate }: { teams: Team[]; members: Member[]; onUpdate: (teams: Team[]) => void }) => {
  const [newTeamName, setNewTeamName] = useState('');

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamName,
      memberIds: []
    };
    onUpdate([...teams, newTeam]);
    setNewTeamName('');
  };

  const removeTeam = (id: string) => {
    onUpdate(teams.filter(t => t.id !== id));
  };

  const toggleMember = (teamId: string, memberId: string) => {
    onUpdate(teams.map(t => {
      if (t.id === teamId) {
        const memberIds = t.memberIds.includes(memberId)
          ? t.memberIds.filter(id => id !== memberId)
          : [...t.memberIds, memberId];
        return { ...t, memberIds };
      }
      return t;
    }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex gap-4">
        <input 
          className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="New team name..."
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button 
          onClick={addTeam}
          className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
        >
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-on-surface">{team.name}</h3>
              <button onClick={() => removeTeam(team.id)} className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Members</p>
              <div className="flex flex-wrap gap-2">
                {members.map(member => (
                  <button 
                    key={member.id}
                    onClick={() => toggleMember(team.id, member.id)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-full border text-[10px] font-bold transition-all ${
                      team.memberIds.includes(member.id)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    <img src={member.avatar} className="w-4 h-4 rounded-full" alt={member.name} referrerPolicy="no-referrer" />
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectsManager = ({ projects, teams, members, onUpdate }: { projects: Project[]; teams: Team[]; members: Member[]; onUpdate: (projects: Project[]) => void }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColumns, setNewProjectColumns] = useState('To Do, In Progress, Done');

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const columnLabels = newProjectColumns.split(',').map(c => c.trim()).filter(c => c !== '');
    const columns = columnLabels.map((label, idx) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      order: idx
    }));

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      teamId: teams[0]?.id,
      leadId: members[0]?.id,
      columns: columns.length > 0 ? columns : [
        { id: 'todo', label: 'To Do', order: 0 },
        { id: 'in-progress', label: 'In Progress', order: 1 },
        { id: 'done', label: 'Done', order: 2 },
      ]
    };
    onUpdate([...projects, newProject]);
    setNewProjectName('');
    setNewProjectColumns('To Do, In Progress, Done');
  };

  const removeProject = (id: string) => {
    onUpdate(projects.filter(p => p.id !== id));
  };

  const updateProjectTeam = (projectId: string, teamId: string) => {
    onUpdate(projects.map(p => p.id === projectId ? { ...p, teamId } : p));
  };

  const updateProjectLead = (projectId: string, leadId: string) => {
    onUpdate(projects.map(p => p.id === projectId ? { ...p, leadId } : p));
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

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-2">Existing Boards</h3>
        {projects.map(project => (
          <div key={project.id} className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              <div>
                <h3 className="font-bold text-on-surface">{project.name}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {project.columns.length} Columns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Team</label>
                <select 
                  value={project.teamId || ''}
                  onChange={(e) => updateProjectTeam(project.id, e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="">No Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Lead</label>
                <select 
                  value={project.leadId || ''}
                  onChange={(e) => updateProjectLead(project.id, e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="">No Lead</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => removeProject(project.id)} className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors self-end">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MembersManager = ({ members, onUpdate }: { members: Member[]; onUpdate: (members: Member[]) => void }) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const addMember = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      email: newEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`,
      role: 'user'
    };
    onUpdate([...members, newMember]);
    setNewName('');
    setNewEmail('');
  };

  const removeMember = (id: string) => {
    onUpdate(members.filter(m => m.id !== id));
  };

  const updateRole = (id: string, role: UserRole) => {
    onUpdate(members.map(m => m.id === id ? { ...m, role } : m));
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
              <img src={member.avatar} className="w-10 h-10 rounded-full" alt={member.name} referrerPolicy="no-referrer" />
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

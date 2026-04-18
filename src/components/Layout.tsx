import React, { useState } from 'react';
import { LayoutGrid, Users, Settings, Bell, Search, Plus, Shield, LogOut, ChevronDown, CheckSquare, UserPlus } from 'lucide-react';
import { Member, Project } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onAddTask: () => void;
  onAddProject?: () => void;
  onAddTeam?: () => void;
  onAddMember?: () => void;
  currentUser: Member;
  onSwitchUser: (user: Member) => void;
  members: Member[];
  activeView: 'board' | 'management' | 'boards-list';
  setActiveView: (view: 'board' | 'management' | 'boards-list') => void;
  currentProject?: Project;
}

export function Layout({ 
  children, 
  onAddTask, 
  onAddProject,
  onAddTeam,
  onAddMember,
  currentUser, 
  onSwitchUser, 
  members,
  activeView,
  setActiveView,
  currentProject
}: LayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <header className="bg-white border-b border-surface-container-highest flex justify-between items-center px-6 h-16 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-on-surface">Methodical</span>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveView('board')}
              className={`text-sm font-bold transition-colors ${activeView === 'board' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Workspace
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20">
            <Search className="text-on-surface-variant w-4 h-4 mr-2" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-on-surface-variant/50" 
              placeholder="Search..." 
              type="text"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCreateMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-bright border border-outline-variant/20 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1 duration-200 z-[60]">
                <button 
                  onClick={() => {
                    onAddTask();
                    setShowCreateMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-left"
                >
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-on-surface">New Task</span>
                </button>

                {currentUser.role === 'admin' && (
                  <>
                    <div className="h-px bg-outline-variant/10 my-1" />
                    <button 
                      onClick={() => {
                        onAddProject?.();
                        setShowCreateMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <LayoutGrid className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-xs font-bold text-on-surface">New Board</span>
                    </button>
                    <button 
                      onClick={() => {
                        onAddTeam?.();
                        setShowCreateMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <Users className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-xs font-bold text-on-surface">New Team</span>
                    </button>
                    <button 
                      onClick={() => {
                        onAddMember?.();
                        setShowCreateMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <UserPlus className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-xs font-bold text-on-surface">New Member</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-surface-container-high rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20">
                <img 
                  alt={currentUser.name} 
                  src={currentUser.avatar}
                  referrerPolicy="no-referrer"
                />
              </div>
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-surface-bright border border-outline-variant/20 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                  <p className="text-sm font-bold text-on-surface">{currentUser.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{currentUser.role}</p>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="px-4 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Switch User</p>
                  {members.map(member => (
                    <button 
                      key={member.id}
                      onClick={() => {
                        onSwitchUser(member);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low transition-colors"
                    >
                      <img src={member.avatar} className="w-6 h-6 rounded-full" alt={member.name} referrerPolicy="no-referrer" />
                      <span className="text-xs font-medium text-on-surface">{member.name}</span>
                      {member.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-outline-variant/10 mt-2 pt-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error transition-colors text-xs font-bold">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-surface-container-low w-64 border-r border-surface-container-highest flex flex-col p-4 space-y-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-4 mb-2">
            <div className="w-8 h-8 rounded flex items-center justify-center text-on-primary font-bold text-lg" style={{ backgroundColor: currentProject?.color || '#4F46E5' }}>
              {currentProject?.name[0] || 'P'}
            </div>
            <div>
              <div className="text-on-surface font-semibold text-sm truncate w-40">{currentProject?.name || 'No Project'}</div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Active Board</div>
            </div>
          </div>
          
          <SidebarItem 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Boards" 
            active={activeView === 'boards-list' || activeView === 'board'} 
            onClick={() => setActiveView('boards-list')}
          />
          {currentUser.role === 'admin' && (
            <SidebarItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Management" 
              active={activeView === 'management'} 
              onClick={() => setActiveView('management')}
            />
          )}
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm font-medium ${
        active 
          ? 'bg-surface-container-highest text-on-surface' 
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`} 
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

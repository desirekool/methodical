'use client';

import React, { useState } from 'react';
import { LayoutGrid, Users, Bell, Search, Plus, Shield, LogOut, ChevronDown, CheckSquare, UserPlus, ListTodo, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Member, Project, Team } from '../types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
  onAddTask: () => void;
  onAddProject?: () => void;
  onAddTeam?: () => void;
  onAddMember?: () => void;
  currentUser: Member;
  onSwitchUser: (user: Member) => void;
  members: Member[];
  activeView: 'board' | 'management' | 'backlog';
  setActiveView: (view: 'board' | 'management' | 'backlog') => void;
  setManagementTab: (tab: 'teams' | 'projects' | 'members') => void;
  currentProject?: Project;
  projects: Project[];
  teams: Team[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  setSelectedProjectId: (id: string) => void;
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
  setManagementTab,
  currentProject,
  projects,
  teams,
  searchValue,
  onSearchChange,
  setSelectedProjectId,
}: LayoutProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [backlogOpen, setBacklogOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);

  const handleGoToBoard = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('board');
  };

  const handleGoToBacklog = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('backlog');
  };

  const handleGoToManagement = (tab: 'teams' | 'projects' | 'members') => {
    setManagementTab(tab);
    setActiveView('management');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground text-sm font-bold" style={{ backgroundColor: currentProject?.color || '#4F46E5' }}>
                  {currentProject?.name?.[0] || 'P'}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{currentProject?.name || 'No Project'}</span>
                  <span className="text-xs text-sidebar-foreground/70">Active Board</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel
              render={<button />}
              onClick={() => setBoardsOpen(!boardsOpen)}
              className="cursor-pointer gap-2"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${boardsOpen ? '' : '-rotate-90'}`} />
              Boards
            </SidebarGroupLabel>
            {boardsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map(project => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      isActive={activeView === 'board' && currentProject?.id === project.id}
                      onClick={() => handleGoToBoard(project.id)}
                      tooltip={project.name}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <span>{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            )}
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel
              render={<button />}
              onClick={() => setBacklogOpen(!backlogOpen)}
              className="cursor-pointer gap-2"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${backlogOpen ? '' : '-rotate-90'}`} />
              Backlog
            </SidebarGroupLabel>
            {backlogOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {teams.map(team => (
                  <SidebarMenuItem key={team.id}>
                    <SidebarMenuButton
                      isActive={activeView === 'backlog' && projects.find(p => p.id === currentProject?.id)?.teamId === team.id}
                      onClick={() => {
                        const teamProject = projects.find(p => p.teamId === team.id);
                        if (teamProject) handleGoToBacklog(teamProject.id);
                      }}
                      tooltip={`${team.name} Backlog`}
                    >
                      <ListTodo className="w-4 h-4" />
                      <span>{team.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            )}
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel
              render={<button />}
              onClick={() => setManagementOpen(!managementOpen)}
              className="cursor-pointer gap-2"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${managementOpen ? '' : '-rotate-90'}`} />
              Management
            </SidebarGroupLabel>
            {managementOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'management'}
                    onClick={() => handleGoToManagement('teams')}
                    tooltip="Teams"
                  >
                    <Users />
                    <span>Teams</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'management'}
                    onClick={() => handleGoToManagement('projects')}
                    tooltip="Projects"
                  >
                    <LayoutGrid />
                    <span>Projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === 'management'}
                    onClick={() => handleGoToManagement('members')}
                    tooltip="Members"
                  >
                    <UserPlus />
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
            )}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="bg-white border-b border-border flex justify-between items-center px-4 h-16 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center bg-muted px-3 py-1.5 rounded-lg border border-border">
              <Search className="text-muted-foreground w-4 h-4 mr-2" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-muted-foreground/50"
                placeholder="Search..."
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCreateMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1 duration-200 z-50">
                  <button
                    onClick={() => {
                      onAddTask();
                      setShowCreateMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold">New Task</span>
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => {
                      onAddProject?.();
                      setShowCreateMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold">New Board</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddTeam?.();
                      setShowCreateMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold">New Team</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddMember?.();
                      setShowCreateMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold">New Member</span>
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border/20">
                  <Image alt={currentUser.name} src={currentUser.avatar} fill className="object-cover" referrerPolicy="no-referrer" sizes="32px" />
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-border mb-2">
                    <p className="text-sm font-bold">{currentUser.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{currentUser.role}</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Switch User</p>
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSwitchUser(member);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                      >
                        <Image src={member.avatar} alt={member.name} width={24} height={24} className="rounded-full" referrerPolicy="no-referrer" />
                        <span className="text-xs font-medium flex-1">{member.name}</span>
                        {member.role === 'admin' && <Shield className="w-3 h-3 shrink-0 text-primary" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border mt-2 pt-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-accent transition-colors text-xs font-bold">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

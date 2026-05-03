'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, MoreVertical, Shield, Mail, Trash2, Clock, CheckCircle2, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { formatDate } from '@/lib/date-utils';

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
  user: {
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function TeamPage() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER'>('MEMBER');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTeamData = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const [sessionRes, membersRes, invitesRes] = await Promise.all([
        api.get<{ user: any }>('/auth/get-session'),
        api.get<{ success: boolean; data: Member[] }>(`/workspaces/${activeWorkspace.id}/members`),
        api.get<{ success: boolean; data: Invite[] }>(`/invites/${activeWorkspace.id}`)
      ]);

      if (sessionRes?.user) {
        setCurrentUser(sessionRes.user);
      }

      if (membersRes.success) {
        setMembers(membersRes.data);
        const myMembership = membersRes.data.find(m => m.user.email === sessionRes?.user?.email);
        if (myMembership) {
          setCurrentUserRole(myMembership.role);
        }
      }

      if (invitesRes.success) {
        setInvites(invitesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [activeWorkspace]);

  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';

  // Search logic
  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (member.user.name && member.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, searchQuery]);

  const filteredInvites = useMemo(() => {
    return invites.filter(invite => 
      invite.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invites, searchQuery]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;

    setIsSubmittingInvite(true);
    try {
      const response = await api.post<{ success: boolean; data: Invite }>(`/invites/${activeWorkspace.id}`, {
        email: inviteEmail
      });
      if (response.success) {
        setInviteEmail('');
        setIsInviting(false);
        setInvites([response.data, ...invites]);
        alert('Invitation sent successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const removeMember = async (membershipId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await api.delete<{ success: boolean }>(`/members/${membershipId}`);
      if (response.success) {
        setMembers(members.filter(m => m.id !== membershipId));
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight m-0">Team Workspace</h1>
          <p className="text-foreground/70 m-0">Manage team access and invitations</p>
        </div>
        {canManage && (
          <Button 
            leftIcon={<UserPlus size={18} />} 
            onClick={() => setIsInviting(!isInviting)}
            disabled={!activeWorkspace}
          >
            Invite Member
          </Button>
        )}
      </div>

      {isInviting && (
        <Card className="border-primary/30 bg-primary-light/5 animate-fade-in shadow-lg">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold m-0 text-primary">Invite Team Member</h3>
              <p className="text-sm text-foreground/60 m-0">New members will be sent an invitation link via email.</p>
            </div>
            
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    leftIcon={<Mail size={16} />}
                    required
                    fullWidth
                    disabled={isSubmittingInvite}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto shadow-md" isLoading={isSubmittingInvite}>Send Invitation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
        <input
          type="text"
          placeholder="Search members or invites..."
          className="w-full bg-surface-hover border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-10">
        {/* ACTIVE MEMBERS SECTION */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle2 size={18} className="text-success" />
            <h2 className="text-lg font-bold m-0 tracking-tight">Active Members</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-hover text-[10px] font-black text-foreground/40">{filteredMembers.length}</span>
          </div>
          <Card className="overflow-hidden border-none shadow-xl bg-surface/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-foreground/40 font-bold uppercase tracking-widest text-xs animate-pulse">Retrieving Team...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-foreground/10">
                    <Users size={32} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold m-0 text-foreground/80">
                      {searchQuery ? 'No members found' : 'No Active Members'}
                    </h3>
                    <p className="text-foreground/50 max-w-[400px] m-0 text-sm">
                      {searchQuery 
                        ? `We couldn't find any team members matching "${searchQuery}".` 
                        : 'Invite your teammates to collaborate on this workspace.'}
                    </p>
                  </div>
                  {searchQuery ? (
                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>Clear Search</Button>
                  ) : canManage && (
                    <Button variant="outline" size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setIsInviting(true)}>
                      Invite Member
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-hover/30">
                      <th className="p-4 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border">Member</th>
                      <th className="p-4 px-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border">Role</th>
                      <th className="p-4 px-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border text-right">Joined</th>
                      <th className="p-4 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="border-b border-border/50 last:border-0 hover:bg-primary-light/5 transition-all group">
                        <td className="p-4 px-8 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-black shadow-sm">
                              {member.user.name ? member.user.name.charAt(0) : <Mail size={16} />}
                            </div>
                            <div className="flex flex-col">
                              <div className="font-bold text-foreground group-hover:text-primary transition-colors">{member.user.name || 'Anonymous User'}</div>
                              <div className="text-xs font-medium text-foreground/40">{member.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 px-6 align-middle">
                          <div className="flex items-center gap-1.5">
                            {member.role === 'OWNER' && <Shield size={14} className="text-primary" />}
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${
                              member.role === 'OWNER' ? 'bg-primary/10 text-primary border border-primary/20' :
                              member.role === 'ADMIN' ? 'bg-accent/10 text-accent border border-accent/20' :
                              'bg-surface-hover text-foreground/60'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 px-6 align-middle text-right">
                          <span className="text-xs font-medium text-foreground/30">
                            {formatDate(member.createdAt)}
                          </span>
                        </td>
                        <td className="p-4 px-8 align-middle text-right">
                          <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage && member.role !== 'OWNER' && member.user.email !== currentUser?.email && (
                              <button 
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/30 hover:bg-error hover:text-white transition-all shadow-sm" 
                                onClick={() => removeMember(member.id)}
                                title="Remove member"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/20 hover:bg-surface-hover hover:text-foreground transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </section>

        {/* PENDING INVITES SECTION */}
        {(filteredInvites.length > 0 || (searchQuery && filteredInvites.length === 0)) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <Clock size={18} className="text-secondary" />
              <h2 className="text-lg font-bold m-0 tracking-tight">Pending Invitations</h2>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-hover text-[10px] font-black text-foreground/40">{filteredInvites.length}</span>
            </div>
            <Card className="overflow-hidden border-none shadow-xl bg-surface/50">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-hover/30">
                      <th className="p-4 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border">Invited Email</th>
                      <th className="p-4 px-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border">Role</th>
                      <th className="p-4 px-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border">Sent At</th>
                      <th className="p-4 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/30 border-b border-border text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvites.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-foreground/40 italic">No pending invites found matching your search.</td>
                      </tr>
                    ) : (
                      filteredInvites.map(invite => (
                        <tr key={invite.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/5 transition-all group">
                          <td className="p-4 px-8 align-middle">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-surface-hover text-foreground/20 flex items-center justify-center">
                                <Mail size={16} />
                              </div>
                              <div className="font-bold text-foreground group-hover:text-secondary transition-colors">{invite.email}</div>
                            </div>
                          </td>
                          <td className="p-4 px-6 align-middle">
                            <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black tracking-widest bg-surface-hover text-foreground/40 border border-border/40">
                              {invite.role}
                            </span>
                          </td>
                          <td className="p-4 px-6 align-middle">
                            <span className="text-xs font-medium text-foreground/30 italic">
                              {formatDate(invite.createdAt)}
                            </span>
                          </td>
                          <td className="p-4 px-8 align-middle text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

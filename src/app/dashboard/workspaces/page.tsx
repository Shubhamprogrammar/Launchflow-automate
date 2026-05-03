'use client';

import React, { useState } from 'react';
import { Plus, Briefcase, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useWorkspace, Workspace } from '@/contexts/WorkspaceContext';

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading, refreshWorkspaces } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post<{ success: boolean; workspace: Workspace }>('/workspaces/create-workspace', {
        name: newWorkspaceName
      });
      
      if (response.success) {
        await refreshWorkspaces();
        setNewWorkspaceName('');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight m-0">Workspaces</h1>
          <p className="text-foreground/70 m-0">Manage your teams and organizations</p>
        </div>
        <Button 
          leftIcon={<Plus size={18} />} 
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          New Workspace
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary ring-1 ring-primary animate-fade-in">
          <CardHeader>
            <CardTitle>Create a new workspace</CardTitle>
            <CardDescription>Workspaces contain all your team's resources and settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-6">
              <Input
                label="Workspace Name"
                placeholder="e.g. Acme Inc"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                autoFocus
                required
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsCreating(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-foreground/60">Loading workspaces...</div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 py-24 text-center gap-4 bg-surface/50 rounded-2xl border-2 border-dashed border-border/60">
          <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-foreground/20">
            <Briefcase size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold m-0">No Workspaces Found</h3>
            <p className="text-foreground/60 max-w-[400px] m-0">
              You haven't created or joined any workspaces yet. Create your first workspace to get started.
            </p>
          </div>
          <Button 
            leftIcon={<Plus size={18} />} 
            onClick={() => setIsCreating(true)}
            className="mt-2"
          >
            Create Your First Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map(workspace => (
            <Card 
              key={workspace.id} 
              className={`flex flex-col transition-all duration-150 hover:-translate-y-1 hover:shadow-md ${activeWorkspace?.id === workspace.id ? 'ring-2 ring-primary border-primary' : ''}`}
            >
              <CardContent className="flex-1 flex items-start gap-4 pt-6">
                <div className="w-12 h-12 rounded-md bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <Briefcase size={24} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold m-0 leading-tight">{workspace.name}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-foreground/60">Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border flex justify-between bg-surface-hover/50 mt-auto">
                <Button variant="ghost" size="sm" leftIcon={<Settings size={16} />}>
                  Settings
                </Button>
                <Button 
                  variant={activeWorkspace?.id === workspace.id ? 'primary' : 'outline'} 
                  size="sm" 
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => setActiveWorkspace(workspace)}
                  disabled={activeWorkspace?.id === workspace.id}
                >
                  {activeWorkspace?.id === workspace.id ? 'Active' : 'Switch'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

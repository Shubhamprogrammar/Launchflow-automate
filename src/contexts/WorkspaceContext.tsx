'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; workspaces: Workspace[] }>('/workspaces/my-workspaces');
      if (response.success) {
        setWorkspaces(response.workspaces);
        
        // If there's an active workspace, try to keep it. 
        // Otherwise, set the first one as active.
        if (response.workspaces.length > 0) {
          const storedId = localStorage.getItem('activeWorkspaceId');
          const found = response.workspaces.find(w => w.id === storedId);
          if (found) {
            setActiveWorkspaceState(found);
          } else {
            setActiveWorkspaceState(response.workspaces[0]);
            localStorage.setItem('activeWorkspaceId', response.workspaces[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem('activeWorkspaceId', workspace.id);
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      activeWorkspace, 
      setActiveWorkspace, 
      isLoading,
      refreshWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

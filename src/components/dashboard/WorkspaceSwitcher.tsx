'use client';

import React, { useState } from 'react';
import { ChevronDown, Briefcase, Plus, Check } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/Button';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-surface-hover/50 border border-border rounded-lg hover:bg-surface-hover transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="flex-1 text-left truncate font-semibold text-sm">
            {activeWorkspace?.name || 'Select Workspace'}
          </div>
        </div>
        <ChevronDown size={16} className={`text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-surface border border-border rounded-lg shadow-xl z-50 animate-fade-in">
            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-3 py-2">My Workspaces</div>
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeWorkspace?.id === workspace.id ? 'bg-primary-light text-primary' : 'hover:bg-surface-hover text-foreground/70 hover:text-foreground'}`}
                >
                  <span className="truncate">{workspace.name}</span>
                  {activeWorkspace?.id === workspace.id && <Check size={14} />}
                </button>
              ))}
            </div>
            <div className="border-t border-border mt-2 pt-2">
              <a 
                href="/dashboard/workspaces" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary-light rounded-md transition-colors"
              >
                <Plus size={14} />
                <span>Manage Workspaces</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

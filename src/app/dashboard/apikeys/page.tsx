'use client';

import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, ShieldCheck, Clock, Book, Code } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { formatDate } from '@/lib/date-utils';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { activeWorkspace } = useWorkspace();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const fetchKeys = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: ApiKey[] }>(`/apikeys/workspace/${activeWorkspace.id}`);
      if (response.success) {
        setKeys(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [activeWorkspace]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !activeWorkspace) return;

    setIsSubmitting(true);
    try {
      const response = await api.post<{ success: boolean; data: { id: string; name: string; apiKey: string } }>('/apikeys', {
        workspaceId: activeWorkspace.id,
        name: newKeyName
      });
      if (response.success) {
        setNewlyCreatedKey(response.data.apiKey);
        setNewKeyName('');
        setIsCreating(false);
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;

    try {
      // The backend controller expects workspaceId in body, 
      // but fetchApi delete doesn't take body. 
      // I'll just use fetchApi directly with body for this one.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/apikeys/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: activeWorkspace?.id }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight m-0">API Keys</h1>
          <p className="text-foreground/70 m-0">Programmatic access to your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost"
            leftIcon={<Book size={18} />} 
            onClick={() => setShowDocs(!showDocs)}
            className={showDocs ? 'bg-surface-hover text-primary' : ''}
          >
            {showDocs ? 'Hide Documentation' : 'View Documentation'}
          </Button>
          <Button 
            leftIcon={<Plus size={18} />} 
            onClick={() => {
              setIsCreating(true);
              setNewlyCreatedKey(null);
            }}
            disabled={!activeWorkspace}
          >
            Create New Key
          </Button>
        </div>
      </div>

      {newlyCreatedKey && (
        <Card className="border-success bg-success/5 animate-glow">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <ShieldCheck size={20} />
              Key Generated Successfully
            </CardTitle>
            <CardDescription>
              Copy this key now. For security reasons, it will not be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 p-3 bg-surface border border-success/20 rounded-md font-mono text-sm break-all">
              <span className="flex-1">{newlyCreatedKey}</span>
              <button 
                onClick={() => copyToClipboard(newlyCreatedKey)}
                className="p-2 hover:bg-surface-hover rounded-md transition-colors"
              >
                <Copy size={16} className="text-primary" />
              </button>
            </div>
            <Button variant="outline" className="self-end" onClick={() => setNewlyCreatedKey(null)}>
              I've saved my key
            </Button>
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Create API Key</CardTitle>
            <CardDescription>Enter a descriptive name for this key to identify it later.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              <Input
                label="Key Name"
                placeholder="e.g. Production Webhook"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Generate Key</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-foreground/60">Loading API keys...</div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center gap-4 bg-surface/30">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-foreground/10">
                  <Key size={32} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold m-0 text-foreground/80">No API Keys</h3>
                  <p className="text-foreground/50 max-w-[400px] m-0 text-sm">
                    Generate an API key to start interacting with the LaunchFlow API programmatically.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Plus size={16} />} 
                  onClick={() => setIsCreating(true)}
                  className="mt-2"
                >
                  Create Your First Key
                </Button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50">
                    <th className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-foreground/50">Name</th>
                    <th className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-foreground/50">Key Prefix</th>
                    <th className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-foreground/50">Created</th>
                    <th className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-foreground/50">Last Used</th>
                    <th className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-foreground/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(key => (
                    <tr key={key.id} className="border-b border-border last:border-0 hover:bg-surface-hover/20 transition-colors">
                      <td className="p-4 px-6 align-middle font-medium">{key.name}</td>
                      <td className="p-4 px-6 align-middle">
                        <code className="text-xs px-2 py-1 bg-surface-hover rounded font-mono">{key.prefix}...</code>
                      </td>
                      <td className="p-4 px-6 align-middle text-sm text-foreground/60">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="p-4 px-6 align-middle text-sm">
                        {key.lastUsedAt ? (
                          <div className="flex items-center gap-1.5 text-foreground/70">
                            <Clock size={12} />
                            {formatDate(key.lastUsedAt)}
                          </div>
                        ) : (
                          <span className="text-foreground/40 italic">Never</span>
                        )}
                      </td>
                      <td className="p-4 px-6 align-middle text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-error hover:bg-error/10 hover:text-error"
                          onClick={() => revokeKey(key.id)}
                          leftIcon={<Trash2 size={14} />}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {showDocs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up mt-4">
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book size={20} className="text-primary" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>Learn how to use your API keys to interact with LaunchFlow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-foreground/70">
              <p>
                LaunchFlow API keys are used to authenticate programmatic requests to our API. 
                Each key is scoped to the current workspace and grants full access to its resources.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Authentication Header</h4>
                <p>Include your API key in the request headers using the Authorization field:</p>
                <code className="block p-3 bg-surface-hover rounded-md font-mono text-xs text-primary border border-primary/10">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} className="text-primary" />
                Example Usage
              </CardTitle>
              <CardDescription>Standard implementation using cURL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <code className="block p-4 bg-surface-hover rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-primary/10">
                  <span className="text-foreground/40"># Get workspace information</span><br/>
                  curl -X GET "{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/workspaces/me" \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer <span className="text-primary">YOUR_API_KEY</span>"
                </code>
                <button 
                  onClick={() => copyToClipboard(`curl -X GET "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/workspaces/me" -H "Authorization: Bearer YOUR_API_KEY"`)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded-md shadow-sm hover:bg-surface-hover"
                >
                  <Copy size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

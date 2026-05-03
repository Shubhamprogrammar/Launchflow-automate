'use client';

import React, { useEffect, useState } from 'react';
import { Users, Activity, DollarSign, TrendingUp, Key, FileText, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { formatDate } from '@/lib/date-utils';

interface AnalyticsData {
  overview: {
    members: number;
    invites: number;
    pendingInvites: number;
    acceptedInvites: number;
    inviteConversion: number;
    files: number;
    apiKeys: number;
    jobs: number;
  };
  latestUsers: any[];
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  metadata?: any;
}

export default function DashboardOverview() {
  const { activeWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const renderActivityDescription = (log: ActivityLog) => {
    const { action, metadata } = log;
    switch (action) {
      case 'WORKSPACE_CREATED':
        return `Workspace "${metadata?.workspaceName || 'Unknown'}" created`;
      case 'INVITE_CREATED':
        return `Invited ${metadata?.invitedEmail || 'someone'}`;
      case 'INVITE_ACCEPTED':
      case 'MEMBER_JOINED':
        return `${metadata?.joinedEmail || 'New member'} joined the workspace`;
      case 'API_KEY_CREATED':
        return `New API Key "${metadata?.name || ''}" generated`;
      case 'API_KEY_REVOKED':
        return `API Key revoked`;
      case 'FILE_UPLOADED':
        return `File "${metadata?.fileName || 'asset'}" uploaded`;
      case 'SUBSCRIPTION_UPDATED':
        return `Plan upgraded to ${metadata?.plan || 'new tier'}`;
      default:
        return action.replace(/_/g, ' ').toLowerCase();
    }
  };

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, activityRes] = await Promise.all([
          api.get<{ success: boolean; data: AnalyticsData }>(`/analytics/workspace/${activeWorkspace.id}`),
          api.get<{ success: boolean; data: ActivityLog[] }>(`/audit/${activeWorkspace.id}/activity`)
        ]);

        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data);
        }
        if (activityRes.success) {
          setActivities(activityRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-foreground/20">
          <Briefcase size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">No Workspace Selected</h3>
          <p className="text-foreground/60 max-w-[400px]">
            Please select a workspace from the sidebar or create a new one to view your dashboard analytics.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/workspaces'}>
          Go to Workspaces
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Members',
      value: analytics?.overview.members.toString() || '0',
      change: `${analytics?.overview.inviteConversion}% conversion`,
      icon: <Users size={20} className="text-primary" />,
    },
    {
      title: 'Active API Keys',
      value: analytics?.overview.apiKeys.toString() || '0',
      change: 'Programmatic access',
      icon: <Key size={20} className="text-secondary" />,
    },
    {
      title: 'Files Uploaded',
      value: analytics?.overview.files.toString() || '0',
      change: 'Cloud storage',
      icon: <FileText size={20} className="text-accent" />,
    },
    {
      title: 'Pending Invites',
      value: (analytics?.overview.pendingInvites || 0).toString(),
      change: 'Awaiting team',
      icon: <Activity size={20} className="text-success" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight m-0">Overview</h1>
        <p className="text-foreground/70 m-0">
          Showing data for <span className="font-semibold text-primary">{activeWorkspace?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <Card key={i} className="transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/70">{metric.title}</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover">
                  {metric.icon}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold leading-none">{metric.value}</div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-success font-medium">{metric.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workspace Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-[250px] w-full pt-8 pb-2">
              {/* Mock chart bars for now, as we don't have time-series analytics yet */}
              {[30, 45, 25, 60, 40, 80, 50, 90, 70, 85, 65, 100].map((h, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full flex-1 gap-2 group">
                  <div 
                    className="w-[60%] min-w-[8px] max-w-[32px] bg-gradient-to-t from-primary-hover to-primary rounded-t-sm opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className="text-xs text-foreground/60">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {activities.length === 0 ? (
                <p className="text-sm text-foreground/60">No recent activity found.</p>
              ) : (
                activities.slice(0, 6).map((log, i) => (
                  <div key={log.id} className="flex items-start gap-4 group">
                    <div className="relative mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0">
                      {i !== Math.min(activities.length - 1, 5) && <div className="absolute top-2 left-[3px] w-[2px] h-8 bg-border"></div>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-foreground capitalize">
                        {renderActivityDescription(log)}
                      </div>
                      <div className="text-xs text-foreground/60">{formatDate(log.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

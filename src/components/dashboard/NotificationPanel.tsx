'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={18} className="text-success" />;
      case 'WARNING': return <AlertTriangle size={18} className="text-warning" />;
      case 'ERROR': return <AlertCircle size={18} className="text-error" />;
      default: return <Info size={18} className="text-primary" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-[380px] max-w-[calc(100vw-32px)] bg-surface border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-fade-in overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-hover/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold m-0">Notifications</h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-[10px] text-white font-bold">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
            title="Mark all as read"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded-md transition-colors text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-foreground/40 text-sm">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-foreground/20">
              <Bell size={24} />
            </div>
            <p className="text-sm text-foreground/50 m-0">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-border/50 last:border-0 flex gap-3 transition-colors ${!n.read ? 'bg-primary-light/10 hover:bg-primary-light/20' : 'hover:bg-surface-hover/50'}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className={`text-sm font-semibold leading-tight ${!n.read ? 'text-foreground' : 'text-foreground/70'}`}>
                    {n.title}
                  </div>
                  <div className="text-xs text-foreground/60 leading-normal">
                    {n.message}
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border text-center bg-surface-hover/30">
        <button className="text-xs font-semibold text-foreground/50 hover:text-primary transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard, 
  Key, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Briefcase,
  File as FileIcon
} from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

import { WorkspaceProvider, useWorkspace } from '@/contexts/WorkspaceContext';
import { WorkspaceSwitcher } from '@/components/dashboard/WorkspaceSwitcher';

import { NotificationPanel } from '@/components/dashboard/NotificationPanel';

function DashboardLayoutInner({ 
  children, 
  user, 
  handleLogout, 
  navItems, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  pathname 
}: any) {
  const { activeWorkspace } = useWorkspace();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch for unread count
    api.get<any[]>('/notifications')
      .then(data => {
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      })
      .catch(console.error);
  }, []);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border-r border-border flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            LaunchFlow
          </Link>
          <button 
            className="block lg:hidden text-foreground/50 hover:text-foreground" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pb-2 shrink-0">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 p-6 pt-2 overflow-y-auto flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">Main Menu</div>
          {navItems.map((item: any) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-150 ${isActive ? 'bg-primary-light text-primary' : 'text-foreground/70 hover:bg-surface-hover hover:text-foreground'}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-semibold text-lg shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{user?.name}</div>
              <div className="text-xs text-foreground/60 truncate">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full p-2 rounded-md text-error text-sm font-medium transition-colors hover:bg-error/10 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-border glass shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="block lg:hidden text-foreground" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold m-0 leading-tight">
                {navItems.find((i: any) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.label || 'Dashboard'}
              </h2>
              {activeWorkspace && (
                <span className="text-xs text-foreground/50 lg:hidden">
                  {activeWorkspace.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) setUnreadCount(0);
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-hover"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-[8px] right-[10px] w-2 h-2 bg-error rounded-full"></span>
              )}
            </button>
            <NotificationPanel 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ user: User }>('/auth/get-session')
      .then(res => {
        if (res && res.user) {
          if (!res.user.emailVerified) {
            router.push('/auth/verify-email');
            return;
          }
          setUser(res.user);
          setIsLoading(false);
        } else {
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/sign-out', {});
      router.push('/auth/login');
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/workspaces', label: 'Workspaces', icon: <Briefcase size={20} /> },
    { href: '/dashboard/files', label: 'Files', icon: <FileIcon size={20} /> },
    { href: '/dashboard/team', label: 'Team Members', icon: <Users size={20} /> },
    { href: '/dashboard/apikeys', label: 'API Keys', icon: <Key size={20} /> },
    { href: '/dashboard/billing', label: 'Subscription', icon: <CreditCard size={20} /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <DashboardLayoutInner 
        user={user}
        handleLogout={handleLogout}
        navItems={navItems}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        pathname={pathname}
      >
        {children}
      </DashboardLayoutInner>
    </WorkspaceProvider>
  );
}

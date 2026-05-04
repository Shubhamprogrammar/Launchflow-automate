'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking your invitation...');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await authClient.getSession();
      if (data) {
        setSession(data.user);
        acceptInvite();
      } else {
        setStatus('unauthenticated');
        setMessage('You need to be logged in to accept this invitation.');
      }
    } catch (err) {
      setStatus('unauthenticated');
      setMessage('Please log in to accept the workspace invitation.');
    }
  };

  const acceptInvite = async () => {
    setStatus('loading');
    setMessage('Joining the workspace...');
    
    try {
      const data = await api.post<any>(`/invites/accept/${token}`, {});
      
      // Set the joined workspace as active in localStorage so the dashboard shows it immediately
      if (data && data.workspaceId) {
        localStorage.setItem('activeWorkspaceId', data.workspaceId);
      }
      
      setStatus('success');
      setMessage('You have successfully joined the workspace!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to accept the invitation. It may have expired or already been used.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass p-8 rounded-2xl flex flex-col items-center text-center gap-6 shadow-2xl animate-scale-in">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Processing Invite</h1>
              <p className="text-foreground/70">{message}</p>
            </div>
          </>
        )}

        {status === 'unauthenticated' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Almost there!</h1>
              <p className="text-foreground/70">{message}</p>
            </div>
            <div className="flex flex-col gap-3 w-full pt-2">
              <Button 
                onClick={() => router.push(`/auth/login?callbackURL=${encodeURIComponent(window.location.pathname)}`)}
                fullWidth
                size="lg"
              >
                Sign In to Accept
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/auth/register?callbackURL=${encodeURIComponent(window.location.pathname)}`)}
                fullWidth
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-success">Welcome!</h1>
              <p className="text-foreground/70">{message}</p>
            </div>
            <div className="w-full pt-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={18} />}
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-error">Invite Error</h1>
              <p className="text-foreground/70">{message}</p>
            </div>
            <div className="flex flex-col gap-3 w-full pt-4">
              <Button 
                onClick={() => checkSession()}
                fullWidth
                size="lg"
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                fullWidth
              >
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

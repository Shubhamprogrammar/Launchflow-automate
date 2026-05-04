'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackURL') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackURL,
      });

      if (error) {
        setError(error.message || 'Failed to sign in. Please check your credentials.');
        return;
      }

      router.push(callbackURL);
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight m-0">Welcome back</h1>
        <p className="text-foreground/70 m-0">Log in to your LaunchFlow account</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f0f0f0" d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.84c-3.03.66-3.67-1.46-3.67-1.46-.5-1.27-1.2-1.61-1.2-1.61-.98-.67.08-.66.08-.66 1.1.08 1.67 1.13 1.67 1.13.97 1.66 2.54 1.18 3.17.9.1-.7.38-1.18.7-1.45-2.42-.27-4.96-1.21-4.96-5.37 0-1.18.42-2.15 1.12-2.92-.11-.27-.48-1.37.1-2.88 0 0 .9-.29 2.94 1.1a10.17 10.17 0 015.5 0c2.03-1.39 2.94-1.1 2.94-1.1.58 1.51.21 2.61.1 2.88.7.77 1.12 1.74 1.12 2.92 0 4.17-2.54 5.1-4.97 5.37.39.33.74.99.74 1.99v2.96c0 .3.18.63.74.53A11 11 0 0012 1.27" />
            </svg>
            <span>GitHub</span>
          </Button>
        </div>

        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Or continue with email</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md text-sm border border-error/20">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          required
          fullWidth
        />

        <div className="relative flex flex-col gap-2">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
            fullWidth
          />
          <Link
            href="/auth/forgot-password"
            className="absolute top-0 right-0 text-sm text-primary font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn size={18} />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-foreground/80">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
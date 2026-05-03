'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight m-0">Invalid Reset Link</h1>
          <p className="text-foreground/70 m-0 max-w-sm">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link href="/auth/forgot-password">
          <Button>Request New Link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        newPassword: password,
        token,
      });

      setIsReset(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight m-0">Password Reset!</h1>
          <p className="text-foreground/70 m-0 max-w-sm">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </div>
        <Button fullWidth onClick={() => router.push('/auth/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight m-0">Reset your password</h1>
        <p className="text-foreground/70 m-0">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md text-sm border border-error/20">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          required
          fullWidth
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          required
          fullWidth
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-foreground/50">Loading reset session...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

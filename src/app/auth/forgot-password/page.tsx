'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Using direct API call to avoid client-side plugin type issues
      await api.post('/auth/forget-password', {
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight m-0">Check your email</h1>
          <p className="text-foreground/70 m-0 max-w-sm">
            We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. 
            Please check your inbox and spam folder.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="outline" fullWidth onClick={() => { setIsSent(false); setEmail(''); }}>
            Try a different email
          </Button>
          <Link href="/auth/login" className="text-sm text-primary font-medium hover:underline text-center">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-col gap-2">
        <Link href="/auth/login" className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors mb-2 w-fit">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
        <h1 className="text-3xl font-bold tracking-tight m-0">Forgot password?</h1>
        <p className="text-foreground/70 m-0">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <p className="text-foreground/50 text-xs m-0 mt-1">
          Note: If you signed up with Google or GitHub, you don't have a password. Please use social login instead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}

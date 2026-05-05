'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      let email = emailParam;

      if (!email) {
        const session = await api.get<{ user: { email: string } }>('/auth/get-session');
        email = session?.user?.email || null;
      }

      if (email) {
        await api.post('/auth/send-verification-email', {
          email: email,
          callbackURL: window.location.origin + '/dashboard'
        });
        setIsResent(true);
        setTimeout(() => setIsResent(false), 5000);
      } else {
        setError('Could not find your email. Please try logging in again or sign up with a different email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in max-w-md mx-auto py-12">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-light/30 text-primary flex items-center justify-center mb-2">
          <Mail size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight m-0">Check your email</h1>
        <p className="text-foreground/70 m-0">
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary-light/5 shadow-xl">
        <CardContent className="p-6 flex flex-col gap-4">
          {error && <div className="p-3 bg-error/10 text-error rounded-md text-sm border border-error/20 mb-2">{error}</div>}
          
          <p className="text-sm text-foreground/60 text-center m-0">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={handleResend}
            isLoading={isResending}
            disabled={isResent}
            leftIcon={isResent ? <CheckCircle size={16} /> : undefined}
          >
            {isResent ? 'Verification Email Sent!' : 'Resend Verification Email'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 items-center">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm font-medium text-foreground/50 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-foreground/50">Loading...</p>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
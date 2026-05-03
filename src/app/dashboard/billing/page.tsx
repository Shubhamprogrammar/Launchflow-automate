'use client';

import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SubscriptionData {
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  status: string;
  currentPeriodEnd?: string;
}

export default function BillingPage() {
  const { activeWorkspace } = useWorkspace();
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: SubscriptionData }>(`/billing/current-plan/${activeWorkspace.id}`);
      if (response.success) {
        setCurrentSubscription(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [activeWorkspace]);

  const handleUpgrade = async (plan: 'PRO' | 'TEAM' | 'ENTERPRISE') => {
    if (!activeWorkspace) return;
    setIsProcessing(plan);
    try {
      const response = await api.post<{ success: boolean; url: string }>('/billing/checkout-session', {
        workspaceId: activeWorkspace.id,
        plan
      });
      if (response.success && response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error('Failed to initiate checkout:', err);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdatePayment = async () => {
    if (!activeWorkspace) return;
    setIsProcessing('PORTAL');
    try {
      const response = await api.post<{ success: boolean; url: string }>('/billing/customer-portal', {
        workspaceId: activeWorkspace.id
      });
      if (response.success && response.url) {
        window.location.href = response.url;
      }
    } catch (err: any) {
      console.error('Failed to open customer portal:', err);
      alert(err.message || 'Failed to open billing portal. You might need to subscribe to a plan first.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async () => {
    if (!activeWorkspace || !confirm('Are you sure you want to cancel your subscription?')) return;
    setIsProcessing('CANCEL');
    try {
      const response = await api.post<{ success: boolean }>('/billing/cancel', {
        workspaceId: activeWorkspace.id
      });
      if (response.success) {
        alert('Subscription cancelled successfully.');
        fetchSubscription();
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    } finally {
      setIsProcessing(null);
    }
  };

  const plans = [
    {
      id: 'FREE',
      name: 'Starter',
      price: '$0',
      period: '/month',
      description: 'Perfect for side projects and small teams.',
      features: ['Up to 3 members', 'Basic Analytics', 'Community Support', '100 API Calls/day'],
      icon: <Zap size={24} className="text-primary" />,
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '$10',
      period: '/month',
      description: 'Everything you need to scale your SaaS.',
      features: ['Up to 20 members', 'Advanced Analytics', 'Priority Support', '10,000 API Calls/day', 'Custom Domain'],
      icon: <CreditCard size={24} className="text-primary" />,
      popular: true,
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: '$15',
      period: '/month',
      description: 'Collaborate with your entire organization.',
      features: ['Unlimited members', 'Team Dashboard', 'SLA Guarantee', '50,000 API Calls/day', 'Audit Logs'],
      icon: <Shield size={24} className="text-primary" />,
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$25',
      period: '/month',
      description: 'Advanced security and custom integrations.',
      features: ['Custom Reporting', '24/7 Phone Support', 'Unlimited API Calls', 'Dedicated Account Manager', 'Custom SSO'],
      icon: <Shield size={24} className="text-secondary" />,
    },
  ];

  if (!activeWorkspace) {
    return <div className="p-12 text-center text-foreground/60">Please select a workspace to manage subscription.</div>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight m-0">Billing & Subscription</h1>
        <p className="text-foreground/70 m-0">Manage your plan and payment methods.</p>
      </div>

      <Card className="bg-gradient-to-r from-surface to-surface-hover">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">Current Plan</div>
            <div className="text-4xl font-bold leading-none capitalize">
              {isLoading ? <Loader2 className="animate-spin inline" size={32} /> : currentSubscription?.plan || 'Starter'}
            </div>
            {!isLoading && currentSubscription?.currentPeriodEnd && (
              <div className="text-sm text-foreground/70">
                Billed monthly • Next invoice on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}
            {currentSubscription?.plan === 'FREE' && (
              <div className="text-sm text-foreground/60 italic">Free forever for personal use</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleUpdatePayment}
              isLoading={isProcessing === 'PORTAL'}
            >
              Update Payment Method
            </Button>
            {currentSubscription?.plan !== 'FREE' && (
              <Button 
                variant="ghost" 
                className="text-foreground/60 hover:text-error hover:opacity-100"
                onClick={handleCancel}
                isLoading={isProcessing === 'CANCEL'}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold m-0">Choose your plan</h2>
        <p className="text-foreground/70">Upgrade your workspace to unlock advanced features and scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {plans.map(plan => {
          const isCurrent = currentSubscription?.plan === plan.id || (plan.id === 'FREE' && !currentSubscription);
          const isHigher = !isCurrent; // Simple check for demo
          
          return (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col h-full ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary scale-105 z-10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  Most Popular
                </div>
              )}
              <CardHeader className="items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold leading-none">{plan.price}</span>
                  <span className="text-foreground/60">{plan.period}</span>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === 'FREE' ? (
                  <Button fullWidth variant="outline" disabled={isCurrent}>
                    {isCurrent ? 'Current Plan' : 'Free Plan'}
                  </Button>
                ) : (
                  <Button 
                    fullWidth 
                    variant={plan.popular ? 'primary' : 'outline'}
                    disabled={isCurrent || (isProcessing !== null && isProcessing !== plan.id)}
                    isLoading={isProcessing === plan.id}
                    onClick={() => handleUpgrade(plan.id as any)}
                  >
                    {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

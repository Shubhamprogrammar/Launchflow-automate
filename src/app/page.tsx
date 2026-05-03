'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  BarChart3, 
  Loader2, 
  Users, 
  Key, 
  Globe, 
  Cpu, 
  Layout, 
  Star,
  Check
} from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    api.get<any>('/auth/get-session')
      .then(res => {
        if (res && res.user) {
          router.replace('/dashboard');
        } else {
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        setIsCheckingAuth(false);
      });
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <div className="font-bold text-2xl tracking-tight bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              LaunchFlow
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
          </div>

          <div className="container mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0">
                <Star size={12} className="fill-current" />
                <span>v2.0 is now live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight m-0">
                Ship your next SaaS <br />
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">faster than ever</span>
              </h1>
              <p className="text-xl text-foreground/70 max-w-[600px] leading-relaxed mx-auto lg:mx-0">
                The modern platform where <span className="text-foreground font-semibold">organizations</span> can seamlessly manage their <span className="text-foreground font-semibold">workspaces</span>, teams, and global operations. Stop building infrastructure, start building your product.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
                <Link href="/auth/register">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/25" rightIcon={<ArrowRight size={20} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-surface/50 backdrop-blur-sm">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-2 text-sm text-foreground/50">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 overflow-hidden flex items-center justify-center">
                       <Users size={14} className="text-slate-500" />
                    </div>
                  ))}
                </div>
                <span>Trusted by <span className="font-bold text-foreground">500+</span> orgainsations</span>
              </div>
            </div>

            <div className="flex-1 w-full relative">
               {/* Decorative background for card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-3xl -z-10 rounded-[40px]"></div>
              
              <div className="relative group">
                <Card className="glass border-white/20 shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]">
                  <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
                  <CardHeader className="bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                        <CardDescription>Live workspace overview</CardDescription>
                      </div>
                      <div className="p-2 rounded-full bg-success/10 text-success">
                        <Zap size={20} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-foreground/50 mb-1">Active Users</div>
                        <div className="text-2xl font-bold">12.4k</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm text-foreground/50 mb-1">Monthly Revenue</div>
                        <div className="text-2xl font-bold">$48,250</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end h-32 gap-1">
                        {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary/40 group-hover:bg-primary transition-all duration-500 rounded-t-sm" 
                            style={{ height: `${h}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-surface/30">
          <div className="container mx-auto px-6 text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Powerful tools, built-in</h2>
            <p className="text-lg text-foreground/60 max-w-[700px] mx-auto">
              We've solved the repetitive parts of SaaS development so you can focus on your unique value.
            </p>
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Secure Authentication', icon: <Shield />, color: 'bg-blue-500/10 text-blue-500', desc: 'Social logins (Google, GitHub), magic links, and email verification powered by Better-Auth.' },
              { title: 'Team Workspaces', icon: <Users />, color: 'bg-purple-500/10 text-purple-500', desc: 'Built-in support for multiple workspaces, team member invitations, and role-based access control.' },
              { title: 'Billing & Subscriptions', icon: <Zap />, color: 'bg-yellow-500/10 text-yellow-500', desc: 'Full Stripe integration for managing plans, checkouts, and customer billing portals.' },
              { title: 'S3 File Management', icon: <Layout />, color: 'bg-pink-500/10 text-pink-500', desc: 'Upload images and documents directly to AWS S3 with secure pre-signed URLs and metadata tracking.' },
              { title: 'API Key Management', icon: <Key />, color: 'bg-cyan-500/10 text-cyan-500', desc: 'Let your users integrate with your platform using secure, revokable API keys.' },
              { title: 'Real-time Events', icon: <Cpu />, color: 'bg-green-500/10 text-green-500', desc: 'Centralized event bus for background tasks, notifications, and real-time updates.' },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-6 text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-lg text-foreground/60">Choose the perfect plan for your business scale.</p>
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
            {/* Starter Plan */}
            <Card className="flex flex-col border-border bg-surface hover:shadow-xl transition-shadow">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-lg text-primary font-bold">Starter</CardTitle>
                <div className="text-4xl font-bold mt-4">$0 <span className="text-sm font-normal text-foreground/50">/ month</span></div>
                <CardDescription className="mt-4 text-base">Perfect for side projects.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 flex flex-col">
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Up to 3 members</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Basic Analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Community Support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> 100 API Calls/day</li>
                </ul>
                <Link href="/auth/register" className="mt-auto">
                  <Button variant="outline" fullWidth>Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-primary relative shadow-2xl scale-105 z-10 bg-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-lg">Most Popular</div>
              <CardHeader className="text-center p-8">
                <CardTitle className="text-lg text-primary font-bold">Pro</CardTitle>
                <div className="text-4xl font-bold mt-4">$10 <span className="text-sm font-normal text-foreground/50">/ month</span></div>
                <CardDescription className="mt-4 text-base">For growing startups.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 flex flex-col">
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Up to 20 members</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Advanced Analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Priority Support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> 10,000 API Calls/day</li>
                </ul>
                <Link href="/auth/register" className="mt-auto">
                  <Button fullWidth className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className="flex flex-col border-border bg-surface hover:shadow-xl transition-shadow">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-lg text-primary font-bold">Team</CardTitle>
                <div className="text-4xl font-bold mt-4">$15 <span className="text-sm font-normal text-foreground/50">/ month</span></div>
                <CardDescription className="mt-4 text-base">For scaling teams.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 flex flex-col">
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Unlimited members</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Team Dashboard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> SLA Guarantee</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> 50,000 API Calls/day</li>
                </ul>
                <Link href="/auth/register" className="mt-auto">
                  <Button variant="outline" fullWidth>Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col border-border bg-surface hover:shadow-xl transition-shadow">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-lg text-primary font-bold">Enterprise</CardTitle>
                <div className="text-4xl font-bold mt-4">$25 <span className="text-sm font-normal text-foreground/50">/ month</span></div>
                <CardDescription className="mt-4 text-base">For global scale.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 flex flex-col">
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Custom Reporting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> 24/7 Phone Support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Unlimited API Calls</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Dedicated Manager</li>
                </ul>
                <Link href="/auth/register" className="mt-auto">
                  <Button variant="outline" fullWidth>Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-surface/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "Is LaunchFlow free to use?", a: "Yes! We offer a generous free tier for developers and small side projects. No credit card required." },
                { q: "Can I self-host LaunchFlow?", a: "Currently, LaunchFlow is a managed SaaS platform, but we're exploring self-hosted enterprise options for Q3 2026." },
                { q: "How secure is my data?", a: "We use enterprise-grade encryption for all data at rest and in transit. Your files are stored in your own secure S3 buckets or our isolated infrastructure." },
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-xl bg-surface border border-border">
                  <h4 className="text-lg font-bold mb-2">{faq.q}</h4>
                  <p className="text-foreground/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface pt-20 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="flex flex-col gap-6 col-span-1 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <Zap size={14} className="text-white fill-current" />
                </div>
                <div className="font-bold text-xl tracking-tight">LaunchFlow</div>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Empowering developers to build and scale SaaS applications with confidence. The complete platform for modern cloud operations.
              </p>
              <div className="flex items-center gap-5">
                {/* ✅ Brand-accurate icons from react-icons/fa6 */}
                <FaXTwitter size={18} className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer" />
                <FaGithub size={20} className="text-foreground/40 hover:text-[#24292e] dark:hover:text-white transition-colors cursor-pointer" />
                <FaLinkedinIn size={20} className="text-foreground/40 hover:text-[#0a66c2] transition-colors cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-bold uppercase text-xs tracking-widest text-foreground/50">Product</h4>
              <nav className="flex flex-col gap-4">
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Features</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Pricing</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Changelog</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Roadmap</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-bold uppercase text-xs tracking-widest text-foreground/50">Resources</h4>
              <nav className="flex flex-col gap-4">
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Documentation</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">API Reference</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Community</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Status</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-bold uppercase text-xs tracking-widest text-foreground/50">Company</h4>
              <nav className="flex flex-col gap-4">
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">About Us</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Careers</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">Terms of Service</Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-foreground/50 italic">
              Designed & Built with ❤️ by <span className="text-primary font-bold hover:underline cursor-pointer">Shubham</span>
            </p>
            <div className="flex items-center gap-6">
              <p className="text-sm text-foreground/40">© 2026 LaunchFlow. All rights reserved.</p>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
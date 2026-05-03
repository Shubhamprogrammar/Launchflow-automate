import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col p-8 bg-background">
        <div className="font-bold text-2xl tracking-tight bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-auto">
          <Link href="/">LaunchFlow</Link>
        </div>
        <div className="m-auto w-full max-w-[400px]">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-hover to-primary relative overflow-hidden items-center justify-center p-16 text-white">
        <div className="relative z-10 max-w-[500px]">
          <p className="text-2xl leading-relaxed font-medium mb-8">
            "LaunchFlow has completely transformed how we manage our internal operations. The built-in billing and member management saved us months of development time."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20"></div>
            <div>
              <div className="font-semibold text-base">Sarah Jenkins</div>
              <div className="text-sm opacity-80">CTO at TechNova</div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_60%)] blur-[40px] z-0"></div>
      </div>
    </div>
  );
}
